/**
 * Arquivo: frontend/src/hooks/useStudents.ts
 * Descrição: Custom hook para gerenciamento de alunos com React Query
 * Feature: feat-104 - Criar custom hooks com React Query
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Gerenciar queries para listagem e busca de alunos
 * - Gerenciar mutations para CRUD de alunos
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
import StudentService from '@/services/student.service';
import type {
  ICreateStudentData,
  IUpdateStudentData,
} from '@/services/student.service';
import type { IUser } from '@/types/user.types';

/**
 * Interface para o retorno do hook useStudents
 */
export interface IUseStudentsReturn {
  /** Query para listar todos os alunos */
  listStudents: UseQueryResult<IUser[], Error>;
  /** Query para buscar aluno específico por ID */
  getStudent: (id: number) => UseQueryResult<IUser, Error>;
  /** Mutation para criar novo aluno */
  createStudent: UseMutationResult<IUser, Error, ICreateStudentData>;
  /** Mutation para atualizar aluno */
  updateStudent: UseMutationResult<
    IUser,
    Error,
    { id: number; data: IUpdateStudentData }
  >;
  /** Mutation para deletar aluno */
  deleteStudent: UseMutationResult<void, Error, number>;
  /** Mutation para regenerar senha do aluno */
  resetStudentPassword: UseMutationResult<void, Error, number>;
}

/**
 * Custom hook para gerenciamento completo de alunos com React Query
 *
 * Fornece queries e mutations para operações CRUD de alunos,
 * com sincronização automática de cache após operações.
 *
 * @returns {IUseStudentsReturn} Objeto com queries e mutations para alunos
 *
 * @example
 * import { useStudents } from '@/hooks/useStudents';
 *
 * export function StudentsPage() {
 *   const { listStudents, createStudent } = useStudents();
 *
 *   if (listStudents.isLoading) return <div>Carregando...</div>;
 *   if (listStudents.isError) return <div>Erro: {listStudents.error.message}</div>;
 *
 *   const handleCreate = async (data: ICreateStudentData) => {
 *     await createStudent.mutateAsync(data);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleCreate({...})}>Criar Aluno</button>
 *       <ul>
 *         {listStudents.data?.map(student => (
 *           <li key={student.id}>{student.name}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useStudents(): IUseStudentsReturn {
  const queryClient = useQueryClient();

  /**
   * Query para listar todos os alunos
   * Utiliza cache de 5 minutos (padrão definido em queryClient)
   */
  const listStudents = useQuery<IUser[], Error>({
    queryKey: ['students'],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Executando query para listar alunos...');
      }
      return StudentService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes: cacheTime)
  });

  /**
   * Factory function para criar queries individuais de alunos por ID
   * Útil para evitar queries desnecessárias
   */
  const getStudent = (id: number): UseQueryResult<IUser, Error> => {
    return useQuery<IUser, Error>({
      queryKey: ['students', id],
      queryFn: async () => {
        if (import.meta.env.DEV) {
          console.log(`[useStudents] Executando query para buscar aluno ${id}...`);
        }
        return StudentService.getById(id);
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: id > 0, // Apenas executa se ID é válido
    });
  };

  /**
   * Mutation para criar novo aluno
   * Invalida a cache de listagem após sucesso para forçar refetch
   */
  const createStudent = useMutation<IUser, Error, ICreateStudentData>({
    mutationFn: async (data) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Criando novo aluno:', data.name);
      }
      return StudentService.create(data);
    },
    onSuccess: (newStudent) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Aluno criado com sucesso:', newStudent.id);
      }
      // Invalidar query de lista para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['students'] });
      // Adicionar novo aluno ao cache individual
      queryClient.setQueryData(['students', newStudent.id], newStudent);
    },
    onError: (error) => {
      console.error('[useStudents] Erro ao criar aluno:', error.message);
    },
  });

  /**
   * Mutation para atualizar aluno existente
   * Atualiza cache imediatamente (optimistic update é feito no componente)
   */
  const updateStudent = useMutation<
    IUser,
    Error,
    { id: number; data: IUpdateStudentData }
  >({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Atualizando aluno:', id);
      }
      return StudentService.update(id, data);
    },
    onSuccess: (updatedStudent, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Aluno atualizado com sucesso:', id);
      }
      // Atualizar cache individual
      queryClient.setQueryData(['students', id], updatedStudent);
      // Invalidar lista para refetch (garante consistência)
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      console.error('[useStudents] Erro ao atualizar aluno:', error.message);
    },
  });

  /**
   * Mutation para deletar aluno
   * Remove do cache após sucesso
   */
  const deleteStudent = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Removendo aluno:', id);
      }
      return StudentService.delete(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Aluno removido com sucesso:', id);
      }
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: ['students', id] });
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      console.error('[useStudents] Erro ao remover aluno:', error.message);
    },
  });

  /**
   * Mutation para regenerar senha do aluno
   */
  const resetStudentPassword = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useStudents] Regenerando senha do aluno:', id);
      }
      return StudentService.resetPassword(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log(
          '[useStudents] Senha regenerada e enviada para aluno:',
          id
        );
      }
      // Não precisa invalidar cache pois senha não é exibida
    },
    onError: (error) => {
      console.error('[useStudents] Erro ao regenerar senha:', error.message);
    },
  });

  return {
    listStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    resetStudentPassword,
  };
}

export default useStudents;
