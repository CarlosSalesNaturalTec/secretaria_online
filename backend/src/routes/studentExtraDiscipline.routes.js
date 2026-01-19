/**
 * Arquivo: backend/src/routes/studentExtraDiscipline.routes.js
 * Descrição: Rotas para gerenciamento de disciplinas extras de alunos
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 */

const express = require('express');
const router = express.Router();
const studentExtraDisciplineController = require('../controllers/studentExtraDiscipline.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin, authorizeAny } = require('../middlewares/rbac.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * Rotas de disciplinas extras por aluno
 * Base: /students/:studentId/extra-disciplines
 */

// GET /students/:studentId/extra-disciplines - Listar disciplinas extras de um aluno
// Acesso: Admin (qualquer aluno), Student (somente próprio)
router.get('/students/:studentId/extra-disciplines', authorizeAny, studentExtraDisciplineController.getByStudent);

// POST /students/:studentId/extra-disciplines - Vincular disciplina extra a um aluno
// Acesso: Apenas Admin
router.post('/students/:studentId/extra-disciplines', authorizeAdmin, studentExtraDisciplineController.create);

// GET /students/:studentId/full-schedule - Obter grade completa do aluno (turma + extras)
// Acesso: Admin (qualquer aluno), Student (somente próprio)
router.get('/students/:studentId/full-schedule', authorizeAny, studentExtraDisciplineController.getFullSchedule);

/**
 * Rotas de disciplinas extras individuais
 * Base: /extra-disciplines/:id
 */

// GET /extra-disciplines/:id - Obter disciplina extra por ID
// Acesso: Admin
router.get('/extra-disciplines/:id', authorizeAdmin, studentExtraDisciplineController.getById);

// PUT /extra-disciplines/:id - Atualizar disciplina extra
// Acesso: Apenas Admin
router.put('/extra-disciplines/:id', authorizeAdmin, studentExtraDisciplineController.update);

// DELETE /extra-disciplines/:id - Remover disciplina extra (soft delete)
// Acesso: Apenas Admin
router.delete('/extra-disciplines/:id', authorizeAdmin, studentExtraDisciplineController.delete);

/**
 * Rotas auxiliares
 */

// GET /disciplines/:disciplineId/extra-students - Listar alunos com esta disciplina como extra
// Acesso: Admin
router.get('/disciplines/:disciplineId/extra-students', authorizeAdmin, studentExtraDisciplineController.getByDiscipline);

module.exports = router;
