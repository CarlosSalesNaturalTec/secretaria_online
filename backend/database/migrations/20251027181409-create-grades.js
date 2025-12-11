/**
 * Arquivo: backend/database/migrations/20251027181409-create-grades.js
 * Descrição: Migration para criação da tabela grades (notas)
 * Feature: feat-014 - Criar migrations para Evaluation e Grade
 * Criado em: 2025-10-27
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela grades
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grades', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único da nota'
      },
      evaluation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'evaluations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Se avaliação for deletada, remover notas
        comment: 'ID da avaliação à qual a nota pertence'
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de aluno com notas
        comment: 'ID do aluno que recebeu a nota'
      },
      grade: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Nota numérica (0.00 a 10.00) - usado quando evaluation.type = "grade"'
      },
      concept: {
        type: Sequelize.ENUM('satisfactory', 'unsatisfactory'),
        allowNull: true,
        defaultValue: null,
        comment: 'Conceito - usado quando evaluation.type = "concept"'
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
      comment: 'Tabela de notas - armazena as notas dos alunos nas avaliações'
    });

    // Índice para otimizar consultas por avaliação
    await queryInterface.addIndex('grades', ['evaluation_id'], {
      name: 'idx_grades_evaluation_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por aluno
    await queryInterface.addIndex('grades', ['student_id'], {
      name: 'idx_grades_student_id',
      using: 'BTREE'
    });

    // Índice único composto para evitar duplicação de nota do mesmo aluno na mesma avaliação
    await queryInterface.addIndex('grades', ['evaluation_id', 'student_id'], {
      name: 'idx_grades_unique_evaluation_student',
      unique: true,
      where: {
        deleted_at: null // Único apenas para registros não deletados
      }
    });

    // Índice para soft delete
    await queryInterface.addIndex('grades', ['deleted_at'], {
      name: 'idx_grades_deleted_at',
      using: 'BTREE'
    });

    // Índice composto para consultas de notas ativas de um aluno
    await queryInterface.addIndex('grades', ['student_id', 'deleted_at'], {
      name: 'idx_grades_student_active',
      using: 'BTREE'
    });

    // Índice para ordenação de criação (para ver notas mais recentes)
    await queryInterface.addIndex('grades', ['created_at'], {
      name: 'idx_grades_created_at',
      using: 'BTREE'
    });

    // Adicionar constraint CHECK para garantir que grade esteja entre 0 e 10
    // Nota: MySQL 8.0.16+ suporta CHECK constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE grades
      ADD CONSTRAINT chk_grades_grade_range
      CHECK (grade IS NULL OR (grade >= 0.00 AND grade <= 10.00))
    `);

    // Adicionar constraint CHECK para garantir que apenas grade OU concept esteja preenchido
    // (não ambos e não nenhum)
    await queryInterface.sequelize.query(`
      ALTER TABLE grades
      ADD CONSTRAINT chk_grades_grade_or_concept
      CHECK (
        (grade IS NOT NULL AND concept IS NULL) OR
        (grade IS NULL AND concept IS NOT NULL)
      )
    `);
  },

  /**
   * Reverte a migration - remove a tabela grades
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('grades');
  }
};
