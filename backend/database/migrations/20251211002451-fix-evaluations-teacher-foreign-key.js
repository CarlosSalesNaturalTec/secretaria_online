/**
 * Arquivo: backend/database/migrations/20251211002451-fix-evaluations-teacher-foreign-key.js
 * Descrição: Migration para corrigir chave estrangeira teacher_id na tabela evaluations
 *            Altera referência de 'users' para 'teachers'
 * Feature: bug-fix - Corrigir FK teacher_id em evaluations
 * Criado em: 2025-12-11
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - corrige a FK teacher_id
   * Remove constraint que referencia 'users' e adiciona constraint que referencia 'teachers'
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    // 1. Remover a constraint de chave estrangeira antiga (que referencia users)
    await queryInterface.removeConstraint('evaluations', 'evaluations_ibfk_2');

    // 2. Adicionar a nova constraint de chave estrangeira (que referencia teachers)
    await queryInterface.addConstraint('evaluations', {
      fields: ['teacher_id'],
      type: 'foreign key',
      name: 'evaluations_teacher_id_fk',
      references: {
        table: 'teachers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    console.log('✓ Chave estrangeira teacher_id corrigida: agora referencia tabela teachers');
  },

  /**
   * Reverte a migration - volta a FK teacher_id para referenciar users
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    // 1. Remover a constraint nova (que referencia teachers)
    await queryInterface.removeConstraint('evaluations', 'evaluations_teacher_id_fk');

    // 2. Restaurar a constraint antiga (que referencia users)
    await queryInterface.addConstraint('evaluations', {
      fields: ['teacher_id'],
      type: 'foreign key',
      name: 'evaluations_ibfk_2',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    console.log('✓ Revertido: chave estrangeira teacher_id voltou a referenciar tabela users');
  }
};
