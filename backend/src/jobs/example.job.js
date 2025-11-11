/**
 * Arquivo: backend/src/jobs/example.job.js
 * Descrição: Exemplo de job para demonstração do sistema de cron jobs
 * Feature: feat-062 - Configurar node-cron
 * Criado em: 2025-11-03
 *
 * NOTA: Este é um arquivo de exemplo para demonstração.
 * Pode ser removido ou desabilitado em produção.
 *
 * Responsabilidades:
 * - Demonstrar estrutura básica de um job
 * - Servir como template para novos jobs
 */

const logger = require('../utils/logger');

/**
 * Executa a tarefa de exemplo
 * Este job apenas loga uma mensagem para demonstrar o funcionamento do sistema
 */
async function execute() {
  try {
    logger.info('[EXAMPLE_JOB] Iniciando execução do job de exemplo...');

    // Simular algum processamento
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info('[EXAMPLE_JOB] Job de exemplo executado com sucesso!');
  } catch (error) {
    logger.error('[EXAMPLE_JOB] Erro durante execução do job de exemplo:', error);
    throw error;
  }
}

module.exports = {
  execute,
  name: 'example-job',
  description: 'Job de exemplo para demonstração do sistema de cron',
  // A cada 5 minutos (apenas para demonstração - ajustar conforme necessário)
  schedule: '*/5 * * * *',
};
