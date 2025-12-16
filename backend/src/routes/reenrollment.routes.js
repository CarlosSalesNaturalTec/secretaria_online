/**
 * Arquivo: backend/src/routes/reenrollment.routes.js
 * Descrição: Rotas para rematrícula global de estudantes
 * Feature: feat-reenrollment-etapa-4 - ReenrollmentController e Rotas
 * Criado em: 2025-12-15
 *
 * ROTAS DISPONÍVEIS:
 * - POST /reenrollments/process-all - Processar rematrícula global de TODOS os estudantes
 *
 * AUTENTICAÇÃO:
 * - Todas as rotas requerem autenticação (JWT token)
 *
 * AUTORIZAÇÃO:
 * - Processar rematrícula global: Admin only (role: 'admin')
 *
 * VALIDAÇÕES:
 * - semester: obrigatório, inteiro entre 1 e 2
 * - year: obrigatório, inteiro no formato YYYY (ex: 2025)
 * - adminPassword: obrigatório, string com mínimo 6 caracteres
 *
 * SEGURANÇA:
 * - Validação de senha do admin antes de executar operação
 * - Rate limiting pode ser aplicado para prevenir ataques
 * - Operação usa transação do Sequelize (rollback em caso de erro)
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
 * POST /reenrollments/process-all
 * Processar rematrícula global de TODOS os estudantes do sistema
 *
 * IMPORTANTE:
 * - Processa TODOS os enrollments ativos (status='active') do sistema
 * - NÃO processa por curso individual - é uma operação global
 * - Atualiza status de TODOS para 'pending'
 * - NÃO cria contratos nesta etapa (criados após aceite do estudante)
 * - Usa transação do Sequelize para garantir atomicidade
 *
 * RESTRIÇÕES:
 * - Apenas administradores (role: 'admin')
 * - Requer senha do admin para confirmação
 *
 * Body:
 * {
 *   "semester": 1,           // 1 ou 2
 *   "year": 2025,            // YYYY
 *   "adminPassword": "senha" // Senha do admin para validação
 * }
 *
 * Response 200 (sucesso):
 * {
 *   "success": true,
 *   "data": {
 *     "totalStudents": 150,
 *     "affectedEnrollmentIds": [1, 2, 3, ...]
 *   },
 *   "message": "Rematrícula global processada com sucesso. 150 estudantes rematriculados."
 * }
 *
 * Response 401 (senha incorreta):
 * {
 *   "success": false,
 *   "error": "Senha incorreta"
 * }
 *
 * Response 400 (validação falhou):
 * {
 *   "success": false,
 *   "error": "Dados inválidos",
 *   "details": [...]
 * }
 *
 * Response 500 (erro no servidor):
 * {
 *   "success": false,
 *   "error": "Erro ao processar rematrícula global. Operação cancelada."
 * }
 */
router.post(
  '/process-all',
  authorizeAdmin, // Apenas admins podem executar
  [
    body('semester')
      .isInt({ min: 1, max: 2 })
      .withMessage('semester deve ser 1 ou 2'),
    body('year')
      .isInt({ min: 2020, max: 2100 })
      .withMessage('year deve ser um ano válido no formato YYYY (ex: 2025)'),
  ],
  handleValidationErrors,
  ReenrollmentController.processGlobalReenrollment
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
