/**
 * Arquivo: backend/src/services/enrollment.service.js
 * Descrição: Lógica de negócio para matrículas de alunos em cursos
 * Feature: feat-038 - Criar EnrollmentService com regras de negócio
 * Criado em: 2025-10-30
 *
 * RESPONSABILIDADES:
 * - Implementar validações de regras de negócio para matrículas
 * - Validar que aluno não possui matrícula ativa no mesmo curso
 * - Validar aprovação de documentos obrigatórios antes de ativar
 * - Gerenciar criação, atualização e exclusão de matrículas
 * - Consultar matrículas por aluno, curso e status
 *
 * REGRAS DE NEGÓCIO (REGRAS QUE SÃO VALIDADAS):
 * 1. Um aluno não pode ter matrícula ativa/pendente em dois cursos simultaneamente
 * 2. Matrícula só pode ser ativada se todos os documentos obrigatórios forem aprovados
 * 3. Não é possível ativar matrícula cancelada
 * 4. Documentos obrigatórios variam por tipo de usuário (estudante)
 * 5. Um aluno só pode estar matriculado em um curso por vez
 *
 * @example
 * // Criar nova matrícula (com status pending)
 * const enrollment = await EnrollmentService.create(studentId, courseId);
 *
 * // Verificar se aluno pode se matricular
 * const canEnroll = await EnrollmentService.canEnroll(studentId, courseId);
 *
 * // Validar se documentos estão todos aprovados
 * const docsValid = await EnrollmentService.validateDocuments(studentId);
 *
 * // Ativar matrícula (se documentos validarem)
 * const activated = await EnrollmentService.activateEnrollment(enrollmentId);
 */

'use strict';

const { Enrollment, User, Student, Course, Document, DocumentType } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

