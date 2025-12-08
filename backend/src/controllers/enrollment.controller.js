/**
 * Arquivo: backend/src/controllers/enrollment.controller.js
 * Descrição: Controlador para o CRUD de matrículas de alunos em cursos
 * Feature: feat-039 - Criar EnrollmentController e rotas
 * Criado em: 2025-10-30
 *
 * RESPONSABILIDADES:
 * - Intermediar requisições HTTP com o EnrollmentService
 * - Validar entrada de dados
 * - Tratar erros e retornar respostas apropriadas
 * - Registrar logs de operações
 * - Aplicar regras de autorização (apenas admin para alterar status)
 *
 * ENDPOINTS:
 * - POST   /enrollments                      - Criar matrícula
 * - GET    /enrollments                      - Listar todas as matrículas
 * - GET    /students/:studentId/enrollments  - Listar matrículas de um aluno (feat-040)
 * - GET    /enrollments/:id                  - Buscar matrícula por ID
 * - PUT    /enrollments/:id/status           - Alterar status (admin only)
 * - DELETE /enrollments/:id                  - Deletar matrícula (soft delete)
 */

'use strict';

const EnrollmentService = require('../services/enrollment.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class EnrollmentController {
  /**
   * Cria uma nova matrícula (POST /enrollments)
   *
   * FLUXO:
   * 1. Valida erros de validação (express-validator)
   * 2. Chama EnrollmentService.create(studentId, courseId)
   * 3. Retorna matrícula criada com status 201
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * POST /api/enrollments
   * {
   *   "student_id": 1,
   *   "course_id": 2,
   *   "enrollment_date": "2025-10-30"
   * }
   *
   * Response 201:
   * {
   *   "success": true,
   *   "data": {
   *     "id": 1,
   *     "student_id": 1,
   *     "course_id": 2,
   *     "status": "pending",
   *     "enrollment_date": "2025-10-30",
   *     "created_at": "2025-10-30T10:00:00Z"
   *   }
   * }
   */
  async create(req, res, next) {
    try {
      // 1. Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn(`[EnrollmentController] Validação falhou: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { student_id, course_id, enrollment_date } = req.body;

      logger.info(
        `[EnrollmentController] Criando matrícula - student_id: ${student_id}, course_id: ${course_id}`
      );

      // 2. Chamar service
      const enrollment = await EnrollmentService.create(
        student_id,
        course_id,
        { enrollment_date }
      );

      logger.info(
        `[EnrollmentController] Matrícula criada com sucesso - ID: ${enrollment.id}`
      );

      // 3. Retornar resposta
      return res.status(201).json({
        success: true,
        message: 'Matrícula criada com sucesso com status "pending"',
        data: enrollment,
      });
    } catch (error) {
      logger.error(`[EnrollmentController] Erro ao criar matrícula: ${error.message}`);
      next(error);
    }
  }

  /**
   * Lista todas as matrículas (GET /enrollments)
   *
   * FLUXO:
   * 1. Chama EnrollmentService para buscar todas as matrículas
   * 2. Retorna lista com informações de aluno e curso
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * GET /api/enrollments
   *
   * Response 200:
   * {
   *   "success": true,
   *   "data": [
   *     { "id": 1, "student_id": 1, "course_id": 2, "status": "pending", ... },
   *     { "id": 2, "student_id": 2, "course_id": 1, "status": "active", ... }
   *   ]
   * }
   */
  async getAll(req, res, next) {
    try {
      logger.info('[EnrollmentController] Listando todas as matrículas');

      // Buscar todas as matrículas com relacionamentos
      const { Enrollment } = require('../models');
      const enrollments = await Enrollment.findAll({
        include: [
          {
            association: 'student',
            attributes: ['id', 'name', 'email', 'cpf'],
          },
          {
            association: 'course',
            attributes: ['id', 'name', 'duration', 'duration_type', 'description', 'courseType'],
          },
        ],
        order: [['enrollment_date', 'DESC']],
      });

      logger.info(
        `[EnrollmentController] ${enrollments.length} matrículas encontradas`
      );

      return res.json({
        success: true,
        data: enrollments,
      });
    } catch (error) {
      logger.error(`[EnrollmentController] Erro ao listar matrículas: ${error.message}`);
      next(error);
    }
  }

  /**
   * Busca uma matrícula por ID (GET /enrollments/:id)
   *
   * FLUXO:
   * 1. Valida ID do parâmetro
   * 2. Chama EnrollmentService.getById(id)
   * 3. Retorna matrícula com informações detalhadas
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * GET /api/enrollments/1
   *
   * Response 200:
   * {
   *   "success": true,
   *   "data": {
   *     "id": 1,
   *     "student_id": 1,
   *     "course_id": 2,
   *     "status": "pending",
   *     "enrollment_date": "2025-10-30",
   *     "student": { "id": 1, "name": "João Silva", ... },
   *     "course": { "id": 2, "name": "Engenharia de Software", ... }
   *   }
   * }
   */
  async getById(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: errors.array()
        });
      }

      const { id } = req.params;

      logger.debug(`[EnrollmentController] Buscando matrícula - ID: ${id}`);

      const enrollment = await EnrollmentService.getById(id);

      if (!enrollment) {
        logger.warn(`[EnrollmentController] Matrícula não encontrada - ID: ${id}`);
        return res.status(404).json({
          success: false,
          error: 'Matrícula não encontrada',
        });
      }

      return res.json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      logger.error(`[EnrollmentController] Erro ao buscar matrícula: ${error.message}`);
      next(error);
    }
  }

  /**
   * Lista matrículas de um aluno (GET /students/:studentId/enrollments)
   *
   * FLUXO:
   * 1. Valida ID do aluno
   * 2. Chama EnrollmentService.getByStudent(studentId)
   * 3. Retorna lista de matrículas do aluno
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * GET /api/students/1/enrollments
   *
   * Response 200:
   * {
   *   "success": true,
   *   "data": [
   *     { "id": 1, "student_id": 1, "course_id": 2, "status": "pending", ... }
   *   ]
   * }
   */
  async getByStudent(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'ID do aluno inválido',
          details: errors.array()
        });
      }

      const { studentId } = req.params;

      logger.info(
        `[EnrollmentController] Listando matrículas do aluno - ID: ${studentId}`
      );

      const enrollments = await EnrollmentService.getByStudent(studentId, {
        withCourse: true,
      });

      logger.info(
        `[EnrollmentController] ${enrollments.length} matrículas encontradas para aluno ${studentId}`
      );

      return res.json({
        success: true,
        data: enrollments,
      });
    } catch (error) {
      logger.error(`[EnrollmentController] Erro ao listar matrículas do aluno: ${error.message}`);
      next(error);
    }
  }

  /**
   * Altera o status de uma matrícula (PUT /enrollments/:id/status)
   *
   * RESTRIÇÕES:
   * - Apenas admins podem alterar status
   * - Transição: pending → active (com validação de documentos)
   * - Transição: active/pending → cancelled
   *
   * FLUXO:
   * 1. Valida entrada (ID e novo status)
   * 2. Chama EnrollmentService.updateStatus(id, newStatus)
   * 3. Retorna matrícula atualizada
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * PUT /api/enrollments/1/status
   * {
   *   "status": "active"
   * }
   *
   * Response 200:
   * {
   *   "success": true,
   *   "message": "Status da matrícula alterado para 'active'",
   *   "data": {
   *     "id": 1,
   *     "status": "active",
   *     ...
   *   }
   * }
   */
  async updateStatus(req, res, next) {
    try {
      // 1. Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn(
          `[EnrollmentController] Validação falhou ao atualizar status: ${JSON.stringify(errors.array())}`
        );
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      logger.info(
        `[EnrollmentController] Atualizando status da matrícula - ID: ${id}, Novo Status: ${status}`
      );

      // 2. Chamar service
      const enrollment = await EnrollmentService.updateStatus(id, status);

      logger.info(
        `[EnrollmentController] Status atualizado com sucesso - ID: ${id}, Novo Status: ${status}`
      );

      // 3. Retornar resposta
      return res.json({
        success: true,
        message: `Status da matrícula alterado para '${status}'`,
        data: enrollment,
      });
    } catch (error) {
      logger.error(
        `[EnrollmentController] Erro ao atualizar status: ${error.message}`
      );
      next(error);
    }
  }

  /**
   * Cancela uma matrícula (DELETE /enrollments/:id)
   *
   * FLUXO:
   * 1. Valida ID
   * 2. Chama EnrollmentService.cancel(id) ou delete(id)
   * 3. Retorna resposta de sucesso (204 No Content ou 200 com dados)
   *
   * @param {import('express').Request} req - Requisição HTTP
   * @param {import('express').Response} res - Resposta HTTP
   * @param {import('express').NextFunction} next - Próximo middleware
   *
   * @example
   * DELETE /api/enrollments/1
   *
   * Response 204 No Content
   */
  async delete(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: errors.array()
        });
      }

      const { id } = req.params;

      logger.info(`[EnrollmentController] Deletando matrícula - ID: ${id}`);

      // Deletar matrícula (soft delete via Sequelize paranoid)
      await EnrollmentService.delete(id);

      logger.info(`[EnrollmentController] Matrícula deletada com sucesso - ID: ${id}`);

      return res.status(204).send();
    } catch (error) {
      logger.error(`[EnrollmentController] Erro ao deletar matrícula: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new EnrollmentController();
