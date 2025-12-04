/**
 * Arquivo: frontend/src/services/course.service.ts
 * Descrição: Serviço para gerenciamento de cursos
 * Feature: feat-085 - Criar course.service.ts e página Courses
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Buscar todos os cursos do sistema
 * - Buscar curso por ID
 * - Criar novo curso com dados completos
 * - Atualizar dados de curso existente
 * - Remover curso do sistema
 * - Gerenciar disciplinas vinculadas ao curso
 */

import api from './api';
import type { ICourse } from '@/types/course.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Interface para dados de criação de curso
 *
 * Contém todos os campos obrigatórios e opcionais para cadastro de curso
 */
export interface ICreateCourseData {
  /** Nome do curso */
  name: string;
  /** Descrição do curso */
  description: string;
  /** Duração (valor numérico) */
  duration: number;
  /** Tipo de duração (Semestres, Dias, Horas, Meses, Anos) */
  durationType: string;
  /** Tipo de curso (Mestrado/Doutorado, Cursos de Verão, Pós graduação, Superior, Supletivo/EJA, Técnicos) */
  courseType: string;
  /** IDs das disciplinas vinculadas (opcional) */
  disciplineIds?: number[];
}

/**
 * Interface para dados de atualização de curso
 *
 * Todos os campos são opcionais, permitindo atualização parcial
 */
export interface IUpdateCourseData {
  /** Nome do curso */
  name?: string;
  /** Descrição do curso */
  description?: string;
  /** Duração (valor numérico) */
  duration?: number;
  /** Tipo de duração (Semestres, Dias, Horas, Meses, Anos) */
  durationType?: string;
  /** Tipo de curso (Mestrado/Doutorado, Cursos de Verão, Pós graduação, Superior, Supletivo/EJA, Técnicos) */
  courseType?: string;
  /** IDs das disciplinas vinculadas (opcional) */
  disciplineIds?: number[];
}

/**
 * Busca todos os cursos cadastrados no sistema
 *
 * Retorna lista completa de cursos com seus dados.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @returns {Promise<ICourse[]>} Lista de cursos cadastrados
 * @throws {Error} Quando ocorre erro na comunicação com API ou falta de permissão
 *
 * @example
 * try {
 *   const courses = await getAll();
 *   console.log('Total de cursos:', courses.length);
 * } catch (error) {
 *   console.error('Erro ao buscar cursos:', error);
 * }
 */
export async function getAll(): Promise<ICourse[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[CourseService] Buscando todos os cursos...');
    }

    const response = await api.get<ApiResponse<any[]>>('/courses');

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar cursos'
      );
    }

    // Converte snake_case do backend para camelCase
    const courses: ICourse[] = response.data.data.map((course: any) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      duration: course.duration,
      durationType: course.duration_type || course.durationType,
      courseType: course.course_type || course.courseType,
      disciplines: course.disciplines ? course.disciplines.map((cd: any) => {
        // Extrai a disciplina - pode estar em cd.discipline ou ser o próprio cd
        const disciplineData = cd.discipline || cd;

        return {
          id: cd.id,
          courseId: cd.course_id || cd.courseId,
          disciplineId: cd.discipline_id || cd.disciplineId,
          semester: cd.semester,
          discipline: {
            id: disciplineData.id,
            name: disciplineData.name,
            code: disciplineData.code,
            workloadHours: disciplineData.workload_hours || disciplineData.workloadHours,
            createdAt: disciplineData.created_at || disciplineData.createdAt,
            updatedAt: disciplineData.updated_at || disciplineData.updatedAt,
            deletedAt: disciplineData.deleted_at || disciplineData.deletedAt,
          },
          createdAt: cd.created_at || cd.createdAt,
          updatedAt: cd.updated_at || cd.updatedAt,
        };
      }) : undefined,
      createdAt: course.created_at || course.createdAt,
      updatedAt: course.updated_at || course.updatedAt,
      deletedAt: course.deleted_at || course.deletedAt,
    }));

    if (import.meta.env.DEV) {
      console.log('[CourseService] Cursos recuperados:', courses);
    }

    return courses;
  } catch (error) {
    console.error('[CourseService] Erro ao buscar cursos:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar cursos. Tente novamente.');
  }
}

