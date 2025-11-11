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
   * Lista todos os Disciplinas.
   * @returns {Promise<Discipline[]>} Uma lista de Disciplinas.
   */
  async list() {
    return Discipline.findAll();
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
