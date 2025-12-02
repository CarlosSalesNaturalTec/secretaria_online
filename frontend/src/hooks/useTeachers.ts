/**
 * Arquivo: frontend/src/hooks/useTeachers.ts
 * Descrição: Custom hook para gerenciamento de professores com React Query
 * Feature: feat-104 - Criar custom hooks com React Query
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Gerenciar queries para listagem e busca de professores
 * - Gerenciar mutations para CRUD de professores
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
import TeacherService from '@/services/teacher.service';
import type {
  ICreateTeacherData,
  IUpdateTeacherData,
} from '@/services/teacher.service';
import type { ITeacher } from '@/types/teacher.types';

/**
 * Interface para o retorno do hook useTeachers
 */
export interface IUseTeachersReturn {
  /** Query para listar todos os professores */
  listTeachers: UseQueryResult<ITeacher[], Error>;
  /** Query para buscar professor específico por ID */
  getTeacher: (id: number) => UseQueryResult<ITeacher, Error>;
  /** Mutation para criar novo professor */
  createTeacher: UseMutationResult<ITeacher, Error, ICreateTeacherData>;
  /** Mutation para atualizar professor */
  updateTeacher: UseMutationResult<
    ITeacher,
    Error,
    { id: number; data: IUpdateTeacherData }
  >;
  /** Mutation para deletar professor */
  deleteTeacher: UseMutationResult<void, Error, number>;
  /** Mutation para regenerar senha do professor */
  resetTeacherPassword: UseMutationResult<void, Error, number>;
}

/**
 * Custom hook para gerenciamento completo de professores com React Query
 *
 * Fornece queries e mutations para operações CRUD de professores,
 * com sincronização automática de cache após operações.
 *
 * @returns {IUseTeachersReturn} Objeto com queries e mutations para professores
 *
 * @example
 * import { useTeachers } from '@/hooks/useTeachers';
 *
 * export function TeachersPage() {
 *   const { listTeachers, createTeacher } = useTeachers();
 *
 *   if (listTeachers.isLoading) return <div>Carregando...</div>;
 *   if (listTeachers.isError) return <div>Erro: {listTeachers.error.message}</div>;
 *
 *   const handleCreate = async (data: ICreateTeacherData) => {
 *     await createTeacher.mutateAsync(data);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleCreate({...})}>Criar Professor</button>
 *       <ul>
 *         {listTeachers.data?.map(teacher => (
 *           <li key={teacher.id}>{teacher.nome}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useTeachers(): IUseTeachersReturn {
  const queryClient = useQueryClient();

  /**
   * Query para listar todos os professores
   * Utiliza cache de 5 minutos (padrão definido em queryClient)
   */
  const listTeachers = useQuery<ITeacher[], Error>({
    queryKey: ['teachers'],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Executando query para listar professores...');
      }
      return TeacherService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes: cacheTime)
  });

  /**
   * Factory function para criar queries individuais de professores por ID
   * Útil para evitar queries desnecessárias
   */
  const getTeacher = (id: number): UseQueryResult<ITeacher, Error> => {
    return useQuery<ITeacher, Error>({
      queryKey: ['teachers', id],
      queryFn: async () => {
        if (import.meta.env.DEV) {
          console.log(
            `[useTeachers] Executando query para buscar professor ${id}...`
          );
        }
        return TeacherService.getById(id);
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: id > 0, // Apenas executa se ID é válido
    });
  };

  /**
   * Mutation para criar novo professor
   * Invalida a cache de listagem após sucesso para forçar refetch
   */
  const createTeacher = useMutation<ITeacher, Error, ICreateTeacherData>({
    mutationFn: async (data) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Criando novo professor:', data.nome);
      }
      return TeacherService.create(data);
    },
    onSuccess: (newTeacher) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Professor criado com sucesso:', newTeacher.id);
      }
      // Invalidar query de lista para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      // Adicionar novo professor ao cache individual
      queryClient.setQueryData(['teachers', newTeacher.id], newTeacher);
    },
    onError: (error) => {
      console.error('[useTeachers] Erro ao criar professor:', error.message);
    },
  });

  /**
   * Mutation para atualizar professor existente
   * Atualiza cache imediatamente
   */
  const updateTeacher = useMutation<
    ITeacher,
    Error,
    { id: number; data: IUpdateTeacherData }
  >({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Atualizando professor:', id);
      }
      return TeacherService.update(id, data);
    },
    onSuccess: (updatedTeacher, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Professor atualizado com sucesso:', id);
      }
      // Atualizar cache individual
      queryClient.setQueryData(['teachers', id], updatedTeacher);
      // Invalidar lista para refetch (garante consistência)
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (error) => {
      console.error('[useTeachers] Erro ao atualizar professor:', error.message);
    },
  });

  /**
   * Mutation para deletar professor
   * Remove do cache após sucesso
   */
  const deleteTeacher = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Removendo professor:', id);
      }
      return TeacherService.delete(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Professor removido com sucesso:', id);
      }
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: ['teachers', id] });
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (error) => {
      console.error('[useTeachers] Erro ao remover professor:', error.message);
    },
  });

  /**
   * Mutation para regenerar senha do professor
   */
  const resetTeacherPassword = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useTeachers] Regenerando senha do professor:', id);
      }
      return TeacherService.resetPassword(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log(
          '[useTeachers] Senha regenerada e enviada para professor:',
          id
        );
      }
      // Não precisa invalidar cache pois senha não é exibida
    },
    onError: (error) => {
      console.error('[useTeachers] Erro ao regenerar senha:', error.message);
    },
  });

  return {
    listTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    resetTeacherPassword,
  };
}

export default useTeachers;
