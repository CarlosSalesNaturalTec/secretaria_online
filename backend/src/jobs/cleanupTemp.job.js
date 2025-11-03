/**
 * Arquivo: backend/src/jobs/cleanupTemp.job.js
 * Descrição: Job de limpeza de arquivos temporários
 * Feature: feat-063 - Criar job de limpeza de arquivos temporários
 * Criado em: 2025-11-03
 *
 * Responsabilidades:
 * - Remover arquivos temporários mais antigos que 7 dias
 * - Liberar espaço em disco
 * - Manter o diretório temp organizado
 * - Registrar logs de operações de limpeza
 *
 * @example
 * // No jobs/index.js
 * const cleanupTempJob = require('./cleanupTemp.job');
 * registerJob(
 *   cleanupTempJob.name,
 *   cleanupTempJob.schedule,
 *   cleanupTempJob.execute,
 *   { timezone: 'America/Sao_Paulo' }
 * );
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Diretório de arquivos temporários
 * Relativo à raiz do backend
 */
const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

/**
 * Tempo de retenção em milissegundos (7 dias)
 * 7 dias * 24 horas * 60 minutos * 60 segundos * 1000 milissegundos
 */
const RETENTION_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Verifica se um arquivo deve ser removido baseado na data de criação
 *
 * @param {string} filePath - Caminho completo do arquivo
 * @returns {Promise<boolean>} True se o arquivo deve ser removido, false caso contrário
 */
async function shouldRemoveFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const fileAgeMs = Date.now() - stats.mtime.getTime();
    return fileAgeMs > RETENTION_PERIOD_MS;
  } catch (error) {
    logger.error(`[CLEANUP_TEMP] Erro ao verificar arquivo ${filePath}:`, {
      error: error.message,
    });
    return false;
  }
}

/**
 * Remove um arquivo e registra a operação
 *
 * @param {string} filePath - Caminho completo do arquivo
 * @param {string} fileName - Nome do arquivo (para logging)
 * @returns {Promise<boolean>} True se o arquivo foi removido com sucesso, false caso contrário
 */
async function removeFile(filePath, fileName) {
  try {
    await fs.unlink(filePath);
    logger.info(`[CLEANUP_TEMP] Arquivo removido: ${fileName}`);
    return true;
  } catch (error) {
    logger.error(`[CLEANUP_TEMP] Erro ao remover arquivo ${fileName}:`, {
      error: error.message,
      filePath,
    });
    return false;
  }
}

/**
 * Formata tamanho de arquivo em formato legível
 *
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado (ex: "1.5 MB")
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calcula a idade de um arquivo em dias
 *
 * @param {number} mtimeMs - Timestamp de modificação do arquivo
 * @returns {number} Idade do arquivo em dias
 */
function calculateFileAge(mtimeMs) {
  const ageMs = Date.now() - mtimeMs;
  return Math.floor(ageMs / (24 * 60 * 60 * 1000));
}

/**
 * Executa a limpeza de arquivos temporários
 *
 * Este job verifica todos os arquivos no diretório uploads/temp/
 * e remove aqueles que foram criados há mais de 7 dias.
 *
 * @throws {Error} Se ocorrer erro crítico durante a execução
 */
