/**
 * Arquivo: backend/src/routes/reenrollment.routes.js
 * Descrição: Rotas para aceite de rematrícula de estudantes
 * Feature: feat-reenrollment-etapa-4 - ReenrollmentController e Rotas
 * Criado em: 2025-12-15
 *
 * ROTAS DISPONÍVEIS:
 * - POST /reenrollments/accept/:enrollmentId - Aceitar rematrícula do estudante
 * - GET /reenrollments/contract-preview/:enrollmentId - Preview do contrato
 *
 * AUTENTICAÇÃO:
 * - Todas as rotas requerem autenticação (JWT token)
 *
 * AUTORIZAÇÃO:
 * - Aceitar rematrícula: Student only (role: 'student')
 * - Preview de contrato: Student only (role: 'student')
 */

'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const ReenrollmentController = require('../controllers/reenrollment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin, authorizeStudent } = require('../middlewares/rbac.middleware');
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
 * POST /reenrollments/accept/:enrollmentId
 * Endpoint para um estudante aceitar a rematrícula.
 */
router.post(
  '/accept/:enrollmentId',
  authorizeStudent,
  [
    param('enrollmentId').isInt({ min: 1 }).withMessage('O ID da matrícula deve ser um inteiro positivo.'),
  ],
  handleValidationErrors,
  ReenrollmentController.acceptReenrollment
);


/**
 * GET /reenrollments/contract-preview/:enrollmentId
 * Gera preview de contrato HTML para rematrícula do estudante
 *
 * IMPORTANTE:
 * - Retorna HTML renderizado pronto para exibição (NÃO gera PDF)
 * - Apenas estudante dono do enrollment pode visualizar
 * - Apenas enrollments com status 'pending' podem ter preview
 * - Reutiliza sistema existente de ContractTemplate com método replacePlaceholders()
 *
 * RESTRIÇÕES:
 * - Apenas estudantes (role: 'student')
 * - Valida ownership: estudante deve ser dono do enrollment
 * - Enrollment deve ter status 'pending'
 *
 * Params:
 * - enrollmentId: ID do enrollment (número inteiro)
 *
 * Response 200 (sucesso):
 * {
 *   "success": true,
 *   "data": {
 *     "contractHTML": "<html>...</html>",
 *     "enrollmentId": 5,
 *     "semester": 1,
 *     "year": 2025
 *   }
 * }
 *
 * Response 403 (não é dono do enrollment):
 * {
 *   "success": false,
 *   "error": "Você não tem permissão para visualizar este contrato"
 * }
 *
 * Response 404 (enrollment não encontrado):
 * {
 *   "success": false,
 *   "error": "Matrícula não encontrada"
 * }
 *
 * Response 422 (enrollment não está pending ou sem template):
 * {
 *   "success": false,
 *   "error": "Esta matrícula não está pendente de aceite (status atual: active)"
 * }
 * OU
 * {
 *   "success": false,
 *   "error": "Nenhum template de contrato disponível. Entre em contato com a administração."
 * }
 *
 * Response 500 (erro no servidor):
 * {
 *   "success": false,
 *   "error": "Erro ao gerar preview de contrato. Tente novamente mais tarde."
 * }
 */
router.get(
  '/contract-preview/:enrollmentId',
  // Apenas estudantes podem visualizar preview de contrato
  // (ownership validado no service)
  ReenrollmentController.previewContract
);

module.exports = router;
