/**
 * Arquivo: backend/database/migrations/20251026215825-create-class-teachers.js
 * Descrição: Migration para criação da tabela class_teachers (relação turma-professor-disciplina)
 * Feature: feat-010 - Criar migrations para Class e relacionamentos
 * Criado em: 2025-10-26
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela class_teachers
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_teachers', {
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
      teacher_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de professor com turmas ativas
        comment: 'ID do professor (usuário com role teacher)'
      },
      discipline_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplines',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevenir exclusão de disciplina com turmas ativas
        comment: 'ID da disciplina que o professor leciona nesta turma'
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
      comment: 'Tabela pivot para relacionamento N:N entre turmas, professores e disciplinas'
    });

    // Índice único composto para evitar duplicação:
    // Um professor não pode lecionar a mesma disciplina na mesma turma mais de uma vez
    await queryInterface.addIndex('class_teachers', ['class_id', 'teacher_id', 'discipline_id'], {
      name: 'idx_class_teachers_unique',
      unique: true
    });

    // Índice para otimizar consultas por turma
    await queryInterface.addIndex('class_teachers', ['class_id'], {
      name: 'idx_class_teachers_class_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por professor
    await queryInterface.addIndex('class_teachers', ['teacher_id'], {
      name: 'idx_class_teachers_teacher_id',
      using: 'BTREE'
    });

    // Índice para otimizar consultas por disciplina
    await queryInterface.addIndex('class_teachers', ['discipline_id'], {
      name: 'idx_class_teachers_discipline_id',
      using: 'BTREE'
    });

    // Índice composto para consultas de professores por turma
    await queryInterface.addIndex('class_teachers', ['class_id', 'teacher_id'], {
      name: 'idx_class_teachers_class_teacher',
      using: 'BTREE'
    });
  },

  /**
   * Reverte a migration - remove a tabela class_teachers
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('class_teachers');
  }
};
