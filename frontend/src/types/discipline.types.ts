/**
 * Arquivo: frontend/src/types/discipline.types.ts
 * Descrição: Tipos e interfaces para disciplinas
 * Criado em: 2025-12-08
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
