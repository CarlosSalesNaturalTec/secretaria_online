/**
 * Arquivo: backend/src/routes/teacher.routes.js
 * Descrição: Rotas para o CRUD de professores.
 * Feature: feat-032 - Criar TeacherController, TeacherService e rotas
 * Criado em: 28/10/2025
 */

const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacher.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorizeAdmin);

router.post('/', TeacherController.create);
router.get('/', TeacherController.list);
router.get('/:id', TeacherController.getById);
router.put('/:id', TeacherController.update);
router.delete('/:id', TeacherController.delete);

module.exports = router;
