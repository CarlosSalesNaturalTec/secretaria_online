/**
 * Arquivo: backend/src/services/teacher.service.js
 * Descrição: Lógica de negócio para o CRUD de professores.
 * Feature: feat-032 - Criar TeacherController, TeacherService e rotas
 * Feature: feat-100 - Padronizar criação de professores com campos condicionais
 * Criado em: 28/10/2025
 * Atualizado em: 2025-11-08
 */

const { User } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { generateProvisionalPassword } = require('../utils/generators');
const EmailService = require('./email.service');
const logger = require('../utils/logger');

class TeacherService {
  /**
   * Cria um novo professor e envia email com senha provisória.
   *
   * @param {object} teacherData - Dados do professor (obrigatório incluir campos condicionais).
   * @param {string} teacherData.name - Nome completo do professor.
   * @param {string} teacherData.email - Email do professor.
   * @param {string} teacherData.cpf - CPF do professor (11 dígitos).
   * @param {string} teacherData.login - Login de acesso do professor.
   * @param {string} teacherData.rg - RG do professor.
   * @param {string} teacherData.voter_title - Título de eleitor (obrigatório).
   * @param {string} teacherData.reservist - Número de reservista (obrigatório).
   * @param {string} teacherData.mother_name - Nome da mãe (obrigatório).
   * @param {string} teacherData.father_name - Nome do pai (obrigatório).
   * @param {string} teacherData.address - Endereço residencial (obrigatório).
   * @returns {Promise<User>} O professor criado.
   * @throws {AppError} Se o CPF ou email já estiverem em uso ou campos obrigatórios faltarem.
   */
  async create(teacherData) {
    const { email, cpf, name, login } = teacherData;

    // Validação de campos obrigatórios extras para professores
    const requiredFields = {
      voter_title: 'Título de eleitor',
      reservist: 'Número de reservista',
      mother_name: 'Nome da mãe',
      father_name: 'Nome do pai',
      address: 'Endereço',
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!teacherData[field] || (typeof teacherData[field] === 'string' && !teacherData[field].trim())) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(`Os seguintes campos são obrigatórios para professores: ${missingFields.join(', ')}`, 400);
    }

    // Validação de unicidade de email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email já está em uso.', 409);
    }

    // Validação de unicidade de CPF
    const existingCpf = await User.findOne({ where: { cpf } });
    if (existingCpf) {
      throw new AppError('CPF já está em uso.', 409);
    }

    // Validação de unicidade de login
    const existingLogin = await User.findOne({ where: { login } });
    if (existingLogin) {
      throw new AppError('Login já está em uso.', 409);
    }

    // Geração de senha provisória
    const temporaryPassword = generateProvisionalPassword({
      length: 10,
      numbers: true,
    });

    // Criação do professor no banco de dados
    const teacher = await User.create({
      ...teacherData,
      role: 'teacher',
      password: temporaryPassword,
    });

    logger.info('[TEACHER_SERVICE] Professor criado com sucesso', {
      teacherId: teacher.id,
      email: teacher.email,
      name: teacher.name,
    });

    // Envio de email com senha provisória
    // O envio do email NÃO bloqueia a criação do professor
    // Se falhar, o professor é criado normalmente e um log de erro é registrado
    try {
      await EmailService.sendPasswordEmail(email, temporaryPassword, {
        name,
        login,
      });

      logger.info('[TEACHER_SERVICE] Email de senha provisória enviado com sucesso', {
        teacherId: teacher.id,
        email: teacher.email,
      });
    } catch (emailError) {
      // Log de erro mas não interrompe o fluxo
      logger.error('[TEACHER_SERVICE] Erro ao enviar email de senha provisória', {
        teacherId: teacher.id,
        email: teacher.email,
        error: emailError.message,
      });

      // NOTA: O professor foi criado com sucesso, mas o email falhou
      // A secretaria pode reenviar a senha manualmente se necessário
    }

    return teacher;
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
