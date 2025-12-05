/**
 * Arquivo: backend/database/migrations/20251205175908-fix-enrollments-student-fk.js
 * Descrição: Migration para corrigir foreign key student_id em enrollments
 * Criado em: 2025-12-05
 *
 * PROBLEMA:
 * A tabela enrollments foi criada antes da separação da tabela students.
 * A foreign key student_id está apontando para users quando deveria apontar para students.
 *
 * SOLUÇÃO:
 * 1. Remover a foreign key atual (enrollments_ibfk_1)
 * 2. Criar nova foreign key apontando para students.id
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remover foreign key antiga (student_id -> users)
    await queryInterface.removeConstraint('enrollments', 'enrollments_ibfk_1');

    // 2. Adicionar nova foreign key (student_id -> students)
    await queryInterface.addConstraint('enrollments', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'enrollments_student_id_fk',
      references: {
        table: 'students',
        field: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remover foreign key atual (student_id -> students)
    await queryInterface.removeConstraint('enrollments', 'enrollments_student_id_fk');

    // 2. Restaurar foreign key antiga (student_id -> users)
    await queryInterface.addConstraint('enrollments', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'enrollments_ibfk_1',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });
  },
};
