/**
 * Arquivo: frontend/src/services/teacher.service.ts
 * Descrição: Serviço para gerenciamento de professores
 * Feature: feat-084 - Criar teacher.service.ts e página Teachers
 * Feature: feat-110 - Separar tabela de professores
 * Criado em: 2025-11-04
 * Atualizado em: 2025-12-02
 *
 * Responsabilidades:
 * - Buscar todos os professores da tabela teachers
 * - Buscar professor por ID
 * - Criar novo professor (apenas dados na tabela teachers)
 * - Criar usuário para professor existente
 * - Atualizar dados de professor existente
 * - Remover professor do sistema
 * - Regenerar senha provisória de professor
 */

import api from './api';
import type {
  ITeacher,
  ITeacherCreateRequest,
  ITeacherUpdateRequest,
  ITeacherListResponse,
  ITeacherResponse,
  ITeacherResetPasswordResponse,
  ICreateUserForTeacherRequest,
  ICreateUserForTeacherResponse,
} from '@/types/teacher.types';

/**
 * Busca todos os professores cadastrados no sistema
 *
 * Retorna lista completa de professores da tabela teachers.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @returns {Promise<ITeacher[]>} Lista de professores cadastrados
 * @throws {Error} Quando ocorre erro na comunicação com API ou falta de permissão
 */
export async function getAll(): Promise<ITeacher[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[TeacherService] Buscando todos os professores...');
    }

    const response = await api.get<ITeacherListResponse>('/teachers');

    if (!response.data.success || !response.data.data) {
      throw new Error('Erro ao buscar professores');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professores recuperados:', response.data.data.length);
    }

    return response.data.data;
  } catch (error) {
    console.error('[TeacherService] Erro ao buscar professores:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar professores. Tente novamente.');
  }
}

/**
 * Busca professor específico por ID
 *
 * Retorna dados completos de um professor específico.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do professor
 * @returns {Promise<ITeacher>} Dados do professor
 * @throws {Error} Quando ID é inválido, professor não encontrado ou erro na API
 */
export async function getById(id: number): Promise<ITeacher> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Buscando professor por ID:', id);
    }

    const response = await api.get<ITeacherResponse>(`/teachers/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error('Erro ao buscar professor');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor encontrado:', response.data.data.nome);
    }

    return response.data.data;
  } catch (error) {
    console.error('[TeacherService] Erro ao buscar professor:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar professor. Tente novamente.');
  }
}

/**
 * Cria novo professor no sistema (tabela teachers)
 *
 * Cria apenas o registro na tabela teachers.
 * Para criar usuário de login, use createUser().
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {ITeacherCreateRequest} data - Dados do professor a ser criado
 * @returns {Promise<ITeacher>} Dados do professor criado
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 */
export async function create(data: ITeacherCreateRequest): Promise<ITeacher> {
  try {
    // Validações básicas
    if (!data.nome || data.nome.trim().length < 3) {
      throw new Error('Nome é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Email é obrigatório e deve ser válido');
    }

    if (!data.cpf || data.cpf.replace(/\D/g, '').length !== 11) {
      throw new Error('CPF é obrigatório e deve ter 11 dígitos');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Criando novo professor:', {
        nome: data.nome,
        email: data.email,
      });
    }

    const response = await api.post<ITeacherResponse>('/teachers', data);

    if (!response.data.success || !response.data.data) {
      throw new Error('Erro ao criar professor');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor criado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[TeacherService] Erro ao criar professor:', error);

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Falha ao criar professor. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Cria usuário para um professor existente
 *
 * Verifica se o professor já possui usuário.
 * Gera senha provisória = CPF do professor.
 * Envia email com credenciais.
 *
 * @param {number} teacherId - ID do professor
 * @param {ICreateUserForTeacherRequest} data - Dados opcionais (login personalizado)
 * @returns {Promise<ICreateUserForTeacherResponse>} Usuário criado e senha provisória
 * @throws {Error} Quando professor não encontrado ou já possui usuário
 */
export async function createUser(
  teacherId: number,
  data?: ICreateUserForTeacherRequest
): Promise<ICreateUserForTeacherResponse['data']> {
  try {
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Criando usuário para professor:', teacherId);
    }

    const response = await api.post<ICreateUserForTeacherResponse>(
      `/teachers/${teacherId}/create-user`,
      data || {}
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('Erro ao criar usuário para professor');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Usuário criado com sucesso:', response.data.data.user.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[TeacherService] Erro ao criar usuário:', error);

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Falha ao criar usuário. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Atualiza dados de professor existente
 *
 * Permite atualização parcial dos dados do professor.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do professor a ser atualizado
 * @param {ITeacherUpdateRequest} data - Dados a serem atualizados
 * @returns {Promise<ITeacher>} Dados do professor atualizado
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 */
export async function update(id: number, data: ITeacherUpdateRequest): Promise<ITeacher> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Atualizando professor:', id, data);
    }

    const response = await api.put<ITeacherResponse>(`/teachers/${id}`, data);

    if (!response.data.success || !response.data.data) {
      throw new Error('Erro ao atualizar professor');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor atualizado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[TeacherService] Erro ao atualizar professor:', error);

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Falha ao atualizar professor. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Remove professor do sistema
 *
 * Realiza soft delete do professor (marcado como deletado, não removido fisicamente).
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do professor a ser removido
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 */
export async function deleteTeacher(id: number): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Removendo professor:', id);
    }

    await api.delete(`/teachers/${id}`);

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor removido com sucesso');
    }
  } catch (error: any) {
    console.error('[TeacherService] Erro ao remover professor:', error);

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Falha ao remover professor. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Regenera senha provisória do professor
 *
 * Gera nova senha provisória aleatória e envia para o email do professor.
 * Professor será obrigado a trocar a senha no próximo login.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} teacherId - ID do professor (tabela teachers)
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 */
export async function resetPassword(teacherId: number): Promise<void> {
  try {
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Regenerando senha para professor:', teacherId);
    }

    const response = await api.post<ITeacherResetPasswordResponse>(
      `/teachers/${teacherId}/reset-password`
    );

    if (!response.data.success) {
      throw new Error('Erro ao regenerar senha');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Senha regenerada e enviada por email');
    }
  } catch (error: any) {
    console.error('[TeacherService] Erro ao regenerar senha:', error);

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Falha ao regenerar senha. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 */
const TeacherService = {
  getAll,
  getById,
  create,
  createUser,
  update,
  delete: deleteTeacher,
  resetPassword,
};

export default TeacherService;

// Exportar tipos para uso externo
export type ICreateTeacherData = ITeacherCreateRequest;
export type IUpdateTeacherData = ITeacherUpdateRequest;
