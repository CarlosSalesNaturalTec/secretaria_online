/**
 * Arquivo: frontend/src/types/admin.types.ts
 * Descrição: Tipos e interfaces para funcionalidades administrativas
 * Feature: feat-081 - Criar página Dashboard Admin
 * Criado em: 2025-11-04
 */

/**
 * Interface para estatísticas do dashboard administrativo
 *
 * Contém contadores gerais sobre o sistema
 */
export interface IDashboardStats {
  /**
   * Total de alunos cadastrados no sistema
   */
  totalStudents: number;

  /**
   * Total de professores cadastrados no sistema
   */
  totalTeachers: number;

  /**
   * Total de documentos pendentes de aprovação
   */
  pendingDocuments: number;

  /**
   * Total de matrículas com status "ativa"
   */
  activeEnrollments: number;

  /**
   * Total de solicitações pendentes
   */
  pendingRequests: number;

  /**
   * Total de turmas ativas (opcional para expansão futura)
   */
  activeClasses?: number;
}
