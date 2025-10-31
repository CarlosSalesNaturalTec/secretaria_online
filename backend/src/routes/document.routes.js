/**
 * Arquivo: backend/src/routes/document.routes.js
 * Descrição: Definição das rotas de documento
 * Feature: feat-043 - Criar DocumentController e rotas
 * Criado em: 2025-10-30
 *
 * Responsabilidades:
 * - Definir rotas HTTP para endpoints de documento
 * - Aplicar middlewares de autenticação e autorização
 * - Aplicar middlewares de validação de upload
 * - Rotear para handlers do DocumentController
 */

const express = require('express');

const router = express.Router();

// Middlewares
const authenticate = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const {
  validateUploadSingle,
} = require('../middlewares/upload.middleware');
const DocumentController = require('../controllers/document.controller');

/**
 * POST /api/v1/documents
 * Fazer upload de um documento
 *
 * Autenticação: Requerida (aluno, professor ou admin)
 * Arquivo: Requerido (validado por validateUploadSingle)
 * Body: document_type_id (inteiro, obrigatório)
 *
 * Status de resposta:
 * - 201 Created: Documento criado com sucesso
 * - 400 Bad Request: Validação falhou
 * - 401 Unauthorized: Não autenticado
 * - 409 Conflict: Documento já existe
 * - 413 Payload Too Large: Arquivo muito grande
 * - 422 Unprocessable Entity: Validação de negócio falhou
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * POST /api/v1/documents
 * Authorization: Bearer <token>
 * Content-Type: multipart/form-data
 *
 * document=<arquivo.pdf>
 * document_type_id=2
 */
router.post(
  '/',
  authenticate,
  validateUploadSingle,
  DocumentController.upload
);

/**
 * GET /api/v1/documents
 * Listar documentos com filtros
 *
 * Autenticação: Requerida (admin only)
 * Query params:
 * - status (optional): pending, approved, rejected
 * - userId (optional): Filtrar por ID do usuário
 * - page (optional): Página (padrão: 1)
 * - limit (optional): Itens por página (padrão: 20)
 * - orderBy (optional): Campo para ordenar (padrão: created_at)
 * - order (optional): ASC ou DESC (padrão: DESC)
 *
 * Status de resposta:
 * - 200 OK: Lista de documentos
 * - 400 Bad Request: Parâmetros inválidos
 * - 401 Unauthorized: Não autenticado
 * - 403 Forbidden: Sem permissão (não admin)
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/documents?status=pending&page=1&limit=20
 * Authorization: Bearer <token>
 */
router.get('/', authenticate, authorize('admin'), DocumentController.list);

/**
 * GET /api/v1/documents/:id
 * Buscar documento por ID
 *
 * Autenticação: Requerida
 * Parâmetros: id (inteiro positivo)
 *
 * Status de resposta:
 * - 200 OK: Documento encontrado
 * - 400 Bad Request: ID inválido
 * - 401 Unauthorized: Não autenticado
 * - 404 Not Found: Documento não encontrado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/documents/10
 * Authorization: Bearer <token>
 */
router.get('/:id', authenticate, DocumentController.findById);

/**
 * PUT /api/v1/documents/:id/approve
 * Aprovar um documento
 *
 * Autenticação: Requerida (admin only)
 * Parâmetros: id (inteiro positivo)
 * Body: observations (string, opcional)
 *
 * Status de resposta:
 * - 200 OK: Documento aprovado
 * - 400 Bad Request: ID inválido ou dados inválidos
 * - 401 Unauthorized: Não autenticado
 * - 403 Forbidden: Sem permissão (não admin)
 * - 404 Not Found: Documento não encontrado
 * - 409 Conflict: Documento já foi aprovado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * PUT /api/v1/documents/10/approve
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * {
 *   "observations": "Documento aprovado"
 * }
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  DocumentController.approve
);

/**
 * PUT /api/v1/documents/:id/reject
 * Rejeitar um documento
 *
 * Autenticação: Requerida (admin only)
 * Parâmetros: id (inteiro positivo)
 * Body: observations (string, obrigatório)
 *
 * Status de resposta:
 * - 200 OK: Documento rejeitado
 * - 400 Bad Request: ID inválido ou observations ausentes/vazias
 * - 401 Unauthorized: Não autenticado
 * - 403 Forbidden: Sem permissão (não admin)
 * - 404 Not Found: Documento não encontrado
 * - 409 Conflict: Documento já foi rejeitado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * PUT /api/v1/documents/10/reject
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * {
 *   "observations": "Documento ilegível"
 * }
 */
router.put(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  DocumentController.reject
);

/**
 * DELETE /api/v1/documents/:id
 * Deletar um documento
 *
 * Autenticação: Requerida (admin only)
 * Parâmetros: id (inteiro positivo)
 *
 * Status de resposta:
 * - 204 No Content: Documento deletado com sucesso
 * - 400 Bad Request: ID inválido
 * - 401 Unauthorized: Não autenticado
 * - 403 Forbidden: Sem permissão (não admin)
 * - 404 Not Found: Documento não encontrado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * DELETE /api/v1/documents/10
 * Authorization: Bearer <token>
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  DocumentController.delete
);

/**
 * GET /api/v1/documents/:id/validate
 * Validar status de documentos obrigatórios
 *
 * Autenticação: Requerida
 * Parâmetros: id (ID do usuário, inteiro positivo)
 *
 * Status de resposta:
 * - 200 OK: Status de validação retornado
 * - 400 Bad Request: ID inválido
 * - 401 Unauthorized: Não autenticado
 * - 404 Not Found: Usuário não encontrado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/documents/5/validate
 * Authorization: Bearer <token>
 */
router.get('/:id/validate', authenticate, DocumentController.validate);

/**
 * GET /api/v1/documents/:id/download
 * Download de um documento
 *
 * Autenticação: Requerida
 * Parâmetros: id (ID do documento, inteiro positivo)
 * Permissão: Próprio usuário ou admin
 *
 * Status de resposta:
 * - 200 OK: Arquivo enviado como download
 * - 400 Bad Request: ID inválido
 * - 401 Unauthorized: Não autenticado
 * - 403 Forbidden: Sem permissão para acessar o documento
 * - 404 Not Found: Documento ou arquivo não encontrado
 * - 500 Internal Server Error: Erro no servidor
 *
 * Response Headers:
 * - Content-Type: application/pdf (ou image/jpeg, image/png, etc.)
 * - Content-Disposition: attachment; filename="documento.pdf"
 *
 * @example
 * GET /api/v1/documents/10/download
 * Authorization: Bearer <token>
 *
 * Resposta: [arquivo binário com headers de download]
 */
router.get('/:id/download', authenticate, DocumentController.download);

module.exports = router;
