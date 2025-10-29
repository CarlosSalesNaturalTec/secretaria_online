/**
 * Arquivo: backend/src/routes/student.routes.js
 * Descrição: Rotas para o CRUD de estudantes.
 * Feature: feat-030 - Criar StudentController e StudentService
 * Criado em: 28/10/2025
 */

const express = require('express');
const { body, param } = require('express-validator');
const StudentController = require('../controllers/student.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { validateCPF } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware, authorizeAdmin);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('O nome é obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('cpf').custom(validateCPF).withMessage('CPF inválido.'),
    body('rg').notEmpty().withMessage('O RG é obrigatório.'),
    body('mother_name').notEmpty().withMessage('O nome da mãe é obrigatório.'),
    body('father_name').notEmpty().withMessage('O nome do pai é obrigatório.'),
    body('address').notEmpty().withMessage('O endereço é obrigatório.'),
    body('login').notEmpty().withMessage('O login é obrigatório.'),
  ],
  handleValidationErrors,
  StudentController.create
);

router.get('/', StudentController.getAll);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  StudentController.getById
);

router.put(
  '/:id',
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
  [param('id').isInt().withMessage('ID inválido.')],
  handleValidationErrors,
  StudentController.delete
);

module.exports = router;
