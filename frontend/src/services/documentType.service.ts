/**
 * Arquivo: frontend/src/services/documentType.service.ts
 * Descrição: Serviço para gerenciamento de tipos de documentos (API)
 * Feature: feat-XXX - Carregar tipos de documentos dinamicamente
 * Criado em: 2026-02-10
 *
 * Responsabilidades:
 * - Listar tipos de documentos disponíveis
 * - Filtrar tipos por tipo de usuário (student, teacher)
 * - Obter tipos obrigatórios
 */

import api from './api';

/**
 * Interface para tipo de documento
 */
export interface IDocumentType {
  id: number;
  name: string;
  description?: string;
  user_type: 'student' | 'teacher' | 'both';
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para resposta de lista de tipos de documentos
 */
export interface IDocumentTypeListResponse {
  success: boolean;
  data: {
    documentTypes: IDocumentType[];
    total: number;
  };
}

/**
 * Interface para resposta de tipo de documento individual
 */
export interface IDocumentTypeResponse {
  success: boolean;
  data: {
    documentType: IDocumentType;
  };
}

/**
 * Interface para filtros de tipos de documentos
 */
export interface IDocumentTypeFilters {
  userType?: 'student' | 'teacher' | 'both';
}

/**
 * Lista todos os tipos de documentos ativos
 *
 * @param {IDocumentTypeFilters} filters - Filtros opcionais (userType)
 * @returns {Promise<IDocumentTypeListResponse>} Lista de tipos de documentos
 * @throws {Error} Quando ocorre erro na requisição
 *
 * @example
 * // Listar todos os tipos
 * const { data } = await getAll();
 *
 * @example
 * // Listar tipos para alunos
 * const { data } = await getAll({ userType: 'student' });
 */
export async function getAll(
  filters?: IDocumentTypeFilters
): Promise<IDocumentTypeListResponse> {
  try {
    const params: Record<string, string> = {};

    if (filters?.userType) {
      params.userType = filters.userType;
    }

    const response = await api.get<IDocumentTypeListResponse>('/document-types', {
      params,
    });

    return response.data;
  } catch (error) {
    console.error('[documentType.service] Erro ao listar tipos de documentos:', error);
    throw error;
  }
}

/**
 * Lista tipos de documentos obrigatórios para alunos
 *
 * @returns {Promise<IDocumentTypeListResponse>} Lista de tipos obrigatórios
 * @throws {Error} Quando ocorre erro na requisição
 *
 * @example
 * const { data } = await getRequiredForStudents();
 */
export async function getRequiredForStudents(): Promise<IDocumentTypeListResponse> {
  try {
    const response = await api.get<IDocumentTypeListResponse>(
      '/document-types/required/students'
    );
    return response.data;
  } catch (error) {
    console.error('[documentType.service] Erro ao listar tipos obrigatórios para alunos:', error);
    throw error;
  }
}

/**
 * Lista tipos de documentos obrigatórios para professores
 *
 * @returns {Promise<IDocumentTypeListResponse>} Lista de tipos obrigatórios
 * @throws {Error} Quando ocorre erro na requisição
 *
 * @example
 * const { data } = await getRequiredForTeachers();
 */
export async function getRequiredForTeachers(): Promise<IDocumentTypeListResponse> {
  try {
    const response = await api.get<IDocumentTypeListResponse>(
      '/document-types/required/teachers'
    );
    return response.data;
  } catch (error) {
    console.error('[documentType.service] Erro ao listar tipos obrigatórios para professores:', error);
    throw error;
  }
}

/**
 * Busca um tipo de documento por ID
 *
 * @param {number} id - ID do tipo de documento
 * @returns {Promise<IDocumentTypeResponse>} Tipo de documento encontrado
 * @throws {Error} Quando ocorre erro na requisição ou tipo não encontrado
 *
 * @example
 * const { data } = await getById(1);
 */
export async function getById(id: number): Promise<IDocumentTypeResponse> {
  try {
    const response = await api.get<IDocumentTypeResponse>(`/document-types/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[documentType.service] Erro ao buscar tipo de documento (ID: ${id}):`, error);
    throw error;
  }
}
