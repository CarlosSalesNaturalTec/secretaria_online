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

// Criar novo professor com validações
router.post(
  '/',
  [
    // Campos básicos (obrigatórios)
    body('name')
      .trim()
      .notEmpty()
      .withMessage('O nome é obrigatório.')
      .isLength({ min: 3, max: 255 })
      .withMessage('O nome deve ter entre 3 e 255 caracteres.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email inválido.')
      .notEmpty()
      .withMessage('O email é obrigatório.'),
    body('cpf')
      .trim()
      .custom(validateCPF)
      .withMessage('CPF inválido.'),
    body('rg')
      .trim()
      .notEmpty()
      .withMessage('O RG é obrigatório.')
      .isLength({ max: 20 })
      .withMessage('O RG deve ter no máximo 20 caracteres.'),
    body('login')
      .trim()
      .notEmpty()
      .withMessage('O login é obrigatório.')
      .isAlphanumeric()
      .withMessage('O login deve conter apenas letras e números.')
      .isLength({ min: 3, max: 100 })
      .withMessage('O login deve ter entre 3 e 100 caracteres.'),

    // Campos condicionais obrigatórios para professores
    body('voter_title')
      .trim()
      .notEmpty()
      .withMessage('O título de eleitor é obrigatório para professores.')
      .isLength({ max: 20 })
      .withMessage('O título de eleitor deve ter no máximo 20 caracteres.'),
    body('reservist')
      .trim()
      .notEmpty()
      .withMessage('O número de reservista é obrigatório para professores.')
      .isLength({ max: 20 })
      .withMessage('O número de reservista deve ter no máximo 20 caracteres.'),
    body('mother_name')
      .trim()
      .notEmpty()
      .withMessage('O nome da mãe é obrigatório para professores.')
      .isLength({ min: 3, max: 255 })
      .withMessage('O nome da mãe deve ter entre 3 e 255 caracteres.'),
    body('father_name')
      .trim()
      .notEmpty()
      .withMessage('O nome do pai é obrigatório para professores.')
      .isLength({ min: 3, max: 255 })
      .withMessage('O nome do pai deve ter entre 3 e 255 caracteres.'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('O endereço é obrigatório para professores.')
      .isLength({ min: 10 })
      .withMessage('O endereço deve ter no mínimo 10 caracteres.'),
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

module.exports = router;
