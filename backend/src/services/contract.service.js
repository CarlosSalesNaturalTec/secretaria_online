/**
 * Arquivo: backend/src/services/contract.service.js
 * Descrição: Lógica de negócio para geração e gestão de contratos
 * Feature: feat-048 - Criar ContractService com lógica de negócio
 * Criado em: 2025-11-01
 *
 * RESPONSABILIDADES:
 * - Gerar contratos automaticamente para alunos e professores
 * - Buscar templates e substituir placeholders com dados reais
 * - Gerar PDFs de contratos usando PDFService
 * - Registrar contratos gerados no banco de dados
 * - Registrar aceite de contratos (com data/hora)
 * - Validar regras de negócio para geração e aceite
 * - Buscar contratos por usuário, período e status
 *
 * REGRAS DE NEGÓCIO:
 * 1. Contratos podem ser gerados para alunos (matrícula) ou professores (semestre)
 * 2. Um contrato precisa de um template disponível para ser gerado
 * 3. Aluno não pode aceitar contrato duas vezes
 * 4. Professor e aluno devem existir no banco antes de gerar contrato
 * 5. Aluno pode ter múltiplos contratos (um por semestre da duração do curso)
 *
 * @example
 * // Gerar contrato para aluno
 * const contract = await ContractService.generateContract(
 *   studentId,
 *   'student',
 *   { semester: 1, year: 2025 }
 * );
 *
 * // Aluno aceita contrato
 * const accepted = await ContractService.acceptContract(contractId, studentId);
 *
 * // Buscar contratos pendentes de um aluno
 * const pending = await ContractService.getPendingByUser(studentId);
 */

'use strict';

const { Contract, ContractTemplate, User, Course, Enrollment } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const PDFService = require('./pdf.service');
const logger = require('../utils/logger');
const path = require('path');
const { CONTRACTS_PATH } = require('../config/pdf');

class ContractService {
  /**
   * Gera um novo contrato para um usuário (aluno ou professor)
   *
   * FLUXO:
   * 1. Valida se usuário existe e é aluno ou professor
   * 2. Busca template disponível (padrão ou especificado)
   * 3. Se aluno: busca matrícula ativa para obter dados do curso
   * 4. Se professor: coleta dados do professor
   * 5. Substitui placeholders do template com dados reais
   * 6. Gera PDF usando PDFService
   * 7. Salva registro do contrato no banco de dados
   * 8. Retorna contrato criado
   *
   * @param {number} userId - ID do usuário (aluno ou professor)
   * @param {string} userType - Tipo de usuário: 'student' ou 'teacher'
   * @param {Object} options - Opções adicionais
   * @param {number} [options.semester] - Semestre (padrão: atual)
   * @param {number} [options.year] - Ano (padrão: atual)
   * @param {number} [options.templateId] - ID do template (padrão: primeiro disponível)
   * @param {string} [options.outputDir='uploads/contracts'] - Diretório de saída
   *
   * @returns {Promise<Object>} Contrato gerado com informações
   * @returns {number} .id - ID do contrato
   * @returns {number} .user_id - ID do usuário
   * @returns {number} .template_id - ID do template usado
   * @returns {string} .file_path - Caminho do arquivo PDF gerado
   * @returns {string} .file_name - Nome do arquivo PDF
   * @returns {number} .semester - Semestre do contrato
   * @returns {number} .year - Ano do contrato
   * @returns {Date|null} .accepted_at - Data de aceite (null se pendente)
   *
   * @throws {AppError} Se usuário não existe, template não encontrado ou erro na geração
   *
   * @example
   * const contract = await ContractService.generateContract(123, 'student', {
   *   semester: 1,
   *   year: 2025
   * });
   */
  async generateContract(userId, userType, options = {}) {
    const logContext = `[ContractService.generateContract] User: ${userId}, Type: ${userType}`;
    logger.info(`${logContext} Iniciando geração de contrato`);

    try {
      // 1. Validar usuário
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`${logContext} Usuário não encontrado`);
        throw new AppError('Usuário não encontrado', 404);
      }

      // Validar tipo de usuário
      if (user.role !== userType && userType !== 'both') {
        logger.warn(`${logContext} Tipo de usuário não corresponde`);
        throw new AppError(`Usuário não é um ${userType}`, 400);
      }

