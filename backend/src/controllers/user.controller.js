/**
 * Arquivo: backend/src/controllers/user.controller.js
 * Descrição: Controller para gerenciamento de usuários administrativos
 * Feature: feat-029 - Criar UserController e rotas básicas
 * Criado em: 2025-10-28
 */

const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * UserController
 *
 * Responsabilidades:
 * - Gerenciar CRUD de usuários administrativos
 * - Validar dados de entrada
 * - Aplicar regras de negócio específicas para usuários
 * - Registrar operações críticas em logs
 *
 * @class UserController
 */
class UserController {
  /**
   * Lista todos os usuários com suporte a filtros e paginação
   *
   * @param {Object} req - Request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.role - Filtro por role (admin, teacher, student)
   * @param {string} req.query.search - Busca por nome, email ou login
   * @param {number} req.query.page - Página atual (default: 1)
   * @param {number} req.query.limit - Itens por página (default: 10)
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   * @returns {Promise<Object>} Lista de usuários com metadados de paginação
   */
  async list(req, res, next) {
    try {
      const {
        role,
        search,
        page = 1,
        limit = 10,
      } = req.query;

      // Construir filtros dinâmicos
      const where = {};

      // Filtro por role
      if (role && ['admin', 'teacher', 'student'].includes(role)) {
        where.role = role;
      }

      // Filtro de busca (nome, email ou login)
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { login: { [Op.like]: `%${search}%` } },
        ];
      }

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Buscar usuários com paginação
      const { count, rows: users } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']], // underscored: true no model usa snake_case
        attributes: { exclude: ['password_hash'] }, // Nunca retornar hash de senha (snake_case)
      });

      // Calcular metadados de paginação
      const totalPages = Math.ceil(count / limit);
      const currentPage = parseInt(page);

      logger.info('[UserController] Usuários listados', {
        userId: req.user.id,
        filters: { role, search },
        totalRecords: count,
        page: currentPage,
      });

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          currentPage,
          totalPages,
          totalRecords: count,
          recordsPerPage: parseInt(limit),
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      });
    } catch (error) {
      logger.error('[UserController] Erro ao listar usuários', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * Busca um usuário específico por ID
   *
   * @param {Object} req - Request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - ID do usuário
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   * @returns {Promise<Object>} Dados do usuário
   * @throws {Error} Se usuário não for encontrado
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] },
      });

      if (!user) {
        logger.warn('[UserController] Usuário não encontrado', {
          userId: id,
          requestedBy: req.user.id,
        });

        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado',
          },
        });
      }

      logger.info('[UserController] Usuário encontrado', {
        userId: id,
        requestedBy: req.user.id,
      });

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('[UserController] Erro ao buscar usuário', {
        userId: req.params.id,
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * Cria um novo usuário administrativo
   *
   * NOTA: Este método é especificamente para criar usuários admin.
   * Para criar alunos ou professores, use StudentService ou TeacherService.
   *
   * @param {Object} req - Request object
   * @param {Object} req.body - Dados do usuário
   * @param {string} req.body.name - Nome completo (obrigatório)
   * @param {string} req.body.email - Email (obrigatório)
   * @param {string} req.body.login - Login único (obrigatório)
   * @param {string} req.body.password - Senha (será hasheada, obrigatório)
   * @param {string} req.body.role - Role (deve ser 'admin' para este endpoint, obrigatório)
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   * @returns {Promise<Object>} Usuário criado
   * @throws {Error} Se email ou login já existirem ou dados obrigatórios faltarem
   */
  async create(req, res, next) {
    try {
      const {
        name,
        email,
        login,
        password,
        role = 'admin',
      } = req.body;

      // Validação: role deve ser 'admin' para este endpoint
      if (role !== 'admin') {
        logger.warn('[UserController] Tentativa de criar usuário não-admin via endpoint /users', {
          requestedRole: role,
          requestedBy: req.user.id,
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Este endpoint é apenas para criar usuários admin. Use /students ou /teachers para criar alunos ou professores.',
          },
        });
      }

      // Verificar se email já existe
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        logger.warn('[UserController] Tentativa de criar usuário com email duplicado', {
          email,
          requestedBy: req.user.id,
        });

        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email já cadastrado no sistema',
          },
        });
      }

      // Verificar se login já existe
      const existingLogin = await User.findOne({ where: { login } });
      if (existingLogin) {
        logger.warn('[UserController] Tentativa de criar usuário com login duplicado', {
          login,
          requestedBy: req.user.id,
        });

        return res.status(409).json({
          success: false,
          error: {
            code: 'LOGIN_ALREADY_EXISTS',
            message: 'Login já cadastrado no sistema',
          },
        });
      }

      // Criar usuário admin (password_hash será gerado automaticamente pelo hook do model)
      const user = await User.create({
        name,
        email,
        login,
        password, // Campo virtual - O hook beforeValidate irá hashear e definir password_hash
        role: 'admin',
      });

      // Remover password_hash da resposta (já é excluído pelo defaultScope, mas garantir)
      const userResponse = user.toJSON();
      delete userResponse.password_hash;

      logger.info('[UserController] Usuário admin criado com sucesso', {
        userId: user.id,
        role: user.role,
        createdBy: req.user.id,
      });

      return res.status(201).json({
        success: true,
        data: userResponse,
        message: 'Usuário admin criado com sucesso',
      });
    } catch (error) {
      logger.error('[UserController] Erro ao criar usuário admin', {
        error: error.message,
        stack: error.stack,
        requestedBy: req.user.id,
      });
      next(error);
    }
  }

  /**
   * Atualiza um usuário existente
   *
   * @param {Object} req - Request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - ID do usuário
   * @param {Object} req.body - Dados a atualizar
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   * @returns {Promise<Object>} Usuário atualizado
   * @throws {Error} Se usuário não for encontrado ou dados forem inválidos
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        login,
        password,
        role,
      } = req.body;

      // Buscar usuário
      const user = await User.findByPk(id);

      if (!user) {
        logger.warn('[UserController] Tentativa de atualizar usuário inexistente', {
          userId: id,
          requestedBy: req.user.id,
        });

        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado',
          },
        });
      }

      // Verificar duplicação de email (se alterado)
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'Email já cadastrado no sistema',
            },
          });
        }
      }

      // Verificar duplicação de login (se alterado)
      if (login && login !== user.login) {
        const existingLogin = await User.findOne({ where: { login } });
        if (existingLogin) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'LOGIN_ALREADY_EXISTS',
              message: 'Login já cadastrado no sistema',
            },
          });
        }
      }

      // Preparar dados para atualização
      const updateData = {
        ...(name && { name }),
        ...(email && { email }),
        ...(login && { login }),
        ...(role && { role }),
      };

      // Se senha foi informada, usar campo virtual (hook irá hashear)
      if (password) {
        updateData.password = password; // Campo virtual - hook beforeValidate irá processar
      }

      // Atualizar usuário
      await user.update(updateData);

      // Remover password_hash da resposta (já é excluído pelo defaultScope, mas garantir)
      const userResponse = user.toJSON();
      delete userResponse.password_hash;

      logger.info('[UserController] Usuário atualizado com sucesso', {
        userId: id,
        updatedBy: req.user.id,
        updatedFields: Object.keys(updateData),
      });

      return res.status(200).json({
        success: true,
        data: userResponse,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      logger.error('[UserController] Erro ao atualizar usuário', {
        userId: req.params.id,
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * Exclui um usuário (soft delete)
   *
   * @param {Object} req - Request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - ID do usuário
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   * @returns {Promise<Object>} Confirmação de exclusão
   * @throws {Error} Se usuário não for encontrado
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Buscar usuário
      const user = await User.findByPk(id);

      if (!user) {
        logger.warn('[UserController] Tentativa de deletar usuário inexistente', {
          userId: id,
          requestedBy: req.user.id,
        });

        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado',
          },
        });
      }

      // Impedir que o usuário delete a si mesmo
      if (parseInt(id) === req.user.id) {
        logger.warn('[UserController] Tentativa de auto-exclusão', {
          userId: id,
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'Você não pode excluir sua própria conta',
          },
        });
      }

      // Soft delete
      await user.destroy();

      logger.info('[UserController] Usuário excluído com sucesso', {
        userId: id,
        userRole: user.role,
        deletedBy: req.user.id,
      });

      return res.status(200).json({
        success: true,
        message: 'Usuário excluído com sucesso',
      });
    } catch (error) {
      logger.error('[UserController] Erro ao excluir usuário', {
        userId: req.params.id,
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

module.exports = new UserController();
