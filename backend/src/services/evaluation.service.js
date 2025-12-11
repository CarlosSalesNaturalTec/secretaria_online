/**
 * Arquivo: backend/src/services/evaluation.service.js
 * Descrição: Lógica de negócio para o CRUD de Avaliações
 * Feature: feat-051 - Criar EvaluationController e rotas
 * Criado em: 2025-11-01
 */

const { Evaluation, Class, Teacher, Discipline, Grade, User, ClassTeacher } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { Op } = require('sequelize');

class EvaluationService {
  /**
   * Lista todas as avaliações
   *
   * @param {object} currentUser - Usuário logado (opcional, para filtrar avaliações de professor)
   * @returns {Promise<Evaluation[]>} Lista de todas as avaliações
   * @throws {AppError} Se houver erro ao listar
   */
  async list(currentUser = null) {
    try {
      const { Course } = require('../models');

      const where = {};

      // Se o usuário logado é professor, filtrar apenas suas avaliações
      if (currentUser && currentUser.role === 'teacher') {
        const user = await User.findByPk(currentUser.id);
        if (user && user.teacher_id) {
          where.teacher_id = user.teacher_id;
        }
      }

      const evaluations = await Evaluation.findAll({
        where,
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'semester', 'year'],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id', 'name', 'description', 'duration', 'duration_type', 'course_type'],
              },
            ],
          },
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'nome', 'email'],
          },
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code'],
          },
        ],
        order: [['date', 'DESC']],
      });

      return evaluations.map(e => e.toJSON());
    } catch (error) {
      console.error('[EvaluationService] Erro ao listar avaliações:', error);
      throw new AppError(
        'Erro ao listar avaliações',
        500,
        'EVALUATION_LIST_ERROR'
      );
    }
  }

  /**
   * Cria uma nova avaliação
   *
   * @param {object} evaluationData - Dados da avaliação
   * @param {number} evaluationData.class_id - ID da turma
   * @param {number} evaluationData.teacher_id - ID do professor (opcional, obtido do usuário logado se não fornecido)
   * @param {number} evaluationData.discipline_id - ID da disciplina
   * @param {string} evaluationData.name - Nome da avaliação
   * @param {string} evaluationData.date - Data da avaliação (YYYY-MM-DD)
   * @param {string} evaluationData.type - Tipo: 'grade' ou 'concept'
   * @param {object} currentUser - Usuário logado (opcional)
   * @returns {Promise<Evaluation>} A avaliação criada
   * @throws {AppError} Se houver erro na validação
   */
  async create(evaluationData, currentUser = null) {
    // Validar se a turma existe
    const classExists = await Class.findByPk(evaluationData.class_id);
    if (!classExists) {
      throw new AppError('Turma não encontrada', 404, 'CLASS_NOT_FOUND');
    }

    // Determinar o teacher_id
    let teacherId = evaluationData.teacher_id;

    // Se teacher_id não foi fornecido, tentar obter do usuário logado
    if (!teacherId && currentUser) {
      // Buscar o teacher_id associado ao user_id logado
      const user = await User.findByPk(currentUser.id);
      if (user && user.teacher_id) {
        teacherId = user.teacher_id;
      } else {
        throw new AppError(
          'Usuário logado não tem um professor associado. Por favor, forneça o ID do professor.',
          400,
          'NO_TEACHER_ASSOCIATED'
        );
      }
    }

    if (!teacherId) {
      throw new AppError('ID do professor é obrigatório', 400, 'TEACHER_ID_REQUIRED');
    }

    // Validar se o professor existe
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      throw new AppError('Professor não encontrado', 404, 'TEACHER_NOT_FOUND');
    }

    // Validar se a disciplina existe
    const discipline = await Discipline.findByPk(evaluationData.discipline_id);
    if (!discipline) {
      throw new AppError('Disciplina não encontrada', 404, 'DISCIPLINE_NOT_FOUND');
    }

    // Validar se o professor leciona essa disciplina nessa turma
    const classTeacher = await ClassTeacher.findOne({
      where: {
        class_id: evaluationData.class_id,
        teacher_id: teacherId,
        discipline_id: evaluationData.discipline_id
      }
    });

    if (!classTeacher) {
      throw new AppError(
        'O professor não leciona essa disciplina nessa turma',
        422,
        'TEACHER_NOT_TEACHING_DISCIPLINE'
      );
    }

    // Validar tipo de avaliação
    if (!['grade', 'concept'].includes(evaluationData.type)) {
      throw new AppError(
        'Tipo de avaliação inválido. Deve ser "grade" ou "concept"',
        422,
        'INVALID_EVALUATION_TYPE'
      );
    }

    try {
      const evaluation = await Evaluation.create({
        class_id: evaluationData.class_id,
        teacher_id: teacherId, // Usar o teacherId determinado (da requisição ou do usuário logado)
        discipline_id: evaluationData.discipline_id,
        name: evaluationData.name,
        date: evaluationData.date,
        type: evaluationData.type || 'grade',
      });

      return evaluation.toJSON();
    } catch (error) {
      console.error('[EvaluationService] Erro ao criar avaliação:', error);
      throw new AppError(
        'Erro ao criar avaliação',
        500,
        'EVALUATION_CREATE_ERROR'
      );
    }
  }

  /**
   * Lista todas as avaliações de uma turma
   *
   * @param {number} classId - ID da turma
   * @param {object} options - Opções de filtro
   * @param {string} options.type - Filtrar por tipo ('grade' ou 'concept')
   * @param {object} options.currentUser - Usuário logado (para filtrar avaliações de professor)
   * @returns {Promise<Evaluation[]>} Lista de avaliações
   * @throws {AppError} Se a turma não existir
   */
  async listByClass(classId, options = {}) {
    // Validar se a turma existe
    const classExists = await Class.findByPk(classId);
    if (!classExists) {
      throw new AppError('Turma não encontrada', 404, 'CLASS_NOT_FOUND');
    }

    try {
      const where = { class_id: classId };

      // Filtro opcional por tipo
      if (options.type && ['grade', 'concept'].includes(options.type)) {
        where.type = options.type;
      }

      // Se o usuário logado é professor, filtrar apenas avaliações que ele criou
      if (options.currentUser && options.currentUser.role === 'teacher') {
        // Buscar o teacher_id associado ao user_id
        const user = await User.findByPk(options.currentUser.id);
        if (user && user.teacher_id) {
          where.teacher_id = user.teacher_id;
        }
      }

      const evaluations = await Evaluation.findAll({
        where,
        include: [
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'nome', 'email'],
          },
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code'],
          },
        ],
        order: [['date', 'DESC']],
      });

      return evaluations.map(e => e.toJSON());
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao listar avaliações',
        500,
        'EVALUATION_LIST_ERROR'
      );
    }
  }

  /**
   * Lista todas as avaliações criadas por um professor
   *
   * @param {number} teacherId - ID do professor
   * @returns {Promise<Evaluation[]>} Lista de avaliações do professor
   * @throws {AppError} Se o professor não existir
   */
  async listByTeacher(teacherId) {
    // Validar se o professor existe
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      throw new AppError('Professor não encontrado', 404, 'TEACHER_NOT_FOUND');
    }

    try {
      const { Course } = require('../models');

      const evaluations = await Evaluation.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'semester', 'year'],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id', 'name', 'description', 'duration', 'duration_type', 'course_type'],
              },
            ],
          },
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code'],
          },
        ],
        order: [['date', 'DESC']],
      });

      return evaluations.map(e => e.toJSON());
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao listar avaliações do professor',
        500,
        'EVALUATION_LIST_ERROR'
      );
    }
  }

  /**
   * Busca uma avaliação por ID
   *
   * @param {number} evaluationId - ID da avaliação
   * @returns {Promise<Evaluation|null>} A avaliação encontrada ou null
   */
  async getById(evaluationId) {
    try {
      const { Course } = require('../models');

      const evaluation = await Evaluation.findByPk(evaluationId, {
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'semester', 'year'],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id', 'name', 'description', 'duration', 'duration_type', 'course_type'],
              },
            ],
          },
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'nome', 'email'],
          },
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code'],
          },
          {
            model: Grade,
            as: 'grades',
            attributes: ['id', 'student_id', 'grade', 'concept'],
          },
        ],
      });

      return evaluation ? evaluation.toJSON() : null;
    } catch (error) {
      throw new AppError(
        'Erro ao buscar avaliação',
        500,
        'EVALUATION_GET_ERROR'
      );
    }
  }

  /**
   * Atualiza uma avaliação
   *
   * @param {number} evaluationId - ID da avaliação
   * @param {object} updateData - Dados a atualizar
   * @returns {Promise<Evaluation>} A avaliação atualizada
   * @throws {AppError} Se a avaliação não existir ou dados forem inválidos
   */
  async update(evaluationId, updateData) {
    const evaluation = await this.getById(evaluationId);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404, 'EVALUATION_NOT_FOUND');
    }

    // Validar tipo de avaliação se fornecido
    if (updateData.type && !['grade', 'concept'].includes(updateData.type)) {
      throw new AppError(
        'Tipo de avaliação inválido. Deve ser "grade" ou "concept"',
        422,
        'INVALID_EVALUATION_TYPE'
      );
    }

    // Validar disciplina se fornecida
    if (updateData.discipline_id) {
      const discipline = await Discipline.findByPk(updateData.discipline_id);
      if (!discipline) {
        throw new AppError('Disciplina não encontrada', 404, 'DISCIPLINE_NOT_FOUND');
      }
    }

    try {
      const evaluationRecord = await Evaluation.findByPk(evaluationId);
      await evaluationRecord.update(updateData);
      return evaluationRecord.toJSON();
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao atualizar avaliação',
        500,
        'EVALUATION_UPDATE_ERROR'
      );
    }
  }

  /**
   * Deleta uma avaliação (soft delete)
   *
   * @param {number} evaluationId - ID da avaliação
   * @returns {Promise<boolean>} True se deletada com sucesso
   * @throws {AppError} Se a avaliação não existir
   */
  async delete(evaluationId) {
    const evaluation = await this.getById(evaluationId);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404, 'EVALUATION_NOT_FOUND');
    }

    try {
      const evaluationRecord = await Evaluation.findByPk(evaluationId);
      await evaluationRecord.destroy();
      return true;
    } catch (error) {
      throw new AppError(
        'Erro ao deletar avaliação',
        500,
        'EVALUATION_DELETE_ERROR'
      );
    }
  }

  /**
   * Conta quantas avaliações existem em uma turma
   *
   * @param {number} classId - ID da turma
   * @returns {Promise<number>} Número de avaliações
   */
  async countByClass(classId) {
    try {
      const count = await Evaluation.count({
        where: { class_id: classId },
      });
      return count;
    } catch (error) {
      throw new AppError(
        'Erro ao contar avaliações',
        500,
        'EVALUATION_COUNT_ERROR'
      );
    }
  }

  /**
   * Lista avaliações futuras de uma turma
   *
   * @param {number} classId - ID da turma
   * @returns {Promise<Evaluation[]>} Lista de avaliações futuras
   */
  async listUpcomingByClass(classId) {
    const classExists = await Class.findByPk(classId);
    if (!classExists) {
      throw new AppError('Turma não encontrada', 404, 'CLASS_NOT_FOUND');
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const evaluations = await Evaluation.findAll({
        where: {
          class_id: classId,
          date: {
            [Op.gte]: today,
          },
        },
        include: [
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'nome', 'email'],
          },
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code'],
          },
        ],
        order: [['date', 'ASC']],
      });

      return evaluations.map(e => e.toJSON());
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao listar avaliações futuras',
        500,
        'EVALUATION_LIST_ERROR'
      );
    }
  }
}

module.exports = new EvaluationService();
