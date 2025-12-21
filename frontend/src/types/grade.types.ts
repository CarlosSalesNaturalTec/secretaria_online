/**
 * Arquivo: frontend/src/types/grade.types.ts
 * Descrição: Types e interfaces para o módulo de notas e avaliações
 * Feature: feat-089 - Criar página Dashboard Aluno
 * Feature: feat-101 - Criar types TypeScript (atualização)
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

  // Campos de migração (sistema antigo)
  originalSemester?: number;
  originalCourseName?: string;
  originalSemesterRaw?: string;

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

/**
 * Dados para criar nova avaliação
 */
export interface ICreateEvaluationRequest {
  /**
   * ID da turma
   */
  classId: number;

  /**
   * ID da disciplina
   */
  disciplineId: number;

  /**
   * Nome da avaliação
   */
  name: string;

  /**
   * Data da avaliação
   */
  date: string;

  /**
   * Tipo de avaliação
   */
  type: EvaluationType;
}

/**
 * Dados para atualizar avaliação
 */
export interface IUpdateEvaluationRequest {
  /**
   * Nome (opcional)
   */
  name?: string;

  /**
   * Data (opcional)
   */
  date?: string;

  /**
   * Tipo (opcional)
   */
  type?: EvaluationType;
}

/**
 * Dados para lançar nota individual
 */
export interface ICreateGradeRequest {
  /**
   * ID da avaliação
   */
  evaluationId: number;

  /**
   * ID do aluno
   */
  studentId: number;

  /**
   * Nota (0-10) para avaliações do tipo 'grade'
   */
  grade?: number;

  /**
   * Conceito para avaliações do tipo 'concept'
   */
  concept?: GradeConcept;
}

/**
 * Dados para atualizar nota
 */
export interface IUpdateGradeRequest {
  /**
   * Nota (opcional)
   */
  grade?: number;

  /**
   * Conceito (opcional)
   */
  concept?: GradeConcept;
}

/**
 * Dados para lançar média final
 */
export interface ISetFinalAverageRequest {
  /**
   * ID do aluno
   */
  studentId: number;

  /**
   * ID da disciplina
   */
  disciplineId: number;

  /**
   * Média final (0-10)
   */
  average: number;
}
