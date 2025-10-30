/**
 * Arquivo: backend/src/routes/discipline.routes.js
 * Descrição: Rotas para o CRUD de Disciplina.
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const express = require('express');
const router = express.Router();
const DisciplineController = require('../controllers/discipline.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorizeAdmin);

router.post('/', DisciplineController.create);
router.get('/', DisciplineController.list);
router.get('/:id', DisciplineController.getById);
router.put('/:id', DisciplineController.update);
router.delete('/:id', DisciplineController.delete);

module.exports = router;
