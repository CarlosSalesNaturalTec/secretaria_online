/**
 * Arquivo: frontend/src/hooks/useReenrollment.ts
 * Descrição: Custom hook para rematrícula global de estudantes com TanStack Query
 * Feature: feat-reenrollment-etapa-5 - Frontend Interface de Rematrícula Global
 * Criado em: 2025-12-15
 *
 * Responsabilidades:
 * - Gerenciar estado de rematrícula global com TanStack Query
 * - Processar rematrícula de TODOS os estudantes do sistema
 * - Invalidar cache de enrollments após rematrícula
 * - Fornecer feedback de sucesso/erro
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReenrollmentService from '@/services/reenrollment.service';
import type { IReenrollmentRequest } from '@/types/reenrollment.types';
import { useAuth } from './useAuth';

/**
 * Hook para processar rematrícula global de TODOS os estudantes
 *
 * IMPORTANTE:
 * - Processa TODOS os enrollments ativos do sistema (não por curso)
 * - Atualiza status de 'active' para 'pending'
 * - NÃO cria contratos (criados após aceite do estudante)
 * - Usa transação no backend (rollback automático em caso de erro)
 *
 * @returns Mutation para processar rematrícula
 *
 * @example
 * const { mutate: processReenrollment, isPending } = useProcessGlobalReenrollment();
 *
 * const handleReenroll = () => {
 *   processReenrollment(
 *     {
 *       semester: 1,
 *       year: 2025,
 *     },
 *     {
 *       onSuccess: (data) => {
 *         console.log(`${data.totalStudents} estudantes rematriculados`);
 *       },
 *       onError: (error) => {
 *         console.error('Erro:', error.message);
 *       }
 *     }
 *   );
 * };
 */
export function useProcessGlobalReenrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IReenrollmentRequest) => {
      if (import.meta.env.DEV) {
        console.log(
          '[useProcessGlobalReenrollment] Processando rematrícula...',
          {
            semester: data.semester,
            year: data.year,
          }
        );
      }
      return ReenrollmentService.processGlobalReenrollment(data);
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.log(
          '[useProcessGlobalReenrollment] Rematrícula processada com sucesso:',
          data
        );
      }

      // Invalidar cache de enrollments para recarregar dados atualizados
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });

      // Invalidar cache de alunos também (pode ter mudanças relacionadas)
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: Error) => {
      console.error(
        '[useProcessGlobalReenrollment] Erro ao processar rematrícula:',
        error
      );
    },
  });
}

/**
 * Hook para buscar preview de contrato HTML para rematrícula
 *
 * IMPORTANTE:
 * - Retorna HTML renderizado pronto para exibição (NÃO PDF)
 * - Apenas estudante dono do enrollment pode visualizar
 * - Apenas enrollments com status 'pending' podem ter preview
 *
 * @param enrollmentId - ID do enrollment (ou null para não buscar)
 * @param options - Opções adicionais do TanStack Query
 * @returns Query com HTML do contrato e dados relacionados
 *
 * @example
 * const { data: preview, isLoading, error } = useContractPreview(5);
 *
 * if (isLoading) return <div>Carregando contrato...</div>;
 * if (error) return <div>Erro: {error.message}</div>;
 * if (preview) return <div dangerouslySetInnerHTML={{ __html: preview.contractHTML }} />;
 */
export function useContractPreview(
  enrollmentId: number | null,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: ['contract-preview', enrollmentId],
    queryFn: () => {
      if (!enrollmentId) {
        throw new Error('ID do enrollment não fornecido');
      }

      if (import.meta.env.DEV) {
        console.log(
          `[useContractPreview] Buscando preview - Enrollment ID: ${enrollmentId}`
        );
      }

      return ReenrollmentService.getContractPreview(enrollmentId);
    },
    enabled: !!enrollmentId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutos (preview não muda com frequência)
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: 2, // Tentar 2 vezes em caso de erro
  });
}

/**
 * Hook para aceitar rematrícula do estudante
 *
 * IMPORTANTE:
 * - Atualiza enrollment.status de 'pending' para 'active'
 * - CRIA novo contrato com PDF gerado automaticamente
 * - Invalida cache de contratos para exibir novo contrato imediatamente
 * - Usa transação no backend para garantir atomicidade
 * - Apenas estudante dono do enrollment pode aceitar
 *
 * @returns Mutation para aceitar rematrícula
 *
 * @example
 * const { mutate: acceptReenrollment, isPending } = useAcceptReenrollment();
 *
 * const handleAccept = () => {
 *   acceptReenrollment(
 *     5, // enrollmentId
 *     {
 *       onSuccess: (data) => {
 *         console.log('Matrícula aceita:', data.enrollment.status); // 'active'
 *         // Redirecionar para dashboard
 *         navigate('/student/dashboard');
 *       },
 *       onError: (error) => {
 *         console.error('Erro:', error.message);
 *       }
 *     }
 *   );
 * };
 */
export function useAcceptReenrollment() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  return useMutation({
    mutationFn: (enrollmentId: number) => {
      if (import.meta.env.DEV) {
        console.log(
          `[useAcceptReenrollment] Aceitando rematrícula - Enrollment ID: ${enrollmentId}`
        );
      }
      return ReenrollmentService.acceptReenrollment(enrollmentId);
    },
    onSuccess: (data, enrollmentId) => {
      if (import.meta.env.DEV) {
        console.log(
          '[useAcceptReenrollment] Rematrícula aceita com sucesso:',
          data
        );
      }

      // 1. Atualizar o AuthContext PRIMEIRO para evitar race conditions
      if (user) {
        updateUser({
          ...user,
          enrollmentStatus: 'active',
        });
      }

      // 2. Remover queries que não são mais necessárias ou que causarão erro
      queryClient.removeQueries({ queryKey: ['contract-preview', enrollmentId] });
      queryClient.removeQueries({ queryKey: ['enrollments', 'my-pending'] });

      // 3. Invalidar outros caches para garantir consistência
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] }); // Novo contrato foi criado
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: Error, enrollmentId) => {
      console.error(
        `[useAcceptReenrollment] Erro ao aceitar rematrícula (Enrollment ID: ${enrollmentId}):`,
        error
      );
    },
  });
}
