/**
 * Arquivo: frontend/src/pages/student/Grades.tsx
 * Descrição: Página de visualização de notas do aluno agrupadas por disciplina e semestre
 * Feature: feat-091 - Criar página Grades (aluno)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir todas as notas do aluno autenticado
 * - Agrupar notas por disciplina
 * - Mostrar média por disciplina
 * - Permitir filtros por semestre/período
 * - Exibir detalhes de cada avaliação (nome, data, nota/conceito)
 * - Suporte para notas numéricas e conceitos
 * - Indicadores visuais de performance
 */

import { useEffect, useState, type JSX } from 'react';
import {
  BookOpen,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getMyGrades } from '@/services/grade.service';
import type {
  IGradeWithEvaluation,
  IDiscipline,
  GradeConcept,
} from '@/types/grade.types';

/**
 * Interface para notas agrupadas por disciplina
 */
interface IDisciplineGrades {
  discipline: IDiscipline;
  grades: IGradeWithEvaluation[];
  average: number | null;
  hasConcepts: boolean;
}

/**
 * Grades - Página de visualização de notas do aluno
 *
 * Exibe todas as notas do aluno de forma organizada, agrupadas por disciplina,
 * com informações de média, avaliações e indicadores visuais de performance.
 *
 * @example
 * <Grades />
 */
