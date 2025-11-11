/**
 * Arquivo: backend/database/migrations/20251026215909-create-class-students.js
 * Descrição: Migration para criação da tabela class_students (relação turma-aluno)
 * Feature: feat-010 - Criar migrations para Class e relacionamentos
 * Criado em: 2025-10-26
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela class_students
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_students', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do relacionamento'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Se a turma for deletada, remove os vínculos
        comment: 'ID da turma'
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de aluno com turmas ativas
        comment: 'ID do aluno (usuário com role student)'
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
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Tabela pivot para relacionamento N:N entre turmas e alunos'
    });

    // Índice único composto para evitar duplicação:
    // Um aluno não pode estar vinculado à mesma turma mais de uma vez
    await queryInterface.addIndex('class_students', ['class_id', 'student_id'], {
      name: 'idx_class_students_unique',
      unique: true
    });

    // Índice para otimizar consultas por turma
    await queryInterface.addIndex('class_students', ['class_id'], {
      name: 'idx_class_students_class_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por aluno
    await queryInterface.addIndex('class_students', ['student_id'], {
      name: 'idx_class_students_student_id',
      using: 'BTREE'
    });
  },

  /**
   * Reverte a migration - remove a tabela class_students
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('class_students');
  }
};
