/**
 * Arquivo: backend/src/controllers/contract.controller.js
 * Descrição: Controlador para gerenciamento de contratos - rotas e validações
 * Feature: feat-049 - Criar ContractController e rotas
 * Criado em: 2025-11-01
 *
 * RESPONSABILIDADES:
 * - Receber requisições HTTP de contratos
 * - Validar dados de entrada
 * - Delegar para ContractService
 * - Retornar respostas formatadas
 * - Tratar erros e exceções
 * - Implementar controle de acesso (admin/proprietário)
 *
 * ENDPOINTS:
 * - GET /contracts - Listar contratos (admin lista todos, aluno/professor lista seus)
 * - POST /contracts - Gerar novo contrato (admin only)
 * - POST /contracts/:id/accept - Aluno/professor aceita contrato
 * - GET /contracts/:id/pdf - Download do PDF do contrato
 *
 * @example
 * // Uso em rotas:
 * router.get('/contracts', authenticate, ContractController.list);
 * router.post('/contracts/:id/accept', authenticate, ContractController.acceptContract);
 */

'use strict';

const ContractService = require('../services/contract.service');
const PDFService = require('../services/pdf.service');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const path = require('path');

class ContractController {
  /**
   * Lista contratos com controle de acesso
   *
   * FLUXO:
   * 1. Se admin: lista todos os contratos ou filtra por usuário
   * 2. Se aluno/professor: lista apenas seus próprios contratos
   * 3. Suporta filtros por status (pending, accepted)
   * 4. Suporta paginação (limit, offset)
   *
   * PARÂMETROS (query):
   * - userId: (opcional) ID do usuário para admin filtrar
   * - status: (opcional) 'pending' ou 'accepted'
   * - limit: (opcional) quantidade de registros (padrão: 10)
   * - offset: (opcional) offset para paginação (padrão: 0)
   *
   * @route GET /api/contracts
   * @access Private (admin/teacher/student)
   * @middleware authenticate - Verifica token JWT
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.user - Usuário autenticado (injetado por middleware)
   * @param {number} req.user.id - ID do usuário
   * @param {string} req.user.role - Perfil do usuário
   * @param {Object} req.query - Parâmetros de query
   *
   * @returns {Object} Resposta com lista de contratos
   * @returns {boolean} .success - Sempre true
   * @returns {Array} .data - Lista de contratos
   * @returns {Object} .pagination - Informações de paginação
   * @returns {number} .pagination.total - Total de registros
   * @returns {number} .pagination.limit - Limit usado
   * @returns {number} .pagination.offset - Offset usado
   *
   * @example
   * GET /api/contracts
   * // Retorna contratos do usuário autenticado
   *
   * GET /api/contracts?userId=123 (admin only)
   * // Retorna contratos do usuário 123
   *
   * GET /api/contracts?status=pending
   * // Retorna apenas contratos pendentes do usuário
   */
  async list(req, res, next) {
    const logContext = '[ContractController.list]';
    logger.debug(`${logContext} Buscando contratos`, {
      userId: req.user.id,
      role: req.user.role,
      query: req.query,
    });

    try {
      const { userId, status, limit = 10, offset = 0 } = req.query;

      // Determinar qual usuário buscar
      // Admin pode buscar contratos de qualquer usuário, outros apenas seus
      let targetUserId = req.user.id;
      if (userId && req.user.role === 'admin') {
        targetUserId = parseInt(userId);
      } else if (userId && req.user.role !== 'admin') {
        // Aluno/professor tentando listar contratos de outro usuário
        logger.warn(`${logContext} Acesso negado - usuário ${req.user.id} tentando listar contratos de ${userId}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para listar contratos de outro usuário',
          },
        });
      }

      // Buscar contratos
      let contracts = [];

      if (status === 'pending') {
        contracts = await ContractService.getPendingByUser(targetUserId);
      } else if (status === 'accepted') {
        contracts = await ContractService.getAcceptedByUser(targetUserId);
      } else {
        contracts = await ContractService.getAllByUser(targetUserId);
      }

      // Aplicar paginação
      const total = contracts.length;
      const paginatedContracts = contracts.slice(offset, offset + parseInt(limit));

      logger.info(`${logContext} Contratos listados com sucesso`, {
        userId: targetUserId,
        total,
        returned: paginatedContracts.length,
      });

      return res.json({
        success: true,
        data: paginatedContracts,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera um novo contrato para um usuário
   *
   * FLUXO:
   * 1. Validar que usuário é admin
   * 2. Validar userId e userType obrigatórios
   * 3. Delegar para ContractService.generateContract
   * 4. Retornar contrato criado
   *
   * BODY (JSON):
   * {
   *   "userId": 123,        // ID do usuário (aluno/professor)
   *   "userType": "student", // 'student' ou 'teacher'
   *   "semester": 1,        // (opcional) semestre
   *   "year": 2025,         // (opcional) ano
   *   "templateId": 1       // (opcional) ID do template
   * }
   *
   * @route POST /api/contracts
   * @access Private (admin only)
   * @middleware authenticate, authorize('admin')
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.body - Dados do contrato a gerar
   * @param {number} req.body.userId - ID do usuário
   * @param {string} req.body.userType - Tipo de usuário ('student' ou 'teacher')
   * @param {number} [req.body.semester] - Semestre
   * @param {number} [req.body.year] - Ano
   * @param {number} [req.body.templateId] - ID do template
   *
   * @returns {Object} Resposta com contrato gerado
   * @returns {boolean} .success - Sempre true
   * @returns {Object} .data - Dados do contrato
   * @returns {string} .message - Mensagem de sucesso
   *
   * @throws {400} Se userId ou userType faltam
   * @throws {403} Se usuário não é admin
   * @throws {404} Se usuário ou template não encontrado
   * @throws {422} Se template não disponível
   *
   * @example
   * POST /api/contracts
   * {
   *   "userId": 5,
   *   "userType": "student",
   *   "semester": 1,
   *   "year": 2025
   * }
   */
  async generateContract(req, res, next) {
    const logContext = '[ContractController.generateContract]';
    logger.debug(`${logContext} Gerando novo contrato`, {
      adminId: req.user.id,
      body: req.body,
    });

    try {
      const { userId, userType, semester, year, templateId } = req.body;

      // Validar dados obrigatórios
      if (!userId || !userType) {
        logger.warn(`${logContext} Dados obrigatórios faltando`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'userId e userType são obrigatórios',
          },
        });
      }

      // Validar userType
      if (!['student', 'teacher'].includes(userType)) {
        logger.warn(`${logContext} userType inválido: ${userType}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'userType deve ser "student" ou "teacher"',
          },
        });
      }

