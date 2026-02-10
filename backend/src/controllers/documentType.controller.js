/**
 * Arquivo: backend/src/controllers/documentType.controller.js
 * Descrição: Controller para tipos de documentos
 * Feature: feat-XXX - Carregar tipos de documentos dinamicamente
 * Criado em: 2026-02-10
 *
 * Responsabilidades:
 * - Tratar requisições HTTP para tipos de documentos
 * - Validar parâmetros de entrada
 * - Chamar DocumentTypeService
 * - Retornar respostas HTTP formatadas
 */

const DocumentTypeService = require('../services/documentType.service');
const logger = require('../utils/logger');

/**
 * Controller de DocumentType
 * Gerencia requisições HTTP relacionadas a tipos de documentos
 */
const DocumentTypeController = {
  /**
   * GET /api/v1/document-types
   * Lista todos os tipos de documentos ativos
   *
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   * @returns {Promise<void>}
   *
   * Query params:
   * - userType (optional): student, teacher ou both
   *
   * @example
   * GET /api/v1/document-types?userType=student
   */
  async getAll(req, res, next) {
    try {
      const { userType } = req.query;

      // Validar userType se fornecido
      if (userType && !['student', 'teacher', 'both'].includes(userType)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER_TYPE',
            message: 'Tipo de usuário inválido. Use: student, teacher ou both',
          },
        });
      }

      const result = await DocumentTypeService.getAll({ userType });

      return res.status(200).json(result);
    } catch (error) {
      logger.error('[DocumentTypeController] Erro ao listar tipos de documentos:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/document-types/required/students
   * Lista tipos de documentos obrigatórios para alunos
   *
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   * @returns {Promise<void>}
   *
   * @example
   * GET /api/v1/document-types/required/students
   */
  async getRequiredForStudents(req, res, next) {
    try {
      const result = await DocumentTypeService.getRequiredForStudents();
      return res.status(200).json(result);
    } catch (error) {
      logger.error('[DocumentTypeController] Erro ao buscar tipos obrigatórios para alunos:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/document-types/required/teachers
   * Lista tipos de documentos obrigatórios para professores
   *
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   * @returns {Promise<void>}
   *
   * @example
   * GET /api/v1/document-types/required/teachers
   */
  async getRequiredForTeachers(req, res, next) {
    try {
      const result = await DocumentTypeService.getRequiredForTeachers();
      return res.status(200).json(result);
    } catch (error) {
      logger.error('[DocumentTypeController] Erro ao buscar tipos obrigatórios para professores:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/document-types/:id
   * Busca um tipo de documento por ID
   *
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   * @returns {Promise<void>}
   *
   * @example
   * GET /api/v1/document-types/1
   */
  async findById(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      const documentTypeId = parseInt(id, 10);
      if (isNaN(documentTypeId) || documentTypeId <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID inválido',
          },
        });
      }

      const result = await DocumentTypeService.findById(documentTypeId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Tipo de documento não encontrado') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }

      logger.error('[DocumentTypeController] Erro ao buscar tipo de documento:', error);
      next(error);
    }
  },
};

module.exports = DocumentTypeController;
