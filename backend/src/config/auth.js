/**
 * Arquivo: backend/src/config/auth.js
 * Descrição: Configurações de autenticação JWT e segurança
 * Feature: feat-017 - Configurar JWT e bcrypt
 * Criado em: 2025-10-27
 */

/**
 * Configurações de autenticação e JWT
 *
 * Responsabilidades:
 * - Centralizar configurações de JWT (secret, expiração)
 * - Definir configurações de bcrypt
 * - Fornecer configurações de segurança reutilizáveis
 *
 * @example
 * const { jwtConfig } = require('./config/auth');
 * const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.accessExpiresIn });
 */

require('dotenv').config();

/**
 * Validação de variáveis de ambiente obrigatórias
 */
const requiredEnvVars = ['JWT_SECRET', 'JWT_ACCESS_EXPIRATION', 'JWT_REFRESH_EXPIRATION'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`[AUTH CONFIG] Variável de ambiente obrigatória não definida: ${envVar}`);
  }
}

/**
 * Configurações do JWT (JSON Web Token)
 */
const jwtConfig = {
  /**
   * Chave secreta para assinar tokens JWT
   * IMPORTANTE: Esta chave deve ser mantida em segredo e nunca commitada no código
   */
  secret: process.env.JWT_SECRET,

  /**
   * Tempo de expiração do access token
   * Valores aceitos: '15m', '1h', '2d' (formato ms library)
   * Recomendado: 15 minutos para maior segurança
   */
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',

  /**
   * Tempo de expiração do refresh token
   * Valores aceitos: '7d', '30d', '90d'
   * Recomendado: 7 dias para balancear segurança e usabilidade
   */
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',

  /**
   * Algoritmo de assinatura do token
   */
  algorithm: 'HS256',

  /**
   * Issuer do token (emissor)
   */
  issuer: 'secretaria-online',

  /**
   * Audience do token (público-alvo)
   */
  audience: 'secretaria-online-users',
};

/**
 * Configurações do bcrypt para hash de senhas
 */
const bcryptConfig = {
  /**
   * Número de rounds de salt para bcrypt
   * Quanto maior o número, mais seguro mas também mais lento
   * Recomendado: 10 (bom equilíbrio entre segurança e performance)
   */
  saltRounds: 10,
};

/**
 * Configurações de senha provisória
 */
const passwordConfig = {
  /**
   * Tamanho da senha provisória gerada
   */
  provisionalPasswordLength: 8,

  /**
   * Caracteres permitidos na geração de senha provisória
   * Inclui letras maiúsculas, minúsculas e números
   */
  allowedCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',

  /**
   * Tempo de expiração de senha provisória (em dias)
   * Após este período, usuário deve solicitar nova senha
   */
  provisionalPasswordExpirationDays: 30,
};

/**
 * Configurações de segurança gerais
 */
const securityConfig = {
  /**
   * Número máximo de tentativas de login falhadas
   */
  maxLoginAttempts: 5,

  /**
   * Tempo de bloqueio após exceder tentativas (em minutos)
   */
  lockoutDurationMinutes: 15,
};

module.exports = {
  jwtConfig,
  bcryptConfig,
  passwordConfig,
  securityConfig,
};
