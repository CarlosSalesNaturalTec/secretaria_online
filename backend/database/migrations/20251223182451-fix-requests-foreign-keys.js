/**
 * Arquivo: database/migrations/20251223182451-fix-requests-foreign-keys.js
 * Descrição: Corrige as chaves estrangeiras da tabela requests para apontar para students
 * Feature: fix - Corrigir FKs da tabela requests
 * Criado em: 2025-12-23
 *
 * Esta migration corrige as chaves estrangeiras student_id e reviewed_by:
 * - student_id: deve apontar para students.id (não users.id)
 * - reviewed_by: continua apontando para users.id (admin que revisou)
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove a constraint antiga de student_id que aponta para users
    await queryInterface.removeConstraint('requests', 'requests_ibfk_1');

    // 2. Adiciona nova constraint para student_id apontando para students
    await queryInterface.addConstraint('requests', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_requests_student_id',
      references: {
        table: 'students',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    console.log('✓ Chave estrangeira student_id corrigida para apontar para students.id');
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove a nova constraint
    await queryInterface.removeConstraint('requests', 'fk_requests_student_id');

    // 2. Restaura a constraint antiga apontando para users
    await queryInterface.addConstraint('requests', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'requests_ibfk_1',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    console.log('✓ Chave estrangeira student_id revertida para apontar para users.id');
  },
};
