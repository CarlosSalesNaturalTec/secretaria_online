/**
 * Arquivo: backend/src/routes/course.routes.js
 * Descrição: Rotas para o CRUD de curso.
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorizeAdmin);

router.post('/', CourseController.create);
router.get('/', CourseController.list);
router.get('/:id', CourseController.getById);
router.put('/:id', CourseController.update);
router.delete('/:id', CourseController.delete);

// Rotas para vincular/desvincular disciplinas
router.post('/:id/disciplines', CourseController.addDisciplineToCourse);
router.delete('/:id/disciplines/:disciplineId', CourseController.removeDisciplineFromCourse);

module.exports = router;
