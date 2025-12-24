/**
 * Arquivo: frontend/src/hooks/useContracts.ts
 * Descrição: Custom hook para gerenciamento de contratos com TanStack Query
 * Criado em: 2025-12-24
 *
 * Responsabilidades:
 * - Gerenciar estado de contratos com TanStack Query
 * - Fazer caching de dados de contratos
 * - Invalidar cache ao aceitar contratos
 * - Fornecer hooks para listagem e aceite de contratos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ContractService from '@/services/contract.service';
import type { IContractFilters, IAcceptContractRequest } from '@/types/contract.types';

/**
 * Query keys para contratos
 */
const QUERY_KEYS = {
  all: ['contracts'] as const,
  list: (filters?: IContractFilters) => [...QUERY_KEYS.all, 'list', filters] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

/**
 * Hook para buscar todos os contratos do usuário autenticado
 *
 * @param filters - Filtros de busca opcionais
 * @returns Query result com dados de contratos
 *
 * @example
 * const { data: contracts, isLoading } = useContracts();
 */
export function useContracts(filters?: IContractFilters) {
  if (import.meta.env.DEV) {
    console.log('[useContracts] Hook chamado com filtros:', filters);
  }

  const query = useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[useContracts] Executando queryFn...');
      }
      const response = await ContractService.getAll(filters);
      if (import.meta.env.DEV) {
        console.log('[useContracts] Dados retornados do service:', response);
      }
      return response.data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  if (import.meta.env.DEV) {
    console.log('[useContracts] Query state:', {
      status: query.status,
      isLoading: query.isLoading,
      data: query.data,
      error: query.error,
    });
  }

  return query;
}

/**
 * Hook para buscar um contrato específico
 *
 * @param id - ID do contrato
 * @param enabled - Se a query deve rodar automaticamente
 * @returns Query result com dados do contrato
 *
 * @example
 * const { data: contract } = useContractById(1);
 */
export function useContractById(id: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => ContractService.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para aceitar um contrato
 *
 * @returns Mutation para aceitar contrato
 *
 * @example
 * const { mutate: acceptContract, isPending } = useAcceptContract();
 *
 * acceptContract({
 *   id: 1
 * }, {
 *   onSuccess: () => console.log('Contrato aceito!')
 * });
 */
export function useAcceptContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data?: IAcceptContractRequest;
    }) => ContractService.accept(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar dados específicos do contrato e lista
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all,
      });
    },
    onError: (error: any) => {
      // Log detalhado do erro para debugging
      if (import.meta.env.DEV) {
        console.error('[useAcceptContract] Erro capturado:', {
          message: error?.message,
          error,
        });
      }
    },
  });
}

/**
 * Hook para fazer download do PDF de um contrato
 *
 * @returns Mutation para download de PDF
 *
 * @example
 * const { mutate: downloadPdf, isPending } = useDownloadContractPdf();
 *
 * downloadPdf({
 *   id: 1,
 *   fileName: 'contrato.pdf'
 * });
 */
export function useDownloadContractPdf() {
  return useMutation({
    mutationFn: async ({
      id,
      fileName,
    }: {
      id: number;
      fileName: string;
    }) => ContractService.downloadPdf(id, fileName),
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('[useDownloadContractPdf] Erro capturado:', {
          message: error?.message,
          error,
        });
      }
    },
  });
}
