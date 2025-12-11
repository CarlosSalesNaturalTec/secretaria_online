/**
 * Arquivo: backend/src/controllers/grade.controller.js
 * Descrição: Controlador para lançamento e gerenciamento de notas
 * Feature: feat-053 - Criar GradeController e rotas
 * Criado em: 2025-11-01
 *
 * Responsabilidades:
 * - Lançar notas individuais (POST /grades)
 * - Atualizar notas existentes (PUT /grades/:id)
 * - Listar notas de uma avaliação (GET /evaluations/:id/grades)
 * - Validar permissões (apenas professor que leciona a disciplina)
 * - Tratamento robusto de erros
 */

const GradeService = require('../services/grade.service');
const EvaluationService = require('../services/evaluation.service');
const { Evaluation, ClassTeacher } = require('../models');
const logger = require('../utils/logger');

class GradeController {
  constructor() {
    // Fazer bind dos métodos para manter o contexto 'this'
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.getByEvaluation = this.getByEvaluation.bind(this);
    this.getStats = this.getStats.bind(this);
    this.getPending = this.getPending.bind(this);
    this.batchCreate = this.batchCreate.bind(this);
    this.getMyGrades = this.getMyGrades.bind(this);
  }

  /**
   * Valida se o professor leciona a disciplina da avaliação
   *
   * @param {number} teacherId - ID do professor
   * @param {number} evaluationId - ID da avaliação
   * @returns {Promise<boolean>} True se professor leciona a disciplina
   * @throws {Error} Se validação falhar
   *
   * @private
   */
  async _validateTeacherOwnership(teacherId, evaluationId) {
    try {
      const evaluation = await Evaluation.findByPk(evaluationId);

      if (!evaluation) {
        return false;
      }

      // Verificar se professor leciona essa disciplina na turma
      const classTeacher = await ClassTeacher.findOne({
        where: {
          class_id: evaluation.class_id,
          teacher_id: teacherId,
          discipline_id: evaluation.discipline_id
        }
      });

      return classTeacher !== null;
    } catch (error) {
      logger.error('[GradeController._validateTeacherOwnership] Erro ao validar ownership:', error);
      throw error;
    }
  }

