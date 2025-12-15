/**
 * Arquivo: frontend/src/services/reenrollment.service.ts
 * Descrição: Serviço para rematrícula global de estudantes
 * Feature: feat-reenrollment-etapa-5 - Frontend Interface de Rematrícula Global
 * Criado em: 2025-12-15
 *
 * Responsabilidades:
 * - Comunicação com API de rematrícula global
 * - Processar rematrícula de TODOS os estudantes do sistema
 * - Validação e tratamento de erros
 * - Transformação de dados da API para tipos TypeScript
 */

import api from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  IReenrollmentRequest,
  IReenrollmentResponse,
} from '@/types/reenrollment.types';

/**
 * Processa rematrícula global de TODOS os estudantes do sistema
 *
 * IMPORTANTE:
 * - Processa TODOS os enrollments ativos (status='active') do sistema
 * - NÃO processa por curso individual - é uma operação global
 * - Atualiza status de TODOS para 'pending'
 * - NÃO cria contratos (criados após aceite do estudante)
 * - Requer senha do administrador para confirmação
 *
 * @param data - Dados da rematrícula (semester, year, adminPassword)
 * @returns Resultado da rematrícula (totalStudents, affectedEnrollmentIds)
 * @throws Error quando senha incorreta, validação falha ou erro na API
 *
 * @example
 * const result = await reenrollmentService.processGlobalReenrollment({
 *   semester: 1,
 *   year: 2025,
 *   adminPassword: 'senha_admin'
 * });
 *
 * console.log(`Total de estudantes rematriculados: ${result.totalStudents}`);
 */
async function processGlobalReenrollment(
  data: IReenrollmentRequest
): Promise<IReenrollmentResponse> {
  try {
    if (import.meta.env.DEV) {
      console.log(
        '[ReenrollmentService] Processando rematrícula global...',
        {
          semester: data.semester,
          year: data.year,
        }
      );
    }

    // Validações básicas
    if (!data.semester || !data.year || !data.adminPassword) {
      throw new Error('Dados incompletos para processar rematrícula');
    }

    if (data.semester < 1 || data.semester > 2) {
      throw new Error('Semestre deve ser 1 ou 2');
    }

    if (data.year < 2020 || data.year > 2100) {
      throw new Error('Ano inválido');
    }

    if (data.adminPassword.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const response = await api.post<
      ApiResponse<IReenrollmentResponse>
    >('/reenrollments/process-all', data);

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.error?.message ||
          'Erro ao processar rematrícula global'
      );
    }

    if (import.meta.env.DEV) {
      console.log(
        '[ReenrollmentService] Rematrícula processada com sucesso:',
        response.data.data
      );
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '[ReenrollmentService] Erro ao processar rematrícula:',
      error
    );

    // Se for erro Axios com resposta da API, extrair mensagem
    if (error.response?.data) {
      const responseData = error.response.data;
      if (import.meta.env.DEV) {
        console.error(
          '[ReenrollmentService] Resposta da API:',
          responseData
        );
      }

      // Status 401 = Senha incorreta
      if (error.response.status === 401) {
        throw new Error('Senha incorreta');
      }

      // Tentar extrair mensagem de erro da resposta
      const errorMessage =
        responseData.error?.message ||
        responseData.message ||
        responseData.error ||
        'Erro ao processar rematrícula global';

      throw new Error(errorMessage);
    }

    // Se for erro da API com mensagem clara (não Axios), repassar
    if (error instanceof Error && error.message) {
      throw error;
    }

    throw new Error('Falha ao processar rematrícula. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { processGlobalReenrollment } from '@/services/reenrollment.service';
 *
 * // Importação do objeto completo
 * import ReenrollmentService from '@/services/reenrollment.service';
 */
const ReenrollmentService = {
  processGlobalReenrollment,
};

export default ReenrollmentService;
