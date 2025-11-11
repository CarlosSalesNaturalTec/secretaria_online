/**
 * Arquivo: backend/database/migrations/20251027145519-create-document-types.js
 * Descrição: Migration para criar tabela document_types que armazena os tipos de documentos obrigatórios
 * Feature: feat-012 - Criar migrations para Document e DocumentType
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('document_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do tipo de documento',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome do tipo de documento (ex: RG, CPF, Histórico Escolar)',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do tipo de documento',
      },
      user_type: {
        type: Sequelize.ENUM('student', 'teacher', 'both'),
        allowNull: false,
        defaultValue: 'both',
        comment: 'Define para qual tipo de usuário este documento é obrigatório',
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Define se o documento é obrigatório',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete - data de exclusão lógica',
      },
    });

    // Índices otimizados
    await queryInterface.addIndex('document_types', ['name'], {
      name: 'idx_document_types_name',
    });

    await queryInterface.addIndex('document_types', ['user_type'], {
      name: 'idx_document_types_user_type',
    });

    await queryInterface.addIndex('document_types', ['is_required'], {
      name: 'idx_document_types_is_required',
    });

    // Índice para tipos de documentos ativos (não deletados)
    await queryInterface.addIndex('document_types', ['deleted_at'], {
      name: 'idx_document_types_deleted_at',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('document_types');
  },
};
