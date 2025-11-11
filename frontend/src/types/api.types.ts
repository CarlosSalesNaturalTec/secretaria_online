/**
 * Arquivo: frontend/src/types/api.types.ts
 * Descrição: Tipos e interfaces para comunicação com API
 * Feature: feat-003 - Setup do frontend React com Vite
 * Criado em: 2025-10-24
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
