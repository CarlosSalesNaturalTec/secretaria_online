/**
 * Arquivo: backend/src/middlewares/rateLimiter.middleware.js
 * Descrição: Middleware de rate limiting para proteção contra ataques de força bruta
 * Feature: feat-022 - Implementar rate limiting para login
 * Criado em: 2025-10-27
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para tentativas de login
 *
 * Protege o endpoint de login contra ataques de força bruta
 * limitando a quantidade de tentativas por endereço IP.
 *
 * Configuração:
 * - Janela de tempo: 15 minutos
 * - Máximo de tentativas: 5
 * - Identificação: Por endereço IP
 *
 * Comportamento:
 * - Retorna 429 (Too Many Requests) quando o limite é excedido
 * - Headers de resposta incluem informações sobre o limite
 * - Contador é resetado após a janela de tempo
 *
 * @type {Function}
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos em milissegundos
  max: 5, // Limite de 5 requisições por windowMs

  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
    }
  },

  // Headers personalizados na resposta
  standardHeaders: true, // Retorna informações de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`

  // Função para gerar a chave de identificação (por IP)
  keyGenerator: (req) => {
    // Considera proxy reverso (Nginx, etc)
    return req.ip || req.connection.remoteAddress;
  },

  // Handler customizado quando o limite é excedido
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
      },
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // Tempo em segundos até o reset
    });
  },

  // Skip de rate limiting para ambientes de teste (opcional)
  skip: (req) => {
    // Em ambiente de teste, pode-se pular o rate limiting
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * Rate limiter genérico para outras rotas sensíveis
 *
 * Configuração mais permissiva para rotas que não são de autenticação
 * mas ainda precisam de alguma proteção.
 *
 * - Janela de tempo: 15 minutos
 * - Máximo de tentativas: 100
 *
 * @type {Function}
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por windowMs

  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    }
  },

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },

  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * Rate limiter estrito para rotas de mudança de senha
 *
 * Proteção mais rigorosa para operações de segurança críticas.
 *
 * - Janela de tempo: 60 minutos
 * - Máximo de tentativas: 3
 *
 * @type {Function}
 */
const passwordChangeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutos
  max: 3, // 3 requisições por windowMs

  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas de alteração de senha. Por favor, tente novamente em 1 hora.',
    }
  },

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },

  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
});

module.exports = {
  loginRateLimiter,
  generalRateLimiter,
  passwordChangeRateLimiter,
};
