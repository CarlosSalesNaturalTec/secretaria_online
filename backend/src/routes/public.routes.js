/**
 * Arquivo: backend/src/routes/public.routes.js
 * Descrição: Rotas públicas (sem autenticação) para verificação de documentos.
 *            Inclui a verificação de autenticidade de atestados de matrícula via hash.
 * Feature: Atestado de Matrícula com Assinatura Eletrônica
 * Criado em: 2026-02-24
 */

const express = require('express');
const router = express.Router();
const PublicController = require('../controllers/public.controller');

/**
 * Rotas Públicas
 *
 * Estas rotas NÃO requerem autenticação JWT.
 * São acessíveis por qualquer pessoa com o link correto.
 *
 * Endpoints:
 * - GET /public/verify-atestado/:hash - Verificar autenticidade de atestado de matrícula
 */

/**
 * @route   GET /api/v1/public/verify-atestado/:hash
 * @desc    Verificar autenticidade de atestado de matrícula pelo hash de assinatura eletrônica
 * @access  Público (sem autenticação)
 *
 * @param {string} hash - Hash de 16 caracteres hexadecimais gerado pelo sistema
 *
 * @example
 * GET /api/v1/public/verify-atestado/a1b2c3d4e5f67890
 *
 * Response (válido):
 * {
 *   "success": true,
 *   "valid": true,
 *   "message": "Documento válido.",
 *   "data": {
 *     "studentName": "João Silva",
 *     "courseName": "Administração",
 *     "issuedAt": "2026-02-24T10:00:00.000Z",
 *     "signatureHash": "a1b2c3d4e5f67890"
 *   }
 * }
 *
 * Response (inválido):
 * {
 *   "success": true,
 *   "valid": false,
 *   "message": "Documento não encontrado."
 * }
 */
router.get('/verify-atestado/:hash', PublicController.verifyAtestado);

module.exports = router;
