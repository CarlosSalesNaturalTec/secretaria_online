/**
 * Arquivo: frontend/src/services/student.service.ts
 * Descrição: Serviço para gerenciamento de alunos
 * Feature: feat-082 - Criar student.service.ts
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Buscar todos os alunos do sistema
 * - Buscar aluno por ID
 * - Criar novo aluno com dados completos
 * - Atualizar dados de aluno existente
 * - Remover aluno do sistema
 * - Regenerar senha provisória de aluno
 */

import api from './api';
import type { IUser } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Interface para dados de criação de aluno
 *
 * Contém todos os campos obrigatórios e opcionais para cadastro de aluno
 * Usa snake_case para compatibilidade com o backend
 */
export interface ICreateStudentData {
  /** Nome completo do aluno */
  name: string;
  /** Email do aluno */
  email: string;
  /** Login para acesso ao sistema */
  login: string;
  /** CPF (11 dígitos) */
  cpf: string;
  /** RG (opcional) */
  rg?: string;
  /** Nome da mãe (obrigatório para alunos) */
  mother_name: string;
  /** Nome do pai (obrigatório para alunos) */
  father_name: string;
  /** Endereço completo (obrigatório para alunos) */
  address: string;
  /** Título de eleitor (obrigatório para alunos) */
  voter_title: string;
  /** Número do reservista (obrigatório para alunos) */
  reservist: string;
}

/**
 * Interface para dados de atualização de aluno
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 * Usa snake_case para compatibilidade com o backend
 */
export interface IUpdateStudentData {
  /** Nome completo do aluno */
  name?: string;
  /** Email do aluno */
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
 * Busca todos os alunos cadastrados no sistema
 *
 * Retorna lista completa de alunos com seus dados.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @returns {Promise<IUser[]>} Lista de alunos cadastrados
 * @throws {Error} Quando ocorre erro na comunicação com API ou falta de permissão
 *
 * @example
 * try {
 *   const students = await getAll();
 *   console.log('Total de alunos:', students.length);
 * } catch (error) {
 *   console.error('Erro ao buscar alunos:', error);
 * }
 */
export async function getAll(): Promise<IUser[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[StudentService] Buscando todos os alunos...');
    }

    const response = await api.get<ApiResponse<IUser[]>>('/students');

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar alunos'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Alunos recuperados:', response.data.data.length);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentService] Erro ao buscar alunos:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar alunos. Tente novamente.');
  }
}

/**
 * Busca aluno específico por ID
 *
 * Retorna dados completos de um aluno específico.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do aluno
 * @returns {Promise<IUser>} Dados do aluno
 * @throws {Error} Quando ID é inválido, aluno não encontrado ou erro na API
 *
 * @example
 * try {
 *   const student = await getById(123);
 *   console.log('Aluno encontrado:', student.name);
 * } catch (error) {
 *   console.error('Erro ao buscar aluno:', error);
 * }
 */
