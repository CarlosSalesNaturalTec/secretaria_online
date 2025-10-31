/**
 * Arquivo: backend/src/controllers/document.controller.js
 * Descrição: Controller para endpoints de documentos
 * Feature: feat-043 - Criar DocumentController e rotas
 * Criado em: 2025-10-30
 *
 * Responsabilidades:
 * - Manipular requisições HTTP de documentos
 * - Chamar DocumentService para lógica de negócio
 * - Validar dados de entrada
 * - Retornar respostas padronizadas
 */

const logger = require('../utils/logger');
const DocumentService = require('../services/document.service');
const { AppError } = require('../middlewares/error.middleware');

/**
 * DocumentController
 * Controller que encapsula handlers para endpoints de documento
 */
class DocumentController {
  /**
   * POST /api/v1/documents
   * Fazer upload de um documento
   *
   * Requisitos:
   * - Usuário autenticado
   * - Arquivo validado pelo middleware validateUploadSingle
   * - Body contém document_type_id
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.user - Usuário autenticado (injetado pelo auth.middleware)
   * @param {Object} req.file - Arquivo validado (injetado pelo validateUploadSingle)
   * @param {number} req.body.document_type_id - ID do tipo de documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento criado (201) ou erro
   *
   * @example
   * // Request
   * POST /api/v1/documents
   * Authorization: Bearer <token>
   * Content-Type: multipart/form-data
   *
   * document: <arquivo.pdf>
   * document_type_id: 2
   *
   * // Response (201 Created)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 1,
   *     "user_id": 5,
   *     "document_type_id": 2,
   *     "file_name": "1698700200000-rg.pdf",
   *     "file_size": 245632,
   *     "mime_type": "application/pdf",
   *     "status": "pending",
   *     "created_at": "2025-10-30T10:00:00Z"
   *   },
   *   "message": "Documento enviado com sucesso"
   * }
   */
  static async upload(req, res, next) {
    try {
      // Validar documento_type_id
      const { document_type_id } = req.body;

      if (!document_type_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'document_type_id é obrigatório',
          },
        });
      }

      // Validar que document_type_id é um inteiro
      if (isNaN(document_type_id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'document_type_id deve ser um número inteiro',
          },
        });
      }

      // Chamar serviço para fazer upload
      const document = await DocumentService.upload({
        userId: req.user.id,
        documentTypeId: parseInt(document_type_id),
        filePath: req.file.path,
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      logger.info('[DocumentController] Upload realizado com sucesso', {
        documentId: document.id,
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Documento enviado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents
   * Listar documentos com filtros (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   *
   * Query params:
   * - status (optional): pending, approved, rejected
   * - userId (optional): Filtrar por ID do usuário
   * - page (optional): Página (padrão: 1)
   * - limit (optional): Itens por página (padrão: 20)
   * - orderBy (optional): Campo para ordenar (padrão: created_at)
   * - order (optional): ASC ou DESC (padrão: DESC)
   *
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com lista de documentos
   *
   * @example
   * // Request
   * GET /api/v1/documents?status=pending&page=1&limit=20
   * Authorization: Bearer <token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "documents": [...],
   *     "total": 45,
   *     "page": 1,
   *     "limit": 20,
   *     "pages": 3
   *   }
   * }
   */
  static async list(req, res, next) {
    try {
      const {
        status,
        userId,
        page = 1,
        limit = 20,
        orderBy = 'created_at',
        order = 'DESC',
      } = req.query;

      // Validar valores
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Status deve ser um dos: ${validStatuses.join(', ')}`,
          },
        });
      }

      const validOrders = ['ASC', 'DESC'];
      if (order && !validOrders.includes(order.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order deve ser ASC ou DESC',
          },
        });
      }

      // Chamar serviço
      const result = await DocumentService.list({
        status,
        userId: userId ? parseInt(userId) : undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        orderBy,
        order: order.toUpperCase(),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/:id
   * Buscar documento por ID
   *
   * Requisitos:
   * - Usuário autenticado
   * - ID válido na URL
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento encontrado ou erro 404
   *
   * @example
   * // Request
   * GET /api/v1/documents/10
   * Authorization: Bearer <token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 10,
   *     "user_id": 5,
   *     "document_type_id": 2,
   *     ...
   *   }
   * }
   */
  static async findById(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      const document = await DocumentService.findById(parseInt(id));

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/documents/:id/approve
   * Aprovar um documento (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   * - ID válido na URL
   * - Body contém observations (opcional)
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {string} req.body.observations - Observações opcionais
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento aprovado (200) ou erro
   *
   * @example
   * // Request
   * PUT /api/v1/documents/10/approve
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * {
   *   "observations": "Documento aprovado"
   * }
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 10,
   *     "status": "approved",
   *     "reviewed_by": 1,
   *     "reviewed_at": "2025-10-30T10:00:00Z",
   *     ...
   *   },
   *   "message": "Documento aprovado com sucesso"
   * }
   */
  static async approve(req, res, next) {
    try {
      const { id } = req.params;
      const { observations } = req.body;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      const document = await DocumentService.approve(
        parseInt(id),
        req.user.id,
        observations
      );

      logger.info('[DocumentController] Documento aprovado', {
        documentId: id,
        approvedBy: req.user.id,
      });

      res.json({
        success: true,
        data: document,
        message: 'Documento aprovado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/documents/:id/reject
   * Rejeitar um documento (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   * - ID válido na URL
   * - Body contém observations (obrigatório)
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {string} req.body.observations - Motivo da rejeição
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com documento rejeitado (200) ou erro
   *
   * @example
   * // Request
   * PUT /api/v1/documents/10/reject
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * {
   *   "observations": "Documento ilegível"
   * }
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "id": 10,
   *     "status": "rejected",
   *     "reviewed_by": 1,
   *     "reviewed_at": "2025-10-30T10:00:00Z",
   *     "observations": "Documento ilegível",
   *     ...
   *   },
   *   "message": "Documento rejeitado com sucesso"
   * }
   */
  static async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { observations } = req.body;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      // Validar observações
      if (!observations || observations.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Observações são obrigatórias ao rejeitar um documento',
          },
        });
      }

      const document = await DocumentService.reject(
        parseInt(id),
        req.user.id,
        observations
      );

      logger.info('[DocumentController] Documento rejeitado', {
        documentId: id,
        rejectedBy: req.user.id,
      });

      res.json({
        success: true,
        data: document,
        message: 'Documento rejeitado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/documents/:id
   * Deletar um documento (admin only)
   *
   * Requisitos:
   * - Usuário autenticado com role 'admin'
   * - ID válido na URL
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do documento
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta 204 No Content ou erro
   *
   * @example
   * // Request
   * DELETE /api/v1/documents/10
   * Authorization: Bearer <token>
   *
   * // Response (204 No Content)
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      await DocumentService.delete(parseInt(id));

      logger.info('[DocumentController] Documento deletado', {
        documentId: id,
        deletedBy: req.user.id,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/documents/:id/validate
   * Validar status de documentos obrigatórios de um usuário
   *
   * Requisitos:
   * - Usuário autenticado
   * - ID válido na URL
   *
   * @param {Object} req - Request do Express
   * @param {Object} req.params.id - ID do usuário
   * @param {Object} res - Response do Express
   * @param {Function} next - Próximo middleware/handler
   *
   * @returns {void} Resposta JSON com status de validação
   *
   * @example
   * // Request
   * GET /api/v1/documents/5/validate
   * Authorization: Bearer <token>
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "data": {
   *     "allApproved": false,
   *     "pending": [...],
   *     "approved": [...],
   *     "rejected": [...]
   *   }
   * }
   */
  static async validate(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID deve ser um número inteiro positivo',
          },
        });
      }

      const validation = await DocumentService.validateRequiredDocuments(
        parseInt(id)
      );

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DocumentController;
