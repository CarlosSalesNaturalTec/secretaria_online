/**
 * Arquivo: frontend/src/hooks/useClassSchedule.ts
 * Descrição: Custom hooks para gerenciamento de grade de horários com TanStack Query
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 *
 * Responsabilidades:
 * - Gerenciar queries para listagem de horários
 * - Gerenciar queries para grade da semana
 * - Gerenciar mutations para CRUD de horários
 * - Sincronizar cache após operações
 * - Fornecer loading, error e data states
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import ClassScheduleService from '@/services/classSchedule.service';
import type {
  IClassSchedule,
  IClassScheduleFormData,
  IClassScheduleUpdateRequest,
  WeekSchedule,
  IClassScheduleBulkCreateResponse,
} from '@/types/classSchedule.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Chaves de query centralizadas para horários
 */
export const classScheduleKeys = {
  all: ['classSchedules'] as const,
  byClass: (classId: number) => ['classSchedules', 'class', classId] as const,
  weekSchedule: (classId: number) => ['classSchedules', 'week', classId] as const,
  byId: (id: number) => ['classSchedules', 'detail', id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para buscar horários de uma turma
 *
 * @param classId - ID da turma
 * @returns Query com lista de horários
 *
 * @example
 * const { data, isLoading } = useClassSchedules(1);
 */
export function useClassSchedules(
  classId: number
): UseQueryResult<IClassSchedule[], Error> {
  return useQuery<IClassSchedule[], Error>({
    queryKey: classScheduleKeys.byClass(classId),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Buscando horários da turma:', classId);
      }
      return ClassScheduleService.getByClass(classId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: classId > 0,
  });
}

/**
 * Hook para buscar grade da semana de uma turma
 *
 * @param classId - ID da turma
 * @returns Query com grade organizada por dia da semana
 *
 * @example
 * const { data: weekSchedule } = useWeekSchedule(1);
 * console.log(weekSchedule[1]); // Horários de segunda-feira
 */
export function useWeekSchedule(
  classId: number
): UseQueryResult<WeekSchedule, Error> {
  return useQuery<WeekSchedule, Error>({
    queryKey: classScheduleKeys.weekSchedule(classId),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Buscando grade da semana:', classId);
      }
      return ClassScheduleService.getWeekSchedule(classId);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: classId > 0,
  });
}

/**
 * Hook para buscar horário específico por ID
 *
 * @param id - ID do horário
 * @returns Query com dados do horário
 *
 * @example
 * const { data: schedule } = useClassScheduleById(123);
 */
export function useClassScheduleById(
  id: number
): UseQueryResult<IClassSchedule, Error> {
  return useQuery<IClassSchedule, Error>({
    queryKey: classScheduleKeys.byId(id),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Buscando horário por ID:', id);
      }
      return ClassScheduleService.getById(id);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: id > 0,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para criar novo horário
 *
 * @returns Mutation para criar horário
 *
 * @example
 * const { mutateAsync } = useCreateClassSchedule();
 * await mutateAsync({
 *   classId: 1,
 *   data: { discipline_id: 5, day_of_week: 1, start_time: '08:00', end_time: '10:00' }
 * });
 */
export function useCreateClassSchedule(): UseMutationResult<
  IClassSchedule,
  Error,
  { classId: number; data: IClassScheduleFormData }
> {
  const queryClient = useQueryClient();

  return useMutation<
    IClassSchedule,
    Error,
    { classId: number; data: IClassScheduleFormData }
  >({
    mutationFn: async ({ classId, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Criando novo horário:', {
          classId,
          disciplineId: data.discipline_id,
        });
      }
      return ClassScheduleService.create(classId, data);
    },
    onSuccess: (newSchedule, { classId }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Horário criado com sucesso:', newSchedule.id);
      }
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: classScheduleKeys.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: classScheduleKeys.weekSchedule(classId) });
      // Adicionar ao cache individual
      queryClient.setQueryData(classScheduleKeys.byId(newSchedule.id), newSchedule);
    },
    onError: (error) => {
      console.error('[useClassSchedule] Erro ao criar horário:', error.message);
    },
  });
}

/**
 * Hook para criar múltiplos horários em lote
 *
 * @returns Mutation para criar horários em lote
 *
 * @example
 * const { mutateAsync } = useBulkCreateClassSchedule();
 * await mutateAsync({
 *   classId: 1,
 *   schedules: [
 *     { discipline_id: 5, day_of_week: 1, start_time: '08:00', end_time: '10:00' },
 *     { discipline_id: 6, day_of_week: 2, start_time: '10:00', end_time: '12:00' }
 *   ]
 * });
 */
export function useBulkCreateClassSchedule(): UseMutationResult<
  IClassScheduleBulkCreateResponse['data'],
  Error,
  { classId: number; schedules: IClassScheduleFormData[] }
> {
  const queryClient = useQueryClient();

  return useMutation<
    IClassScheduleBulkCreateResponse['data'],
    Error,
    { classId: number; schedules: IClassScheduleFormData[] }
  >({
    mutationFn: async ({ classId, schedules }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Criando horários em lote:', {
          classId,
          count: schedules.length,
        });
      }
      return ClassScheduleService.bulkCreate(classId, schedules);
    },
    onSuccess: (result, { classId }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Horários criados em lote:', {
          created: result.created.length,
          errors: result.errors.length,
        });
      }
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: classScheduleKeys.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: classScheduleKeys.weekSchedule(classId) });
    },
    onError: (error) => {
      console.error('[useClassSchedule] Erro ao criar horários em lote:', error.message);
    },
  });
}

