/**
 * Arquivo: database/migrations/20251026131903-create-courses.js
 * Descrição: Migration para criar tabela courses (cursos)
 * Feature: feat-008 - Criar migrations para Course e Discipline
 * Criado em: 2025-10-26
 *
 * Estrutura da tabela courses:
 * - id: Identificador único (PK, auto-increment)
 * - name: Nome do curso (obrigatório, único)
 * - description: Descrição detalhada do curso (opcional, text)
 * - duration_semesters: Duração do curso em semestres (obrigatório, >= 1)
 * - created_at, updated_at: Timestamps automáticos
 * - deleted_at: Soft delete (exclusão lógica)
 *
 * Índices:
 * - PRIMARY KEY (id)
 * - UNIQUE (name) - Evita cursos duplicados
 * - INDEX (deleted_at) - Otimiza queries com soft delete
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Executa a migration (cria a tabela courses)
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para executar queries
   * @param {import('sequelize')} Sequelize - Biblioteca Sequelize
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do curso'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
        comment: 'Nome do curso (ex: Administração, Enfermagem)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do curso, objetivos, área de atuação'
      },
      duration_semesters: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        },
        comment: 'Duração do curso em semestres (ex: 6, 8, 10)'
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
        comment: 'Data de exclusão lógica (soft delete) - NULL se ativo'
      }
    }, {
      comment: 'Tabela de cursos oferecidos pela instituição'
    });

    // Índice único para evitar nomes duplicados (case-insensitive)
    await queryInterface.addIndex('courses', ['name'], {
      name: 'courses_name_unique',
      unique: true
    });

    // Índice para otimizar queries com soft delete
    await queryInterface.addIndex('courses', ['deleted_at'], {
      name: 'courses_deleted_at_index'
    });

    console.log('✓ Tabela courses criada com sucesso');
  },

  /**
   * Reverte a migration (remove a tabela courses)
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para executar queries
   * @param {import('sequelize')} Sequelize - Biblioteca Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('courses');
    console.log('✓ Tabela courses removida');
  }
};
