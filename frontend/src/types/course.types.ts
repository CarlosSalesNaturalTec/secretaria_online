/**
 * Arquivo: frontend/src/types/course.types.ts
 * Descrição: Tipos e interfaces para cursos e disciplinas
 * Feature: feat-085 - Criar course.service.ts e página Courses
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