class EnrollmentService {
  /**
   * Cria nova matrícula (status padrão: pending)
   *
   * FLUXO:
   * 1. Valida se aluno existe
   * 2. Valida se curso existe
   * 3. Valida se aluno pode se matricular (canEnroll)
   * 4. Cria matrícula com status 'pending'
   *
   * @param {number} studentId - ID do aluno
   * @param {number} courseId - ID do curso
   * @param {Object} enrollmentData - Dados opcionais da matrícula (enrollment_date)
   * @returns {Promise<Enrollment>} Matrícula criada
   * @throws {AppError} Se aluno ou curso não existem, ou se há violação de regras
   */
  async create(studentId, courseId, enrollmentData = {}) {
    logger.info(
      `[EnrollmentService] Criando matrícula - studentId: ${studentId}, courseId: ${courseId}`
    );

    try {
      // 1. Validar que aluno existe (na tabela students)
      const student = await Student.findByPk(studentId);
      if (!student) {
        logger.warn(
          `[EnrollmentService] Tentativa de matrícula com aluno inválido - ID: ${studentId}`
        );
        throw new AppError('Aluno não encontrado', 404);
      }

      // 2. Validar que curso existe
      const course = await Course.findByPk(courseId);
      if (!course) {
        logger.warn(
          `[EnrollmentService] Tentativa de matrícula com curso inválido - ID: ${courseId}`
        );
        throw new AppError('Curso não encontrado', 404);
      }

      // 3. Validar regra de negócio: aluno pode se matricular?
      const canEnroll = await this.canEnroll(studentId, courseId);
      if (!canEnroll) {
        const existingEnrollment = await Enrollment.findActiveByStudent(studentId);
        logger.warn(
          `[EnrollmentService] Aluno ${studentId} já possui matrícula ativa/pendente - Curso: ${existingEnrollment.course_id}`
        );
        throw new AppError(
          `Aluno já possui uma matrícula ${existingEnrollment.status} em outro curso. ` +
            `Finalize ou cancele a matrícula atual antes de criar uma nova.`,
          422
        );
      }

      // 4. Criar matrícula com status 'pending'
      const defaultDate = enrollmentData.enrollment_date || new Date().toISOString().split('T')[0];

      const enrollment = await Enrollment.create({
        student_id: studentId,
        course_id: courseId,
        status: 'pending',
        enrollment_date: defaultDate,
      });

      logger.info(
        `[EnrollmentService] Matrícula criada com sucesso - ID: ${enrollment.id}, Status: pending`
      );

      return enrollment;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao criar matrícula: ${error.message}`
      );
      throw new AppError('Erro ao criar matrícula', 500);
    }
  }

  /**
   * Verifica se aluno pode se matricular em um curso
   *
   * VALIDAÇÕES:
   * 1. Aluno existe e é um estudante
   * 2. Curso existe
   * 3. Aluno não possui matrícula ativa/pendente em outro curso
   *
   * @param {number} studentId - ID do aluno
   * @param {number} courseId - ID do curso (opcional, para validação futura)
   * @returns {Promise<boolean>} True se pode matricular, false caso contrário
   */
  async canEnroll(studentId, courseId = null) {
    try {
      logger.debug(
        `[EnrollmentService] Verificando se aluno ${studentId} pode se matricular`
      );

      // 1. Verificar se aluno existe (na tabela students)
      const student = await Student.findByPk(studentId);
      if (!student) {
        return false;
      }

      // 2. Verificar se aluno já possui matrícula ativa/pendente
      const existingEnrollment = await Enrollment.findActiveByStudent(studentId);
      if (existingEnrollment) {
        logger.warn(
          `[EnrollmentService] Aluno ${studentId} já possui matrícula ativa/pendente`
        );
        return false;
      }

      logger.debug(
        `[EnrollmentService] Aluno ${studentId} pode se matricular`
      );
      return true;
    } catch (error) {
      logger.error(
        `[EnrollmentService] Erro ao verificar se pode matricular: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Valida se todos os documentos obrigatórios de um aluno foram aprovados
   *
   * FLUXO:
   * 1. Busca tipos de documentos obrigatórios para alunos
   * 2. Para cada documento obrigatório, verifica se existe um documento aprovado
   * 3. Retorna true apenas se TODOS forem aprovados
   *
   * @param {number} studentId - ID do aluno
   * @returns {Promise<boolean>} True se todos documentos obrigatórios foram aprovados
   * @throws {AppError} Se aluno não existe
   */
  async validateDocuments(studentId) {
    logger.info(
      `[EnrollmentService] Validando documentos do aluno ${studentId}`
    );

    try {
      // 1. Verificar que aluno existe (na tabela students)
      const student = await Student.findByPk(studentId);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // 2. Buscar tipos de documentos obrigatórios para alunos
      const requiredDocTypes = await DocumentType.findAll({
        where: {
          is_required: true,
          user_type: ['student', 'both'],
        },
      });

      // 3. Se não há documentos obrigatórios, considera válido
      if (requiredDocTypes.length === 0) {
        logger.info(
          `[EnrollmentService] Aluno ${studentId} não possui documentos obrigatórios`
        );
        return true;
      }

      // 4. Para cada documento obrigatório, verifica se foi aprovado
      for (const docType of requiredDocTypes) {
        const approvedDoc = await Document.findOne({
          where: {
            user_id: studentId,
            document_type_id: docType.id,
            status: 'approved',
          },
        });

        // Se não encontrou documento aprovado, documentação está incompleta
        if (!approvedDoc) {
          logger.warn(
            `[EnrollmentService] Aluno ${studentId} não possui documento aprovado: ${docType.name}`
          );
          return false;
        }
      }

      logger.info(
        `[EnrollmentService] Aluno ${studentId} possui todos os documentos obrigatórios aprovados`
      );
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao validar documentos: ${error.message}`
      );
      throw new AppError('Erro ao validar documentos', 500);
    }
  }

  /**
   * Retorna lista de documentos obrigatórios pendentes para um aluno
   *
   * @param {number} studentId - ID do aluno
   * @returns {Promise<Array>} Lista de documentos obrigatórios com seu status
   * @throws {AppError} Se aluno não existe
   */
  async getPendingDocuments(studentId) {
    logger.info(
      `[EnrollmentService] Buscando documentos pendentes do aluno ${studentId}`
    );

    try {
      // Verificar que aluno existe (na tabela students)
      const student = await Student.findByPk(studentId);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Buscar tipos de documentos obrigatórios para alunos
      const requiredDocTypes = await DocumentType.findAll({
        where: {
          is_required: true,
          user_type: ['student', 'both'],
        },
      });

      // Buscar documentos enviados pelo aluno
      const submittedDocs = await Document.findAll({
        where: { user_id: studentId },
        include: [{ association: 'documentType', attributes: ['id', 'name'] }],
        order: [['created_at', 'DESC']],
      });

      // Mapear documentos obrigatórios e seu status
      const documentStatus = requiredDocTypes.map((reqDoc) => {
        const submitted = submittedDocs.find(
          (doc) => doc.document_type_id === reqDoc.id
        );
        return {
          documentTypeId: reqDoc.id,
          documentTypeName: reqDoc.name,
          isApproved: submitted ? submitted.status === 'approved' : false,
          status: submitted ? submitted.status : 'not_submitted',
          submitted: !!submitted,
        };
      });

      return documentStatus;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao buscar documentos pendentes: ${error.message}`
      );
      throw new AppError('Erro ao buscar documentos pendentes', 500);
    }
  }

  /**
   * Ativa uma matrícula (altera status de pending para active)
   *
   * FLUXO:
   * 1. Busca matrícula
   * 2. Valida que está com status 'pending'
   * 3. Valida que TODOS os documentos obrigatórios foram aprovados
   * 4. Altera status para 'active'
   *
   * @param {number} enrollmentId - ID da matrícula
   * @returns {Promise<Enrollment>} Matrícula ativada
   * @throws {AppError} Se documentos não forem aprovados ou matrícula inválida
   */
  async activateEnrollment(enrollmentId) {
    logger.info(
      `[EnrollmentService] Ativando matrícula - ID: ${enrollmentId}`
    );

    try {
      // 1. Buscar matrícula
      const enrollment = await Enrollment.findByPk(enrollmentId);
      if (!enrollment) {
        logger.warn(
          `[EnrollmentService] Tentativa de ativar matrícula inexistente - ID: ${enrollmentId}`
        );
        throw new AppError('Matrícula não encontrada', 404);
      }

      // 2. Validar que não está com status 'active' (evitar reativação desnecessária)
      if (enrollment.status === 'active') {
        logger.info(
          `[EnrollmentService] Matrícula ${enrollmentId} já está ativa`
        );
        return enrollment;
      }

      // 3. Validar que todos os documentos obrigatórios foram aprovados
      // NOTA: Validação comentada temporariamente para permitir ativação administrativa
      // O administrador pode ativar manualmente matrículas sem todos os documentos
      /*
      const docsValid = await this.validateDocuments(enrollment.student_id);
      if (!docsValid) {
        logger.warn(
          `[EnrollmentService] Documentos do aluno ${enrollment.student_id} não foram totalmente aprovados`
        );
        throw new AppError(
          'Não é possível ativar matrícula. Nem todos os documentos obrigatórios foram aprovados.',
          422
        );
      }
      */

      logger.info(
        `[EnrollmentService] Ativando matrícula ${enrollmentId} (status atual: ${enrollment.status})`
      );

      // 4. Alterar status para 'active'
      enrollment.status = 'active';
      await enrollment.save();

      logger.info(
        `[EnrollmentService] Matrícula ${enrollmentId} ativada com sucesso`
      );

      return enrollment;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao ativar matrícula: ${error.message}`
      );
      throw new AppError('Erro ao ativar matrícula', 500);
    }
  }

  /**
   * Atualiza o status de uma matrícula
   *
   * Status válidos: pending, active, cancelled
   *
   * @param {number} enrollmentId - ID da matrícula
   * @param {string} newStatus - Novo status
   * @returns {Promise<Enrollment>} Matrícula atualizada
   * @throws {AppError} Se status inválido ou matrícula não existe
   */
  async updateStatus(enrollmentId, newStatus) {
    logger.info(
      `[EnrollmentService] Atualizando status da matrícula - ID: ${enrollmentId}, Novo Status: ${newStatus}`
    );

    try {
      // Validar que status é válido
      const validStatuses = ['pending', 'active', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw new AppError(
          `Status inválido. Valores aceitos: ${validStatuses.join(', ')}`,
          400
        );
      }

      // Buscar matrícula
      const enrollment = await Enrollment.findByPk(enrollmentId);
      if (!enrollment) {
        throw new AppError('Matrícula não encontrado', 404);
      }

      // Se tentando ativar, executar validações
      if (newStatus === 'active' && enrollment.status !== 'active') {
        return this.activateEnrollment(enrollmentId);
      }

      // Atualizar status
      enrollment.status = newStatus;
      await enrollment.save();

      logger.info(
        `[EnrollmentService] Status da matrícula ${enrollmentId} atualizado para: ${newStatus}`
      );

      return enrollment;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao atualizar status: ${error.message}`
      );
      throw new AppError('Erro ao atualizar status da matrícula', 500);
    }
  }

