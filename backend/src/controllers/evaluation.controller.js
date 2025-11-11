/**
 * Arquivo: backend/src/controllers/evaluation.controller.js
 * Descrição: Controlador para o CRUD de Avaliações
 * Feature: feat-051 - Criar EvaluationController e rotas
 * Criado em: 2025-11-01
 */

const EvaluationService = require('../services/evaluation.service');
const logger = require('../utils/logger');

class EvaluationController {
  /**
   * Cria uma nova avaliação
   * POST /api/evaluations
   *
   * @param {object} req - Requisição Express
   * @param {object} req.body - Corpo da requisição
   * @param {number} req.body.class_id - ID da turma
   * @param {number} req.body.teacher_id - ID do professor
   * @param {number} req.body.discipline_id - ID da disciplina
   * @param {string} req.body.name - Nome da avaliação
   * @param {string} req.body.date - Data (YYYY-MM-DD)
   * @param {string} req.body.type - Tipo ('grade' ou 'concept')
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async create(req, res, next) {
    try {
      const evaluation = await EvaluationService.create(req.body);

      logger.info('Avaliação criada com sucesso', {
        evaluationId: evaluation.id,
        classId: evaluation.class_id,
        teacherId: evaluation.teacher_id,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data: evaluation,
        message: 'Avaliação criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas as avaliações de uma turma
   * GET /api/classes/:classId/evaluations
   *
   * @param {object} req - Requisição Express
   * @param {object} req.params - Parâmetros da URL
   * @param {number} req.params.classId - ID da turma
   * @param {object} req.query - Query parameters
   * @param {string} req.query.type - Filtro por tipo (opcional)
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async listByClass(req, res, next) {
    try {
      const { classId } = req.params;
      const { type } = req.query;

      const evaluations = await EvaluationService.listByClass(classId, { type });

      logger.info('Avaliações listadas por turma', {
        classId,
        count: evaluations.length,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: evaluations,
        count: evaluations.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas as avaliações criadas por um professor
   * GET /api/teachers/:teacherId/evaluations
   *
   * @param {object} req - Requisição Express
   * @param {object} req.params - Parâmetros da URL
   * @param {number} req.params.teacherId - ID do professor
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async listByTeacher(req, res, next) {
    try {
      const { teacherId } = req.params;

      const evaluations = await EvaluationService.listByTeacher(teacherId);

      logger.info('Avaliações listadas por professor', {
        teacherId,
        count: evaluations.length,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: evaluations,
        count: evaluations.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca uma avaliação por ID
   * GET /api/evaluations/:id
   *
   * @param {object} req - Requisição Express
   * @param {object} req.params - Parâmetros da URL
   * @param {number} req.params.id - ID da avaliação
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const evaluation = await EvaluationService.getById(id);
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          error: 'Avaliação não encontrada',
        });
      }

      logger.info('Avaliação consultada', {
        evaluationId: id,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma avaliação
   * PUT /api/evaluations/:id
   *
   * @param {object} req - Requisição Express
   * @param {object} req.params - Parâmetros da URL
   * @param {number} req.params.id - ID da avaliação
   * @param {object} req.body - Corpo da requisição com dados a atualizar
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const evaluation = await EvaluationService.update(id, req.body);

      logger.info('Avaliação atualizada com sucesso', {
        evaluationId: id,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: evaluation,
        message: 'Avaliação atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta uma avaliação
   * DELETE /api/evaluations/:id
   *
   * @param {object} req - Requisição Express
   * @param {object} req.params - Parâmetros da URL
   * @param {number} req.params.id - ID da avaliação
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await EvaluationService.delete(id);

      logger.info('Avaliação deletada com sucesso', {
        evaluationId: id,
        userId: req.user?.id,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista avaliações futuras de uma turma
   * GET /api/classes/:classId/evaluations/upcoming
   *
   * @param {object} req - Requisição Express
   * @param {object} req.params - Parâmetros da URL
   * @param {number} req.params.classId - ID da turma
   * @param {object} res - Resposta Express
   * @param {function} next - Função next do Express
   */
  async listUpcomingByClass(req, res, next) {
    try {
      const { classId } = req.params;

      const evaluations = await EvaluationService.listUpcomingByClass(classId);

      logger.info('Avaliações futuras listadas', {
        classId,
        count: evaluations.length,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: evaluations,
        count: evaluations.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EvaluationController();
