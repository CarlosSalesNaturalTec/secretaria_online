/**
 * Arquivo: backend/src/routes/enrollment.routes.js
 * Descrição: Rotas para o CRUD de matrículas de alunos em cursos
 * Feature: feat-039 - Criar EnrollmentController e rotas
 * Criado em: 2025-10-30
 *
 * ROTAS DISPONÍVEIS:
 * - POST   /enrollments                      - Criar matrícula (POST cria com status pending)
 * - GET    /enrollments                      - Listar todas as matrículas (admin only)
 * - GET    /students/:studentId/enrollments  - Listar matrículas de um aluno (feat-040)
 * - GET    /enrollments/:id                  - Buscar matrícula por ID
 * - PUT    /enrollments/:id/status           - Alterar status (admin only)
 * - DELETE /enrollments/:id                  - Deletar matrícula (admin only)
 *
 * AUTENTICAÇÃO:
 * - Todas as rotas requerem autenticação (JWT token)
 *
 * AUTORIZAÇÃO:
 * - Criar matrícula: Qualquer usuário autenticado
 * - Listar todas: Admin only
 * - Alterar status: Admin only
 * - Deletar: Admin only
 * - Listar por aluno: Qualquer usuário (pode ver suas próprias)
 *
 * VALIDAÇÕES:
 * - student_id: obrigatório, deve ser um inteiro válido
 * - course_id: obrigatório, deve ser um inteiro válido
 * - status: deve ser 'pending', 'active' ou 'cancelled'
 * - enrollment_date: opcional, formato YYYY-MM-DD
 */

'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const EnrollmentController = require('../controllers/enrollment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

const router = express.Router();

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// ========================================
// ROTAS
// ========================================

/**
 * POST /enrollments
 * Criar uma nova matrícula
 *
 * Body:
 * {
 *   "student_id": 1,
 *   "course_id": 2,
 *   "enrollment_date": "2025-10-30" (opcional)
 * }
 *
 * Response 201:
 * {
 *   "success": true,
 *   "message": "Matrícula criada com sucesso com status \"pending\"",
 *   "data": { ... }
 * }
 */
router.post(
  '/',
  [
    body('student_id')
      .isInt({ min: 1 })
      .withMessage('student_id deve ser um inteiro positivo'),
    body('course_id')
      .isInt({ min: 1 })
      .withMessage('course_id deve ser um inteiro positivo'),
    body('enrollment_date')
      .optional()
      .isISO8601()
      .withMessage('enrollment_date deve estar no formato YYYY-MM-DD'),
  ],
  handleValidationErrors,
  EnrollmentController.create
);

/**
 * GET /enrollments
 * Listar todas as matrículas (admin only)
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": [ ... ]
 * }
 */
router.get(
  '/',
  authorizeAdmin,
  EnrollmentController.getAll
);

/**
 * GET /enrollments/:id
 * Buscar uma matrícula por ID
 *
 * Params:
 * - id: ID da matrícula (inteiro)
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 */
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um inteiro positivo'),
  ],
  handleValidationErrors,
  EnrollmentController.getById
);


/**
 * PUT /enrollments/:id/status
 * Alterar status de uma matrícula (admin only)
 *
 * REGRAS DE NEGÓCIO:
 * - Mudar de 'pending' para 'active': requer documentos aprovados
 * - Mudar para 'cancelled': sempre permitido
 *
 * Body:
 * {
 *   "status": "active" | "pending" | "cancelled"
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Status da matrícula alterado para 'active'",
 *   "data": { ... }
 * }
 */
router.put(
  '/:id/status',
  authorizeAdmin,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um inteiro positivo'),
    body('status')
      .isIn(['pending', 'active', 'cancelled'])
      .withMessage("status deve ser 'pending', 'active' ou 'cancelled'"),
  ],
  handleValidationErrors,
  EnrollmentController.updateStatus
);

/**
 * DELETE /enrollments/:id
 * Deletar (soft delete) uma matrícula (admin only)
 *
 * Response 204 No Content
 */
router.delete(
  '/:id',
  authorizeAdmin,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um inteiro positivo'),
  ],
  handleValidationErrors,
  EnrollmentController.delete
);

module.exports = router;
