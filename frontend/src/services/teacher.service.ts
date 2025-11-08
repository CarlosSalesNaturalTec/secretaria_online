/**
 * Arquivo: frontend/src/services/teacher.service.ts
 * Descrição: Serviço para gerenciamento de professores
 * Feature: feat-084 - Criar teacher.service.ts e página Teachers
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Buscar todos os professores do sistema
 * - Buscar professor por ID
 * - Criar novo professor com dados completos
 * - Atualizar dados de professor existente
 * - Remover professor do sistema
 * - Regenerar senha provisória de professor
 */

import api from './api';
import type { IUser } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Interface para dados de criação de professor
 *
 * Contém todos os campos obrigatórios e opcionais para cadastro de professor
 * Usa snake_case para compatibilidade com o backend
 */
export interface ICreateTeacherData {
  /** Nome completo do professor */
  name: string;
  /** Email do professor */
  email: string;
  /** Login para acesso ao sistema */
  login: string;
  /** CPF (11 dígitos) */
  cpf: string;
  /** RG (opcional) */
  rg?: string;
  /** Nome da mãe (obrigatório para professores) */
  mother_name: string;
  /** Nome do pai (obrigatório para professores) */
  father_name: string;
  /** Endereço completo (obrigatório para professores) */
  address: string;
  /** Título de eleitor (obrigatório para professores) */
  voter_title: string;
  /** Número do reservista (obrigatório para professores) */
  reservist: string;
}

/**
 * Interface para dados de atualização de professor
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 * Usa snake_case para compatibilidade com o backend
 */
export interface IUpdateTeacherData {
  /** Nome completo do professor */
  name?: string;
  /** Email do professor */
  email?: string;
  /** Login para acesso ao sistema */
  login?: string;
  /** CPF (11 dígitos) */
  cpf?: string;
  /** RG (opcional) */
  rg?: string;
  /** Nome da mãe (opcional) */
  mother_name?: string;
  /** Nome do pai (opcional) */
  father_name?: string;
  /** Endereço completo (opcional) */
  address?: string;
  /** Título de eleitor (opcional) */
  voter_title?: string;
  /** Número do reservista (opcional) */
  reservist?: string;
}

/**
 * Busca todos os professores cadastrados no sistema
 *
 * Retorna lista completa de professores com seus dados.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @returns {Promise<IUser[]>} Lista de professores cadastrados
 * @throws {Error} Quando ocorre erro na comunicação com API ou falta de permissão
 *
 * @example
 * try {
 *   const teachers = await getAll();
 *   console.log('Total de professores:', teachers.length);
 * } catch (error) {
 *   console.error('Erro ao buscar professores:', error);
 * }
 */
export async function getAll(): Promise<IUser[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[TeacherService] Buscando todos os professores...');
    }

    const response = await api.get<ApiResponse<IUser[]>>('/teachers');

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar professores'
      );
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
 * @returns {Promise<IUser>} Dados do professor
 * @throws {Error} Quando ID é inválido, professor não encontrado ou erro na API
 *
 * @example
 * try {
 *   const teacher = await getById(123);
 *   console.log('Professor encontrado:', teacher.name);
 * } catch (error) {
 *   console.error('Erro ao buscar professor:', error);
 * }
 */
