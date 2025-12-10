/**
 * Arquivo: backend/database/migrations/20251210173934-update-class-students-student-fk.js
 * Descrição: Corrige a chave estrangeira student_id da tabela class_students para referenciar students ao invés de users
 * Feature: Correção de bug - FK incorreta em class_students
 * Criado em: 2025-12-10
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - atualiza a FK student_id para referenciar students
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    // 1. Remover a constraint FK existente (aponta para users)
    await queryInterface.removeConstraint('class_students', 'class_students_ibfk_2');

    // 2. Adicionar nova constraint FK apontando para students
    await queryInterface.addConstraint('class_students', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_class_students_student_id',
      references: {
        table: 'students',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    console.log('[Migration] FK student_id atualizada para referenciar tabela students');
  },

  /**
   * Reverte a migration - volta FK student_id para referenciar users
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    // 1. Remover constraint FK atual (aponta para students)
    await queryInterface.removeConstraint('class_students', 'fk_class_students_student_id');

    // 2. Restaurar constraint FK original (aponta para users)
    await queryInterface.addConstraint('class_students', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'class_students_ibfk_2',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    console.log('[Migration] FK student_id revertida para referenciar tabela users');
  }
};