/**
 * Busca curso específico por ID
 *
 * Retorna dados completos de um curso específico, incluindo disciplinas vinculadas.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do curso
 * @returns {Promise<ICourse>} Dados do curso
 * @throws {Error} Quando ID é inválido, curso não encontrado ou erro na API
 *
 * @example
 * try {
 *   const course = await getById(123);
 *   console.log('Curso encontrado:', course.name);
 * } catch (error) {
 *   console.error('Erro ao buscar curso:', error);
 * }
 */
export async function getById(id: number): Promise<ICourse> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do curso é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[CourseService] Buscando curso por ID:', id);
    }

    const response = await api.get<ApiResponse<any>>(`/courses/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao buscar curso'
      );
    }

    // Converte snake_case do backend para camelCase
    const courseData = response.data.data;
    const course: ICourse = {
      id: courseData.id,
      name: courseData.name,
      description: courseData.description,
      duration: courseData.duration,
      durationType: courseData.duration_type || courseData.durationType,
      courseType: courseData.course_type || courseData.courseType,
      disciplines: courseData.disciplines ? courseData.disciplines.map((cd: any) => {
        // Extrai a disciplina - pode estar em cd.discipline ou ser o próprio cd
        const disciplineData = cd.discipline || cd;

        return {
          id: cd.id,
          courseId: cd.course_id || cd.courseId,
          disciplineId: cd.discipline_id || cd.disciplineId,
          semester: cd.semester,
          discipline: {
            id: disciplineData.id,
            name: disciplineData.name,
            code: disciplineData.code,
            workloadHours: disciplineData.workload_hours || disciplineData.workloadHours,
            createdAt: disciplineData.created_at || disciplineData.createdAt,
            updatedAt: disciplineData.updated_at || disciplineData.updatedAt,
            deletedAt: disciplineData.deleted_at || disciplineData.deletedAt,
          },
          createdAt: cd.created_at || cd.createdAt,
          updatedAt: cd.updated_at || cd.updatedAt,
        };
      }) : undefined,
      createdAt: courseData.created_at || courseData.createdAt,
      updatedAt: courseData.updated_at || courseData.updatedAt,
      deletedAt: courseData.deleted_at || courseData.deletedAt,
    };

    if (import.meta.env.DEV) {
      console.log('[CourseService] Curso encontrado:', course);
    }

    return course;
  } catch (error) {
    console.error('[CourseService] Erro ao buscar curso:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao buscar curso. Tente novamente.');
  }
}

/**
 * Cria novo curso no sistema
 *
 * Valida e envia dados do novo curso para API.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {ICreateCourseData} data - Dados do curso a ser criado
 * @returns {Promise<ICourse>} Dados do curso criado
 * @throws {Error} Quando dados são inválidos ou ocorre erro na API
 *
 * @example
 * try {
 *   const newCourse = await create({
 *     name: 'Engenharia de Software',
 *     description: 'Curso de graduação em Engenharia de Software',
 *     durationSemesters: 8
 *   });
 *   console.log('Curso criado:', newCourse.id);
 * } catch (error) {
 *   console.error('Erro ao criar curso:', error);
 * }
 */
export async function create(data: ICreateCourseData): Promise<ICourse> {
  try {
    // Validações de campos obrigatórios
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Nome é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new Error('Descrição é obrigatória e deve ter no mínimo 10 caracteres');
    }

    if (!data.duration || data.duration <= 0) {
      throw new Error('Duração é obrigatória e deve ser maior que zero');
    }

    if (data.duration > 1000) {
      throw new Error('Duração não pode exceder 1000');
    }

    if (!data.durationType || data.durationType.trim().length === 0) {
      throw new Error('Tipo de duração é obrigatório');
    }

    if (!data.courseType || data.courseType.trim().length === 0) {
      throw new Error('Tipo de curso é obrigatório');
    }

    if (import.meta.env.DEV) {
      console.log('[CourseService] Criando novo curso:', {
        name: data.name,
        duration: data.duration,
        durationType: data.durationType,
        courseType: data.courseType,
      });
    }

    // Preparar dados para envio (remover espaços em branco e converter para snake_case)
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      duration: data.duration,
      duration_type: data.durationType.trim(),
      course_type: data.courseType.trim(),
    };

    const response = await api.post<ApiResponse<any>>('/courses', payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao criar curso'
      );
    }

    // Converte snake_case do backend para camelCase
    const courseData = response.data.data;
    const course: ICourse = {
      id: courseData.id,
      name: courseData.name,
      description: courseData.description,
      duration: courseData.duration,
      durationType: courseData.duration_type || courseData.durationType,
      courseType: courseData.course_type || courseData.courseType,
      disciplines: courseData.disciplines ? courseData.disciplines.map((cd: any) => {
        // Extrai a disciplina - pode estar em cd.discipline ou ser o próprio cd
        const disciplineData = cd.discipline || cd;

        return {
          id: cd.id,
          courseId: cd.course_id || cd.courseId,
          disciplineId: cd.discipline_id || cd.disciplineId,
          semester: cd.semester,
          discipline: {
            id: disciplineData.id,
            name: disciplineData.name,
            code: disciplineData.code,
            workloadHours: disciplineData.workload_hours || disciplineData.workloadHours,
            createdAt: disciplineData.created_at || disciplineData.createdAt,
            updatedAt: disciplineData.updated_at || disciplineData.updatedAt,
            deletedAt: disciplineData.deleted_at || disciplineData.deletedAt,
          },
          createdAt: cd.created_at || cd.createdAt,
          updatedAt: cd.updated_at || cd.updatedAt,
        };
      }) : undefined,
      createdAt: courseData.created_at || courseData.createdAt,
      updatedAt: courseData.updated_at || courseData.updatedAt,
      deletedAt: courseData.deleted_at || courseData.deletedAt,
    };

    if (import.meta.env.DEV) {
      console.log('[CourseService] Curso criado com sucesso:', course);
    }

    return course;
  } catch (error) {
    console.error('[CourseService] Erro ao criar curso:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao criar curso. Tente novamente.');
  }
}

/**
 * Atualiza dados de curso existente
 *
 * Permite atualização parcial dos dados do curso.
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do curso a ser atualizado
 * @param {IUpdateCourseData} data - Dados a serem atualizados
 * @returns {Promise<ICourse>} Dados do curso atualizado
 * @throws {Error} Quando ID é inválido, dados são inválidos ou erro na API
 *
 * @example
 * try {
 *   const updatedCourse = await update(123, {
 *     description: 'Nova descrição do curso',
 *     durationSemesters: 10
 *   });
 *   console.log('Curso atualizado:', updatedCourse.name);
 * } catch (error) {
 *   console.error('Erro ao atualizar curso:', error);
 * }
 */
export async function update(
  id: number,
  data: IUpdateCourseData
): Promise<ICourse> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do curso é obrigatório e deve ser maior que zero');
    }

    // Validação de dados (se fornecidos)
    if (data.name !== undefined && data.name.trim().length < 3) {
      throw new Error('Nome deve ter no mínimo 3 caracteres');
    }

    if (data.description !== undefined && data.description.trim().length < 10) {
      throw new Error('Descrição deve ter no mínimo 10 caracteres');
    }

    if (data.duration !== undefined) {
      if (data.duration <= 0) {
        throw new Error('Duração deve ser maior que zero');
      }
      if (data.duration > 1000) {
        throw new Error('Duração não pode exceder 1000');
      }
    }

    if (data.durationType !== undefined && data.durationType.trim().length === 0) {
      throw new Error('Tipo de duração não pode ser vazio');
    }

    if (data.courseType !== undefined && data.courseType.trim().length === 0) {
      throw new Error('Tipo de curso não pode ser vazio');
    }

    if (import.meta.env.DEV) {
      console.log('[CourseService] Atualizando curso:', id, data);
    }

    // Preparar dados para envio (remover espaços em branco e converter para snake_case)
    const payload: any = {};

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description.trim();
    if (data.duration !== undefined) payload.duration = data.duration;
    if (data.durationType !== undefined) payload.duration_type = data.durationType.trim();
    if (data.courseType !== undefined) payload.course_type = data.courseType.trim();
    if (data.disciplineIds !== undefined) payload.disciplineIds = data.disciplineIds;

    const response = await api.put<ApiResponse<any>>(
      `/courses/${id}`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message || 'Erro ao atualizar curso'
      );
    }

    // Converte snake_case do backend para camelCase
    const courseData = response.data.data;
    const course: ICourse = {
      id: courseData.id,
      name: courseData.name,
      description: courseData.description,
      duration: courseData.duration,
      durationType: courseData.duration_type || courseData.durationType,
      courseType: courseData.course_type || courseData.courseType,
      disciplines: courseData.disciplines ? courseData.disciplines.map((cd: any) => {
        // Extrai a disciplina - pode estar em cd.discipline ou ser o próprio cd
        const disciplineData = cd.discipline || cd;

        return {
          id: cd.id,
          courseId: cd.course_id || cd.courseId,
          disciplineId: cd.discipline_id || cd.disciplineId,
          semester: cd.semester,
          discipline: {
            id: disciplineData.id,
            name: disciplineData.name,
            code: disciplineData.code,
            workloadHours: disciplineData.workload_hours || disciplineData.workloadHours,
            createdAt: disciplineData.created_at || disciplineData.createdAt,
            updatedAt: disciplineData.updated_at || disciplineData.updatedAt,
            deletedAt: disciplineData.deleted_at || disciplineData.deletedAt,
          },
          createdAt: cd.created_at || cd.createdAt,
          updatedAt: cd.updated_at || cd.updatedAt,
        };
      }) : undefined,
      createdAt: courseData.created_at || courseData.createdAt,
      updatedAt: courseData.updated_at || courseData.updatedAt,
      deletedAt: courseData.deleted_at || courseData.deletedAt,
    };

    if (import.meta.env.DEV) {
      console.log('[CourseService] Curso atualizado com sucesso:', course);
    }

    return course;
  } catch (error) {
    console.error('[CourseService] Erro ao atualizar curso:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao atualizar curso. Tente novamente.');
  }
}

/**
 * Remove curso do sistema
 *
 * Realiza soft delete do curso (marcado como deletado, não removido fisicamente).
 * Apenas usuários administrativos têm permissão para esta operação.
 *
 * @param {number} id - ID do curso a ser removido
 * @returns {Promise<void>}
 * @throws {Error} Quando ID é inválido ou erro na API
 *
 * @example
 * try {
 *   await deleteCourse(123);
 *   console.log('Curso removido com sucesso');
 * } catch (error) {
 *   console.error('Erro ao remover curso:', error);
 * }
 */
export async function deleteCourse(id: number): Promise<void> {
  try {
    // Validação do ID
    if (!id || id <= 0) {
      throw new Error('ID do curso é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[CourseService] Removendo curso:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/courses/${id}`);

    // Handle 204 No Content (successful deletion with no body)
    // The response.data may be undefined or empty for 204 status
    const responseData = response.data as any;

    if (responseData && !responseData.success) {
      throw new Error(
        responseData.error?.message || 'Erro ao remover curso'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[CourseService] Curso removido com sucesso');
    }
  } catch (error) {
    console.error('[CourseService] Erro ao remover curso:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao remover curso. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { getAll, getById, create, update, deleteCourse } from '@/services/course.service';
 *
 * // Importação do objeto completo
 * import CourseService from '@/services/course.service';
 * CourseService.getAll().then(courses => console.log(courses));
 */
const CourseService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCourse,
};

export default CourseService;
