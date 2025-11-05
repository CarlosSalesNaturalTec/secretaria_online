/**
 * Arquivo: frontend/src/services/evaluation.service.ts
 * Descrição: Serviço para gerenciamento de avaliações
 * Feature: feat-097 - Criar evaluation.service.ts
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Criar nova avaliação para uma turma
 * - Buscar avaliações de uma turma específica
 * - Atualizar avaliação existente
 * - Deletar avaliação do sistema
 */

import api from './api';
import type { ApiResponse } from '@/types/api.types';

/**
 * Tipos de avaliação disponíveis
 *
 * Define os tipos possíveis para uma avaliação:
 * - 'grade': Avaliação com nota numérica (0-10)
 * - 'concept': Avaliação com conceito (satisfactory/unsatisfactory)
 */
export const EVALUATION_TYPES = {
  GRADE: 'grade',
  CONCEPT: 'concept',
} as const;

export type EvaluationType = (typeof EVALUATION_TYPES)[keyof typeof EVALUATION_TYPES];

/**
 * Interface para dados de avaliação
 *
 * Representa uma avaliação completa com todas as suas propriedades
 */
export interface IEvaluation {
  /** ID da avaliação */
  id: number;
  /** ID da turma à qual a avaliação pertence */
  classId: number;
  /** ID do professor responsável por criar a avaliação */
  teacherId: number;
  /** ID da disciplina relacionada à avaliação */
  disciplineId: number;
  /** Nome da avaliação (ex: "Prova 1", "Trabalho Final") */
  name: string;
  /** Data da avaliação */
  date: string; // ISO 8601 format (YYYY-MM-DD)
  /** Tipo de avaliação: 'grade' ou 'concept' */
  type: EvaluationType;
  /** Data de criação */
  createdAt: string;
  /** Data de última atualização */
  updatedAt: string;
}

/**
 * Interface para dados de criação de avaliação
 *
 * Contém todos os campos obrigatórios para cadastro de avaliação
 */
export interface ICreateEvaluationData {
  /** ID da turma à qual a avaliação pertence */
  classId: number;
  /** ID da disciplina relacionada à avaliação */
  disciplineId: number;
  /** Nome da avaliação (ex: "Prova 1", "Trabalho Final") */
  name: string;
  /** Data da avaliação */
  date: string; // ISO 8601 format (YYYY-MM-DD)
  /** Tipo de avaliação: 'grade' ou 'concept' */
  type: EvaluationType;
}

/**
 * Interface para dados de atualização de avaliação
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 */
export interface IUpdateEvaluationData {
  /** Nome da avaliação */
  name?: string;
  /** Data da avaliação */
  date?: string;
  /** Tipo de avaliação */
  type?: EvaluationType;
}

/**
 * Cria nova avaliação para uma turma
 *
 * Valida e envia dados da nova avaliação para API.
 * A avaliação será vinculada automaticamente a todos os alunos da turma.
 * Apenas professores da turma têm permissão para esta operação.
 *
 * @param {ICreateEvaluationData} data - Dados da avaliação a ser criada
 * @returns {Promise<IEvaluation>} Dados da avaliação criada
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newEvaluation = await create({
 *     classId: 1,
 *     disciplineId: 3,
 *     name: 'Prova 1',
 *     date: '2025-11-10',
 *     type: EvaluationType.GRADE
 *   });
 *   console.log('Avaliação criada:', newEvaluation.id);
 * } catch (error) {
 *   console.error('Erro ao criar avaliação:', error);
 * }
 */
export async function create(
  data: ICreateEvaluationData
): Promise<IEvaluation> {
  try {
    // Validações de campos obrigatórios
    if (!data.classId || data.classId <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    if (!data.disciplineId || data.disciplineId <= 0) {
      throw new Error(
        'ID da disciplina é obrigatório e deve ser maior que zero'
      );
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome da avaliação é obrigatório');
    }

    if (data.name.trim().length > 255) {
      throw new Error('Nome da avaliação não pode exceder 255 caracteres');
    }

    if (!data.date) {
      throw new Error('Data da avaliação é obrigatória');
    }

    // Validação de formato de data (ISO 8601: YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      throw new Error('Data deve estar no formato YYYY-MM-DD');
    }

    // Validação de data válida
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Data fornecida é inválida');
    }

    if (!data.type) {
      throw new Error('Tipo de avaliação é obrigatório');
    }

    if (!Object.values(EVALUATION_TYPES).includes(data.type)) {
      throw new Error(
        `Tipo de avaliação deve ser "${EVALUATION_TYPES.GRADE}" ou "${EVALUATION_TYPES.CONCEPT}"`
      );
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Criando nova avaliação:', {
        classId: data.classId,
        disciplineId: data.disciplineId,
        name: data.name,
        date: data.date,
        type: data.type,
      });
    }

    const response = await api.post<ApiResponse<IEvaluation>>(
      '/evaluations',
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar avaliação'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EvaluationService] Avaliação criada com sucesso:',
        response.data.data.id
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[EvaluationService] Erro ao criar avaliação:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar avaliação. Tente novamente.');
  }
}

