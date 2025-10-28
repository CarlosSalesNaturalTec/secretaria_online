/**
 * Arquivo: backend/src/routes/auth.routes.js
 * Descrição: Rotas de autenticação.
 * Feature: [feat-019] - Criar AuthController e rotas de autenticação
 * Criado em: 27/10/2025
 */

const express = require('express');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/change-password', AuthController.changePassword);

module.exports = router;
