/**
 * Arquivo: backend/src/utils/logger.js
 * Descrição: Configuração do sistema de logging com Winston
 * Feature: feat-026 - Configurar Winston para logging
 * Criado em: 2025-10-28
 */

const winston = require('winston');
const path = require('path');

/**
 * Determina o nível de log baseado no ambiente
 *
 * @returns {string} Nível de log (debug em desenvolvimento, info em produção)
 */
const getLogLevel = () => {
  return process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
};

/**
 * Formatos customizados para diferentes ambientes
 */
const formats = {
  // Formato para produção: JSON estruturado
  production: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  // Formato para desenvolvimento: mais legível no console
  development: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
      }
      return msg;
    })
  )
};

/**
 * Determina o formato baseado no ambiente
 */
const getFormat = () => {
  return process.env.NODE_ENV === 'production' ? formats.production : formats.development;
};

/**
 * Configuração de transports (destinos dos logs)
 */
const transports = [];

// Transport para console (sempre ativo)
transports.push(
  new winston.transports.Console({
    level: getLogLevel(),
    format: getFormat()
  })
);

// Transports para arquivos (apenas em produção ou se LOG_TO_FILE estiver ativo)
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  const logsDir = path.join(__dirname, '../../logs');

  // Arquivo combinado: todos os logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: getLogLevel(),
      format: formats.production,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Arquivo de erros: apenas logs de nível error
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: formats.production,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  );
}

/**
 * Instância do logger configurado
 *
 * Níveis disponíveis (do mais grave ao menos grave):
 * - error: Erros críticos que impedem funcionamento
 * - warn: Avisos de situações anormais
 * - info: Informações gerais sobre operações
 * - http: Logs de requisições HTTP (se habilitado)
 * - verbose: Informações detalhadas
 * - debug: Informações de debug para desenvolvimento
 *
 * @example
 * logger.info('Usuário criado com sucesso', { userId: 123, role: 'student' });
 * logger.error('Erro ao processar matrícula', { error: err.message, enrollmentId: 456 });
 * logger.warn('Documento rejeitado', { documentId: 789, reason: 'ilegível' });
 * logger.debug('Processando validação de CPF', { cpf: '123.456.789-00' });
 */
const logger = winston.createLogger({
  level: getLogLevel(),
  format: getFormat(),
  transports,
  exitOnError: false,
  // Silent em modo de teste
  silent: process.env.NODE_ENV === 'test'
});

/**
 * Stream para integração com Morgan (logging de requisições HTTP)
 *
 * @example
 * // Em server.js:
 * const morgan = require('morgan');
 * app.use(morgan('combined', { stream: logger.stream }));
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

/**
 * Função helper para logar operações de usuário
 *
 * @param {string} action - Ação realizada (ex: 'login', 'document_upload')
 * @param {Object} data - Dados adicionais
 * @example
 * logger.logUserAction('login', { userId: 123, role: 'admin', ip: '192.168.1.1' });
 */
logger.logUserAction = (action, data = {}) => {
  logger.info(`User action: ${action}`, {
    action,
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Função helper para logar erros com contexto
 *
 * @param {string} context - Contexto do erro (ex: 'AuthController', 'EnrollmentService')
 * @param {Error} error - Objeto de erro
 * @param {Object} additionalData - Dados adicionais
 * @example
 * logger.logError('AuthController.login', error, { userId: 123 });
 */
logger.logError = (context, error, additionalData = {}) => {
  logger.error(`[${context}] ${error.message}`, {
    context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    ...additionalData
  });
};

module.exports = logger;