export default function Grades() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allGrades, setAllGrades] = useState<IGradeWithEvaluation[]>([]);
  const [disciplineGrades, setDisciplineGrades] = useState<IDisciplineGrades[]>([]);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<number>>(new Set());
  const [overallAverage, setOverallAverage] = useState<number | null>(null);

  /**
   * Carrega notas do aluno ao montar o componente
   */
  useEffect(() => {
    loadGrades();
  }, []);

  /**
   * Agrupa notas por disciplina e calcula médias
   *
   * @param {IGradeWithEvaluation[]} grades - Lista de notas do aluno
   */
  useEffect(() => {
    if (allGrades.length === 0) {
      setDisciplineGrades([]);
      setOverallAverage(null);
      return;
    }

    // Agrupar notas por disciplina
    const disciplineMap = new Map<number, IDisciplineGrades>();

    allGrades.forEach((gradeItem) => {
      const disciplineId = gradeItem.evaluation.disciplineId;
      const discipline = gradeItem.evaluation.discipline;

      if (!discipline) return;

      if (!disciplineMap.has(disciplineId)) {
        disciplineMap.set(disciplineId, {
          discipline,
          grades: [],
          average: null,
          hasConcepts: false,
        });
      }

      const disciplineData = disciplineMap.get(disciplineId)!;
      disciplineData.grades.push(gradeItem);

      // Verificar se tem conceitos
      if (gradeItem.concept !== null) {
        disciplineData.hasConcepts = true;
      }
    });

    // Calcular médias por disciplina
    const disciplinesArray = Array.from(disciplineMap.values()).map((disciplineData) => {
      // Se tem conceitos, não calcula média numérica
      if (disciplineData.hasConcepts) {
        return disciplineData;
      }

      // Calcular média das notas numéricas
      const numericGrades = disciplineData.grades
        .filter((g) => g.grade !== null)
        .map((g) => g.grade!);

      if (numericGrades.length > 0) {
        const sum = numericGrades.reduce((acc, grade) => acc + grade, 0);
        disciplineData.average = sum / numericGrades.length;
      }

      return disciplineData;
    });

    // Ordenar por nome da disciplina
    disciplinesArray.sort((a, b) =>
      a.discipline.name.localeCompare(b.discipline.name)
    );

    setDisciplineGrades(disciplinesArray);

    // Calcular média geral (apenas disciplinas com notas numéricas)
    const disciplinesWithAverage = disciplinesArray.filter(
      (d) => d.average !== null
    );

    if (disciplinesWithAverage.length > 0) {
      const totalAverage = disciplinesWithAverage.reduce(
        (acc, d) => acc + d.average!,
        0
      );
      setOverallAverage(totalAverage / disciplinesWithAverage.length);
    } else {
      setOverallAverage(null);
    }

    // Expandir primeira disciplina por padrão
    if (disciplinesArray.length > 0) {
      setExpandedDisciplines(new Set([disciplinesArray[0].discipline.id]));
    }
  }, [allGrades]);

  /**
   * Carrega todas as notas do aluno
   *
   * @throws {Error} Quando ocorre erro ao carregar notas
   */
  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const grades = await getMyGrades();
      setAllGrades(grades);

      if (import.meta.env.DEV) {
        console.log('[Grades] Notas carregadas:', grades.length);
      }
    } catch (err) {
      console.error('[Grades] Erro ao carregar notas:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar suas notas. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Alterna expansão de disciplina
   *
   * @param {number} disciplineId - ID da disciplina
   */
  const toggleDiscipline = (disciplineId: number) => {
    setExpandedDisciplines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(disciplineId)) {
        newSet.delete(disciplineId);
      } else {
        newSet.add(disciplineId);
      }
      return newSet;
    });
  };

  /**
   * Expande todas as disciplinas
   */
  const expandAll = () => {
    const allIds = disciplineGrades.map((d) => d.discipline.id);
    setExpandedDisciplines(new Set(allIds));
  };

  /**
   * Colapsa todas as disciplinas
   */
  const collapseAll = () => {
    setExpandedDisciplines(new Set());
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
   * Formata conceito para exibição
   *
   * @param {GradeConcept} concept - Conceito
   * @returns {string} Conceito formatado
   */
  const formatConcept = (concept: GradeConcept): string => {
    return concept === 'satisfactory' ? 'Satisfatório' : 'Não Satisfatório';
  };

  /**
   * Retorna classe CSS de cor baseada na nota
   *
   * @param {number} grade - Nota numérica (0-10)
   * @returns {string} Classes CSS do Tailwind
   */
  const getGradeColorClass = (grade: number): string => {
    if (grade >= 9.0) return 'text-green-600 bg-green-50 border-green-200';
    if (grade >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (grade >= 6.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  /**
   * Retorna classe CSS de cor baseada no conceito
   *
   * @param {GradeConcept} concept - Conceito
   * @returns {string} Classes CSS do Tailwind
   */
  const getConceptColorClass = (concept: GradeConcept): string => {
    return concept === 'satisfactory'
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200';
  };

  /**
   * Retorna ícone e cor baseado na média
   *
   * @param {number} average - Média numérica (0-10)
   * @returns {{ icon: JSX.Element, colorClass: string }}
   */
  const getAverageIndicator = (
    average: number
  ): { icon: JSX.Element; colorClass: string } => {
    if (average >= 9.0) {
      return {
        icon: <Award className="w-5 h-5" />,
        colorClass: 'text-green-600',
      };
    }
    if (average >= 7.0) {
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        colorClass: 'text-blue-600',
      };
    }
    if (average >= 6.0) {
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        colorClass: 'text-yellow-600',
      };
    }
    return {
      icon: <AlertCircle className="w-5 h-5" />,
      colorClass: 'text-red-600',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando notas...</p>
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
            <h3 className="font-semibold text-red-900 mb-1">
              Erro ao carregar notas
            </h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button size="sm" onClick={loadGrades}>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Notas</h1>
        <p className="text-gray-600">
          Visualize todas as suas notas organizadas por disciplina
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Média Geral */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Média Geral</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overallAverage !== null ? formatGrade(overallAverage) : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Todas as disciplinas</p>
        </div>

        {/* Total de Disciplinas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Disciplinas</h3>
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {disciplineGrades.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Com notas lançadas</p>
        </div>

        {/* Total de Avaliações */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avaliações</h3>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{allGrades.length}</p>
          <p className="text-xs text-gray-500 mt-1">Notas lançadas</p>
        </div>
      </div>

      {/* Ações de Expansão */}
      {disciplineGrades.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {disciplineGrades.length} disciplina(s) encontrada(s)
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={expandAll}>
              Expandir Todas
            </Button>
            <Button size="sm" variant="secondary" onClick={collapseAll}>
              Recolher Todas
            </Button>
          </div>
        </div>
      )}

      {/* Notas por Disciplina */}
      {disciplineGrades.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma nota disponível
            </h3>
            <p className="text-gray-600">
              Suas notas aparecerão aqui assim que os professores lançarem as
              avaliações.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {disciplineGrades.map((disciplineData) => {
            const isExpanded = expandedDisciplines.has(
              disciplineData.discipline.id
            );
            const averageIndicator =
              disciplineData.average !== null
                ? getAverageIndicator(disciplineData.average)
                : null;

            return (
              <div
                key={disciplineData.discipline.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Cabeçalho da Disciplina */}
                <button
                  onClick={() => toggleDiscipline(disciplineData.discipline.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {disciplineData.discipline.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Código: {disciplineData.discipline.code} •{' '}
                        {disciplineData.discipline.workloadHours}h •{' '}
                        {disciplineData.grades.length} avaliação(ões)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Média da Disciplina */}
                    {disciplineData.average !== null && averageIndicator && (
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${averageIndicator.colorClass}`}
                      >
                        {averageIndicator.icon}
                        <span className="font-bold text-xl">
                          Média: {formatGrade(disciplineData.average)}
                        </span>
                      </div>
                    )}

                    {disciplineData.hasConcepts && (
                      <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                        Avaliação por conceito
                      </div>
                    )}

                    {/* Ícone de Expansão */}
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Lista de Avaliações (Expandida) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Avaliações
                    </h4>
                    <div className="space-y-3">
                      {disciplineData.grades.map((gradeItem) => (
                        <div
                          key={gradeItem.id}
                          className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {gradeItem.evaluation.name}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                Data: {formatDate(gradeItem.evaluation.date)}
                              </p>
                              {gradeItem.evaluation.teacher && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Professor: {gradeItem.evaluation.teacher.name}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Nota ou Conceito */}
                          <div>
                            {gradeItem.grade !== null ? (
                              <div
                                className={`px-4 py-2 rounded-lg border font-bold text-xl ${getGradeColorClass(
                                  gradeItem.grade
                                )}`}
                              >
                                {formatGrade(gradeItem.grade)}
                              </div>
                            ) : gradeItem.concept !== null ? (
                              <div
                                className={`px-4 py-2 rounded-lg border text-sm font-semibold ${getConceptColorClass(
                                  gradeItem.concept
                                )}`}
                              >
                                {formatConcept(gradeItem.concept)}
                              </div>
                            ) : (
                              <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm">
                                Sem nota
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
