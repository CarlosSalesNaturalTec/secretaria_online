/**
 * Arquivo: frontend/src/services/evaluation.service.ts
 * Descrição: Serviço para gerenciamento de avaliações
 * Feature: feat-evaluation-ui - Criar interface de gerenciamento de avaliações
 * Criado em: 2025-12-09
 */

import api from './api';
import type { ApiResponse } from '@/types/api.types';
import type { IEvaluation, ICreateEvaluationData, IUpdateEvaluationData } from '@/types/evaluation.types';

function mapEvaluationData(data: any): IEvaluation {
  return {
    id: data.id,
    classId: data.class_id || data.classId,
    teacherId: data.teacher_id || data.teacherId,
    disciplineId: data.discipline_id || data.disciplineId,
    name: data.name,
    date: data.date,
    type: data.type,
    class: data.class ? {
      id: data.class.id,
      courseId: data.class.course_id || data.class.courseId,
      semester: data.class.semester,
      year: data.class.year,
      course: data.class.course ? {
        id: data.class.course.id,
        name: data.class.course.name,
        description: data.class.course.description,
        duration: data.class.course.duration,
        durationType: data.class.course.duration_type || data.class.course.durationType,
        courseType: data.class.course.course_type || data.class.course.courseType,
        createdAt: data.class.course.created_at || data.class.course.createdAt,
        updatedAt: data.class.course.updated_at || data.class.course.updatedAt,
        deletedAt: data.class.course.deleted_at || data.class.course.deletedAt,
      } : undefined,
      createdAt: data.class.created_at || data.class.createdAt,
      updatedAt: data.class.updated_at || data.class.updatedAt,
      deletedAt: data.class.deleted_at || data.class.deletedAt,
    } : undefined,
    teacher: data.teacher ? {
      id: data.teacher.id,
      nome: data.teacher.nome || data.teacher.name,
      email: data.teacher.email,
      cpf: data.teacher.cpf,
    } : undefined,
    discipline: data.discipline ? {
      id: data.discipline.id,
      name: data.discipline.name,
      code: data.discipline.code,
      workloadHours: data.discipline.workload_hours || data.discipline.workloadHours,
      createdAt: data.discipline.created_at || data.discipline.createdAt,
      updatedAt: data.discipline.updated_at || data.discipline.updatedAt,
      deletedAt: data.discipline.deleted_at || data.discipline.deletedAt,
    } : undefined,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
}

export async function getAll(): Promise<IEvaluation[]> {
  try {
    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Buscando todas as avaliações...');
    }

    const response = await api.get<ApiResponse<any[]>>('/evaluations');

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao buscar avaliações');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Avaliações recuperadas:', response.data.data.length);
    }

    return response.data.data.map(mapEvaluationData);
  } catch (error) {
    console.error('[EvaluationService] Erro ao buscar avaliações:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao buscar avaliações. Tente novamente.');
  }
}

export async function getById(id: number): Promise<IEvaluation> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Buscando avaliação por ID:', id);
    }

    const response = await api.get<ApiResponse<any>>(`/evaluations/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao buscar avaliação');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Avaliação encontrada:', response.data.data.id);
    }

    return mapEvaluationData(response.data.data);
  } catch (error) {
    console.error('[EvaluationService] Erro ao buscar avaliação:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao buscar avaliação. Tente novamente.');
  }
}

export async function create(data: ICreateEvaluationData): Promise<IEvaluation> {
  try {
    if (!data.classId || data.classId <= 0) {
      throw new Error('Turma é obrigatória');
    }

    if (!data.disciplineId || data.disciplineId <= 0) {
      throw new Error('Disciplina é obrigatória');
    }

    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Nome é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!data.date) {
      throw new Error('Data é obrigatória');
    }

    if (!data.type || (data.type !== 'grade' && data.type !== 'concept')) {
      throw new Error('Tipo é obrigatório e deve ser "grade" ou "concept"');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Criando nova avaliação:', {
        classId: data.classId,
        disciplineId: data.disciplineId,
        name: data.name,
        type: data.type,
      });
    }

    const payload = {
      class_id: data.classId,
      teacher_id: data.teacherId,
      discipline_id: data.disciplineId,
      name: data.name.trim(),
      date: data.date,
      type: data.type,
    };

    const response = await api.post<ApiResponse<any>>('/evaluations', payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao criar avaliação');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Avaliação criada com sucesso:', response.data.data.id);
    }

    return mapEvaluationData(response.data.data);
  } catch (error) {
    console.error('[EvaluationService] Erro ao criar avaliação:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao criar avaliação. Tente novamente.');
  }
}

export async function update(id: number, data: IUpdateEvaluationData): Promise<IEvaluation> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    if (data.classId !== undefined && data.classId <= 0) {
      throw new Error('Turma deve ser válida');
    }

    if (data.disciplineId !== undefined && data.disciplineId <= 0) {
      throw new Error('Disciplina deve ser válida');
    }

    if (data.name !== undefined && data.name.trim().length < 3) {
      throw new Error('Nome deve ter no mínimo 3 caracteres');
    }

    if (data.type !== undefined && data.type !== 'grade' && data.type !== 'concept') {
      throw new Error('Tipo deve ser "grade" ou "concept"');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Atualizando avaliação:', id, data);
    }

    const payload: any = {};

    if (data.classId !== undefined) payload.class_id = data.classId;
    if (data.teacherId !== undefined) payload.teacher_id = data.teacherId;
    if (data.disciplineId !== undefined) payload.discipline_id = data.disciplineId;
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.date !== undefined) payload.date = data.date;
    if (data.type !== undefined) payload.type = data.type;

    const response = await api.put<ApiResponse<any>>(`/evaluations/${id}`, payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar avaliação');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Avaliação atualizada com sucesso:', response.data.data.id);
    }

    return mapEvaluationData(response.data.data);
  } catch (error) {
    console.error('[EvaluationService] Erro ao atualizar avaliação:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao atualizar avaliação. Tente novamente.');
  }
}

export async function deleteEvaluation(id: number): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new Error('ID da avaliação é obrigatório e deve ser maior que zero');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Removendo avaliação:', id);
    }

    const response = await api.delete<ApiResponse<void>>(`/evaluations/${id}`);

    const responseData = response.data as any;

    if (responseData && !responseData.success) {
      throw new Error(responseData.error?.message || 'Erro ao remover avaliação');
    }

    if (import.meta.env.DEV) {
      console.log('[EvaluationService] Avaliação removida com sucesso');
    }
  } catch (error) {
    console.error('[EvaluationService] Erro ao remover avaliação:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao remover avaliação. Tente novamente.');
  }
}

const EvaluationService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEvaluation,
};

export default EvaluationService;
