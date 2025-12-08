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
 * 1. Remover a foreign key atual (se existir)
 * 2. Criar nova foreign key apontando para students.id
 *
 * NOTA: Essa migration foi ajustada para ser robusta e não falhar se a constraint
 * não existir (pode acontecer em bancos criados do zero).
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Verificar se a constraint antiga existe antes de remover
      const constraints = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME='enrollments' AND COLUMN_NAME='student_id'
         AND REFERENCED_TABLE_NAME='users' AND TABLE_SCHEMA = DATABASE()`
      );

      // Se a constraint antiga existe, remove
      if (constraints[0] && constraints[0].length > 0) {
        const constraintName = constraints[0][0].CONSTRAINT_NAME;
        await queryInterface.removeConstraint('enrollments', constraintName);
        console.log(`✓ Constraint removida: ${constraintName}`);
      }
    } catch (error) {
      console.warn('⚠️  Não foi possível remover constraint anterior:', error.message);
    }

    try {
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
      console.log('✓ Nova constraint criada: enrollments_student_id_fk');
    } catch (error) {
      console.warn('⚠️  Não foi possível criar nova constraint:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // 1. Remover foreign key atual (student_id -> students)
      await queryInterface.removeConstraint('enrollments', 'enrollments_student_id_fk');
      console.log('✓ Constraint removida: enrollments_student_id_fk');
    } catch (error) {
      console.warn('⚠️  Não foi possível remover constraint:', error.message);
    }

    try {
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
      console.log('✓ Constraint restaurada: enrollments_ibfk_1');
    } catch (error) {
      console.warn('⚠️  Não foi possível restaurar constraint anterior:', error.message);
    }
  },
};