/**
 * Busca todas as avaliações de uma turma específica
 *
 * Retorna lista completa de avaliações associadas a uma turma.
 * Apenas professores da turma ou administradores têm permissão para esta operação.
 *
 * @param {number} classId - ID da turma
 * @returns {Promise<IEvaluation[]>} Lista de avaliações da turma
 * @throws {Error} Quando ID é inválido, turma não encontrada ou erro na API
 *
 * @example
 * try {
 *   const evaluations = await getByClass(1);
 *   console.log('Avaliações da turma:', evaluations.length);
 * } catch (error) {
 *   console.error('Erro ao buscar avaliações:', error);
 * }
 */
export async function getByClass(classId: number): Promise<IEvaluation[]> {
  try {
    // Validação do ID
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Buscando avaliações da turma:', classId);
    }

    const response = await api.get<ApiResponse<IEvaluation[]>>(
      `/evaluations/class/${classId}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message ||
          'Erro ao buscar avaliações da turma'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EvaluationService] Avaliações da turma recuperadas:',
        response.data.data.length
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[EvaluationService] Erro ao buscar avaliações da turma:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'Falha ao buscar avaliações da turma. Tente novamente.'
    );
  }
}

/**
 * Atualiza avaliação existente
 *
 * Permite atualização parcial dos dados da avaliação.
 * Apenas o professor que criou a avaliação pode atualizá-la.
 *
 * @param {number} id - ID da avaliação a ser atualizada
 * @param {IUpdateEvaluationData} data - Dados a serem atualizados
 * @returns {Promise<IEvaluation>} Dados da avaliação atualizada
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedEvaluation = await update(1, {
 *     name: 'Prova 1 - Revisão',
 *     date: '2025-11-11'
 *   });
 *   console.log('Avaliação atualizada:', updatedEvaluation.id);
 * } catch (error) {
 *   console.error('Erro ao atualizar avaliação:', error);
 * }
 */
export async function update(
  id: number,
  data: IUpdateEvaluationData
): Promise<IEvaluation> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    // Validação de nome (se fornecido)
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error('Nome da avaliação não pode estar vazio');
      }

      if (data.name.trim().length > 255) {
        throw new Error('Nome da avaliação não pode exceder 255 caracteres');
      }
    }

    // Validação de data (se fornecida)
    if (data.date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.date)) {
        throw new Error('Data deve estar no formato YYYY-MM-DD');
      }

      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Data fornecida é inválida');
      }
    }

    // Validação de tipo (se fornecido)
    if (data.type !== undefined) {
      if (!Object.values(EVALUATION_TYPES).includes(data.type)) {
        throw new Error(
          `Tipo de avaliação deve ser "${EVALUATION_TYPES.GRADE}" ou "${EVALUATION_TYPES.CONCEPT}"`
        );
      }
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Atualizando avaliação:', id, data);
    }

    const response = await api.put<ApiResponse<IEvaluation>>(
      `/evaluations/${id}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar avaliação'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EvaluationService] Avaliação atualizada com sucesso:',
        response.data.data.id
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[EvaluationService] Erro ao atualizar avaliação:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar avaliação. Tente novamente.');
  }
}

/**
 * Deleta avaliação do sistema
 *
 * Realiza soft delete da avaliação (marcada como deletada, não removida fisicamente).
 * Apenas o professor que criou a avaliação pode deletá-la.
 * Ao deletar uma avaliação, todas as notas associadas a ela serão removidas.
 *
 * @param {number} id - ID da avaliação a ser deletada
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteEvaluation(1);
 *   console.log('Avaliação removida com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover avaliação:', error);
 * }
 */
export async function deleteEvaluation(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Removendo avaliação:', id);
    }

    const response = await api.delete<ApiResponse<void>>(
      `/evaluations/${id}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao remover avaliação'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Avaliação removida com sucesso');
    }
  } catch (error) {
    console.error('[EvaluationService] Erro ao remover avaliação:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover avaliação. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { create, getByClass, update, deleteEvaluation, EVALUATION_TYPES, type EvaluationType } from '@/services/evaluation.service';
 *
 * // Importação do objeto completo
 * import EvaluationService from '@/services/evaluation.service';
 * EvaluationService.getByClass(1).then(evaluations => console.log(evaluations));
 */
const EvaluationService = {
  create,
  getByClass,
  update,
  delete: deleteEvaluation,
};

export default EvaluationService;
