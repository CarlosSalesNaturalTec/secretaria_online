/**
 * Arquivo: backend/src/services/teacher.service.js
 * Descrição: Lógica de negócio para o CRUD de Cursoes
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const { Course } = require('../models');

class CourseService {
  /**
   * Cria um novo Curso.
   * @param {object} courseData - Dados do Curso.
   * @returns {Promise<Course>} O Curso criado.
   */
  async create(courseData) {
    const course = await Course.create({
      ...courseData,
    });

    return { ...course.toJSON() };
  }

  /**
   * Lista todos os Cursos.
   * @returns {Promise<Course[]>} Uma lista de Cursos.
   */
  async list() {
    return Course.findAll();
  }

  /**
   * Busca um Curso pelo ID.
   * @param {number} id - O ID do Curso.
   * @returns {Promise<Course>} O Curso encontrado.
   */
  async getById(id) {
    return Course.findOne({ where: { id } });
  }

  /**
   * Atualiza um Curso.
   * @param {number} id - O ID do Curso.
   * @param {object} courseData - Dados do Curso a serem atualizados.
   * @returns {Promise<Course>} O Curso atualizado.
   */
  async update(id, courseData) {
    const course = await this.getById(id);
    if (!course) {
      return null;
    }

    // Impede a alteração do papel do usuário
    delete courseData.role;

    await course.update(courseData);
    return course;
  }

  /**
   * Deleta um Curso.
   * @param {number} id - O ID do Curso.
   * @returns {Promise<boolean>} True se o Curso foi deletado.
   */
  async delete(id) {
    const course = await this.getById(id);
    if (!course) {
      return false;
    }

    await course.destroy();
    return true;
  }
}

module.exports = new CourseService();
