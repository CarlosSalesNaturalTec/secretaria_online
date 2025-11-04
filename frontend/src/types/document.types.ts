/**
 * Arquivo: frontend/src/types/document.types.ts
 * Descrição: Interfaces TypeScript para documentos
 * Feature: feat-087 - Criar document.service.ts e página Documents Admin
 * Criado em: 2025-11-04
 */

/**
 * Status possíveis de um documento
 */
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

/**
 * Tipo de usuário que enviou o documento
 */
export type DocumentUserType = 'student' | 'teacher';

/**
 * Interface para tipo de documento obrigatório
 */
export interface IDocumentType {
  id: number;
  name: string;
  description: string;
  userType: DocumentUserType;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para usuário (informações básicas)
 */
export interface IDocumentUser {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: DocumentUserType;
}

/**
 * Interface para documento enviado por aluno/professor
 */
export interface IDocument {
  id: number;
  userId: number;
  documentTypeId: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  // Relacionamentos
  user?: IDocumentUser;
  documentType?: IDocumentType;
  reviewer?: {
    id: number;
    name: string;
  } | null;
}

/**
 * Interface para filtros de listagem de documentos
 */
export interface IDocumentFilters {
  status?: DocumentStatus;
  userType?: DocumentUserType;
  userId?: number;
  documentTypeId?: number;
  page?: number;
  limit?: number;
}

/**
 * Interface para resposta paginada de documentos
 */
export interface IDocumentListResponse {
  success: boolean;
  data: {
    documents: IDocument[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Interface para resposta de documento único
 */
export interface IDocumentResponse {
  success: boolean;
  data: IDocument;
  message?: string;
}

/**
 * Interface para aprovar documento
 */
export interface IApproveDocumentRequest {
  observations?: string;
}

/**
 * Interface para rejeitar documento
 */
export interface IRejectDocumentRequest {
  observations: string; // Obrigatório ao rejeitar
}

/**
 * Interface para upload de documento
 */
export interface IUploadDocumentRequest {
  documentTypeId: number;
  file: File;
}

/**
 * Interface para estatísticas de documentos
 */
export interface IDocumentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
