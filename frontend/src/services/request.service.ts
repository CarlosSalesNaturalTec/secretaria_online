/**
 * Arquivo: frontend/src/services/request.service.ts
 * Descrição: Serviço para gerenciamento de solicitações (API)
 * Feature: feat-088 - Criar request.service.ts e página Requests Admin
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Listar solicitações com filtros (status, tipo, aluno, etc.)
 * - Obter solicitação por ID
 * - Aprovar solicitação
 * - Rejeitar solicitação
 * - Obter estatísticas de solicitações
 * - Criar nova solicitação (para alunos)
 * - Listar tipos de solicitação disponíveis
 */

import api from './api';
import type {
  IRequest,
  IRequestListResponse,
  IRequestResponse,
  IRequestFilters,
  IApproveRequestRequest,
  IRejectRequestRequest,
  IRequestStats,
  ICreateRequestRequest,
  IRequestType,
} from '@/types/request.types';

/**
 * Lista todas as solicitações com filtros opcionais
 *
 * @param {IRequestFilters} filters - Filtros opcionais (status, studentId, etc.)
 * @returns {Promise<IRequestListResponse>} Lista de solicitações e paginação
 * @throws {Error} Quando ocorre erro na requisição
 *
 * @example
 * // Listar solicitações pendentes
 * const { data } = await getAll({ status: 'pending' });
 *
 * @example
 * // Listar solicitações de um aluno específico
 * const { data } = await getAll({ studentId: 123, page: 1, limit: 10 });
 */
export async function getAll(
  filters?: IRequestFilters
): Promise<IRequestListResponse> {
  try {
    const response = await api.get<IRequestListResponse>('/requests', {
      params: filters,
    });

    return response.data;
  } catch (error) {
    console.error('[RequestService] Erro ao listar solicitações:', error);
    throw error;
  }
}

/**
 * Obtém uma solicitação por ID
 *
 * @param {number} id - ID da solicitação
 * @returns {Promise<IRequest>} Solicitação encontrada
 * @throws {Error} Quando solicitação não é encontrada ou ocorre erro
 *
 * @example
 * const request = await getById(123);
 */
export async function getById(id: number): Promise<IRequest> {
  try {
    const response = await api.get<IRequestResponse>(`/requests/${id}`);

    return response.data.data;
  } catch (error) {
    console.error(`[RequestService] Erro ao buscar solicitação ${id}:`, error);
    throw error;
  }
}

/**
 * Aprova uma solicitação
 *
 * @param {number} id - ID da solicitação a ser aprovada
 * @param {IApproveRequestRequest} data - Dados de aprovação (observações opcionais)
 * @returns {Promise<IRequest>} Solicitação atualizada
 * @throws {Error} Quando ocorre erro na aprovação
 *
 * @example
 * // Aprovar solicitação sem observações
 * await approve(123);
 *
 * @example
 * // Aprovar solicitação com observações
 * await approve(123, { observations: 'Documento será enviado por email' });
 */
export async function approve(
  id: number,
  data?: IApproveRequestRequest
): Promise<IRequest> {
  try {
    const response = await api.put<IRequestResponse>(
      `/requests/${id}/approve`,
      data
    );

    return response.data.data;
  } catch (error) {
    console.error(`[RequestService] Erro ao aprovar solicitação ${id}:`, error);
    throw error;
  }
}

/**
 * Rejeita uma solicitação
 *
 * @param {number} id - ID da solicitação a ser rejeitada
 * @param {IRejectRequestRequest} data - Dados de rejeição (observações obrigatórias)
 * @returns {Promise<IRequest>} Solicitação atualizada
 * @throws {Error} Quando ocorre erro na rejeição
 *
 * @example
 * await reject(123, { observations: 'Documentação incompleta' });
 */
