/**
 * Arquivo: backend/database/migrations/20251223185723-fix-documents-foreign-key-to-students.js
 * Descrição: Corrige chave estrangeira de documents.user_id para apontar para students em vez de users
 * Feature: Correção de FK - documents deve referenciar students
 * Criado em: 2025-12-23
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove a constraint da FK user_id que aponta para users
    await queryInterface.removeConstraint('documents', 'documents_ibfk_1');

    // 2. Remove a constraint da FK reviewed_by (mantém apontando para users)
    // Apenas para recriar depois
    await queryInterface.removeConstraint('documents', 'documents_ibfk_2');

    // 3. Renomeia a coluna user_id para student_id
    await queryInterface.renameColumn('documents', 'user_id', 'student_id');

    // 4. Adiciona a nova FK student_id apontando para students
    await queryInterface.addConstraint('documents', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_documents_student_id',
      references: {
        table: 'students',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 5. Recria a constraint reviewed_by apontando para users (admin que revisou)
    await queryInterface.addConstraint('documents', {
      fields: ['reviewed_by'],
      type: 'foreign key',
      name: 'fk_documents_reviewed_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 6. Remove índice antigo e cria novo com nome correto
    await queryInterface.removeIndex('documents', 'idx_documents_user_id');
    await queryInterface.addIndex('documents', ['student_id'], {
      name: 'idx_documents_student_id',
    });

    // 7. Remove e recria o índice composto
    await queryInterface.removeIndex('documents', 'idx_documents_user_doctype');
    await queryInterface.addIndex('documents', ['student_id', 'document_type_id'], {
      name: 'idx_documents_student_doctype',
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverte as alterações

    // 1. Remove constraints
    await queryInterface.removeConstraint('documents', 'fk_documents_student_id');
    await queryInterface.removeConstraint('documents', 'fk_documents_reviewed_by');

    // 2. Renomeia student_id de volta para user_id
    await queryInterface.renameColumn('documents', 'student_id', 'user_id');

    // 3. Recria FK user_id apontando para users
    await queryInterface.addConstraint('documents', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'documents_ibfk_1',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 4. Recria FK reviewed_by
    await queryInterface.addConstraint('documents', {
      fields: ['reviewed_by'],
      type: 'foreign key',
      name: 'documents_ibfk_2',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 5. Reverte índices
    await queryInterface.removeIndex('documents', 'idx_documents_student_id');
    await queryInterface.addIndex('documents', ['user_id'], {
      name: 'idx_documents_user_id',
    });

    await queryInterface.removeIndex('documents', 'idx_documents_student_doctype');
    await queryInterface.addIndex('documents', ['user_id', 'document_type_id'], {
      name: 'idx_documents_user_doctype',
    });
  },
};
