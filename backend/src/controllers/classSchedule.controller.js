/**
 * Arquivo: backend/src/controllers/classSchedule.controller.js
 * Descrição: Controlador para gerenciamento de grade de horários das turmas
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 */

const classScheduleService = require('../services/classSchedule.service');

class ClassScheduleController {
  /**
   * Cria um novo horário na grade de uma turma.
   * POST /api/v1/classes/:classId/schedules
   */
  async create(req, res, next) {
    try {
      const { classId } = req.params;
      const scheduleData = {
        ...req.body,
        class_id: parseInt(classId, 10)
      };

      const schedule = await classScheduleService.create(scheduleData);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      if (error.message.includes('não encontrad') || error.message.includes('Conflito')) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Lista horários de uma turma.
   * GET /api/v1/classes/:classId/schedules
   */
  async getByClass(req, res, next) {
    try {
      const { classId } = req.params;
      const { dayOfWeek, disciplineId } = req.query;

      const options = {};
      if (dayOfWeek) {
        options.dayOfWeek = parseInt(dayOfWeek, 10);
      }
      if (disciplineId) {
        options.disciplineId = parseInt(disciplineId, 10);
      }

      const schedules = await classScheduleService.getByClass(parseInt(classId, 10), options);
      res.status(200).json({ success: true, data: schedules });
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Obtém um horário específico por ID.
   * GET /api/v1/schedules/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await classScheduleService.getById(parseInt(id, 10));

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Horário não encontrado' }
        });
      }

      res.status(200).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um horário existente.
   * PUT /api/v1/schedules/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await classScheduleService.update(parseInt(id, 10), req.body);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Horário não encontrado' }
        });
      }

      res.status(200).json({ success: true, data: schedule });
    } catch (error) {
      if (error.message.includes('não encontrad') || error.message.includes('Conflito') || error.message.includes('deve ser')) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Deleta um horário (soft delete).
   * DELETE /api/v1/schedules/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await classScheduleService.delete(parseInt(id, 10));

      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Horário não encontrado' }
        });
      }

      res.status(200).json({ success: true, message: 'Horário removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria múltiplos horários em lote.
   * POST /api/v1/classes/:classId/schedules/bulk
   */
  async bulkCreate(req, res, next) {
    try {
      const { classId } = req.params;
      const { schedules } = req.body;

      if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'O campo schedules deve ser um array não vazio' }
        });
      }

      const result = await classScheduleService.bulkCreate(parseInt(classId, 10), schedules);

      const statusCode = result.success ? 201 : 207; // 207 Multi-Status se houve erros parciais
      res.status(statusCode).json({ success: result.success, data: result });
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Obtém a grade completa da semana.
   * GET /api/v1/classes/:classId/schedules/week
   */
  async getWeekSchedule(req, res, next) {
    try {
      const { classId } = req.params;
      const weekSchedule = await classScheduleService.getWeekSchedule(parseInt(classId, 10));
      res.status(200).json({ success: true, data: weekSchedule });
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      next(error);
    }
  }
}

module.exports = new ClassScheduleController();
