/**
 * Arquivo: frontend/src/types/grade.types.ts
 * Descrição: Types e interfaces para o módulo de notas e avaliações
 * Feature: feat-089 - Criar página Dashboard Aluno
 * Criado em: 2025-11-04
 */

/**
 * Tipo de avaliação
 */
export type EvaluationType = 'grade' | 'concept';

/**
 * Conceito para avaliações do tipo 'concept'
 */
export type GradeConcept = 'satisfactory' | 'unsatisfactory';

/**
 * Interface para disciplina (informações básicas)
 */
export interface IDiscipline {
  id: number;
  name: string;
  code: string;
  workloadHours: number;
}

/**
 * Interface para avaliação
 */
export interface IEvaluation {
  id: number;
  classId: number;
  teacherId: number;
  disciplineId: number;
  name: string;
  date: string;
  type: EvaluationType;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  discipline?: IDiscipline;
  teacher?: {
    id: number;
    name: string;
  };
}

/**
 * Interface para nota individual
 */
export interface IGrade {
  id: number;
  evaluationId: number;
  studentId: number;
  grade: number | null; // Para avaliações do tipo 'grade' (0-10)
  concept: GradeConcept | null; // Para avaliações do tipo 'concept'
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  evaluation?: IEvaluation;
}

/**
 * Interface para nota com informações da avaliação (para exibição)
 */
export interface IGradeWithEvaluation extends IGrade {
  evaluation: IEvaluation;
}

/**
 * Interface para média final de disciplina
 */
export interface IDisciplineAverage {
  disciplineId: number;
  disciplineName: string;
  average: number | null;
  concept: GradeConcept | null;
  totalEvaluations: number;
  completedEvaluations: number;
}

/**
 * Interface para resumo de notas (usado no dashboard)
 */
export interface IGradeSummary {
  recentGrades: IGradeWithEvaluation[];
  upcomingEvaluations: IEvaluation[];
  disciplineAverages: IDisciplineAverage[];
  totalEvaluations: number;
  completedEvaluations: number;
  overallAverage: number | null;
}

/**
 * Interface para resposta de listagem de notas
 */
export interface IGradeListResponse {
  success: boolean;
  data: {
    grades: IGrade[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Interface para resposta de nota única
 */
export interface IGradeResponse {
  success: boolean;
  data: IGrade;
  message?: string;
}

/**
 * Interface para resposta de resumo de notas
 */
export interface IGradeSummaryResponse {
  success: boolean;
  data: IGradeSummary;
}

/**
 * Interface para filtros de listagem de notas
 */
export interface IGradeFilters {
  studentId?: number;
  disciplineId?: number;
  evaluationId?: number;
  classId?: number;
  page?: number;
  limit?: number;
}
