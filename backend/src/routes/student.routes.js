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

    // Campos condicionais obrigatórios para alunos
    body('voter_title')
      .trim()
      .notEmpty()
      .withMessage('O título de eleitor é obrigatório para alunos.')
      .isLength({ max: 20 })
      .withMessage('O título de eleitor deve ter no máximo 20 caracteres.'),
    body('reservist')
      .trim()
      .notEmpty()
      .withMessage('O número de reservista é obrigatório para alunos.')
      .isLength({ max: 20 })
      .withMessage('O número de reservista deve ter no máximo 20 caracteres.'),
    body('mother_name')
      .trim()
      .notEmpty()
      .withMessage('O nome da mãe é obrigatório para alunos.')
      .isLength({ min: 3, max: 255 })
      .withMessage('O nome da mãe deve ter entre 3 e 255 caracteres.'),
    body('father_name')
      .trim()
      .notEmpty()
      .withMessage('O nome do pai é obrigatório para alunos.')
      .isLength({ min: 3, max: 255 })
      .withMessage('O nome do pai deve ter entre 3 e 255 caracteres.'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('O endereço é obrigatório para alunos.')
      .isLength({ min: 10 })
      .withMessage('O endereço deve ter no mínimo 10 caracteres.'),
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

// Rotas de matrículas do aluno (requer autenticação mas não necessariamente admin)
router.get(
  '/:studentId/enrollments',
  [param('studentId').isInt({ min: 1 }).withMessage('studentId deve ser um inteiro positivo')],
  handleValidationErrors,
  EnrollmentController.getByStudent
);

module.exports = router;
