/**
 * Arquivo: backend/src/routes/studentDisciplineExemption.routes.js
 * Descrição: Rotas para aproveitamento de disciplinas (dispensa)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

const express = require('express');
const router = express.Router();
const exemptionController = require('../controllers/studentDisciplineExemption.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// POST /students/:studentId/exemptions - Registrar dispensa (admin)
router.post('/students/:studentId/exemptions', authorizeAdmin, exemptionController.create);

// GET /students/:studentId/exemptions - Listar dispensas de um aluno (admin)
router.get('/students/:studentId/exemptions', authorizeAdmin, exemptionController.listByStudent);

// GET /exemptions - Listar todas as dispensas (admin)
router.get('/exemptions', authorizeAdmin, exemptionController.listAll);

// GET /exemptions/:id - Buscar dispensa por ID (admin)
router.get('/exemptions/:id', authorizeAdmin, exemptionController.getById);

// DELETE /exemptions/:id - Remover dispensa (admin)
router.delete('/exemptions/:id', authorizeAdmin, exemptionController.delete);

module.exports = router;
