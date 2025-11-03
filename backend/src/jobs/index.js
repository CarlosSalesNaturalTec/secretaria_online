/**
 * Arquivo: backend/src/jobs/index.js
 * Descrição: Gerenciador central de tarefas agendadas (cron jobs)
 * Feature: feat-062 - Configurar node-cron
 * Criado em: 2025-11-03
 *
 * Responsabilidades:
 * - Registrar todas as tarefas agendadas da aplicação
 * - Inicializar jobs no startup da aplicação
 * - Fornecer controle centralizado de cron jobs
 * - Gerenciar logs de execução de jobs
 *
 * @example
 * // No server.js
 * const jobs = require('./jobs');
 * jobs.start();
 */

const cron = require('node-cron');
const logger = require('../utils/logger');

/**
 * Lista de jobs registrados no sistema
 * Cada job deve seguir o formato:
 * {
 *   name: string,           // Nome identificador do job
 *   schedule: string,       // Expressão cron (ex: '0 2 * * *')
 *   task: function,         // Função a ser executada
 *   options: object         // Opções do node-cron (timezone, etc)
 * }
 */
const registeredJobs = [];

/**
 * Registra um novo cron job no sistema
 *
 * @param {string} name - Nome identificador do job
 * @param {string} schedule - Expressão cron (formato: minuto hora dia mês dia-da-semana)
 * @param {Function} task - Função assíncrona ou síncrona a ser executada
 * @param {Object} options - Opções adicionais para o cron job
 * @param {string} options.timezone - Timezone para execução (ex: 'America/Sao_Paulo')
 * @param {boolean} options.scheduled - Se o job deve iniciar automaticamente (default: true)
 * @returns {Object} Objeto do cron job criado
 *
 * @example
 * registerJob(
 *   'cleanup-temp',
 *   '0 2 * * *', // Todo dia às 2h da manhã
 *   async () => { await cleanupTempFiles(); },
 *   { timezone: 'America/Sao_Paulo' }
 * );
 */
