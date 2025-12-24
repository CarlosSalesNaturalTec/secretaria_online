/**
 * Arquivo: frontend/src/services/contract.service.ts
 * Descrição: Serviço para gerenciamento de contratos (API)
 * Criado em: 2025-12-24
 *
 * Responsabilidades:
 * - Listar contratos do usuário autenticado
 * - Obter contrato por ID
 * - Aceitar contrato pendente
 * - Fazer download de PDF de contrato
 */

import api from './api';
import type {
  IContract,
  IContractListResponse,
  IContractResponse,
  IContractFilters,
  IAcceptContractRequest,
} from '@/types/contract.types';

/**
 * Lista todos os contratos do usuário autenticado
 *
 * @param {IContractFilters} filters - Filtros opcionais (status, paginação)
 * @returns {Promise<IContractListResponse>} Lista de contratos e paginação
 * @throws {Error} Quando ocorre erro na requisição
 *
 * @example
 * // Listar todos os contratos
 * const { data } = await getAll();
 *
 * @example
 * // Listar contratos pendentes
 * const { data } = await getAll({ status: 'pending' });
 *
 * @example
 * // Listar com paginação
 * const { data } = await getAll({ limit: 10, offset: 0 });
 */
export async function getAll(
  filters?: IContractFilters
): Promise<IContractListResponse> {
  try {
    const response = await api.get<IContractListResponse>('/contracts', {
      params: filters,
    });

    return response.data;
  } catch (error) {
    console.error('[ContractService] Erro ao listar contratos:', error);
    throw error;
  }
}

/**
 * Obtém um contrato por ID
 *
 * @param {number} id - ID do contrato
 * @returns {Promise<IContract>} Contrato encontrado
 * @throws {Error} Quando contrato não é encontrado ou ocorre erro
 *
 * @example
 * const contract = await getById(123);
 */
export async function getById(id: number): Promise<IContract> {
  try {
    const response = await api.get<IContractResponse>(`/contracts/${id}`);

    return response.data.data;
  } catch (error) {
    console.error(`[ContractService] Erro ao buscar contrato ${id}:`, error);
    throw error;
  }
}

/**
 * Aceita um contrato pendente
 *
 * @param {number} id - ID do contrato a ser aceito
 * @param {IAcceptContractRequest} data - Dados de aceite (opcional)
 * @returns {Promise<IContract>} Contrato atualizado
 * @throws {Error} Quando ocorre erro no aceite
 *
 * @example
 * await accept(123);
 */
export async function accept(
  id: number,
  data?: IAcceptContractRequest
): Promise<IContract> {
  try {
    const response = await api.post<IContractResponse>(
      `/contracts/${id}/accept`,
      data
    );

    return response.data.data;
  } catch (error) {
    console.error(`[ContractService] Erro ao aceitar contrato ${id}:`, error);
    throw error;
  }
}

/**
 * Gera URL para visualização/download de PDF do contrato
 *
 * @param {number} id - ID do contrato
 * @returns {string} URL completa para acesso ao PDF
 *
 * @example
 * const url = getPdfUrl(123);
 * window.open(url, '_blank');
 */
export function getPdfUrl(id: number): string {
  const baseURL = api.defaults.baseURL || 'http://localhost:3000/api/v1';
  return `${baseURL}/contracts/${id}/pdf`;
}

/**
 * Faz download do PDF de um contrato
 *
 * @param {number} id - ID do contrato
 * @param {string} fileName - Nome do arquivo para download
 * @returns {Promise<void>}
 * @throws {Error} Quando ocorre erro no download
 *
 * @example
 * await downloadPdf(123, 'contrato_matricula.pdf');
 */
export async function downloadPdf(
  id: number,
  fileName: string
): Promise<void> {
  try {
    const response = await api.get(`/contracts/${id}/pdf`, {
      responseType: 'blob',
    });

    // Cria link temporário para download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`[ContractService] Erro ao baixar PDF do contrato ${id}:`, error);
    throw error;
  }
}