      // 2. Determinar semestre e ano (valores padrão = atual)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentSemester = now.getMonth() < 6 ? 1 : 2;

      const semester = options.semester || currentSemester;
      const year = options.year || currentYear;

      // 3. Buscar template (padrão = primeiro disponível)
      let template = null;
      if (options.templateId) {
        template = await ContractTemplate.findActiveById(options.templateId);
        if (!template) {
          logger.warn(`${logContext} Template especificado não encontrado - ID: ${options.templateId}`);
          throw new AppError('Template de contrato não encontrado', 404);
        }
      } else {
        // Buscar primeiro template disponível
        const templates = await ContractTemplate.findAvailable();
        if (templates.length === 0) {
          logger.warn(`${logContext} Nenhum template disponível`);
          throw new AppError('Nenhum template de contrato disponível. Configure um template antes.', 422);
        }
        template = templates[0];
      }

      // 4. Coletar dados para substituição de placeholders
      let contractData = {
        studentId: userId,
        studentName: user.name,
        semester: semester,
        year: year,
        institutionName: 'Secretaria Online',
        currentDate: new Date().toLocaleDateString('pt-BR'),
      };

      // Se for aluno, buscar dados da matrícula e curso
      if (userType === 'student' || user.role === 'student') {
        const enrollment = await Enrollment.findOne({
          where: { student_id: userId, status: ['pending', 'active'] },
          include: {
            association: 'course',
            attributes: ['id', 'name', 'duration_semesters'],
          },
        });

        if (enrollment && enrollment.course) {
          contractData.courseId = enrollment.course.id;
          contractData.courseName = enrollment.course.name;
          contractData.duration = `${enrollment.course.duration_semesters} semestres`;
        } else {
          // Se não houver matrícula, usar dados básicos
          contractData.courseId = 0;
          contractData.courseName = 'Curso não especificado';
          contractData.duration = 'conforme currículo';
        }
      } else if (userType === 'teacher' || user.role === 'teacher') {
        // Para professores, usar dados simples
        contractData.courseId = 0;
        contractData.courseName = 'Contrato de Docência';
        contractData.duration = '1 semestre';
      }

      // 5. Substituir placeholders no template
      const processedContent = template.replacePlaceholders(contractData);

      // 6. Gerar PDF
      logger.debug(`${logContext} Gerando PDF...`);
      const outputDir = options.outputDir || CONTRACTS_PATH;
      const pdfResult = await PDFService.generateContractPDF(contractData, processedContent, outputDir);

      // 7. Salvar contrato no banco de dados
      logger.debug(`${logContext} Salvando contrato no banco de dados`);
      const contract = await Contract.create({
        user_id: userId,
        template_id: template.id,
        file_path: pdfResult.filePath,
        file_name: pdfResult.fileName,
        semester: semester,
        year: year,
        accepted_at: null, // Contrato gerado com status pendente
      });

      logger.info(`${logContext} Contrato gerado com sucesso - Contract ID: ${contract.id}`);

