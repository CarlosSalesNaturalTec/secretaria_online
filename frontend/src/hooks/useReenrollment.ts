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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReenrollmentService from '@/services/reenrollment.service';
import type { IReenrollmentRequest } from '@/types/reenrollment.types';

/**
 * Hook para processar rematrícula global de TODOS os estudantes
 *
 * IMPORTANTE:
 * - Processa TODOS os enrollments ativos do sistema (não por curso)
 * - Atualiza status de 'active' para 'pending'
 * - Requer senha do administrador
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
 *       adminPassword: 'senha_admin'
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