function registerJob(name, schedule, task, options = {}) {
  try {
    // Validar expressão cron
    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }

    // Validar se já existe job com mesmo nome
    const existingJob = registeredJobs.find(job => job.name === name);
    if (existingJob) {
      logger.warn(`[JOBS] Job '${name}' já está registrado. Substituindo...`);
      existingJob.cronJob.stop();
      const index = registeredJobs.indexOf(existingJob);
      registeredJobs.splice(index, 1);
    }

    // Wrapper para adicionar logging e tratamento de erros
    const wrappedTask = async () => {
      const startTime = Date.now();
      logger.info(`[JOBS] Iniciando job '${name}'...`);

      try {
        await task();
        const duration = Date.now() - startTime;
        logger.info(`[JOBS] Job '${name}' concluído com sucesso em ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`[JOBS] Erro ao executar job '${name}' após ${duration}ms:`, {
          error: error.message,
          stack: error.stack,
        });
      }
    };

    // Criar job com node-cron
    const cronJob = cron.schedule(schedule, wrappedTask, {
      scheduled: options.scheduled !== false,
      timezone: options.timezone || 'America/Sao_Paulo',
    });

    // Registrar job
    const jobInfo = {
      name,
      schedule,
      task,
      options,
      cronJob,
      registeredAt: new Date(),
    };

    registeredJobs.push(jobInfo);

    logger.info(`[JOBS] Job '${name}' registrado com sucesso (schedule: ${schedule})`);

    return cronJob;
  } catch (error) {
    logger.error(`[JOBS] Erro ao registrar job '${name}':`, error);
    throw error;
  }
}

/**
 * Inicia todos os jobs registrados
 *
 * @example
 * jobs.start();
 */
function start() {
  try {
    logger.info('[JOBS] Iniciando sistema de cron jobs...');

    if (registeredJobs.length === 0) {
      logger.warn('[JOBS] Nenhum job registrado para iniciar.');
      return;
    }

    registeredJobs.forEach(job => {
      if (job.options.scheduled === false) {
        job.cronJob.start();
        logger.info(`[JOBS] Job '${job.name}' iniciado manualmente.`);
      }
    });

    logger.info(`[JOBS] Sistema de cron jobs iniciado com ${registeredJobs.length} job(s) ativo(s).`);
    logRegisteredJobs();
  } catch (error) {
    logger.error('[JOBS] Erro ao iniciar sistema de cron jobs:', error);
    throw error;
  }
}

/**
 * Para todos os jobs em execução
 *
 * @example
 * jobs.stop();
 */
function stop() {
  try {
    logger.info('[JOBS] Parando todos os cron jobs...');

    registeredJobs.forEach(job => {
      job.cronJob.stop();
      logger.info(`[JOBS] Job '${job.name}' parado.`);
    });

    logger.info('[JOBS] Todos os cron jobs foram parados.');
  } catch (error) {
    logger.error('[JOBS] Erro ao parar cron jobs:', error);
    throw error;
  }
}

/**
 * Para um job específico
 *
 * @param {string} name - Nome do job a ser parado
 * @returns {boolean} True se o job foi encontrado e parado, false caso contrário
 */
function stopJob(name) {
  try {
    const job = registeredJobs.find(j => j.name === name);

    if (!job) {
      logger.warn(`[JOBS] Job '${name}' não encontrado.`);
      return false;
    }

    job.cronJob.stop();
    logger.info(`[JOBS] Job '${name}' parado.`);
    return true;
  } catch (error) {
    logger.error(`[JOBS] Erro ao parar job '${name}':`, error);
    return false;
  }
}

/**
 * Reinicia um job específico
 *
 * @param {string} name - Nome do job a ser reiniciado
 * @returns {boolean} True se o job foi encontrado e reiniciado, false caso contrário
 */
function restartJob(name) {
  try {
    const job = registeredJobs.find(j => j.name === name);

    if (!job) {
      logger.warn(`[JOBS] Job '${name}' não encontrado.`);
      return false;
    }

    job.cronJob.stop();
    job.cronJob.start();
    logger.info(`[JOBS] Job '${name}' reiniciado.`);
    return true;
  } catch (error) {
    logger.error(`[JOBS] Erro ao reiniciar job '${name}':`, error);
    return false;
  }
}

/**
 * Lista todos os jobs registrados
 *
 * @returns {Array} Lista de informações dos jobs registrados
 */
function listJobs() {
  return registeredJobs.map(job => ({
    name: job.name,
    schedule: job.schedule,
    registeredAt: job.registeredAt,
    isRunning: job.options.scheduled !== false,
  }));
}

/**
 * Loga informações sobre todos os jobs registrados
 */
function logRegisteredJobs() {
  logger.info('[JOBS] Jobs registrados:');
  registeredJobs.forEach(job => {
    logger.info(`  - ${job.name}: ${job.schedule} (registrado em ${job.registeredAt.toISOString()})`);
  });
}

/**
 * Executa um job específico manualmente (fora do schedule)
 *
 * @param {string} name - Nome do job a ser executado
 * @returns {Promise<boolean>} True se o job foi executado com sucesso, false caso contrário
 */
async function runJob(name) {
  try {
    const job = registeredJobs.find(j => j.name === name);

    if (!job) {
      logger.warn(`[JOBS] Job '${name}' não encontrado.`);
      return false;
    }

    logger.info(`[JOBS] Executando job '${name}' manualmente...`);
    await job.task();
    logger.info(`[JOBS] Job '${name}' executado manualmente com sucesso.`);
    return true;
  } catch (error) {
    logger.error(`[JOBS] Erro ao executar job '${name}' manualmente:`, error);
    return false;
  }
}

// ====================================================================
// REGISTRO DE JOBS
// ====================================================================

/**
 * Aqui devem ser importados e registrados todos os jobs da aplicação
 *
 * Para registrar um novo job, siga o padrão:
 * 1. Importe o módulo do job
 * 2. Chame registerJob() com os parâmetros apropriados
 *
 * @example
 * const cleanupTempJob = require('./cleanupTemp.job');
 * registerJob(
 *   cleanupTempJob.name,
 *   cleanupTempJob.schedule,
 *   cleanupTempJob.execute,
 *   { timezone: 'America/Sao_Paulo' }
 * );
 */

// EXEMPLO: Job de demonstração (pode ser removido em produção)
// Descomente as linhas abaixo para ativar o job de exemplo:
/*
const exampleJob = require('./example.job');
registerJob(
  exampleJob.name,
  exampleJob.schedule,
  exampleJob.execute,
  { timezone: 'America/Sao_Paulo' }
);
*/

// ====================================================================
// IMPORTAÇÃO DE JOBS
// ====================================================================

// feat-063: Limpeza de arquivos temporários
const cleanupTempJob = require('./cleanupTemp.job');

// ====================================================================
// REGISTRO DE JOBS
// ====================================================================

// Job de limpeza de arquivos temporários (diariamente às 2h)
registerJob(
  cleanupTempJob.name,
  cleanupTempJob.schedule,
  cleanupTempJob.execute,
  { timezone: 'America/Sao_Paulo' }
);

// TODO: Registrar novos jobs conforme forem implementados
// Exemplos de jobs futuros:
//
// contractRenewal.job.js: Renovação automática de contratos
// const contractRenewalJob = require('./contractRenewal.job');
// registerJob(
//   contractRenewalJob.name,
//   contractRenewalJob.schedule,
//   contractRenewalJob.execute,
//   { timezone: 'America/Sao_Paulo' }
// );

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  registerJob,
  start,
  stop,
  stopJob,
  restartJob,
  listJobs,
  runJob,
  logRegisteredJobs,
};
