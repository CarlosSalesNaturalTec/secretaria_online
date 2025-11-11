
/**
 * Arquivo: backend/src/services/auth.service.js
 * Descrição: Lógica de negócio para autenticação de usuários.
 * Feature: [feat-018] - Criar AuthService com lógica de autenticação
 * Criado em: 27/10/2025
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { jwtConfig } = require('../config/auth');

class AuthService {
  /**
   * Autentica um usuário e retorna um token JWT.
   * @param {string} login - O login do usuário.
   * @param {string} password - A senha do usuário.
   * @returns {Promise<{user: User, token: string}>} - O usuário e o token JWT.
   * @throws {Error} - Se o usuário não for encontrado ou a senha estiver incorreta.
   */
  async login(login, password) {
    const user = await User.scope('withPassword').findOne({ where: { login } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Senha inválida');
    }

    /**
     * FIX: [secretOrPrivateKey must have a value]
     * 
     * Problema: [A configuração do JWT estava sendo importada incorretamente. `authConfig.secret` era undefined.]
     * Solução: [Desestruturar `jwtConfig` do `require('../config/auth')` e usar `jwtConfig.secret` e `jwtConfig.accessExpiresIn`.]
     * Data: [2025-10-27]
     */
    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.accessExpiresIn,
    });

    return { user, token };
  }

  /**
   * Gera um novo token JWT a partir de um token válido.
   * @param {string} token - O token JWT a ser atualizado.
   * @returns {Promise<string>} - Um novo token JWT.
   * @throws {Error} - Se o token for inválido.
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, jwtConfig.secret, {
        expiresIn: jwtConfig.accessExpiresIn,
      });
      return newToken;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Altera a senha de um usuário.
   * @param {number} userId - O ID do usuário.
   * @param {string} oldPassword - A senha antiga do usuário.
   * @param {string} newPassword - A nova senha do usuário.
   * @returns {Promise<void>}
   * @throws {Error} - Se o usuário não for encontrado ou a senha antiga estiver incorreta.
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.scope('withPassword').findByPk(userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Senha antiga inválida');
    }

    user.password = newPassword;
    await user.save();
  }

  /**
   * Valida um token JWT.
   * @param {string} token - O token JWT a ser validado.
   * @returns {Promise<object>} - O payload do token decodificado.
   * @throws {Error} - Se o token for inválido.
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

module.exports = new AuthService();
