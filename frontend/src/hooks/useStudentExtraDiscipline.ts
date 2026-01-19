/**
 * Arquivo: frontend/src/hooks/useStudentExtraDiscipline.ts
 * Descrição: Custom hooks para gerenciamento de disciplinas extras com TanStack Query
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 *
 * Responsabilidades:
 * - Gerenciar queries para listagem de disciplinas extras
 * - Gerenciar queries para grade completa do aluno
 * - Gerenciar mutations para CRUD de disciplinas extras
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
import StudentExtraDisciplineService from '@/services/studentExtraDiscipline.service';
import type {
  IStudentExtraDiscipline,
  IStudentExtraDisciplineFormData,
  IStudentExtraDisciplineUpdateRequest,
  IStudentFullSchedule,
  IStudentExtraDisciplineFilters,
} from '@/types/studentExtraDiscipline.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Chaves de query centralizadas para disciplinas extras
 */
export const studentExtraDisciplineKeys = {
  all: ['studentExtraDisciplines'] as const,
  byStudent: (studentId: number) => ['studentExtraDisciplines', 'student', studentId] as const,
  fullSchedule: (studentId: number) => ['studentExtraDisciplines', 'fullSchedule', studentId] as const,
  byId: (id: number) => ['studentExtraDisciplines', 'detail', id] as const,
  byDiscipline: (disciplineId: number) => ['studentExtraDisciplines', 'discipline', disciplineId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para buscar disciplinas extras de um aluno
 *
 * @param studentId - ID do aluno
 * @param filters - Filtros opcionais (status, reason)
 * @returns Query com lista de disciplinas extras
 *
 * @example
 * const { data, isLoading } = useStudentExtraDisciplines(1);
 * const { data } = useStudentExtraDisciplines(1, { status: 'active' });
 */
export function useStudentExtraDisciplines(
  studentId: number,
  filters?: IStudentExtraDisciplineFilters
): UseQueryResult<IStudentExtraDiscipline[], Error> {
  return useQuery<IStudentExtraDiscipline[], Error>({
    queryKey: [...studentExtraDisciplineKeys.byStudent(studentId), filters],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Buscando disciplinas extras do aluno:', studentId);
      }
      return StudentExtraDisciplineService.getByStudent(studentId, filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: studentId > 0,
  });
}

/**
 * Hook para buscar grade completa do aluno (turma principal + extras)
 *
 * @param studentId - ID do aluno
 * @returns Query com grade completa
 *
 * @example
 * const { data: fullSchedule } = useStudentFullSchedule(1);
 * console.log(fullSchedule?.mainClassSchedules);
 * console.log(fullSchedule?.extraDisciplineSchedules);
 */
export function useStudentFullSchedule(
  studentId: number
): UseQueryResult<IStudentFullSchedule, Error> {
  return useQuery<IStudentFullSchedule, Error>({
    queryKey: studentExtraDisciplineKeys.fullSchedule(studentId),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Buscando grade completa do aluno:', studentId);
      }
      return StudentExtraDisciplineService.getFullSchedule(studentId);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: studentId > 0,
  });
}

/**
 * Hook para buscar disciplina extra específica por ID
 *
 * @param id - ID da disciplina extra
 * @returns Query com dados da disciplina extra
 *
 * @example
 * const { data: extra } = useStudentExtraDisciplineById(123);
 */
export function useStudentExtraDisciplineById(
  id: number
): UseQueryResult<IStudentExtraDiscipline, Error> {
  return useQuery<IStudentExtraDiscipline, Error>({
    queryKey: studentExtraDisciplineKeys.byId(id),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Buscando disciplina extra por ID:', id);
      }
      return StudentExtraDisciplineService.getById(id);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: id > 0,
  });
}

/**
 * Hook para buscar alunos com uma disciplina extra específica
 *
 * @param disciplineId - ID da disciplina
 * @param filters - Filtros opcionais
 * @returns Query com lista de disciplinas extras
 *
 * @example
 * const { data } = useExtraDisciplineStudents(5, { status: 'active' });
 */
export function useExtraDisciplineStudents(
  disciplineId: number,
  filters?: IStudentExtraDisciplineFilters
): UseQueryResult<IStudentExtraDiscipline[], Error> {
  return useQuery<IStudentExtraDiscipline[], Error>({
    queryKey: [...studentExtraDisciplineKeys.byDiscipline(disciplineId), filters],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Buscando alunos com disciplina extra:', disciplineId);
      }
      return StudentExtraDisciplineService.getByDiscipline(disciplineId, filters);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: disciplineId > 0,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para criar nova disciplina extra
 *
 * @returns Mutation para criar disciplina extra
 *
 * @example
 * const { mutateAsync } = useCreateStudentExtraDiscipline();
 * await mutateAsync({
 *   studentId: 1,
 *   data: { discipline_id: 5, enrollment_date: '2026-01-18', reason: 'dependency' }
 * });
 */
export function useCreateStudentExtraDiscipline(): UseMutationResult<
  IStudentExtraDiscipline,
  Error,
  { studentId: number; data: IStudentExtraDisciplineFormData }
> {
  const queryClient = useQueryClient();

  return useMutation<
    IStudentExtraDiscipline,
    Error,
    { studentId: number; data: IStudentExtraDisciplineFormData }
  >({
    mutationFn: async ({ studentId, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Criando disciplina extra:', {
          studentId,
          disciplineId: data.discipline_id,
        });
      }
      return StudentExtraDisciplineService.create(studentId, data);
    },
    onSuccess: (newExtra, { studentId }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Disciplina extra criada:', newExtra.id);
      }
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.byStudent(studentId) });
      queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.fullSchedule(studentId) });
      // Adicionar ao cache individual
      queryClient.setQueryData(studentExtraDisciplineKeys.byId(newExtra.id), newExtra);
    },
    onError: (error) => {
      console.error('[useStudentExtraDiscipline] Erro ao criar disciplina extra:', error.message);
    },
  });
}

