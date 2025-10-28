/**
 * Arquivo: backend/src/middlewares/auth.middleware.js
 * Descrição: Middleware para autenticação de rotas via JWT.
 * Feature: feat-020 - Criar middleware de autenticação JWT
 * Criado em: 27/10/2025
 */

const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/auth');

/**
 * Middleware para verificar o token JWT e autenticar o usuário.
 * Extrai o token do header 'Authorization', verifica sua validade
 * e anexa o payload decodificado (usuário) ao objeto de requisição.
 *
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 * @param {function} next - A função de callback para o próximo middleware.
 * @returns {void}
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_NOT_PROVIDED',
        message: 'Token de autenticação não fornecido.',
      },
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_MALFORMED',
        message: 'Token de autenticação malformado.',
      },
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_MALFORMED',
        message: 'Token de autenticação deve ser do tipo Bearer.',
      },
    });
  }

  /**
   * FIX: [Token válido sendo rejeitado com TOKEN_INVALID]
   *
   * Problema: authConfig.secret era undefined porque o import não estava desestruturado.
   *           O arquivo config/auth.js exporta { jwtConfig }, então o secret está em jwtConfig.secret.
   * Solução: Desestruturar { jwtConfig } no import e usar jwtConfig.secret ao verificar o token.
   * Data: 2025-10-27
   */
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // Anexa o payload do token (ex: { id: 1, role: 'student' })
    return next();
  } catch (error) {
    let code = 'TOKEN_INVALID';
    let message = 'Token de autenticação inválido.';

    if (error.name === 'TokenExpiredError') {
      code = 'TOKEN_EXPIRED';
      message = 'Token de autenticação expirado.';
    }

    return res.status(401).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }
};

module.exports = authenticate;
