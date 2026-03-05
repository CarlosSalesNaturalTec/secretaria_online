/**
 * Arquivo: frontend/src/services/studentDisciplineExemption.service.ts
 * Descrição: Serviço para aproveitamento de disciplinas (dispensa)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

import api from './api';
import type { IStudentDisciplineExemption, ICreateExemptionDTO } from '@/types/studentDisciplineExemption.types';

const studentDisciplineExemptionService = {
  getByStudent: async (studentId: number): Promise<IStudentDisciplineExemption[]> => {
    const response = await api.get(`/students/${studentId}/exemptions`);
    return response.data.data;
  },

  create: async (studentId: number, data: ICreateExemptionDTO): Promise<IStudentDisciplineExemption> => {
    const response = await api.post(`/students/${studentId}/exemptions`, data);
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/exemptions/${id}`);
  }
};

export default studentDisciplineExemptionService;
