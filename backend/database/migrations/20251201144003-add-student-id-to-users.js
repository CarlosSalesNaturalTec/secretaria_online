/**
 * Arquivo: database/migrations/20251201144003-add-student-id-to-users.js
 * Descrição: Migration para adicionar coluna student_id à tabela users
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-12-01
 *
 * Esta migration adiciona a coluna student_id (chave estrangeira opcional) à tabela users,
 * permitindo vincular um usuário a um registro na tabela students.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Método executado ao rodar a migration (npm run db:migrate)
   * Adiciona a coluna student_id e sua foreign key constraint
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize com tipos de dados
   */
  async up(queryInterface, Sequelize) {
    // Adicionar coluna student_id
    await queryInterface.addColumn('users', 'student_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'ID do estudante na tabela students (chave estrangeira opcional)',
    });

    // Adicionar foreign key constraint
    await queryInterface.addConstraint('users', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_users_student_id',
      references: {
        table: 'students',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Adicionar índice para acelerar buscas
    await queryInterface.addIndex('users', ['student_id'], {
      name: 'idx_users_student_id',
      comment: 'Índice para acelerar buscas por student_id',
    });

    console.log('✓ Coluna student_id adicionada à tabela users com sucesso');
  },

  /**
   * Método executado ao reverter a migration (npm run db:migrate:undo)
   * Remove a coluna student_id e suas constraints
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize
   */
  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('users', 'idx_users_student_id');

    // Remover foreign key constraint
    await queryInterface.removeConstraint('users', 'fk_users_student_id');

    // Remover coluna
    await queryInterface.removeColumn('users', 'student_id');

    console.log('✓ Coluna student_id removida da tabela users com sucesso');
  },
};
