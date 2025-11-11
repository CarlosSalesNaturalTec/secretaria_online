/**
 * Arquivo: frontend/src/services/admin.service.ts
 * Descrição: Serviço para funcionalidades administrativas
 * Feature: feat-081 - Criar página Dashboard Admin
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Buscar estatísticas do dashboard administrativo
 * - Validar e tratar respostas da API
 * - Fornecer tratamento de erros padronizado
 */

import api from './api';
import type { IDashboardStats } from '@/types/admin.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Busca estatísticas do dashboard administrativo
 *
 * Retorna contadores gerais do sistema como total de alunos, professores,
 * documentos pendentes e matrículas ativas.
 *
 * @returns {Promise<IDashboardStats>} Estatísticas do dashboard
 * @throws {Error} Quando ocorre erro na comunicação com API
 *
 * @example
 * try {
 *   const stats = await getDashboardStats();
 *   console.log('Total de alunos:', stats.totalStudents);
 *   console.log('Documentos pendentes:', stats.pendingDocuments);
 * } catch (error) {
 *   console.error('Erro ao carregar estatísticas:', error);
 * }
 */
export async function getDashboardStats(): Promise<IDashboardStats> {
  try {
    if (import.meta.env.DEV) {
      console.log('[AdminService] Buscando estatísticas do dashboard...');
    }

    // Chamada à API
    const response = await api.get<ApiResponse<IDashboardStats>>(
      '/admin/dashboard/stats'
    );

    // Validação da resposta
    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar estatísticas do dashboard'
      );
    }

    const stats = response.data.data;

    // Validação dos dados retornados
    if (
      typeof stats.totalStudents !== 'number' ||
      typeof stats.totalTeachers !== 'number' ||
      typeof stats.pendingDocuments !== 'number' ||
      typeof stats.activeEnrollments !== 'number'
    ) {
      throw new Error('Resposta da API inválida: estatísticas com formato incorreto');
    }

    if (import.meta.env.DEV) {
      console.log('[AdminService] Estatísticas carregadas com sucesso:', stats);
    }

    return stats;
  } catch (error) {
    // Log de erro
    console.error('[AdminService] Erro ao buscar estatísticas do dashboard:', error);

    // Re-throw com mensagem apropriada
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao carregar estatísticas do dashboard. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getDashboardStats } from '@/services/admin.service';
 *
 * // Importação do objeto completo
 * import AdminService from '@/services/admin.service';
 * AdminService.getDashboardStats();
 */
const AdminService = {
  getDashboardStats,
};

export default AdminService;
