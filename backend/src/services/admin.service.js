/**
 * Arquivo: backend/src/services/admin.service.js
 * Descrição: Service para funcionalidades administrativas
 * Feature: feat-081 - Criar service de estatísticas do dashboard admin
 * Criado em: 2025-11-07
 * Atualizado em: 2025-12-02 (feat-064 - Usar tabela students para contagem)
 *
 * Responsabilidades:
 * - Buscar estatísticas agregadas do sistema
 * - Realizar contagens de entidades
 * - Aplicar lógica de negócio para dashboard
 */

const { Student, User, Enrollment, Document } = require('../models');
const logger = require('../utils/logger');

/**
 * Service de funcionalidades administrativas
 */
class AdminService {
  /**
   * Busca estatísticas gerais do sistema
   *
   * Retorna contadores de:
   * - Total de alunos (da tabela students - dados completos)
   * - Total de professores (role = 'teacher' na tabela users)
   * - Documentos pendentes de aprovação (status = 'pending')
   * - Matrículas ativas (status = 'active')
   *
   * @returns {Promise<Object>} Objeto com estatísticas
   * @throws {Error} Se houver erro ao buscar dados
   *
   * @example
   * const stats = await AdminService.getDashboardStats();
   * // {
   * //   totalStudents: 150,
   * //   totalTeachers: 12,
   * //   pendingDocuments: 5,
   * //   activeEnrollments: 148
   * // }
   */
  async getDashboardStats() {
    try {
      logger.info('[AdminService] Buscando estatísticas do dashboard...');

      // Buscar todas as estatísticas em paralelo para melhor performance
      const [totalStudents, totalTeachers, pendingDocuments, activeEnrollments] =
        await Promise.all([
          // Total de estudantes (da tabela students, não deletados)
          // ATUALIZAÇÃO feat-064: Agora conta da tabela students ao invés de users
          Student.count(),

          // Total de professores (não deletados)
          User.count({
            where: {
              role: 'teacher',
            },
          }),

          // Documentos pendentes de aprovação
          Document.count({
            where: {
              status: 'pending',
            },
          }),

          // Matrículas ativas
          Enrollment.count({
            where: {
              status: 'active',
            },
          }),
        ]);

      const stats = {
        totalStudents,
        totalTeachers,
        pendingDocuments,
        activeEnrollments,
      };

      logger.info('[AdminService] Estatísticas carregadas com sucesso', stats);

      return stats;
    } catch (error) {
      logger.error('[AdminService] Erro ao buscar estatísticas do dashboard:', error);
      throw new Error('Falha ao buscar estatísticas do dashboard');
    }
  }
}

module.exports = new AdminService();
