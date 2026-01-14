/**
 * Arquivo: backend/src/controllers/classDisciplineSchedule.controller.js
 * Descrição: Controller para gerenciamento de horários das disciplinas da turma
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 */

const ClassDisciplineScheduleService = require('../services/classDisciplineSchedule.service');

class ClassDisciplineScheduleController {
  /**
   * Lista todos os horários de uma turma
   * GET /api/v1/classes/:classId/schedules
   */
  async getSchedulesByClass(req, res, next) {
    try {
      const { classId } = req.params;
      const schedules = await ClassDisciplineScheduleService.getSchedulesByClass(classId);
      res.status(200).json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista horários por class_teacher_id
   * GET /api/v1/class-teachers/:classTeacherId/schedules
   */
  async getSchedulesByClassTeacher(req, res, next) {
    try {
      const { classTeacherId } = req.params;
      const schedules = await ClassDisciplineScheduleService.getSchedulesByClassTeacher(classTeacherId);
      res.status(200).json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria um novo horário
   * POST /api/v1/class-schedules
   */
  async create(req, res, next) {
    try {
      const schedule = await ClassDisciplineScheduleService.create(req.body);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um horário existente
   * PUT /api/v1/class-schedules/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await ClassDisciplineScheduleService.update(id, req.body);

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
   * Remove um horário
   * DELETE /api/v1/class-schedules/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ClassDisciplineScheduleService.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Horário não encontrado' }
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria múltiplos horários de uma vez
   * POST /api/v1/class-schedules/bulk
   */
  async bulkCreate(req, res, next) {
    try {
      const { schedules } = req.body;

      if (!Array.isArray(schedules)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DATA', message: 'O campo schedules deve ser um array' }
        });
      }

      const createdSchedules = await ClassDisciplineScheduleService.bulkCreate(schedules);
      res.status(201).json({ success: true, data: createdSchedules });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassDisciplineScheduleController();
