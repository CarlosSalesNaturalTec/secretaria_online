/**
 * Arquivo: backend/src/services/document.service.js
 * Descrição: Serviço de negócio para gerenciar documentos
 * Feature: feat-042 - Criar DocumentService com validação
 * Criado em: 2025-10-30
 *
 * Responsabilidades:
 * - Gerenciar upload e armazenamento de documentos
 * - Validar se documentos são obrigatórios para tipo de usuário
 * - Aprovar/rejeitar documentos com observações
 * - Deletar documentos do banco e do sistema de arquivos
 * - Listar documentos com filtros por status, usuário, tipo
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { Document, DocumentType, User, Student } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { UPLOAD_CONSTANTS } = require('../config/upload');
const emailService = require('./email.service');

/**
 * DocumentService
 * Camada de serviço que encapsula lógica de negócio de documentos
 */
class DocumentService {
  /**
   * Fazer upload de um documento
   *
   * Responsabilidades:
   * - Validar tipo de usuário e documento obrigatório
   * - Salvar informações do arquivo no banco de dados
   * - Registrar log de upload
   *
   * @param {Object} uploadData - Dados do upload
   * @param {number} uploadData.studentId - ID do estudante que está enviando
   * @param {number} uploadData.documentTypeId - ID do tipo de documento
   * @param {string} uploadData.filePath - Caminho do arquivo no servidor
   * @param {string} uploadData.fileName - Nome do arquivo
   * @param {number} uploadData.fileSize - Tamanho do arquivo em bytes
   * @param {string} uploadData.mimeType - Tipo MIME do arquivo
   *
   * @returns {Promise<Object>} Documento criado no banco de dados
   * @throws {AppError} Validações falham (estudante, tipo de documento, duplicação)
   *
   * @example
   * const document = await DocumentService.upload({
   *   studentId: 5,
   *   documentTypeId: 2,
   *   filePath: 'uploads/documents/5/1698700200000-rg.pdf',
   *   fileName: '1698700200000-rg.pdf',
   *   fileSize: 245632,
   *   mimeType: 'application/pdf'
   * });
   */
  static async upload(uploadData) {
    const {
      studentId,
      documentTypeId,
      filePath,
      fileName,
      fileSize,
      mimeType,
    } = uploadData;

    try {
      // 1. Validar se estudante existe
      const student = await Student.findByPk(studentId);
      if (!student) {
        throw new AppError('Estudante não encontrado', 404, 'STUDENT_NOT_FOUND');
      }

      // 2. Validar se tipo de documento existe
      const documentType = await DocumentType.findByPk(documentTypeId);
      if (!documentType) {
        throw new AppError(
          'Tipo de documento não encontrado',
          404,
          'DOCUMENT_TYPE_NOT_FOUND'
        );
      }

      // 3. Validar se documentType é aplicável para estudantes
      if (!documentType.isApplicableFor('student')) {
        throw new AppError(
          'Este tipo de documento não é aplicável para alunos',
          422,
          'DOCUMENT_TYPE_NOT_APPLICABLE'
        );
      }

      // 4. Verificar se já existe documento deste tipo (para evitar duplicação)
      const existingDocument = await Document.findByStudentAndType(
        studentId,
        documentTypeId
      );

      // Se existe documento anterior, deletar (permitir reenvio)
      if (existingDocument && existingDocument.status === 'rejected') {
        await this.delete(existingDocument.id);
      } else if (existingDocument && existingDocument.status !== 'rejected') {
        throw new AppError(
          `Você já enviou este documento. Status: ${existingDocument.getStatusLabel()}`,
          409,
          'DOCUMENT_ALREADY_EXISTS'
        );
      }

      // 5. Criar registro de documento no banco
      const document = await Document.create({
        student_id: studentId,
        document_type_id: documentTypeId,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        status: 'pending',
      });

      // 6. Registrar log
      logger.info('[DocumentService] Documento enviado com sucesso', {
        documentId: document.id,
        studentId,
        documentTypeId,
        fileName,
        fileSize,
        mimeType,
      });

      return document;
    } catch (error) {
      // Se erro de app, relançar
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao fazer upload de documento', {
        studentId,
        documentTypeId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao salvar documento no banco de dados',
        500,
        'UPLOAD_STORAGE_ERROR'
      );
    }
  }

  /**
   * Aprovar um documento
   *
   * Responsabilidades:
   * - Validar se documento existe
   * - Validar se quem está aprovando é admin
   * - Atualizar status para 'approved'
   * - Registrar informações de quem aprovou e quando
   * - Enviar email de notificação ao usuário
   *
   * @param {number} documentId - ID do documento a aprovar
   * @param {number} reviewerId - ID do usuário admin que está aprovando
   * @param {string} observations - Observações opcionais
   *
   * @returns {Promise<Object>} Documento aprovado
   * @throws {AppError} Documento não encontrado ou erro no banco
   *
   * @example
   * const approved = await DocumentService.approve(10, 1, 'Documento OK');
   */
  static async approve(documentId, reviewerId, observations = null) {
    try {
      // 1. Buscar documento
      const document = await Document.findByPk(documentId, {
        include: ['student', 'documentType'],
      });

      if (!document) {
        throw new AppError(
          'Documento não encontrado',
          404,
          'DOCUMENT_NOT_FOUND'
        );
      }

      // 2. Validar se não está já aprovado
      if (document.status === 'approved') {
        throw new AppError(
          'Este documento já foi aprovado',
          409,
          'DOCUMENT_ALREADY_APPROVED'
        );
      }

      // 3. Aprovar usando método do model
      await document.approve(reviewerId, observations);

      logger.info('[DocumentService] Documento aprovado', {
        documentId,
        studentId: document.student_id,
        documentTypeId: document.document_type_id,
        reviewerId,
        observations,
      });

      // 4. Enviar email de notificação (operação não-bloqueante)
      try {
        if (document.student && document.student.email) {
          await emailService.sendDocumentApprovedEmail(
            document.student.email,
            document.documentType.name,
            {
              name: document.student.nome,
              observations: observations,
            }
          );

          logger.info('[DocumentService] Email de aprovação enviado', {
            documentId,
            studentId: document.student_id,
            email: document.student.email,
          });
        } else {
          logger.warn('[DocumentService] Estudante sem email cadastrado', {
            documentId,
            studentId: document.student_id,
          });
        }
      } catch (emailError) {
        // Email é operação secundária, não deve falhar a aprovação
        logger.error('[DocumentService] Erro ao enviar email de aprovação', {
          documentId,
          studentId: document.student_id,
          error: emailError.message,
        });
      }

      return document;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao aprovar documento', {
        documentId,
        reviewerId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao aprovar documento',
        500,
        'APPROVE_ERROR'
      );
    }
  }

  /**
   * Rejeitar um documento
   *
   * Responsabilidades:
   * - Validar se documento existe
   * - Validar se quem está rejeitando é admin
   * - Atualizar status para 'rejected' com observações obrigatórias
   * - Registrar informações de quem rejeitou e quando
   * - Enviar email de notificação ao usuário
   *
   * @param {number} documentId - ID do documento a rejeitar
   * @param {number} reviewerId - ID do usuário admin que está rejeitando
   * @param {string} observations - Motivo da rejeição (obrigatório)
   *
   * @returns {Promise<Object>} Documento rejeitado
   * @throws {AppError} Documento não encontrado, observações vazias ou erro no banco
   *
   * @example
   * const rejected = await DocumentService.reject(10, 1, 'Documento ilegível');
   */
  static async reject(documentId, reviewerId, observations) {
    try {
      // 1. Validar observações
      if (!observations || observations.trim().length === 0) {
        throw new AppError(
          'Observações são obrigatórias ao rejeitar um documento',
          400,
          'OBSERVATIONS_REQUIRED'
        );
      }

      // 2. Buscar documento
      const document = await Document.findByPk(documentId, {
        include: ['student', 'documentType'],
      });

      if (!document) {
        throw new AppError(
          'Documento não encontrado',
          404,
          'DOCUMENT_NOT_FOUND'
        );
      }

      // 3. Validar se não está já rejeitado
      if (document.status === 'rejected') {
        throw new AppError(
          'Este documento já foi rejeitado',
          409,
          'DOCUMENT_ALREADY_REJECTED'
        );
      }

      // 4. Rejeitar usando método do model
      await document.reject(reviewerId, observations);

      logger.info('[DocumentService] Documento rejeitado', {
        documentId,
        studentId: document.student_id,
        documentTypeId: document.document_type_id,
        reviewerId,
        observations,
      });

      // 5. Enviar email de notificação (operação não-bloqueante)
      try {
        if (document.student && document.student.email) {
          await emailService.sendDocumentRejectedEmail(
            document.student.email,
            document.documentType.name,
            observations,
            {
              name: document.student.nome,
            }
          );

          logger.info('[DocumentService] Email de rejeição enviado', {
            documentId,
            studentId: document.student_id,
            email: document.student.email,
          });
        } else {
          logger.warn('[DocumentService] Estudante sem email cadastrado', {
            documentId,
            studentId: document.student_id,
          });
        }
      } catch (emailError) {
        // Email é operação secundária, não deve falhar a rejeição
        logger.error('[DocumentService] Erro ao enviar email de rejeição', {
          documentId,
          studentId: document.student_id,
          error: emailError.message,
        });
      }

      return document;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao rejeitar documento', {
        documentId,
        reviewerId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao rejeitar documento',
        500,
        'REJECT_ERROR'
      );
    }
  }

  /**
   * Deletar um documento (soft delete + arquivo do disco)
   *
   * Responsabilidades:
   * - Validar se documento existe
   * - Remover arquivo do sistema de arquivos
   * - Fazer soft delete no banco de dados (paranoid)
   * - Registrar log de exclusão
   *
   * @param {number} documentId - ID do documento a deletar
   *
   * @returns {Promise<boolean>} true se deletado com sucesso
   * @throws {AppError} Documento não encontrado ou erro ao deletar arquivo
   *
   * @example
   * const deleted = await DocumentService.delete(10);
   */
  static async delete(documentId) {
    try {
      // 1. Buscar documento
      const document = await Document.findByPk(documentId);

      if (!document) {
        throw new AppError(
          'Documento não encontrado',
          404,
          'DOCUMENT_NOT_FOUND'
        );
      }

      // 2. Tentar remover arquivo do disco
      if (document.file_path) {
        try {
          const fullPath = path.join(
            __dirname,
            '../../',
            document.file_path
          );
          await fs.unlink(fullPath);
          logger.info('[DocumentService] Arquivo deletado do disco', {
            documentId,
            filePath: document.file_path,
          });
        } catch (fileError) {
          logger.warn('[DocumentService] Erro ao deletar arquivo do disco', {
            documentId,
            filePath: document.file_path,
            error: fileError.message,
          });
          // Não falhar a exclusão do documento se arquivo não existir
        }
      }

      // 3. Fazer soft delete no banco (usando paranoid do Sequelize)
      await document.destroy();

      logger.info('[DocumentService] Documento deletado', {
        documentId,
        fileName: document.file_name,
      });

      return true;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao deletar documento', {
        documentId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao deletar documento',
        500,
        'DELETE_ERROR'
      );
    }
  }

  /**
   * Listar documentos com filtros
   *
   * Responsabilidades:
   * - Listar documentos com paginação
   * - Filtrar por status (pending, approved, rejected)
   * - Filtrar por usuário
   * - Ordenar por data de criação (desc por padrão)
   *
   * @param {Object} filters - Filtros aplicados
   * @param {string} filters.status - Status do documento (pending, approved, rejected)
   * @param {number} filters.studentId - ID do estudante
   * @param {number} filters.page - Página (padrão: 1)
   * @param {number} filters.limit - Itens por página (padrão: 20)
   * @param {string} filters.orderBy - Campo para ordenar (padrão: created_at)
   * @param {string} filters.order - ASC ou DESC (padrão: DESC)
   *
   * @returns {Promise<Object>} { documents, total, page, limit }
   *
   * @example
   * const result = await DocumentService.list({
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  static async list(filters = {}) {
    try {
      const {
        status,
        studentId,
        page = 1,
        limit = 20,
        orderBy = 'created_at',
        order = 'DESC',
      } = filters;

      // Validar paginação
      const offset = (Math.max(1, page) - 1) * limit;

      // Construir where clause
      const where = {};
      if (status) {
        where.status = status;
      }
      if (studentId) {
        where.student_id = studentId;
      }

      // Buscar documentos
      const { count, rows } = await Document.findAndCountAll({
        where,
        include: [
          {
            association: 'student',
            attributes: ['id', 'nome', 'email', 'cpf'],
          },
          {
            association: 'documentType',
            attributes: ['id', 'name', 'user_type', 'is_required'],
          },
          {
            association: 'reviewer',
            attributes: ['id', 'name', 'email'],
            required: false,
          },
        ],
        order: [[orderBy, order]],
        limit,
        offset,
      });

      return {
        documents: rows,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('[DocumentService] Erro ao listar documentos', {
        filters,
        error: error.message,
      });

      throw new AppError(
        'Erro ao listar documentos',
        500,
        'LIST_ERROR'
      );
    }
  }

  /**
   * Buscar documento por ID
   *
   * @param {number} documentId - ID do documento
   *
   * @returns {Promise<Object|null>} Documento encontrado ou null
   * @throws {AppError} Erro ao buscar
   */
  static async findById(documentId) {
    try {
      const document = await Document.findByPk(documentId, {
        include: [
          {
            association: 'student',
            attributes: ['id', 'nome', 'email', 'cpf'],
          },
          {
            association: 'documentType',
            attributes: ['id', 'name', 'user_type', 'is_required'],
          },
          {
            association: 'reviewer',
            attributes: ['id', 'name', 'email'],
            required: false,
          },
        ],
      });

      if (!document) {
        throw new AppError(
          'Documento não encontrado',
          404,
          'DOCUMENT_NOT_FOUND'
        );
      }

      return document;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao buscar documento', {
        documentId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao buscar documento',
        500,
        'FIND_ERROR'
      );
    }
  }

  /**
   * Validar se documentos obrigatórios foram aprovados
   *
   * @param {number} studentId - ID do estudante
   *
   * @returns {Promise<Object>} { allApproved, pending, approved, rejected }
   */
  static async validateRequiredDocuments(studentId) {
    try {
      const student = await Student.findByPk(studentId);
      if (!student) {
        throw new AppError('Estudante não encontrado', 404, 'STUDENT_NOT_FOUND');
      }

      // Buscar tipos de documentos obrigatórios para estudantes
      const requiredTypes = await DocumentType.findRequiredForUserType('student');

      // Para cada tipo obrigatório, verificar status
      const documentStatus = await Promise.all(
        requiredTypes.map(async (docType) => {
          const doc = await Document.findByStudentAndType(studentId, docType.id);
          return {
            documentTypeId: docType.id,
            documentTypeName: docType.name,
            status: doc ? doc.status : 'not_sent',
            document: doc,
          };
        })
      );

      const pending = documentStatus.filter(
        (d) => d.status === 'pending' || d.status === 'not_sent'
      );
      const approved = documentStatus.filter((d) => d.status === 'approved');
      const rejected = documentStatus.filter((d) => d.status === 'rejected');

      return {
        allApproved: pending.length === 0,
        pending,
        approved,
        rejected,
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error(
        '[DocumentService] Erro ao validar documentos obrigatórios',
        {
          studentId,
          error: error.message,
        }
      );

      throw new AppError(
        'Erro ao validar documentos',
        500,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Listar documentos de um estudante específico
   *
   * Responsabilidades:
   * - Buscar todos os documentos de um estudante
   * - Incluir informações do tipo de documento
   * - Aplicar paginação
   * - Ordenar por data de criação (descendente)
   *
   * @param {number} studentId - ID do estudante cujos documentos serão listados
   * @param {Object} options - Opções de listagem
   * @param {number} options.page - Página (padrão: 1)
   * @param {number} options.limit - Itens por página (padrão: 20)
   *
   * @returns {Promise<Object>} { documents, total, page, limit, pages }
   * @throws {AppError} Estudante não encontrado ou erro ao buscar
   *
   * @example
   * const result = await DocumentService.getDocumentsByStudent(5, { page: 1, limit: 20 });
   * // Retorna:
   * // {
   * //   documents: [...],
   * //   total: 5,
   * //   page: 1,
   * //   limit: 20,
   * //   pages: 1
   * // }
   */
  static async getDocumentsByStudent(studentId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;

      // 1. Validar se estudante existe
      const student = await Student.findByPk(studentId);
      if (!student) {
        throw new AppError(
          'Estudante não encontrado',
          404,
          'STUDENT_NOT_FOUND'
        );
      }

      // 2. Calcular offset para paginação
      const offset = (Math.max(1, page) - 1) * limit;

      // 3. Buscar documentos do estudante
      const { count, rows } = await Document.findAndCountAll({
        where: { student_id: studentId },
        include: [
          {
            association: 'documentType',
            attributes: ['id', 'name', 'user_type', 'is_required'],
          },
          {
            association: 'reviewer',
            attributes: ['id', 'name', 'email'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      logger.info('[DocumentService] Documentos do estudante listados', {
        studentId,
        total: count,
        page,
        limit,
      });

      return {
        documents: rows,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao listar documentos do estudante', {
        studentId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao listar documentos do estudante',
        500,
        'STUDENT_DOCUMENTS_LIST_ERROR'
      );
    }
  }

  /**
   * Obter estatísticas de documentos
   *
   * Responsabilidades:
   * - Contar total de documentos no sistema
   * - Contar documentos por status (pending, approved, rejected)
   *
   * @returns {Promise<Object>} Estatísticas { total, pending, approved, rejected }
   * @throws {AppError} Erro ao buscar estatísticas
   *
   * @example
   * const stats = await DocumentService.getStats();
   * // { total: 45, pending: 12, approved: 28, rejected: 5 }
   */
  static async getStats() {
    try {
      const { Op } = require('sequelize');

      // Contar total de documentos
      const total = await Document.count();

      // Contar por status
      const pending = await Document.count({
        where: { status: 'pending' },
      });

      const approved = await Document.count({
        where: { status: 'approved' },
      });

      const rejected = await Document.count({
        where: { status: 'rejected' },
      });

      logger.info('[DocumentService] Estatísticas de documentos obtidas', {
        total,
        pending,
        approved,
        rejected,
      });

      return {
        total,
        pending,
        approved,
        rejected,
      };
    } catch (error) {
      logger.error('[DocumentService] Erro ao buscar estatísticas', {
        error: error.message,
      });

      throw new AppError(
        'Erro ao buscar estatísticas de documentos',
        500,
        'STATS_ERROR'
      );
    }
  }

  /**
   * Download de um documento
   *
   * Responsabilidades:
   * - Validar se documento existe
   * - Validar permissão: estudante do documento ou admin
   * - Validar se arquivo existe no servidor
   * - Retornar caminho do arquivo e nome para download
   *
   * @param {number} documentId - ID do documento a fazer download
   * @param {number} studentId - ID do estudante que está fazendo download (ou null se admin)
   * @param {string} userRole - Role do usuário (admin, teacher, student)
   *
   * @returns {Promise<Object>} { filePath, fileName }
   * @throws {AppError} Documento não encontrado, sem permissão ou arquivo não existe
   *
   * @example
   * const file = await DocumentService.download(10, 5, 'student');
   * // Retorna: { filePath: 'uploads/documents/5/1698700200000-rg.pdf', fileName: '1698700200000-rg.pdf' }
   */
  static async download(documentId, studentId, userRole) {
    try {
      // 1. Buscar documento
      const document = await Document.findByPk(documentId);

      if (!document) {
        throw new AppError(
          'Documento não encontrado',
          404,
          'DOCUMENT_NOT_FOUND'
        );
      }

      // 2. Validar permissão (próprio estudante ou admin)
      if (document.student_id !== studentId && userRole !== 'admin') {
        throw new AppError(
          'Você não tem permissão para acessar este documento',
          403,
          'FORBIDDEN'
        );
      }

      // 3. Validar se arquivo existe no servidor
      const fullPath = path.join(__dirname, '../../', document.file_path);

      try {
        await fs.access(fullPath);
      } catch (fileError) {
        logger.error('[DocumentService] Arquivo não encontrado no servidor', {
          documentId,
          filePath: document.file_path,
          error: fileError.message,
        });

        throw new AppError(
          'Arquivo não encontrado no servidor',
          404,
          'FILE_NOT_FOUND'
        );
      }

      logger.info('[DocumentService] Download autorizado', {
        documentId,
        studentId,
        documentOwnerId: document.student_id,
        fileName: document.file_name,
      });

      // 4. Retornar informações do arquivo para download
      return {
        filePath: fullPath,
        fileName: document.file_name,
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      logger.error('[DocumentService] Erro ao preparar download', {
        documentId,
        studentId,
        error: error.message,
      });

      throw new AppError(
        'Erro ao preparar download do documento',
        500,
        'DOWNLOAD_ERROR'
      );
    }
  }
}

module.exports = DocumentService;
