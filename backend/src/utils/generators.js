/**
 * Arquivo: backend/src/utils/generators.js
 * Descrição: Utilitários para geração de senhas, tokens e hash
 * Feature: feat-017 - Configurar JWT e bcrypt
 * Criado em: 2025-10-27
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig, bcryptConfig, passwordConfig } = require('../config/auth');

/**
 * Utilitários para Geração e Validação de Segurança
 *
 * Responsabilidades:
 * - Gerar hash de senhas usando bcrypt
 * - Comparar senhas com hash
 * - Gerar tokens JWT (access e refresh)
 * - Verificar e decodificar tokens JWT
 * - Gerar senhas provisórias aleatórias
 */

// ============================================
// HASH DE SENHAS (BCRYPT)
// ============================================

/**
 * Gera hash de senha usando bcrypt
 *
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 * @throws {Error} Se a senha for inválida ou vazia
 *
 * @example
 * const hashedPassword = await hashPassword('minhasenha123');
 */
async function hashPassword(password) {
  try {
    // Validação de entrada
    if (!password || typeof password !== 'string') {
      throw new Error('Senha inválida: deve ser uma string não vazia');
    }

    if (password.length < 6) {
      throw new Error('Senha muito curta: mínimo de 6 caracteres');
    }

    // Gera hash da senha com salt rounds definido na config
    const hashedPassword = await bcrypt.hash(password, bcryptConfig.saltRounds);

    console.log('[GENERATORS] Hash de senha gerado com sucesso');
    return hashedPassword;
  } catch (error) {
    console.error('[GENERATORS] Erro ao gerar hash de senha:', error.message);
    throw error;
  }
}

/**
 * Compara senha em texto plano com hash armazenado
 *
 * @param {string} password - Senha em texto plano
 * @param {string} hashedPassword - Hash da senha armazenado
 * @returns {Promise<boolean>} True se a senha corresponde, false caso contrário
 * @throws {Error} Se os parâmetros forem inválidos
 *
 * @example
 * const isValid = await comparePassword('minhasenha123', hashedPasswordFromDB);
 * if (isValid) {
 *   console.log('Senha correta!');
 * }
 */
async function comparePassword(password, hashedPassword) {
  try {
    // Validação de entrada
    if (!password || typeof password !== 'string') {
      throw new Error('Senha inválida');
    }

    if (!hashedPassword || typeof hashedPassword !== 'string') {
      throw new Error('Hash inválido');
    }

    // Compara senha com hash
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {
      console.log('[GENERATORS] Senha validada com sucesso');
    } else {
      console.log('[GENERATORS] Senha inválida');
    }

    return isMatch;
  } catch (error) {
    console.error('[GENERATORS] Erro ao comparar senha:', error.message);
    throw error;
  }
}

// ============================================
// GERAÇÃO DE TOKENS JWT
// ============================================

/**
 * Gera um access token JWT
 *
 * @param {Object} payload - Dados do usuário a serem incluídos no token
 * @param {number} payload.id - ID do usuário
 * @param {string} payload.role - Role do usuário (admin, teacher, student)
 * @param {string} [payload.email] - Email do usuário (opcional)
 * @returns {string} Access token JWT assinado
 * @throws {Error} Se o payload for inválido
 *
 * @example
 * const token = generateAccessToken({ id: 1, role: 'student', email: 'aluno@email.com' });
 */
function generateAccessToken(payload) {
  try {
    // Validação de payload obrigatório
    if (!payload || !payload.id || !payload.role) {
      throw new Error('Payload inválido: id e role são obrigatórios');
    }

    // Validação de role permitida
    const allowedRoles = ['admin', 'teacher', 'student'];
    if (!allowedRoles.includes(payload.role)) {
      throw new Error(`Role inválida: deve ser uma de ${allowedRoles.join(', ')}`);
    }

    // Gera token com configurações definidas
    const token = jwt.sign(
      {
        id: payload.id,
        role: payload.role,
        email: payload.email || null,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.accessExpiresIn,
        algorithm: jwtConfig.algorithm,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }
    );

    console.log(`[GENERATORS] Access token gerado para usuário ID ${payload.id}`);
    return token;
  } catch (error) {
    console.error('[GENERATORS] Erro ao gerar access token:', error.message);
    throw error;
  }
}

/**
 * Gera um refresh token JWT
 *
 * @param {Object} payload - Dados do usuário a serem incluídos no token
 * @param {number} payload.id - ID do usuário
 * @returns {string} Refresh token JWT assinado
 * @throws {Error} Se o payload for inválido
 *
 * @example
 * const refreshToken = generateRefreshToken({ id: 1 });
 */