      return {
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        created_at: contract.created_at,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao gerar contrato: ${error.message}`);
      throw new AppError('Erro ao gerar contrato', 500);
    }
  }

  /**
   * Registra o aceite de um contrato por um usuário
   *
   * FLUXO:
   * 1. Busca contrato por ID
   * 2. Valida que contrato existe
   * 3. Valida que contrato ainda não foi aceito
   * 4. Valida que o usuário que está aceitando é o proprietário do contrato
   * 5. Registra data/hora do aceite
   * 6. Salva contrato atualizado no banco
   * 7. Retorna contrato aceito
   *
   * @param {number} contractId - ID do contrato
   * @param {number} userId - ID do usuário aceitando (deve ser proprietário do contrato)
   *
   * @returns {Promise<Object>} Contrato aceito com informações
   * @returns {number} .id - ID do contrato
   * @returns {number} .user_id - ID do usuário
   * @returns {Date} .accepted_at - Data e hora do aceite
   * @returns {string} .status - Status do contrato ('accepted')
   *
   * @throws {AppError} Se contrato não existe, já foi aceito ou usuário não é o proprietário
   *
   * @example
   * const accepted = await ContractService.acceptContract(456, 123);
   */
  async acceptContract(contractId, userId) {
    const logContext = `[ContractService.acceptContract] Contract: ${contractId}, User: ${userId}`;
    logger.info(`${logContext} Iniciando aceite de contrato`);

    try {
      // 1. Buscar contrato
      const contract = await Contract.findByPk(contractId);
      if (!contract) {
        logger.warn(`${logContext} Contrato não encontrado`);
        throw new AppError('Contrato não encontrado', 404);
      }

      // 2. Validar que contrato ainda não foi aceito
      if (contract.accepted_at !== null) {
        logger.warn(
          `${logContext} Tentativa de aceitar contrato já aceito - Aceito em: ${contract.accepted_at}`
        );
        throw new AppError('Este contrato já foi aceito', 422);
      }

      // 3. Validar que o usuário é o proprietário do contrato
      if (contract.user_id !== userId) {
        logger.warn(
          `${logContext} Usuário não é o proprietário do contrato - Proprietário: ${contract.user_id}`
        );
        throw new AppError('Você não tem permissão para aceitar este contrato', 403);
      }

      // 4. Registrar data/hora do aceite
      contract.accepted_at = new Date();
      await contract.save();

      logger.info(
        `${logContext} Contrato aceito com sucesso - Aceito em: ${contract.accepted_at.toISOString()}`
      );

      return {
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        status: 'accepted',
        created_at: contract.created_at,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao aceitar contrato: ${error.message}`);
      throw new AppError('Erro ao aceitar contrato', 500);
    }
  }

  /**
   * Busca contratos pendentes de aceite de um usuário
   *
   * @param {number} userId - ID do usuário
   * @returns {Promise<Array>} Lista de contratos pendentes com informações completas
   *
   * @throws {AppError} Se usuário não existe
   *
   * @example
   * const pending = await ContractService.getPendingByUser(123);
   */
  async getPendingByUser(userId) {
    const logContext = `[ContractService.getPendingByUser] User: ${userId}`;
    logger.debug(`${logContext} Buscando contratos pendentes`);

    try {
      // Validar que usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`${logContext} Usuário não encontrado`);
        throw new AppError('Usuário não encontrado', 404);
      }

      // Buscar contratos pendentes
      const contracts = await Contract.findAll({
        where: {
          user_id: userId,
          accepted_at: null,
          deleted_at: null,
        },
        order: [['created_at', 'DESC']],
      });

      logger.debug(
        `${logContext} ${contracts.length} contrato(s) pendente(s) encontrado(s)`
      );

      return contracts.map((contract) => ({
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        status: 'pending',
        created_at: contract.created_at,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao buscar contratos pendentes: ${error.message}`);
      throw new AppError('Erro ao buscar contratos pendentes', 500);
    }
  }

  /**
   * Busca contratos aceitos de um usuário
   *
   * @param {number} userId - ID do usuário
   * @returns {Promise<Array>} Lista de contratos aceitos com informações completas
   *
   * @throws {AppError} Se usuário não existe
   *
   * @example
   * const accepted = await ContractService.getAcceptedByUser(123);
   */
  async getAcceptedByUser(userId) {
    const logContext = `[ContractService.getAcceptedByUser] User: ${userId}`;
    logger.debug(`${logContext} Buscando contratos aceitos`);

    try {
      // Validar que usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`${logContext} Usuário não encontrado`);
        throw new AppError('Usuário não encontrado', 404);
      }

      // Buscar contratos aceitos
      const contracts = await Contract.findAll({
        where: {
          user_id: userId,
          accepted_at: {
            [require('sequelize').Op.not]: null,
          },
          deleted_at: null,
        },
        order: [['accepted_at', 'DESC']],
      });

      logger.debug(
        `${logContext} ${contracts.length} contrato(s) aceito(s) encontrado(s)`
      );

      return contracts.map((contract) => ({
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        status: 'accepted',
        created_at: contract.created_at,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao buscar contratos aceitos: ${error.message}`);
      throw new AppError('Erro ao buscar contratos aceitos', 500);
    }
  }

  /**
   * Busca todos os contratos de um usuário (pendentes e aceitos)
   *
   * @param {number} userId - ID do usuário
   * @returns {Promise<Array>} Lista de todos os contratos do usuário ordenados por data de criação
   *
   * @throws {AppError} Se usuário não existe
   *
   * @example
   * const allContracts = await ContractService.getAllByUser(123);
   */
  async getAllByUser(userId) {
    const logContext = `[ContractService.getAllByUser] User: ${userId}`;
    logger.debug(`${logContext} Buscando todos os contratos`);

    try {
      // Validar que usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`${logContext} Usuário não encontrado`);
        throw new AppError('Usuário não encontrado', 404);
      }

      // Buscar todos os contratos
      const contracts = await Contract.findAll({
        where: {
          user_id: userId,
          deleted_at: null,
        },
        order: [['created_at', 'DESC']],
      });

      logger.debug(`${logContext} ${contracts.length} contrato(s) encontrado(s)`);

      return contracts.map((contract) => ({
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        status: contract.accepted_at ? 'accepted' : 'pending',
        created_at: contract.created_at,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao buscar contratos: ${error.message}`);
      throw new AppError('Erro ao buscar contratos', 500);
    }
  }

  /**
   * Busca TODOS os contratos do sistema (apenas para administradores)
   *
   * Retorna todos os contratos com informações dos usuários associados.
   * Usado para que administradores possam visualizar e gerenciar contratos de todos os alunos.
   *
   * @param {Object} filters - Filtros opcionais
   * @param {string} [filters.status] - Filtrar por status: 'pending' ou 'accepted'
   *
   * @returns {Promise<Array>} Lista de todos os contratos do sistema com dados dos usuários
   *
   * @example
   * // Buscar todos os contratos
   * const allContracts = await ContractService.getAll();
   *
   * @example
   * // Buscar apenas contratos pendentes
   * const pendingContracts = await ContractService.getAll({ status: 'pending' });
   */
  async getAll(filters = {}) {
    const logContext = '[ContractService.getAll]';
    logger.debug(`${logContext} Buscando todos os contratos do sistema`, { filters });

    try {
      const where = {
        deleted_at: null,
      };

      // Buscar todos os contratos com informações do usuário
      const contracts = await Contract.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      logger.debug(`${logContext} ${contracts.length} contrato(s) encontrado(s)`);

      // Mapear e filtrar por status se necessário
      let mappedContracts = contracts.map((contract) => ({
        id: contract.id,
        userId: contract.user_id,
        templateId: contract.template_id,
        filePath: contract.file_path,
        fileName: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        acceptedAt: contract.accepted_at,
        status: contract.accepted_at ? 'accepted' : 'pending',
        createdAt: contract.created_at,
        user: contract.user
          ? {
              id: contract.user.id,
              name: contract.user.name,
              email: contract.user.email,
              role: contract.user.role,
            }
          : null,
      }));

      // Aplicar filtro de status se fornecido
      if (filters.status) {
        mappedContracts = mappedContracts.filter((c) => c.status === filters.status);
      }

      return mappedContracts;
    } catch (error) {
      logger.error(`${logContext} Erro ao buscar contratos: ${error.message}`);
      throw new AppError('Erro ao buscar contratos', 500);
    }
  }

  /**
   * Busca contratos de um período específico (semestre/ano)
   *
   * @param {number} userId - ID do usuário
   * @param {number} semester - Semestre (1-12)
   * @param {number} year - Ano
   *
   * @returns {Promise<Array>} Lista de contratos do período especificado
   *
   * @throws {AppError} Se usuário não existe ou parâmetros inválidos
   *
   * @example
   * const contracts = await ContractService.getByPeriod(123, 1, 2025);
   */
  async getByPeriod(userId, semester, year) {
    const logContext = `[ContractService.getByPeriod] User: ${userId}, Sem: ${semester}, Year: ${year}`;
    logger.debug(`${logContext} Buscando contratos do período`);

    try {
      // Validar que usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`${logContext} Usuário não encontrado`);
        throw new AppError('Usuário não encontrado', 404);
      }

      // Validar semestre
      if (semester < 1 || semester > 12) {
        throw new AppError('Semestre deve estar entre 1 e 12', 400);
      }

      // Buscar contratos do período
      const contracts = await Contract.findAll({
        where: {
          user_id: userId,
          semester: semester,
          year: year,
          deleted_at: null,
        },
      });

      logger.debug(`${logContext} ${contracts.length} contrato(s) encontrado(s)`);

      return contracts.map((contract) => ({
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        status: contract.accepted_at ? 'accepted' : 'pending',
        created_at: contract.created_at,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao buscar contratos: ${error.message}`);
      throw new AppError('Erro ao buscar contratos do período', 500);
    }
  }

  /**
   * Busca um contrato específico por ID
   *
   * @param {number} contractId - ID do contrato
   * @returns {Promise<Object>} Dados do contrato com informações completas
   *
   * @throws {AppError} Se contrato não encontrado
   *
   * @example
   * const contract = await ContractService.getById(456);
   */
  async getById(contractId) {
    const logContext = `[ContractService.getById] Contract: ${contractId}`;
    logger.debug(`${logContext} Buscando contrato`);

    try {
      const contract = await Contract.findByPk(contractId, {
        include: [
          {
            association: 'user',
            attributes: ['id', 'name', 'email', 'role'],
          },
          {
            association: 'template',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!contract) {
        logger.warn(`${logContext} Contrato não encontrado`);
        throw new AppError('Contrato não encontrado', 404);
      }

      logger.debug(`${logContext} Contrato encontrado`);

      return {
        id: contract.id,
        user_id: contract.user_id,
        template_id: contract.template_id,
        file_path: contract.file_path,
        file_name: contract.file_name,
        semester: contract.semester,
        year: contract.year,
        accepted_at: contract.accepted_at,
        status: contract.accepted_at ? 'accepted' : 'pending',
        created_at: contract.created_at,
        user: contract.user ? {
          id: contract.user.id,
          name: contract.user.name,
          email: contract.user.email,
          role: contract.user.role,
        } : null,
        template: contract.template ? {
          id: contract.template.id,
          name: contract.template.name,
        } : null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao buscar contrato: ${error.message}`);
      throw new AppError('Erro ao buscar contrato', 500);
    }
  }

  /**
   * Verifica se um usuário tem contratos pendentes de aceite
   *
   * @param {number} userId - ID do usuário
   * @returns {Promise<boolean>} True se tem contratos pendentes
   *
   * @example
   * const hasPending = await ContractService.hasPendingContracts(123);
   */
  async hasPendingContracts(userId) {
    const logContext = `[ContractService.hasPendingContracts] User: ${userId}`;
    logger.debug(`${logContext} Verificando contratos pendentes`);

    try {
      const count = await Contract.count({
        where: {
          user_id: userId,
          accepted_at: null,
          deleted_at: null,
        },
      });

      return count > 0;
    } catch (error) {
      logger.error(
        `${logContext} Erro ao verificar contratos pendentes: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Conta quantos contratos pendentes um usuário tem
   *
   * @param {number} userId - ID do usuário
   * @returns {Promise<number>} Número de contratos pendentes
   *
   * @example
   * const count = await ContractService.countPendingContracts(123);
   */
  async countPendingContracts(userId) {
    const logContext = `[ContractService.countPendingContracts] User: ${userId}`;
    logger.debug(`${logContext} Contando contratos pendentes`);

    try {
      const count = await Contract.count({
        where: {
          user_id: userId,
          accepted_at: null,
          deleted_at: null,
        },
      });

      logger.debug(`${logContext} ${count} contrato(s) pendente(s)`);
      return count;
    } catch (error) {
      logger.error(
        `${logContext} Erro ao contar contratos pendentes: ${error.message}`
      );
      return 0;
    }
  }

  /**
   * Deleta um contrato (soft delete)
   *
   * @param {number} contractId - ID do contrato
   * @returns {Promise<void>}
   *
   * @throws {AppError} Se contrato não encontrado
   *
   * @example
   * await ContractService.delete(456);
   */
  async delete(contractId) {
    const logContext = `[ContractService.delete] Contract: ${contractId}`;
    logger.info(`${logContext} Deletando contrato`);

    try {
      const contract = await Contract.findByPk(contractId);
      if (!contract) {
        logger.warn(`${logContext} Contrato não encontrado`);
        throw new AppError('Contrato não encontrado', 404);
      }

      await contract.destroy();

      logger.info(`${logContext} Contrato deletado com sucesso`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`${logContext} Erro ao deletar contrato: ${error.message}`);
      throw new AppError('Erro ao deletar contrato', 500);
    }
  }
}

module.exports = new ContractService();