/**
 * Hook para atualizar horário existente
 *
 * @returns Mutation para atualizar horário
 *
 * @example
 * const { mutateAsync } = useUpdateClassSchedule();
 * await mutateAsync({ id: 123, data: { start_time: '09:00' } });
 */
export function useUpdateClassSchedule(): UseMutationResult<
  IClassSchedule,
  Error,
  { id: number; data: IClassScheduleUpdateRequest; classId?: number }
> {
  const queryClient = useQueryClient();

  return useMutation<
    IClassSchedule,
    Error,
    { id: number; data: IClassScheduleUpdateRequest; classId?: number }
  >({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Atualizando horário:', id);
      }
      return ClassScheduleService.update(id, data);
    },
    onSuccess: (updatedSchedule, { id, classId }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Horário atualizado com sucesso:', id);
      }
      // Atualizar cache individual
      queryClient.setQueryData(classScheduleKeys.byId(id), updatedSchedule);
      // Invalidar queries da turma (se classId fornecido)
      if (classId) {
        queryClient.invalidateQueries({ queryKey: classScheduleKeys.byClass(classId) });
        queryClient.invalidateQueries({ queryKey: classScheduleKeys.weekSchedule(classId) });
      }
      // Invalidar todas as queries de horários (fallback)
      queryClient.invalidateQueries({ queryKey: classScheduleKeys.all });
    },
    onError: (error) => {
      console.error('[useClassSchedule] Erro ao atualizar horário:', error.message);
    },
  });
}

/**
 * Hook para deletar horário
 *
 * @returns Mutation para deletar horário
 *
 * @example
 * const { mutateAsync } = useDeleteClassSchedule();
 * await mutateAsync({ id: 123, classId: 1 });
 */
export function useDeleteClassSchedule(): UseMutationResult<
  void,
  Error,
  { id: number; classId?: number }
> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; classId?: number }>({
    mutationFn: async ({ id }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Removendo horário:', id);
      }
      return ClassScheduleService.delete(id);
    },
    onSuccess: (_, { id, classId }) => {
      if (import.meta.env.DEV) {
        console.log('[useClassSchedule] Horário removido com sucesso:', id);
      }
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: classScheduleKeys.byId(id) });
      // Invalidar queries da turma (se classId fornecido)
      if (classId) {
        queryClient.invalidateQueries({ queryKey: classScheduleKeys.byClass(classId) });
        queryClient.invalidateQueries({ queryKey: classScheduleKeys.weekSchedule(classId) });
      }
      // Invalidar todas as queries de horários (fallback)
      queryClient.invalidateQueries({ queryKey: classScheduleKeys.all });
    },
    onError: (error) => {
      console.error('[useClassSchedule] Erro ao remover horário:', error.message);
    },
  });
}

// ============================================================================
// HOOK AGREGADO
// ============================================================================

/**
 * Interface para o retorno do hook useClassSchedule
 */
export interface IUseClassScheduleReturn {
  /** Query para listar horários de uma turma */
  getSchedules: (classId: number) => UseQueryResult<IClassSchedule[], Error>;
  /** Query para grade da semana */
  getWeekSchedule: (classId: number) => UseQueryResult<WeekSchedule, Error>;
  /** Query para horário específico */
  getScheduleById: (id: number) => UseQueryResult<IClassSchedule, Error>;
  /** Mutation para criar horário */
  createSchedule: UseMutationResult<
    IClassSchedule,
    Error,
    { classId: number; data: IClassScheduleFormData }
  >;
  /** Mutation para criar horários em lote */
  bulkCreateSchedules: UseMutationResult<
    IClassScheduleBulkCreateResponse['data'],
    Error,
    { classId: number; schedules: IClassScheduleFormData[] }
  >;
  /** Mutation para atualizar horário */
  updateSchedule: UseMutationResult<
    IClassSchedule,
    Error,
    { id: number; data: IClassScheduleUpdateRequest; classId?: number }
  >;
  /** Mutation para deletar horário */
  deleteSchedule: UseMutationResult<void, Error, { id: number; classId?: number }>;
}

/**
 * Custom hook agregado para gerenciamento completo de horários
 *
 * Fornece queries e mutations para operações CRUD de horários,
 * com sincronização automática de cache.
 *
 * @returns Objeto com queries e mutations para horários
 *
 * @example
 * const { createSchedule, getSchedules } = useClassSchedule();
 *
 * // Buscar horários
 * const schedules = getSchedules(classId);
 *
 * // Criar horário
 * await createSchedule.mutateAsync({ classId, data });
 */
export function useClassSchedule(): IUseClassScheduleReturn {
  const createSchedule = useCreateClassSchedule();
  const bulkCreateSchedules = useBulkCreateClassSchedule();
  const updateSchedule = useUpdateClassSchedule();
  const deleteSchedule = useDeleteClassSchedule();

  return {
    getSchedules: useClassSchedules,
    getWeekSchedule: useWeekSchedule,
    getScheduleById: useClassScheduleById,
    createSchedule,
    bulkCreateSchedules,
    updateSchedule,
    deleteSchedule,
  };
}

export default useClassSchedule;
