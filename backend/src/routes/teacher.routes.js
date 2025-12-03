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
      .optional({ nullable: true })
      .custom((value) => {
        // Aceita null ou undefined (campo vazio)
        if (value === null || value === undefined) return true;
        // Se tiver valor, apenas valida o tamanho máximo
        return value.trim().length <= 200;
      })
      .withMessage('O nome deve ter no máximo 200 caracteres.'),
    body('email')
      .optional({ nullable: true })
      .custom((value) => {
        // Aceita null ou undefined (campo vazio)
        if (value === null || value === undefined) return true;
        // Se tiver valor, valida o formato
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      })
      .withMessage('Email inválido.'),
    body('cpf')
      .optional({ nullable: true })
      .custom((value) => {
        // Aceita null ou undefined (campo vazio)
        if (value === null || value === undefined) return true;
        // Se tiver valor, valida com validateCPF
        return validateCPF(value);
      })
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
    body('nome')
      .optional({ nullable: true })
      .custom((value) => {
        // Aceita null ou undefined (para limpar o campo)
        if (value === null || value === undefined) return true;
        // Se tiver valor, valida apenas o tamanho máximo
        return value.trim().length <= 200;
      })
      .withMessage('O nome deve ter no máximo 200 caracteres.'),
    body('email')
      .optional({ nullable: true })
      .custom((value) => {
        // Aceita null ou undefined (para limpar o campo)
        if (value === null || value === undefined) return true;
        // Se tiver valor, valida o formato
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      })
      .withMessage('Email inválido.'),
    body('cpf')
      .optional({ nullable: true })
      .custom((value) => {
        // Aceita null ou undefined (para limpar o campo)
        if (value === null || value === undefined) return true;
        // Se tiver valor, valida com validateCPF
        return validateCPF(value);
      })
      .withMessage('CPF inválido.'),
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