      // Gerar contrato
      const contract = await ContractService.generateContract(userId, userType, {
        semester,
        year,
        templateId,
      });

      logger.info(`${logContext} Contrato gerado com sucesso`, {
        contractId: contract.id,
        userId,
        userType,
      });

      return res.status(201).json({
        success: true,
        data: contract,
        message: 'Contrato gerado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra o aceite de um contrato
   *
   * FLUXO:
   * 1. Extrair contractId dos parâmetros
   * 2. Validar que o usuário autenticado é o proprietário do contrato
   *    (ou é admin)
   * 3. Delegar para ContractService.acceptContract
   * 4. Registrar aceite no log
   * 5. Retornar contrato aceito
   *
   * @route POST /api/contracts/:id/accept
   * @access Private (proprietário do contrato ou admin)
   * @middleware authenticate
   *
   * @param {Object} req - Request do Express
   * @param {string} req.params.id - ID do contrato
   * @param {Object} req.user - Usuário autenticado
   *
   * @returns {Object} Resposta com contrato aceito
   * @returns {boolean} .success - Sempre true
   * @returns {Object} .data - Dados do contrato aceito
   * @returns {string} .message - Mensagem de sucesso
   *
   * @throws {404} Se contrato não encontrado
   * @throws {403} Se usuário não é proprietário e não é admin
   * @throws {422} Se contrato já foi aceito
   *
   * @example
   * POST /api/contracts/123/accept
   * // Aluno/professor aceita contrato ID 123
   */
  async acceptContract(req, res, next) {
    const logContext = '[ContractController.acceptContract]';
    logger.debug(`${logContext} Aceitando contrato`, {
      contractId: req.params.id,
      userId: req.user.id,
    });

    try {
      const contractId = parseInt(req.params.id);

      // Validar ID do contrato
      if (isNaN(contractId)) {
        logger.warn(`${logContext} ID de contrato inválido: ${req.params.id}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID do contrato deve ser um número',
          },
        });
      }

      // Buscar contrato para validar proprietário
      const contract = await ContractService.getById(contractId);

      // Verificar permissão
      if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
        logger.warn(`${logContext} Acesso negado - usuário ${req.user.id} tentando aceitar contrato de ${contract.user_id}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para aceitar este contrato',
          },
        });
      }

      // Registrar aceite
      const accepted = await ContractService.acceptContract(contractId, contract.user_id);

      logger.info(`${logContext} Contrato aceito com sucesso`, {
        contractId,
        userId: contract.user_id,
        acceptedAt: accepted.accepted_at,
      });

      return res.json({
        success: true,
        data: accepted,
        message: 'Contrato aceito com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download do arquivo PDF do contrato
   *
   * FLUXO:
   * 1. Extrair contractId dos parâmetros
   * 2. Buscar contrato no banco de dados
   * 3. Validar permissão (proprietário ou admin)
   * 4. Validar que arquivo existe
   * 5. Ler arquivo PDF do disco
   * 6. Retornar arquivo como download
   *
   * @route GET /api/contracts/:id/pdf
   * @access Private (proprietário do contrato ou admin)
   * @middleware authenticate
   *
   * @param {Object} req - Request do Express
   * @param {string} req.params.id - ID do contrato
   *
   * @returns {Buffer} Buffer do arquivo PDF
   * @returns {Headers} Content-Type: application/pdf
   * @returns {Headers} Content-Disposition: attachment; filename="..."
   *
   * @throws {404} Se contrato ou arquivo não encontrado
   * @throws {403} Se usuário não tem permissão
   *
   * @example
   * GET /api/contracts/123/pdf
   * // Download do arquivo PDF do contrato 123
   */
  async getPDF(req, res, next) {
    const logContext = '[ContractController.getPDF]';
    logger.debug(`${logContext} Buscando PDF do contrato`, {
      contractId: req.params.id,
      userId: req.user.id,
    });

    try {
      const contractId = parseInt(req.params.id);

      // Validar ID do contrato
      if (isNaN(contractId)) {
        logger.warn(`${logContext} ID de contrato inválido: ${req.params.id}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID do contrato deve ser um número',
          },
        });
      }

      // Buscar contrato
      const contract = await ContractService.getById(contractId);

      // Verificar permissão
      if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
        logger.warn(`${logContext} Acesso negado - usuário ${req.user.id} tentando baixar PDF de ${contract.user_id}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para baixar este arquivo',
          },
        });
      }

      // Validar que arquivo existe
      const filePath = path.resolve(process.cwd(), contract.file_path);
      const exists = await PDFService.pdfExists(filePath);

      if (!exists) {
        logger.warn(`${logContext} Arquivo PDF não encontrado: ${filePath}`);
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'Arquivo do contrato não encontrado',
          },
        });
      }

      // Ler arquivo
      const pdfBuffer = await PDFService.readPDF(filePath);

      logger.info(`${logContext} PDF baixado com sucesso`, {
        contractId,
        userId: req.user.id,
        fileSize: pdfBuffer.length,
      });

      // Configurar headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${contract.file_name}"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar arquivo
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca detalhes de um contrato específico
   *
   * @route GET /api/contracts/:id
   * @access Private (proprietário ou admin)
   * @middleware authenticate
   *
   * @param {Object} req - Request do Express
   * @param {string} req.params.id - ID do contrato
   *
   * @returns {Object} Dados completos do contrato
   *
   * @throws {404} Se contrato não encontrado
   * @throws {403} Se usuário não tem permissão
   *
   * @example
   * GET /api/contracts/123
   * // Retorna detalhes do contrato 123
   */
  async getById(req, res, next) {
    const logContext = '[ContractController.getById]';
    logger.debug(`${logContext} Buscando contrato por ID`, {
      contractId: req.params.id,
      userId: req.user.id,
    });

    try {
      const contractId = parseInt(req.params.id);

      // Validar ID do contrato
      if (isNaN(contractId)) {
        logger.warn(`${logContext} ID de contrato inválido: ${req.params.id}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID do contrato deve ser um número',
          },
        });
      }

      // Buscar contrato
      const contract = await ContractService.getById(contractId);

      // Verificar permissão
      if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
        logger.warn(`${logContext} Acesso negado - usuário ${req.user.id} tentando buscar contrato de ${contract.user_id}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para acessar este contrato',
          },
        });
      }

      logger.info(`${logContext} Contrato encontrado`, { contractId });

      return res.json({
        success: true,
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContractController();
