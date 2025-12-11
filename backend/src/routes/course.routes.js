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
const { authorizeAdmin, authorizeTeacher } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// Rotas de listagem: Admin e Professor
router.get('/', authorizeTeacher, CourseController.list);
router.get('/:id', authorizeTeacher, CourseController.getById);

// Rotas de CRUD: Apenas Admin
router.post('/', authorizeAdmin, CourseController.create);
router.put('/:id', authorizeAdmin, CourseController.update);
router.delete('/:id', authorizeAdmin, CourseController.delete);

// Rotas para vincular/desvincular disciplinas
router.get('/:id/disciplines', authorizeTeacher, CourseController.getCourseDisciplines);
router.post('/:id/disciplines', authorizeAdmin, CourseController.addDisciplineToCourse);
router.delete('/:id/disciplines/:disciplineId', authorizeAdmin, CourseController.removeDisciplineFromCourse);

// Rota para buscar estudantes disponíveis (sem turma) em um curso
// IMPORTANTE: Esta rota deve vir ANTES de '/:id/students' para evitar conflito
router.get('/:id/students/available', authorizeTeacher, CourseController.getAvailableStudents);

// Rota para buscar estudantes matriculados em um curso
router.get('/:id/students', authorizeTeacher, CourseController.getCourseStudents);

module.exports = router;
