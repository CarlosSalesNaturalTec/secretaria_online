/**
 * Arquivo: backend/src/services/discipline.service.js
 * Descrição: Lógica de negócio para o CRUD de Disciplinas
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const { Discipline } = require('../models');

class DisciplineService {
  /**
   * Cria um novo Disciplina.
   * @param {object} disciplineData - Dados do Disciplina.
   * @returns {Promise<Discipline>} O Disciplina criado.
   */
  async create(disciplineData) {
    const discipline = await Discipline.create({
      ...disciplineData,
    });

    return { ...discipline.toJSON() };
  }

  /**
   * Lista todos os Disciplinas com paginação e busca.
   * @param {object} options - Opções de paginação e filtros
   * @param {number} options.page - Número da página (padrão: 1)
   * @param {number} options.limit - Itens por página (padrão: 10)
   * @param {string} options.search - Termo de busca no nome da disciplina (opcional)
   * @returns {Promise<{data: Discipline[], total: number, page: number, limit: number, totalPages: number}>}
   */
  async list(options = {}) {
    const { page = 1, limit = 10, search = '' } = options;

    // Calcula offset para paginação
    const offset = (page - 1) * limit;

    // Monta condições de busca
    const where = {};
    if (search && search.trim()) {
      const { Op } = require('sequelize');
      where.name = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    // Busca com paginação
    const { count, rows } = await Discipline.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });

    // Calcula total de páginas
    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    };
  }

  /**
   * Busca um Disciplina pelo ID.
   * @param {number} id - O ID do Disciplina.
   * @returns {Promise<Discipline>} O Disciplina encontrado.
   */
  async getById(id) {
    return Discipline.findOne({ where: { id } });
  }

  /**
   * Atualiza um Disciplina.
   * @param {number} id - O ID do Disciplina.
   * @param {object} disciplineData - Dados do Disciplina a serem atualizados.
   * @returns {Promise<Discipline>} O Disciplina atualizado.
   */
  async update(id, disciplineData) {
    const discipline = await this.getById(id);
    if (!discipline) {
      return null;
    }

    await discipline.update(disciplineData);
    return discipline;
  }

  /**
   * Deleta um Disciplina.
   * @param {number} id - O ID do Disciplina.
   * @returns {Promise<boolean>} True se o Disciplina foi deletado.
   */
  async delete(id) {
    const discipline = await this.getById(id);
    if (!discipline) {
      return false;
    }

    await discipline.destroy();
    return true;
  }
}

module.exports = new DisciplineService();