export async function getById(id: number): Promise<IUser> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Buscando aluno por ID:', id);
    }

    const response = await api.get<ApiResponse<IUser>>(`/students/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar aluno'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Aluno encontrado:', response.data.data.name);
    }

    return response.data.data;
  } catch (error) {
    console.error('[StudentService] Erro ao buscar aluno:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar aluno. Tente novamente.');
  }
}

/**
 * Cria novo aluno no sistema
 *
 * Valida e envia dados do novo aluno para API.
 * Sistema gera automaticamente senha provisória que será enviada por email.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {ICreateStudentData} data - Dados do aluno a ser criado
 * @returns {Promise<IUser>} Dados do aluno criado
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newStudent = await create({
 *     name: 'João Silva',
 *     email: 'joao@email.com',
 *     login: 'joao.silva',
 *     cpf: '12345678901'
 *   });
 *   console.log('Aluno criado:', newStudent.id);
 * } catch (error) {
 *   console.error('Erro ao criar aluno:', error);
 * }
 */
export async function create(data: ICreateStudentData): Promise<IUser> {
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

    // Validações de campos obrigatórios para alunos
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
      throw new Error('Título de eleitor é obrigatório para alunos');
    }

    if (!data.reservist || data.reservist.trim().length === 0) {
      throw new Error('Número de reservista é obrigatório para alunos');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Criando novo aluno:', {
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
      voter_title: data.voter_title.replace(/\D/g, '').trim(),
      reservist: data.reservist.replace(/\D/g, '').trim(),
      mother_name: data.mother_name.trim(),
      father_name: data.father_name.trim(),
      address: data.address.trim(),
    };

    if (import.meta.env.DEV) {
      console.log('[StudentService] Payload a ser enviado:', payload);
    }

    const response = await api.post<ApiResponse<IUser>>('/students', payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar aluno'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Aluno criado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[StudentService] Erro ao criar aluno:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao criar aluno. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Atualiza dados de aluno existente
 *
 * Permite atualização parcial dos dados do aluno.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do aluno a ser atualizado
 * @param {IUpdateStudentData} data - Dados a serem atualizados
 * @returns {Promise<IUser>} Dados do aluno atualizado
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedStudent = await update(123, {
 *     email: 'novoemail@email.com',
 *     address: 'Nova Rua, 123'
 *   });
 *   console.log('Aluno atualizado:', updatedStudent.name);
 * } catch (error) {
 *   console.error('Erro ao atualizar aluno:', error);
 * }
 */
export async function update(
  id: number,
  data: IUpdateStudentData
): Promise<IUser> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
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
      console.log('[StudentService] Atualizando aluno:', id, data);
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

    if (import.meta.env.DEV) {
      console.log('[StudentService] Payload a ser enviado na atualização:', payload);
    }

    const response = await api.put<ApiResponse<IUser>>(
      `/students/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar aluno'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Aluno atualizado com sucesso:', response.data.data.id);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[StudentService] Erro ao atualizar aluno:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao atualizar aluno. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Remove aluno do sistema
 *
 * Realiza soft delete do aluno (marcado como deletado, não removido fisicamente).
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do aluno a ser removido
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteStudent(123);
 *   console.log('Aluno removido com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover aluno:', error);
 * }
 */
export async function deleteStudent(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Removendo aluno:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/students/${id}`);

    // Handle 204 No Content (successful deletion with no body)
    // The response.data may be undefined or empty for 204 status
    const responseData = response.data as any;

    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover aluno'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Aluno removido com sucesso');
    }
  } catch (error: any) {
    console.error('[StudentService] Erro ao remover aluno:', error);

    // Extrai mensagem de erro mais específica (para status 409, 422, etc)
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message
      || 'Falha ao remover aluno. Tente novamente.';

    throw new Error(errorMessage);
  }
}

/**
 * Regenera senha provisória do aluno
 *
 * Gera nova senha provisória aleatória e envia para o email do aluno.
 * Aluno será obrigado a trocar a senha no próximo login.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do aluno
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await resetPassword(123);
 *   console.log('Senha provisória enviada para o email do aluno');
 * } catch (error) {
 *   console.error('Erro ao regenerar senha:', error);
 * }
 */
export async function resetPassword(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do aluno é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Regenerando senha para aluno:', id);
    }

    const response = await api.post<ApiResponse<void>>(
      `/students/${id}/reset-password`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao regenerar senha'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[StudentService] Senha regenerada e enviada por email');
    }
  } catch (error: any) {
    console.error('[StudentService] Erro ao regenerar senha:', error);

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
 * import { getAll, getById, create, update, deleteStudent, resetPassword } from '@/services/student.service';
 *
 * // Importação do objeto completo
 * import StudentService from '@/services/student.service';
 * StudentService.getAll().then(students => console.log(students));
 */
const StudentService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteStudent,
  resetPassword,
};

export default StudentService;
