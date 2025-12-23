/**
 * Arquivo: backend/src/services/student.service.js
 * Descrição: Lógica de negócio para o CRUD de estudantes.
 * Feature: feat-030 - Criar StudentController e StudentService
 * Feature: feat-060 - Integrar envio de email na criação de aluno
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 28/10/2025
 * Atualizado em: 2025-12-01
 */

const { Student, User, Enrollment, Course } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { generateProvisionalPassword } = require('../utils/generators');
const EmailService = require('./email.service');
const logger = require('../utils/logger');

class StudentService {
  /**
   * Cria um novo estudante na tabela students.
   * NÃO cria usuário automaticamente - isso deve ser feito via createUserForStudent().
   *
   * @param {object} studentData - Dados do estudante.
   * @param {string} studentData.nome - Nome completo do estudante.
   * @param {string} studentData.email - Email do estudante.
   * @param {string} studentData.cpf - CPF do estudante.
   * @param {string} studentData.data_nascimento - Data de nascimento.
   * @param {number} studentData.sexo - Sexo (1=masculino, 2=feminino).
   * @returns {Promise<Student>} O estudante criado.
   * @throws {AppError} Se o CPF ou email já estiverem em uso.
   */
  async create(studentData) {
    const { email, cpf } = studentData;

    // Validação de unicidade de email (na tabela students)
    if (email) {
      const existingEmail = await Student.findOne({ where: { email } });
      if (existingEmail) {
        throw new AppError('Email já cadastrado no sistema', 409, 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Validação de unicidade de CPF (na tabela students)
    if (cpf) {
      const existingCpf = await Student.findOne({ where: { cpf } });
      if (existingCpf) {
        throw new AppError('CPF já cadastrado no sistema', 409, 'CPF_ALREADY_EXISTS');
      }
    }

    // Criação do estudante no banco de dados
    const student = await Student.create(studentData);

    logger.info('[STUDENT_SERVICE] Estudante criado com sucesso', {
      studentId: student.id,
      email: student.email,
      nome: student.nome,
    });

    return student;
  }

  /**
   * Cria um usuário para um estudante existente.
   * Verifica se o estudante já possui um usuário antes de criar.
   *
   * @param {number} studentId - ID do estudante.
   * @param {object} userData - Dados adicionais do usuário (opcional).
   * @param {string} userData.login - Login personalizado (opcional, padrão: usar matrícula).
   * @returns {Promise<{user: User, temporaryPassword: string}>} O usuário criado e a senha provisória.
   * @throws {AppError} Se o estudante não for encontrado ou já possuir usuário.
   */
  async createUserForStudent(studentId, userData = {}) {
    // Buscar estudante
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new AppError('Estudante não encontrado.', 404);
    }

    // Verificar se estudante já possui usuário
    const existingUser = await User.findOne({ where: { student_id: studentId } });
    if (existingUser) {
      throw new AppError('Este estudante já possui um usuário cadastrado.', 409, 'USER_ALREADY_EXISTS');
    }

    // Validar dados obrigatórios do estudante (apenas nome e matrícula)
    if (!student.nome) {
      throw new AppError(
        'Estudante deve ter nome cadastrado antes de criar usuário.',
        400,
        'STUDENT_NAME_REQUIRED'
      );
    }

    if (!student.matricula) {
      throw new AppError(
        'Estudante deve ter matrícula cadastrada antes de criar usuário.',
        400,
        'MATRICULA_REQUIRED'
      );
    }

    // Gerar login se não fornecido (usar matrícula como padrão - converter para string)
    const login = userData.login || String(student.matricula);

    // Validar unicidade do login
    const existingLogin = await User.findOne({ where: { login } });
    if (existingLogin) {
      throw new AppError('Login já cadastrado no sistema', 409, 'LOGIN_ALREADY_EXISTS');
    }

    // Gerar senha provisória = matrícula do estudante (converter para string)
    const temporaryPassword = String(student.matricula);

    // Criar usuário vinculado ao estudante
    const user = await User.create({
      role: 'student',
      name: student.nome,
      email: student.email || null, // Email é opcional
      login,
      password: temporaryPassword,
      student_id: studentId,
    });

    logger.info('[STUDENT_SERVICE] Usuário criado para estudante', {
      studentId: student.id,
      userId: user.id,
      email: user.email,
      login: user.login,
    });

    // Enviar email com senha provisória (apenas se email estiver cadastrado)
    if (student.email) {
      try {
        await EmailService.sendPasswordEmail(student.email, temporaryPassword, {
          name: student.nome,
          login,
        });

        logger.info('[STUDENT_SERVICE] Email de senha provisória enviado com sucesso', {
          studentId: student.id,
          userId: user.id,
          email: student.email,
        });
      } catch (emailError) {
        logger.error('[STUDENT_SERVICE] Erro ao enviar email de senha provisória', {
          studentId: student.id,
          userId: user.id,
          email: student.email,
          error: emailError.message,
        });
      }
    } else {
      logger.info('[STUDENT_SERVICE] Email não enviado - estudante sem email cadastrado', {
        studentId: student.id,
        userId: user.id,
      });
    }

    return { user, temporaryPassword };
  }

  /**
   * Lista todos os estudantes com seus usuários associados (se houver).
   * Suporta paginação e busca por nome.
   *
   * @param {object} options - Opções de listagem.
   * @param {number} options.page - Número da página (padrão: 1).
   * @param {number} options.limit - Limite de registros por página (padrão: 10).
   * @param {string} options.search - Termo de busca por nome (opcional).
   * @returns {Promise<{students: Student[], total: number, totalPages: number, currentPage: number}>}
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, search = '', matricula = '', status = '' } = options;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    // Construir condição de busca para Student
    const whereCondition = {};
    if (search && search.trim()) {
      whereCondition.nome = {
        [Op.like]: `%${search.trim()}%`,
      };
    }
    if (matricula && matricula.trim()) {
      whereCondition.matricula = {
        [Op.like]: `%${matricula.trim()}%`,
      };
    }

    // Construir condição de filtro para Enrollment
    const enrollmentWhere = {};
    if (status && status.trim()) {
      enrollmentWhere.status = status.trim();
    }

    const { count, rows } = await Student.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'login', 'email', 'role', 'created_at'],
        },
        {
          model: Enrollment,
          as: 'enrollments',
          where: Object.keys(enrollmentWhere).length > 0 ? enrollmentWhere : undefined,
          required: Object.keys(enrollmentWhere).length > 0,
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['nome', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    return {
      students: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
  }

  /**
   * Busca um estudante pelo ID com usuário associado.
   * @param {number} id - ID do estudante.
   * @returns {Promise<Student>} O estudante encontrado.
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async getById(id) {
    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'login', 'email', 'role', 'created_at'],
        },
      ],
    });
    if (!student) {
      throw new AppError('Estudante não encontrado.', 404);
    }
    return student;
  }

  /**
   * Atualiza um estudante.
   * @param {number} id - ID do estudante.
   * @param {object} studentData - Dados do estudante a serem atualizados.
   * @returns {Promise<Student>} O estudante atualizado.
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async update(id, studentData) {
    const student = await this.getById(id);

    // Validação de unicidade de email (se estiver sendo alterado)
    if (studentData.email && studentData.email !== student.email) {
      const existingEmail = await Student.findOne({
        where: { email: studentData.email },
      });
      if (existingEmail) {
        throw new AppError('Email já cadastrado no sistema', 409, 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Validação de unicidade de CPF (se estiver sendo alterado)
    if (studentData.cpf && studentData.cpf !== student.cpf) {
      const existingCpf = await Student.findOne({
        where: { cpf: studentData.cpf },
      });
      if (existingCpf) {
        throw new AppError('CPF já cadastrado no sistema', 409, 'CPF_ALREADY_EXISTS');
      }
    }

    await student.update(studentData);

    logger.info('[STUDENT_SERVICE] Estudante atualizado com sucesso', {
      studentId: student.id,
      email: student.email,
      nome: student.nome,
    });

    return student;
  }

  /**
   * Deleta um estudante (soft delete).
   * @param {number} id - ID do estudante.
   * @returns {Promise<void>}
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async delete(id) {
    const student = await this.getById(id);
    await student.destroy();

    logger.info('[STUDENT_SERVICE] Estudante deletado com sucesso', {
      studentId: id,
      nome: student.nome,
    });
  }

  /**
   * Reseta a senha de um usuário de estudante e envia email com nova senha provisória.
   *
   * Este método é chamado quando um administrador regenera a senha
   * de um aluno através da funcionalidade de reset de senha.
   *
   * @param {number} studentId - ID do estudante.
   * @returns {Promise<string>} A nova senha provisória.
   * @throws {AppError} Se o estudante não for encontrado ou não possuir usuário.
   */
  async resetPassword(studentId) {
    const student = await this.getById(studentId);

    // Buscar usuário do estudante
    const user = await User.findOne({ where: { student_id: studentId } });
    if (!user) {
      throw new AppError(
        'Este estudante não possui um usuário cadastrado. Crie um usuário primeiro.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const temporaryPassword = generateProvisionalPassword();
    user.password = temporaryPassword;
    await user.save();

    logger.info('[STUDENT_SERVICE] Senha do usuário do estudante resetada com sucesso', {
      studentId: student.id,
      userId: user.id,
      email: user.email,
    });

    // Envio de email com nova senha provisória
    try {
      await EmailService.sendPasswordEmail(student.email, temporaryPassword, {
        name: student.nome,
        login: user.login,
      });

      logger.info('[STUDENT_SERVICE] Email de reset de senha enviado com sucesso', {
        studentId: student.id,
        userId: user.id,
        email: student.email,
      });
    } catch (emailError) {
      logger.error('[STUDENT_SERVICE] Erro ao enviar email de reset de senha', {
        studentId: student.id,
        userId: user.id,
        email: student.email,
        error: emailError.message,
      });
    }

    return temporaryPassword;
  }

  /**
   * Verifica se um estudante possui usuário cadastrado.
   *
   * @param {number} studentId - ID do estudante.
   * @returns {Promise<{hasUser: boolean, user: User|null}>}
   * @throws {AppError} Se o estudante não for encontrado.
   */
  async checkUserExists(studentId) {
    const student = await this.getById(studentId);
    const user = await User.findOne({ where: { student_id: studentId } });

    return {
      hasUser: !!user,
      user: user || null,
    };
  }

  /**
   * Busca as avaliações futuras (próximas 30 dias) das turmas do aluno logado.
   *
   * @param {number} userId - ID do usuário logado.
   * @returns {Promise<Evaluation[]>} Lista de avaliações futuras.
   * @throws {AppError} Se o usuário não for encontrado ou não for estudante.
   */
  async getMyUpcomingEvaluations(userId) {
    const { ClassStudent, Evaluation, Class, Teacher, Discipline, Course } = require('../models');
    const { Op } = require('sequelize');

    // Buscar usuário logado
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    // Verificar se usuário é estudante
    if (user.role !== 'student') {
      throw new AppError('Apenas estudantes podem acessar suas avaliações.', 403, 'FORBIDDEN');
    }

    // Verificar se usuário tem student_id vinculado
    if (!user.student_id) {
      throw new AppError(
        'Usuário não possui estudante vinculado.',
        400,
        'NO_STUDENT_ASSOCIATED'
      );
    }

    const studentId = user.student_id;

    // Buscar todas as turmas do aluno
    const classStudents = await ClassStudent.findAll({
      where: { student_id: studentId },
      attributes: ['class_id'],
    });

    if (classStudents.length === 0) {
      logger.info('[STUDENT_SERVICE] Aluno não está matriculado em nenhuma turma', {
        userId,
        studentId,
      });
      return [];
    }

    const classIds = classStudents.map((cs) => cs.class_id);

    // Buscar avaliações futuras (próximas 30 dias) das turmas do aluno
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);

    const evaluations = await Evaluation.findAll({
      where: {
        class_id: { [Op.in]: classIds },
        date: {
          [Op.gte]: today,
          [Op.lte]: futureDate,
        },
      },
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'semester', 'year'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'nome'],
        },
        {
          model: Discipline,
          as: 'discipline',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['date', 'ASC']],
    });

    logger.info('[STUDENT_SERVICE] Avaliações futuras encontradas para aluno', {
      userId,
      studentId,
      classCount: classIds.length,
      evaluationCount: evaluations.length,
    });

    return evaluations.map((e) => e.toJSON());
  }
}

module.exports = new StudentService();
