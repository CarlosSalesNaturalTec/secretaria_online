/**
 * Arquivo: backend/src/routes/classDisciplineSchedule.routes.js
 * Descrição: Rotas para gerenciamento de horários das disciplinas da turma
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 */

const express = require('express');
const router = express.Router();
const ClassDisciplineScheduleController = require('../controllers/classDisciplineSchedule.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin, authorizeTeacher } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// Rotas de CRUD para horários
router.post('/', authorizeAdmin, ClassDisciplineScheduleController.create);
router.post('/bulk', authorizeAdmin, ClassDisciplineScheduleController.bulkCreate);
router.put('/:id', authorizeAdmin, ClassDisciplineScheduleController.update);
router.delete('/:id', authorizeAdmin, ClassDisciplineScheduleController.delete);

// Rota para listar horários por class_teacher
router.get('/class-teacher/:classTeacherId', authorizeTeacher, ClassDisciplineScheduleController.getSchedulesByClassTeacher);

module.exports = router;