async function execute() {
  const startTime = Date.now();
  let totalFiles = 0;
  let removedFiles = 0;
  let failedRemovals = 0;
  let totalSpaceFreed = 0;

  try {
    logger.info('[CLEANUP_TEMP] Iniciando limpeza de arquivos temporários...');
    logger.info(`[CLEANUP_TEMP] Diretório: ${TEMP_DIR}`);
    logger.info(`[CLEANUP_TEMP] Período de retenção: 7 dias`);

    // Verificar se o diretório existe
    try {
      await fs.access(TEMP_DIR);
    } catch (error) {
      logger.warn(`[CLEANUP_TEMP] Diretório temporário não existe: ${TEMP_DIR}`);
      logger.info('[CLEANUP_TEMP] Criando diretório temporário...');
      await fs.mkdir(TEMP_DIR, { recursive: true });
      logger.info('[CLEANUP_TEMP] Diretório criado. Nenhum arquivo para limpar.');
      return;
    }

    // Listar todos os arquivos no diretório
    const files = await fs.readdir(TEMP_DIR);
    totalFiles = files.length;

    logger.info(`[CLEANUP_TEMP] ${totalFiles} arquivo(s) encontrado(s) no diretório temporário`);

    // Verificar se há arquivos para processar
    if (totalFiles === 0) {
      logger.info('[CLEANUP_TEMP] Nenhum arquivo para limpar.');
      return;
    }

    // Processar cada arquivo
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);

      try {
        // Verificar se é um arquivo (não diretório)
        const stats = await fs.stat(filePath);

        if (!stats.isFile()) {
          logger.debug(`[CLEANUP_TEMP] Ignorando diretório: ${file}`);
          continue;
        }

        // Calcular idade do arquivo
        const fileAge = calculateFileAge(stats.mtime.getTime());
        const fileSize = stats.size;

        // Verificar se deve ser removido
        if (await shouldRemoveFile(filePath)) {
          logger.info(`[CLEANUP_TEMP] Arquivo candidato à remoção: ${file} (${fileAge} dias, ${formatFileSize(fileSize)})`);

          const removed = await removeFile(filePath, file);

          if (removed) {
            removedFiles++;
            totalSpaceFreed += fileSize;
          } else {
            failedRemovals++;
          }
        } else {
          logger.debug(`[CLEANUP_TEMP] Arquivo mantido: ${file} (${fileAge} dias)`);
        }
      } catch (error) {
        logger.error(`[CLEANUP_TEMP] Erro ao processar arquivo ${file}:`, {
          error: error.message,
          stack: error.stack,
        });
        failedRemovals++;
      }
    }

    // Calcular duração da execução
    const duration = Date.now() - startTime;

    // Log de resumo da execução
    logger.info('[CLEANUP_TEMP] ========================================');
    logger.info('[CLEANUP_TEMP] RESUMO DA LIMPEZA');
    logger.info('[CLEANUP_TEMP] ========================================');
    logger.info(`[CLEANUP_TEMP] Arquivos processados: ${totalFiles}`);
    logger.info(`[CLEANUP_TEMP] Arquivos removidos: ${removedFiles}`);
    logger.info(`[CLEANUP_TEMP] Falhas na remoção: ${failedRemovals}`);
    logger.info(`[CLEANUP_TEMP] Espaço liberado: ${formatFileSize(totalSpaceFreed)}`);
    logger.info(`[CLEANUP_TEMP] Tempo de execução: ${duration}ms`);
    logger.info('[CLEANUP_TEMP] ========================================');

    if (removedFiles > 0) {
      logger.info(`[CLEANUP_TEMP] Limpeza concluída com sucesso! ${removedFiles} arquivo(s) removido(s).`);
    } else {
      logger.info('[CLEANUP_TEMP] Limpeza concluída. Nenhum arquivo antigo encontrado.');
    }

    if (failedRemovals > 0) {
      logger.warn(`[CLEANUP_TEMP] ${failedRemovals} arquivo(s) não puderam ser removidos. Verifique os logs para detalhes.`);
    }
  } catch (error) {
    logger.error('[CLEANUP_TEMP] Erro crítico durante execução do job:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Executa limpeza imediata (útil para testes ou execução manual)
 *
 * @returns {Promise<void>}
 */
async function runNow() {
  logger.info('[CLEANUP_TEMP] Executando limpeza manual (fora do schedule)...');
  await execute();
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  execute,
  runNow,
  name: 'cleanup-temp',
  description: 'Remove arquivos temporários mais antigos que 7 dias do diretório uploads/temp/',
  // Executar diariamente às 2h da manhã (horário de baixo uso do sistema)
  schedule: '0 2 * * *',
};
