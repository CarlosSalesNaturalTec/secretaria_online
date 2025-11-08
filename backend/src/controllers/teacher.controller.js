/**
 * Arquivo: backend/src/controllers/teacher.controller.js
 * Descrição: Controlador para o CRUD de professores.
 * Feature: feat-032 - Criar TeacherController, TeacherService e rotas
 * Criado em: 29/10/2025
 */

const TeacherService = require('../services/teacher.service');

class TeacherController {
  async create(req, res, next) {
    try {
      const teacher = await TeacherService.create(req.body);
      res.status(201).json({
        success: true,
        data: teacher,
        message: 'Professor criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const teachers = await TeacherService.list();
      res.status(200).json({ success: true, data: teachers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const teacher = await TeacherService.getById(req.params.id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Professor não encontrado' },
        });
      }
      res.status(200).json({ success: true, data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const teacher = await TeacherService.update(req.params.id, req.body);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Professor não encontrado' },
        });
      }
      res.status(200).json({ success: true, data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await TeacherService.delete(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Professor não encontrado' },
        });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();
