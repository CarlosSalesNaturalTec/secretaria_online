/**
 * Arquivo: frontend/src/hooks/useEnrollments.ts
 * Descrição: Custom hook para gerenciamento de matrículas com TanStack Query
 * Feature: feat-106 - Gerenciar matrículas de alunos em cursos (Frontend)
 * Criado em: 2025-11-09
 *
 * Responsabilidades:
 * - Gerenciar estado de matrículas com TanStack Query
 * - Fazer caching de dados de matrículas
 * - Invalidar cache ao atualizar/deletar matrículas
 * - Fornecer hooks para CRUD de matrículas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EnrollmentService, {
  type ICreateEnrollmentData,
  type IUpdateEnrollmentData,
} from '@/services/enrollment.service';
import type { IEnrollmentFilters } from '@/types/enrollment.types';

/**
 * Query key para matrículas
 */
const QUERY_KEYS = {
  all: ['enrollments'] as const,
  list: (filters?: IEnrollmentFilters) => [...QUERY_KEYS.all, 'list', filters] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

/**
 * Hook para buscar todas as matrículas
 *
 * @param filters - Filtros de busca opcionais
 * @returns Query result com dados de matrículas
 *
 * @example
 * const { data: enrollments, isLoading } = useEnrollments();
 */
export function useEnrollments(filters?: IEnrollmentFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => EnrollmentService.getAll(filters),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antes: cacheTime)
  });
}

/**
 * Hook para buscar uma matrícula específica
 *
 * @param id - ID da matrícula
 * @param enabled - Se a query deve rodar automaticamente
 * @returns Query result com dados da matrícula
 *
 * @example
 * const { data: enrollment } = useEnrollmentById(1);
 */
export function useEnrollmentById(id: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => EnrollmentService.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para criar nova matrícula
 *
 * @returns Mutation para criar matrícula
 *
 * @example
 * const { mutate: createEnrollment, isPending } = useCreateEnrollment();
 *
 * createEnrollment({
 *   studentId: 5,
 *   courseId: 1,
 *   enrollmentDate: '2025-01-15'
 * }, {
 *   onSuccess: () => console.log('Matrícula criada!')
 * });
 */
export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateEnrollmentData) =>
      EnrollmentService.create(data),
    onSuccess: () => {
      // Invalidar lista de matrículas para atualizar
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all,
      });
    },
  });
}

/**
 * Hook para atualizar uma matrícula
 *
 * @returns Mutation para atualizar matrícula
 *
 * @example
 * const { mutate: updateEnrollment } = useUpdateEnrollment();
 *
 * updateEnrollment({
 *   id: 1,
 *   data: { status: 'active' }
 * });
 */
export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: IUpdateEnrollmentData;
    }) => EnrollmentService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar dados específicos da matrícula e lista
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all,
      });
    },
  });
}

/**
 * Hook para atualizar apenas o status de uma matrícula
 *
 * @returns Mutation para atualizar status
 *
 * @example
 * const { mutate: updateStatus } = useUpdateEnrollmentStatus();
 *
 * updateStatus({
 *   id: 1,
 *   status: 'active'
 * });
 */
export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: 'pending' | 'active' | 'cancelled';
    }) => EnrollmentService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all,
      });
    },
  });
}

/**
 * Hook para deletar uma matrícula
 *
 * @returns Mutation para deletar matrícula
 *
 * @example
 * const { mutate: deleteEnrollment, isPending } = useDeleteEnrollment();
 *
 * deleteEnrollment(1, {
 *   onSuccess: () => console.log('Deletado!')
 * });
 */
export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => EnrollmentService.delete(id),
    onSuccess: () => {
      // Invalidar lista após deletar
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all,
      });
    },
  });
}
