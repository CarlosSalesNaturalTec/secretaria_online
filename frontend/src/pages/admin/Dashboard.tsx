/**
 * Arquivo: frontend/src/pages/admin/Dashboard.tsx
 * Descrição: Dashboard administrativo com estatísticas do sistema
 * Feature: feat-081 - Criar página Dashboard Admin
 * Criado em: 2025-11-03
 * Atualizado em: 2025-11-04
 */

import { useEffect, useState } from 'react';
import { Users, GraduationCap, FileText, UserCheck, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '@/services/admin.service';
import type { IDashboardStats } from '@/types/admin.types';

/**
 * AdminDashboard - Dashboard administrativo
 *
 * Responsabilidades:
 * - Exibir estatísticas gerais do sistema (alunos, professores, documentos, matrículas)
 * - Carregar dados da API ao montar o componente
 * - Exibir estados de loading e erro apropriados
 * - Fornecer interface visual clara e responsiva
 *
 * @returns Página do dashboard administrativo
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega estatísticas do dashboard ao montar o componente
   */
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar estatísticas do dashboard';
        setError(errorMessage);
        console.error('[AdminDashboard] Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  /**
   * Renderiza estado de loading
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de erro
   */
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Erro ao carregar dashboard
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renderiza dashboard com estatísticas
   */
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">
          Visão geral das estatísticas do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Total de Alunos */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total de Alunos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalStudents ?? 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <GraduationCap className="text-blue-600" size={28} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Alunos cadastrados no sistema
          </p>
        </div>

        {/* Card: Total de Professores */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total de Professores</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalTeachers ?? 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="text-green-600" size={28} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Professores cadastrados no sistema
          </p>
        </div>

        {/* Card: Documentos Pendentes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Documentos Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.pendingDocuments ?? 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FileText className="text-orange-600" size={28} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Documentos aguardando aprovação
          </p>
        </div>

        {/* Card: Matrículas Ativas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Matrículas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.activeEnrollments ?? 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <UserCheck className="text-purple-600" size={28} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Matrículas com status ativo
          </p>
        </div>
      </div>

      {/* Seção de acesso rápido (mantida da versão anterior) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Alunos</h3>
            <p className="text-sm text-blue-700">Gerenciar cadastro de alunos</p>
          </button>

          <button className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Professores</h3>
            <p className="text-sm text-green-700">Gerenciar cadastro de professores</p>
          </button>

          <button className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Cursos</h3>
            <p className="text-sm text-purple-700">Gerenciar cursos e disciplinas</p>
          </button>

          <button className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-left">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Turmas</h3>
            <p className="text-sm text-orange-700">Gerenciar turmas e matrículas</p>
          </button>

          <button className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-left">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Documentos</h3>
            <p className="text-sm text-red-700">Validar documentos enviados</p>
          </button>

          <button className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors text-left">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Solicitações</h3>
            <p className="text-sm text-indigo-700">Processar solicitações de alunos</p>
          </button>
        </div>
      </div>
    </div>
  );
}
