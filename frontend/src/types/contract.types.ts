/**
 * Arquivo: frontend/src/types/contract.types.ts
 * Descrição: Tipos TypeScript para contratos
 * Criado em: 2025-12-24
 *
 * Responsabilidades:
 * - Definir interfaces para contratos
 * - Tipar respostas da API de contratos
 * - Garantir type safety em todo o sistema
 */

/**
 * Interface para um contrato
 */
export interface IContract {
  id: number;
  userId: number;
  enrollmentId: number | null;
  templateId: number;
  filePath: string | null;
  fileName: string | null;
  semester: number;
  year: number;
  acceptedAt: string | null;
  status: 'pending' | 'accepted';
  createdAt: string;
  updatedAt?: string;
  // Dados relacionados (incluídos em algumas queries)
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  template?: {
    id: number;
    name: string;
  };
  enrollment?: {
    id: number;
    studentId: number;
    courseId: number;
  };
}

/**
 * Resposta da API ao listar contratos
 */
export interface IContractListResponse {
  success: true;
  data: IContract[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Resposta da API ao buscar/criar/atualizar um contrato
 */
export interface IContractResponse {
  success: true;
  data: IContract;
  message?: string;
}

/**
 * Filtros para listagem de contratos
 */
export interface IContractFilters {
  status?: 'pending' | 'accepted';
  limit?: number;
  offset?: number;
}

/**
 * Request para aceitar contrato
 */
export interface IAcceptContractRequest {
  // Vazio por enquanto, pode adicionar campos futuros
}
