/**
 * Arquivo: backend/database/migrations/20251027181314-create-evaluations.js
 * Descrição: Migration para criação da tabela evaluations (avaliações)
 * Feature: feat-014 - Criar migrations para Evaluation e Grade
 * Criado em: 2025-10-27
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela evaluations
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('evaluations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único da avaliação'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de turma com avaliações
        comment: 'ID da turma à qual a avaliação pertence'
      },
      teacher_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de professor com avaliações
        comment: 'ID do professor que criou a avaliação'
      },
      discipline_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplines',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID da disciplina avaliada'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome da avaliação (ex: Prova 1, Trabalho Final, etc.)'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Data da avaliação'
      },
      type: {
        type: Sequelize.ENUM('grade', 'concept'),
        allowNull: false,
        defaultValue: 'grade',
        comment: 'Tipo de avaliação: grade (nota 0-10) ou concept (satisfatório/não satisfatório)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data de criação do registro'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Data da última atualização do registro'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Data de exclusão lógica (soft delete)'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Tabela de avaliações - provas, trabalhos e atividades avaliativas'
    });

    // Índice para otimizar consultas por turma
    await queryInterface.addIndex('evaluations', ['class_id'], {
      name: 'idx_evaluations_class_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por professor
    await queryInterface.addIndex('evaluations', ['teacher_id'], {
      name: 'idx_evaluations_teacher_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por disciplina
    await queryInterface.addIndex('evaluations', ['discipline_id'], {
      name: 'idx_evaluations_discipline_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por data
    await queryInterface.addIndex('evaluations', ['date'], {
      name: 'idx_evaluations_date',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por tipo
    await queryInterface.addIndex('evaluations', ['type'], {
      name: 'idx_evaluations_type',
      using: 'BTREE'
    });

    // Índice para soft delete
    await queryInterface.addIndex('evaluations', ['deleted_at'], {
      name: 'idx_evaluations_deleted_at',
      using: 'BTREE'
    });

    // Índice composto para consultas de avaliações ativas de uma turma
    await queryInterface.addIndex('evaluations', ['class_id', 'deleted_at'], {
      name: 'idx_evaluations_class_active',
      using: 'BTREE'
    });

    // Índice composto para consultas de avaliações por turma e disciplina
    await queryInterface.addIndex('evaluations', ['class_id', 'discipline_id'], {
      name: 'idx_evaluations_class_discipline',
      using: 'BTREE'
    });

    // Índice composto para consultas de avaliações por professor e turma
    await queryInterface.addIndex('evaluations', ['teacher_id', 'class_id'], {
      name: 'idx_evaluations_teacher_class',
      using: 'BTREE'
    });
  },

  /**
   * Reverte a migration - remove a tabela evaluations
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evaluations');
  }
};
