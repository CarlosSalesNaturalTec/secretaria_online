/**
 * Arquivo: frontend/src/services/grade.service.ts
 * Descrição: Serviço para gerenciamento de notas e avaliações
 * Feature: feat-090 - Criar grade.service.ts
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Buscar notas do aluno autenticado (getMyGrades)
 * - Buscar notas de uma avaliação específica (getGradesByEvaluation - professor)
 * - Criar nova nota
 * - Atualizar nota existente
 */

import api from './api';
import type {
  IGrade,
  IGradeWithEvaluation,
  GradeConcept,
} from '@/types/grade.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Interface para dados de criação de nota
 *
 * Contém todos os campos obrigatórios para lançamento de nota
 */
export interface ICreateGradeData {
  /** ID da avaliação */
  evaluationId: number;
  /** ID do aluno */
  studentId: number;
  /** Nota numérica (0-10) - obrigatório para avaliações tipo 'grade' */
  grade?: number | null;
  /** Conceito (satisfactory/unsatisfactory) - obrigatório para avaliações tipo 'concept' */
  concept?: GradeConcept | null;
}

/**
 * Interface para dados de atualização de nota
 *
 * Permite atualização dos valores de nota ou conceito
 */
export interface IUpdateGradeData {
  /** Nota numérica (0-10) - para avaliações tipo 'grade' */
  grade?: number | null;
  /** Conceito (satisfactory/unsatisfactory) - para avaliações tipo 'concept' */
  concept?: GradeConcept | null;
}

/**
 * Busca todas as notas do aluno autenticado
 *
 * Retorna lista completa de notas do aluno com informações das avaliações.
 * Utiliza o token JWT para identificar o aluno.
 * Apenas alunos têm permissão para esta operação.
 *
 * @param {object} filters - Filtros opcionais (semester, discipline_id)
 * @returns {Promise<IGradeWithEvaluation[]>} Lista de notas com avaliações
 * @throws {Error} Quando ocorre erro na comunicação com API ou não autenticado
 *
 * @example
 * try {
 *   const myGrades = await getMyGrades({ semester: 1 });
 *   console.log('Total de notas:', myGrades.length);
 * } catch (error) {
 *   console.error('Erro ao buscar notas:', error);
 * }
 */
export async function getMyGrades(filters?: { semester?: number; discipline_id?: number }): Promise<IGradeWithEvaluation[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[GradeService] Buscando notas do aluno autenticado...', filters);
    }

    const params = new URLSearchParams();
    if (filters?.semester) params.append('semester', filters.semester.toString());
    if (filters?.discipline_id) params.append('discipline_id', filters.discipline_id.toString());

    const response = await api.get<ApiResponse<IGradeWithEvaluation[]>>(
      '/grades/my-grades',
      { params }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar notas'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[GradeService] Notas recuperadas:',
        response.data.data.length
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[GradeService] Erro ao buscar notas do aluno:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar suas notas. Tente novamente.');
  }
}

/**
 * Busca notas de uma avaliação específica
 *
 * Retorna todas as notas lançadas para uma avaliação.
 * Usado por professores para visualizar/gerenciar notas de uma avaliação.
 * Apenas professores têm permissão para esta operação.
 *
 * @param {number} evaluationId - ID da avaliação
 * @returns {Promise<IGrade[]>} Lista de notas da avaliação
 * @throws {Error} Quando ID é inválido, avaliação não encontrada ou erro na API
 *
 * @example
 * try {
 *   const grades = await getGradesByEvaluation(123);
 *   console.log('Notas da avaliação:', grades.length);
 * } catch (error) {
 *   console.error('Erro ao buscar notas:', error);
 * }
 */