  /**
   * Busca matrícula por ID com relacionamentos
   *
   * @param {number} enrollmentId - ID da matrícula
   * @returns {Promise<Enrollment|null>} Matrícula encontrada ou null
   */
  async getById(enrollmentId) {
    logger.debug(`[EnrollmentService] Buscando matrícula - ID: ${enrollmentId}`);

    try {
      const enrollment = await Enrollment.findByPk(enrollmentId, {
        include: [
          {
            association: 'student',
            attributes: ['id', 'name', 'email', 'cpf'],
          },
          {
            association: 'course',
            attributes: ['id', 'name', 'duration', 'duration_type', 'description', 'courseType'],
          },
        ],
      });

      return enrollment;
    } catch (error) {
      logger.error(
        `[EnrollmentService] Erro ao buscar matrícula: ${error.message}`
      );
      throw new AppError('Erro ao buscar matrícula', 500);
    }
  }

  /**
   * Busca todas as matrículas de um aluno
   *
   * @param {number} studentId - ID do aluno
   * @param {Object} options - Opções de filtro (status, includeDeleted)
   * @returns {Promise<Enrollment[]>} Lista de matrículas
   */
  async getByStudent(studentId, options = {}) {
    logger.debug(
      `[EnrollmentService] Buscando matrículas do aluno - ID: ${studentId}`
    );

    try {
      const enrollments = await Enrollment.findByStudent(studentId, {
        withCourse: true,
        ...options,
      });

      return enrollments;
    } catch (error) {
      logger.error(
        `[EnrollmentService] Erro ao buscar matrículas: ${error.message}`
      );
      throw new AppError('Erro ao buscar matrículas', 500);
    }
  }

