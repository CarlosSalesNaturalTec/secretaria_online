/**
 * Arquivo: database/migrations/20251203195946-alter-users-nullable-email-cpf.js
 * Descrição: Altera colunas email e cpf da tabela users para permitir NULL
 * Feature: Correção - permitir criação de usuários sem email e CPF
 * Criado em: 2025-12-03
 *
 * Esta migration permite que professores e alunos tenham usuários criados
 * mesmo sem email ou CPF cadastrados na tabela teachers/students.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Método executado ao rodar a migration (npm run db:migrate)
   * Altera colunas email e cpf para permitir NULL
   */
  async up(queryInterface, Sequelize) {
    // Alterar coluna email para permitir NULL
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'Email único para contato (opcional)',
    });

    // Alterar coluna cpf para permitir NULL
    await queryInterface.changeColumn('users', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: true,
      unique: true,
      comment: 'CPF do usuário (opcional, apenas números)',
    });

    console.log('✓ Colunas email e cpf alteradas para permitir NULL');
  },

  /**
   * Método executado ao reverter a migration (npm run db:migrate:undo)
   * Reverte colunas email e cpf para NOT NULL
   */
  async down(queryInterface, Sequelize) {
    // Reverter coluna email para NOT NULL
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Email único para contato e recuperação de senha',
    });

    // Reverter coluna cpf para NOT NULL
    await queryInterface.changeColumn('users', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: false,
      unique: true,
      comment: 'CPF do usuário (apenas números, validado no model)',
    });

    console.log('✓ Colunas email e cpf revertidas para NOT NULL');
  },
};
