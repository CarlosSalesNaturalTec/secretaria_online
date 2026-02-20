/**
 * Arquivo: backend/src/controllers/studentExtraDiscipline.controller.js
 * Descrição: Controlador para gerenciamento de disciplinas extras de alunos
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 */

const studentExtraDisciplineService = require('../services/studentExtraDiscipline.service');

class StudentExtraDisciplineController {
  /**
   * Vincula uma disciplina extra a um aluno.
   * POST /api/v1/students/:studentId/extra-disciplines
   */
  async create(req, res, next) {
    try {
      const { studentId } = req.params;
      const extraDisciplineData = {
        ...req.body,
        student_id: parseInt(studentId, 10)
      };

      const extraDiscipline = await studentExtraDisciplineService.create(extraDisciplineData);
      res.status(201).json({ success: true, data: extraDiscipline });
    } catch (error) {
      if (error.message.includes('não encontrad') || error.message.includes('já possui') || error.message.includes('inválid')) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Lista disciplinas extras de um aluno.
   * GET /api/v1/students/:studentId/extra-disciplines
   */
  async getByStudent(req, res, next) {
    try {
      const { studentId } = req.params;
      const { status, reason, includeSchedules } = req.query;

      // Verificar permissão: admin pode ver qualquer aluno, student só pode ver próprio
      if (req.user.role === 'student') {
        const { User } = require('../models');
        const user = await User.findByPk(req.user.id);
        if (!user || user.student_id !== parseInt(studentId, 10)) {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Você não tem permissão para acessar estas disciplinas extras' }
          });
        }
      }

      const options = {};
      if (status) {
        options.status = status;
      }
      if (reason) {
        options.reason = reason;
      }
      if (includeSchedules === 'true') {
        options.includeSchedules = true;
      }

      const extraDisciplines = await studentExtraDisciplineService.getByStudent(parseInt(studentId, 10), options);
      res.status(200).json({ success: true, data: extraDisciplines });
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Obtém uma disciplina extra específica por ID.
   * GET /api/v1/extra-disciplines/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const extraDiscipline = await studentExtraDisciplineService.getById(parseInt(id, 10));

      if (!extraDiscipline) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Disciplina extra não encontrada' }
        });
      }

      res.status(200).json({ success: true, data: extraDiscipline });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma disciplina extra.
   * PUT /api/v1/extra-disciplines/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const extraDiscipline = await studentExtraDisciplineService.update(parseInt(id, 10), req.body);

      if (!extraDiscipline) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Disciplina extra não encontrada' }
        });
      }

      res.status(200).json({ success: true, data: extraDiscipline });
    } catch (error) {
      if (error.message.includes('não encontrad') || error.message.includes('inválid')) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Remove uma disciplina extra (soft delete).
   * DELETE /api/v1/extra-disciplines/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await studentExtraDisciplineService.delete(parseInt(id, 10));

      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Disciplina extra não encontrada' }
        });
      }

      res.status(200).json({ success: true, message: 'Disciplina extra removida com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém a grade completa do aluno (turma principal + disciplinas extras).
   * GET /api/v1/students/:studentId/full-schedule
   */
  async getFullSchedule(req, res, next) {
    try {
      const { studentId } = req.params;

      // Verificar permissão: admin pode ver qualquer aluno, student só pode ver próprio
      if (req.user.role === 'student') {
        const { User } = require('../models');
        const user = await User.findByPk(req.user.id);
        if (!user || user.student_id !== parseInt(studentId, 10)) {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Você não tem permissão para acessar esta grade' }
          });
        }
      }

      const { courseId } = req.query;
      const fullSchedule = await studentExtraDisciplineService.getStudentFullSchedule(
        parseInt(studentId, 10),
        { courseId: courseId ? parseInt(courseId, 10) : null }
      );
      res.status(200).json({ success: true, data: fullSchedule });
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * Lista alunos matriculados em uma disciplina como extra.
   * GET /api/v1/disciplines/:disciplineId/extra-students
   */
  async getByDiscipline(req, res, next) {
    try {
      const { disciplineId } = req.params;
      const { status } = req.query;

      const options = {};
      if (status) {
        options.status = status;
      }

      const extraDisciplines = await studentExtraDisciplineService.getByDiscipline(parseInt(disciplineId, 10), options);
      res.status(200).json({ success: true, data: extraDisciplines });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentExtraDisciplineController();
