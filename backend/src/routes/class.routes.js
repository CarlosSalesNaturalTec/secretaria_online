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
const { authorizeAdmin, authorizeTeacher } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// Rotas de listagem: Admin e Professor
router.get('/', authorizeTeacher, ClassController.list);
router.get('/:id', authorizeTeacher, ClassController.getById);

// Rotas de CRUD: Apenas Admin
router.post('/', authorizeAdmin, ClassController.create);
router.put('/:id', authorizeAdmin, ClassController.update);
router.delete('/:id', authorizeAdmin, ClassController.delete);

// Rotas para vincular/desvincular professores e disciplinas (Apenas Admin)
router.post('/:id/teachers/:teacherId/discipline/:disciplineId', authorizeAdmin, ClassController.addTeacherToClass);
router.delete(
  '/:id/teachers/:teacherId/discipline/:disciplineId',
  authorizeAdmin,
  ClassController.removeTeacherFromClass
);

// Rotas para vincular/desvincular alunos (Apenas Admin)
router.post('/:id/students/:studentId', authorizeAdmin, ClassController.addStudentToClass);
router.delete('/:id/students/:studentId', authorizeAdmin, ClassController.removeStudentFromClass);

// Rotas para listar alunos e professores (Admin e Professor)
router.get('/:id/students', authorizeTeacher, ClassController.getStudentsByClass);
router.get('/:id/teachers', authorizeTeacher, ClassController.getTeachersByClass);

module.exports = router;
