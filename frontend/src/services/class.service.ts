/**
 * Arquivo: frontend/src/services/class.service.ts
 * Descrição: Serviço para gerenciamento de turmas
 * Feature: feat-086 - Criar class.service.ts e página Classes
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Buscar todas as turmas do sistema
 * - Buscar turma por ID
 * - Criar nova turma com dados completos
 * - Atualizar dados de turma existente
 * - Remover turma do sistema
 * - Vincular/desvincular professores e alunos em turmas
 */

import api from './api';
import type { IClass } from '@/types/class.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Função auxiliar para mapear dados da API (snake_case) para o frontend (camelCase)
 */
function mapClassData(classData: any): IClass {
  return {
    id: classData.id,
    courseId: classData.course_id || classData.courseId,
    semester: classData.semester,
    year: classData.year,
    course: classData.course ? {
      id: classData.course.id,
      name: classData.course.name,
      description: classData.course.description,
      duration: classData.course.duration,
      durationType: classData.course.duration_type || classData.course.durationType,
      courseType: classData.course.course_type || classData.course.courseType,
      createdAt: classData.course.created_at || classData.course.createdAt,
      updatedAt: classData.course.updated_at || classData.course.updatedAt,
      deletedAt: classData.course.deleted_at || classData.course.deletedAt,
    } : undefined,
    // Mapear estudantes (se houver)
    students: classData.students?.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      class_students: s.class_students,
    })),
    // Mapear professores - converte 'nome' para 'name'
    teachers: classData.teachers?.map((t: any) => ({
      id: t.id,
      name: t.nome || t.name, // Campo 'nome' na tabela teachers
      email: t.email,
      class_teachers: t.class_teachers,
    })),
    // Mapear disciplinas - converte snake_case para camelCase se necessário
    disciplines: classData.disciplines?.map((d: any) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      createdAt: d.created_at || d.createdAt,
      updatedAt: d.updated_at || d.updatedAt,
      deletedAt: d.deleted_at || d.deletedAt,
    })),
    createdAt: classData.created_at || classData.createdAt,
    updatedAt: classData.updated_at || classData.updatedAt,
    deletedAt: classData.deleted_at || classData.deletedAt,
  };
}

/**
 * Interface para vinculação de professor-disciplina em turma
 */
export interface ITeacherDisciplineAssignment {
  /** ID do professor */
  teacherId: number;
  /** ID da disciplina que o professor irá lecionar */
  disciplineId: number;
}

/**
 * Interface para dados de criação de turma
 *
 * Contém todos os campos obrigatórios e opcionais para cadastro de turma
 */
export interface ICreateClassData {
  /** ID do curso ao qual a turma pertence */
  courseId: number;
  /** Semestre/período da turma */
  semester: number;
  /** Ano letivo da turma (alfanumérico) */
  year: string;
  /** Lista de professores e disciplinas a serem vinculados (opcional) */
  teachers?: ITeacherDisciplineAssignment[];
  /** IDs dos alunos a serem vinculados (opcional) */
  studentIds?: number[];
}

/**
 * Interface para dados de atualização de turma
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 */
export interface IUpdateClassData {
  /** ID do curso ao qual a turma pertence */
  courseId?: number;
  /** Semestre/período da turma */
  semester?: number;
  /** Ano letivo da turma (alfanumérico) */
  year?: string;
  /** Lista de professores e disciplinas a serem vinculados (opcional) */
  teachers?: ITeacherDisciplineAssignment[];
  /** IDs dos alunos a serem vinculados (opcional) */
  studentIds?: number[];
}

/**
 * Busca todas as turmas cadastradas no sistema
 *
 * Retorna lista completa de turmas com seus dados.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @returns {Promise<IClass[]>} Lista de turmas cadastradas
 * @throws {Error} Quando ocorre erro na comunicação com API ou falta de permissão
 *
 * @example
 * try {
 *   const classes = await getAll();
 *   console.log('Total de turmas:', classes.length);
 * } catch (error) {
 *   console.error('Erro ao buscar turmas:', error);
 * }
 */
