/**
 * Arquivo: backend/src/services/class.service.js
 * Descrição: Lógica de negócio para o CRUD de Turmas
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const { Class, User, Discipline, ClassTeacher } = require('../models');

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

  /**
   * Adiciona um Profesor + Disciplina a uma Turma.
   * @param {number} id - O ID da Turma.
   * @param {number} teacherId - O ID do professor.
   * @param {number} disciplineId - O ID da discplina.
   * @returns {Promise<ClassTeacher>} A associação criada.
   */
  async addTeacherToClass(id, teacherId, disciplineId) {
    const turma = await Class.findOne({
      where: { id },
    });
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    const teacher = await User.findOne({ where: { id: teacherId, role: 'teacher' } });
    if (!teacher) {
      throw new Error('Professor não encontrado');
    }

    const discipline = await Discipline.findByPk(disciplineId);
    if (!discipline) {
      throw new Error('Disciplina não encontrada');
    }

    return ClassTeacher.create({
      class_id: classId,
      teacher_id: teacherId,
      discipline_id: disciplineId,
    });
  }

  /**
   * Remove professor/disciplina da turma.
   * @param {number} classId - O ID da turma.
   * @param {number} teacherId - O ID do professor.
   * @param {number} disciplineId - O ID da disciplina.
   * @returns {Promise<boolean>} True se a associação foi removida.
   */
  async removeTeacherFromClass(classId, teacherId, disciplineId) {
    const result = await ClassTeacher.destroy({
      where: {
        class_id: classId,
        teacher_id: teacherId,
        discipline_id: disciplineId,
      },
    });

    return result > 0;
  }
}

module.exports = new ClassService();
