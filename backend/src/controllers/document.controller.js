/**
 * Arquivo: backend/src/controllers/document.controller.js
 * Descrição: Controller para endpoints de documentos
 * Feature: feat-043 - Criar DocumentController e rotas
 * Criado em: 2025-10-30
 *
 * Responsabilidades:
 * - Manipular requisições HTTP de documentos
 * - Chamar DocumentService para lógica de negócio
 * - Validar dados de entrada
 * - Retornar respostas padronizadas
 */

const logger = require('../utils/logger');
const DocumentService = require('../services/document.service');
const { AppError } = require('../middlewares/error.middleware');

/**
 * DocumentController
 * Controller que encapsula handlers para endpoints de documento
 */
class DocumentController {
  /**
   * POST /api/v1/documents
   * Fazer upload de um documento
   *
   * Requisitos:
   * - Usuário autenticado
   * - Arquivo validado pelo middleware validateUploadSingle
   * - Body contém document_type_id
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.user - Usuário autenticado (injetado pelo auth.middleware)
   * @param {Object} req.file - Arquivo validado (injetado pelo validateUploadSingle)
   * @param {number} req.body.document_type_id - ID do tipo de documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento criado (201) ou erro
   *
   * @example
   * // Request
   * POST /api/v1/documents
   * Authorization: Bearer <token>
   * Content-Type: multipart/form-data
   *
   * document: <arquivo.pdf>
   * document_type_id: 2
   *
   * // Response (201 Created)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 1,
   *     "user_id": 5,
   *     "document_type_id": 2,
   *     "file_name": "1698700200000-rg.pdf",
   *     "file_size": 245632,
   *     "mime_type": "application/pdf",
   *     "status": "pending",
   *     "created_at": "2025-10-30T10:00:00Z"
   *   },
   *   "message": "Documento enviado com sucesso"
   * }
   */
  async upload(req, res, next) {
    try {
      // Validar documento_type_id
      const { document_type_id } = req.body;

      if (!document_type_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'document_type_id é obrigatório',
          },
        });
      }

      // Validar que document_type_id é um inteiro
      if (isNaN(document_type_id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'document_type_id deve ser um número inteiro',
          },
        });
      }

      // Validar que usuário é estudante e tem student_id
      if (!req.user.student_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas estudantes podem enviar documentos',
          },
        });
      }

      // Chamar serviço para fazer upload
      const document = await DocumentService.upload({
        studentId: req.user.student_id,
        documentTypeId: parseInt(document_type_id),
        filePath: req.file.path,
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      logger.info('[DocumentController] Upload realizado com sucesso', {
        documentId: document.id,
        userId: req.user.id,
        studentId: req.user.student_id,
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Documento enviado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents
   * Listar documentos com filtros (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   *
   * Query params:
   * - status (optional): pending, approved, rejected
   * - userId (optional): Filtrar por ID do usuário
   * - page (optional): Página (padrão: 1)
   * - limit (optional): Itens por página (padrão: 20)
   * - orderBy (optional): Campo para ordenar (padrão: created_at)
   * - order (optional): ASC ou DESC (padrão: DESC)
   *
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com lista de documentos
   *
   * @example
   * // Request
   * GET /api/v1/documents?status=pending&page=1&limit=20
   * Authorization: Bearer <token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "documents": [...],
   *     "total": 45,
   *     "page": 1,
   *     "limit": 20,
   *     "pages": 3
   *   }
   * }
   */
  async list(req, res, next) {
    try {
      const {
        status,
        studentId,
        page = 1,
        limit = 20,
        orderBy = 'created_at',
        order = 'DESC',
      } = req.query;

      // Validar valores
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Status deve ser um dos: ${validStatuses.join(', ')}`,
          },
        });
      }

      const validOrders = ['ASC', 'DESC'];
      if (order && !validOrders.includes(order.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order deve ser ASC ou DESC',
          },
        });
      }

      // Chamar serviço
      const result = await DocumentService.list({
        status,
        studentId: studentId ? parseInt(studentId) : undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        orderBy,
        order: order.toUpperCase(),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/:id
   * Buscar documento por ID
   *
   * Requisitos:
   * - Usuário autenticado
   * - ID válido na URL
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento encontrado ou erro 404
   *
   * @example
   * // Request
   * GET /api/v1/documents/10
   * Authorization: Bearer <token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 10,
   *     "user_id": 5,
   *     "document_type_id": 2,
   *     ...
   *   }
   * }
   */
  async findById(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      const document = await DocumentService.findById(parseInt(id));

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/documents/:id/approve
   * Aprovar um documento (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   * - ID válido na URL
   * - Body contém observations (opcional)
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {string} req.body.observations - Observações opcionais
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento aprovado (200) ou erro
   *
   * @example
   * // Request
   * PUT /api/v1/documents/10/approve
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * {
   *   "observations": "Documento aprovado"
   * }
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 10,
   *     "status": "approved",
   *     "reviewed_by": 1,
   *     "reviewed_at": "2025-10-30T10:00:00Z",
   *     ...
   *   },
   *   "message": "Documento aprovado com sucesso"
   * }
   */
  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const { observations } = req.body;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      const document = await DocumentService.approve(
        parseInt(id),
        req.user.id,
        observations
      );

      logger.info('[DocumentController] Documento aprovado', {
        documentId: id,
        approvedBy: req.user.id,
      });

      res.json({
        success: true,
        data: document,
        message: 'Documento aprovado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/documents/:id/reject
   * Rejeitar um documento (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   * - ID válido na URL
   * - Body contém observations (obrigatório)
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {string} req.body.observations - Motivo da rejeição
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento rejeitado (200) ou erro
   *
   * @example
   * // Request
   * PUT /api/v1/documents/10/reject
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * {
   *   "observations": "Documento ilegível"
   * }
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 10,
   *     "status": "rejected",
   *     "reviewed_by": 1,
   *     "reviewed_at": "2025-10-30T10:00:00Z",
   *     "observations": "Documento ilegível",
   *     ...
   *   },
   *   "message": "Documento rejeitado com sucesso"
   * }
   */
  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { observations } = req.body;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      // Validar observações
      if (!observations || observations.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Observações são obrigatórias ao rejeitar um documento',
          },
        });
      }

      const document = await DocumentService.reject(
        parseInt(id),
        req.user.id,
        observations
      );

      logger.info('[DocumentController] Documento rejeitado', {
        documentId: id,
        rejectedBy: req.user.id,
      });

      res.json({
        success: true,
        data: document,
        message: 'Documento rejeitado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/documents/:id
   * Deletar um documento (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   * - ID válido na URL
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta 204 No Content ou erro
   *
   * @example
   * // Request
   * DELETE /api/v1/documents/10
   * Authorization: Bearer <token>
   *
   * // Response (204 No Content)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      await DocumentService.delete(parseInt(id));

      logger.info('[DocumentController] Documento deletado', {
        documentId: id,
        deletedBy: req.user.id,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/:id/validate
   * Validar status de documentos obrigatórios de um usuário
   *
   * Requisitos:
   * - Usuário autenticado
   * - ID válido na URL
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do usuário
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com status de validação
   *
   * @example
   * // Request
   * GET /api/v1/documents/5/validate
   * Authorization: Bearer <token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "allApproved": false,
   *     "pending": [...],
   *     "approved": [...],
   *     "rejected": [...]
   *   }
   * }
   */
  async validate(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      const validation = await DocumentService.validateRequiredDocuments(
        parseInt(id)
      );

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/stats
   * Obter estatísticas de documentos (total, pendentes, aprovados, rejeitados)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   *
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com estatísticas de documentos
   *
   * @example
   * // Request
   * GET /api/v1/documents/stats
   * Authorization: Bearer <admin_token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "total": 45,
   *     "pending": 12,
   *     "approved": 28,
   *     "rejected": 5
   *   }
   * }
   */
  async getStats(req, res, next) {
    try {
      const stats = await DocumentService.getStats();

      logger.info('[DocumentController] Estatísticas de documentos obtidas', {
        requestedBy: req.user.id,
        role: req.user.role,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:userId/documents ou GET /api/v1/documents/user/:userId
   * Listar documentos de um usuário específico
   *
   * Requisitos:
   * - Usuário autenticado
   * - ID do usuário válido na URL
   * - Permissão: próprio usuário ou admin
   *
   * Query params:
   * - page (optional): Página (padrão: 1)
   * - limit (optional): Itens por página (padrão: 20)
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.user - Usuário autenticado (injetado pelo auth.middleware)
   * @param {number} req.params.userId - ID do usuário cujos documentos serão listados
   * @param {number} req.query.page - Página (padrão: 1)
   * @param {number} req.query.limit - Itens por página (padrão: 20)
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com lista de documentos do usuário
   *
   * @example
   * // Request - Admin visualizando documentos de um aluno
   * GET /api/v1/users/5/documents?page=1&limit=20
   * Authorization: Bearer <admin_token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "documents": [
   *       {
   *         "id": 1,
   *         "user_id": 5,
   *         "document_type_id": 2,
   *         "file_name": "1698700200000-rg.pdf",
   *         "file_size": 245632,
   *         "mime_type": "application/pdf",
   *         "status": "pending",
   *         "created_at": "2025-10-30T10:00:00Z",
   *         "documentType": {
   *           "id": 2,
   *           "name": "RG",
   *           "user_type": "student",
   *           "is_required": true
   *         }
   *       }
   *     ],
   *     "total": 5,
   *     "page": 1,
   *     "limit": 20,
   *     "pages": 1
   *   }
   * }
   */
  async getStudentDocuments(req, res, next) {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Validar ID do estudante
      if (isNaN(studentId) || parseInt(studentId) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID do estudante deve ser um número inteiro positivo',
          },
        });
      }

      const studentIdInt = parseInt(studentId);

      // Validar permissão: apenas admin ou o próprio estudante pode ver os documentos
      if (req.user.role !== 'admin' && req.user.student_id !== studentIdInt) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para visualizar os documentos deste estudante',
          },
        });
      }

      // Validar paginação
      const pageInt = Math.max(1, parseInt(page) || 1);
      const limitInt = Math.max(1, Math.min(100, parseInt(limit) || 20)); // Limitar a 100 itens por página

      // Chamar serviço para listar documentos do estudante
      const result = await DocumentService.getDocumentsByStudent(studentIdInt, {
        page: pageInt,
        limit: limitInt,
      });

      logger.info('[DocumentController] Documentos do estudante listados', {
        studentId: studentIdInt,
        requestedBy: req.user.id,
        role: req.user.role,
        total: result.total,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/my-documents
   * Listar documentos do usuário autenticado (próprios documentos)
   *
   * Requisitos:
   * - Usuário autenticado (student ou teacher)
   *
   * Query params:
   * - page (optional): Página (padrão: 1)
   * - limit (optional): Itens por página (padrão: 20)
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.user - Usuário autenticado (injetado pelo auth.middleware)
   * @param {number} req.query.page - Página (padrão: 1)
   * @param {number} req.query.limit - Itens por página (padrão: 20)
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com lista dos próprios documentos do usuário
   *
   * @example
   * // Request - Aluno visualizando seus próprios documentos
   * GET /api/v1/documents/my-documents?page=1&limit=20
   * Authorization: Bearer <student_token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "documents": [
   *       {
   *         "id": 1,
   *         "user_id": 5,
   *         "document_type_id": 2,
   *         "file_name": "1698700200000-rg.pdf",
   *         "file_size": 245632,
   *         "mime_type": "application/pdf",
   *         "status": "pending",
   *         "created_at": "2025-10-30T10:00:00Z",
   *         "documentType": {
   *           "id": 2,
   *           "name": "RG",
   *           "user_type": "student",
   *           "is_required": true
   *         }
   *       }
   *     ],
   *     "total": 5,
   *     "page": 1,
   *     "limit": 20,
   *     "pages": 1
   *   }
   * }
   */
  async getMyDocuments(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Validar que usuário é estudante e tem student_id
      if (!req.user.student_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas estudantes podem visualizar documentos',
          },
        });
      }

      // Validar paginação
      const pageInt = Math.max(1, parseInt(page) || 1);
      const limitInt = Math.max(1, Math.min(100, parseInt(limit) || 20)); // Limitar a 100 itens por página

      // Chamar serviço para listar próprios documentos
      const result = await DocumentService.getDocumentsByStudent(req.user.student_id, {
        page: pageInt,
        limit: limitInt,
      });

      logger.info('[DocumentController] Documentos do estudante autenticado listados', {
        userId: req.user.id,
        studentId: req.user.student_id,
        role: req.user.role,
        total: result.total,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/:id/download
   * Download de um documento
   *
   * Requisitos:
   * - Usuário autenticado
   * - ID válido na URL
   * - Permissão: próprio usuário ou admin
   * - Documento deve existir
   * - Arquivo deve existir no servidor
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.user - Usuário autenticado (injetado pelo auth.middleware)
   * @param {Object} req.params.id - ID do documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Stream do arquivo ou erro
   *
   * @example
   * // Request
   * GET /api/v1/documents/10/download
   * Authorization: Bearer <token>
   *
   * // Response (200 OK com arquivo)
   * Content-Type: application/pdf (ou image/jpeg, etc.)
   * Content-Disposition: attachment; filename="documento.pdf"
   * [arquivo binário]
   *
   * @example
   * // Request (sem permissão)
   * GET /api/v1/documents/10/download (usuário id=5, mas documento do usuário id=3)
   * Authorization: Bearer <token>
   *
   * // Response (403 Forbidden)
   * {
   *   "success": false,
   *   "error": {
   *     "code": "FORBIDDEN",
   *     "message": "Você não tem permissão para acessar este documento"
   *   }
   * }
   */
  async download(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      // Chamar serviço para fazer download com validação de permissão
      // Para estudantes, passa student_id; para admin, passa null
      const studentId = req.user.student_id || null;
      const file = await DocumentService.download(parseInt(id), studentId, req.user.role);

      logger.info('[DocumentController] Download de documento realizado', {
        documentId: id,
        downloadedBy: req.user.id,
        studentId: studentId,
        fileName: file.fileName,
      });

      // Enviar arquivo como download
      res.download(file.filePath, file.fileName);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
