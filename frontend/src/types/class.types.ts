/**
 * Arquivo: frontend/src/types/class.types.ts
 * Descrição: Tipos e interfaces para turmas
 * Feature: feat-086 - Criar class.service.ts e página Classes
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
   * Lista de professores e disciplinas vinculados à turma
   */
  teachers?: IClassTeacher[];

  /**
   * Lista de alunos matriculados na turma
   */
  students?: IClassStudent[];

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
