/**
 * Arquivo: backend/src/routes/request.routes.js
 * Descrição: Rotas para gerenciar solicitações de alunos
 * Feature: feat-056 - Criar RequestController e rotas
 * Criado em: 2025-11-03
 */

const express = require('express');
const router = express.Router();

const RequestController = require('../controllers/request.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

/**
 * Rotas de Solicitações
 *
 * Todas as rotas requerem autenticação
 *
 * Endpoints:
 * - POST   /requests           - Criar solicitação (aluno ou admin)
 * - GET    /requests           - Listar solicitações (admin vê todas, aluno vê próprias)
 * - GET    /requests/:id       - Buscar solicitação específica
 * - PUT    /requests/:id/approve - Aprovar solicitação (apenas admin)
 * - PUT    /requests/:id/reject  - Rejeitar solicitação (apenas admin)
 *
 * Query Parameters (GET /requests):
 * - status: 'pending' | 'approved' | 'rejected'
 * - student_id: ID do aluno (apenas para admins)
 */

/**
 * @route   POST /api/requests
 * @desc    Criar nova solicitação
 * @access  Aluno, Admin
 *
 * Body:
 * - request_type_id: number (obrigatório) - ID do tipo de solicitação
 * - description: string (opcional) - Descrição/justificativa da solicitação
 * - student_id: number (obrigatório apenas para admin) - ID do aluno
 *
 * @example
 * // Aluno criando solicitação
 * POST /api/requests
 * Body: {
 *   "request_type_id": 1,
 *   "description": "Preciso do histórico escolar para processo de transferência"
 * }
 *
 * @example
 * // Admin criando solicitação para um aluno
 * POST /api/requests
 * Body: {
 *   "student_id": 5,
 *   "request_type_id": 2,
 *   "description": "Solicitação de certificado"
 * }
 */
router.post(
  '/',
  authenticate,
  authorize('student', 'admin'),
  RequestController.create
);

/**
 * @route   GET /api/requests
 * @desc    Listar solicitações
 * @access  Aluno (próprias), Admin (todas)
 *
 * Query Parameters:
 * - status: 'pending' | 'approved' | 'rejected' (opcional) - Filtrar por status
 * - student_id: number (opcional, apenas admin) - Filtrar por aluno específico
 *
 * @example
 * // Listar todas as solicitações pendentes (admin)
 * GET /api/requests?status=pending
 *
 * @example
 * // Listar solicitações de um aluno específico (admin)
 * GET /api/requests?student_id=5
 *
 * @example
 * // Listar minhas solicitações (aluno)
 * GET /api/requests
 */
router.get(
  '/',
  authenticate,
  authorize('student', 'admin'),
  RequestController.list
);

/**
 * @route   GET /api/requests/stats
 * @desc    Obter estatísticas de solicitações (total, pendentes, aprovadas, rejeitadas)
 * @access  Admin
 *
 * @example
 * GET /api/requests/stats
 *
 * Response:
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
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  RequestController.getStats
);

/**
 * @route   GET /api/requests/:id
 * @desc    Buscar solicitação por ID
 * @access  Aluno (própria), Admin (qualquer)
 *
 * @example
 * GET /api/requests/5
 */
router.get(
  '/:id',
  authenticate,
  authorize('student', 'admin'),
  RequestController.getById
);

/**
 * @route   PUT /api/requests/:id/approve
 * @desc    Aprovar solicitação
 * @access  Admin
 *
 * Body:
 * - observations: string (opcional) - Observações sobre a aprovação
 *
 * @example
 * PUT /api/requests/5/approve
 * Body: {
 *   "observations": "Documentação verificada e aprovada"
 * }
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  RequestController.approve
);

/**
 * @route   PUT /api/requests/:id/reject
 * @desc    Rejeitar solicitação
 * @access  Admin
 *
 * Body:
 * - observations: string (opcional) - Observações sobre a rejeição
 *
 * @example
 * PUT /api/requests/5/reject
 * Body: {
 *   "observations": "Documentação incompleta. Favor anexar comprovante de matrícula."
 * }
 */
router.put(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  RequestController.reject
);

module.exports = router;
