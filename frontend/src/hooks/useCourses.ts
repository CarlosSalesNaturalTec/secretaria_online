/**
 * Arquivo: frontend/src/hooks/useCourses.ts
 * Descrição: Custom hook para gerenciamento de cursos com React Query
 * Feature: feat-104 - Criar custom hooks com React Query
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Gerenciar queries para listagem e busca de cursos
 * - Gerenciar mutations para CRUD de cursos
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
import CourseService from '@/services/course.service';
import type {
  ICreateCourseData,
  IUpdateCourseData,
  IPaginatedCoursesResponse,
} from '@/services/course.service';
import type { ICourse } from '@/types/course.types';

/**
 * Interface para o retorno do hook useCourses
 */
export interface IUseCoursesReturn {
  /** Query para listar todos os cursos com paginação */
  listCourses: UseQueryResult<IPaginatedCoursesResponse, Error>;
  /** Query para buscar curso específico por ID */
  getCourse: (id: number) => UseQueryResult<ICourse, Error>;
  /** Mutation para criar novo curso */
  createCourse: UseMutationResult<ICourse, Error, ICreateCourseData>;
  /** Mutation para atualizar curso */
  updateCourse: UseMutationResult<
    ICourse,
    Error,
    { id: number; data: IUpdateCourseData }
  >;
  /** Mutation para deletar curso */
  deleteCourse: UseMutationResult<void, Error, number>;
}

/**
 * Custom hook para gerenciamento completo de cursos com React Query
 *
 * Fornece queries e mutations para operações CRUD de cursos,
 * com sincronização automática de cache após operações.
 *
 * @returns {IUseCoursesReturn} Objeto com queries e mutations para cursos
 *
 * @example
 * import { useCourses } from '@/hooks/useCourses';
 *
 * export function CoursesPage() {
 *   const { listCourses, createCourse } = useCourses();
 *
 *   if (listCourses.isLoading) return <div>Carregando...</div>;
 *   if (listCourses.isError) return <div>Erro: {listCourses.error.message}</div>;
 *
 *   const handleCreate = async (data: ICreateCourseData) => {
 *     await createCourse.mutateAsync(data);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleCreate({...})}>Criar Curso</button>
 *       <ul>
 *         {listCourses.data?.map(course => (
 *           <li key={course.id}>{course.name}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useCourses(): IUseCoursesReturn {
  const queryClient = useQueryClient();

  /**
   * Query para listar todos os cursos com paginação
   * Utiliza cache de 5 minutos (padrão definido em queryClient)
   */
  const listCourses = useQuery<IPaginatedCoursesResponse, Error>({
    queryKey: ['courses'],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Executando query para listar cursos...');
      }
      return CourseService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes: cacheTime)
  });

  /**
   * Factory function para criar queries individuais de cursos por ID
   * Útil para evitar queries desnecessárias
   */
  const getCourse = (id: number): UseQueryResult<ICourse, Error> => {
    return useQuery<ICourse, Error>({
      queryKey: ['courses', id],
      queryFn: async () => {
        if (import.meta.env.DEV) {
          console.log(
            `[useCourses] Executando query para buscar curso ${id}...`
          );
        }
        return CourseService.getById(id);
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: id > 0, // Apenas executa se ID é válido
    });
  };

  /**
   * Mutation para criar novo curso
   * Invalida a cache de listagem após sucesso para forçar refetch
   */
  const createCourse = useMutation<ICourse, Error, ICreateCourseData>({
    mutationFn: async (data) => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Criando novo curso:', data.name);
      }
      return CourseService.create(data);
    },
    onSuccess: (newCourse) => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Curso criado com sucesso:', newCourse.id);
      }
      // Invalidar query de lista para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      // Adicionar novo curso ao cache individual
      queryClient.setQueryData(['courses', newCourse.id], newCourse);
    },
    onError: (error) => {
      console.error('[useCourses] Erro ao criar curso:', error.message);
    },
  });

  /**
   * Mutation para atualizar curso existente
   * Atualiza cache imediatamente
   */
  const updateCourse = useMutation<
    ICourse,
    Error,
    { id: number; data: IUpdateCourseData }
  >({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Atualizando curso:', id);
      }
      return CourseService.update(id, data);
    },
    onSuccess: (updatedCourse, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Curso atualizado com sucesso:', id);
      }
      // Atualizar cache individual
      queryClient.setQueryData(['courses', id], updatedCourse);
      // Invalidar lista para refetch (garante consistência)
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      console.error('[useCourses] Erro ao atualizar curso:', error.message);
    },
  });

  /**
   * Mutation para deletar curso
   * Remove do cache após sucesso
   */
  const deleteCourse = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Removendo curso:', id);
      }
      return CourseService.delete(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log('[useCourses] Curso removido com sucesso:', id);
      }
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: ['courses', id] });
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      console.error('[useCourses] Erro ao remover curso:', error.message);
    },
  });

  return {
    listCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

export default useCourses;
