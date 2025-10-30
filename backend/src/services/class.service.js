/**
 * Arquivo: backend/src/services/class.service.js
 * Descrição: Lógica de negócio para o CRUD de Turmas
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const { Class } = require('../models');

class ClassService {
  /**
   * Cria um novo Turma.
   * @param {object} classData - Dados do Turma.
   * @returns {Promise<Class>} O Turma criado.
   */
  async create(classData) {
    const classes = await Class.create({
      ...classData,
    });

    return { ...classes.toJSON() };
  }

  /**
   * Lista todos os Turmas.
   * @returns {Promise<Class[]>} Uma lista de Turmas.
   */
  async list() {
    return Class.findAll();
  }

  /**
   * Busca um Turma pelo ID.
   * @param {number} id - O ID do Turma.
   * @returns {Promise<Class>} O Turma encontrado.
   */
  async getById(id) {
    return Class.findOne({
      where: { id },
    });
  }

  /**
   * Atualiza um Turma.
   * @param {number} id - O ID do Turma.
   * @param {object} classData - Dados do Turma a serem atualizados.
   * @returns {Promise<Class>} O Turma atualizado.
   */
  async update(id, classData) {
    const turma = await this.getById(id);
    if (!turma) {
      return null;
    }

    await turma.update(classData);
    return turma;
  }

  /**
   * Deleta um Turma.
   * @param {number} id - O ID do Turma.
   * @returns {Promise<boolean>} True se o Turma foi deletado.
   */
  async delete(id) {
    const turma = await this.getById(id);
    if (!turma) {
      return false;
    }

    await turma.destroy();
    return true;
  }
}

module.exports = new ClassService();
