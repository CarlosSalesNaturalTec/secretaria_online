/**
 * Arquivo: backend/src/controllers/class.controller.js
 * Descrição: Controlador para o CRUD de Turma.
 * Feature: feat-035
 * Criado em: 29/10/2025
 */

const ClassService = require('../services/class.service');
const { User } = require('../models');

class ClassController {
  async create(req, res, next) {
    try {
      const turma = await ClassService.create(req.body);
      res.status(201).json({ success: true, data: turma });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      let teacherId = null;

      // Se o usuário logado for professor, filtrar apenas suas turmas
      if (req.user && req.user.role === 'teacher') {
        // Buscar o teacher_id associado ao user_id logado
        const user = await User.findByPk(req.user.id);
        if (user && user.teacher_id) {
          teacherId = user.teacher_id;
        }
      }

      const classs = await ClassService.list(teacherId);
      res.status(200).json({ success: true, data: classs });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const turma = await ClassService.getById(req.params.id);
      if (!turma) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Turma não encontrada' },
        });
      }

      // Debug: Log da estrutura dos professores
      if (turma.teachers && turma.teachers.length > 0) {
        console.log('[ClassController] Teacher structure:', JSON.stringify(turma.teachers[0], null, 2));
      }

      res.status(200).json({ success: true, data: turma });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const turma = await ClassService.update(req.params.id, req.body);
      if (!turma) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Turma não encontrada' },
        });
      }
      res.status(200).json({ success: true, data: turma });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ClassService.delete(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Turma não encontrada' },
        });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addTeacherToClass(req, res, next) {
    try {
      const { id, teacherId, disciplineId } = req.params;
      const association = await ClassService.addTeacherToClass(id, teacherId, disciplineId);
      res.status(201).json({ success: true, data: association });
    } catch (error) {
      next(error);
    }
  }

  async removeTeacherFromClass(req, res, next) {
    try {
      const { id, teacherId, disciplineId } = req.params;
      const result = await ClassService.removeTeacherFromClass(id, teacherId, disciplineId);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Associação não encontrada' },
        });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addStudentToClass(req, res, next) {
    try {
      const { id, studentId } = req.params;
      const association = await ClassService.addStudentToClass(id, studentId);
      res.status(201).json({ success: true, data: association });
    } catch (error) {
      next(error);
    }
  }

  async removeStudentFromClass(req, res, next) {
    try {
      const { id, studentId } = req.params;
      const result = await ClassService.removeStudentFromClass(id, studentId);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Associação não encontrada' },
        });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getStudentsByClass(req, res, next) {
    try {
      const { id } = req.params;
      const students = await ClassService.getStudentsByClass(id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  async getTeachersByClass(req, res, next) {
    try {
      const { id } = req.params;
      const data = await ClassService.getTeachersByClass(id);
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassController();
