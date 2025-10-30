/**
 * Arquivo: backend/src/controllers/course.controller.js
 * Descrição: Controlador para o CRUD de curso.
 * Feature: feat-033
 * Criado em: 29/10/2025
 */

const CourseService = require('../services/course.service');

class CourseController {
  async create(req, res, next) {
    try {
      const course = await CourseService.create(req.body);
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const courses = await CourseService.list();
      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const course = await CourseService.getById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Professor não encontrado' });
      }
      res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const course = await CourseService.update(req.params.id, req.body);
      if (!course) {
        return res.status(404).json({ message: 'Professor não encontrado' });
      }
      res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await CourseService.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Professor não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
