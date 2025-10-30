/**
 * Arquivo: backend/src/controllers/discipline.controller.js
 * Descrição: Controlador para o CRUD de disciplina.
 * Feature: feat-033
 * Criado em: 29/10/2025
 */

const DisciplineService = require('../services/discipline.service');

class DisciplineController {
  async create(req, res, next) {
    try {
      const discipline = await DisciplineService.create(req.body);
      res.status(201).json(discipline);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const disciplines = await DisciplineService.list();
      res.status(200).json(disciplines);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const discipline = await DisciplineService.getById(req.params.id);
      if (!discipline) {
        return res.status(404).json({ message: 'Disciplina não encontrado' });
      }
      res.status(200).json(discipline);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const discipline = await DisciplineService.update(req.params.id, req.body);
      if (!discipline) {
        return res.status(404).json({ message: 'Disciplina não encontrada' });
      }
      res.status(200).json(discipline);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await DisciplineService.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Disciplina não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DisciplineController();
