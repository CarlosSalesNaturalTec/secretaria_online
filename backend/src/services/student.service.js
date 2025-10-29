/**
 * Arquivo: backend/src/services/student.service.js
 * Descrição: Lógica de negócio para o CRUD de estudantes.
 * Feature: feat-030 - Criar StudentController e StudentService
 * Criado em: 28/10/2025
 */

const { User } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { generateProvisionalPassword } = require('../utils/generators');

class StudentService {
  /**
   * Cria um novo estudante.
   * @param {object} studentData - Dados do estudante.
   * @returns {Promise<User>} O estudante criado.
   * @throws {AppError} Se o CPF ou email já estiverem em uso.
   */
  async create(studentData) {
    const { email, cpf } = studentData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email já está em uso.', 409);
    }

    const existingCpf = await User.findOne({ where: { cpf } });
    if (existingCpf) {
        throw new AppError('CPF já está em uso.', 409);
    }

    const temporaryPassword = generateProvisionalPassword();
    
    const student = await User.create({
      ...studentData,
      role: 'student',
      password: temporaryPassword,
    });

    return student;
  }

  /**
   * Lista todos os estudantes.
   * @returns {Promise<User[]>} Uma lista de estudantes.
   */
  async getAll() {
    return User.findAll({ where: { role: 'student' } });
  }

  /**
   * Busca um estudante pelo ID.
   * @param {number} id - ID do estudante.
   * @returns {Promise<User>} O estudante encontrado.
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async getById(id) {
    const student = await User.findOne({ where: { id, role: 'student' } });
    if (!student) {
      throw new AppError('Estudante não encontrado.', 404);
    }
    return student;
  }

  /**
   * Atualiza um estudante.
   * @param {number} id - ID do estudante.
   * @param {object} studentData - Dados do estudante a serem atualizados.
   * @returns {Promise<User>} O estudante atualizado.
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async update(id, studentData) {
    const student = await this.getById(id);
    await student.update(studentData);
    return student;
  }

  /**
   * Deleta um estudante.
   * @param {number} id - ID do estudante.
   * @returns {Promise<void>}
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async delete(id) {
    const student = await this.getById(id);
    await student.destroy();
  }

  /**
   * Reseta a senha de um estudante.
   * @param {number} id - ID do estudante.
   * @returns {Promise<string>} A nova senha provisória.
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async resetPassword(id) {
    const student = await this.getById(id);
    const temporaryPassword = generateProvisionalPassword();
    student.password = temporaryPassword;
    await student.save();
    return temporaryPassword;
  }
}

module.exports = new StudentService();
