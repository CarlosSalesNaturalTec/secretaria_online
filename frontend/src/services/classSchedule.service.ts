/**
 * Arquivo: frontend/src/services/classSchedule.service.ts
 * Descrição: Serviço para gerenciamento de grade de horários das turmas
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 *
 * Responsabilidades:
 * - Buscar horários de uma turma
 * - Obter grade completa da semana
 * - Criar novos horários
 * - Criar horários em lote
 * - Atualizar horários existentes
 * - Remover horários
 */

import api from './api';
import type {
  IClassSchedule,
  IClassScheduleFormData,
  IClassScheduleCreateRequest,
  IClassScheduleUpdateRequest,
  IClassScheduleBulkCreateRequest,
  WeekSchedule,
  IClassScheduleListResponse,
  IClassScheduleResponse,
  IWeekScheduleResponse,
  IClassScheduleBulkCreateResponse,
  IClassScheduleDeleteResponse,
  DayOfWeek,
} from '@/types/classSchedule.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Função auxiliar para converter dados do formulário para snake_case (backend)
 */
function toSnakeCase(data: IClassScheduleFormData): Record<string, unknown> {
  return {
    discipline_id: data.discipline_id,
    teacher_id: data.teacher_id ?? null,
    day_of_week: data.day_of_week,
    start_time: data.start_time,
    end_time: data.end_time,
    online_link: data.online_link ?? null,
  };
}

/**
 * Busca todos os horários de uma turma
 *
 * Retorna lista de horários cadastrados para uma turma específica.
 *
 * @param {number} classId - ID da turma
 * @returns {Promise<IClassSchedule[]>} Lista de horários da turma
 * @throws {Error} Quando ocorre erro na comunicação com API
 *
 * @example
 * try {
 *   const schedules = await getByClass(1);
 *   console.log('Total de horários:', schedules.length);
 * } catch (error) {
 *   console.error('Erro ao buscar horários:', error);
 * }
 */
export async function getByClass(classId: number): Promise<IClassSchedule[]> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Buscando horários da turma:', classId);
    }

    const response = await api.get<ApiResponse<IClassSchedule[]>>(
      `/classes/${classId}/schedules`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar horários'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Horários recuperados:', response.data.data.length);
    }

    return response.data.data;
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao buscar horários:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar horários. Tente novamente.');
  }
}

/**
 * Busca horário específico por ID
 *
 * Retorna dados completos de um horário específico.
 *
 * @param {number} id - ID do horário
 * @returns {Promise<IClassSchedule>} Dados do horário
 * @throws {Error} Quando ID é inválido, horário não encontrado ou erro na API
 *
 * @example
 * try {
 *   const schedule = await getById(123);
 *   console.log('Horário encontrado:', schedule.startTime, '-', schedule.endTime);
 * } catch (error) {
 *   console.error('Erro ao buscar horário:', error);
 * }
 */
