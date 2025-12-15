/**
 * Arquivo: backend/src/controllers/reenrollment.controller.js
 * Descrição: Controlador para rematrícula global de estudantes
 * Feature: feat-reenrollment-etapa-4 - ReenrollmentController e Rotas
 * Criado em: 2025-12-15
 *
 * RESPONSABILIDADES:
 * - Intermediar requisições HTTP com o ReenrollmentService
 * - Validar entrada de dados (semester, year, adminPassword)
 * - Validar senha do administrador antes de processar rematrícula
 * - Tratar erros e retornar respostas apropriadas
 * - Registrar logs de operações
 * - Aplicar regras de autorização (apenas admin pode executar)
 *
 * ENDPOINTS:
 * - POST /reenrollments/process-all - Processar rematrícula global de todos os estudantes
 */

'use strict';

const ReenrollmentService = require('../services/reenrollment.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class ReenrollmentController {
  /**
   * Processa rematrícula global de TODOS os estudantes do sistema
   *
   * POST /api/v1/reenrollments/process-all
   *
   * FLUXO:
   * 1. Valida erros de validação (express-validator)
   * 2. Valida senha do administrador com ReenrollmentService.validateAdminPassword()
   * 3. Se senha inválida, retorna erro 401
   * 4. Chama ReenrollmentService.processGlobalReenrollment()
   * 5. Retorna resposta 200 com total de estudantes e IDs afetados
   *
   * VALIDAÇÕES:
   * - semester: número entre 1 e 2
   * - year: número no formato YYYY (ex: 2025)
   * - adminPassword: string obrigatória
   *
   * SEGURANÇA:
   * - Requer autenticação JWT (middleware authenticate)
   * - Requer role 'admin' (middleware rbac(['admin']))
   * - Valida senha do admin antes de executar
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * POST /api/v1/reenrollments/process-all
   * Authorization: Bearer <jwt_token>
   * {
   *   "semester": 1,
   *   "year": 2025,
   *   "adminPassword": "senha_admin"
   * }
   *
   * Response 200:
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
   */
  async processGlobalReenrollment(req, res, next) {
    try {
      // 1. Validar entrada com express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn(
          `[ReenrollmentController] Validação falhou ao processar rematrícula: ${JSON.stringify(errors.array())}`
        );
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array(),
        });
      }

      const { semester, year, adminPassword } = req.body;
      const adminUserId = req.user.id; // Extraído do token JWT pelo middleware authenticate

      logger.info(
        `[ReenrollmentController] Processando rematrícula global - Admin ID: ${adminUserId}, Semestre: ${semester}, Ano: ${year}`
      );

      // 2. Validar senha do administrador
      const isPasswordValid = await ReenrollmentService.validateAdminPassword(
        adminUserId,
        adminPassword
      );

      if (!isPasswordValid) {
        logger.warn(
          `[ReenrollmentController] Senha incorreta fornecida pelo admin - ID: ${adminUserId}`
        );
        return res.status(401).json({
          success: false,
          error: 'Senha incorreta',
        });
      }

      logger.info(
        `[ReenrollmentController] Senha validada. Processando rematrícula...`
      );

      // 3. Processar rematrícula global
      const result = await ReenrollmentService.processGlobalReenrollment(
        semester,
        year,
        adminUserId
      );

      logger.info(
        `[ReenrollmentController] Rematrícula global processada - Total: ${result.totalStudents} estudantes`
      );

      // 4. Retornar resposta de sucesso
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: result.totalStudents,
          affectedEnrollmentIds: result.affectedEnrollmentIds,
        },
        message: `Rematrícula global processada com sucesso. ${result.totalStudents} estudantes rematriculados.`,
      });
    } catch (error) {
      logger.error(
        `[ReenrollmentController] Erro ao processar rematrícula global: ${error.message}`
      );
      next(error);
    }
  }
}

module.exports = new ReenrollmentController();
