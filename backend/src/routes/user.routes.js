/**
 * Arquivo: backend/src/routes/user.routes.js
 * Descrição: Rotas para gerenciamento de usuários administrativos
 * Feature: feat-029 - Criar UserController e rotas básicas
 * Feature: feat-100 - Validações condicionais para usuários admin
 * Criado em: 2025-10-28
 * Atualizado em: 2025-11-08
 *
 * NOTA: Este arquivo é para gerenciamento de usuários ADMIN apenas.
 * Para criar alunos e professores, use /students e /teachers endpoints.
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const UserController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { validateStrongPassword } = require('../utils/validators');

/**
 * Regras de validação para criação de usuário ADMIN
 *
 * IMPORTANTE: Este é apenas para criar usuários admin.
 * A tabela users armazena apenas dados de autenticação.
 * Use /students ou /teachers endpoints para criar alunos e professores com dados completos.
 */
const createUserValidationRules = () => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Login deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Login deve conter apenas letras, números, pontos, underscores e hífens'),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6, max: 100 })
    .withMessage('Senha deve ter entre 6 e 100 caracteres'),
];

/**
 * Regras de validação para atualização de usuário
 */
const updateUserValidationRules = () => [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('login')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Login deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Login deve conter apenas letras, números, pontos, hífens ou underscores'),

  body('password')
    .optional()
    .custom(validateStrongPassword)
    .withMessage('Senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais'),

  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role deve ser: admin, teacher ou student'),
];

/**
 * Regras de validação para parâmetro ID
 */
const idParamValidationRules = () => [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
];

/**
 * Regras de validação para query parameters de listagem
 */
const listQueryValidationRules = () => [
  query('role')
    .optional()
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role deve ser: admin, teacher ou student'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Busca deve ter entre 1 e 255 caracteres'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
];

// ====================================
// ROTAS DE USUÁRIOS (TODAS PROTEGIDAS - ADMIN ONLY)
// ====================================

/**
 * @route   GET /api/users
 * @desc    Lista todos os usuários com filtros e paginação
 * @access  Private (Admin only)
 * @query   {string} [role] - Filtro por role (admin, teacher, student)
 * @query   {string} [search] - Busca por nome, email ou login
 * @query   {number} [page=1] - Página atual
 * @query   {number} [limit=10] - Itens por página
 */
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  listQueryValidationRules(),
  handleValidationErrors,
  UserController.list
);

/**
 * @route   GET /api/users/:id
 * @desc    Busca um usuário específico por ID
 * @access  Private (Admin only)
 * @param   {number} id - ID do usuário
 */
router.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  idParamValidationRules(),
  handleValidationErrors,
  UserController.getById
);

/**
 * @route   POST /api/users
 * @desc    Cria um novo usuário
 * @access  Private (Admin only)
 * @body    {Object} userData - Dados do usuário
 */
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  createUserValidationRules(),
  handleValidationErrors,
  UserController.create
);

/**
 * @route   PUT /api/users/:id
 * @desc    Atualiza um usuário existente
 * @access  Private (Admin only)
 * @param   {number} id - ID do usuário
 * @body    {Object} userData - Dados a atualizar
 */
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  updateUserValidationRules(),
  handleValidationErrors,
  UserController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Exclui um usuário (soft delete)
 * @access  Private (Admin only)
 * @param   {number} id - ID do usuário
 */
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  idParamValidationRules(),
  handleValidationErrors,
  UserController.delete
);

module.exports = router;