export async function getAll(): Promise<IClass[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[ClassService] Buscando todas as turmas...');
    }

    const response = await api.get<ApiResponse<IClass[]>>('/classes');

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar turmas'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Turmas recuperadas:', response.data.data.length);
    }

    // Mapear dados da API (snake_case) para camelCase
    return response.data.data.map(mapClassData);
  } catch (error) {
    console.error('[ClassService] Erro ao buscar turmas:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar turmas. Tente novamente.');
  }
}

/**
 * Busca turma específica por ID
 *
 * Retorna dados completos de uma turma específica, incluindo professores, disciplinas e alunos vinculados.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID da turma
 * @returns {Promise<IClass>} Dados da turma
 * @throws {Error} Quando ID é inválido, turma não encontrada ou erro na API
 *
 * @example
 * try {
 *   const classData = await getById(123);
 *   console.log('Turma encontrada:', classData.semester, classData.year);
 * } catch (error) {
 *   console.error('Erro ao buscar turma:', error);
 * }
 */
export async function getById(id: number): Promise<IClass> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Buscando turma por ID:', id);
    }

    const response = await api.get<ApiResponse<IClass>>(`/classes/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar turma'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Turma encontrada:', response.data.data.id);
    }

    // Mapear dados da API (snake_case) para camelCase
    return mapClassData(response.data.data);
  } catch (error) {
    console.error('[ClassService] Erro ao buscar turma:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar turma. Tente novamente.');
  }
}

/**
 * Cria nova turma no sistema
 *
 * Valida e envia dados da nova turma para API.
 * Permite vincular professores, disciplinas e alunos durante a criação.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {ICreateClassData} data - Dados da turma a ser criada
 * @returns {Promise<IClass>} Dados da turma criada
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newClass = await create({
 *     courseId: 1,
 *     semester: 1,
 *     year: "2025",
 *     teachers: [{ teacherId: 5, disciplineId: 3 }],
 *     studentIds: [10, 11, 12]
 *   });
 *   console.log('Turma criada:', newClass.id);
 * } catch (error) {
 *   console.error('Erro ao criar turma:', error);
 * }
 */
export async function create(data: ICreateClassData): Promise<IClass> {
  try {
    // Validações de campos obrigatórios
    if (!data.courseId || data.courseId <= 0) {
      throw new Error('Curso é obrigatório');
    }

    if (!data.semester || data.semester <= 0) {
      throw new Error('Semestre é obrigatório e deve ser maior que zero');
    }

    if (data.semester > 20) {
      throw new Error('Semestre não pode exceder 20');
    }

    if (!data.year || data.year.trim().length === 0) {
      throw new Error('Ano é obrigatório');
    }

    // Validação de professores (se fornecidos)
    if (data.teachers && data.teachers.length > 0) {
      for (const teacher of data.teachers) {
        if (!teacher.teacherId || teacher.teacherId <= 0) {
          throw new Error('ID do professor é inválido');
        }
        if (!teacher.disciplineId || teacher.disciplineId <= 0) {
          throw new Error('ID da disciplina é inválido');
        }
      }
    }

    // Validação de alunos (se fornecidos)
    if (data.studentIds && data.studentIds.length > 0) {
      for (const studentId of data.studentIds) {
        if (!studentId || studentId <= 0) {
          throw new Error('ID do aluno é inválido');
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Criando nova turma:', {
        courseId: data.courseId,
        semester: data.semester,
        year: data.year,
        teachersCount: data.teachers?.length || 0,
        studentsCount: data.studentIds?.length || 0,
      });
    }

    // Converter camelCase para snake_case para o backend
    const payload = {
      course_id: data.courseId,
      semester: data.semester,
      year: data.year,
      teachers: data.teachers,
      student_ids: data.studentIds,
    };

    if (import.meta.env.DEV) {
      console.log('[ClassService] Enviando payload:', payload);
    }

    const response = await api.post<ApiResponse<IClass>>('/classes', payload);

    if (!response.data.success || !response.data.data) {
      console.error('[ClassService] Erro da API:', {
        status: response.status,
        data: response.data,
      });
      throw new Error(
        response.data.error?.message || 'Erro ao criar turma'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Turma criada com sucesso:', response.data.data.id);
    }

    // Mapear dados da API (snake_case) para camelCase
    return mapClassData(response.data.data);
  } catch (error) {
    console.error('[ClassService] Erro ao criar turma:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar turma. Tente novamente.');
  }
}

/**
 * Atualiza dados de turma existente
 *
 * Permite atualização parcial dos dados da turma.
 * Pode atualizar informações básicas e vínculos de professores/alunos.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID da turma a ser atualizada
 * @param {IUpdateClassData} data - Dados a serem atualizados
 * @returns {Promise<IClass>} Dados da turma atualizada
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedClass = await update(123, {
 *     semester: 2,
 *     studentIds: [10, 11, 12, 13]
 *   });
 *   console.log('Turma atualizada:', updatedClass.id);
 * } catch (error) {
 *   console.error('Erro ao atualizar turma:', error);
 * }
 */
export async function update(
  id: number,
  data: IUpdateClassData
): Promise<IClass> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    // Validação de dados (se fornecidos)
    if (data.courseId !== undefined && data.courseId <= 0) {
      throw new Error('Curso deve ser válido');
    }

    if (data.semester !== undefined) {
      if (data.semester <= 0) {
        throw new Error('Semestre deve ser maior que zero');
      }
      if (data.semester > 20) {
        throw new Error('Semestre não pode exceder 20');
      }
    }

    if (data.year !== undefined && data.year.trim().length === 0) {
      throw new Error('Ano não pode ser vazio');
    }

    // Validação de professores (se fornecidos)
    if (data.teachers && data.teachers.length > 0) {
      for (const teacher of data.teachers) {
        if (!teacher.teacherId || teacher.teacherId <= 0) {
          throw new Error('ID do professor é inválido');
        }
        if (!teacher.disciplineId || teacher.disciplineId <= 0) {
          throw new Error('ID da disciplina é inválido');
        }
      }
    }

    // Validação de alunos (se fornecidos)
    if (data.studentIds && data.studentIds.length > 0) {
      for (const studentId of data.studentIds) {
        if (!studentId || studentId <= 0) {
          throw new Error('ID do aluno é inválido');
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Atualizando turma:', id, data);
    }

    // Converter camelCase para snake_case para o backend
    const payload: any = {};
    if (data.courseId !== undefined) payload.course_id = data.courseId;
    if (data.semester !== undefined) payload.semester = data.semester;
    if (data.year !== undefined) payload.year = data.year;
    if (data.teachers !== undefined) payload.teachers = data.teachers;
    if (data.studentIds !== undefined) payload.student_ids = data.studentIds;

    if (import.meta.env.DEV) {
      console.log('[ClassService] Enviando payload atualização:', payload);
    }

    const response = await api.put<ApiResponse<IClass>>(
      `/classes/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar turma'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Turma atualizada com sucesso:', response.data.data.id);
    }

    // Mapear dados da API (snake_case) para camelCase
    return mapClassData(response.data.data);
  } catch (error) {
    console.error('[ClassService] Erro ao atualizar turma:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar turma. Tente novamente.');
  }
}

