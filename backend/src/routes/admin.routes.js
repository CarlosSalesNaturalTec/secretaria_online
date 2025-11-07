/**
 * Arquivo: backend/src/routes/admin.routes.js
 * Descrição: Rotas para funcionalidades administrativas
 * Feature: feat-081 - Criar rotas do dashboard admin
 * Criado em: 2025-11-07
 *
 * Responsabilidades:
 * - Definir endpoints administrativos
 * - Aplicar middlewares de autenticação e autorização
 * - Conectar rotas aos controllers
 *
 * Endpoints:
 * - GET /admin/dashboard/stats - Estatísticas do dashboard (admin only)
 */

const express = require('express');
const AdminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

const router = express.Router();

// ============================================================================
// ROTAS DE DASHBOARD ADMINISTRATIVO
// ============================================================================

/**
 * GET /api/v1/admin/dashboard/stats
 *
 * Busca estatísticas gerais do sistema para o dashboard
 *
 * Retorna:
 * - Total de estudantes
 * - Total de professores
 * - Documentos pendentes
 * - Matrículas ativas
 *
 * Permissões: Admin only
 *
 * Resposta de sucesso (200):
 * {
 *   success: true,
 *   data: {
 *     totalStudents: 150,
 *     totalTeachers: 12,
 *     pendingDocuments: 5,
 *     activeEnrollments: 148
 *   }
 * }
 *
 * @auth Requer token JWT
 * @role Admin
 */
router.get(
  '/dashboard/stats',
  authenticate,
  authorize('admin'),
  AdminController.getDashboardStats
);

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

module.exports = router;
