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

/**
 * Response do preview de contrato HTML
 */
export interface IContractPreviewResponse {
  contractHTML: string; // HTML renderizado do contrato
  enrollmentId: number; // ID do enrollment
  semester: number; // Semestre (1 ou 2)
  year: number; // Ano (ex: 2025)
}

/**
 * Dados completos retornados pela API de preview
 */
export interface IContractPreviewApiResponse {
  success: boolean;
  data: IContractPreviewResponse;
}

/**
 * Response do aceite de rematrícula
 */
export interface IAcceptReenrollmentResponse {
  enrollment: {
    id: number;
    student_id: number;
    course_id: number;
    status: 'active' | 'pending' | 'cancelled';
  };
  contract: {
    id: number;
    user_id: number;
    enrollment_id: number;
    template_id: number;
    semester: number;
    year: number;
    accepted_at: string;
    file_path: null;
    file_name: null;
  };
}

/**
 * Dados completos retornados pela API de aceite
 */
export interface IAcceptReenrollmentApiResponse {
  success: boolean;
  data: IAcceptReenrollmentResponse;
  message: string;
}