/**
 * Remove turma do sistema
 *
 * Realiza soft delete da turma (marcada como deletada, não removida fisicamente).
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID da turma a ser removida
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteClass(123);
 *   console.log('Turma removida com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover turma:', error);
 * }
 */
export async function deleteClass(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID da turma é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Removendo turma:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/classes/${id}`);

    // Handle 204 No Content (successful deletion with no body)
    // The response.data may be undefined or empty for 204 status
    const responseData = response.data as any;

    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover turma'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[ClassService] Turma removida com sucesso');
    }
  } catch (error) {
    console.error('[ClassService] Erro ao remover turma:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover turma. Tente novamente.');
  }
}

/**
 * Vincula um professor a uma turma com uma disciplina específica
 *
 * @param {number} classId - ID da turma
 * @param {number} teacherId - ID do professor
 * @param {number} disciplineId - ID da disciplina
 * @returns {Promise<void>}
 * @throws {Error} Quando IDs são inválidos ou erro na API
 */
export async function addTeacherToClass(
  classId: number,
  teacherId: number,
  disciplineId: number
): Promise<void> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório');
    }
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID do professor é obrigatório');
    }
    if (!disciplineId || disciplineId <= 0) {
      throw new Error('ID da disciplina é obrigatório');
    }

    const response = await api.post<ApiResponse<void>>(
      `/classes/${classId}/teachers/${teacherId}/discipline/${disciplineId}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao vincular professor'
      );
    }
  } catch (error) {
    console.error('[ClassService] Erro ao vincular professor:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao vincular professor. Tente novamente.');
  }
}

