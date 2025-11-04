/**
 * Arquivo: frontend/src/pages/student/Dashboard.tsx
 * Descrição: Dashboard do aluno com resumo de notas, documentos pendentes e próximas avaliações
 * Feature: feat-089 - Criar página Dashboard Aluno
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir resumo de notas recentes do aluno
 * - Mostrar documentos pendentes de envio
 * - Listar próximas avaliações
 * - Fornecer acesso rápido para outras funcionalidades
 * - Exibir estatísticas gerais (média, documentos, solicitações)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { IGradeSummary, IGradeWithEvaluation, IEvaluation } from '@/types/grade.types';
import type { IDocument } from '@/types/document.types';
import type { IRequest } from '@/types/request.types';

/**
 * StudentDashboard - Dashboard do aluno
 *
 * Exibe uma visão geral das informações acadêmicas do aluno, incluindo:
 * - Cards com estatísticas gerais
 * - Notas recentes
 * - Documentos pendentes
 * - Próximas avaliações
 * - Links rápidos para outras funcionalidades
 *
 * @example
 * <StudentDashboard />
 */
export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para dados do dashboard
  const [recentGrades, setRecentGrades] = useState<IGradeWithEvaluation[]>([]);
  const [upcomingEvaluations, setUpcomingEvaluations] = useState<IEvaluation[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<IDocument[]>([]);
  const [recentRequests, setRecentRequests] = useState<IRequest[]>([]);
  const [overallAverage, setOverallAverage] = useState<number | null>(null);

  /**
   * Carrega dados do dashboard ao montar o componente
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Carrega todos os dados necessários para o dashboard
   *
   * @throws {Error} Quando ocorre erro ao carregar dados
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar chamadas reais à API quando os endpoints estiverem disponíveis
      // const gradeSummary = await gradeService.getMySummary();
      // const documents = await documentService.getAll({ status: 'pending' });
      // const requests = await requestService.getAll({ limit: 5 });

      // Mock de dados para desenvolvimento
      setRecentGrades([
        {
          id: 1,
          evaluationId: 1,
          studentId: 1,
          grade: 8.5,
          concept: null,
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-11-01T10:00:00Z',
          evaluation: {
            id: 1,
            classId: 1,
            teacherId: 1,
            disciplineId: 1,
            name: 'Prova 1',
            date: '2025-10-30T00:00:00Z',
            type: 'grade',
            createdAt: '2025-10-20T00:00:00Z',
            updatedAt: '2025-10-20T00:00:00Z',
            discipline: {
              id: 1,
              name: 'Matemática',
              code: 'MAT101',
              workloadHours: 60,
            },
            teacher: {
              id: 1,
              name: 'Prof. João Silva',
            },
          },
        },
        {
          id: 2,
          evaluationId: 2,
          studentId: 1,
          grade: 9.0,
          concept: null,
          createdAt: '2025-10-28T14:00:00Z',
          updatedAt: '2025-10-28T14:00:00Z',
          evaluation: {
            id: 2,
            classId: 1,
            teacherId: 2,
            disciplineId: 2,
            name: 'Trabalho 1',
            date: '2025-10-25T00:00:00Z',
            type: 'grade',
            createdAt: '2025-10-15T00:00:00Z',
            updatedAt: '2025-10-15T00:00:00Z',
            discipline: {
              id: 2,
              name: 'Programação',
              code: 'PROG101',
              workloadHours: 80,
            },
            teacher: {
              id: 2,
              name: 'Prof. Maria Santos',
            },
          },
        },
      ]);

      setUpcomingEvaluations([
        {
          id: 3,
          classId: 1,
          teacherId: 1,
          disciplineId: 1,
          name: 'Prova 2',
          date: '2025-11-15T00:00:00Z',
          type: 'grade',
          createdAt: '2025-11-01T00:00:00Z',
          updatedAt: '2025-11-01T00:00:00Z',
          discipline: {
            id: 1,
            name: 'Matemática',
            code: 'MAT101',
            workloadHours: 60,
          },
          teacher: {
            id: 1,
            name: 'Prof. João Silva',
          },
        },
        {
          id: 4,
          classId: 1,
          teacherId: 3,
          disciplineId: 3,
          name: 'Apresentação Seminário',
          date: '2025-11-20T00:00:00Z',
          type: 'grade',
          createdAt: '2025-11-02T00:00:00Z',
          updatedAt: '2025-11-02T00:00:00Z',
          discipline: {
            id: 3,
            name: 'História',
            code: 'HIST101',
            workloadHours: 40,
          },
          teacher: {
            id: 3,
            name: 'Prof. Ana Costa',
          },
        },
      ]);

      setPendingDocuments([]);
      setRecentRequests([]);
      setOverallAverage(8.75);
    } catch (err) {
      console.error('[StudentDashboard] Erro ao carregar dados:', err);
      setError('Erro ao carregar informações do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata data para exibição
   *
   * @param {string} dateString - Data em formato ISO
   * @returns {string} Data formatada (dd/mm/yyyy)
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Formata nota para exibição
   *
   * @param {number} grade - Nota numérica (0-10)
   * @returns {string} Nota formatada (ex: "8,5")
   */
  const formatGrade = (grade: number): string => {
    return grade.toFixed(1).replace('.', ',');
  };

  /**
   * Retorna classe CSS de cor baseada na nota
   *
   * @param {number} grade - Nota numérica (0-10)
   * @returns {string} Classes CSS do Tailwind
   */
  const getGradeColorClass = (grade: number): string => {
    if (grade >= 9.0) return 'text-green-600 bg-green-50';
    if (grade >= 7.0) return 'text-blue-600 bg-blue-50';
    if (grade >= 6.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar dashboard</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button size="sm" onClick={loadDashboardData}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard do Aluno</h1>
        <p className="text-gray-600">
          Bem-vindo! Acompanhe suas notas, documentos e solicitações.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Média Geral */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Média Geral</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overallAverage ? formatGrade(overallAverage) : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Semestre atual</p>
        </div>

        {/* Notas Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Notas Recentes</h3>
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{recentGrades.length}</p>
          <Link
            to="/student/grades"
            className="text-xs text-green-600 hover:text-green-700 mt-1 inline-block"
          >
            Ver todas →
          </Link>
        </div>

        {/* Documentos Pendentes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Docs. Pendentes</h3>
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingDocuments.length}</p>
          <Link
            to="/student/documents"
            className="text-xs text-orange-600 hover:text-orange-700 mt-1 inline-block"
          >
            Enviar documentos →
          </Link>
        </div>

        {/* Próximas Avaliações */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Próximas Avaliações</h3>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingEvaluations.length}</p>
          <p className="text-xs text-gray-500 mt-1">Próximos 30 dias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notas Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Notas Recentes</h2>
            <Link to="/student/grades">
              <Button size="sm" variant="secondary">
                Ver todas
              </Button>
            </Link>
          </div>

          {recentGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma nota lançada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGrades.map((gradeItem) => (
                <div
                  key={gradeItem.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {gradeItem.evaluation.discipline?.name}
                    </h3>
                    <p className="text-sm text-gray-600">{gradeItem.evaluation.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(gradeItem.evaluation.date)}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold text-xl ${
                      gradeItem.grade !== null
                        ? getGradeColorClass(gradeItem.grade)
                        : 'text-gray-600 bg-gray-100'
                    }`}
                  >
                    {gradeItem.grade !== null
                      ? formatGrade(gradeItem.grade)
                      : gradeItem.concept || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximas Avaliações */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Próximas Avaliações</h2>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>

          {upcomingEvaluations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma avaliação agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{evaluation.name}</h3>
                    <p className="text-sm text-gray-600">
                      {evaluation.discipline?.name}
                    </p>
                    <p className="text-xs text-purple-700 mt-1 font-medium">
                      Data: {formatDate(evaluation.date)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {evaluation.teacher?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documentos Pendentes */}
      {pendingDocuments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Você tem {pendingDocuments.length} documento(s) pendente(s) de envio
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Envie seus documentos obrigatórios para ativar sua matrícula.
              </p>
              <Link to="/student/documents">
                <Button size="sm">Enviar documentos agora</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Links Rápidos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/student/grades"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Minhas Notas</h3>
              <p className="text-sm text-gray-600">Ver todas as notas</p>
            </div>
          </Link>

          <Link
            to="/student/documents"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <FileText className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Documentos</h3>
              <p className="text-sm text-gray-600">Enviar documentos</p>
            </div>
          </Link>

          <Link
            to="/student/requests"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Solicitações</h3>
              <p className="text-sm text-gray-600">Fazer solicitações</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Mensagem de Boas-vindas para Matrículas Ativas */}
      {pendingDocuments.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Matrícula ativa
              </h3>
              <p className="text-sm text-green-700">
                Sua matrícula está ativa e todos os documentos foram aprovados. Você tem acesso
                completo ao sistema.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
