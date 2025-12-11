/**
 * Arquivo: backend/src/routes/evaluation.routes.js
 * Descrição: Rotas para o CRUD de Avaliações e gerenciamento de notas por avaliação
 * Feature: feat-051 - Criar EvaluationController e rotas
 * Criado em: 2025-11-01
 * Atualizado em: 2025-12-11
 *
 * Endpoints adicionais de Notas:
 * - GET /api/evaluations/:id/grades - Listar notas de avaliação
 * - GET /api/evaluations/:id/grades/stats - Estatísticas de lançamento
 * - GET /api/evaluations/:id/grades/pending - Notas pendentes
 * - POST /api/evaluations/:id/grades/batch - Lançamento em lote
 */

const express = require('express');
const router = express.Router();
const EvaluationController = require('../controllers/evaluation.controller');
const GradeController = require('../controllers/grade.controller');
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

/**
 * GET /api/evaluations/:id/grades
 * Lista todas as notas de uma avaliação
 * Requer: Autenticado (Professor que leciona ou Admin)
 */
router.get(
  '/:id/grades',
  GradeController.getByEvaluation
);

/**
 * GET /api/evaluations/:id/grades/stats
 * Obtém estatísticas de lançamento de notas para uma avaliação
 * Requer: Autenticado (Professor que leciona ou Admin)
 */
router.get(
  '/:id/grades/stats',
  GradeController.getStats
);

/**
 * GET /api/evaluations/:id/grades/pending
 * Lista alunos que ainda não tiveram nota lançada em uma avaliação
 * Requer: Autenticado (Professor que leciona ou Admin)
 */
router.get(
  '/:id/grades/pending',
  GradeController.getPending
);

/**
 * POST /api/evaluations/:id/grades/batch
 * Lança múltiplas notas em lote para uma avaliação
 * Requer: Autenticado (Professor que leciona ou Admin)
 */
router.post(
  '/:id/grades/batch',
  GradeController.batchCreate
);

module.exports = router;
