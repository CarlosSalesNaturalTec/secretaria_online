/**
 * Arquivo: frontend/src/hooks/useStudentExemptions.ts
 * Descrição: Custom hooks para aproveitamento de disciplinas com TanStack Query
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import exemptionService from '@/services/studentDisciplineExemption.service';
import type { ICreateExemptionDTO } from '@/types/studentDisciplineExemption.types';

export const EXEMPTION_KEYS = {
  byStudent: (studentId: number) => ['exemptions', 'student', studentId] as const
};

export const useStudentExemptions = (studentId: number | undefined) => {
  return useQuery({
    queryKey: EXEMPTION_KEYS.byStudent(studentId!),
    queryFn: () => exemptionService.getByStudent(studentId!),
    enabled: !!studentId
  });
};

export const useCreateExemption = (studentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateExemptionDTO) => exemptionService.create(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXEMPTION_KEYS.byStudent(studentId) });
    }
  });
};

export const useDeleteExemption = (studentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => exemptionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXEMPTION_KEYS.byStudent(studentId) });
    }
  });
};
