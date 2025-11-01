/**
 * Arquivo: backend/src/routes/contract.routes.js
 * Descrição: Rotas de gerenciamento de contratos
 * Feature: feat-049 - Criar ContractController e rotas
 * Criado em: 2025-11-01
 *
 * ENDPOINTS:
 * - GET /contracts - Listar contratos (próprios ou filtrados)
 * - GET /contracts/:id - Detalhes de um contrato
 * - POST /contracts - Gerar novo contrato (admin only)
 * - POST /contracts/:id/accept - Aceitar contrato
 * - GET /contracts/:id/pdf - Download do PDF
 *
 * CONTROLE DE ACESSO:
 * - Todos os endpoints requerem autenticação (JWT)
 * - Admin: pode listar, gerar e acessar todos os contratos
 * - Aluno/Professor: pode listar, aceitar e acessar apenas seus contratos
 *
 * @example
 * // Uso no Express app:
 * const contractRoutes = require('./contract.routes');
 * app.use('/api/contracts', contractRoutes);
 */

'use strict';

const express = require('express');
const ContractController = require('../controllers/contract.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

const router = express.Router();

/**
 * GET /api/contracts
 *
 * Lista contratos com controle de acesso por perfil
 *
 * COMPORTAMENTO:
 * - Admin: lista todos os contratos, pode filtrar por userId
 * - Aluno/Professor: lista apenas seus próprios contratos
 *
 * QUERY PARAMETERS:
 * - userId (opcional): ID do usuário (admin only)
 * - status (opcional): 'pending' ou 'accepted'
 * - limit (opcional, padrão: 10): quantidade de registros
 * - offset (opcional, padrão: 0): offset para paginação
 *
 * EXEMPLOS:
 * GET /api/contracts
 * GET /api/contracts?status=pending
 * GET /api/contracts?userId=5 (admin only)
 * GET /api/contracts?limit=20&offset=0
 *
 * @middleware authenticate - Verifica JWT
 * @returns {Object} { success, data: Array, pagination: Object }
 */
router.get('/', authenticate, ContractController.list);

/**
 * POST /api/contracts
 *
 * Gera um novo contrato para um usuário
 *
 * COMPORTAMENTO:
 * - Apenas admin pode gerar contratos
 * - Cria contrato com status "pending" (não aceito)
 * - Gera PDF automaticamente
 * - Retorna dados do contrato criado
 *
 * BODY (JSON):
 * {
 *   "userId": 5,           // Obrigatório: ID do aluno ou professor
 *   "userType": "student", // Obrigatório: 'student' ou 'teacher'
 *   "semester": 1,         // Opcional: semestre (padrão: atual)
 *   "year": 2025,          // Opcional: ano (padrão: atual)
 *   "templateId": 1        // Opcional: ID do template (padrão: primeiro)
 * }
 *
 * EXEMPLOS:
 * POST /api/contracts
 * {
 *   "userId": 5,
 *   "userType": "student",
 *   "semester": 1,
 *   "year": 2025
 * }
 *
 * @middleware authenticate - Verifica JWT
 * @middleware authorize('admin') - Apenas admin
 * @returns {Object} { success, data: Object, message: String }
 * @throws {400} Dados obrigatórios faltando ou inválidos
 * @throws {403} Usuário não é admin
 * @throws {404} Usuário ou template não encontrado
 * @throws {422} Template não disponível
 */
router.post('/', authenticate, authorize('admin'), ContractController.generateContract);

/**
 * GET /api/contracts/:id/pdf
 *
 * Download do arquivo PDF do contrato
 *
 * COMPORTAMENTO:
 * - Retorna arquivo PDF para download
 * - Proprietário do contrato: acesso permitido
 * - Admin: acesso permitido
 * - Outro usuário: acesso negado (403)
 * - Header Content-Disposition configura download
 *
 * EXEMPLOS:
 * GET /api/contracts/123/pdf
 *
 * @middleware authenticate - Verifica JWT
 * @param {number} id - ID do contrato
 * @returns {Buffer} Arquivo PDF
 * @returns {Headers} Content-Type: application/pdf
 * @returns {Headers} Content-Disposition: attachment; filename="contract_*.pdf"
 * @throws {404} Contrato ou arquivo não encontrado
 * @throws {403} Usuário não tem permissão
 */
router.get('/:id/pdf', authenticate, ContractController.getPDF);

/**
 * POST /api/contracts/:id/accept
 *
 * Registra o aceite de um contrato
 *
 * COMPORTAMENTO:
 * - Aluno/professor aceita seu próprio contrato
 * - Admin pode aceitar contrato de qualquer usuário
 * - Registra data/hora do aceite
 * - Contrato não pode ser aceito duas vezes
 *
 * FLUXO:
 * 1. Valida que contrato existe
 * 2. Valida que usuário é proprietário (ou é admin)
 * 3. Valida que contrato ainda não foi aceito
 * 4. Registra data/hora do aceite no banco
 * 5. Retorna contrato atualizado
 *
 * EXEMPLOS:
 * POST /api/contracts/123/accept
 *
 * @middleware authenticate - Verifica JWT
 * @param {number} id - ID do contrato
 * @returns {Object} { success, data: Object, message: String }
 * @throws {404} Contrato não encontrado
 * @throws {403} Usuário não é proprietário e não é admin
 * @throws {422} Contrato já foi aceito
 */
router.post('/:id/accept', authenticate, ContractController.acceptContract);

/**
 * GET /api/contracts/:id
 *
 * Busca detalhes de um contrato específico
 *
 * COMPORTAMENTO:
 * - Proprietário do contrato: acesso permitido
 * - Admin: acesso permitido
 * - Outro usuário: acesso negado (403)
 *
 * @middleware authenticate - Verifica JWT
 * @param {number} id - ID do contrato
 * @returns {Object} { success, data: Object }
 * @throws {404} Contrato não encontrado
 * @throws {403} Usuário não tem permissão
 */
router.get('/:id', authenticate, ContractController.getById);

module.exports = router;
