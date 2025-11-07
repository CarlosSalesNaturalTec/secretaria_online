/**
 * Arquivo: frontend/src/services/user.service.ts
 * Descrição: Serviço para gerenciamento de usuários administrativos
 * Feature: feat-082 - Implementar página de usuários admin
 * Criado em: 2025-11-07
 */

import api from './api';
import type { IUser, ICreateUser, IUpdateUser } from '@/types/user.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

/**
 * Interface de filtros para listagem de usuários
 */
export interface IUserFilters {
  role?: 'admin' | 'teacher' | 'student';
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Busca lista de usuários com filtros e paginação
 */
export async function getUsers(
  filters?: IUserFilters
): Promise<PaginatedResponse<IUser>> {
  const response = await api.get<any>(
    '/users',
    { params: filters }
  );

  if (!response.data.success) {
    throw new Error('Erro ao buscar usuários');
  }

  // Backend retorna diretamente: { success: true, data: [...], pagination: {...} }
  const users = response.data.data || [];
  const pagination = response.data.pagination || {};

  return {
    data: users,
    pagination: {
      page: pagination.currentPage || 1,
      limit: pagination.recordsPerPage || 10,
      total: pagination.totalRecords || 0,
      totalPages: pagination.totalPages || 1,
    },
  };
}

/**
 * Busca um usuário por ID
 */
export async function getUserById(id: number): Promise<IUser> {
  const response = await api.get<ApiResponse<IUser>>(`/users/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error('Erro ao buscar usuário');
  }

  return response.data.data;
}

/**
 * Cria um novo usuário
 */
export async function createUser(userData: ICreateUser): Promise<IUser> {
  try {
    const response = await api.post<ApiResponse<IUser>>('/users', userData);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar usuário'
      );
    }

    return response.data.data;
  } catch (error: any) {
    // Extrai mensagem de erro mais específica
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Erro ao criar usuário';

    throw new Error(errorMessage);
  }
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(
  id: number,
  userData: IUpdateUser
): Promise<IUser> {
  try {
    const response = await api.put<ApiResponse<IUser>>(
      `/users/${id}`,
      userData
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar usuário'
      );
    }

    return response.data.data;
  } catch (error: any) {
    // Extrai mensagem de erro mais específica
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Erro ao atualizar usuário';

    throw new Error(errorMessage);
  }
}

/**
 * Deleta um usuário (soft delete)
 */
export async function deleteUser(id: number): Promise<void> {
  try {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao deletar usuário'
      );
    }
  } catch (error: any) {
    // Extrai mensagem de erro mais específica
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Erro ao deletar usuário';

    throw new Error(errorMessage);
  }
}

const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default UserService;
