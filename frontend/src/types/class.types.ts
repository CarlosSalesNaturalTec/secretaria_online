/**
 * Arquivo: frontend/src/types/class.types.ts
 * Descrição: Tipos e interfaces para turmas
 * Feature: feat-086 - Criar class.service.ts e página Classes
 * Feature: feat-101 - Criar types TypeScript (atualização)
 * Criado em: 2025-11-04
 */

import type { IUser } from './user.types';
import type { ICourse } from './course.types';
import type { IDiscipline } from './course.types';

/**
 * Interface para relação Turma-Professor-Disciplina
 *
 * Representa a associação entre uma turma, um professor e a disciplina que ele leciona
 */
export interface IClassTeacher {
  /**
   * ID da relação
   */
  id: number;

  /**
   * ID da turma
   */
  classId: number;

  /**
   * ID do professor
   */
  teacherId: number;

  /**
   * ID da disciplina que o professor leciona nesta turma
   */
  disciplineId: number;

  /**
   * Dados do professor (quando incluído)
   */
  teacher?: IUser;

  /**
   * Dados da disciplina (quando incluído)
   */
  discipline?: IDiscipline;

  /**
   * Data de criação
   */
  createdAt?: string;

  /**
   * Data de última atualização
   */
  updatedAt?: string;
}

/**
 * Interface para relação Turma-Aluno
 *
 * Representa a associação entre uma turma e seus alunos matriculados
 */
export interface IClassStudent {
  /**
   * ID da relação
   */
  id: number;

  /**
   * ID da turma
   */
  classId: number;

  /**
   * ID do aluno
   */
  studentId: number;

  /**
   * Dados do aluno (quando incluído)
   */
  student?: IUser;

  /**
   * Data de criação
   */
  createdAt?: string;

  /**
   * Data de última atualização
   */
  updatedAt?: string;
}

/**
 * Interface para Turma
 *
 * Representa uma turma vinculada a um curso, com professores e alunos
 */
export interface IClass {
  /**
   * ID único da turma
   */
  id: number;

  /**
   * ID do curso ao qual a turma pertence
   */
  courseId: number;

  /**
   * Semestre/período da turma
   */
  semester: number;

  /**
   * Ano letivo da turma
   */
  year: number;

  /**
   * Dados do curso (quando incluído)
   */
  course?: ICourse;

  /**
   * Lista de professores vinculados à turma
   * Estrutura retornada pela API: { id, name, email, class_teachers: { discipline_id } }
   */
  teachers?: IUser[];

  /**
   * Lista de alunos matriculados na turma
   */
  students?: IUser[];

  /**
   * Lista de disciplinas da turma
   */
  disciplines?: IDiscipline[];

  /**
   * Data de criação
   */
  createdAt?: string;

  /**
   * Data de última atualização
   */
  updatedAt?: string;

  /**
   * Data de exclusão (soft delete)
   */
  deletedAt?: string | null;
}

/**
 * Dados para criar nova turma
 */
export interface IClassCreateRequest {
  /**
   * ID do curso
   */
  courseId: number;

  /**
   * Semestre/período
   */
  semester: number;

  /**
   * Ano letivo
   */
  year: number;

  /**
   * Professores a vincular (opcional)
   */
  teachers?: Array<{
    teacherId: number;
    disciplineId: number;
  }>;
}

/**
 * Dados para editar turma
 */
export interface IClassUpdateRequest {
  /**
   * Semestre (opcional)
   */
  semester?: number;

  /**
   * Ano letivo (opcional)
   */
  year?: number;
}

/**
 * Dados para adicionar professor à turma
 */
export interface IAddTeacherToClassRequest {
  /**
   * ID do professor
   */
  teacherId: number;

  /**
   * ID da disciplina que o professor vai lecionar
   */
  disciplineId: number;
}

/**
 * Dados para adicionar aluno à turma
 */
export interface IAddStudentToClassRequest {
  /**
   * ID do aluno
   */
  studentId: number;
}

/**
 * Resposta ao listar turmas
 */
export interface IClassListResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Array de turmas
   */
  data: IClass[];

  /**
   * Informações de paginação
   */
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Resposta ao consultar turma específica
 */
export interface IClassResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Dados da turma
   */
  data: IClass;

  /**
   * Mensagem de sucesso (opcional)
   */
  message?: string;
}

/**
 * Filtros para busca de turmas
 */
export interface IClassFilters {
  /**
   * Buscar por ID de curso
   */
  courseId?: number;

  /**
   * Buscar por semestre
   */
  semester?: number;

  /**
   * Buscar por ano letivo
   */
  year?: number;

  /**
   * Página atual
   */
  page?: number;

  /**
   * Limite de registros por página
   */
  limit?: number;

  /**
   * Campo para ordenação
   */
  sortBy?: 'year' | 'semester' | 'createdAt';

  /**
   * Ordem de classificação
   */
  sortOrder?: 'ASC' | 'DESC';
}
