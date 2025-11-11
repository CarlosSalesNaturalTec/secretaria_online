/**
 * Arquivo: frontend/src/types/student.types.ts
 * Descrição: Tipos e interfaces específicas para alunos
 * Feature: feat-101 - Criar types TypeScript
 * Criado em: 2025-11-04
 */

import type { IUser } from './user.types';

/**
 * Interface para Aluno (estende IUser)
 *
 * Responsabilidades:
 * - Representar dados específicos de alunos
 * - Rastrear matrículas do aluno
 * - Associar documentos e notas do aluno
 *
 * @example
 * // Aluno com matrícula ativa
 * const student: IStudent = {
 *   ...userBaseData,
 *   role: 'student',
 *   enrollments: [
 *     {
 *       id: 1,
 *       studentId: 5,
 *       courseId: 1,
 *       status: 'active',
 *       enrollmentDate: '2025-01-15T00:00:00Z'
 *     }
 *   ]
 * };
 */
export interface IStudent extends IUser {
  /** Matrículas do aluno */
  enrollments?: IEnrollmentBasic[];

  /** Documentos enviados pelo aluno */
  documents?: IStudentDocument[];

  /** Notas do aluno */
  grades?: IStudentGrade[];
}

/**
 * Dados básicos de matrícula para uso em contexto de aluno
 */
export interface IEnrollmentBasic {
  /** ID da matrícula */
  id: number;

  /** ID do aluno */
  studentId: number;

  /** ID do curso */
  courseId: number;

  /** Status da matrícula */
  status: 'pending' | 'active' | 'cancelled';

  /** Data da matrícula */
  enrollmentDate: string;
}

/**
 * Documento associado a um aluno
 */
export interface IStudentDocument {
  /** ID do documento */
  id: number;

  /** ID do aluno */
  userId: number;

  /** Tipo de documento */
  documentTypeId: number;

  /** Caminho do arquivo */
  filePath: string;

  /** Status do documento */
  status: 'pending' | 'approved' | 'rejected';

  /** Data de upload */
  createdAt: string;
}

/**
 * Nota associada a um aluno
 */
export interface IStudentGrade {
  /** ID da nota */
  id: number;

  /** ID do aluno */
  studentId: number;

  /** Valor da nota (0-10) ou conceito */
  grade: number | null;

  /** Conceito da avaliação */
  concept: 'satisfactory' | 'unsatisfactory' | null;

  /** Data da nota */
  createdAt: string;
}

/**
 * Dados para criar novo aluno
 *
 * @example
 * const newStudent: IStudentCreateRequest = {
 *   name: 'João Silva',
 *   email: 'joao@example.com',
 *   login: 'joao_aluno',
 *   cpf: '12345678901',
 *   rg: '123456789',
 *   motherName: 'Maria Silva',
 *   fatherName: 'Carlos Silva',
 *   address: 'Rua A, 123'
 * };
 */
export interface IStudentCreateRequest {
  /** Nome completo */
  name: string;

  /** Email */
  email: string;

  /** Login único */
  login: string;

  /** CPF com validação */
  cpf: string;

  /** RG */
  rg: string;

  /** Nome da mãe */
  motherName: string;

  /** Nome do pai */
  fatherName: string;

  /** Endereço */
  address: string;

  /** Título/cargo (opcional) */
  title?: string;

  /** Se é reservista (opcional) */
  reservist?: boolean;
}

/**
 * Dados para editar aluno
 */
export interface IStudentUpdateRequest {
  /** Nome (opcional) */
  name?: string;

  /** Email (opcional) */
  email?: string;

  /** CPF (opcional) */
  cpf?: string;

  /** RG (opcional) */
  rg?: string;

  /** Nome da mãe (opcional) */
  motherName?: string;

  /** Nome do pai (opcional) */
  fatherName?: string;

  /** Endereço (opcional) */
  address?: string;

  /** Título/cargo (opcional) */
  title?: string;

  /** Reservista (opcional) */
  reservist?: boolean;
}

/**
 * Resposta ao listar alunos
 */
export interface IStudentListResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Array de alunos */
  data: IStudent[];

  /** Informações de paginação */
  pagination?: {
    /** Total de registros */
    total: number;

    /** Página atual */
    page: number;

    /** Limite de registros por página */
    limit: number;

    /** Total de páginas */
    pages: number;
  };
}

/**
 * Resposta ao consultar aluno específico
 */
export interface IStudentResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados do aluno */
  data: IStudent;

  /** Mensagem de sucesso (opcional) */
  message?: string;
}

/**
 * Filtros para busca de alunos
 */
export interface IStudentFilters {
  /** Buscar por nome */
  name?: string;

  /** Buscar por email */
  email?: string;

  /** Buscar por CPF */
  cpf?: string;

  /** Buscar por ID de curso */
  courseId?: number;

  /** Status de matrícula */
  enrollmentStatus?: 'pending' | 'active' | 'cancelled';

  /** Página atual */
  page?: number;

  /** Limite de registros por página */
  limit?: number;

  /** Campo para ordenação */
  sortBy?: 'name' | 'email' | 'createdAt';

  /** Ordem de classificação */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Resumo do aluno para dashboard
 */
export interface IStudentDashboard {
  /** Dados do aluno */
  student: IStudent;

  /** Matrículas ativas */
  activeEnrollments: IEnrollmentBasic[];

  /** Documentos pendentes de aprovação */
  pendingDocuments: IStudentDocument[];

  /** Últimas notas recebidas */
  recentGrades: IStudentGrade[];

  /** Total de solicitações pendentes */
  pendingRequests: number;

  /** Data do primeiro acesso */
  firstAccessAt: string | null;

  /** Indica se precisa aceitar contrato */
  needsContractAcceptance: boolean;
}

/**
 * Estatísticas de alunos (para admin)
 */
export interface IStudentStats {
  /** Total de alunos cadastrados */
  totalStudents: number;

  /** Alunos com matrícula ativa */
  activeEnrollments: number;

  /** Alunos com documentos pendentes */
  pendingDocuments: number;

  /** Alunos que ainda não fizeram primeiro acesso */
  neverAccessed: number;
}
