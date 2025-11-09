/**
 * Arquivo: frontend/src/services/enrollment.service.ts
 * Descrição: Serviço para gerenciamento de matrículas de alunos em cursos
 * Feature: feat-106 - Gerenciar matrículas de alunos em cursos (Frontend)
 * Criado em: 2025-11-09
 *
 * Responsabilidades:
 * - Comunicação com API de matrículas
 * - CRUD de matrículas (criar, listar, atualizar, deletar)
 * - Validação e tratamento de erros
 * - Transformação de dados da API para tipos TypeScript
 */

import api from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  IEnrollment,
  IEnrollmentCreateRequest,
  IEnrollmentUpdateRequest,
  IEnrollmentListResponse,
  IEnrollmentFilters,
} from '@/types/enrollment.types';

/**
 * Interface para dados de criação de matrícula (request)
 */
export interface ICreateEnrollmentData {
  studentId: number;
  courseId: number;
  enrollmentDate: string;
}

/**
 * Interface para dados de atualização de matrícula (request)
 */
export interface IUpdateEnrollmentData {
  status?: 'pending' | 'active' | 'cancelled';
  enrollmentDate?: string;
}

/**
 * Busca todas as matrículas com filtros opcionais
 *
 * @param filters - Filtros de busca (opcional)
 * @returns Lista de matrículas
 * @throws Error quando ocorre erro na comunicação com API
 *
 * @example
 * // Buscar todas as matrículas
 * const enrollments = await enrollmentService.getAll();
 *
 * // Buscar com filtros
 * const filtered = await enrollmentService.getAll({
 *   studentId: 5,
 *   status: 'active',
 *   page: 1,
 *   limit: 10
 * });
 */
async function getAll(filters?: IEnrollmentFilters): Promise<IEnrollment[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Buscando matrículas...', filters);
    }

    // Construir parâmetros de query
    const params: Record<string, unknown> = {};
    if (filters) {
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.status) params.status = filters.status;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    }

    const response = await api.get<ApiResponse<IEnrollmentListResponse>>(
      '/enrollments',
      { params }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar matrículas'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EnrollmentService] Matrículas carregadas:',
        response.data.data
      );
    }

    // response.data.data é do tipo IEnrollmentListResponse
    // que contém: success, data (array de IEnrollment), pagination
    const listResponse = response.data.data;
    return (listResponse as IEnrollmentListResponse).data || [];
  } catch (error) {
    console.error('[EnrollmentService] Erro ao buscar matrículas:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao carregar matrículas. Tente novamente.');
  }
}

/**
 * Busca uma matrícula específica pelo ID
 *
 * @param id - ID da matrícula
 * @returns Dados da matrícula
 * @throws Error quando matrícula não é encontrada ou erro na API
 *
 * @example
 * const enrollment = await enrollmentService.getById(1);
 */
async function getById(id: number): Promise<IEnrollment> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Buscando matrícula:', id);
    }

    const response = await api.get<ApiResponse<IEnrollment>>(
      `/enrollments/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Matrícula não encontrada'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EnrollmentService] Matrícula carregada:',
        response.data.data
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[EnrollmentService] Erro ao buscar matrícula:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao carregar matrícula. Tente novamente.');
  }
}

/**
 * Cria uma nova matrícula
 *
 * @param data - Dados da matrícula a criar
 * @returns Matrícula criada
 * @throws Error se validação falhar ou erro na API
 *
 * @example
 * const newEnrollment = await enrollmentService.create({
 *   studentId: 5,
 *   courseId: 1,
 *   enrollmentDate: '2025-01-15'
 * });
 */
async function create(data: ICreateEnrollmentData): Promise<IEnrollment> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Criando matrícula...', data);
    }

    // Validações básicas
    if (!data.studentId || !data.courseId || !data.enrollmentDate) {
      throw new Error('Dados incompletos para criar matrícula');
    }

    // Converter para snake_case conforme esperado pelo backend
    const payload = {
      student_id: data.studentId,
      course_id: data.courseId,
      enrollmentDate: data.enrollmentDate,
    };

    const response = await api.post<ApiResponse<IEnrollment>>(
      '/enrollments',
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar matrícula'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EnrollmentService] Matrícula criada com sucesso:',
        response.data.data
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[EnrollmentService] Erro ao criar matrícula:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao criar matrícula. Tente novamente.');
  }
}

/**
 * Atualiza uma matrícula existente
 *
 * @param id - ID da matrícula a atualizar
 * @param data - Dados a atualizar
 * @returns Matrícula atualizada
 * @throws Error se matrícula não existe ou erro na API
 *
 * @example
 * const updated = await enrollmentService.update(1, {
 *   status: 'active'
 * });
 */
async function update(
  id: number,
  data: IUpdateEnrollmentData
): Promise<IEnrollment> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Atualizando matrícula:', id, data);
    }

    // Converter para snake_case se necessário
    const payload: Record<string, unknown> = {};
    if (data.status) payload.status = data.status;
    if (data.enrollmentDate) payload.enrollmentDate = data.enrollmentDate;

    const response = await api.put<ApiResponse<IEnrollment>>(
      `/enrollments/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar matrícula'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[EnrollmentService] Matrícula atualizada com sucesso:',
        response.data.data
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('[EnrollmentService] Erro ao atualizar matrícula:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao atualizar matrícula. Tente novamente.');
  }
}

/**
 * Atualiza apenas o status de uma matrícula
 *
 * @param id - ID da matrícula
 * @param status - Novo status
 * @returns Matrícula atualizada
 * @throws Error se falhar a atualização
 *
 * @example
 * await enrollmentService.updateStatus(1, 'active');
 */
async function updateStatus(
  id: number,
  status: 'pending' | 'active' | 'cancelled'
): Promise<IEnrollment> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Atualizando status:', id, status);
    }

    const response = await api.put<ApiResponse<IEnrollment>>(
      `/enrollments/${id}/status`,
      { status }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar status'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Status atualizado:', response.data.data);
    }

    return response.data.data;
  } catch (error) {
    console.error('[EnrollmentService] Erro ao atualizar status:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao atualizar status. Tente novamente.');
  }
}

/**
 * Deleta uma matrícula
 *
 * @param id - ID da matrícula a deletar
 * @throws Error se matrícula não existe ou erro na API
 *
 * @example
 * await enrollmentService.delete(1);
 */
async function deleteEnrollment(id: number): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Deletando matrícula:', id);
    }

    const response = await api.delete<ApiResponse<null>>(
      `/enrollments/${id}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao deletar matrícula'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[EnrollmentService] Matrícula deletada com sucesso');
    }
  } catch (error) {
    console.error('[EnrollmentService] Erro ao deletar matrícula:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao deletar matrícula. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getAll, create } from '@/services/enrollment.service';
 *
 * // Importação do objeto completo
 * import EnrollmentService from '@/services/enrollment.service';
 */
const EnrollmentService = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  delete: deleteEnrollment,
};

export default EnrollmentService;
