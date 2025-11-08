/**
 * Arquivo: backend/src/controllers/student.controller.js
 * Descrição: Controlador para o CRUD de estudantes.
 * Feature: feat-030 - Criar StudentController e StudentService
 * Criado em: 28/10/2025
 */

const StudentService = require('../services/student.service');
const { validationResult } = require('express-validator');

class StudentController {
  /**
   * Cria um novo estudante.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const student = await StudentService.create(req.body);
      return res.status(201).json({
        success: true,
        data: student,
        message: 'Estudante criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todos os estudantes.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async getAll(req, res, next) {
    try {
      const students = await StudentService.getAll();
      return res.json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca um estudante pelo ID.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await StudentService.getById(id);
      return res.json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um estudante.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const student = await StudentService.update(id, req.body);
      return res.json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta um estudante.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await StudentService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reseta a senha de um estudante.
   * @param {import('express').Request} req - A requisição.
   * @param {import('express').Response} res - A resposta.
   * @param {import('express').NextFunction} next - O próximo middleware.
   */
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const temporaryPassword = await StudentService.resetPassword(id);
      return res.json({ success: true, data: { temporaryPassword } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
