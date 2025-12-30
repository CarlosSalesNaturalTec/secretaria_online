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
import { getMyGrades, getGradesByStudent } from '@/services/grade.service';
import StudentService from '@/services/student.service';
import type {
  IGradeWithEvaluation,
  IDiscipline,
  GradeConcept,
} from '@/types/grade.types';
import type { IStudent } from '@/types/student.types';

/**
 * Interface para props do componente
 */
interface GradesProps {
  studentId?: number;
}

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
 * Pode ser usado pelo próprio aluno (sem props) ou por admin (com studentId).
 *
 * @example
 * <Grades /> // Visão do aluno
 * <Grades studentId={123} /> // Visão do admin
 */
export default function Grades({ studentId }: GradesProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allGrades, setAllGrades] = useState<IGradeWithEvaluation[]>([]);
  const [student, setStudent] = useState<IStudent | null>(null);
  const [disciplineGrades, setDisciplineGrades] = useState<IDisciplineGrades[]>([]);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<number>>(new Set());

  // Estados para filtros
  const [semesterFilter, setSemesterFilter] = useState<string>('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('');

  /**
   * Carrega notas do aluno ao montar o componente
   */
  useEffect(() => {
    loadGrades();
  }, [studentId]); // Recarrega se studentId mudar

  /**
   * Obtém o semestre correto da avaliação (prioriza originalSemester se existir)
   */
  const getSemester = (grade: IGradeWithEvaluation): number | undefined => {
    return grade.evaluation.originalSemester ?? grade.class?.semester;
  };

  /**
   * Extrai opções únicas para os filtros baseado nos dados carregados
   */
  const filterOptions = {
    semesters: Array.from(new Set(allGrades.map(g => getSemester(g)).filter((s): s is number => s !== undefined))).sort((a, b) => a - b),
    disciplines: Array.from(new Set(allGrades
      .filter(g => g.evaluation?.discipline) // Garante que tem disciplina
      .map(g => JSON.stringify({
        id: g.evaluation.discipline!.id,
        name: g.evaluation.discipline!.name
      }))))
      .map(s => JSON.parse(s))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
  };

  /**
   * Agrupa notas por disciplina e calcula médias (com suporte a filtros)
   *
   * @param {IGradeWithEvaluation[]} grades - Lista de notas do aluno
   */
  useEffect(() => {
    if (allGrades.length === 0) {
      setDisciplineGrades([]);
      return;
    }

    // Filtrar dados antes de agrupar
    const filteredGrades = allGrades.filter(grade => {
      const semester = getSemester(grade);
      const matchSemester = semesterFilter ? semester?.toString() === semesterFilter : true;
      // Verifica se discipline existe antes de acessar id
      const matchDiscipline = disciplineFilter 
        ? grade.evaluation.discipline?.id.toString() === disciplineFilter 
        : true;
      return matchSemester && matchDiscipline;
    });

    // Agrupar notas por disciplina
    const disciplineMap = new Map<number, IDisciplineGrades>();

    filteredGrades.forEach((gradeItem) => {
      const disciplineId = gradeItem.evaluation.disciplineId;
      const discipline = gradeItem.evaluation.discipline;

      if (!discipline) {
        return;
      }

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
        .map((g) => {
          const gradeValue = typeof g.grade === 'string' ? parseFloat(g.grade) : g.grade;
          return gradeValue!;
        })
        .filter((grade): grade is number => !isNaN(grade));

      if (numericGrades.length > 0) {
        const sum = numericGrades.reduce((acc: number, grade: number) => acc + grade, 0);
        disciplineData.average = sum / numericGrades.length;
      }

      return disciplineData;
    });

    // Ordenar por nome da disciplina
    disciplinesArray.sort((a, b) =>
      a.discipline.name.localeCompare(b.discipline.name)
    );

    setDisciplineGrades(disciplinesArray);

    // Expandir automaticamente apenas se houver filtros ativos
    if (disciplinesArray.length > 0 && (semesterFilter || disciplineFilter)) {
      setExpandedDisciplines(new Set(disciplinesArray.map(d => d.discipline.id)));
    }
  }, [allGrades, semesterFilter, disciplineFilter]);

  /**
   * Limpa todos os filtros
   */
  const clearFilters = () => {
    setSemesterFilter('');
    setDisciplineFilter('');
  };

  /**
   * Carrega todas as notas do aluno
   *
   * @throws {Error} Quando ocorre erro ao carregar notas
   */
  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      let grades: IGradeWithEvaluation[];

      if (studentId) {
        // Buscar notas e dados do estudante em paralelo
        const [gradesData, studentData] = await Promise.all([
          getGradesByStudent(studentId),
          StudentService.getById(studentId)
        ]);
        grades = gradesData;
        setStudent(studentData);
      } else {
        grades = await getMyGrades();
        setStudent(null);
      }

      setAllGrades(grades);

      if (import.meta.env.DEV) {
        console.log('[Grades] Notas carregadas:', grades.length);
      }
    } catch (err) {
      console.error('[Grades] Erro ao carregar notas:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar as notas. Tente novamente.'
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
   * @param {number | string} grade - Nota numérica (0-10)
   * @returns {string} Nota formatada (ex: "8,5")
   */
  const formatGrade = (grade: number | string): string => {
    const numericGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
    if (isNaN(numericGrade)) return '-';
    return numericGrade.toFixed(1).replace('.', ',');
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
   * @param {number | string} grade - Nota numérica (0-10)
   * @returns {string} Classes CSS do Tailwind
   */
  const getGradeColorClass = (grade: number | string): string => {
    const numericGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
    if (isNaN(numericGrade)) return 'text-gray-600 bg-gray-100 border-gray-200';
    if (numericGrade >= 9.0) return 'text-green-600 bg-green-50 border-green-200';
    if (numericGrade >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (numericGrade >= 6.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
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
   * @param {number | string} average - Média numérica (0-10)
   * @returns {{ icon: JSX.Element, colorClass: string }}
   */
  const getAverageIndicator = (
    average: number | string
  ): { icon: JSX.Element; colorClass: string } => {
    const numericAverage = typeof average === 'string' ? parseFloat(average) : average;
    if (isNaN(numericAverage)) {
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        colorClass: 'text-gray-600',
      };
    }
    if (numericAverage >= 9.0) {
      return {
        icon: <Award className="w-5 h-5" />,
        colorClass: 'text-green-600',
      };
    }
    if (numericAverage >= 7.0) {
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        colorClass: 'text-blue-600',
      };
    }
    if (numericAverage >= 6.0) {
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
              {studentId ? 'Erro ao carregar notas do aluno' : 'Erro ao carregar notas'}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {studentId ? `Notas do Aluno: ${student?.nome || 'Carregando...'}` : 'Minhas Notas'}
        </h1>
        <p className="text-gray-600">
          {studentId 
            ? `Visualize as notas de ${student?.nome || 'estudante'} organizadas por disciplina`
            : 'Visualize todas as suas notas organizadas por disciplina'
          }
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="semester-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Semestre
            </label>
            <select
              id="semester-filter"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            >
              <option value="">Todos os semestres</option>
              {filterOptions.semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}º Semestre
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="discipline-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina
            </label>
            <select
              id="discipline-filter"
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            >
              <option value="">Todas as disciplinas</option>
              {filterOptions.disciplines.map((discipline: any) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={clearFilters}
              disabled={!semesterFilter && !disciplineFilter}
              className="w-full md:w-auto"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <h5 className="font-medium text-gray-900 flex items-center flex-wrap gap-2">
                                {gradeItem.evaluation.name}
                                {gradeItem.evaluation.originalSemesterRaw && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    {gradeItem.evaluation.originalSemesterRaw}
                                  </span>
                                )}
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
