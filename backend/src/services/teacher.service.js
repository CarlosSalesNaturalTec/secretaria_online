/**
 * Arquivo: backend/src/services/teacher.service.js
 * Descrição: Lógica de negócio para o CRUD de professores.
 * Feature: feat-032 - Criar TeacherController, TeacherService e rotas
 * Feature: feat-110 - Separar tabela de professores
 * Criado em: 28/10/2025
 * Atualizado em: 2025-12-02
 */

const { Teacher, User } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { generateProvisionalPassword } = require('../utils/generators');
const EmailService = require('./email.service');
const logger = require('../utils/logger');

class TeacherService {
  /**
   * Cria um novo professor na tabela teachers.
   * NÃO cria usuário automaticamente - isso deve ser feito via createUserForTeacher().
   *
   * @param {object} teacherData - Dados do professor.
   * @param {string} teacherData.nome - Nome completo do professor.
   * @param {string} teacherData.email - Email do professor.
   * @param {string} teacherData.cpf - CPF do professor.
   * @param {string} teacherData.data_nascimento - Data de nascimento.
   * @param {number} teacherData.sexo - Sexo (1=masculino, 2=feminino).
   * @returns {Promise<Teacher>} O professor criado.
   * @throws {AppError} Se o CPF ou email já estiverem em uso.
   */
  async create(teacherData) {
    const { email, cpf } = teacherData;

    // Validação de unicidade de email (na tabela teachers)
    // Verifica apenas professores ATIVOS (não deletados)
    if (email) {
      const existingEmail = await Teacher.findOne({
        where: { email },
        paranoid: true // Busca apenas registros não deletados
      });
      if (existingEmail) {
        throw new AppError('Email já cadastrado no sistema', 409, 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Validação de unicidade de CPF (na tabela teachers)
    // Verifica apenas professores ATIVOS (não deletados)
    if (cpf) {
      const existingCpf = await Teacher.findOne({
        where: { cpf },
        paranoid: true // Busca apenas registros não deletados
      });
      if (existingCpf) {
        throw new AppError('CPF já cadastrado no sistema', 409, 'CPF_ALREADY_EXISTS');
      }
    }

    // Criação do professor no banco de dados
    const teacher = await Teacher.create(teacherData);

    logger.info('[TEACHER_SERVICE] Professor criado com sucesso', {
      teacherId: teacher.id,
      email: teacher.email,
      nome: teacher.nome,
    });

    return teacher;
  }

  /**
   * Cria um usuário para um professor existente.
   * Verifica se o professor já possui um usuário antes de criar.
   *
   * @param {number} teacherId - ID do professor.
   * @param {object} userData - Dados adicionais do usuário (opcional).
   * @param {string} userData.login - Login personalizado (opcional, padrão: usar CPF).
   * @returns {Promise<{user: User, temporaryPassword: string}>} O usuário criado e a senha provisória.
   * @throws {AppError} Se o professor não for encontrado ou já possuir usuário.
   */
  async createUserForTeacher(teacherId, userData = {}) {
    // Buscar professor
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      throw new AppError('Professor não encontrado.', 404);
    }

    // Verificar se professor já possui usuário
    const existingUser = await User.findOne({ where: { teacher_id: teacherId } });
    if (existingUser) {
      throw new AppError('Este professor já possui um usuário cadastrado.', 409, 'USER_ALREADY_EXISTS');
    }

    // Validar dados obrigatórios do professor
    if (!teacher.nome || !teacher.cpf || !teacher.email) {
      throw new AppError(
        'Professor deve ter nome, CPF e email cadastrados antes de criar usuário.',
        400,
        'INCOMPLETE_TEACHER_DATA'
      );
    }

    // Gerar login se não fornecido (usar CPF como padrão)
    const login = userData.login || teacher.cpf.replace(/[^\d]/g, '');

    // Validar unicidade do login
    const existingLogin = await User.findOne({ where: { login } });
    if (existingLogin) {
      throw new AppError('Login já cadastrado no sistema', 409, 'LOGIN_ALREADY_EXISTS');
    }

    // Gerar senha provisória = CPF do professor
    const temporaryPassword = teacher.cpf.replace(/[^\d]/g, '');

    // Criar usuário vinculado ao professor
    const user = await User.create({
      role: 'teacher',
      name: teacher.nome,
      email: teacher.email,
      login,
      password: temporaryPassword,
      cpf: teacher.cpf,
      rg: teacher.rg || null,
      voter_title: teacher.titulo_eleitor || null,
      reservist: null, // Campo opcional para teachers role
      mother_name: teacher.mae || null,
      father_name: teacher.pai || null,
      address: teacher.getFullAddress() || null,
      teacher_id: teacherId,
    });

    logger.info('[TEACHER_SERVICE] Usuário criado para professor', {
      teacherId: teacher.id,
      userId: user.id,
      email: user.email,
      login: user.login,
    });

    // Enviar email com senha provisória
    try {
      await EmailService.sendPasswordEmail(teacher.email, temporaryPassword, {
        name: teacher.nome,
        login,
      });

      logger.info('[TEACHER_SERVICE] Email de senha provisória enviado com sucesso', {
        teacherId: teacher.id,
        userId: user.id,
        email: teacher.email,
      });
    } catch (emailError) {
      logger.error('[TEACHER_SERVICE] Erro ao enviar email de senha provisória', {
        teacherId: teacher.id,
        userId: user.id,
        email: teacher.email,
        error: emailError.message,
      });
    }

    return { user, temporaryPassword };
  }

  /**
   * Lista todos os professores.
   * @returns {Promise<Teacher[]>} Uma lista de professores.
   */
  async list() {
    return Teacher.findAll({
      order: [['nome', 'ASC']],
    });
  }

  /**
   * Busca um professor pelo ID.
   * @param {number} id - O ID do professor.
   * @returns {Promise<Teacher>} O professor encontrado.
   */
  async getById(id) {
    return Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'login', 'email', 'role', 'created_at'],
        },
      ],
    });
  }

  /**
   * Atualiza um professor.
   * @param {number} id - O ID do professor.
   * @param {object} teacherData - Dados do professor a serem atualizados.
   * @returns {Promise<Teacher>} O professor atualizado.
   */
  async update(id, teacherData) {
    const teacher = await this.getById(id);
    if (!teacher) {
      return null;
    }

    const { email, cpf } = teacherData;

    // Validação de unicidade de email (exceto o próprio professor)
    // Verifica apenas professores ATIVOS (não deletados)
    if (email && email !== teacher.email) {
      const existingEmail = await Teacher.findOne({
        where: { email },
        paranoid: true // Busca apenas registros não deletados
      });
      if (existingEmail && existingEmail.id !== teacher.id) {
        throw new AppError('Email já cadastrado no sistema', 409, 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Validação de unicidade de CPF (exceto o próprio professor)
    // Verifica apenas professores ATIVOS (não deletados)
    if (cpf && cpf !== teacher.cpf) {
      const existingCpf = await Teacher.findOne({
        where: { cpf },
        paranoid: true // Busca apenas registros não deletados
      });
      if (existingCpf && existingCpf.id !== teacher.id) {
        throw new AppError('CPF já cadastrado no sistema', 409, 'CPF_ALREADY_EXISTS');
      }
    }

    await teacher.update(teacherData);
    return teacher;
  }

  /**
   * Deleta um professor (soft delete).
   * @param {number} id - O ID do professor.
   * @returns {Promise<boolean>} True se o professor foi deletado.
   */
  async delete(id) {
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return false;
    }

    await teacher.destroy();
    return true;
  }

  /**
   * Reseta a senha de um professor e envia email com nova senha provisória.
   *
   * Este método é chamado quando um administrador regenera a senha
   * de um professor através da funcionalidade de reset de senha.
   *
   * @param {number} teacherId - ID do professor (na tabela teachers).
   * @returns {Promise<string>} A nova senha provisória.
   * @throws {AppError} Se o professor não for encontrado ou não possuir usuário.
   */
  async resetPassword(teacherId) {
    // Buscar professor
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      throw new AppError('Professor não encontrado', 404);
    }

    // Buscar usuário vinculado ao professor
    const user = await User.findOne({ where: { teacher_id: teacherId } });
    if (!user) {
      throw new AppError('Professor não possui usuário cadastrado', 404);
    }

    const temporaryPassword = generateProvisionalPassword();
    user.password = temporaryPassword;
    await user.save();

    logger.info('[TEACHER_SERVICE] Senha do professor resetada com sucesso', {
      teacherId: teacher.id,
      userId: user.id,
      email: teacher.email,
    });

    // Envio de email com nova senha provisória
    // Se falhar, a senha é resetada normalmente mas o email não é enviado
    try {
      await EmailService.sendPasswordEmail(teacher.email, temporaryPassword, {
        name: teacher.nome,
        login: user.login,
      });

      logger.info('[TEACHER_SERVICE] Email de reset de senha enviado com sucesso', {
        teacherId: teacher.id,
        userId: user.id,
        email: teacher.email,
      });
    } catch (emailError) {
      logger.error('[TEACHER_SERVICE] Erro ao enviar email de reset de senha', {
        teacherId: teacher.id,
        userId: user.id,
        email: teacher.email,
        error: emailError.message,
      });

      // NOTA: A senha foi resetada com sucesso, mas o email falhou
      // A secretaria deve informar a senha manualmente ao professor
    }

    return temporaryPassword;
  }
}

module.exports = new TeacherService();
