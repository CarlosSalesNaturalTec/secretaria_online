/**
 * Arquivo: frontend/src/types/request.types.ts
 * Descrição: Types e interfaces para o módulo de solicitações
 * Feature: feat-088 - Criar request.service.ts e página Requests Admin
 * Feature: feat-101 - Criar types TypeScript (atualização)
 * Criado em: 2025-11-04
 */

/**
 * Status possíveis de uma solicitação
 */
export type RequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Tipos de solicitação disponíveis
 */
export type RequestType =
  | 'certificate'
  | 'transcript'
  | 'declaration'
  | 'transfer'
  | 'complementary_activities'
  | 'enrollment_cancellation';

/**
 * Interface base de uma solicitação
 */
export interface IRequest {
  id: number;
  studentId: number;
  requestTypeId: number;
  description: string;
  status: RequestStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  student?: {
    id: number;
    name: string;
    email: string;
    cpf?: string;
  };
  requestType?: {
    id: number;
    name: string;
    description: string;
    expectedDays: number;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Interface para listagem de solicitações
 */
export interface IRequestListResponse {
  success: boolean;
  data: {
    requests: IRequest[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Interface para resposta de solicitação única
 */
export interface IRequestResponse {
  success: boolean;
  data: IRequest;
  message?: string;
}

/**
 * Interface para filtros de listagem
 */
export interface IRequestFilters {
  status?: RequestStatus;
  studentId?: number;
  requestTypeId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Interface para aprovar solicitação
 */
export interface IApproveRequestRequest {
  observations?: string;
}

/**
 * Interface para rejeitar solicitação
 */
export interface IRejectRequestRequest {
  observations: string;
}

/**
 * Interface para estatísticas de solicitações
 */
export interface IRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Interface para criar nova solicitação (usado por alunos)
 */
export interface ICreateRequestRequest {
  requestTypeId: number;
  description: string;
}

/**
 * Interface para tipo de solicitação
 */
export interface IRequestType {
  id: number;
  name: string;
  description: string;
  expectedDays: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para criar nova solicitação (admin)
 */
export interface ICreateRequestTypeRequest {
  /**
   * Nome do tipo de solicitação
   */
  name: string;

  /**
   * Descrição
   */
  description: string;

  /**
   * Prazo esperado em dias úteis
   */
  expectedDays: number;
}

/**
 * Dados para editar tipo de solicitação
 */
export interface IUpdateRequestTypeRequest {
  /**
   * Nome (opcional)
   */
  name?: string;

  /**
   * Descrição (opcional)
   */
  description?: string;

  /**
   * Prazo em dias úteis (opcional)
   */
  expectedDays?: number;
}

/**
 * Dados para aluno criar solicitação
 */
export interface IStudentCreateRequestRequest {
  /**
   * ID do tipo de solicitação
   */
  requestTypeId: number;

  /**
   * Descrição/detalhes da solicitação
   */
  description: string;
}

/**
 * Resposta ao criar solicitação
 */
export interface ICreateRequestResponse {
  /**
   * Indica sucesso
   */
  success: boolean;

  /**
   * Dados da solicitação criada
   */
  data: IRequest;

  /**
   * Mensagem de sucesso
   */
  message: string;
}
