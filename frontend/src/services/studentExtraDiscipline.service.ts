/**
 * Arquivo: frontend/src/services/studentExtraDiscipline.service.ts
 * Descrição: Serviço para gerenciamento de disciplinas extras de alunos
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 *
 * Responsabilidades:
 * - Buscar disciplinas extras de um aluno
 * - Obter grade completa do aluno (turma principal + extras)
 * - Vincular disciplina extra a um aluno
 * - Atualizar disciplina extra
 * - Remover disciplina extra
 * - Listar alunos com uma disciplina extra específica
 */

import api from './api';
import type {
  IStudentExtraDiscipline,
  IStudentExtraDisciplineFormData,
  IStudentExtraDisciplineUpdateRequest,
  IStudentFullSchedule,
  IStudentExtraDisciplineFilters,
  ExtraDisciplineStatus,
  ExtraDisciplineReason,
} from '@/types/studentExtraDiscipline.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Função auxiliar para converter dados do formulário para snake_case (backend)
 */
function toSnakeCase(
  studentId: number,
  data: IStudentExtraDisciplineFormData
): Record<string, unknown> {
  return {
    student_id: studentId,
    discipline_id: data.discipline_id,
    class_id: data.class_id ?? null,
    enrollment_date: data.enrollment_date,
    reason: data.reason,
    notes: data.notes ?? null,
  };
}

/**
 * Busca todas as disciplinas extras de um aluno
 *
 * Retorna lista de disciplinas extras vinculadas a um aluno específico.
 *
 * @param {number} studentId - ID do aluno
 * @param {IStudentExtraDisciplineFilters} filters - Filtros opcionais
 * @returns {Promise<IStudentExtraDiscipline[]>} Lista de disciplinas extras
 * @throws {Error} Quando ocorre erro na comunicação com API
 *
 * @example
 * try {
 *   const extras = await getByStudent(1);
 *   console.log('Total de disciplinas extras:', extras.length);
 * } catch (error) {
 *   console.error('Erro ao buscar disciplinas extras:', error);
 * }
 */
export async function getByStudent(
  studentId: number,
  filters?: IStudentExtraDisciplineFilters
): Promise<IStudentExtraDiscipline[]> {
  try {
    if (!studentId || studentId <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Buscando disciplinas extras do aluno:', studentId);
    }

    // Construir query params
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.reason) params.append('reason', filters.reason);
    if (filters?.includeSchedules) params.append('includeSchedules', 'true');

    const queryString = params.toString();
    const url = `/students/${studentId}/extra-disciplines${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<ApiResponse<IStudentExtraDiscipline[]>>(url);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar disciplinas extras'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Disciplinas extras recuperadas:', response.data.data.length);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao buscar disciplinas extras:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar disciplinas extras. Tente novamente.');
  }
}

/**
 * Busca disciplina extra específica por ID
 *
 * Retorna dados completos de uma disciplina extra específica.
 *
 * @param {number} id - ID da disciplina extra
 * @returns {Promise<IStudentExtraDiscipline>} Dados da disciplina extra
 * @throws {Error} Quando ID é inválido, registro não encontrado ou erro na API
 *
 * @example
 * try {
 *   const extra = await getById(123);
 *   console.log('Disciplina extra encontrada:', extra.discipline?.name);
 * } catch (error) {
 *   console.error('Erro ao buscar disciplina extra:', error);
 * }
 */
export async function getById(id: number): Promise<IStudentExtraDiscipline> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID da disciplina extra é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Buscando disciplina extra por ID:', id);
    }

    const response = await api.get<ApiResponse<IStudentExtraDiscipline>>(
      `/extra-disciplines/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar disciplina extra'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Disciplina extra encontrada:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao buscar disciplina extra:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar disciplina extra. Tente novamente.');
  }
}

/**
 * Obtém a grade completa do aluno
 *
 * Retorna os horários da turma principal e das disciplinas extras,
 * consolidados em uma única grade semanal.
 *
 * @param {number} studentId - ID do aluno
 * @returns {Promise<IStudentFullSchedule>} Grade completa do aluno
 * @throws {Error} Quando ocorre erro na comunicação com API
 *
 * @example
 * try {
 *   const fullSchedule = await getFullSchedule(1);
 *   console.log('Horários turma principal:', fullSchedule.mainClassSchedules.length);
 *   console.log('Horários extras:', fullSchedule.extraDisciplineSchedules.length);
 * } catch (error) {
 *   console.error('Erro ao buscar grade completa:', error);
 * }
 */
export async function getFullSchedule(studentId: number): Promise<IStudentFullSchedule> {
  try {
    if (!studentId || studentId <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Buscando grade completa do aluno:', studentId);
    }

    const response = await api.get<ApiResponse<IStudentFullSchedule>>(
      `/students/${studentId}/full-schedule`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar grade completa'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Grade completa recuperada');
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao buscar grade completa:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar grade completa. Tente novamente.');
  }
}

/**
 * Vincula uma disciplina extra a um aluno
 *
 * Valida e envia dados da nova disciplina extra para API.
 *
 * @param {number} studentId - ID do aluno
 * @param {IStudentExtraDisciplineFormData} data - Dados da disciplina extra
 * @returns {Promise<IStudentExtraDiscipline>} Dados da disciplina extra criada
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newExtra = await create(1, {
 *     discipline_id: 5,
 *     enrollment_date: '2026-01-18',
 *     reason: 'dependency',
 *     notes: 'Reprovação no semestre anterior'
 *   });
 *   console.log('Disciplina extra criada:', newExtra.id);
 * } catch (error) {
 *   console.error('Erro ao criar disciplina extra:', error);
 * }
 */
