/**
 * Arquivo: backend/src/routes/discipline.routes.js
 * Descrição: Rotas para o CRUD de Disciplina.
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const express = require('express');
const router = express.Router();
const DisciplineController = require('../controllers/discipline.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin, authorizeTeacher } = require('../middlewares/rbac.middleware');
const { disciplineValidationRules, handleValidationErrors } = require('../middlewares/validation.middleware');

router.use(authMiddleware);

// Rotas de listagem: Admin e Professor
router.get('/', authorizeTeacher, DisciplineController.list);
router.get('/:id', authorizeTeacher, DisciplineController.getById);

// Rotas de CRUD: Apenas Admin
router.post('/', authorizeAdmin, disciplineValidationRules(), handleValidationErrors, DisciplineController.create);
router.put('/:id', authorizeAdmin, disciplineValidationRules(), handleValidationErrors, DisciplineController.update);
router.delete('/:id', authorizeAdmin, DisciplineController.delete);

module.exports = router;