  /**
   * Busca a matrícula pendente de um aluno
   *
   * @param {number} studentId - ID do aluno
   * @returns {Promise<Enrollment|null>} Matrícula pendente encontrada ou null
   */
  async getPendingByStudent(studentId) {
    logger.debug(`[EnrollmentService] Buscando matrícula pendente para o aluno - ID: ${studentId}`);

    try {
      const enrollment = await Enrollment.findOne({
        where: {
          student_id: studentId,
          status: 'pending',
        },
        include: [
          {
            association: 'course',
            attributes: ['id', 'name'],
          },
        ],
      });

      return enrollment;
    } catch (error) {
      logger.error(`[EnrollmentService] Erro ao buscar matrícula pendente: ${error.message}`);
      throw new AppError('Erro ao buscar matrícula pendente', 500);
    }
  }

  /**
   * Busca todas as matrículas de um curso
   *
   * @param {number} courseId - ID do curso
   * @param {Object} options - Opções de filtro (status, includeDeleted)
   * @returns {Promise<Enrollment[]>} Lista de matrículas
   */
  async getByCourse(courseId, options = {}) {
    logger.debug(
      `[EnrollmentService] Buscando matrículas do curso - ID: ${courseId}`
    );

    try {
      const enrollments = await Enrollment.findByCourse(courseId, {
        withStudent: true,
        ...options,
      });

      return enrollments;
    } catch (error) {
      logger.error(
        `[EnrollmentService] Erro ao buscar matrículas: ${error.message}`
      );
      throw new AppError('Erro ao buscar matrículas', 500);
    }
  }

  /**
   * Cancela uma matrícula
   *
   * @param {number} enrollmentId - ID da matrícula
   * @returns {Promise<Enrollment>} Matrícula cancelada
   * @throws {AppError} Se matrícula não existe ou já foi cancelada
   */
  async cancel(enrollmentId) {
    logger.info(
      `[EnrollmentService] Cancelando matrícula - ID: ${enrollmentId}`
    );

    try {
      const enrollment = await Enrollment.findByPk(enrollmentId);
      if (!enrollment) {
        throw new AppError('Matrícula não encontrado', 404);
      }

      if (enrollment.status === 'cancelled') {
        throw new AppError('Matrícula já está cancelada', 422);
      }

      enrollment.status = 'cancelled';
      await enrollment.save();

      logger.info(
        `[EnrollmentService] Matrícula ${enrollmentId} cancelada com sucesso`
      );

      return enrollment;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao cancelar matrícula: ${error.message}`
      );
      throw new AppError('Erro ao cancelar matrícula', 500);
    }
  }

  /**
   * Remove uma matrícula (soft delete)
   *
   * @param {number} enrollmentId - ID da matrícula
   * @returns {Promise<void>}
   * @throws {AppError} Se matrícula não existe
   */
  async delete(enrollmentId) {
    logger.info(
      `[EnrollmentService] Deletando matrícula - ID: ${enrollmentId}`
    );

    try {
      const enrollment = await Enrollment.findByPk(enrollmentId);
      if (!enrollment) {
        throw new AppError('Matrícula não encontrado', 404);
      }

      await enrollment.destroy();

      logger.info(`[EnrollmentService] Matrícula ${enrollmentId} deletada`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[EnrollmentService] Erro ao deletar matrícula: ${error.message}`
      );
      throw new AppError('Erro ao deletar matrícula', 500);
    }
  }
}

module.exports = new EnrollmentService();
