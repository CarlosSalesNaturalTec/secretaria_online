/**
 * Arquivo: backend/src/controllers/class.controller.js
 * Descrição: Controlador para o CRUD de Turma.
 * Feature: feat-035
 * Criado em: 29/10/2025
 */

const ClassService = require('../services/class.service');

class ClassController {
  async create(req, res, next) {
    try {
      const turma = await ClassService.create(req.body);
      res.status(201).json(turma);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const classs = await ClassService.list();
      res.status(200).json(classs);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const turma = await ClassService.getById(req.params.id);
      if (!turma) {
        return res.status(404).json({ message: 'Turma não encontrada' });
      }
      res.status(200).json(turma);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const turma = await ClassService.update(req.params.id, req.body);
      if (!turma) {
        return res.status(404).json({ message: 'Turma não encontrada' });
      }
      res.status(200).json(turma);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ClassService.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Turma não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addTeacherToClass(req, res, next) {
    try {
      const { id } = req.params;
      const { teacherId, disciplineId } = req.body;
      const association = await ClassService.addTeacherToClass(id, teacherId, disciplineId);
      res.status(201).json(association);
    } catch (error) {
      next(error);
    }
  }

  async removeTeacherFromClass(req, res, next) {
    try {
      const { id, teacherId, disciplineId } = req.params;
      const result = await ClassService.removeTeacherFromClass(id, teacherId, disciplineId);
      if (!result) {
        return res.status(404).json({ message: 'Associação não encontrada' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassController();
