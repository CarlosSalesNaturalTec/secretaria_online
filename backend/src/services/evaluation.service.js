/**
 * Arquivo: backend/src/services/evaluation.service.js
 * Descrição: Lógica de negócio para o CRUD de Avaliações
 * Feature: feat-051 - Criar EvaluationController e rotas
 * Criado em: 2025-11-01
 */

const { Evaluation, Class, User, Discipline, Grade } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { Op } = require('sequelize');

class EvaluationService {
  /**
   * Cria uma nova avaliação
   *
   * @param {object} evaluationData - Dados da avaliação
   * @param {number} evaluationData.class_id - ID da turma
   * @param {number} evaluationData.teacher_id - ID do professor
   * @param {number} evaluationData.discipline_id - ID da disciplina
   * @param {string} evaluationData.name - Nome da avaliação
   * @param {string} evaluationData.date - Data da avaliação (YYYY-MM-DD)
   * @param {string} evaluationData.type - Tipo: 'grade' ou 'concept'
   * @returns {Promise<Evaluation>} A avaliação criada
   * @throws {AppError} Se houver erro na validação
   */
  async create(evaluationData) {
    // Validar se a turma existe
    const classExists = await Class.findByPk(evaluationData.class_id);
    if (!classExists) {
      throw new AppError('Turma não encontrada', 404, 'CLASS_NOT_FOUND');
    }

    // Validar se o professor existe e tem o papel correto
    const teacher = await User.findOne({
      where: { id: evaluationData.teacher_id, role: 'teacher' },
    });
    if (!teacher) {
      throw new AppError('Professor não encontrado', 404, 'TEACHER_NOT_FOUND');
    }

    // Validar se a disciplina existe
    const discipline = await Discipline.findByPk(evaluationData.discipline_id);
    if (!discipline) {
      throw new AppError('Disciplina não encontrada', 404, 'DISCIPLINE_NOT_FOUND');
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
        teacher_id: evaluationData.teacher_id,
        discipline_id: evaluationData.discipline_id,
        name: evaluationData.name,
        date: evaluationData.date,
        type: evaluationData.type || 'grade',
      });

      return evaluation.toJSON();
    } catch (error) {
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

      const evaluations = await Evaluation.findAll({
        where,
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Discipline,
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
    const teacher = await User.findOne({
      where: { id: teacherId, role: 'teacher' },
    });
    if (!teacher) {
      throw new AppError('Professor não encontrado', 404, 'TEACHER_NOT_FOUND');
    }

    try {
      const evaluations = await Evaluation.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: Class,
            attributes: ['id', 'semester', 'year'],
          },
          {
            model: Discipline,
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
      const evaluation = await Evaluation.findByPk(evaluationId, {
        include: [
          {
            model: Class,
            attributes: ['id', 'semester', 'year'],
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Discipline,
            attributes: ['id', 'name', 'code'],
          },
          {
            model: Grade,
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
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Discipline,
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
