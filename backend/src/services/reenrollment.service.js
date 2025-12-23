/**
 * Arquivo: backend/src/services/reenrollment.service.js
 * Descrição: Lógica de negócio para aceite de rematrícula de estudantes
 * Feature: feat-reenrollment-etapa-3 - ReenrollmentService
 * Criado em: 2025-12-15
 *
 * RESPONSABILIDADES:
 * - Processar aceite de rematrícula de estudantes
 * - Atualizar status de enrollments de 'reenrollment' para 'active'
 * - Criar contratos após aceite do estudante
 * - Gerar preview de contrato HTML para estudantes
 * - Registrar logs detalhados de operações
 * - Garantir atomicidade das operações usando transações do Sequelize
 *
 * REGRAS DE NEGÓCIO:
 * 1. Apenas estudantes podem aceitar suas próprias rematrículas
 * 2. Status de enrollments é alterado de 'reenrollment' para 'active'
 * 3. Contratos são criados após aceite do estudante
 * 4. Campo current_semester é incrementado ao aceitar rematrícula
 * 5. Usar transação para garantir atomicidade (rollback completo em caso de erro)
 *
 * @example
 * // Aceitar rematrícula
 * const result = await ReenrollmentService.acceptReenrollment(enrollmentId, studentUserId);
 * // Retorna: { enrollment, contract }
 */

'use strict';

const { Enrollment, User, Student, Course, ContractTemplate, Contract } = require('../models');
const { sequelize } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

