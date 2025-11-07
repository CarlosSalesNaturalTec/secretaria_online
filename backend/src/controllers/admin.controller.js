/**
 * Arquivo: backend/src/controllers/admin.controller.js
 * Descrição: Controller para funcionalidades administrativas e dashboard
 * Feature: feat-081 - Criar endpoint de estatísticas do dashboard admin
 * Criado em: 2025-11-07
 *
 * Responsabilidades:
 * - Receber requisições HTTP para endpoints administrativos
 * - Validar requisições
 * - Chamar services apropriados
 * - Retornar respostas formatadas
 */

const AdminService = require('../services/admin.service');

/**
 * Controller de funcionalidades administrativas
 */
class AdminController {
  /**
   * GET /api/v1/admin/dashboard/stats
   *
   * Busca estatísticas gerais do sistema para o dashboard administrativo
   *
   * @param {Request} req - Request do Express
   * @param {Response} res - Response do Express
   * @param {Function} next - Middleware next
   * @returns {Promise<Response>} JSON com estatísticas do dashboard
   *
   * Resposta de sucesso (200):
   * {
   *   success: true,
   *   data: {
   *     totalStudents: 150,
   *     totalTeachers: 12,
   *     pendingDocuments: 5,
   *     activeEnrollments: 148
   *   }
   * }
   *
   * Permissões: Admin only
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