function generateRefreshToken(payload) {
  try {
    // Validação de payload obrigatório
    if (!payload || !payload.id) {
      throw new Error('Payload inválido: id é obrigatório');
    }

    // Gera refresh token (apenas com ID, sem role por segurança)
    const token = jwt.sign(
      { id: payload.id },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.refreshExpiresIn,
        algorithm: jwtConfig.algorithm,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }
    );

    console.log(`[GENERATORS] Refresh token gerado para usuário ID ${payload.id}`);
    return token;
  } catch (error) {
    console.error('[GENERATORS] Erro ao gerar refresh token:', error.message);
    throw error;
  }
}

// ============================================
// VERIFICAÇÃO E DECODIFICAÇÃO DE TOKENS
// ============================================

/**
 * Verifica e decodifica um token JWT
 *
 * @param {string} token - Token JWT a ser verificado
 * @returns {Object} Payload decodificado do token
 * @throws {Error} Se o token for inválido, expirado ou mal formatado
 *
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log('Usuário autenticado:', decoded.id);
 * } catch (error) {
 *   console.error('Token inválido:', error.message);
 * }
 */
function verifyToken(token) {
  try {
    // Validação de entrada
    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido: deve ser uma string não vazia');
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    console.log(`[GENERATORS] Token verificado com sucesso para usuário ID ${decoded.id}`);
    return decoded;
  } catch (error) {
    // Tratamento específico para erros de JWT
    if (error.name === 'TokenExpiredError') {
      console.warn('[GENERATORS] Token expirado:', error.message);
      throw new Error('Token expirado');
    }

    if (error.name === 'JsonWebTokenError') {
      console.warn('[GENERATORS] Token inválido:', error.message);
      throw new Error('Token inválido');
    }

    if (error.name === 'NotBeforeError') {
      console.warn('[GENERATORS] Token ainda não é válido:', error.message);
      throw new Error('Token ainda não é válido');
    }

    console.error('[GENERATORS] Erro ao verificar token:', error.message);
    throw error;
  }
}

/**
 * Decodifica um token JWT sem verificar assinatura
 * ATENÇÃO: Use apenas para inspeção, NUNCA para autenticação
 *
 * @param {string} token - Token JWT a ser decodificado
 * @returns {Object|null} Payload decodificado ou null se inválido
 *
 * @example
 * const payload = decodeToken(token);
 * console.log('Token expira em:', new Date(payload.exp * 1000));
 */
function decodeToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    console.error('[GENERATORS] Erro ao decodificar token:', error.message);
    return null;
  }
}

// ============================================
// GERAÇÃO DE SENHAS PROVISÓRIAS
// ============================================

/**
 * Gera uma senha provisória aleatória
 *
 * @param {number} [length] - Tamanho da senha (padrão: configuração)
 * @returns {string} Senha provisória gerada
 *
 * @example
 * const provisionalPassword = generateProvisionalPassword();
 * console.log('Senha provisória:', provisionalPassword); // Ex: "aB3xY9Zt"
 */
function generateProvisionalPassword(length = passwordConfig.provisionalPasswordLength) {
  try {
    const { allowedCharacters } = passwordConfig;
    let password = '';

    // Gera senha aleatória com caracteres permitidos
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
      password += allowedCharacters.charAt(randomIndex);
    }

    console.log('[GENERATORS] Senha provisória gerada com sucesso');
    return password;
  } catch (error) {
    console.error('[GENERATORS] Erro ao gerar senha provisória:', error.message);
    throw error;
  }
}

/**
 * Gera uma senha provisória aleatória e retorna tanto a senha em texto plano
 * quanto seu hash (útil para criar usuários)
 *
 * @param {number} [length] - Tamanho da senha
 * @returns {Promise<Object>} Objeto contendo password e hashedPassword
 *
 * @example
 * const { password, hashedPassword } = await generateProvisionalPasswordWithHash();
 * // Enviar 'password' por email ao usuário
 * // Salvar 'hashedPassword' no banco de dados
 */
async function generateProvisionalPasswordWithHash(length) {
  try {
    const password = generateProvisionalPassword(length);
    const hashedPassword = await hashPassword(password);

    return {
      password,
      hashedPassword,
    };
  } catch (error) {
    console.error('[GENERATORS] Erro ao gerar senha provisória com hash:', error.message);
    throw error;
  }
}

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Hash de senhas
  hashPassword,
  comparePassword,

  // Geração de tokens JWT
  generateAccessToken,
  generateRefreshToken,

  // Verificação de tokens JWT
  verifyToken,
  decodeToken,

  // Geração de senhas provisórias
  generateProvisionalPassword,
  generateProvisionalPasswordWithHash,
};
