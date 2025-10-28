/**
 * Arquivo: src/middlewares/error.middleware.js
 * Descrição: Middleware centralizado de tratamento de erros com classe AppError customizada
 * Feature: feat-027 - Criar middleware de tratamento de erros
 * Criado em: 2025-10-28
 *
 * Responsabilidades:
 * - Definir classe AppError para erros operacionais da aplicação
 * - Implementar errorHandler que processa todos os erros
 * - Integrar logs estruturados com Winston
 * - Retornar respostas JSON padronizadas ao cliente
 * - Diferenciar erros operacionais (esperados) de erros de sistema (bugs)
 */

const logger = require('../utils/logger');

/**
 * Classe de erro customizada para erros operacionais da aplicação
 *
 * Erros operacionais são erros esperados que fazem parte do fluxo normal
 * da aplicação (ex: validação falhou, usuário não encontrado, CPF duplicado).
 *
 * @class AppError
 * @extends Error
 *
 * @example
 * // Erro de validação
 * throw new AppError('CPF inválido', 400, 'VALIDATION_ERROR');
 *
 * @example
 * // Erro de recurso não encontrado
 * throw new AppError('Aluno não encontrado', 404, 'NOT_FOUND');
 *
 * @example
 * // Erro de autorização
 * throw new AppError('Acesso negado', 403, 'FORBIDDEN');
 */
class AppError extends Error {
  /**
   * Cria uma instância de AppError
   *
   * @param {string} message - Mensagem de erro legível para o usuário
   * @param {number} statusCode - Código HTTP do erro (400, 404, 500, etc)
   * @param {string} code - Código único do erro (ex: 'VALIDATION_ERROR', 'NOT_FOUND')
   * @param {Object} [details] - Detalhes adicionais do erro (opcional)
   */
  constructor(message, statusCode, code, details = null) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Flag que indica se é um erro operacional (esperado)
    // vs erro de programação (bug não esperado)
    this.isOperational = true;

    // Captura o stack trace, excluindo o construtor da pilha
    Error.captureStackTrace(this, this.constructor);

    // Nome da classe para facilitar identificação em logs
    this.name = this.constructor.name;
  }
}

/**
 * Middleware de tratamento de erros centralizado
 *
 * Este middleware deve ser registrado como ÚLTIMO middleware no Express,
 * após todas as rotas. Ele captura todos os erros lançados durante o
 * processamento de requisições.
 *
 * Comportamento:
 * - Erros operacionais (isOperational = true): Log como 'warn', retorna mensagem ao cliente
 * - Erros não operacionais (bugs): Log como 'error' com stack trace, retorna mensagem genérica
 * - Em desenvolvimento: Inclui stack trace na resposta
 * - Em produção: Oculta detalhes de erros não operacionais
 *
 * @param {Error} err - Objeto de erro
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função next do Express (não utilizada, mas necessária na assinatura)
 * @returns {Object} Resposta JSON padronizada com detalhes do erro
 *
 * @example
 * // No server.js, após todas as rotas:
 * const { errorHandler } = require('./middlewares/error.middleware');
 * app.use(errorHandler);
 */
function errorHandler(err, req, res, next) {
  // Desestruturação com valores padrão
  let { statusCode, message, code, details, isOperational } = err;

  // Define valores padrão para erros não tratados
  if (!statusCode) statusCode = 500;
  if (!code) code = 'INTERNAL_ERROR';
  if (!message) message = 'Internal server error';

  // Contexto adicional para logs
  const errorContext = {
    code,
    statusCode,
    message,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || null, // Se houver usuário autenticado
    timestamp: new Date().toISOString(),
  };

  // Trata erros operacionais vs não operacionais
  if (!isOperational) {
    // ERRO NÃO OPERACIONAL (bug, erro de programação)
    // Log completo com stack trace para debugging
    logger.error('Erro não operacional detectado', {
      ...errorContext,
      stack: err.stack,
      error: {
        name: err.name,
        message: err.message,
      },
    });

    // Em produção, oculta detalhes sensíveis do erro
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error';
      code = 'INTERNAL_ERROR';
      details = null;
    }
  } else {
    // ERRO OPERACIONAL (erro esperado, parte do fluxo normal)
    // Log simplificado como warning
    logger.warn('Erro operacional', {
      ...errorContext,
      details,
    });
  }

  // Estrutura de resposta padronizada
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Adiciona detalhes se existirem (ex: erros de validação)
  if (details) {
    errorResponse.error.details = details;
  }

  // Em desenvolvimento, inclui stack trace para facilitar debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Retorna resposta JSON com status code apropriado
  return res.status(statusCode).json(errorResponse);
}

/**
 * Middleware para tratar rotas não encontradas (404)
 *
 * Deve ser registrado APÓS todas as rotas válidas e ANTES do errorHandler.
 *
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função next do Express
 *
 * @example
 * // No server.js, após todas as rotas:
 * const { notFoundHandler } = require('./middlewares/error.middleware');
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Rota não encontrada: ${req.method} ${req.url}`,
    404,
    'NOT_FOUND'
  );

  next(error);
}

/**
 * Helper function para criar erros de validação
 *
 * @param {string} message - Mensagem principal do erro
 * @param {Array} validationErrors - Array de erros de validação
 * @returns {AppError} Instância de AppError com detalhes de validação
 *
 * @example
 * const errors = [
 *   { field: 'cpf', message: 'CPF inválido' },
 *   { field: 'email', message: 'Email já cadastrado' }
 * ];
 * throw createValidationError('Dados inválidos', errors);
 */
function createValidationError(message, validationErrors) {
  return new AppError(
    message,
    400,
    'VALIDATION_ERROR',
    validationErrors
  );
}

/**
 * Helper function para criar erros de não encontrado
 *
 * @param {string} resource - Nome do recurso não encontrado
 * @returns {AppError} Instância de AppError para recurso não encontrado
 *
 * @example
 * const student = await Student.findById(id);
 * if (!student) {
 *   throw createNotFoundError('Aluno');
 * }
 */
function createNotFoundError(resource) {
  return new AppError(
    `${resource} não encontrado`,
    404,
    'NOT_FOUND'
  );
}

/**
 * Helper function para criar erros de não autorizado
 *
 * @param {string} message - Mensagem do erro
 * @returns {AppError} Instância de AppError para erro de autorização
 *
 * @example
 * if (!token) {
 *   throw createUnauthorizedError('Token não fornecido');
 * }
 */
function createUnauthorizedError(message = 'Não autorizado') {
  return new AppError(
    message,
    401,
    'UNAUTHORIZED'
  );
}

/**
 * Helper function para criar erros de acesso proibido
 *
 * @param {string} message - Mensagem do erro
 * @returns {AppError} Instância de AppError para erro de acesso proibido
 *
 * @example
 * if (user.role !== 'admin') {
 *   throw createForbiddenError('Apenas administradores podem acessar este recurso');
 * }
 */
function createForbiddenError(message = 'Acesso negado') {
  return new AppError(
    message,
    403,
    'FORBIDDEN'
  );
}

/**
 * Helper function para criar erros de conflito
 *
 * @param {string} message - Mensagem do erro
 * @returns {AppError} Instância de AppError para erro de conflito
 *
 * @example
 * const existingUser = await User.findOne({ where: { cpf } });
 * if (existingUser) {
 *   throw createConflictError('CPF já cadastrado');
 * }
 */
function createConflictError(message) {
  return new AppError(
    message,
    409,
    'CONFLICT'
  );
}

// Exportações
module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
};
