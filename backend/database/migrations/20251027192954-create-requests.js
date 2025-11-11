/**
 * Arquivo: database/migrations/20251027192954-create-requests.js
 * Descrição: Migration para criar a tabela requests - solicitações feitas por alunos
 * Feature: feat-015 - Criar migrations para Request e RequestType
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'FK para users - aluno que fez a solicitação',
      },
      request_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'request_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'FK para request_types - tipo de solicitação',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição/justificativa da solicitação fornecida pelo aluno',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status da solicitação: pending (pendente), approved (aprovada), rejected (rejeitada)',
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
        comment: 'FK para users - admin que revisou a solicitação',
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora da revisão',
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações do revisor sobre a aprovação/rejeição',
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
    await queryInterface.addIndex('requests', ['student_id'], {
      name: 'idx_requests_student_id',
      comment: 'Índice para buscar solicitações por aluno',
    });

    await queryInterface.addIndex('requests', ['request_type_id'], {
      name: 'idx_requests_request_type_id',
      comment: 'Índice para buscar solicitações por tipo',
    });

    await queryInterface.addIndex('requests', ['status'], {
      name: 'idx_requests_status',
      comment: 'Índice para filtrar solicitações por status',
    });

    await queryInterface.addIndex('requests', ['reviewed_by'], {
      name: 'idx_requests_reviewed_by',
      comment: 'Índice para buscar solicitações revisadas por admin',
    });

    await queryInterface.addIndex('requests', ['created_at'], {
      name: 'idx_requests_created_at',
      comment: 'Índice para ordenação por data de criação',
    });

    await queryInterface.addIndex('requests', ['deleted_at'], {
      name: 'idx_requests_deleted_at',
      comment: 'Índice para soft delete',
    });

    // Índices compostos
    await queryInterface.addIndex('requests', ['student_id', 'status'], {
      name: 'idx_requests_student_status',
      comment: 'Índice composto para buscar solicitações de um aluno por status',
    });

    await queryInterface.addIndex('requests', ['status', 'created_at'], {
      name: 'idx_requests_status_created',
      comment: 'Índice composto para filtrar por status e ordenar por data',
    });

    await queryInterface.addIndex('requests', ['student_id', 'deleted_at'], {
      name: 'idx_requests_student_active',
      comment: 'Índice composto para solicitações ativas do aluno',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove índices
    await queryInterface.removeIndex('requests', 'idx_requests_student_id');
    await queryInterface.removeIndex('requests', 'idx_requests_request_type_id');
    await queryInterface.removeIndex('requests', 'idx_requests_status');
    await queryInterface.removeIndex('requests', 'idx_requests_reviewed_by');
    await queryInterface.removeIndex('requests', 'idx_requests_created_at');
    await queryInterface.removeIndex('requests', 'idx_requests_deleted_at');
    await queryInterface.removeIndex('requests', 'idx_requests_student_status');
    await queryInterface.removeIndex('requests', 'idx_requests_status_created');
    await queryInterface.removeIndex('requests', 'idx_requests_student_active');

    // Remove tabela
    await queryInterface.dropTable('requests');
  },
};
