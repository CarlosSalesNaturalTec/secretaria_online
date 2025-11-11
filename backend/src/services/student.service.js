/**
 * Arquivo: backend/src/services/student.service.js
 * Descrição: Lógica de negócio para o CRUD de estudantes.
 * Feature: feat-030 - Criar StudentController e StudentService
 * Feature: feat-060 - Integrar envio de email na criação de aluno
 * Criado em: 28/10/2025
 * Atualizado em: 2025-11-03
 */

const { User } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { generateProvisionalPassword } = require('../utils/generators');
const EmailService = require('./email.service');
const logger = require('../utils/logger');

class StudentService {
  /**
   * Cria um novo estudante e envia email com senha provisória.
   *
   * @param {object} studentData - Dados do estudante (obrigatório incluir campos condicionais).
   * @param {string} studentData.name - Nome completo do estudante.
   * @param {string} studentData.email - Email do estudante.
   * @param {string} studentData.cpf - CPF do estudante (11 dígitos).
   * @param {string} studentData.login - Login de acesso do estudante.
   * @param {string} studentData.rg - RG do estudante.
   * @param {string} studentData.voter_title - Título de eleitor (obrigatório).
   * @param {string} studentData.reservist - Número de reservista (obrigatório).
   * @param {string} studentData.mother_name - Nome da mãe (obrigatório).
   * @param {string} studentData.father_name - Nome do pai (obrigatório).
   * @param {string} studentData.address - Endereço residencial (obrigatório).
   * @returns {Promise<User>} O estudante criado.
   * @throws {AppError} Se o CPF ou email já estiverem em uso ou campos obrigatórios faltarem.
   */
  async create(studentData) {
    const { email, cpf, name, login, voter_title, reservist, mother_name, father_name, address } = studentData;

    // Validação de campos obrigatórios extras para alunos
    const requiredFields = {
      voter_title: 'Título de eleitor',
      reservist: 'Número de reservista',
      mother_name: 'Nome da mãe',
      father_name: 'Nome do pai',
      address: 'Endereço',
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!studentData[field] || (typeof studentData[field] === 'string' && !studentData[field].trim())) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(`Os seguintes campos são obrigatórios para alunos: ${missingFields.join(', ')}`, 400);
    }

    // Validação de unicidade de email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email já cadastrado no sistema', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Validação de unicidade de CPF
    const existingCpf = await User.findOne({ where: { cpf } });
    if (existingCpf) {
      throw new AppError('CPF já cadastrado no sistema', 409, 'CPF_ALREADY_EXISTS');
    }

    // Validação de unicidade de login
    const existingLogin = await User.findOne({ where: { login } });
    if (existingLogin) {
      throw new AppError('Login já cadastrado no sistema', 409, 'LOGIN_ALREADY_EXISTS');
    }

    // Geração de senha provisória
    const temporaryPassword = generateProvisionalPassword();

    // Criação do estudante no banco de dados
    const student = await User.create({
      ...studentData,
      role: 'student',
      password: temporaryPassword,
    });

    logger.info('[STUDENT_SERVICE] Estudante criado com sucesso', {
      studentId: student.id,
      email: student.email,
      name: student.name,
    });

    // Envio de email com senha provisória
    // O envio do email NÃO bloqueia a criação do aluno
    // Se falhar, o aluno é criado normalmente e um log de erro é registrado
    try {
      await EmailService.sendPasswordEmail(email, temporaryPassword, {
        name,
        login,
      });

      logger.info('[STUDENT_SERVICE] Email de senha provisória enviado com sucesso', {
        studentId: student.id,
        email: student.email,
      });
    } catch (emailError) {
      // Log de erro mas não interrompe o fluxo
      logger.error('[STUDENT_SERVICE] Erro ao enviar email de senha provisória', {
        studentId: student.id,
        email: student.email,
        error: emailError.message,
      });

      // NOTA: O aluno foi criado com sucesso, mas o email falhou
      // A secretaria pode reenviar a senha manualmente se necessário
    }

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
   * Reseta a senha de um estudante e envia email com nova senha provisória.
   *
   * Este método é chamado quando um administrador regenera a senha
   * de um aluno através da funcionalidade de reset de senha.
   *
   * @param {number} id - ID do estudante.
   * @returns {Promise<string>} A nova senha provisória.
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async resetPassword(id) {
    const student = await this.getById(id);
    const temporaryPassword = generateProvisionalPassword();
    student.password = temporaryPassword;
    await student.save();

    logger.info('[STUDENT_SERVICE] Senha do estudante resetada com sucesso', {
      studentId: student.id,
      email: student.email,
    });

    // Envio de email com nova senha provisória
    // Se falhar, a senha é resetada normalmente mas o email não é enviado
    try {
      await EmailService.sendPasswordEmail(student.email, temporaryPassword, {
        name: student.name,
        login: student.login,
      });

      logger.info('[STUDENT_SERVICE] Email de reset de senha enviado com sucesso', {
        studentId: student.id,
        email: student.email,
      });
    } catch (emailError) {
      logger.error('[STUDENT_SERVICE] Erro ao enviar email de reset de senha', {
        studentId: student.id,
        email: student.email,
        error: emailError.message,
      });

      // NOTA: A senha foi resetada com sucesso, mas o email falhou
      // A secretaria deve informar a senha manualmente ao aluno
    }

    return temporaryPassword;
  }
}

module.exports = new StudentService();
