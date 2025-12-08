/**
 * Arquivo: backend/src/controllers/course.controller.js
 * Descrição: Controlador para o CRUD de curso.
 * Feature: feat-035
 * Criado em: 29/10/2025
 */

const CourseService = require('../services/course.service');

class CourseController {
  async create(req, res, next) {
    try {
      const course = await CourseService.create(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await CourseService.list({ page, limit, search });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const course = await CourseService.getById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Curso não encontrado' },
        });
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const course = await CourseService.update(req.params.id, req.body);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Curso não encontrado' },
        });
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await CourseService.delete(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Curso não encontrado' },
        });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addDisciplineToCourse(req, res, next) {
    try {
      const { id } = req.params;
      const { disciplineId, semester } = req.body;
      const association = await CourseService.addDisciplineToCourse(id, disciplineId, semester);
      res.status(201).json({ success: true, data: association });
    } catch (error) {
      next(error);
    }
  }

  async removeDisciplineFromCourse(req, res, next) {
    try {
      const { id, disciplineId } = req.params;
      const result = await CourseService.removeDisciplineFromCourse(id, disciplineId);
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

  async getCourseDisciplines(req, res, next) {
    try {
      const { id } = req.params;
      const disciplines = await CourseService.getCourseDisciplines(id);
      res.status(200).json({ success: true, data: disciplines });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
