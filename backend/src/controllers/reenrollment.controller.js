/**
 * Arquivo: backend/src/controllers/reenrollment.controller.js
 * Descrição: Controlador para aceite de rematrícula de estudantes
 * Feature: feat-reenrollment-etapa-4 - ReenrollmentController e Rotas
 * Criado em: 2025-12-15
 *
 * RESPONSABILIDADES:
 * - Intermediar requisições HTTP com o ReenrollmentService
 * - Validar entrada de dados
 * - Tratar erros e retornar respostas apropriadas
 * - Registrar logs de operações
 * - Aplicar regras de autorização
 *
 * ENDPOINTS:
 * - POST /reenrollments/accept/:enrollmentId - Aceitar rematrícula do estudante
 * - GET /reenrollments/contract-preview/:enrollmentId - Preview do contrato
 */

'use strict';

const ReenrollmentService = require('../services/reenrollment.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class ReenrollmentController {
  
  /**
   * Processa o aceite de rematrícula de um estudante
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async acceptReenrollment(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user.id;

      logger.info(`[ReenrollmentController] Recebida requisição de aceite - Enrollment ID: ${enrollmentId}, User ID: ${userId}`);

      const result = await ReenrollmentService.acceptReenrollment(parseInt(enrollmentId, 10), userId);

      res.status(200).json({
        success: true,
        message: 'Rematrícula aceita com sucesso!',
        data: result,
      });
    } catch (error) {
      logger.error(`[ReenrollmentController] Erro ao aceitar rematrícula: ${error.message}`);
      next(error);
    }
  }

  /**
   * Gera preview de contrato HTML para rematrícula do estudante
   *
   * GET /api/v1/reenrollments/contract-preview/:enrollmentId
   *
   * FLUXO:
   * 1. Extrai enrollmentId dos parâmetros da rota
   * 2. Extrai userId do token JWT (req.user.id)
   * 3. Chama ReenrollmentService.getReenrollmentContractPreview()
   * 4. Retorna HTML renderizado do contrato
   *
   * VALIDAÇÕES:
   * - enrollmentId: número inteiro obrigatório (via URL params)
   * - Validação de ownership: estudante deve ser dono do enrollment (no service)
   * - Validação de status: enrollment deve estar 'pending' (no service)
   * - Template ativo deve existir (no service)
   *
   * SEGURANÇA:
   * - Requer autenticação JWT (middleware authenticate)
   * - Requer role 'student' (middleware rbac(['student']))
   * - Valida ownership no service (apenas dono do enrollment pode visualizar)
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * GET /api/v1/reenrollments/contract-preview/5
   * Authorization: Bearer <jwt_token>
   *
   * Response 200:
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
   * Response 422 (enrollment não está pending):
   * {
   *   "success": false,
   *   "error": "Esta matrícula não está pendente de aceite (status atual: active)"
   * }
   *
   * Response 422 (sem template):
   * {
   *   "success": false,
   *   "error": "Nenhum template de contrato disponível. Entre em contato com a administração."
   * }
   */
  async previewContract(req, res, next) {
    try {
      const enrollmentId = parseInt(req.params.enrollmentId, 10);
      const studentUserId = req.user.id; // Extraído do token JWT pelo middleware authenticate

      // Validar que enrollmentId é um número válido
      if (isNaN(enrollmentId)) {
        logger.warn(
          `[ReenrollmentController] enrollmentId inválido fornecido: ${req.params.enrollmentId}`
        );
        return res.status(400).json({
          success: false,
          error: 'enrollmentId deve ser um número válido',
        });
      }

      logger.info(
        `[ReenrollmentController] Gerando preview de contrato - Enrollment ID: ${enrollmentId}, User ID: ${studentUserId}`
      );

      // Chamar service para gerar preview
      const result = await ReenrollmentService.getReenrollmentContractPreview(
        enrollmentId,
        studentUserId
      );

      logger.info(
        `[ReenrollmentController] Preview de contrato gerado com sucesso - Enrollment ID: ${enrollmentId}`
      );

      // Retornar resposta de sucesso
      return res.status(200).json({
        success: true,
        data: {
          contractHTML: result.contractHTML,
          enrollmentId: result.enrollmentId,
          semester: result.semester,
          year: result.year,
        },
      });
    } catch (error) {
      logger.error(
        `[ReenrollmentController] Erro ao gerar preview de contrato: ${error.message}`
      );
      next(error);
    }
  }
}

module.exports = new ReenrollmentController();