  /**
   * Lança uma nota para um aluno em uma avaliação
   *
   * POST /api/grades
   *
   * Body:
   * {
   *   evaluation_id: number,
   *   student_id: number,
   *   grade?: number (0-10),
   *   concept?: string (satisfactory|unsatisfactory)
   * }
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.body - Dados da nota
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async create(req, res, next) {
    try {
      const { evaluation_id, student_id, grade, concept } = req.body;
      const { id: teacherId, role } = req.user;

      // Validar dados obrigatórios
      if (!evaluation_id || !student_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'evaluation_id e student_id são obrigatórios'
          }
        });
      }

      // Validar que há grade ou concept
      if (grade === undefined && concept === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'É necessário informar grade ou concept'
          }
        });
      }

      // Apenas professores e admins podem lançar notas
      if (!['teacher', 'admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas professores podem lançar notas'
          }
        });
      }

      // Se for professor, validar se leciona a disciplina
      if (role === 'teacher') {
        const isTeacherValid = await this._validateTeacherOwnership(teacherId, evaluation_id);

        if (!isTeacherValid) {
          logger.warn('[GradeController.create] Professor tentou lançar nota em avaliação não lecionada', {
            teacherId,
            evaluationId: evaluation_id,
            studentId: student_id
          });

          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não leciona a disciplina desta avaliação'
            }
          });
        }
      }

      // Lançar nota via service
      const gradeData = await GradeService.createGrade({
        evaluation_id,
        student_id,
        grade: grade !== undefined ? parseFloat(grade) : undefined,
        concept
      });

      logger.info('[GradeController.create] Nota lançada com sucesso', {
        gradeId: gradeData.id,
        evaluationId: evaluation_id,
        studentId: student_id,
        teacherId,
        grade: gradeData.grade,
        concept: gradeData.concept
      });

      res.status(201).json({
        success: true,
        data: gradeData,
        message: 'Nota lançada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma nota existente
   *
   * PUT /api/grades/:id
   *
   * Body:
   * {
   *   grade?: number (0-10),
   *   concept?: string (satisfactory|unsatisfactory)
   * }
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.params - Parâmetros da rota
   * @param {number} req.params.id - ID da nota
   * @param {object} req.body - Dados a atualizar
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { grade, concept } = req.body;
      const { id: teacherId, role } = req.user;

      // Validar ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'ID da nota inválido'
          }
        });
      }

      // Validar que há grade ou concept
      if (grade === undefined && concept === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'É necessário informar grade ou concept'
          }
        });
      }

      // Apenas professores e admins podem editar notas
      if (!['teacher', 'admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas professores podem editar notas'
          }
        });
      }

      // Se for professor, validar ownership (leciona a disciplina)
      if (role === 'teacher') {
        // Buscar nota para obter evaluation_id
        const gradeRecord = await require('../models').Grade.findByPk(id, {
          attributes: ['evaluation_id']
        });

        if (!gradeRecord) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Nota não encontrada'
            }
          });
        }

        // Validar se professor leciona
        const isTeacherValid = await this._validateTeacherOwnership(teacherId, gradeRecord.evaluation_id);

        if (!isTeacherValid) {
          logger.warn('[GradeController.update] Professor tentou editar nota em avaliação não lecionada', {
            teacherId,
            gradeId: id
          });

          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não leciona a disciplina desta avaliação'
            }
          });
        }
      }

      // Atualizar nota via service
      const updatedGrade = await GradeService.updateGrade(id, {
        grade: grade !== undefined ? parseFloat(grade) : undefined,
        concept
      });

      logger.info('[GradeController.update] Nota atualizada com sucesso', {
        gradeId: id,
        evaluationId: updatedGrade.evaluation_id,
        teacherId,
        grade: updatedGrade.grade,
        concept: updatedGrade.concept
      });

      res.status(200).json({
        success: true,
        data: updatedGrade,
        message: 'Nota atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas as notas de uma avaliação
   *
   * GET /api/evaluations/:id/grades
   *
   * Query params:
   * - ?includePending=true (opcional) - Incluir alunos sem nota lançada
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.params - Parâmetros da rota
   * @param {number} req.params.id - ID da avaliação
   * @param {object} req.query - Query parameters
   * @param {string} req.query.includePending - Incluir notas pendentes
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async getByEvaluation(req, res, next) {
    try {
      const { id: evaluationId } = req.params;
      const { includePending } = req.query;
      const { id: userId, role } = req.user;

      // Validar ID
      if (!evaluationId || isNaN(parseInt(evaluationId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'ID da avaliação inválido'
          }
        });
      }

      // Validar permissão: apenas professor que leciona ou admin
      if (role === 'teacher') {
        const isTeacherValid = await this._validateTeacherOwnership(userId, evaluationId);

        if (!isTeacherValid) {
          logger.warn('[GradeController.getByEvaluation] Professor tentou listar notas de avaliação não lecionada', {
            teacherId: userId,
            evaluationId
          });

          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não leciona a disciplina desta avaliação'
            }
          });
        }
      } else if (!['admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para listar notas'
          }
        });
      }

      // Listar notas
      const grades = await GradeService.listByEvaluation(evaluationId, {
        includePending: includePending === 'true'
      });

      logger.info('[GradeController.getByEvaluation] Notas listadas com sucesso', {
        evaluationId,
        count: grades.length,
        userId
      });

      res.status(200).json({
        success: true,
        data: grades,
        count: grades.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém estatísticas de lançamento de notas para uma avaliação
   *
   * GET /api/evaluations/:id/grades/stats
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.params - Parâmetros da rota
   * @param {number} req.params.id - ID da avaliação
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async getStats(req, res, next) {
    try {
      const { id: evaluationId } = req.params;
      const { id: userId, role } = req.user;

      // Validar ID
      if (!evaluationId || isNaN(parseInt(evaluationId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'ID da avaliação inválido'
          }
        });
      }

      // Validar permissão: apenas professor que leciona ou admin
      if (role === 'teacher') {
        const isTeacherValid = await this._validateTeacherOwnership(userId, evaluationId);

        if (!isTeacherValid) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não leciona a disciplina desta avaliação'
            }
          });
        }
      } else if (!['admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para acessar essas estatísticas'
          }
        });
      }

      // Obter estatísticas
      const stats = await GradeService.countGradesByEvaluation(evaluationId);

      logger.info('[GradeController.getStats] Estatísticas de notas obtidas', {
        evaluationId,
        stats
      });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista notas pendentes de uma avaliação
   *
   * GET /api/evaluations/:id/grades/pending
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.params - Parâmetros da rota
   * @param {number} req.params.id - ID da avaliação
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async getPending(req, res, next) {
    try {
      const { id: evaluationId } = req.params;
      const { id: userId, role } = req.user;

      // Validar ID
      if (!evaluationId || isNaN(parseInt(evaluationId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'ID da avaliação inválido'
          }
        });
      }

      // Validar permissão: apenas professor que leciona ou admin
      if (role === 'teacher') {
        const isTeacherValid = await this._validateTeacherOwnership(userId, evaluationId);

        if (!isTeacherValid) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não leciona a disciplina desta avaliação'
            }
          });
        }
      } else if (!['admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para acessar essas informações'
          }
        });
      }

      // Listar notas pendentes
      const pendingGrades = await GradeService.listPendingGrades(evaluationId);

      logger.info('[GradeController.getPending] Notas pendentes listadas', {
        evaluationId,
        count: pendingGrades.length,
        userId
      });

      res.status(200).json({
        success: true,
        data: pendingGrades,
        count: pendingGrades.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lança múltiplas notas em lote para uma avaliação
   *
   * POST /api/evaluations/:id/grades/batch
   *
   * Body:
   * {
   *   grades: [
   *     {
   *       student_id: number,
   *       grade?: number (0-10),
   *       concept?: string (satisfactory|unsatisfactory)
   *     },
   *     ...
   *   ]
   * }
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.params - Parâmetros da rota
   * @param {number} req.params.id - ID da avaliação
   * @param {object} req.body - Dados do lote
   * @param {Array} req.body.grades - Array de notas a lançar
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async batchCreate(req, res, next) {
    try {
      const { id: evaluationId } = req.params;
      const { grades } = req.body;
      const { id: teacherId, role } = req.user;

      // Validar ID da avaliação
      if (!evaluationId || isNaN(parseInt(evaluationId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'ID da avaliação inválido'
          }
        });
      }

      // Validar que body contém array de notas
      if (!grades || !Array.isArray(grades)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'É necessário fornecer um array de notas no campo "grades"'
          }
        });
      }

      if (grades.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'O array de notas não pode estar vazio'
          }
        });
      }

      // Apenas professores e admins podem lançar notas em lote
      if (!['teacher', 'admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas professores podem lançar notas em lote'
          }
        });
      }

      // Se for professor, validar se leciona a disciplina
      if (role === 'teacher') {
        const isTeacherValid = await this._validateTeacherOwnership(teacherId, evaluationId);

        if (!isTeacherValid) {
          logger.warn('[GradeController.batchCreate] Professor tentou lançar notas em lote em avaliação não lecionada', {
            teacherId,
            evaluationId
          });

          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não leciona a disciplina desta avaliação'
            }
          });
        }
      }

      // Processar lançamento em lote via service
      const result = await GradeService.batchCreateGrades(evaluationId, grades);

      logger.info('[GradeController.batchCreate] Lançamento em lote processado', {
        evaluationId,
        teacherId,
        total: result.total,
        success: result.success,
        failed: result.failed
      });

      // Determinar status HTTP baseado no resultado
      const statusCode = result.failed === 0 ? 201 : (result.success === 0 ? 422 : 207); // 207 = Multi-Status

      res.status(statusCode).json({
        success: result.failed === 0,
        data: result,
        message: result.failed === 0
          ? `Todas as ${result.success} notas foram lançadas com sucesso`
          : `${result.success} notas lançadas com sucesso, ${result.failed} falharam`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém todas as notas do aluno autenticado
   *
   * GET /api/my-grades
   *
   * Query params (opcionais):
   * - ?semester=1 - Filtrar por semestre
   * - ?discipline_id=3 - Filtrar por disciplina
   * - ?semester=1&discipline_id=3 - Combinar filtros
   *
   * @param {object} req - Requisição Express
   * @param {object} req.user - Usuário autenticado
   * @param {object} req.query - Query parameters
   * @param {number} req.query.semester - Número do semestre (opcional)
   * @param {number} req.query.discipline_id - ID da disciplina (opcional)
   * @param {object} res - Resposta Express
   * @param {function} next - Middleware next
   */
  async getMyGrades(req, res, next) {
    try {
      const { id: userId, role } = req.user;
      const { semester, discipline_id } = req.query;

      // Validar que apenas alunos podem acessar suas próprias notas
      if (role !== 'student') {
        logger.warn('[GradeController.getMyGrades] Acesso negado - usuário não é aluno', {
          userId,
          role
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas alunos podem acessar suas próprias notas'
          }
        });
      }

      // Construir filtros
      const filters = {};

      // Validar e aplicar filtro de semestre
      if (semester) {
        const semesterNum = parseInt(semester, 10);
        if (isNaN(semesterNum) || semesterNum < 1) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Semestre deve ser um número válido maior que 0'
            }
          });
        }
        filters.semester = semesterNum;
      }

      // Validar e aplicar filtro de disciplina
      if (discipline_id) {
        const disciplineNum = parseInt(discipline_id, 10);
        if (isNaN(disciplineNum) || disciplineNum < 1) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Discipline ID deve ser um número válido'
            }
          });
        }
        filters.discipline_id = disciplineNum;
      }

      // Obter notas do aluno
      const grades = await GradeService.getStudentGrades(userId, filters);

      logger.info('[GradeController.getMyGrades] Notas do aluno obtidas com sucesso', {
        studentId: userId,
        count: grades.length,
        filters
      });

      res.status(200).json({
        success: true,
        data: grades,
        count: grades.length,
        filters: Object.keys(filters).length > 0 ? filters : null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GradeController();
