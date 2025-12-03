/**
 * Arquivo: backend/src/routes/teacher.routes.js
 * Descrição: Rotas para o CRUD de professores.
 * Feature: feat-032 - Criar TeacherController, TeacherService e rotas
 * Feature: feat-100 - Padronizar validações com campos condicionais
 * Criado em: 28/10/2025
 * Atualizado em: 2025-11-08
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const TeacherController = require('../controllers/teacher.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { validateCPF } = require('../utils/validators');

router.use(authMiddleware);
router.use(authorizeAdmin);

// Criar novo professor com validações (tabela teachers)
router.post(
  '/',
  [
    body('nome')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('O nome deve ter entre 3 e 200 caracteres.'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Email inválido.'),
    body('cpf')
      .optional()
      .trim()
      .custom(validateCPF)
      .withMessage('CPF inválido.'),
  ],
  handleValidationErrors,
  TeacherController.create
);

// Listar todos os professores
router.get('/', TeacherController.list);

// Buscar professor por ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  TeacherController.getById
);

// Atualizar professor
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID inválido.'),
    body('name').optional().notEmpty().withMessage('O nome é obrigatório.'),
    body('email').optional().isEmail().withMessage('Email inválido.'),
    body('cpf').optional().custom(validateCPF).withMessage('CPF inválido.'),
  ],
  handleValidationErrors,
  TeacherController.update
);

// Deletar professor
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  TeacherController.delete
);

// Criar usuário para professor
router.post(
  '/:id/create-user',
  [
    param('id').isInt().withMessage('ID inválido.'),
    body('login').optional().trim().isAlphanumeric().withMessage('Login deve conter apenas letras e números.'),
  ],
  handleValidationErrors,
  TeacherController.createUser
);

// Resetar senha do professor
router.post(
  '/:id/reset-password',
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  TeacherController.resetPassword
);

module.exports = router;