export async function create(
  studentId: number,
  data: IStudentExtraDisciplineFormData
): Promise<IStudentExtraDiscipline> {
  try {
    // Validações
    if (!studentId || studentId <= 0) {
      throw new Error('ID do aluno é obrigatório');
    }

    if (!data.discipline_id || data.discipline_id <= 0) {
      throw new Error('Disciplina é obrigatória');
    }

    if (!data.enrollment_date) {
      throw new Error('Data de matrícula é obrigatória');
    }

    if (!data.reason) {
      throw new Error('Motivo é obrigatório');
    }

    const validReasons: ExtraDisciplineReason[] = ['dependency', 'recovery', 'advancement', 'other'];
    if (!validReasons.includes(data.reason)) {
      throw new Error('Motivo inválido');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Criando disciplina extra:', {
        studentId,
        disciplineId: data.discipline_id,
        reason: data.reason,
      });
    }

    const payload = toSnakeCase(studentId, data);

    const response = await api.post<ApiResponse<IStudentExtraDiscipline>>(
      `/students/${studentId}/extra-disciplines`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar disciplina extra'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Disciplina extra criada com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao criar disciplina extra:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar disciplina extra. Tente novamente.');
  }
}

/**
 * Atualiza disciplina extra existente
 *
 * Permite atualização parcial dos dados.
 *
 * @param {number} id - ID da disciplina extra a ser atualizada
 * @param {IStudentExtraDisciplineUpdateRequest} data - Dados a serem atualizados
 * @returns {Promise<IStudentExtraDiscipline>} Dados da disciplina extra atualizada
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updated = await update(123, {
 *     status: 'completed',
 *     notes: 'Concluída com sucesso'
 *   });
 *   console.log('Disciplina extra atualizada:', updated.id);
 * } catch (error) {
 *   console.error('Erro ao atualizar disciplina extra:', error);
 * }
 */
export async function update(
  id: number,
  data: IStudentExtraDisciplineUpdateRequest
): Promise<IStudentExtraDiscipline> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID da disciplina extra é obrigatório e deve ser maior que zero');
    }

    // Validar status se fornecido
    if (data.status !== undefined) {
      const validStatuses: ExtraDisciplineStatus[] = ['active', 'completed', 'cancelled'];
      if (!validStatuses.includes(data.status)) {
        throw new Error('Status inválido');
      }
    }

    // Validar motivo se fornecido
    if (data.reason !== undefined) {
      const validReasons: ExtraDisciplineReason[] = ['dependency', 'recovery', 'advancement', 'other'];
      if (!validReasons.includes(data.reason)) {
        throw new Error('Motivo inválido');
      }
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Atualizando disciplina extra:', id, data);
    }

    // Converter para snake_case apenas os campos fornecidos
    const payload: Record<string, unknown> = {};
    if (data.class_id !== undefined) payload.class_id = data.class_id;
    if (data.status !== undefined) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.reason !== undefined) payload.reason = data.reason;

    const response = await api.put<ApiResponse<IStudentExtraDiscipline>>(
      `/extra-disciplines/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar disciplina extra'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Disciplina extra atualizada com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao atualizar disciplina extra:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar disciplina extra. Tente novamente.');
  }
}

/**
 * Remove disciplina extra do sistema
 *
 * Realiza soft delete da disciplina extra.
 *
 * @param {number} id - ID da disciplina extra a ser removida
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteExtraDiscipline(123);
 *   console.log('Disciplina extra removida com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover disciplina extra:', error);
 * }
 */
export async function deleteExtraDiscipline(id: number): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID da disciplina extra é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Removendo disciplina extra:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/extra-disciplines/${id}`);

    const responseData = response.data as any;
    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover disciplina extra'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Disciplina extra removida com sucesso');
    }
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao remover disciplina extra:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover disciplina extra. Tente novamente.');
  }
}

/**
 * Lista alunos com uma disciplina extra específica
 *
 * Retorna lista de disciplinas extras para uma disciplina específica.
 *
 * @param {number} disciplineId - ID da disciplina
 * @param {IStudentExtraDisciplineFilters} filters - Filtros opcionais
 * @returns {Promise<IStudentExtraDiscipline[]>} Lista de disciplinas extras
 * @throws {Error} Quando ocorre erro na comunicação com API
 *
 * @example
 * try {
 *   const extras = await getByDiscipline(5, { status: 'active' });
 *   console.log('Alunos com disciplina extra:', extras.length);
 * } catch (error) {
 *   console.error('Erro ao buscar alunos:', error);
 * }
 */
export async function getByDiscipline(
  disciplineId: number,
  filters?: IStudentExtraDisciplineFilters
): Promise<IStudentExtraDiscipline[]> {
  try {
    if (!disciplineId || disciplineId <= 0) {
      throw new Error('ID da disciplina é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Buscando alunos com disciplina extra:', disciplineId);
    }

    // Construir query params
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.reason) params.append('reason', filters.reason);

    const queryString = params.toString();
    const url = `/disciplines/${disciplineId}/extra-students${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<ApiResponse<IStudentExtraDiscipline[]>>(url);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar alunos com disciplina extra'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentExtraDisciplineService] Alunos encontrados:', response.data.data.length);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentExtraDisciplineService] Erro ao buscar alunos com disciplina extra:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar alunos com disciplina extra. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getByStudent, getFullSchedule, create } from '@/services/studentExtraDiscipline.service';
 *
 * // Importação do objeto completo
 * import StudentExtraDisciplineService from '@/services/studentExtraDiscipline.service';
 * StudentExtraDisciplineService.getByStudent(1).then(extras => console.log(extras));
 */
const StudentExtraDisciplineService = {
  getByStudent,
  getById,
  getFullSchedule,
  create,
  update,
  delete: deleteExtraDiscipline,
  getByDiscipline,
};

export default StudentExtraDisciplineService;