class ReenrollmentService {
  /**
   * Processa o aceite de rematrícula de um estudante
   *
   * @param {number} enrollmentId - ID do enrollment a ser aceito
   * @param {number} studentUserId - ID do usuário estudante logado
   * @returns {Promise<{enrollment: Enrollment, contract: Contract}>}
   * @throws {AppError} Se validações falharem ou ocorrer erro na transação
   */
  async acceptReenrollment(enrollmentId, studentUserId) {
    logger.info(
      `[ReenrollmentService] Aceitando rematrícula - Enrollment ID: ${enrollmentId}, User ID: ${studentUserId}`
    );

    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(studentUserId, { transaction });
      if (!user || !user.student_id) {
        throw new AppError('Usuário estudante inválido', 403);
      }

      const enrollment = await Enrollment.findByPk(enrollmentId, { transaction });
      if (!enrollment) {
        throw new AppError('Matrícula não encontrada', 404);
      }
      if (enrollment.student_id !== user.student_id) {
        throw new AppError('Você não tem permissão para aceitar esta rematrícula', 403);
      }
      if (enrollment.status !== 'reenrollment') {
        throw new AppError(`Esta matrícula não está pendente de aceite (status atual: ${enrollment.status})`, 422);
      }

      const template = await ContractTemplate.findOne({ where: { is_active: true }, transaction });
      if (!template) {
        throw new AppError('Nenhum template de contrato ativo encontrado', 422);
      }

      // Atualizar status e incrementar current_semester
      enrollment.status = 'active';
      enrollment.current_semester = (enrollment.current_semester || 0) + 1;
      await enrollment.save({ transaction });

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const semester = currentMonth < 6 ? 1 : 2;

      const newContract = await Contract.create({
        user_id: studentUserId,
        enrollment_id: enrollmentId,
        template_id: template.id,
        semester: semester,
        year: currentYear,
        accepted_at: new Date(),
        file_path: null,
        file_name: null,
      }, { transaction });

      await transaction.commit();

      logger.info(`[ReenrollmentService] Rematrícula aceita com sucesso - Enrollment ID: ${enrollmentId}`);
      return { enrollment, contract: newContract };
    } catch (error) {
      await transaction.rollback();
      logger.error(`[ReenrollmentService] Erro ao aceitar rematrícula: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao processar o aceite da rematrícula', 500);
    }
  }

  /**
   * Gera preview de contrato HTML para rematrícula do estudante
   *
   * FLUXO:
   * 1. Busca enrollment por ID com dados do student e course
   * 2. Valida ownership (enrollment pertence ao estudante logado)
   * 3. Valida que enrollment.status === 'pending'
   * 4. Busca template ativo de contrato
   * 5. Coleta dados para substituição de placeholders
   * 6. Chama template.replacePlaceholders() para gerar HTML
   * 7. Retorna HTML renderizado pronto para exibição
   *
   * IMPORTANTE:
   * - NÃO gera PDF, apenas HTML
   * - Valida que estudante é dono do enrollment (ownership)
   * - Apenas enrollments com status 'reenrollment' podem ter preview
   * - Reutiliza sistema existente de ContractTemplate
   *
   * PLACEHOLDERS SUPORTADOS:
   * - {{studentName}}: Nome completo do estudante
   * - {{studentId}}: ID do estudante
   * - {{cpf}}: CPF formatado do estudante
   * - {{courseName}}: Nome do curso
   * - {{semester}}: Semestre (1 ou 2)
   * - {{year}}: Ano (ex: 2025)
   * - {{date}}: Data atual formatada (DD/MM/YYYY)
   * - {{institutionName}}: Nome da instituição (hardcoded)
   *
   * @param {number} enrollmentId - ID do enrollment
   * @param {number} studentUserId - ID do usuário estudante logado
   * @returns {Promise<Object>} { contractHTML: string, enrollmentId: number, semester: number, year: number }
   * @throws {AppError} Se enrollment não existe, não pertence ao estudante, não está pending, ou sem template
   */
  async getReenrollmentContractPreview(enrollmentId, studentUserId) {
    logger.info(
      `[ReenrollmentService] Gerando preview de contrato - Enrollment ID: ${enrollmentId}, User ID: ${studentUserId}`
    );

    try {
      // 1. Buscar enrollment por ID com dados do student e course
      const enrollment = await Enrollment.findByPk(enrollmentId, {
        include: [
          {
            model: Student,
            as: 'student',
            attributes: [
              'id',
              'nome',
              'cpf',
              'rg',
              'data_nascimento',
              'email',
              'telefone',
              'celular',
              'endereco_rua',
              'endereco_numero',
              'endereco_complemento',
              'endereco_bairro',
              'endereco_cidade',
              'endereco_uf',
              'cep',
              'matricula',
            ],
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'description', 'duration', 'duration_type'],
          },
        ],
      });

      // Validar que enrollment existe
      if (!enrollment) {
        logger.warn(
          `[ReenrollmentService] Enrollment não encontrado - ID: ${enrollmentId}`
        );
        throw new AppError('Matrícula não encontrada', 404);
      }

      // 2. Buscar usuário logado para obter student_id
      const user = await User.findByPk(studentUserId, {
        attributes: ['id', 'student_id', 'role'],
      });

      if (!user) {
        logger.warn(
          `[ReenrollmentService] Usuário não encontrado - ID: ${studentUserId}`
        );
        throw new AppError('Usuário não encontrado', 404);
      }

      if (user.role !== 'student') {
        logger.warn(
          `[ReenrollmentService] Usuário não é estudante - ID: ${studentUserId}, Role: ${user.role}`
        );
        throw new AppError('Apenas estudantes podem visualizar contratos de rematrícula', 403);
      }

      // 2. Validar ownership: enrollment.student_id === user.student_id
      if (enrollment.student_id !== user.student_id) {
        logger.warn(
          `[ReenrollmentService] Tentativa de acesso não autorizado - Enrollment ID: ${enrollmentId}, Student ID do enrollment: ${enrollment.student_id}, Student ID do usuário: ${user.student_id}`
        );
        throw new AppError(
          'Você não tem permissão para visualizar este contrato',
          403
        );
      }

      // 3. Validar que enrollment.status === 'reenrollment'
      if (enrollment.status !== 'reenrollment') {
        logger.warn(
          `[ReenrollmentService] Tentativa de preview em enrollment com status incorreto - Enrollment ID: ${enrollmentId}, Status: ${enrollment.status}`
        );
        throw new AppError(
          `Esta matrícula não está pendente de aceite (status atual: ${enrollment.status})`,
          422
        );
      }

      // 4. Buscar template ativo de contrato
      const templates = await ContractTemplate.findAvailable();

      if (!templates || templates.length === 0) {
        logger.error(
          `[ReenrollmentService] Nenhum template de contrato disponível`
        );
        throw new AppError(
          'Nenhum template de contrato disponível. Entre em contato com a administração.',
          422
        );
      }

      // Usar o primeiro template disponível
      const template = templates[0];

      logger.info(
        `[ReenrollmentService] Template encontrado - ID: ${template.id}, Nome: ${template.name}`
      );

      // 5. Coletar e formatar dados para substituição
      const student = enrollment.student || {};
      const course = enrollment.course || {};
      const currentDate = new Date();

      const addressParts = [
        student.endereco_rua,
        student.endereco_numero,
        student.endereco_complemento,
        student.endereco_bairro,
        student.endereco_cidade,
        student.endereco_uf,
        student.cep,
      ].filter(Boolean); // Remove partes nulas/vazias
      const studentAddress = addressParts.join(', ');

      // Calcular semestre baseado em current_semester + 1
      const nextSemester = (enrollment.current_semester || 0) + 1;

      // Dados para substituição
      const placeholderData = {
        studentName: student.nome || 'N/A',
        studentId: student.id || 'N/A',
        studentCPF: student.cpf ? student.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : 'N/A',
        studentRG: student.rg || 'N/A',
        studentBirthDate: student.data_nascimento
          ? (student.data_nascimento.match(/^\d{4}-\d{2}-\d{2}$/)
              ? student.data_nascimento.split('-').reverse().join('/')
              : student.data_nascimento)
          : 'N/A',
        studentEmail: student.email || 'N/A',
        studentPhone: student.celular || student.telefone || 'N/A',
        studentAddress: studentAddress || 'N/A',
        enrollmentNumber: student.matricula || 'N/A',

        courseName: course.name || 'N/A',
        courseDuration: `${course.duration || 'N/A'} ${course.duration_type || ''}`.trim(),

        enrollmentDate: new Date(enrollment.enrollment_date).toLocaleDateString('pt-BR'),
        contractDate: currentDate.toLocaleDateString('pt-BR'),
        currentSemester: nextSemester, // current_semester + 1
        year: currentDate.getFullYear(),

        // Placeholders de rodapé
        contractId: 'A ser gerado após aceite',
        generatedAt: currentDate.toLocaleString('pt-BR'),

        // Placeholders antigos para retrocompatibilidade
        cpf: student.cpf ? student.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : 'N/A',
        semester: nextSemester, // current_semester + 1
        date: currentDate.toLocaleDateString('pt-BR'),
        institutionName: 'Secretaria Online',
      };

      logger.info(
        `[ReenrollmentService] Dados coletados para substituição: ${JSON.stringify(placeholderData)}`
      );

      // 6. Chamar template.replacePlaceholders() para gerar HTML
      const contractHTML = template.replacePlaceholders(placeholderData);

      logger.info(
        `[ReenrollmentService] HTML do contrato gerado com sucesso - Enrollment ID: ${enrollmentId}`
      );

      // 7. Retornar HTML renderizado
      return {
        contractHTML: contractHTML,
        enrollmentId: enrollment.id,
        semester: placeholderData.currentSemester,
        year: placeholderData.year,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(
        `[ReenrollmentService] Erro ao gerar preview de contrato: ${error.message}`,
        {
          enrollment_id: enrollmentId,
          user_id: studentUserId,
          error_stack: error.stack,
        }
      );

      throw new AppError(
        'Erro ao gerar preview de contrato. Tente novamente mais tarde.',
        500
      );
    }
  }
}

module.exports = new ReenrollmentService();
