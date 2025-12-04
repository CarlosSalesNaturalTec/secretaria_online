/**
 * Arquivo: frontend/src/services/discipline.service.ts
 * Descrição: Serviço para gerenciamento de disciplinas
 * Feature: feat-111 - Implementar cadastro de disciplinas no frontend
 * Criado em: 2025-11-08
 *
 * Responsabilidades:
 * - Buscar todas as disciplinas do sistema
 * - Buscar disciplina por ID
 * - Criar nova disciplina com dados completos
 * - Atualizar dados de disciplina existente
 * - Remover disciplina do sistema
 */

import api from './api';
import type { IDiscipline } from '@/types/course.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Interface para dados de criação de disciplina
 *
 * Contém campos para cadastro de disciplina (apenas nome é obrigatório)
 */
export interface ICreateDisciplineData {
  /** Nome da disciplina */
  name: string;
  /** Código identificador da disciplina (opcional) */
  code?: string;
  /** Carga horária em horas (opcional) */
  workloadHours?: number | null;
}

/**
 * Interface para dados de atualização de disciplina
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 */
export interface IUpdateDisciplineData {
  /** Nome da disciplina */
  name?: string;
  /** Código identificador da disciplina */
  code?: string;
  /** Carga horária em horas */
  workloadHours?: number | null;
}

/**
 * Interface para resposta paginada
 */
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface para parâmetros de busca
 */
export interface IGetAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Busca todas as disciplinas cadastradas no sistema com paginação e busca
 *
 * Retorna lista paginada de disciplinas com seus dados.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {IGetAllParams} params - Parâmetros de paginação e busca
 * @returns {Promise<IPaginatedResponse<IDiscipline>>} Lista paginada de disciplinas
 * @throws {Error} Quando ocorre erro na comunicação com API ou falta de permissão
 *
 * @example
 * try {
 *   const result = await getAll({ page: 1, limit: 10, search: 'Matemática' });
 *   console.log('Total de disciplinas:', result.total);
 * } catch (error) {
 *   console.error('Erro ao buscar disciplinas:', error);
 * }
 */
export async function getAll(params: IGetAllParams = {}): Promise<IPaginatedResponse<IDiscipline>> {
  try {
    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Buscando disciplinas...', params);
    }

    const response = await api.get<ApiResponse<any[]>>('/disciplines', { params });

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar disciplinas'
      );
    }

    // Converte snake_case do backend para camelCase
    const disciplines: IDiscipline[] = (response.data.data || []).map(
      (discipline: any) => ({
        id: discipline.id,
        name: discipline.name,
        code: discipline.code,
        workloadHours: discipline.workload_hours || discipline.workloadHours,
        createdAt: discipline.created_at || discipline.createdAt,
        updatedAt: discipline.updated_at || discipline.updatedAt,
        deletedAt: discipline.deleted_at || discipline.deletedAt,
      })
    );

    const result = {
      data: disciplines,
      total: (response.data as any).total || disciplines.length,
      page: (response.data as any).page || 1,
      limit: (response.data as any).limit || 10,
      totalPages: (response.data as any).totalPages || 1,
    };

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Disciplinas recuperadas:', result.total);
    }

    return result;
  } catch (error) {
    console.error('[DisciplineService] Erro ao buscar disciplinas:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar disciplinas. Tente novamente.');
  }
}

/**
 * Busca disciplina específica por ID
 *
 * Retorna dados completos de uma disciplina específica.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID da disciplina
 * @returns {Promise<IDiscipline>} Dados da disciplina
 * @throws {Error} Quando ID é inválido, disciplina não encontrada ou erro na API
 *
 * @example
 * try {
 *   const discipline = await getById(123);
 *   console.log('Disciplina encontrada:', discipline.name);
 * } catch (error) {
 *   console.error('Erro ao buscar disciplina:', error);
 * }
 */