/**
 * Hook para atualizar disciplina extra existente
 *
 * @returns Mutation para atualizar disciplina extra
 *
 * @example
 * const { mutateAsync } = useUpdateStudentExtraDiscipline();
 * await mutateAsync({ id: 123, data: { status: 'completed' }, studentId: 1 });
 */
export function useUpdateStudentExtraDiscipline(): UseMutationResult<
  IStudentExtraDiscipline,
  Error,
  { id: number; data: IStudentExtraDisciplineUpdateRequest; studentId?: number }
> {
  const queryClient = useQueryClient();

  return useMutation<
    IStudentExtraDiscipline,
    Error,
    { id: number; data: IStudentExtraDisciplineUpdateRequest; studentId?: number }
  >({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Atualizando disciplina extra:', id);
      }
      return StudentExtraDisciplineService.update(id, data);
    },
    onSuccess: (updatedExtra, { id, studentId }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Disciplina extra atualizada:', id);
      }
      // Atualizar cache individual
      queryClient.setQueryData(studentExtraDisciplineKeys.byId(id), updatedExtra);
      // Invalidar queries do aluno (se studentId fornecido)
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.byStudent(studentId) });
        queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.fullSchedule(studentId) });
      }
      // Invalidar todas as queries (fallback)
      queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.all });
    },
    onError: (error) => {
      console.error('[useStudentExtraDiscipline] Erro ao atualizar disciplina extra:', error.message);
    },
  });
}

/**
 * Hook para deletar disciplina extra
 *
 * @returns Mutation para deletar disciplina extra
 *
 * @example
 * const { mutateAsync } = useDeleteStudentExtraDiscipline();
 * await mutateAsync({ id: 123, studentId: 1 });
 */
export function useDeleteStudentExtraDiscipline(): UseMutationResult<
  void,
  Error,
  { id: number; studentId?: number }
> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; studentId?: number }>({
    mutationFn: async ({ id }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Removendo disciplina extra:', id);
      }
      return StudentExtraDisciplineService.delete(id);
    },
    onSuccess: (_, { id, studentId }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudentExtraDiscipline] Disciplina extra removida:', id);
      }
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: studentExtraDisciplineKeys.byId(id) });
      // Invalidar queries do aluno (se studentId fornecido)
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.byStudent(studentId) });
        queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.fullSchedule(studentId) });
      }
      // Invalidar todas as queries (fallback)
      queryClient.invalidateQueries({ queryKey: studentExtraDisciplineKeys.all });
    },
    onError: (error) => {
      console.error('[useStudentExtraDiscipline] Erro ao remover disciplina extra:', error.message);
    },
  });
}

// ============================================================================
// HOOK AGREGADO
// ============================================================================

/**
 * Interface para o retorno do hook useStudentExtraDiscipline
 */
export interface IUseStudentExtraDisciplineReturn {
  /** Query para listar disciplinas extras de um aluno */
  getExtraDisciplines: (
    studentId: number,
    filters?: IStudentExtraDisciplineFilters
  ) => UseQueryResult<IStudentExtraDiscipline[], Error>;
  /** Query para grade completa do aluno */
  getFullSchedule: (studentId: number) => UseQueryResult<IStudentFullSchedule, Error>;
  /** Query para disciplina extra específica */
  getExtraDisciplineById: (id: number) => UseQueryResult<IStudentExtraDiscipline, Error>;
  /** Query para alunos com uma disciplina extra */
  getStudentsByDiscipline: (
    disciplineId: number,
    filters?: IStudentExtraDisciplineFilters
  ) => UseQueryResult<IStudentExtraDiscipline[], Error>;
  /** Mutation para criar disciplina extra */
  createExtraDiscipline: UseMutationResult<
    IStudentExtraDiscipline,
    Error,
    { studentId: number; data: IStudentExtraDisciplineFormData }
  >;
  /** Mutation para atualizar disciplina extra */
  updateExtraDiscipline: UseMutationResult<
    IStudentExtraDiscipline,
    Error,
    { id: number; data: IStudentExtraDisciplineUpdateRequest; studentId?: number }
  >;
  /** Mutation para deletar disciplina extra */
  deleteExtraDiscipline: UseMutationResult<void, Error, { id: number; studentId?: number }>;
}

/**
 * Custom hook agregado para gerenciamento completo de disciplinas extras
 *
 * Fornece queries e mutations para operações CRUD de disciplinas extras,
 * com sincronização automática de cache.
 *
 * @returns Objeto com queries e mutations para disciplinas extras
 *
 * @example
 * const { createExtraDiscipline, getExtraDisciplines } = useStudentExtraDiscipline();
 *
 * // Buscar disciplinas extras
 * const extras = getExtraDisciplines(studentId);
 *
 * // Criar disciplina extra
 * await createExtraDiscipline.mutateAsync({ studentId, data });
 */
export function useStudentExtraDiscipline(): IUseStudentExtraDisciplineReturn {
  const createExtraDiscipline = useCreateStudentExtraDiscipline();
  const updateExtraDiscipline = useUpdateStudentExtraDiscipline();
  const deleteExtraDiscipline = useDeleteStudentExtraDiscipline();

  return {
    getExtraDisciplines: useStudentExtraDisciplines,
    getFullSchedule: useStudentFullSchedule,
    getExtraDisciplineById: useStudentExtraDisciplineById,
    getStudentsByDiscipline: useExtraDisciplineStudents,
    createExtraDiscipline,
    updateExtraDiscipline,
    deleteExtraDiscipline,
  };
}

export default useStudentExtraDiscipline;
