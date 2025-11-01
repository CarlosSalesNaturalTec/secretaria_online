/**
 * Arquivo: backend/src/routes/index.js
 * Descrição: Agregador de rotas.
 * Feature: [feat-019] - Criar AuthController e rotas de autenticação
 * Atualizado em: 2025-10-28 (feat-029 - Adicionar rotas de usuários)
 * Criado em: 27/10/2025
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');
const courseRoutes = require('./course.routes');
const disciplineRoutes = require('./discipline.routes');
const classRoutes = require('./class.routes');
const enrollmentRoutes = require('./enrollment.routes');
const documentRoutes = require('./document.routes');
const contractRoutes = require('./contract.routes');
const evaluationRoutes = require('./evaluation.routes');
const gradeRoutes = require('./grade.routes');

const router = express.Router();

// Rotas de autenticação (públicas e privadas)
router.use('/auth', authRoutes);

// Rotas de gerenciamento de usuários (admin only)
router.use('/users', userRoutes);

// Rotas de gerenciamento de estudantes (admin only)
router.use('/students', studentRoutes);

// Rotas de gerenciamento de professores (admin only)
router.use('/teachers', teacherRoutes);

// Rotas de gerenciamento de Cursos (admin only)
router.use('/courses', courseRoutes);

// Rotas de gerenciamento de Disciplinas (admin only)
router.use('/disciplines', disciplineRoutes);

// Rotas de gerenciamento de Turmas (admin only)
router.use('/class', classRoutes);

// Rotas de gerenciamento de Matrículas (requer autenticação)
router.use('/enrollments', enrollmentRoutes);

// Rotas de gerenciamento de Documentos (feat-041, feat-042, feat-043)
router.use('/documents', documentRoutes);

// Rotas de gerenciamento de Contratos (feat-048, feat-049)
router.use('/contracts', contractRoutes);

// Rotas de gerenciamento de Avaliações (feat-051)
router.use('/evaluations', evaluationRoutes);

// Rotas de gerenciamento de Notas (feat-053)
router.use('/grades', gradeRoutes);

module.exports = router;
