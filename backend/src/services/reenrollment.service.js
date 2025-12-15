/**
 * Arquivo: backend/src/services/reenrollment.service.js
 * Descrição: Lógica de negócio para rematrícula global de estudantes
 * Feature: feat-reenrollment-etapa-3 - ReenrollmentService (Processamento Global em Lote)
 * Criado em: 2025-12-15
 *
 * RESPONSABILIDADES:
 * - Processar rematrícula global de TODOS os estudantes do sistema em lote
 * - Validar senha do administrador antes de executar operações críticas
 * - Atualizar status de enrollments de 'active' para 'pending' em transação
 * - Registrar logs detalhados de operações de rematrícula
 * - Garantir atomicidade das operações usando transações do Sequelize
 *
 * REGRAS DE NEGÓCIO:
 * 1. Processar TODOS os enrollments ativos do sistema (não por curso individual)
 * 2. Apenas administradores podem executar rematrícula global
 * 3. Senha do administrador deve ser validada antes do processamento
 * 4. Status de enrollments ativos é alterado para 'pending'
 * 5. NÃO criar contratos durante rematrícula - contratos criados após aceite do estudante
 * 6. Usar transação para garantir atomicidade (rollback completo em caso de erro)
 * 7. Registrar log completo da operação (admin_id, total_affected, semester, year, timestamp)
 *
 * @example
 * // Validar senha do admin
 * const isValid = await ReenrollmentService.validateAdminPassword(adminUserId, 'senha123');
 *
 * // Processar rematrícula global
 * const result = await ReenrollmentService.processGlobalReenrollment(1, 2025, adminUserId);
 * // Retorna: { totalStudents: 150, affectedEnrollmentIds: [1, 2, 3, ...] }
 */

'use strict';

const { Enrollment, User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

class ReenrollmentService {
  /**
   * Valida senha de um usuário administrador
   *
   * FLUXO:
   * 1. Busca usuário por ID
   * 2. Valida que usuário existe e é admin
   * 3. Compara senha fornecida com hash armazenado usando bcrypt
   * 4. Retorna true se senha correta, false caso contrário
   *
   * @param {number} userId - ID do usuário admin
   * @param {string} password - Senha em texto plano para validar
   * @returns {Promise<boolean>} True se senha válida, false caso contrário
   * @throws {AppError} Se usuário não existe ou não é admin
   */
  async validateAdminPassword(userId, password) {
    logger.info(
      `[ReenrollmentService] Validando senha do admin - userId: ${userId}`
    );

    try {
      // 1. Buscar usuário por ID
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(
          `[ReenrollmentService] Tentativa de validação com usuário inexistente - ID: ${userId}`
        );
        throw new AppError('Usuário não encontrado', 404);
      }

      // 2. Validar que usuário é admin
      if (user.role !== 'admin') {
        logger.warn(
          `[ReenrollmentService] Tentativa de rematrícula por usuário não-admin - ID: ${userId}, Role: ${user.role}`
        );
        throw new AppError(
          'Apenas administradores podem executar rematrícula global',
          403
        );
      }

      // 3. Comparar senha fornecida com hash armazenado
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        logger.warn(
          `[ReenrollmentService] Senha incorreta para admin - ID: ${userId}`
        );
      } else {
        logger.info(
          `[ReenrollmentService] Senha validada com sucesso - Admin ID: ${userId}`
        );
      }

      return isPasswordValid;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        `[ReenrollmentService] Erro ao validar senha: ${error.message}`
      );
      throw new AppError('Erro ao validar senha do administrador', 500);
    }
  }

  /**
   * Processa rematrícula global de TODOS os estudantes do sistema
   *
   * FLUXO:
   * 1. Busca TODOS os enrollments com status 'active' (independente do curso)
   * 2. Conta total de enrollments ativos
   * 3. Inicia transação do Sequelize
   * 4. Atualiza status de TODOS para 'pending' em batch dentro da transação
   * 5. Faz commit da transação
   * 6. Registra log detalhado da operação
   * 7. Retorna total de estudantes afetados e lista de enrollment IDs
   *
   * IMPORTANTE:
   * - NÃO cria contratos nesta etapa (contratos criados após aceite do estudante)
   * - Usa transação para garantir atomicidade (rollback completo em caso de erro)
   * - Processa TODOS os enrollments ativos do sistema de uma vez
   *
   * @param {number} semester - Semestre da rematrícula (1 ou 2)
   * @param {number} year - Ano da rematrícula (ex: 2025)
   * @param {number} adminUserId - ID do administrador que executou a operação
   * @returns {Promise<Object>} { totalStudents: number, affectedEnrollmentIds: number[] }
   * @throws {AppError} Se erro na transação ou validação
   */
  async processGlobalReenrollment(semester, year, adminUserId) {
    logger.info(
      `[ReenrollmentService] Iniciando rematrícula global - Semestre: ${semester}, Ano: ${year}, Admin ID: ${adminUserId}`
    );

    // Variável para controlar transação
    let transaction;

    try {
      // 1. Buscar TODOS os enrollments ativos do sistema
      const activeEnrollments = await Enrollment.findAll({
        where: { status: 'active' },
        attributes: ['id', 'student_id', 'course_id', 'status'],
      });

      // 2. Contar total de enrollments ativos
      const totalEnrollments = activeEnrollments.length;

      logger.info(
        `[ReenrollmentService] Total de enrollments ativos encontrados: ${totalEnrollments}`
      );

      // Se não há enrollments ativos, retornar sem fazer nada
      if (totalEnrollments === 0) {
        logger.warn(
          `[ReenrollmentService] Nenhum enrollment ativo encontrado. Operação cancelada.`
        );
        return {
          totalStudents: 0,
          affectedEnrollmentIds: [],
        };
      }

      // 3. Iniciar transação do Sequelize
      transaction = await sequelize.transaction();

      logger.info(
        `[ReenrollmentService] Transação iniciada. Atualizando ${totalEnrollments} enrollments...`
      );

      // 4. Atualizar status de TODOS para 'pending' em batch dentro da transação
      await Enrollment.update(
        { status: 'pending' },
        {
          where: { status: 'active' },
          transaction,
        }
      );

      // 5. Commit da transação
      await transaction.commit();

      logger.info(
        `[ReenrollmentService] Transação commitada com sucesso. ${totalEnrollments} enrollments atualizados.`
      );

      // 6. Extrair IDs dos enrollments afetados
      const affectedEnrollmentIds = activeEnrollments.map((e) => e.id);

      // 7. Registrar log detalhado da operação
      logger.info({
        message: '[ReenrollmentService] Rematrícula global processada com sucesso',
        admin_id: adminUserId,
        total_affected: totalEnrollments,
        semester: semester,
        year: year,
        timestamp: new Date().toISOString(),
        affected_enrollment_ids: affectedEnrollmentIds,
      });

      // 8. Retornar resultado
      return {
        totalStudents: totalEnrollments,
        affectedEnrollmentIds: affectedEnrollmentIds,
      };
    } catch (error) {
      // Rollback da transação em caso de erro
      if (transaction) {
        await transaction.rollback();
        logger.error(
          `[ReenrollmentService] Transação revertida devido a erro: ${error.message}`
        );
      }

      logger.error(
        `[ReenrollmentService] Erro ao processar rematrícula global: ${error.message}`,
        {
          admin_id: adminUserId,
          semester: semester,
          year: year,
          error_stack: error.stack,
        }
      );

      throw new AppError(
        'Erro ao processar rematrícula global. Operação cancelada.',
        500
      );
    }
  }
}

module.exports = new ReenrollmentService();
