/**
 * Arquivo: frontend/src/services/student.service.ts
 * Descrição: Serviço para gerenciamento de estudantes
 * Feature: feat-082 - Criar student.service.ts
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-11-04
 * Atualizado em: 2025-12-01
 */

import api from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  IStudent,
  IStudentCreateRequest,
  IStudentUpdateRequest,
  ICreateUserForStudentRequest,
  ICreateUserForStudentResponse,
  ICheckUserResponse,
} from '@/types/student.types';

/**
 * Interface para resposta paginada de estudantes
 */
export interface IStudentsPaginatedResponse {
  students: IStudent[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Interface para opções de listagem de estudantes
 */
export interface IStudentsQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  matricula?: string;
  status?: string;
}

/**
 * Busca todos os estudantes cadastrados com paginação e busca
 */
export async function getAll(options?: IStudentsQueryOptions): Promise<IStudentsPaginatedResponse> {
  try {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.matricula) params.append('matricula', options.matricula);
    if (options?.status) params.append('status', options.status);

    const response = await api.get<ApiResponse<IStudentsPaginatedResponse>>(
      `/students?${params.toString()}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao buscar estudantes');
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao buscar estudantes';
    throw new Error(errorMessage);
  }
}

/**
 * Busca estudante por ID
 */
export async function getById(id: number): Promise<IStudent> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do estudante é obrigatório');
    }

    const response = await api.get<ApiResponse<IStudent>>(`/students/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao buscar estudante');
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao buscar estudante';
    throw new Error(errorMessage);
  }
}

/**
 * Cria novo estudante (somente dados básicos)
 * Para criar usuário, use createUserForStudent()
 */
export async function create(data: IStudentCreateRequest): Promise<IStudent> {
  try {
    const response = await api.post<ApiResponse<IStudent>>('/students', data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao criar estudante');
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao criar estudante';
    throw new Error(errorMessage);
  }
}

/**
 * Atualiza dados do estudante
 */
export async function update(id: number, data: IStudentUpdateRequest): Promise<IStudent> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do estudante é obrigatório');
    }

    const response = await api.put<ApiResponse<IStudent>>(`/students/${id}`, data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar estudante');
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao atualizar estudante';
    throw new Error(errorMessage);
  }
}

/**
 * Remove estudante (soft delete)
 */
export async function deleteStudent(id: number): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do estudante é obrigatório');
    }

    const response = await api.delete<ApiResponse<void>>(`/students/${id}`);

    const responseData = response.data as any;
    if (responseData && !responseData.success) {
      throw new Error(responseData.error?.message || 'Erro ao remover estudante');
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao remover estudante';
    throw new Error(errorMessage);
  }
}

/**
 * Cria usuário para um estudante existente
 * Senha provisória = CPF do estudante
 */
export async function createUserForStudent(
  studentId: number,
  data?: ICreateUserForStudentRequest
): Promise<ICreateUserForStudentResponse['data']> {
  try {
    if (!studentId || studentId <= 0) {
      throw new Error('ID do estudante é obrigatório');
    }

    const response = await api.post<ICreateUserForStudentResponse>(
      `/students/${studentId}/create-user`,
      data || {}
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('Erro ao criar usuário');
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao criar usuário para estudante';
    throw new Error(errorMessage);
  }
}

/**
 * Verifica se estudante possui usuário cadastrado
 */
export async function checkUserExists(studentId: number): Promise<ICheckUserResponse['data']> {
  try {
    if (!studentId || studentId <= 0) {
      throw new Error('ID do estudante é obrigatório');
    }

    const response = await api.get<ICheckUserResponse>(`/students/${studentId}/check-user`);

    if (!response.data.success) {
      throw new Error('Erro ao verificar usuário');
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao verificar usuário';
    throw new Error(errorMessage);
  }
}

/**
 * Regenera senha provisória do usuário do estudante
 */
export async function resetPassword(studentId: number): Promise<void> {
  try {
    if (!studentId || studentId <= 0) {
      throw new Error('ID do estudante é obrigatório');
    }

    const response = await api.post<ApiResponse<{ temporaryPassword: string }>>(
      `/students/${studentId}/reset-password`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao regenerar senha');
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Falha ao regenerar senha';
    throw new Error(errorMessage);
  }
}

const StudentService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteStudent,
  createUserForStudent,
  checkUserExists,
  resetPassword,
};

export default StudentService;
