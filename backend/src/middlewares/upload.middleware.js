/**
 * Arquivo: src/middlewares/upload.middleware.js
 * Descrição: Middleware de validação e processamento de upload de arquivos
 * Feature: feat-041 - Configurar Multer para upload de arquivos
 * Criado em: 2025-10-30
 */

const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');
const { uploadConfig, UPLOAD_CONSTANTS } = require('../config/upload');

/**
 * Instancia do Multer para upload único de documentos
 * Usado para uploads de um documento por vez
 * Exemplo: POST /documents (upload de 1 documento)
 *
 * @type {Object}
 */
const uploadSingle = multer(uploadConfig).single('document');

/**
 * Instancia do Multer para upload múltiplo de documentos
 * Usado para uploads de até 5 documentos por vez
 * Exemplo: POST /documents/batch (upload de múltiplos documentos)
 *
 * @type {Object}
 */
const uploadMultiple = multer(uploadConfig).array('documents', 5);

/**
 * Middleware de validação de upload único
 *
 * Responsabilidades:
 * - Processar upload via Multer
 * - Validar se arquivo foi enviado
 * - Validar integridade do arquivo
 * - Adicionar informações do arquivo ao req.file
 * - Tratar erros de upload
 *
 * @param {Object} req - Objeto da requisição Express
 * @param {Object} res - Objeto da resposta Express
 * @param {Function} next - Função para chamar próximo middleware
 * @returns {void}
 *
 * @example
 * // Em uma rota:
 * router.post('/documents', authenticate, validateUploadSingle, DocumentController.upload);
 */
function validateUploadSingle(req, res, next) {
  uploadSingle(req, res, (err) => {
    // Se houve erro no Multer (validação, tamanho, etc)
    if (err instanceof multer.MulterError) {
      logger.warn(`[UPLOAD] Erro Multer: ${err.code}`, {
        userId: req.user?.id,
        code: err.code,
        message: err.message,
      });

      // Mapear erros do Multer para mensagens amigáveis
      if (err.code === 'FILE_TOO_LARGE') {
        return res.status(413).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB}MB`,
          },
        });
      }

      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'LIMIT_FILE_COUNT',
            message: 'Número máximo de arquivos excedido',
          },
        });
      }

      if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'LIMIT_PART_COUNT',
            message: 'Número máximo de campos excedido',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Erro ao fazer upload do arquivo',
        },
      });
    }

    // Se houve erro customizado no fileFilter
    if (err) {
      logger.warn(`[UPLOAD] Erro de validação: ${err.message}`, {
        userId: req.user?.id,
        message: err.message,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE',
          message: err.message,
        },
      });
    }

    // Validar se arquivo foi enviado
    if (!req.file) {
      logger.warn('[UPLOAD] Nenhum arquivo foi enviado', {
        userId: req.user?.id,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Nenhum arquivo foi enviado',
        },
      });
    }

    // Validações adicionais do arquivo
    try {
      // Validar que arquivo possui as propriedades esperadas
      if (
        !req.file.filename ||
        !req.file.path ||
        !req.file.mimetype ||
        !req.file.size
      ) {
        throw new Error('Arquivo não contém propriedades esperadas');
      }

      // Adicionar informações ao objeto file
      req.file.uploadedAt = new Date();
      req.file.userId = req.user?.id;

      logger.info('[UPLOAD] Arquivo validado com sucesso', {
        userId: req.user?.id,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Prosseguir para próximo middleware/controller
      next();
    } catch (validationError) {
      logger.error('[UPLOAD] Erro ao validar propriedades do arquivo', {
        userId: req.user?.id,
        error: validationError.message,
      });

      return res.status(500).json({
        success: false,
        error: {
          code: 'FILE_VALIDATION_ERROR',
          message: 'Erro ao validar arquivo',
        },
      });
    }
  });
}

/**
 * Middleware de validação de upload múltiplo
 *
 * Responsabilidades:
 * - Processar múltiplos uploads via Multer
 * - Validar se arquivos foram enviados
 * - Validar integridade de cada arquivo
 * - Adicionar informações dos arquivos ao req.files
 * - Tratar erros de upload
 *
 * @param {Object} req - Objeto da requisição Express
 * @param {Object} res - Objeto da resposta Express
 * @param {Function} next - Função para chamar próximo middleware
 * @returns {void}
 *
 * @example
 * // Em uma rota:
 * router.post('/documents/batch', authenticate, validateUploadMultiple, DocumentController.uploadBatch);
 */
function validateUploadMultiple(req, res, next) {
  uploadMultiple(req, res, (err) => {
    // Se houve erro no Multer (validação, tamanho, etc)
    if (err instanceof multer.MulterError) {
      logger.warn(`[UPLOAD BATCH] Erro Multer: ${err.code}`, {
        userId: req.user?.id,
        code: err.code,
        message: err.message,
      });

      if (err.code === 'FILE_TOO_LARGE') {
        return res.status(413).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB}MB`,
          },
        });
      }

      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'LIMIT_FILE_COUNT',
            message: `Número máximo de arquivos: ${UPLOAD_CONSTANTS.MAX_FILES_PER_REQUEST}`,
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Erro ao fazer upload dos arquivos',
        },
      });
    }

    // Se houve erro customizado no fileFilter
    if (err) {
      logger.warn(`[UPLOAD BATCH] Erro de validação: ${err.message}`, {
        userId: req.user?.id,
        message: err.message,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE',
          message: err.message,
        },
      });
    }

    // Validar se arquivos foram enviados
    if (!req.files || req.files.length === 0) {
      logger.warn('[UPLOAD BATCH] Nenhum arquivo foi enviado', {
        userId: req.user?.id,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'Nenhum arquivo foi enviado',
        },
      });
    }

    // Validações adicionais dos arquivos
    try {
      // Validar cada arquivo
      req.files.forEach((file) => {
        if (!file.filename || !file.path || !file.mimetype || !file.size) {
          throw new Error(
            `Arquivo ${file.originalname} não contém propriedades esperadas`
          );
        }

        // Adicionar informações ao objeto file
        file.uploadedAt = new Date();
        file.userId = req.user?.id;
      });

      logger.info('[UPLOAD BATCH] Arquivos validados com sucesso', {
        userId: req.user?.id,
        fileCount: req.files.length,
        files: req.files.map((f) => ({
          filename: f.filename,
          mimetype: f.mimetype,
          size: f.size,
        })),
      });

      // Prosseguir para próximo middleware/controller
      next();
    } catch (validationError) {
      logger.error('[UPLOAD BATCH] Erro ao validar propriedades dos arquivos', {
        userId: req.user?.id,
        error: validationError.message,
      });

      return res.status(500).json({
        success: false,
        error: {
          code: 'FILE_VALIDATION_ERROR',
          message: 'Erro ao validar arquivos',
        },
      });
    }
  });
}

