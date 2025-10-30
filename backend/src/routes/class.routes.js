/**
 * Arquivo: backend/src/routes/class.routes.js
 * Descrição: Rotas para o CRUD de Turma.
 * Feature: feat-035
 * Criado em: 28/10/2025
 */

const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/class.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorizeAdmin);

router.post('/', ClassController.create);
router.get('/', ClassController.list);
router.get('/:id', ClassController.getById);
router.put('/:id', ClassController.update);
router.delete('/:id', ClassController.delete);

// Rotas para vincular/desvincular professores e disciplinas
router.post('/:id/teachers/:teacherId/discipline/:disciplineId', ClassController.addTeacherToClass);
router.delete('/:id/teachers/:teacherId/discipline/:disciplineId', ClassController.removeTeacherFromClass);

module.exports = router;
