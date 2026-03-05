/**
 * Arquivo: backend/src/controllers/studentDisciplineExemption.controller.js
 * Descrição: Controlador para aproveitamento de disciplinas (dispensa)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

const exemptionService = require('../services/studentDisciplineExemption.service');

class StudentDisciplineExemptionController {
  /**
   * POST /api/v1/students/:studentId/exemptions
   */
  async create(req, res, next) {
    try {
      const { studentId } = req.params;
      const { discipline_id, class_id, origin_institution, notes } = req.body;

      if (!discipline_id) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'O campo discipline_id é obrigatório' }
        });
      }

      const exemption = await exemptionService.create({
        student_id: parseInt(studentId, 10),
        discipline_id: parseInt(discipline_id, 10),
        class_id: class_id ? parseInt(class_id, 10) : null,
        origin_institution,
        notes
      });

      res.status(201).json({ success: true, data: exemption });
    } catch (error) {
      const statusCode = error.statusCode;
      if (statusCode === 404 || statusCode === 409) {
        return res.status(statusCode).json({
          success: false,
          error: {
            code: statusCode === 409 ? 'CONFLICT' : 'NOT_FOUND',
            message: error.message
          }
        });
      }
      next(error);
    }
  }

  /**
   * GET /api/v1/students/:studentId/exemptions
   */
  async listByStudent(req, res, next) {
    try {
      const { studentId } = req.params;
      const exemptions = await exemptionService.listByStudent(parseInt(studentId, 10));
      res.status(200).json({ success: true, data: exemptions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/exemptions
   */
  async listAll(req, res, next) {
    try {
      const { page, limit, student_id, class_id } = req.query;
      const result = await exemptionService.listAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        student_id: student_id ? parseInt(student_id, 10) : undefined,
        class_id: class_id ? parseInt(class_id, 10) : undefined
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/exemptions/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const exemption = await exemptionService.getById(parseInt(id, 10));

      if (!exemption) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Aproveitamento não encontrado' }
        });
      }

      res.status(200).json({ success: true, data: exemption });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/exemptions/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await exemptionService.delete(parseInt(id, 10));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Aproveitamento não encontrado' }
        });
      }

      res.status(200).json({ success: true, message: 'Aproveitamento removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentDisciplineExemptionController();