/**
 * Middleware para limpeza de arquivo em caso de erro no controller
 *
 * Responsabilidades:
 * - Remover arquivo do disco se o controller falhar
 * - Registrar erro de limpeza se ocorrer
 * - Prosseguir normalmente se não houver arquivo
 *
 * @param {Object} req - Objeto da requisição Express
 * @param {Object} res - Objeto da resposta Express
 * @param {Function} next - Função para chamar próximo middleware
 * @returns {void}
 *
 * @example
 * // Usar após outro middleware que gerou erro com arquivo
 * router.post('/documents', authenticate, validateUploadSingle, cleanupOnError);
 */
function cleanupOnError(req, res, next) {
  // Interceptar a função res.json para detectar erros
  const originalJson = res.json;

  res.json = function (data) {
    // Se houver erro na resposta e arquivo foi uploadado, deletar
    if (data && !data.success && req.file) {
      const fs = require('fs').promises;

      fs.unlink(req.file.path)
        .then(() => {
          logger.info('[UPLOAD] Arquivo deletado devido a erro', {
            filename: req.file.filename,
            path: req.file.path,
          });
        })
        .catch((deleteErr) => {
          logger.warn('[UPLOAD] Erro ao deletar arquivo temporário', {
            filename: req.file.filename,
            error: deleteErr.message,
          });
        });
    }

    // Chamar função original res.json
    return originalJson.call(this, data);
  };

  next();
}

module.exports = {
  validateUploadSingle,
  validateUploadMultiple,
  cleanupOnError,
  uploadSingle,
  uploadMultiple,
};
