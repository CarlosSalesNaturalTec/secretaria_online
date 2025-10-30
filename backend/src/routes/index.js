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

module.exports = router;
