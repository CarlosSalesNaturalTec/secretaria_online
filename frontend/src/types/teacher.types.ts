/**
 * Arquivo: frontend/src/types/teacher.types.ts
 * Descrição: Tipos e interfaces específicas para professores
 * Feature: feat-101 - Criar types TypeScript
 * Criado em: 2025-11-04
 */

import type { IUser } from './user.types';

/**
 * Interface para Professor (estende IUser)
 *
 * Responsabilidades:
 * - Representar dados específicos de professores
 * - Rastrear turmas e disciplinas do professor
 * - Associar avaliações e notas lançadas
 *
 * @example
 * // Professor lecionando em uma turma
 * const teacher: ITeacher = {
 *   ...userBaseData,
 *   role: 'teacher',
 *   specialization: 'Engenharia',
 *   classes: [
 *     {
 *       id: 1,
 *       classId: 5,
 *       teacherId: 3,
 *       disciplineId: 2,
 *       disciplineName: 'Cálculo'
 *     }
 *   ]
 * };
 */
export interface ITeacher extends IUser {
  /** Especialização/área de atuação */
  specialization?: string;

  /** Turmas em que o professor leciona */
  classes?: ITeacherClass[];

  /** Documentos enviados pelo professor */
  documents?: ITeacherDocument[];

  /** Avaliações criadas */
  evaluations?: ITeacherEvaluation[];
}

/**
 * Dados básicos de turma para contexto de professor
 */
export interface ITeacherClass {
  /** ID da relação professor-turma */
  id: number;

  /** ID da turma */
  classId: number;

  /** ID do professor */
  teacherId: number;

  /** ID da disciplina */
  disciplineId: number;

  /** Nome da disciplina */
  disciplineName?: string;

  /** Semestre da turma */
  semester?: number;

  /** Ano letivo */
  year?: number;

  /** Quantidade de alunos na turma */
  studentCount?: number;
}

/**
 * Documento enviado por professor
 */
export interface ITeacherDocument {
  /** ID do documento */
  id: number;

  /** ID do professor */
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
 * Avaliação criada por professor
 */
export interface ITeacherEvaluation {
  /** ID da avaliação */
  id: number;

  /** ID da turma */
  classId: number;

  /** ID do professor */
  teacherId: number;

  /** ID da disciplina */
  disciplineId: number;

  /** Nome da avaliação */
  name: string;

  /** Data da avaliação */
  date: string;

  /** Tipo de avaliação */
  type: 'grade' | 'concept';

  /** Quantidade de notas lançadas */
  gradesCount?: number;

  /** Data de criação */
  createdAt: string;
}

/**
 * Dados para criar novo professor
 *
 * @example
 * const newTeacher: ITeacherCreateRequest = {
 *   name: 'Dr. José Silva',
 *   email: 'jose@example.com',
 *   login: 'jose_prof',
 *   cpf: '12345678901',
 *   rg: '123456789',
 *   motherName: 'Maria Silva',
 *   fatherName: 'Carlos Silva',
 *   address: 'Rua A, 123',
 *   title: 'Doutor em Engenharia',
 *   specialization: 'Engenharia Civil'
 * };
 */
export interface ITeacherCreateRequest {
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

  /** Título/qualificação */
  title?: string;

  /** Especialização/área de atuação */
  specialization?: string;

  /** Se é reservista (opcional) */
  reservist?: boolean;
}

/**
 * Dados para editar professor
 */
export interface ITeacherUpdateRequest {
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

  /** Título (opcional) */
  title?: string;

  /** Especialização (opcional) */
  specialization?: string;

  /** Reservista (opcional) */
  reservist?: boolean;
}

/**
 * Resposta ao listar professores
 */
export interface ITeacherListResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Array de professores */
  data: ITeacher[];

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
 * Resposta ao consultar professor específico
 */
export interface ITeacherResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados do professor */
  data: ITeacher;

  /** Mensagem de sucesso (opcional) */
  message?: string;
}

/**
 * Filtros para busca de professores
 */
export interface ITeacherFilters {
  /** Buscar por nome */
  name?: string;

  /** Buscar por email */
  email?: string;

  /** Buscar por CPF */
  cpf?: string;

  /** Buscar por especialização */
  specialization?: string;

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
 * Resumo do professor para dashboard
 */
export interface ITeacherDashboard {
  /** Dados do professor */
  teacher: ITeacher;

  /** Turmas do professor */
  classes: ITeacherClass[];

  /** Documentos pendentes de aprovação */
  pendingDocuments: ITeacherDocument[];

  /** Avaliações recentes */
  recentEvaluations: ITeacherEvaluation[];

  /** Data do primeiro acesso */
  firstAccessAt: string | null;

  /** Indica se precisa aceitar contrato */
  needsContractAcceptance: boolean;

  /** Total de alunos em todas as turmas */
  totalStudents: number;

  /** Total de avaliações no semestre */
  totalEvaluations: number;
}

/**
 * Resumo de uma turma para professor
 */
export interface ITeacherClassSummary {
  /** Informações básicas da turma */
  class: ITeacherClass;

  /** Alunos da turma */
  students: Array<{
    id: number;
    name: string;
    email: string;
    cpf: string;
  }>;

  /** Avaliações da turma */
  evaluations: ITeacherEvaluation[];

  /** Estatísticas */
  stats: {
    /** Total de alunos */
    totalStudents: number;

    /** Total de avaliações */
    totalEvaluations: number;

    /** Avaliações com todas as notas lançadas */
    completedEvaluations: number;
  };
}

/**
 * Dados para lançamento de nota (por professor)
 */
export interface IGradeSubmissionRequest {
  /** ID da avaliação */
  evaluationId: number;

  /** Array de notas para cada aluno */
  grades: Array<{
    /** ID do aluno */
    studentId: number;

    /** Nota (0-10) para avaliações de nota */
    grade?: number;

    /** Conceito para avaliações de conceito */
    concept?: 'satisfactory' | 'unsatisfactory';
  }>;
}

/**
 * Resposta ao lançar notas
 */
export interface IGradeSubmissionResponse {
  /** Indica sucesso */
  success: boolean;

  /** Quantidade de notas lançadas */
  gradesCount: number;

  /** Mensagem de sucesso */
  message: string;
}

/**
 * Estatísticas de professores (para admin)
 */
export interface ITeacherStats {
  /** Total de professores cadastrados */
  totalTeachers: number;

  /** Professores com turmas ativas */
  activeTeachers: number;

  /** Professores com documentos pendentes */
  pendingDocuments: number;

  /** Professores que ainda não fizeram primeiro acesso */
  neverAccessed: number;
}