export async function getById(id: number): Promise<IUser> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Buscando professor por ID:', id);
    }

    const response = await api.get<ApiResponse<IUser>>(`/teachers/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar professor'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor encontrado:', response.data.data.name);
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
 * Cria novo professor no sistema
 *
 * Valida e envia dados do novo professor para API.
 * Sistema gera automaticamente senha provisória que será enviada por email.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {ICreateTeacherData} data - Dados do professor a ser criado
 * @returns {Promise<IUser>} Dados do professor criado
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newTeacher = await create({
 *     name: 'Maria Silva',
 *     email: 'maria@email.com',
 *     login: 'maria.silva',
 *     cpf: '12345678901'
 *   });
 *   console.log('Professor criado:', newTeacher.id);
 * } catch (error) {
 *   console.error('Erro ao criar professor:', error);
 * }
 */
export async function create(data: ICreateTeacherData): Promise<IUser> {
  try {
    // Validações de campos obrigatórios básicos
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Nome é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Email é obrigatório e deve ser válido');
    }

    if (!data.login || data.login.trim().length < 3) {
      throw new Error('Login é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.cpf || data.cpf.replace(/\D/g, '').length !== 11) {
      throw new Error('CPF é obrigatório e deve ter 11 dígitos');
    }

    // Validação de CPF (básica)
    const cpfClean = data.cpf.replace(/\D/g, '');
    if (!/^\d{11}$/.test(cpfClean)) {
      throw new Error('CPF deve conter apenas números');
    }

    // Validações de campos obrigatórios para professores
    if (!data.mother_name || data.mother_name.trim().length < 3) {
      throw new Error('Nome da mãe é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.father_name || data.father_name.trim().length < 3) {
      throw new Error('Nome do pai é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.address || data.address.trim().length < 10) {
      throw new Error('Endereço é obrigatório e deve ter no mínimo 10 caracteres');
    }

    if (!data.voter_title || data.voter_title.trim().length === 0) {
      throw new Error('Título de eleitor é obrigatório para professores');
    }

    if (!data.reservist || data.reservist.trim().length === 0) {
      throw new Error('Número de reservista é obrigatório para professores');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Criando novo professor:', {
        name: data.name,
        email: data.email,
        login: data.login,
      });
    }

    // Preparar dados para envio (remover espaços em branco)
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      login: data.login.trim().toLowerCase(),
      cpf: cpfClean,
      rg: data.rg?.trim(),
      mother_name: data.mother_name.trim(),
      father_name: data.father_name.trim(),
      address: data.address.trim(),
      voter_title: data.voter_title.replace(/\D/g, '').trim(),
      reservist: data.reservist.replace(/\D/g, '').trim(),
    };

    const response = await api.post<ApiResponse<IUser>>('/teachers', payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar professor'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor criado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[TeacherService] Erro ao criar professor:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao criar professor. Tente novamente.';

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
 * @param {IUpdateTeacherData} data - Dados a serem atualizados
 * @returns {Promise<IUser>} Dados do professor atualizado
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedTeacher = await update(123, {
 *     email: 'novoemail@email.com',
 *     address: 'Nova Rua, 123'
 *   });
 *   console.log('Professor atualizado:', updatedTeacher.name);
 * } catch (error) {
 *   console.error('Erro ao atualizar professor:', error);
 * }
 */
export async function update(
  id: number,
  data: IUpdateTeacherData
): Promise<IUser> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    // Validação de dados (se fornecidos)
    if (data.name !== undefined && data.name.trim().length < 3) {
      throw new Error('Nome deve ter no mínimo 3 caracteres');
    }

    if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Email deve ser válido');
    }

    if (data.login !== undefined && data.login.trim().length < 3) {
      throw new Error('Login deve ter no mínimo 3 caracteres');
    }

    if (data.cpf !== undefined) {
      const cpfClean = data.cpf.replace(/\D/g, '');
      if (cpfClean.length !== 11 || !/^\d{11}$/.test(cpfClean)) {
        throw new Error('CPF deve ter 11 dígitos');
      }
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Atualizando professor:', id, data);
    }

    // Preparar dados para envio (remover espaços em branco)
    const payload: any = {};

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.email !== undefined) payload.email = data.email.trim().toLowerCase();
    if (data.login !== undefined) payload.login = data.login.trim().toLowerCase();
    if (data.cpf !== undefined) payload.cpf = data.cpf.replace(/\D/g, '');
    if (data.rg !== undefined) payload.rg = data.rg.trim();
    if (data.mother_name !== undefined) payload.mother_name = data.mother_name.trim();
    if (data.father_name !== undefined) payload.father_name = data.father_name.trim();
    if (data.address !== undefined) payload.address = data.address.trim();
    if (data.voter_title !== undefined) payload.voter_title = data.voter_title.trim();
    if (data.reservist !== undefined) payload.reservist = data.reservist.trim();

    const response = await api.put<ApiResponse<IUser>>(
      `/teachers/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar professor'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor atualizado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[TeacherService] Erro ao atualizar professor:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao atualizar professor. Tente novamente.';

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
 *
 * @example
 * try {
 *   await deleteTeacher(123);
 *   console.log('Professor removido com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover professor:', error);
 * }
 */
export async function deleteTeacher(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Removendo professor:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/teachers/${id}`);

    // Handle 204 No Content (successful deletion with no body)
    // The response.data may be undefined or empty for 204 status
    const responseData = response.data as any;

    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover professor'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Professor removido com sucesso');
    }
  } catch (error: any) {
    console.error('[TeacherService] Erro ao remover professor:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao remover professor. Tente novamente.';

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
 * @param {number} id - ID do professor
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await resetPassword(123);
 *   console.log('Senha provisória enviada para o email do professor');
 * } catch (error) {
 *   console.error('Erro ao regenerar senha:', error);
 * }
 */
export async function resetPassword(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do professor é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Regenerando senha para professor:', id);
    }

    const response = await api.post<ApiResponse<void>>(
      `/teachers/${id}/reset-password`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao regenerar senha'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[TeacherService] Senha regenerada e enviada por email');
    }
  } catch (error: any) {
    console.error('[TeacherService] Erro ao regenerar senha:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao regenerar senha. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getAll, getById, create, update, deleteTeacher, resetPassword } from '@/services/teacher.service';
 *
 * // Importação do objeto completo
 * import TeacherService from '@/services/teacher.service';
 * TeacherService.getAll().then(teachers => console.log(teachers));
 */
const TeacherService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteTeacher,
  resetPassword,
};

export default TeacherService;
