/**
 * Arquivo: src/config/queryClient.ts
 * Descrição: Configuração centralizada do TanStack Query (React Query)
 * Feature: feat-103 - Configurar TanStack Query
 * Criado em: 2025-11-04
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Instância global do QueryClient com opções padrão otimizadas
 *
 * Responsabilidades:
 * - Centralizar configuração do TanStack Query
 * - Definir tempos de cache e staleness padrão
 * - Configurar retry policies e gcTime
 *
 * @example
 * // Uso em App.tsx:
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { queryClient } from '@/config/queryClient';
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * staleTime: Tempo (em ms) para considerar dados como "fresh"
       * Após este período, dados são marcados como "stale" mas mantidos em cache
       * Padrão: 5 minutos (300000ms)
       * - Reduz chamadas desnecessárias à API
       * - Dados são revalidados em background quando stale
       */
      staleTime: 5 * 60 * 1000, // 5 minutos

      /**
       * gcTime (garbage collection time): Tempo para manter dados inativos em cache
       * Após este período, dados são removidos da memória
       * Padrão: 10 minutos (600000ms)
       * - Economiza memória
       * - Mais tempo = mais espaço em memória, menos API calls
       */
      gcTime: 10 * 60 * 1000, // 10 minutos

      /**
       * retry: Número de tentativas automáticas em caso de erro
       * false = sem retry automático
       * true = retry com estratégia padrão (exponential backoff)
       * number = número específico de tentativas
       * function = lógica customizada de retry
       *
       * Padrão: true (usa estratégia padrão: 0, 1, 4 segundos de espera)
       */
      retry: (failureCount, error: any) => {
        // Não fazer retry para erros 4xx (exceto 408 e 429)
        if (error?.status >= 400 && error?.status < 500) {
          if (error?.status === 408 || error?.status === 429) {
            return failureCount < 3;
          }
          return false;
        }

        // Para erros 5xx ou de rede, fazer até 3 tentativas
        return failureCount < 3;
      },

      /**
       * refetchOnWindowFocus: Revalidar dados quando a janela recupera foco
       * true = refetch automático (padrão)
       * false = sem refetch automático
       *
       * Útil para manter dados sempre atualizados, mas pode ser desabilitado
       * em aplicações que não precisam de dados em tempo real
       */
      refetchOnWindowFocus: true,

      /**
       * refetchOnMount: Revalidar dados quando componente é montado
       * 'stale' = refetch apenas se dados estiverem stale (valor padrão)
       * true = sempre refetch
       * false = sem refetch automático
       */
      refetchOnMount: true,

      /**
       * refetchOnReconnect: Revalidar dados quando reconecta à internet
       * true = refetch automático após reconexão
       * false = sem refetch automático
       */
      refetchOnReconnect: true,
    },

    mutations: {
      /**
       * retry: Configuração de retry para mutations (POST, PUT, DELETE)
       * Padrão: 0 (sem retry automático)
       *
       * Mutations são mais críticas que queries, então geralmente não fazemos retry automático
       * Deixamos a decisão para o componente que chamou a mutation
       */
      retry: 0,
    },
  },
});
