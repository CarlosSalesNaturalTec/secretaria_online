/**
 * Arquivo: frontend/src/types/enrollment.types.ts
 * Descrição: Tipos e interfaces para matrículas
 * Feature: feat-101 - Criar types TypeScript
 * Criado em: 2025-11-04
 */

import type { IUser } from './user.types';
import type { ICourse } from './course.types';

/**
 * Status possíveis de uma matrícula
 *
 * - pending: Matrícula criada, aguardando aprovação de documentos obrigatórios
 * - active: Todos os documentos aprovados, aluno pode usar o sistema normalmente
 * - cancelled: Matrícula cancelada por solicitação do aluno
 * - reenrollment: Rematrícula em andamento
 * - completed: Matrícula concluída (aluno formado)
 */
export type EnrollmentStatus = 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed';

/**
 * Interface para Matrícula
 *
 * Responsabilidades:
 * - Representar a relação entre aluno e curso
 * - Rastrear status e data da matrícula
 * - Indicar se documentos foram aprovados
 *
 * @example
 * // Matrícula ativa com documentos aprovados
 * const enrollment: IEnrollment = {
 *   id: 1,
 *   studentId: 5,
 *   courseId: 1,
 *   status: 'active',
 *   enrollmentDate: '2025-01-15T00:00:00Z',
 *   createdAt: '2025-01-15T10:00:00Z',
 *   updatedAt: '2025-01-20T14:30:00Z'
 * };
 */
export interface IEnrollment {
  /** ID único da matrícula */
  id: number;

  /** ID do aluno */
  studentId: number;

  /** ID do curso */
  courseId: number;

  /** Status da matrícula */
  status: EnrollmentStatus;

  /** Data da matrícula */
  enrollmentDate: string;

  /** Data de criação */
  createdAt: string;

  /** Data da última atualização */
  updatedAt: string;

  /** Data de exclusão lógica (soft delete) */
  deletedAt?: string | null;

  // Relacionamentos (quando incluídos na resposta)

  /** Dados do aluno */
  student?: IUser;

  /** Dados do curso */
  course?: ICourse;
}

/**
 * Dados para criar nova matrícula
 *
 * @example
 * const newEnrollment: IEnrollmentCreateRequest = {
 *   studentId: 5,
 *   courseId: 1,
 *   enrollmentDate: '2025-01-15'
 * };
 */
export interface IEnrollmentCreateRequest {
  /** ID do aluno */
  studentId: number;

  /** ID do curso */
  courseId: number;

  /** Data da matrícula (ISO 8601) */
  enrollmentDate: string;
}

/**
 * Dados para atualizar matrícula
 */
export interface IEnrollmentUpdateRequest {
  /** Novo status da matrícula */
  status?: EnrollmentStatus;

  /** Nova data de matrícula */
  enrollmentDate?: string;
}

/**
 * Dados para atualizar status da matrícula
 */
export interface IEnrollmentStatusUpdateRequest {
  /** Novo status */
  status: EnrollmentStatus;
}

/**
 * Resposta ao listar matrículas
 */
export interface IEnrollmentListResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Array de matrículas */
  data: IEnrollment[];

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
 * Resposta ao consultar matrícula específica
 */
export interface IEnrollmentResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados da matrícula */
  data: IEnrollment;

  /** Mensagem de sucesso (opcional) */
  message?: string;
}

/**
 * Filtros para busca de matrículas
 */
export interface IEnrollmentFilters {
  /** Buscar por ID de aluno */
  studentId?: number;

  /** Buscar por ID de curso */
  courseId?: number;

  /** Filtrar por status */
  status?: EnrollmentStatus;

  /** Data inicial de matrícula */
  enrollmentDateFrom?: string;

  /** Data final de matrícula */
  enrollmentDateTo?: string;

  /** Página atual */
  page?: number;

  /** Limite de registros por página */
  limit?: number;

  /** Campo para ordenação */
  sortBy?: 'enrollmentDate' | 'createdAt' | 'studentId' | 'courseId';

  /** Ordem de classificação */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Dados detalhados de matrícula para visualização
 * Inclui informações relacionadas para exibição
 */
export interface IEnrollmentDetails {
  /** Dados da matrícula */
  enrollment: IEnrollment;

  /** Informações do aluno com contatos */
  student: IUser & {
    email: string;
    cpf: string;
  };

  /** Informações do curso */
  course: ICourse;

  /** Documentos obrigatórios aprovados */
  approvedDocuments: number;

  /** Documentos obrigatórios pendentes */
  pendingDocuments: number;

  /** Documentos rejeitados */
  rejectedDocuments: number;

  /** Total de documentos obrigatórios */
  totalRequiredDocuments: number;

  /** Turmas do aluno neste curso */
  classes: Array<{
    id: number;
    semester: number;
    year: number;
    discipline?: string;
  }>;
}

/**
 * Dados para verificação de matrícula duplicada
 * Usada em validações antes de criar nova matrícula
 */
export interface IEnrollmentDuplicateCheck {
  /** Indica se há matrícula ativa no mesmo curso */
  hasActiveEnrollment: boolean;

  /** ID da matrícula existente (se houver) */
  existingEnrollmentId?: number;

  /** Status da matrícula existente */
  existingStatus?: EnrollmentStatus;
}

/**
 * Estatísticas de matrícula de um aluno
 */
export interface IStudentEnrollmentStats {
  /** ID do aluno */
  studentId: number;

  /** Total de matrículas */
  totalEnrollments: number;

  /** Matrículas ativas */
  activeEnrollments: number;

  /** Matrículas canceladas */
  cancelledEnrollments: number;

  /** Matrículas pendentes de documentos */
  pendingEnrollments: number;

  /** Última matrícula */
  lastEnrollment?: IEnrollment;
}

/**
 * Estatísticas de matrícula de um curso
 */
export interface ICourseEnrollmentStats {
  /** ID do curso */
  courseId: number;

  /** Total de matrículas no curso */
  totalEnrollments: number;

  /** Matrículas ativas */
  activeEnrollments: number;

  /** Matrículas canceladas */
  cancelledEnrollments: number;

  /** Matrículas aguardando documentos */
  pendingEnrollments: number;

  /** Percentual de matrículas ativas */
  activePercentage: number;
}

/**
 * Resposta ao processar múltiplas matrículas
 * Usada em operações em lote
 */
export interface IBatchEnrollmentResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Total de matrículas processadas */
  totalProcessed: number;

  /** Quantidade de matrículas criadas com sucesso */
  successCount: number;

  /** Quantidade de erros */
  errorCount: number;

  /** Detalhes de erros (se houver) */
  errors?: Array<{
    /** Linha do erro (em caso de import) */
    line?: number;

    /** ID do aluno */
    studentId?: number;

    /** Mensagem de erro */
    message: string;
  }>;

  /** Mensagem geral */
  message: string;
}

/**
 * Dados para cancelar matrícula
 */
export interface IEnrollmentCancellationRequest {
  /** Motivo do cancelamento */
  reason: string;

  /** Observações adicionais */
  observations?: string;
}
