/**
 * Arquivo: frontend/src/types/course.types.ts
 * Descrição: Tipos e interfaces para cursos e disciplinas
 * Feature: feat-085 - Criar course.service.ts e página Courses
 * Feature: feat-101 - Criar types TypeScript (atualização)
 * Criado em: 2025-11-04
 */

/**
 * Interface para Disciplina
 *
 * Representa uma disciplina que pode ser associada a um ou mais cursos
 */
export interface IDiscipline {
  /**
   * ID único da disciplina
   */
  id: number;

  /**
   * Nome da disciplina
   */
  name: string;

  /**
   * Código identificador da disciplina
   */
  code: string;

  /**
   * Carga horária em horas
   */
  workloadHours: number;

  /**
   * Data de criação
   */
  createdAt?: string;

  /**
   * Data de última atualização
   */
  updatedAt?: string;

  /**
   * Data de exclusão (soft delete)
   */
  deletedAt?: string | null;
}

/**
 * Interface para relação Curso-Disciplina
 *
 * Representa a associação entre um curso e suas disciplinas,
 * incluindo em qual semestre a disciplina é oferecida
 */
export interface ICourseDiscipline {
  /**
   * ID da relação
   */
  id: number;

  /**
   * ID do curso
   */
  courseId: number;

  /**
   * ID da disciplina
   */
  disciplineId: number;

  /**
   * Semestre em que a disciplina é oferecida no curso
   */
  semester: number;

  /**
   * Dados da disciplina (quando incluído)
   */
  discipline?: IDiscipline;

  /**
   * Data de criação
   */
  createdAt?: string;

  /**
   * Data de última atualização
   */
  updatedAt?: string;
}

/**
 * Interface para Curso
 *
 * Representa um curso oferecido pela instituição
 */
export interface ICourse {
  /**
   * ID único do curso
   */
  id: number;

  /**
   * Nome do curso
   */
  name: string;

  /**
   * Descrição do curso
   */
  description: string;

  /**
   * Duração total do curso em semestres
   */
  durationSemesters: number;

  /**
   * Disciplinas associadas ao curso
   */
  disciplines?: ICourseDiscipline[];

  /**
   * Data de criação
   */
  createdAt?: string;

  /**
   * Data de última atualização
   */
  updatedAt?: string;

  /**
   * Data de exclusão (soft delete)
   */
  deletedAt?: string | null;
}

/**
 * Dados para criar nova disciplina
 */
export interface IDisciplineCreateRequest {
  /**
   * Nome da disciplina
   */
  name: string;

  /**
   * Código identificador
   */
  code: string;

  /**
   * Carga horária em horas
   */
  workloadHours: number;
}

/**
 * Dados para editar disciplina
 */
export interface IDisciplineUpdateRequest {
  /**
   * Nome (opcional)
   */
  name?: string;

  /**
   * Código (opcional)
   */
  code?: string;

  /**
   * Carga horária (opcional)
   */
  workloadHours?: number;
}

/**
 * Dados para criar novo curso
 */
export interface ICourseCreateRequest {
  /**
   * Nome do curso
   */
  name: string;

  /**
   * Descrição do curso
   */
  description: string;

  /**
   * Duração em semestres
   */
  durationSemesters: number;

  /**
   * Disciplinas a associar (opcional)
   */
  disciplines?: Array<{
    disciplineId: number;
    semester: number;
  }>;
}

/**
 * Dados para editar curso
 */
export interface ICourseUpdateRequest {
  /**
   * Nome (opcional)
   */
  name?: string;

  /**
   * Descrição (opcional)
   */
  description?: string;

  /**
   * Duração em semestres (opcional)
   */
  durationSemesters?: number;
}

/**
 * Dados para associar disciplina a curso
 */
export interface IAssociateDisciplineRequest {
  /**
   * ID da disciplina
   */
  disciplineId: number;

  /**
   * Semestre em que a disciplina é oferecida
   */
  semester: number;
}

/**
 * Resposta ao listar cursos
 */
export interface ICourseListResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Array de cursos
   */
  data: ICourse[];

  /**
   * Informações de paginação
   */
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Resposta ao consultar curso específico
 */
export interface ICourseResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Dados do curso
   */
  data: ICourse;

  /**
   * Mensagem de sucesso (opcional)
   */
  message?: string;
}

/**
 * Filtros para busca de cursos
 */
export interface ICourseFilters {
  /**
   * Buscar por nome
   */
  name?: string;

  /**
   * Página atual
   */
  page?: number;

  /**
   * Limite de registros por página
   */
  limit?: number;

  /**
   * Campo para ordenação
   */
  sortBy?: 'name' | 'createdAt' | 'durationSemesters';

  /**
   * Ordem de classificação
   */
  sortOrder?: 'ASC' | 'DESC';
}
