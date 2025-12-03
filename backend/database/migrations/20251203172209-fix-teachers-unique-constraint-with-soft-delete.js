'use strict';

/**
 * Migration: Corrige constraint UNIQUE de CPF e email em teachers para considerar soft-delete
 *
 * Problema: Com soft-delete (paranoid), a constraint UNIQUE do MySQL não considera
 * registros deletados (deleted_at IS NOT NULL), impedindo reutilizar CPF/email
 * de professores excluídos.
 *
 * Solução: Remove constraint UNIQUE simples e cria índice único parcial que
 * considera apenas registros ativos (deleted_at IS NULL).
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove constraint UNIQUE do CPF (se existir)
    try {
      await queryInterface.removeConstraint('teachers', 'cpf');
    } catch (error) {
      console.log('Constraint cpf não encontrada ou já foi removida');
    }

    // 2. Remove índice único do CPF (se existir com outro nome)
    try {
      await queryInterface.removeIndex('teachers', 'teachers_cpf');
    } catch (error) {
      console.log('Índice teachers_cpf não encontrado');
    }

    // 3. Cria índice único composto de (cpf, deleted_at)
    // Isso permite que o mesmo CPF seja usado quando deleted_at não é NULL
    // Mas impede CPF duplicado quando deleted_at é NULL (registros ativos)
    await queryInterface.addIndex('teachers', ['cpf', 'deleted_at'], {
      unique: true,
      name: 'teachers_cpf_deleted_at_unique',
      // MySQL: índice único composto permite (CPF1, NULL) e (CPF1, DATE1) simultaneamente
    });

    // 4. Cria índice único composto de (email, deleted_at)
    await queryInterface.addIndex('teachers', ['email', 'deleted_at'], {
      unique: true,
      name: 'teachers_email_deleted_at_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove os índices criados
    await queryInterface.removeIndex('teachers', 'teachers_cpf_deleted_at_unique');
    await queryInterface.removeIndex('teachers', 'teachers_email_deleted_at_unique');

    // Restaura constraint UNIQUE simples do CPF
    await queryInterface.changeColumn('teachers', 'cpf', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    });
  }
};
