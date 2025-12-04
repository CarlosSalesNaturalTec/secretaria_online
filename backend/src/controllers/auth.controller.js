/**
 * Arquivo: backend/src/controllers/auth.controller.js
 * Descrição: Controller para autenticação de usuários.
 * Feature: [feat-019] - Criar AuthController e rotas de autenticação
 * Criado em: 27/10/2025
 */

const AuthService = require('../services/auth.service');

class AuthController {
  /**
   * Realiza o login de um usuário.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @returns {Promise<import('express').Response>} A resposta da requisição.
   */
  async login(req, res) {
    try {
      const { login, password } = req.body;
      const data = await AuthService.login(login, password);
      return res.status(200).json(data);
    } catch (error) {
      console.error('[AuthController] Erro ao fazer login:', error);
      return res.status(401).json({ error: error.message });
    }
  }

  /**
   * Realiza o logout de um usuário.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @returns {Promise<import('express').Response>} A resposta da requisição.
   */
  async logout(req, res) {
    try {
      // TODO: Adicionar lógica de blacklist do token se necessário
      return res.status(200).json({ message: 'Logout realizado com sucesso.' });
    } catch (error) {
      console.error('[AuthController] Erro ao fazer logout:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  /**
   * Atualiza o token de acesso.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @returns {Promise<import('express').Response>} A resposta da requisição.
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const data = await AuthService.refreshToken(refreshToken);
      return res.status(200).json(data);
    } catch (error) {
      console.error('[AuthController] Erro ao atualizar token:', error);
      return res.status(401).json({ error: error.message });
    }
  }

  /**
   * Altera a senha de um usuário.
   * Requer autenticação via JWT (userId extraído do token).
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @returns {Promise<import('express').Response>} A resposta da requisição.
   */
  async changePassword(req, res) {
    try {
      // userId vem do token JWT decodificado (middleware authenticate)
      const userId = req.user?.id;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado.',
          },
        });
      }

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Senha atual e nova senha são obrigatórias.',
          },
        });
      }

      await AuthService.changePassword(userId, oldPassword, newPassword);
      return res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso.',
      });
    } catch (error) {
      console.error('[AuthController] Erro ao alterar senha:', error);
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_ERROR',
          message: error.message,
        },
      });
    }
  }
}

module.exports = new AuthController();