export async function reject(
  id: number,
  data: IRejectRequestRequest
): Promise<IRequest> {
  try {
    if (!data.observations || data.observations.trim() === '') {
      throw new Error('Observações são obrigatórias ao rejeitar uma solicitação');
    }

    const response = await api.put<IRequestResponse>(
      `/requests/${id}/reject`,
      data
    );

    return response.data.data;
  } catch (error) {
    console.error(`[RequestService] Erro ao rejeitar solicitação ${id}:`, error);
    throw error;
  }
}

/**
 * Remove uma solicitação
 *
 * @param {number} id - ID da solicitação a ser removida
 * @returns {Promise<void>}
 * @throws {Error} Quando ocorre erro na remoção
 *
 * @example
 * await remove(123);
 */
export async function remove(id: number): Promise<void> {
  try {
    await api.delete(`/requests/${id}`);
  } catch (error) {
    console.error(`[RequestService] Erro ao remover solicitação ${id}:`, error);
    throw error;
  }
}

/**
 * Obtém estatísticas de solicitações
 *
 * @returns {Promise<IRequestStats>} Estatísticas de solicitações
 * @throws {Error} Quando ocorre erro ao buscar estatísticas
 *
 * @example
 * const stats = await getStats();
 * console.log(`Solicitações pendentes: ${stats.pending}`);
 */
export async function getStats(): Promise<IRequestStats> {
  try {
    const response = await api.get<{ success: boolean; data: IRequestStats }>(
      '/requests/stats'
    );

    return response.data.data;
  } catch (error) {
    console.error(
      '[RequestService] Erro ao buscar estatísticas de solicitações:',
      error
    );
    throw error;
  }
}

/**
 * Cria uma nova solicitação (usado por alunos)
 *
 * @param {ICreateRequestRequest} data - Dados da nova solicitação
 * @returns {Promise<IRequest>} Solicitação criada
 * @throws {Error} Quando ocorre erro ao criar solicitação
 *
 * @example
 * const newRequest = await create({
 *   requestTypeId: 1,
 *   description: 'Preciso do histórico escolar completo'
 * });
 */
export async function create(data: ICreateRequestRequest): Promise<IRequest> {
  try {
    if (!data.requestTypeId) {
      throw new Error('Tipo de solicitação é obrigatório');
    }

    if (!data.description || data.description.trim() === '') {
      throw new Error('Descrição é obrigatória');
    }

    // Converter camelCase para snake_case para o backend
    const requestData = {
      request_type_id: data.requestTypeId,
      description: data.description,
    };

    const response = await api.post<IRequestResponse>('/requests', requestData);

    return response.data.data;
  } catch (error) {
    console.error('[RequestService] Erro ao criar solicitação:', error);
    throw error;
  }
}

/**
 * Lista todos os tipos de solicitação disponíveis
 *
 * @returns {Promise<IRequestType[]>} Lista de tipos de solicitação
 * @throws {Error} Quando ocorre erro ao buscar tipos
 *
 * @example
 * const types = await getRequestTypes();
 * types.forEach(type => console.log(type.name));
 */
export async function getRequestTypes(): Promise<IRequestType[]> {
  try {
    const response = await api.get<{
      success: boolean;
      data: { requestTypes: IRequestType[] };
    }>('/requests/types');

    return response.data.data.requestTypes;
  } catch (error) {
    console.error(
      '[RequestService] Erro ao buscar tipos de solicitação:',
      error
    );
    throw error;
  }
}

/**
 * Calcula prazo estimado de resposta
 *
 * @param {Date} createdAt - Data de criação da solicitação
 * @param {number} expectedDays - Prazo esperado em dias úteis
 * @returns {string} Data estimada formatada
 *
 * @example
 * const estimatedDate = calculateExpectedDate(new Date(), 5);
 * console.log(`Prazo estimado: ${estimatedDate}`);
 */
export function calculateExpectedDate(
  createdAt: Date,
  expectedDays: number
): string {
  const date = new Date(createdAt);
  let daysAdded = 0;

  while (daysAdded < expectedDays) {
    date.setDate(date.getDate() + 1);
    // Pula finais de semana
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      daysAdded++;
    }
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
