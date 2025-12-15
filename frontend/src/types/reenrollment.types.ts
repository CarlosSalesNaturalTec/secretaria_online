/**
 * Arquivo: frontend/src/types/reenrollment.types.ts
 * Descrição: Tipos TypeScript para rematrícula global de estudantes
 * Feature: feat-reenrollment-etapa-5 - Frontend Interface de Rematrícula Global
 * Criado em: 2025-12-15
 */

/**
 * Request para processar rematrícula global
 */
export interface IReenrollmentRequest {
  semester: number; // 1 ou 2
  year: number; // YYYY (ex: 2025)
  adminPassword: string; // Senha do admin para validação
}

/**
 * Response da rematrícula global processada
 */
export interface IReenrollmentResponse {
  totalStudents: number; // Total de estudantes rematriculados
  affectedEnrollmentIds: number[]; // IDs dos enrollments afetados
}

/**
 * Dados completos retornados pela API
 */
export interface IReenrollmentApiResponse {
  success: boolean;
  data: IReenrollmentResponse;
  message: string;
}
