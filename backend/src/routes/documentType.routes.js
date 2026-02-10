/**
 * Arquivo: backend/src/routes/documentType.routes.js
 * Descrição: Definição das rotas de tipos de documentos
 * Feature: feat-XXX - Carregar tipos de documentos dinamicamente
 * Criado em: 2026-02-10
 *
 * Responsabilidades:
 * - Definir rotas HTTP para endpoints de tipos de documentos
 * - Aplicar middlewares de autenticação
 * - Rotear para handlers do DocumentTypeController
 */

const express = require('express');
const router = express.Router();

// Middlewares
const authenticate = require('../middlewares/auth.middleware');

// Controller
const DocumentTypeController = require('../controllers/documentType.controller');

/**
 * GET /api/v1/document-types
 * Listar todos os tipos de documentos ativos
 *
 * Autenticação: Requerida
 * Query params:
 * - userType (optional): student, teacher ou both
 *
 * Status de resposta:
 * - 200 OK: Lista de tipos de documentos
 * - 400 Bad Request: Parâmetros inválidos
 * - 401 Unauthorized: Não autenticado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/document-types?userType=student
 * Authorization: Bearer <token>
 */
router.get('/', authenticate, DocumentTypeController.getAll);

/**
 * GET /api/v1/document-types/required/students
 * Listar tipos de documentos obrigatórios para alunos
 *
 * Autenticação: Requerida
 *
 * Status de resposta:
 * - 200 OK: Lista de tipos obrigatórios
 * - 401 Unauthorized: Não autenticado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/document-types/required/students
 * Authorization: Bearer <token>
 */
router.get('/required/students', authenticate, DocumentTypeController.getRequiredForStudents);

/**
 * GET /api/v1/document-types/required/teachers
 * Listar tipos de documentos obrigatórios para professores
 *
 * Autenticação: Requerida
 *
 * Status de resposta:
 * - 200 OK: Lista de tipos obrigatórios
 * - 401 Unauthorized: Não autenticado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/document-types/required/teachers
 * Authorization: Bearer <token>
 */
router.get('/required/teachers', authenticate, DocumentTypeController.getRequiredForTeachers);

/**
 * GET /api/v1/document-types/:id
 * Buscar tipo de documento por ID
 *
 * Autenticação: Requerida
 * Parâmetros: id (inteiro positivo)
 *
 * Status de resposta:
 * - 200 OK: Tipo de documento encontrado
 * - 400 Bad Request: ID inválido
 * - 401 Unauthorized: Não autenticado
 * - 404 Not Found: Tipo de documento não encontrado
 * - 500 Internal Server Error: Erro no servidor
 *
 * @example
 * GET /api/v1/document-types/1
 * Authorization: Bearer <token>
 */
router.get('/:id', authenticate, DocumentTypeController.findById);

module.exports = router;
