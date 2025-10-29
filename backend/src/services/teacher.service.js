/**
 * Arquivo: backend/src/services/teacher.service.js
 * Descrição: Lógica de negócio para o CRUD de professores.
 * Feature: feat-032 - Criar TeacherController, TeacherService e rotas
 * Criado em: 28/10/2025
 */

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { generateProvisionalPassword } = require('../utils/generators');

class TeacherService {
  /**
   * Cria um novo professor.
   * @param {object} teacherData - Dados do professor.
   * @returns {Promise<User>} O professor criado.
   */
  async create(teacherData) {
    const temporaryPassword = generateProvisionalPassword({
      length: 10,
      numbers: true,
    });

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const teacher = await User.create({
      ...teacherData,
      role: 'teacher',
      password: hashedPassword,
    });

    // Em um cenário real, a senha temporária seria enviada por e-mail.
    // Por enquanto, vamos retorná-la para fins de teste.
    return { ...teacher.toJSON(), temporaryPassword };
  }

  /**
   * Lista todos os professores.
   * @returns {Promise<User[]>} Uma lista de professores.
   */
  async list() {
    return User.findAll({ where: { role: 'teacher' } });
  }

  /**
   * Busca um professor pelo ID.
   * @param {number} id - O ID do professor.
   * @returns {Promise<User>} O professor encontrado.
   */
  async getById(id) {
    return User.findOne({ where: { id, role: 'teacher' } });
  }

  /**
   * Atualiza um professor.
   * @param {number} id - O ID do professor.
   * @param {object} teacherData - Dados do professor a serem atualizados.
   * @returns {Promise<User>} O professor atualizado.
   */
  async update(id, teacherData) {
    const teacher = await this.getById(id);
    if (!teacher) {
      return null;
    }

    // Impede a alteração do papel do usuário
    delete teacherData.role;

    await teacher.update(teacherData);
    return teacher;
  }

  /**
   * Deleta um professor.
   * @param {number} id - O ID do professor.
   * @returns {Promise<boolean>} True se o professor foi deletado.
   */
  async delete(id) {
    const teacher = await this.getById(id);
    if (!teacher) {
      return false;
    }

    await teacher.destroy();
    return true;
  }
}

module.exports = new TeacherService();
