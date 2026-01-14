/**
 * Arquivo: frontend/src/services/classDisciplineSchedule.service.ts
 * Descrição: Serviço para gerenciamento de horários das disciplinas da turma
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 */

import api from './api';
import type {
  IClassDisciplineSchedule,
  IClassDisciplineScheduleCreateRequest,
  IClassDisciplineScheduleUpdateRequest,
  IClassDisciplineScheduleListResponse,
  IClassDisciplineScheduleResponse,
} from '@/types/class.types';

class ClassDisciplineScheduleService {
  /**
   * Lista todos os horários de uma turma
   * @param classId - ID da turma
   * @returns Promise com array de horários
   */
  async getSchedulesByClass(classId: number): Promise<IClassDisciplineSchedule[]> {
    const response = await api.get<IClassDisciplineScheduleListResponse>(
      `/classes/${classId}/schedules`
    );
    return response.data.data;
  }

  /**
   * Lista horários por class_teacher_id
   * @param classTeacherId - ID da relação turma-professor-disciplina
   * @returns Promise com array de horários
   */
  async getSchedulesByClassTeacher(classTeacherId: number): Promise<IClassDisciplineSchedule[]> {
    const response = await api.get<IClassDisciplineScheduleListResponse>(
      `/class-schedules/class-teacher/${classTeacherId}`
    );
    return response.data.data;
  }

  /**
   * Cria um novo horário
   * @param data - Dados do horário
   * @returns Promise com horário criado
   */
  async create(data: IClassDisciplineScheduleCreateRequest): Promise<IClassDisciplineSchedule> {
    const payload = {
      class_teacher_id: data.classTeacherId,
      day_of_week: data.dayOfWeek,
      start_time: data.startTime,
      end_time: data.endTime,
    };

    const response = await api.post<IClassDisciplineScheduleResponse>('/class-schedules', payload);
    return response.data.data;
  }

  /**
   * Atualiza um horário existente
   * @param id - ID do horário
   * @param data - Dados para atualização
   * @returns Promise com horário atualizado
   */
  async update(
    id: number,
    data: IClassDisciplineScheduleUpdateRequest
  ): Promise<IClassDisciplineSchedule> {
    const payload: any = {};

    if (data.dayOfWeek) payload.day_of_week = data.dayOfWeek;
    if (data.startTime) payload.start_time = data.startTime;
    if (data.endTime) payload.end_time = data.endTime;

    const response = await api.put<IClassDisciplineScheduleResponse>(
      `/class-schedules/${id}`,
      payload
    );
    return response.data.data;
  }

  /**
   * Remove um horário
   * @param id - ID do horário
   * @returns Promise<void>
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/class-schedules/${id}`);
  }

  /**
   * Cria múltiplos horários de uma vez
   * @param schedules - Array de horários para criar
   * @returns Promise com horários criados
   */
  async bulkCreate(
    schedules: IClassDisciplineScheduleCreateRequest[]
  ): Promise<IClassDisciplineSchedule[]> {
    const payload = {
      schedules: schedules.map((s) => ({
        class_teacher_id: s.classTeacherId,
        day_of_week: s.dayOfWeek,
        start_time: s.startTime,
        end_time: s.endTime,
      })),
    };

    const response = await api.post<IClassDisciplineScheduleListResponse>(
      '/class-schedules/bulk',
      payload
    );
    return response.data.data;
  }
}

export default new ClassDisciplineScheduleService();
