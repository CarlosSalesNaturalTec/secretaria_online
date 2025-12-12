/**
 * Arquivo: frontend/src/services/document.service.ts
 * Descrição: Serviço para gerenciamento de documentos (API)
 * Feature: feat-087 - Criar document.service.ts e página Documents Admin
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Listar documentos com filtros (status, tipo de usuário, etc.)
 * - Obter documento por ID
 * - Aprovar documento
 * - Rejeitar documento
 * - Obter estatísticas de documentos
 * - Fazer download/visualização de documento
 */

import api from './api';
import type {
  IDocument,
  IDocumentListResponse,
  IDocumentResponse,
  IDocumentFilters,
  IApproveDocumentRequest,
  IRejectDocumentRequest,
  IDocumentStats,
} from '@/types/document.types';

/**
 * Lista todos os documentos com filtros opcionais
 *
 * @param {IDocumentFilters} filters - Filtros opcionais (status, userType, etc.)
 * @returns {Promise<IDocumentListResponse>} Lista de documentos e paginação
 * @throws {Error} Quando ocorre erro na requisição
 *
 * @example
 * // Listar documentos pendentes
 * const { data } = await getAll({ status: 'pending' });
 *
 * @example
 * // Listar documentos de alunos com paginação
 * const { data } = await getAll({ userType: 'student', page: 1, limit: 10 });
 */
export async function getAll(
  filters?: IDocumentFilters
): Promise<IDocumentListResponse> {
  try {
    // Se userType for 'student' ou 'teacher', usar rota /my-documents
    // que é acessível para próprio usuário. Caso contrário, usar /documents (admin)
    const endpoint =
      filters?.userType === 'student' || filters?.userType === 'teacher'
        ? '/documents/my-documents'
        : '/documents';

    const response = await api.get<IDocumentListResponse>(endpoint, {
      params: filters,
    });

    return response.data;
  } catch (error) {
    console.error('[DocumentService] Erro ao listar documentos:', error);
    throw error;
  }
}

/**
 * Obtém um documento por ID
 *
 * @param {number} id - ID do documento
 * @returns {Promise<IDocument>} Documento encontrado
 * @throws {Error} Quando documento não é encontrado ou ocorre erro
 *
 * @example
 * const document = await getById(123);
 */
export async function getById(id: number): Promise<IDocument> {
  try {
    const response = await api.get<IDocumentResponse>(`/documents/${id}`);

    return response.data.data;
  } catch (error) {
    console.error(`[DocumentService] Erro ao buscar documento ${id}:`, error);
    throw error;
  }
}

/**
 * Aprova um documento
 *
 * @param {number} id - ID do documento a ser aprovado
 * @param {IApproveDocumentRequest} data - Dados de aprovação (observações opcionais)
 * @returns {Promise<IDocument>} Documento atualizado
 * @throws {Error} Quando ocorre erro na aprovação
 *
 * @example
 * // Aprovar documento sem observações
 * await approve(123);
 *
 * @example
 * // Aprovar documento com observações
 * await approve(123, { observations: 'Documento aprovado conforme solicitado' });
 */
export async function approve(
  id: number,
  data?: IApproveDocumentRequest
): Promise<IDocument> {
  try {
    const response = await api.put<IDocumentResponse>(
      `/documents/${id}/approve`,
      data
    );

    return response.data.data;
  } catch (error) {
    console.error(`[DocumentService] Erro ao aprovar documento ${id}:`, error);
    throw error;
  }
}

/**
 * Rejeita um documento
 *
 * @param {number} id - ID do documento a ser rejeitado
 * @param {IRejectDocumentRequest} data - Dados de rejeição (observações obrigatórias)
 * @returns {Promise<IDocument>} Documento atualizado
 * @throws {Error} Quando ocorre erro na rejeição
 *
 * @example
 * await reject(123, { observations: 'Documento ilegível, favor reenviar' });
 */
export async function reject(
  id: number,
  data: IRejectDocumentRequest
): Promise<IDocument> {
  try {
    if (!data.observations || data.observations.trim() === '') {
      throw new Error('Observações são obrigatórias ao rejeitar um documento');
    }

    const response = await api.put<IDocumentResponse>(
      `/documents/${id}/reject`,
      data
    );

    return response.data.data;
  } catch (error) {
    console.error(`[DocumentService] Erro ao rejeitar documento ${id}:`, error);
    throw error;
  }
}

/**
 * Remove um documento
 *
 * @param {number} id - ID do documento a ser removido
 * @returns {Promise<void>}
 * @throws {Error} Quando ocorre erro na remoção
 *
 * @example
 * await remove(123);
 */
export async function remove(id: number): Promise<void> {
  try {
    await api.delete(`/documents/${id}`);
  } catch (error) {
    console.error(`[DocumentService] Erro ao remover documento ${id}:`, error);
    throw error;
  }
}

/**
 * Obtém estatísticas de documentos
 *
 * @returns {Promise<IDocumentStats>} Estatísticas de documentos
 * @throws {Error} Quando ocorre erro ao buscar estatísticas
 *
 * @example
 * const stats = await getStats();
 * console.log(`Documentos pendentes: ${stats.pending}`);
 */
export async function getStats(): Promise<IDocumentStats> {
  try {
    const response = await api.get<{ success: boolean; data: IDocumentStats }>(
      '/documents/stats'
    );

    return response.data.data;
  } catch (error) {
    console.error(
      '[DocumentService] Erro ao buscar estatísticas de documentos:',
      error
    );
    throw error;
  }
}

/**
 * Gera URL para visualização/download de documento
 *
 * @param {number} id - ID do documento
 * @returns {string} URL completa para acesso ao arquivo
 *
 * @example
 * const url = getFileUrl(123);
 * window.open(url, '_blank');
 */
export function getFileUrl(id: number): string {
  const baseURL = api.defaults.baseURL || 'http://localhost:3000/api/v1';
  return `${baseURL}/documents/${id}/file`;
}

/**
 * Faz download de um documento
 *
 * @param {number} id - ID do documento
 * @param {string} fileName - Nome do arquivo para download
 * @returns {Promise<void>}
 * @throws {Error} Quando ocorre erro no download
 *
 * @example
 * await downloadFile(123, 'documento.pdf');
 */
export async function downloadFile(
  id: number,
  fileName: string
): Promise<void> {
  try {
    const response = await api.get(`/documents/${id}/file`, {
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
    console.error(`[DocumentService] Erro ao baixar documento ${id}:`, error);
    throw error;
  }
}
