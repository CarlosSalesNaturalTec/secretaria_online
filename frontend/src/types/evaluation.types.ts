/**
 * Arquivo: frontend/src/types/evaluation.types.ts
 * Descrição: Tipos e interfaces específicas para avaliações
 * Feature: feat-evaluation-ui - Criar interface de gerenciamento de avaliações
 * Criado em: 2025-12-09
 */

import type { IClass } from './class.types';
import type { IDiscipline } from './course.types';

/**
 * Tipo de avaliação
 * - grade: Avaliação com nota numérica (0-10)
 * - concept: Avaliação com conceito (satisfatório/insatisfatório)
 */
export type EvaluationType = 'grade' | 'concept';

/**
 * Interface para dados básicos do professor associado
 */
export interface IEvaluationTeacher {
  /** ID do professor */
  id: number;
  /** Nome do professor */
  nome: string;
  /** Email do professor */
  email: string | null;
  /** CPF do professor */
  cpf: string | null;
}

/**
 * Interface para Avaliação
 *
 * Responsabilidades:
 * - Representar dados completos de avaliações
 * - Armazenar informações sobre turma, professor, disciplina e tipo de avaliação
 *
 * @example
 * const evaluation: IEvaluation = {
 *   id: 1,
 *   classId: 5,
 *   teacherId: 10,
 *   disciplineId: 3,
 *   name: 'Prova Final',
 *   date: '2025-12-15',
 *   type: 'grade',
 *   createdAt: '2025-12-09T10:00:00.000Z',
 *   updatedAt: '2025-12-09T10:00:00.000Z'
 * };
 */
export interface IEvaluation {
  /** ID da avaliação */
  id: number;

  /** ID da turma */
  classId: number;

  /** ID do professor responsável */
  teacherId: number | null;

  /** ID da disciplina */
  disciplineId: number;

  /** Nome/título da avaliação */
  name: string;

  /** Data da avaliação (formato YYYY-MM-DD) */
  date: string;

  /** Tipo de avaliação (nota ou conceito) */
  type: EvaluationType;

  /** Dados da turma (opcional, retornado em consultas detalhadas) */
  class?: IClass;

  /** Dados do professor (opcional, retornado em consultas detalhadas) */
  teacher?: IEvaluationTeacher;

  /** Dados da disciplina (opcional, retornado em consultas detalhadas) */
  discipline?: IDiscipline;

  /** Data de criação do registro */
  createdAt: string;

  /** Data de atualização do registro */
  updatedAt: string;
}

/**
 * Dados para criar nova avaliação
 *
 * @example
 * const newEvaluation: ICreateEvaluationData = {
 *   classId: 5,
 *   teacherId: 10,
 *   disciplineId: 3,
 *   name: 'Prova Final',
 *   date: '2025-12-15',
 *   type: 'grade'
 * };
 */
export interface ICreateEvaluationData {
  /** ID da turma */
  classId: number;

  /** ID do professor responsável (opcional) */
  teacherId?: number;

  /** ID da disciplina */
  disciplineId: number;

  /** Nome/título da avaliação */
  name: string;

  /** Data da avaliação (formato YYYY-MM-DD) */
  date: string;

  /** Tipo de avaliação (nota ou conceito) */
  type: EvaluationType;
}

/**
 * Dados para atualizar avaliação existente
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 */
export interface IUpdateEvaluationData {
  /** ID da turma */
  classId?: number;

  /** ID do professor responsável */
  teacherId?: number;

  /** ID da disciplina */
  disciplineId?: number;

  /** Nome/título da avaliação */
  name?: string;

  /** Data da avaliação (formato YYYY-MM-DD) */
  date?: string;

  /** Tipo de avaliação (nota ou conceito) */
  type?: EvaluationType;
}
