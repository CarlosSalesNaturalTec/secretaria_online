/**
 * Arquivo: backend/database/migrations/20251026215729-create-classes.js
 * Descrição: Migration para criação da tabela classes (turmas)
 * Feature: feat-010 - Criar migrations para Class e relacionamentos
 * Criado em: 2025-10-26
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela classes
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('classes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único da turma'
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de curso com turmas ativas
        comment: 'ID do curso ao qual a turma pertence'
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12 // Máximo de 12 semestres (6 anos)
        },
        comment: 'Número do semestre da turma (1-12)'
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 2020,
          max: 2100
        },
        comment: 'Ano da turma'
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
      comment: 'Tabela de turmas - agrupa alunos em um curso/semestre específico'
    });

    // Índice para otimizar consultas por curso
    await queryInterface.addIndex('classes', ['course_id'], {
      name: 'idx_classes_course_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por semestre/ano
    await queryInterface.addIndex('classes', ['semester', 'year'], {
      name: 'idx_classes_semester_year',
      using: 'BTREE'
    });

    // Índice único composto para evitar duplicação de turma no mesmo curso/semestre/ano
    await queryInterface.addIndex('classes', ['course_id', 'semester', 'year'], {
      name: 'idx_classes_unique_course_semester_year',
      unique: true,
      where: {
        deleted_at: null // Único apenas para registros não deletados
      }
    });

    // Índice para soft delete
    await queryInterface.addIndex('classes', ['deleted_at'], {
      name: 'idx_classes_deleted_at',
      using: 'BTREE'
    });

    // Índice para consultas de turmas ativas (deleted_at IS NULL)
    await queryInterface.addIndex('classes', ['course_id', 'deleted_at'], {
      name: 'idx_classes_active',
      using: 'BTREE'
    });
  },

  /**
   * Reverte a migration - remove a tabela classes
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('classes');
  }
};
