/**
 * Arquivo: backend/src/routes/index.js
 * Descrição: Agregador de rotas.
 * Feature: [feat-019] - Criar AuthController e rotas de autenticação
 * Criado em: 27/10/2025
 */

const express = require('express');
const authRoutes = require('./auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);

module.exports = router;
