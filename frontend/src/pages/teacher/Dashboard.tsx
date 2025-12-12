/**
 * Arquivo: frontend/src/pages/teacher/Dashboard.tsx
 * Descrição: Dashboard do professor com resumo de turmas, próximas avaliações e estatísticas
 * Feature: feat-094 - Criar página Dashboard Professor
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir listagem de turmas do professor com detalhes
 * - Mostrar próximas avaliações agendadas
 * - Fornecer estatísticas gerais (total de turmas, alunos, avaliações)
 * - Exibir documentos pendentes de envio
 * - Fornecer acesso rápido para outras funcionalidades (Classes, Grades, Documents)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAll as getAllClasses } from '@/services/class.service';
import { useEvaluations } from '@/hooks/useEvaluations';
import type { IClass } from '@/types/class.types';
import type { IUser } from '@/types/user.types';
import type { IEvaluation } from '@/types/evaluation.types';

/**
 * TeacherDashboard - Dashboard do professor
 *
 * Exibe uma visão geral do painel do professor incluindo:
 * - Resumo de turmas (total, semestral)
 * - Cards com estatísticas importantes
 * - Listagem de próximas avaliações
 * - Cards de turmas com acesso rápido
 * - Links para páginas de gerenciamento
 *
 * @example
 * <TeacherDashboard />
 */
