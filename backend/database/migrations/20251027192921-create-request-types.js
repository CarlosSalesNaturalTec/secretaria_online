/**
 * Arquivo: database/migrations/20251027192921-create-request-types.js
 * Descrição: Migration para criar a tabela request_types - tipos de solicitações que alunos podem fazer
 * Feature: feat-015 - Criar migrations para Request e RequestType
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome do tipo de solicitação (ex: Atestado, Histórico Escolar)',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do tipo de solicitação',
      },
      response_deadline_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: 'Prazo de resposta em dias úteis',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Define se o tipo de solicitação está ativo/disponível',
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
    await queryInterface.addIndex('request_types', ['name'], {
      name: 'idx_request_types_name',
      comment: 'Índice para busca por nome',
    });

    await queryInterface.addIndex('request_types', ['is_active'], {
      name: 'idx_request_types_is_active',
      comment: 'Índice para filtrar tipos ativos',
    });

    await queryInterface.addIndex('request_types', ['deleted_at'], {
      name: 'idx_request_types_deleted_at',
      comment: 'Índice para soft delete',
    });

    // Índice composto para tipos de solicitações disponíveis
    await queryInterface.addIndex('request_types', ['is_active', 'deleted_at'], {
      name: 'idx_request_types_available',
      comment: 'Índice composto para tipos de solicitações ativos e não deletados',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove índices
    await queryInterface.removeIndex('request_types', 'idx_request_types_name');
    await queryInterface.removeIndex(
      'request_types',
      'idx_request_types_is_active'
    );
    await queryInterface.removeIndex(
      'request_types',
      'idx_request_types_deleted_at'
    );
    await queryInterface.removeIndex(
      'request_types',
      'idx_request_types_available'
    );

    // Remove tabela
    await queryInterface.dropTable('request_types');
  },
};
