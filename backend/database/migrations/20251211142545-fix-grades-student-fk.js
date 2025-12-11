/**
 * Arquivo: backend/database/migrations/20251211142545-fix-grades-student-fk.js
 * Descrição: Corrige FK de student_id na tabela grades de users para students
 * Feature: Correção da arquitetura - grades deve referenciar students, não users
 * Criado em: 2025-12-11
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - remove FK antiga e cria nova para students
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    // 1. Remover a FK antiga que aponta para users
    await queryInterface.removeConstraint('grades', 'grades_ibfk_2');

    // 2. Adicionar a nova FK que aponta para students
    await queryInterface.addConstraint('grades', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_grades_student_id',
      references: {
        table: 'students',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT' // Prevenir exclusão de aluno com notas
    });
  },

  /**
   * Reverte a migration - volta FK para users
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    // 1. Remover a FK que aponta para students
    await queryInterface.removeConstraint('grades', 'fk_grades_student_id');

    // 2. Recriar a FK antiga que aponta para users
    await queryInterface.addConstraint('grades', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'grades_ibfk_2',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  }
};