export async function getGradesByEvaluation(
  evaluationId: number
): Promise<IGrade[]> {
  try {
    // Validação do ID
    if (!evaluationId || evaluationId <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[GradeService] Buscando notas da avaliação:', evaluationId);
    }

    const response = await api.get<ApiResponse<IGrade[]>>(
      `/evaluations/${evaluationId}/grades`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar notas da avaliação'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[GradeService] Notas da avaliação recuperadas:',
        response.data.data.length
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[GradeService] Erro ao buscar notas da avaliação:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar notas da avaliação. Tente novamente.');
  }
}

/**
 * Cria nova nota para um aluno
 *
 * Valida e envia dados da nota para API.
 * Apenas professores têm permissão para esta operação.
 * A nota deve ser numérica (0-10) para avaliações tipo 'grade' ou
 * conceito (satisfactory/unsatisfactory) para avaliações tipo 'concept'.
 *
 * @param {ICreateGradeData} data - Dados da nota a ser criada
 * @returns {Promise<IGrade>} Dados da nota criada
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newGrade = await createGrade({
 *     evaluationId: 123,
 *     studentId: 456,
 *     grade: 8.5
 *   });
 *   console.log('Nota criada:', newGrade.id);
 * } catch (error) {
 *   console.error('Erro ao criar nota:', error);
 * }
 */
export async function createGrade(data: ICreateGradeData): Promise<IGrade> {
  try {
    // Validações de campos obrigatórios
    if (!data.evaluationId || data.evaluationId <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    if (!data.studentId || data.studentId <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
    }

    // Validação de nota ou conceito (pelo menos um deve estar presente)
    if (data.grade === undefined && data.concept === undefined) {
      throw new Error(
        'Nota (0-10) ou conceito (satisfactory/unsatisfactory) é obrigatório'
      );
    }

    // Validação de nota numérica (se fornecida)
    if (data.grade !== undefined && data.grade !== null) {
      if (typeof data.grade !== 'number') {
        throw new Error('Nota deve ser um número');
      }

      if (data.grade < 0 || data.grade > 10) {
        throw new Error('Nota deve estar entre 0 e 10');
      }
    }

    // Validação de conceito (se fornecido)
    if (data.concept !== undefined && data.concept !== null) {
      if (!['satisfactory', 'unsatisfactory'].includes(data.concept)) {
        throw new Error(
          'Conceito deve ser "satisfactory" ou "unsatisfactory"'
        );
      }
    }

    if (import.meta.env.DEV) {
      console.log('[GradeService] Criando nova nota:', {
        evaluationId: data.evaluationId,
        studentId: data.studentId,
        grade: data.grade,
        concept: data.concept,
      });
    }

    // Converter camelCase para snake_case para o backend
    const payload = {
      evaluation_id: data.evaluationId,
      student_id: data.studentId,
      grade: data.grade,
      concept: data.concept,
    };

    const response = await api.post<ApiResponse<IGrade>>('/grades', payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar nota'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[GradeService] Nota criada com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[GradeService] Erro ao criar nota:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar nota. Tente novamente.');
  }
}

/**
 * Atualiza nota existente
 *
 * Permite atualização do valor da nota ou conceito.
 * Apenas professores têm permissão para esta operação.
 * Notas podem ser editadas sem restrição de período.
 *
 * @param {number} id - ID da nota a ser atualizada
 * @param {IUpdateGradeData} data - Dados a serem atualizados
 * @returns {Promise<IGrade>} Dados da nota atualizada
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedGrade = await updateGrade(123, {
 *     grade: 9.0
 *   });
 *   console.log('Nota atualizada:', updatedGrade.grade);
 * } catch (error) {
 *   console.error('Erro ao atualizar nota:', error);
 * }
 */
export async function updateGrade(
  id: number,
  data: IUpdateGradeData
): Promise<IGrade> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da nota é obrigatório e deve ser maior que zero');
    }

    // Validação de nota ou conceito (pelo menos um deve estar presente)
    if (data.grade === undefined && data.concept === undefined) {
      throw new Error(
        'Nota (0-10) ou conceito (satisfactory/unsatisfactory) é obrigatório'
      );
    }

    // Validação de nota numérica (se fornecida)
    if (data.grade !== undefined && data.grade !== null) {
      if (typeof data.grade !== 'number') {
        throw new Error('Nota deve ser um número');
      }

      if (data.grade < 0 || data.grade > 10) {
        throw new Error('Nota deve estar entre 0 e 10');
      }
    }

    // Validação de conceito (se fornecido)
    if (data.concept !== undefined && data.concept !== null) {
      if (!['satisfactory', 'unsatisfactory'].includes(data.concept)) {
        throw new Error(
          'Conceito deve ser "satisfactory" ou "unsatisfactory"'
        );
      }
    }

    if (import.meta.env.DEV) {
      console.log('[GradeService] Atualizando nota:', id, data);
    }

    const response = await api.put<ApiResponse<IGrade>>(
      `/grades/${id}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar nota'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[GradeService] Nota atualizada com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[GradeService] Erro ao atualizar nota:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar nota. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getMyGrades, getGradesByEvaluation, createGrade, updateGrade } from '@/services/grade.service';
 *
 * // Importação do objeto completo
 * import GradeService from '@/services/grade.service';
 * GradeService.getMyGrades().then(grades => console.log(grades));
 */
const GradeService = {
  getMyGrades,
  getGradesByEvaluation,
  createGrade,
  updateGrade,
};

export default GradeService;
