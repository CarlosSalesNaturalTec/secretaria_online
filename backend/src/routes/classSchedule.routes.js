/**
 * Arquivo: backend/src/routes/classSchedule.routes.js
 * Descrição: Rotas para gerenciamento de grade de horários das turmas
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 */

const express = require('express');
const router = express.Router();
const classScheduleController = require('../controllers/classSchedule.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin, authorizeTeacher, authorizeAny } = require('../middlewares/rbac.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * Rotas de horários por turma
 * Base: /classes/:classId/schedules
 */

// GET /classes/:classId/schedules - Listar horários de uma turma
// Acesso: Admin, Teacher, Student
router.get('/classes/:classId/schedules', authorizeAny, classScheduleController.getByClass);

// GET /classes/:classId/schedules/week - Obter grade completa da semana
// Acesso: Admin, Teacher, Student
router.get('/classes/:classId/schedules/week', authorizeAny, classScheduleController.getWeekSchedule);

// POST /classes/:classId/schedules - Criar novo horário
// Acesso: Apenas Admin
router.post('/classes/:classId/schedules', authorizeAdmin, classScheduleController.create);

// POST /classes/:classId/schedules/bulk - Criar múltiplos horários em lote
// Acesso: Apenas Admin
router.post('/classes/:classId/schedules/bulk', authorizeAdmin, classScheduleController.bulkCreate);

/**
 * Rotas de horários individuais
 * Base: /schedules/:id
 */

// GET /schedules/:id - Obter horário por ID
// Acesso: Admin, Teacher
router.get('/schedules/:id', authorizeTeacher, classScheduleController.getById);

// PUT /schedules/:id - Atualizar horário
// Acesso: Apenas Admin
router.put('/schedules/:id', authorizeAdmin, classScheduleController.update);

// DELETE /schedules/:id - Deletar horário (soft delete)
// Acesso: Apenas Admin
router.delete('/schedules/:id', authorizeAdmin, classScheduleController.delete);

module.exports = router;