export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para dados do dashboard
  const [teacherData, setTeacherData] = useState<IUser | null>(null);
  const [myClasses, setMyClasses] = useState<IClass[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  // Hook para buscar avaliações do professor
  const { listEvaluations } = useEvaluations();
  const { data: allEvaluations, isLoading: loadingEvaluations } = listEvaluations();

  /**
   * Carrega dados do dashboard ao montar o componente
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Filtra e processa as próximas avaliações
   * Retorna apenas avaliações futuras, ordenadas por data (mais próximas primeiro)
   * Limitado a 5 avaliações
   *
   * @param {IEvaluation[]} evaluations - Lista de todas as avaliações
   * @returns {IEvaluation[]} Próximas 5 avaliações
   */
  const getUpcomingEvaluations = (evaluations: IEvaluation[] | undefined): IEvaluation[] => {
    console.log('[TeacherDashboard] Todas avaliações recebidas:', evaluations);

    if (!evaluations || evaluations.length === 0) {
      console.log('[TeacherDashboard] Nenhuma avaliação encontrada');
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar horas para comparação apenas de data
    console.log('[TeacherDashboard] Data de hoje (sem hora):', today);

    const filtered = evaluations.filter((evaluation) => {
      const evalDate = new Date(evaluation.date);
      evalDate.setHours(0, 0, 0, 0);
      const isFuture = evalDate >= today;

      console.log('[TeacherDashboard] Avaliação:', {
        id: evaluation.id,
        name: evaluation.name,
        date: evaluation.date,
        evalDate: evalDate,
        today: today,
        isFuture: isFuture
      });

      return isFuture; // Apenas avaliações futuras ou de hoje
    });

    console.log('[TeacherDashboard] Avaliações futuras filtradas:', filtered);

    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Ordenar por data (mais próximas primeiro)
    });

    const result = sorted.slice(0, 5); // Limitar a 5 avaliações
    console.log('[TeacherDashboard] Resultado final (até 5 avaliações):', result);

    return result;
  };

  /**
   * Carrega todos os dados necessários para o dashboard
   *
   * @throws {Error} Quando ocorre erro ao carregar dados
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar chamadas reais à API quando houver endpoint para buscar "minhas turmas"
      // Atualmente, busca todas as turmas (temporário para desenvolvimento)
      const classes = await getAllClasses();

      // Mock de dados do professor para desenvolvimento
      const mockTeacher: IUser = {
        id: 1,
        name: 'Prof. João Silva',
        email: 'joao.silva@email.com',
        login: 'joao.silva',
        role: 'teacher',
        firstAccessAt: '2025-10-01T10:00:00Z',
        createdAt: '2025-10-01T10:00:00Z',
        updatedAt: '2025-10-01T10:00:00Z',
      };

      setTeacherData(mockTeacher);
      setMyClasses(classes);

      // Calcular total de alunos (mock)
      const totalStudentsCount = classes.reduce((acc, cls) => acc + (cls.students?.length || 0), 0);
      setTotalStudents(totalStudentsCount);
    } catch (err) {
      console.error('[TeacherDashboard] Erro ao carregar dados:', err);
      setError('Erro ao carregar informações do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata apenas a data sem hora
   *
   * @param {string} dateString - Data em formato ISO
   * @returns {string} Data formatada (dd/mm/yyyy)
   */
  const formatDateOnly = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Calcula dias até uma data
   *
   * @param {string} dateString - Data em formato ISO
   * @returns {number} Número de dias até a data
   */
  const daysUntil = (dateString: string): number => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Processar próximas avaliações usando dados reais da API
  const upcomingEvaluations = getUpcomingEvaluations(allEvaluations);

  if (loading || loadingEvaluations) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {teacherData?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Acompanhe suas turmas, avaliações e notas dos alunos.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Turmas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Minhas Turmas</h3>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{myClasses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Turmas ativas</p>
        </div>

        {/* Total de Alunos */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Alunos</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
          <p className="text-xs text-gray-500 mt-1">Sob sua responsabilidade</p>
        </div>

        {/* Próximas Avaliações */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avaliações</h3>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingEvaluations.length}</p>
          <p className="text-xs text-gray-500 mt-1">Próximos 30 dias</p>
        </div>

        {/* Documentos Obrigatórios */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Docs. Pendentes</h3>
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <Link
            to="/teacher/documents"
            className="text-xs text-orange-600 hover:text-orange-700 mt-1 inline-block"
          >
            Enviar documentos →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {upcomingEvaluations.map((evaluation) => {
                const days = daysUntil(evaluation.date);
                const className = evaluation.class
                  ? `${evaluation.class.semester}º Semestre ${evaluation.class.year}`
                  : 'Turma não especificada';
                const disciplineName = evaluation.discipline?.name || 'Disciplina não especificada';
                const typeBadge = evaluation.type === 'grade' ? 'Nota' : 'Conceito';

                return (
                  <div
                    key={evaluation.id}
                    className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900">{evaluation.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            evaluation.type === 'grade'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {typeBadge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{disciplineName}</p>
                      <p className="text-xs text-gray-600 mt-1">{className}</p>
                      <p className="text-xs text-purple-700 mt-2 font-medium">
                        {formatDateOnly(evaluation.date)} ({days} dia{days !== 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Minhas Turmas - Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Turmas</h2>
            <BookOpen className="w-5 h-5 text-gray-500" />
          </div>

          {myClasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma turma atribuída</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myClasses.slice(0, 5).map((classItem) => (
                <Link
                  key={classItem.id}
                  to={`/teacher/classes/${classItem.id}/students`}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Semestre {classItem.semester}/{classItem.year}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {classItem.students?.length || 0} alunos
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
              {myClasses.length > 5 && (
                <Link
                  to="/teacher/classes"
                  className="block text-center py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todas as turmas →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Documentos Pendentes */}
      {false && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Você tem 1 documento obrigatório pendente
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Envie seus documentos obrigatórios para manter seu acesso ao sistema.
              </p>
              <Link to="/teacher/documents">
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
            to="/teacher/classes"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Minhas Turmas</h3>
              <p className="text-sm text-gray-600">Gerenciar turmas</p>
            </div>
          </Link>

          <Link
            to="/teacher/grades"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <Calendar className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Lançar Notas</h3>
              <p className="text-sm text-gray-600">Avaliações e notas</p>
            </div>
          </Link>

          <Link
            to="/teacher/documents"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <FileText className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Documentos</h3>
              <p className="text-sm text-gray-600">Documentos obrigatórios</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Mensagem de Sucesso */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              Bem-vindo ao sistema Secretaria Online
            </h3>
            <p className="text-sm text-green-700">
              Você tem acesso completo ao sistema. Navegue pela barra lateral para acessar todas
              as funcionalidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