/**
 * Vincula um aluno a uma turma
 *
 * @param {number} classId - ID da turma
 * @param {number} studentId - ID do aluno
 * @returns {Promise<void>}
 * @throws {Error} Quando IDs são inválidos ou erro na API
 */
export async function addStudentToClass(
  classId: number,
  studentId: number
): Promise<void> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório');
    }
    if (!studentId || studentId <= 0) {
      throw new Error('ID do aluno é obrigatório');
    }

    const response = await api.post<ApiResponse<void>>(
      `/classes/${classId}/students/${studentId}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao vincular aluno'
      );
    }
  } catch (error) {
    console.error('[ClassService] Erro ao vincular aluno:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao vincular aluno. Tente novamente.');
  }
}

/**
 * Remove um professor de uma turma
 *
 * @param {number} classId - ID da turma
 * @param {number} teacherId - ID do professor
 * @param {number} disciplineId - ID da disciplina
 * @returns {Promise<void>}
 * @throws {Error} Quando IDs são inválidos ou erro na API
 */
export async function removeTeacherFromClass(
  classId: number,
  teacherId: number,
  disciplineId: number
): Promise<void> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório');
    }
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID do professor é obrigatório');
    }
    if (!disciplineId || disciplineId <= 0) {
      throw new Error('ID da disciplina é obrigatório');
    }

    const response = await api.delete<ApiResponse<void>>(
      `/classes/${classId}/teachers/${teacherId}/discipline/${disciplineId}`
    );

    const responseData = response.data as any;
    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover professor'
      );
    }
  } catch (error) {
    console.error('[ClassService] Erro ao remover professor:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover professor. Tente novamente.');
  }
}

/**
 * Remove um aluno de uma turma
 *
 * @param {number} classId - ID da turma
 * @param {number} studentId - ID do aluno
 * @returns {Promise<void>}
 * @throws {Error} Quando IDs são inválidos ou erro na API
 */
export async function removeStudentFromClass(
  classId: number,
  studentId: number
): Promise<void> {
  try {
    if (!classId || classId <= 0) {
      throw new Error('ID da turma é obrigatório');
    }
    if (!studentId || studentId <= 0) {
      throw new Error('ID do aluno é obrigatório');
    }

    const response = await api.delete<ApiResponse<void>>(
      `/classes/${classId}/students/${studentId}`
    );

    const responseData = response.data as any;
    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover aluno'
      );
    }
  } catch (error) {
    console.error('[ClassService] Erro ao remover aluno:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover aluno. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getAll, getById, create, update, deleteClass, addTeacherToClass, addStudentToClass, removeTeacherFromClass, removeStudentFromClass } from '@/services/class.service';
 *
 * // Importação do objeto completo
 * import ClassService from '@/services/class.service';
 * ClassService.getAll().then(classes => console.log(classes));
 */
const ClassService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteClass,
  addTeacherToClass,
  addStudentToClass,
  removeTeacherFromClass,
  removeStudentFromClass,
};

export default ClassService;
