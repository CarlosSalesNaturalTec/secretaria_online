/**
 * Arquivo: frontend/src/hooks/useEvaluations.ts
 * Descrição: Custom hook para gerenciamento de avaliações com React Query
 * Feature: feat-evaluation-ui - Criar interface de gerenciamento de avaliações
 * Criado em: 2025-12-09
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import EvaluationService from '@/services/evaluation.service';
import type { IEvaluation, ICreateEvaluationData, IUpdateEvaluationData } from '@/types/evaluation.types';

export interface IUseEvaluationsReturn {
  listEvaluations: () => UseQueryResult<IEvaluation[], Error>;
  getEvaluation: (id: number) => UseQueryResult<IEvaluation, Error>;
  createEvaluation: UseMutationResult<IEvaluation, Error, ICreateEvaluationData>;
  updateEvaluation: UseMutationResult<IEvaluation, Error, { id: number; data: IUpdateEvaluationData }>;
  deleteEvaluation: UseMutationResult<void, Error, number>;
}

export function useEvaluations(): IUseEvaluationsReturn {
  const queryClient = useQueryClient();

  const listEvaluations = (): UseQueryResult<IEvaluation[], Error> => {
    return useQuery<IEvaluation[], Error>({
      queryKey: ['evaluations'],
      queryFn: async () => {
        if (import.meta.env.DEV) {
          console.log('[useEvaluations] Executando query para listar avaliações...');
        }
        return EvaluationService.getAll();
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  };

  const getEvaluation = (id: number): UseQueryResult<IEvaluation, Error> => {
    return useQuery<IEvaluation, Error>({
      queryKey: ['evaluations', id],
      queryFn: async () => {
        if (import.meta.env.DEV) {
          console.log(`[useEvaluations] Executando query para buscar avaliação ${id}...`);
        }
        return EvaluationService.getById(id);
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: id > 0,
    });
  };

  const createEvaluation = useMutation<IEvaluation, Error, ICreateEvaluationData>({
    mutationFn: async (data) => {
      if (import.meta.env.DEV) {
        console.log('[useEvaluations] Criando nova avaliação:', data.name);
      }
      return EvaluationService.create(data);
    },
    onSuccess: (newEvaluation) => {
      if (import.meta.env.DEV) {
        console.log('[useEvaluations] Avaliação criada com sucesso:', newEvaluation.id);
      }
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.setQueryData(['evaluations', newEvaluation.id], newEvaluation);
    },
    onError: (error) => {
      console.error('[useEvaluations] Erro ao criar avaliação:', error.message);
    },
  });

  const updateEvaluation = useMutation<IEvaluation, Error, { id: number; data: IUpdateEvaluationData }>({
    mutationFn: async ({ id, data }) => {
      if (import.meta.env.DEV) {
        console.log('[useEvaluations] Atualizando avaliação:', id);
      }
      return EvaluationService.update(id, data);
    },
    onSuccess: (updatedEvaluation, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[useEvaluations] Avaliação atualizada com sucesso:', id);
      }
      queryClient.setQueryData(['evaluations', id], updatedEvaluation);
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
    onError: (error) => {
      console.error('[useEvaluations] Erro ao atualizar avaliação:', error.message);
    },
  });

  const deleteEvaluation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (import.meta.env.DEV) {
        console.log('[useEvaluations] Removendo avaliação:', id);
      }
      return EvaluationService.delete(id);
    },
    onSuccess: (_, id) => {
      if (import.meta.env.DEV) {
        console.log('[useEvaluations] Avaliação removida com sucesso:', id);
      }
      queryClient.removeQueries({ queryKey: ['evaluations', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
    onError: (error) => {
      console.error('[useEvaluations] Erro ao remover avaliação:', error.message);
    },
  });

  return {
    listEvaluations,
    getEvaluation,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
  };
}

export default useEvaluations;