export async function getById(id: number): Promise<IDiscipline> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da disciplina é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Buscando disciplina por ID:', id);
    }

    const response = await api.get<ApiResponse<any>>(`/disciplines/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar disciplina'
      );
    }

    // Converte snake_case do backend para camelCase
    const discipline: IDiscipline = {
      id: response.data.data.id,
      name: response.data.data.name,
      code: response.data.data.code,
      workloadHours: response.data.data.workload_hours || response.data.data.workloadHours,
      createdAt: response.data.data.created_at || response.data.data.createdAt,
      updatedAt: response.data.data.updated_at || response.data.data.updatedAt,
      deletedAt: response.data.data.deleted_at || response.data.data.deletedAt,
    };

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Disciplina encontrada:', discipline.name);
    }

    return discipline;
  } catch (error) {
    console.error('[DisciplineService] Erro ao buscar disciplina:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar disciplina. Tente novamente.');
  }
}

/**
 * Cria nova disciplina no sistema
 *
 * Valida e envia dados da nova disciplina para API.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {ICreateDisciplineData} data - Dados da disciplina a ser criada
 * @returns {Promise<IDiscipline>} Dados da disciplina criada
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newDiscipline = await create({
 *     name: 'Programação I',
 *     code: 'PROG001',
 *     workloadHours: 80
 *   });
 *   console.log('Disciplina criada:', newDiscipline.id);
 * } catch (error) {
 *   console.error('Erro ao criar disciplina:', error);
 * }
 */
export async function create(data: ICreateDisciplineData): Promise<IDiscipline> {
  try {
    // Validações de campos obrigatórios
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Nome é obrigatório e deve ter no mínimo 3 caracteres');
    }

    // Código é opcional, mas se fornecido deve ter no mínimo 2 caracteres
    if (data.code && data.code.trim().length > 0 && data.code.trim().length < 2) {
      throw new Error('Código deve ter no mínimo 2 caracteres');
    }

    // Carga horária é opcional, mas se fornecida deve ser válida
    if (data.workloadHours !== null && data.workloadHours !== undefined) {
      if (data.workloadHours <= 0) {
        throw new Error('Carga horária deve ser maior que zero');
      }
      if (data.workloadHours > 500) {
        throw new Error('Carga horária não pode exceder 500 horas');
      }
    }

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Criando nova disciplina:', {
        name: data.name,
        code: data.code,
        workloadHours: data.workloadHours,
      });
    }

    // Preparar dados para envio (remover espaços em branco e converter para snake_case)
    const payload: any = {
      name: data.name.trim(),
    };

    // Adiciona code apenas se fornecido (e não vazio)
    if (data.code && data.code.trim().length > 0) {
      payload.code = data.code.trim().toUpperCase();
    }

    // Adiciona workload_hours apenas se fornecido
    if (data.workloadHours !== null && data.workloadHours !== undefined) {
      payload.workload_hours = data.workloadHours;
    }

    const response = await api.post<ApiResponse<any>>('/disciplines', payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar disciplina'
      );
    }

    // Converte snake_case do backend para camelCase
    const discipline: IDiscipline = {
      id: response.data.data.id,
      name: response.data.data.name,
      code: response.data.data.code,
      workloadHours: response.data.data.workload_hours || response.data.data.workloadHours,
      createdAt: response.data.data.created_at || response.data.data.createdAt,
      updatedAt: response.data.data.updated_at || response.data.data.updatedAt,
      deletedAt: response.data.data.deleted_at || response.data.data.deletedAt,
    };

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Disciplina criada com sucesso:', discipline.id);
    }

    return discipline;
  } catch (error) {
    console.error('[DisciplineService] Erro ao criar disciplina:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar disciplina. Tente novamente.');
  }
}

/**
 * Atualiza dados de disciplina existente
 *
 * Permite atualização parcial dos dados da disciplina.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID da disciplina a ser atualizada
 * @param {IUpdateDisciplineData} data - Dados a serem atualizados
 * @returns {Promise<IDiscipline>} Dados da disciplina atualizada
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedDiscipline = await update(123, {
 *     name: 'Programação II',
 *     workloadHours: 90
 *   });
 *   console.log('Disciplina atualizada:', updatedDiscipline.name);
 * } catch (error) {
 *   console.error('Erro ao atualizar disciplina:', error);
 * }
 */
export async function update(
  id: number,
  data: IUpdateDisciplineData
): Promise<IDiscipline> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da disciplina é obrigatório e deve ser maior que zero');
    }

    // Validação de dados (se fornecidos)
    if (data.name !== undefined && data.name.trim().length < 3) {
      throw new Error('Nome deve ter no mínimo 3 caracteres');
    }

    // Código é opcional, mas se fornecido e não vazio deve ter no mínimo 2 caracteres
    if (data.code !== undefined && data.code.trim().length > 0 && data.code.trim().length < 2) {
      throw new Error('Código deve ter no mínimo 2 caracteres');
    }

    // Carga horária é opcional, mas se fornecida (e não null) deve ser válida
    if (data.workloadHours !== undefined && data.workloadHours !== null) {
      if (data.workloadHours <= 0) {
        throw new Error('Carga horária deve ser maior que zero');
      }
      if (data.workloadHours > 500) {
        throw new Error('Carga horária não pode exceder 500 horas');
      }
    }

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Atualizando disciplina:', id, data);
    }

    // Preparar dados para envio (remover espaços em branco e converter para snake_case)
    const payload: any = {};

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.code !== undefined) payload.code = data.code.trim().toUpperCase();
    if (data.workloadHours !== undefined) payload.workload_hours = data.workloadHours;

    const response = await api.put<ApiResponse<any>>(
      `/disciplines/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar disciplina'
      );
    }

    // Converte snake_case do backend para camelCase
    const discipline: IDiscipline = {
      id: response.data.data.id,
      name: response.data.data.name,
      code: response.data.data.code,
      workloadHours: response.data.data.workload_hours || response.data.data.workloadHours,
      createdAt: response.data.data.created_at || response.data.data.createdAt,
      updatedAt: response.data.data.updated_at || response.data.data.updatedAt,
      deletedAt: response.data.data.deleted_at || response.data.data.deletedAt,
    };

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Disciplina atualizada com sucesso:', discipline.id);
    }

    return discipline;
  } catch (error) {
    console.error('[DisciplineService] Erro ao atualizar disciplina:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar disciplina. Tente novamente.');
  }
}

/**
 * Remove disciplina do sistema
 *
 * Realiza soft delete da disciplina (marcada como deletada, não removida fisicamente).
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID da disciplina a ser removida
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteDiscipline(123);
 *   console.log('Disciplina removida com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover disciplina:', error);
 * }
 */
export async function deleteDiscipline(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da disciplina é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Removendo disciplina:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/disciplines/${id}`);

    // Handle 204 No Content (successful deletion with no body)
    // The response.data may be undefined or empty for 204 status
    const responseData = response.data as any;

    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover disciplina'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[DisciplineService] Disciplina removida com sucesso');
    }
  } catch (error) {
    console.error('[DisciplineService] Erro ao remover disciplina:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover disciplina. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getAll, getById, create, update, deleteDiscipline } from '@/services/discipline.service';
 *
 * // Importação do objeto completo
 * import DisciplineService from '@/services/discipline.service';
 * DisciplineService.getAll().then(disciplines => console.log(disciplines));
 */
const DisciplineService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteDiscipline,
};

export default DisciplineService;