export async function getById(id: number): Promise<IClassSchedule> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do horário é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Buscando horário por ID:', id);
    }

    const response = await api.get<ApiResponse<IClassSchedule>>(
      `/schedules/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar horário'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Horário encontrado:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao buscar horário:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar horário. Tente novamente.');
  }
}

/**
 * Obtém a grade completa da semana de uma turma
 *
 * Retorna os horários organizados por dia da semana.
 *
 * @param {number} classId - ID da turma
 * @returns {Promise<WeekSchedule>} Grade organizada por dia da semana
 * @throws {Error} Quando ocorre erro na comunicação com API
 *
 * @example
 * try {
 *   const weekSchedule = await getWeekSchedule(1);
 *   console.log('Segunda-feira:', weekSchedule[1].length, 'aulas');
 * } catch (error) {
 *   console.error('Erro ao buscar grade:', error);
 * }
 */
export async function getWeekSchedule(classId: number): Promise<WeekSchedule> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Buscando grade da semana para turma:', classId);
    }

    const response = await api.get<ApiResponse<WeekSchedule>>(
      `/classes/${classId}/schedules/week`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar grade da semana'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Grade da semana recuperada');
    }

    return response.data.data;
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao buscar grade da semana:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar grade da semana. Tente novamente.');
  }
}

/**
 * Cria novo horário para uma turma
 *
 * Valida e envia dados do novo horário para API.
 * Verifica conflitos de horário automaticamente.
 *
 * @param {number} classId - ID da turma
 * @param {IClassScheduleFormData} data - Dados do horário a ser criado
 * @returns {Promise<IClassSchedule>} Dados do horário criado
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newSchedule = await create(1, {
 *     discipline_id: 5,
 *     teacher_id: 3,
 *     day_of_week: 1,
 *     start_time: '08:00',
 *     end_time: '10:00'
 *   });
 *   console.log('Horário criado:', newSchedule.id);
 * } catch (error) {
 *   console.error('Erro ao criar horário:', error);
 * }
 */
export async function create(
  classId: number,
  data: IClassScheduleFormData
): Promise<IClassSchedule> {
  try {
    // Validações
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório');
    }

    if (!data.discipline_id || data.discipline_id <= 0) {
      throw new Error('Disciplina é obrigatória');
    }

    if (!data.day_of_week || data.day_of_week < 1 || data.day_of_week > 7) {
      throw new Error('Dia da semana deve ser entre 1 e 7');
    }

    if (!data.start_time) {
      throw new Error('Horário de início é obrigatório');
    }

    if (!data.end_time) {
      throw new Error('Horário de término é obrigatório');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Criando novo horário:', {
        classId,
        disciplineId: data.discipline_id,
        dayOfWeek: data.day_of_week,
      });
    }

    const payload = toSnakeCase(data);

    const response = await api.post<ApiResponse<IClassSchedule>>(
      `/classes/${classId}/schedules`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar horário'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Horário criado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao criar horário:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar horário. Tente novamente.');
  }
}

/**
 * Cria múltiplos horários em lote
 *
 * Permite criar vários horários de uma vez para uma turma.
 * Retorna informações sobre sucessos e erros.
 *
 * @param {number} classId - ID da turma
 * @param {IClassScheduleFormData[]} schedules - Lista de horários a serem criados
 * @returns {Promise<IClassScheduleBulkCreateResponse['data']>} Resultado com horários criados e erros
 * @throws {Error} Quando ocorre erro crítico na API
 *
 * @example
 * try {
 *   const result = await bulkCreate(1, [
 *     { discipline_id: 5, day_of_week: 1, start_time: '08:00', end_time: '10:00' },
 *     { discipline_id: 6, day_of_week: 2, start_time: '10:00', end_time: '12:00' }
 *   ]);
 *   console.log('Criados:', result.created.length);
 *   console.log('Erros:', result.errors.length);
 * } catch (error) {
 *   console.error('Erro ao criar horários:', error);
 * }
 */
export async function bulkCreate(
  classId: number,
  schedules: IClassScheduleFormData[]
): Promise<IClassScheduleBulkCreateResponse['data']> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório');
    }

    if (!schedules || schedules.length === 0) {
      throw new Error('Lista de horários não pode ser vazia');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Criando horários em lote:', {
        classId,
        count: schedules.length,
      });
    }

    const payload = {
      schedules: schedules.map(toSnakeCase),
    };

    const response = await api.post<ApiResponse<IClassScheduleBulkCreateResponse['data']>>(
      `/classes/${classId}/schedules/bulk`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar horários em lote'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Horários criados em lote:', {
        created: response.data.data.created.length,
        errors: response.data.data.errors.length,
      });
    }

    return response.data.data;
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao criar horários em lote:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar horários em lote. Tente novamente.');
  }
}

/**
 * Atualiza horário existente
 *
 * Permite atualização parcial dos dados do horário.
 *
 * @param {number} id - ID do horário a ser atualizado
 * @param {IClassScheduleUpdateRequest} data - Dados a serem atualizados
 * @returns {Promise<IClassSchedule>} Dados do horário atualizado
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedSchedule = await update(123, {
 *     start_time: '09:00',
 *     end_time: '11:00'
 *   });
 *   console.log('Horário atualizado:', updatedSchedule.id);
 * } catch (error) {
 *   console.error('Erro ao atualizar horário:', error);
 * }
 */
export async function update(
  id: number,
  data: IClassScheduleUpdateRequest
): Promise<IClassSchedule> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do horário é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Atualizando horário:', id, data);
    }

    // Converter para snake_case apenas os campos fornecidos
    const payload: Record<string, unknown> = {};
    if (data.discipline_id !== undefined) payload.discipline_id = data.discipline_id;
    if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;
    if (data.day_of_week !== undefined) payload.day_of_week = data.day_of_week;
    if (data.start_time !== undefined) payload.start_time = data.start_time;
    if (data.end_time !== undefined) payload.end_time = data.end_time;
    if (data.online_link !== undefined) payload.online_link = data.online_link;

    const response = await api.put<ApiResponse<IClassSchedule>>(
      `/schedules/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar horário'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Horário atualizado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao atualizar horário:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar horário. Tente novamente.');
  }
}

/**
 * Remove horário do sistema
 *
 * Realiza soft delete do horário.
 *
 * @param {number} id - ID do horário a ser removido
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteSchedule(123);
 *   console.log('Horário removido com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover horário:', error);
 * }
 */
export async function deleteSchedule(id: number): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do horário é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Removendo horário:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/schedules/${id}`);

    const responseData = response.data as any;
    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover horário'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassScheduleService] Horário removido com sucesso');
    }
  } catch (error) {
    console.error('[ClassScheduleService] Erro ao remover horário:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover horário. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getByClass, getWeekSchedule, create } from '@/services/classSchedule.service';
 *
 * // Importação do objeto completo
 * import ClassScheduleService from '@/services/classSchedule.service';
 * ClassScheduleService.getByClass(1).then(schedules => console.log(schedules));
 */
const ClassScheduleService = {
  getByClass,
  getById,
  getWeekSchedule,
  create,
  bulkCreate,
  update,
  delete: deleteSchedule,
};

export default ClassScheduleService;
