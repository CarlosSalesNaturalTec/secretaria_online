/**
 * Arquivo: backend/src/services/documentType.service.js
 * Descrição: Service para tipos de documentos
 * Feature: feat-XXX - Carregar tipos de documentos dinamicamente
 * Criado em: 2026-02-10
 *
 * Responsabilidades:
 * - Buscar tipos de documentos para dropdown
 * - Aplicar filtros por tipo de usuário
 * - Gerenciar lógica de negócio relacionada a tipos de documentos
 */

const { DocumentType } = require('../models');
const logger = require('../utils/logger');

/**
 * Service de DocumentType
 * Contém a lógica de negócio para tipos de documentos
 */
const DocumentTypeService = {
  /**
   * Lista todos os tipos de documentos ativos
   *
   * @param {Object} options - Opções de filtro
   * @param {string} options.userType - Tipo de usuário (student, teacher, both)
   * @returns {Promise<Object>} Lista de tipos de documentos
   * @throws {Error} Quando ocorre erro ao buscar tipos de documentos
   *
   * @example
   * const result = await DocumentTypeService.getAll({ userType: 'student' });
   */
  async getAll(options = {}) {
    try {
      const { userType } = options;

      const where = {
        deleted_at: null, // Apenas ativos
      };

      // Filtrar por tipo de usuário se especificado
      if (userType && ['student', 'teacher', 'both'].includes(userType)) {
        const { Op } = require('sequelize');
        where[Op.or] = [
          { user_type: userType },
          { user_type: 'both' }
        ];
      }

      const documentTypes = await DocumentType.findAll({
        where,
        attributes: ['id', 'name', 'description', 'user_type', 'is_required'],
        order: [['name', 'ASC']],
      });

      logger.info(`[DocumentTypeService] Listados ${documentTypes.length} tipos de documentos`);

      return {
        success: true,
        data: {
          documentTypes,
          total: documentTypes.length,
        },
      };
    } catch (error) {
      logger.error('[DocumentTypeService] Erro ao listar tipos de documentos:', error);
      throw new Error('Erro ao buscar tipos de documentos');
    }
  },

  /**
   * Busca tipos de documentos obrigatórios para alunos
   *
   * @returns {Promise<Object>} Lista de tipos de documentos obrigatórios
   * @throws {Error} Quando ocorre erro ao buscar
   *
   * @example
   * const result = await DocumentTypeService.getRequiredForStudents();
   */
  async getRequiredForStudents() {
    try {
      const documentTypes = await DocumentType.findRequiredForUserType('student');

      logger.info(`[DocumentTypeService] Encontrados ${documentTypes.length} tipos obrigatórios para alunos`);

      return {
        success: true,
        data: {
          documentTypes,
          total: documentTypes.length,
        },
      };
    } catch (error) {
      logger.error('[DocumentTypeService] Erro ao buscar tipos obrigatórios para alunos:', error);
      throw new Error('Erro ao buscar tipos de documentos obrigatórios');
    }
  },

  /**
   * Busca tipos de documentos obrigatórios para professores
   *
   * @returns {Promise<Object>} Lista de tipos de documentos obrigatórios
   * @throws {Error} Quando ocorre erro ao buscar
   *
   * @example
   * const result = await DocumentTypeService.getRequiredForTeachers();
   */
  async getRequiredForTeachers() {
    try {
      const documentTypes = await DocumentType.findRequiredForUserType('teacher');

      logger.info(`[DocumentTypeService] Encontrados ${documentTypes.length} tipos obrigatórios para professores`);

      return {
        success: true,
        data: {
          documentTypes,
          total: documentTypes.length,
        },
      };
    } catch (error) {
      logger.error('[DocumentTypeService] Erro ao buscar tipos obrigatórios para professores:', error);
      throw new Error('Erro ao buscar tipos de documentos obrigatórios');
    }
  },

  /**
   * Busca um tipo de documento por ID
   *
   * @param {number} id - ID do tipo de documento
   * @returns {Promise<Object>} Tipo de documento encontrado
   * @throws {Error} Quando tipo de documento não é encontrado
   *
   * @example
   * const result = await DocumentTypeService.findById(1);
   */
  async findById(id) {
    try {
      const documentType = await DocumentType.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!documentType) {
        throw new Error('Tipo de documento não encontrado');
      }

      logger.info(`[DocumentTypeService] Tipo de documento encontrado: ${documentType.name} (ID: ${id})`);

      return {
        success: true,
        data: {
          documentType,
        },
      };
    } catch (error) {
      logger.error(`[DocumentTypeService] Erro ao buscar tipo de documento (ID: ${id}):`, error);
      throw error;
    }
  },
};

module.exports = DocumentTypeService;
