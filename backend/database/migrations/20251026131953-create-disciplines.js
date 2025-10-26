/**
 * Arquivo: database/migrations/20251026131953-create-disciplines.js
 * Descrição: Migration para criar tabela disciplines (disciplinas)
 * Feature: feat-008 - Criar migrations para Course e Discipline
 * Criado em: 2025-10-26
 *
 * Estrutura da tabela disciplines:
 * - id: Identificador único (PK, auto-increment)
 * - name: Nome da disciplina (obrigatório)
 * - code: Código identificador da disciplina (obrigatório, único)
 * - workload_hours: Carga horária em horas (obrigatório, >= 1)
 * - created_at, updated_at: Timestamps automáticos
 * - deleted_at: Soft delete (exclusão lógica)
 *
 * Índices:
 * - PRIMARY KEY (id)
 * - UNIQUE (code) - Evita códigos duplicados
 * - INDEX (name) - Otimiza buscas por nome
 * - INDEX (deleted_at) - Otimiza queries com soft delete
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Executa a migration (cria a tabela disciplines)
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para executar queries
   * @param {import('sequelize')} Sequelize - Biblioteca Sequelize
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('disciplines', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da disciplina'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Nome da disciplina (ex: Matemática Aplicada, Anatomia Humana)'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código identificador da disciplina (ex: MAT101, ANA201)'
      },
      workload_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        },
        comment: 'Carga horária da disciplina em horas (ex: 60, 80, 120)'
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
        comment: 'Data de exclusão lógica (soft delete) - NULL se ativa'
      }
    }, {
      comment: 'Tabela de disciplinas oferecidas nos cursos'
    });

    // Índice único para código da disciplina
    await queryInterface.addIndex('disciplines', ['code'], {
      name: 'disciplines_code_unique',
      unique: true
    });

    // Índice para otimizar buscas por nome
    await queryInterface.addIndex('disciplines', ['name'], {
      name: 'disciplines_name_index'
    });

    // Índice para otimizar queries com soft delete
    await queryInterface.addIndex('disciplines', ['deleted_at'], {
      name: 'disciplines_deleted_at_index'
    });

    console.log('✓ Tabela disciplines criada com sucesso');
  },

  /**
   * Reverte a migration (remove a tabela disciplines)
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para executar queries
   * @param {import('sequelize')} Sequelize - Biblioteca Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('disciplines');
    console.log('✓ Tabela disciplines removida');
  }
};
