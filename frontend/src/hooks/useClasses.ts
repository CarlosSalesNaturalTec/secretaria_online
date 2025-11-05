/**
 * Arquivo: frontend/src/hooks/useClasses.ts
 * Descrição: Custom hook para gerenciamento de turmas com React Query
 * Feature: feat-104 - Criar custom hooks com React Query
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Gerenciar queries para listagem e busca de turmas
 * - Gerenciar mutations para CRUD de turmas
 * - Sincronizar cache após operações
 * - Fornecer loading, error e data states
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import ClassService, {
  ICreateClassData,
  IUpdateClassData,
} from '@/services/class.service';
import type { IClass } from '@/types/class.types';

/**
 * Interface para o retorno do hook useClasses
 */
export interface IUseClassesReturn {
  /** Query para listar todas as turmas */
  listClasses: UseQueryResult<IClass[], Error>;
  /** Query para buscar turma específica por ID */
  getClass: (id: number) => UseQueryResult<IClass, Error>;
  /** Mutation para criar nova turma */
  createClass: UseMutationResult<IClass, Error, ICreateClassData>;
  /** Mutation para atualizar turma */
  updateClass: UseMutationResult<
    IClass,
    Error,
    { id: number; data: IUpdateClassData }
  >;
  /** Mutation para deletar turma */
  deleteClass: UseMutationResult<void, Error, number>;
}

/**
 * Custom hook para gerenciamento completo de turmas com React Query
 *
 * Fornece queries e mutations para operações CRUD de turmas,
 * com sincronização automática de cache após operações.
 * Turmas podem ter múltiplos professores (cada um lecionando uma disciplina)
 * e múltiplos alunos vinculados.
 *
 * @returns {IUseClassesReturn} Objeto com queries e mutations para turmas
 *
 * @example
 * import { useClasses } from '@/hooks/useClasses';
 *
 * export function ClassesPage() {
 *   const { listClasses, createClass } = useClasses();
 *
 *   if (listClasses.isLoading) return <div>Carregando...</div>;
 *   if (listClasses.isError) return <div>Erro: {listClasses.error.message}</div>;
 *
 *   const handleCreate = async (data: ICreateClassData) => {
 *     await createClass.mutateAsync(data);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleCreate({...})}>Criar Turma</button>
 *       <ul>
 *         {listClasses.data?.map(cls => (
 *           <li key={cls.id}>Turma {cls.semester}/{cls.year}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useClasses(): IUseClassesReturn {
  const queryClient = useQueryClient();

  /**
   * Query para listar todas as turmas
   * Utiliza cache de 5 minutos (padrão definido em queryClient)
   */
  const listClasses = useQuery<IClass[], Error>({
    queryKey: ['classes'],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Executando query para listar turmas...');
      }
      return ClassService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes: cacheTime)
  });

  /**
   * Factory function para criar queries individuais de turmas por ID
   * Útil para evitar queries desnecessárias
   */
  const getClass = (id: number): UseQueryResult<IClass, Error> => {
    return useQuery<IClass, Error>({
      queryKey: ['classes', id],
      queryFn: async () => {
        if (import.meta.env.DEV) {
          console.log(
            `[useClasses] Executando query para buscar turma ${id}...`
          );
        }
        return ClassService.getById(id);
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: id > 0, // Apenas executa se ID é válido
    });
  };

  /**
   * Mutation para criar nova turma
   * Invalida a cache de listagem após sucesso para forçar refetch
   */
  const createClass = useMutation<IClass, Error, ICreateClassData>({
    mutationFn: async (data) => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Criando nova turma:', {
          courseId: data.courseId,
          semester: data.semester,
          year: data.year,
        });
      }
      return ClassService.create(data);
    },
    onSuccess: (newClass) => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Turma criada com sucesso:', newClass.id);
      }
      // Invalidar query de lista para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      // Adicionar nova turma ao cache individual
      queryClient.setQueryData(['classes', newClass.id], newClass);
    },
    onError: (error) => {
      console.error('[useClasses] Erro ao criar turma:', error.message);
    },
  });

  /**
   * Mutation para atualizar turma existente
   * Atualiza cache imediatamente
   *
   * Permite atualizar:
   * - Semestre e ano da turma
   * - Lista de professores e suas disciplinas
   * - Lista de alunos vinculados
   */
  const updateClass = useMutation<
    IClass,
    Error,
    { id: number; data: IUpdateClassData }
  >({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Atualizando turma:', id);
      }
      return ClassService.update(id, data);
    },
    onSuccess: (updatedClass, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Turma atualizada com sucesso:', id);
      }
      // Atualizar cache individual
      queryClient.setQueryData(['classes', id], updatedClass);
      // Invalidar lista para refetch (garante consistência)
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      console.error('[useClasses] Erro ao atualizar turma:', error.message);
    },
  });

  /**
   * Mutation para deletar turma
   * Remove do cache após sucesso
   *
   * Realiza soft delete (marca como deletada, não remove fisicamente)
   */
  const deleteClass = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Removendo turma:', id);
      }
      return ClassService.delete(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log('[useClasses] Turma removida com sucesso:', id);
      }
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: ['classes', id] });
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      console.error('[useClasses] Erro ao remover turma:', error.message);
    },
  });

  return {
    listClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
  };
}

export default useClasses;
