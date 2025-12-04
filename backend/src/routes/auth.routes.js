/**
 * Arquivo: backend/src/routes/auth.routes.js
 * Descrição: Rotas de autenticação.
 * Feature: [feat-019] - Criar AuthController e rotas de autenticação
 * Atualização: [feat-022] - Implementar rate limiting para login
 * Criado em: 27/10/2025
 */

const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { loginRateLimiter, passwordChangeRateLimiter } = require('../middlewares/rateLimiter.middleware');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/auth/login
 *
 * Endpoint de autenticação de usuários.
 * Protegido por rate limiting: máximo 5 tentativas por IP em 15 minutos.
 *
 * @route POST /auth/login
 * @access Public
 * @middleware loginRateLimiter - Proteção contra força bruta
 */
router.post('/login', loginRateLimiter, AuthController.login);

/**
 * POST /api/auth/logout
 *
 * Endpoint de logout de usuários.
 *
 * @route POST /auth/logout
 * @access Public
 */
router.post('/logout', AuthController.logout);

/**
 * POST /api/auth/refresh-token
 *
 * Endpoint de renovação de token de acesso.
 *
 * @route POST /auth/refresh-token
 * @access Public
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * POST /api/auth/change-password
 *
 * Endpoint de mudança de senha.
 * Protegido por rate limiting: máximo 3 tentativas por IP em 60 minutos.
 * Requer autenticação via JWT.
 *
 * @route POST /auth/change-password
 * @access Private
 * @middleware authenticate - Validação do token JWT
 * @middleware passwordChangeRateLimiter - Proteção contra tentativas excessivas
 */
router.post('/change-password', authenticate, passwordChangeRateLimiter, AuthController.changePassword);

module.exports = router;
