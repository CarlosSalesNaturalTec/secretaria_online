/**
 * Arquivo: backend/src/routes/evaluation.routes.js
 * Descrição: Rotas para o CRUD de Avaliações
 * Feature: feat-051 - Criar EvaluationController e rotas
 * Criado em: 2025-11-01
 */

const express = require('express');
const router = express.Router();
const EvaluationController = require('../controllers/evaluation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeTeacher, authorizeAny } = require('../middlewares/rbac.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/evaluations
 * Lista todas as avaliações
 * Requer: Admin ou Professor
 */
router.get(
  '/',
  authorizeTeacher,
  EvaluationController.list
);

/**
 * POST /api/evaluations
 * Cria uma nova avaliação
 * Requer: Admin ou Professor
 * Body: {class_id, teacher_id, discipline_id, name, date, type}
 */
router.post(
  '/',
  authorizeTeacher,
  EvaluationController.create
);

/**
 * GET /api/classes/:classId/evaluations
 * Lista todas as avaliações de uma turma
 * Requer: Autenticado
 * Query params: ?type=grade|concept (opcional)
 */
router.get(
  '/classes/:classId/evaluations',
  authorizeAny,
  EvaluationController.listByClass
);

/**
 * GET /api/classes/:classId/evaluations/upcoming
 * Lista avaliações futuras de uma turma
 * Requer: Autenticado
 */
router.get(
  '/classes/:classId/evaluations/upcoming',
  authorizeAny,
  EvaluationController.listUpcomingByClass
);

/**
 * GET /api/teachers/:teacherId/evaluations
 * Lista todas as avaliações criadas por um professor
 * Requer: Autenticado
 */
router.get(
  '/teachers/:teacherId/evaluations',
  authorizeAny,
  EvaluationController.listByTeacher
);

/**
 * GET /api/evaluations/:id
 * Busca uma avaliação por ID
 * Requer: Autenticado
 */
router.get(
  '/:id',
  authorizeAny,
  EvaluationController.getById
);

/**
 * PUT /api/evaluations/:id
 * Atualiza uma avaliação
 * Requer: Admin ou Professor (criador da avaliação)
 */
router.put(
  '/:id',
  authorizeTeacher,
  EvaluationController.update
);

/**
 * DELETE /api/evaluations/:id
 * Deleta uma avaliação
 * Requer: Admin ou Professor (criador)
 */
router.delete(
  '/:id',
  authorizeTeacher,
  EvaluationController.delete
);

module.exports = router;
