/**
 * Arquivo: backend/src/services/course.service.js
 * Descrição: Lógica de negócio para o CRUD de Cursos
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const { Course, Discipline, CourseDiscipline } = require('../models');

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
   * Lista todos os Cursos com paginação.
   * @param {Object} options - Opções de paginação e busca
   * @param {number} options.page - Número da página (padrão: 1)
   * @param {number} options.limit - Limite de registros por página (padrão: 10)
   * @param {string} options.search - Termo de busca (opcional)
   * @returns {Promise<Object>} Objeto com dados paginados e metadados
   */
  async list(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
    } = options;

    const offset = (page - 1) * limit;

    // Construir condições de busca
    const where = {};
    if (search) {
      where.name = {
        [require('sequelize').Op.like]: `%${search}%`,
      };
    }

    // Buscar cursos com paginação
    const { count, rows } = await Course.findAndCountAll({
      where,
      include: [{ model: Discipline, as: 'disciplines' }],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['name', 'ASC']],
      distinct: true, // Para contar corretamente com includes
    });

    return {
      data: rows,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Busca um Curso pelo ID.
   * @param {number} id - O ID do Curso.
   * @returns {Promise<Course>} O Curso encontrado.
   */
  async getById(id) {
    return Course.findOne({
      where: { id },
      include: [{ model: Discipline, as: 'disciplines' }],
    });
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

  /**
   * Adiciona uma disciplina a um curso.
   * @param {number} courseId - O ID do curso.
   * @param {number} disciplineId - O ID da disciplina.
   * @param {number} semester - O semestre em que a disciplina é ofertada.
   * @returns {Promise<CourseDiscipline>} A associação criada.
   */
  async addDisciplineToCourse(courseId, disciplineId, semester) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Curso não encontrado');
    }

    const discipline = await Discipline.findByPk(disciplineId);
    if (!discipline) {
      throw new Error('Disciplina não encontrada');
    }

    return CourseDiscipline.create({
      course_id: courseId,
      discipline_id: disciplineId,
      semester,
    });
  }

  /**
   * Remove uma disciplina de um curso.
   * @param {number} courseId - O ID do curso.
   * @param {number} disciplineId - O ID da disciplina.
   * @returns {Promise<boolean>} True se a associação foi removida.
   */
  async removeDisciplineFromCourse(courseId, disciplineId) {
    const result = await CourseDiscipline.destroy({
      where: {
        course_id: courseId,
        discipline_id: disciplineId,
      },
    });

    return result > 0;
  }

  /**
   * Lista todas as disciplinas de um curso.
   * @param {number} courseId - O ID do curso.
   * @returns {Promise<Discipline[]>} Lista de disciplinas com informações do semestre.
   */
  async getCourseDisciplines(courseId) {
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Discipline,
        as: 'disciplines',
        through: {
          attributes: ['semester']
        }
      }]
    });

    if (!course) {
      throw new Error('Curso não encontrado');
    }

    return course.disciplines;
  }
}

module.exports = new CourseService();
