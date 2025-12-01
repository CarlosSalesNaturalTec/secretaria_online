/**
 * Arquivo: backend/src/routes/student.routes.js
 * Descrição: Rotas para o CRUD de estudantes.
 * Feature: feat-030 - Criar StudentController e StudentService
 * Criado em: 28/10/2025
 */

const express = require('express');
const { body, param } = require('express-validator');
const StudentController = require('../controllers/student.controller');
const EnrollmentController = require('../controllers/enrollment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { validateCPF } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

// Rotas que requerem admin
router.post(
  '/',
  authorizeAdmin,
  [
    // Campos básicos para a tabela students (todos opcionais mas recomendados)
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
    body('data_nascimento')
      .optional()
      .trim(),
    body('sexo')
      .optional()
      .isInt({ min: 1, max: 2 })
      .withMessage('Sexo deve ser 1 (masculino) ou 2 (feminino).'),
    body('celular')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Celular deve ter no máximo 20 caracteres.'),
    body('telefone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Telefone deve ter no máximo 20 caracteres.'),
  ],
  handleValidationErrors,
  StudentController.create
);

router.get(
  '/',
  authorizeAdmin,
  StudentController.getAll
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  StudentController.getById
);

router.put(
  '/:id',
  authorizeAdmin,
  [
    param('id').isInt().withMessage('ID inválido.'),
    body('name').optional().notEmpty().withMessage('O nome é obrigatório.'),
    body('email').optional().isEmail().withMessage('Email inválido.'),
    body('cpf').optional().custom(validateCPF).withMessage('CPF inválido.'),
  ],
  handleValidationErrors,
  StudentController.update
);

router.delete(
  '/:id',
  authorizeAdmin,
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  StudentController.delete
);

router.post(
  '/:id/reset-password',
  authorizeAdmin,
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  StudentController.resetPassword
);

// Criar usuário para estudante
router.post(
  '/:id/create-user',
  authorizeAdmin,
  [
    param('id').isInt().withMessage('ID inválido.'),
    body('login')
      .optional()
      .trim()
      .isAlphanumeric()
      .withMessage('O login deve conter apenas letras e números.')
      .isLength({ min: 3, max: 100 })
      .withMessage('O login deve ter entre 3 e 100 caracteres.'),
  ],
  handleValidationErrors,
  StudentController.createUser
);

// Verificar se estudante possui usuário
router.get(
  '/:id/check-user',
  authorizeAdmin,
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  StudentController.checkUser
);

// Rotas de matrículas do aluno (requer autenticação mas não necessariamente admin)
router.get(
  '/:studentId/enrollments',
  [param('studentId').isInt({ min: 1 }).withMessage('studentId deve ser um inteiro positivo')],
  handleValidationErrors,
  EnrollmentController.getByStudent
);

module.exports = router;
