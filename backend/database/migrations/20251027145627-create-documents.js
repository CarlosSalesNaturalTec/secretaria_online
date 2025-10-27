/**
 * Arquivo: backend/database/migrations/20251027145627-create-documents.js
 * Descrição: Migration para criar tabela documents que armazena os documentos enviados pelos usuários
 * Feature: feat-012 - Criar migrations para Document e DocumentType
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do documento',
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID do usuário que enviou o documento (FK para users)',
      },
      document_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'document_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID do tipo de documento (FK para document_types)',
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Caminho do arquivo no servidor',
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nome original do arquivo',
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tamanho do arquivo em bytes',
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Tipo MIME do arquivo (ex: application/pdf, image/jpeg)',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status de aprovação do documento',
      },
      reviewed_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID do usuário admin que revisou o documento (FK para users)',
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora da revisão (aprovação/rejeição)',
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações do revisor sobre o documento',
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
    await queryInterface.addIndex('documents', ['user_id'], {
      name: 'idx_documents_user_id',
    });

    await queryInterface.addIndex('documents', ['document_type_id'], {
      name: 'idx_documents_document_type_id',
    });

    await queryInterface.addIndex('documents', ['status'], {
      name: 'idx_documents_status',
    });

    await queryInterface.addIndex('documents', ['reviewed_by'], {
      name: 'idx_documents_reviewed_by',
    });

    await queryInterface.addIndex('documents', ['created_at'], {
      name: 'idx_documents_created_at',
    });

    await queryInterface.addIndex('documents', ['deleted_at'], {
      name: 'idx_documents_deleted_at',
    });

    // Índice composto para buscar documentos de um usuário por tipo
    await queryInterface.addIndex('documents', ['user_id', 'document_type_id'], {
      name: 'idx_documents_user_doctype',
    });

    // Índice composto para buscar documentos pendentes
    await queryInterface.addIndex(
      'documents',
      ['status', 'created_at'],
      {
        name: 'idx_documents_status_created',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents');
  },
};
