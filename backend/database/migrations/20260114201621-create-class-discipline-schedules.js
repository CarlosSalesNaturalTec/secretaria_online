/**
 * Arquivo: backend/database/migrations/20260114201621-create-class-discipline-schedules.js
 * Descrição: Migration para criação da tabela class_discipline_schedules (horários das disciplinas da turma)
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela class_discipline_schedules
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_discipline_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do horário'
      },
      class_teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'class_teachers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Se o vínculo professor-disciplina-turma for deletado, remove os horários
        comment: 'ID da relação turma-professor-disciplina'
      },
      day_of_week: {
        type: Sequelize.ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'),
        allowNull: false,
        comment: 'Dia da semana da aula'
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Horário de início da aula (formato HH:MM:SS)'
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Horário de término da aula (formato HH:MM:SS)'
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
      comment: 'Tabela de horários das disciplinas por turma (grade de horários)'
    });

    // Índice para otimizar consultas por class_teacher
    await queryInterface.addIndex('class_discipline_schedules', ['class_teacher_id'], {
      name: 'idx_class_discipline_schedules_class_teacher',
      using: 'BTREE'
    });

    // Índice composto para evitar duplicação de horários no mesmo dia
    await queryInterface.addIndex('class_discipline_schedules', ['class_teacher_id', 'day_of_week', 'start_time'], {
      name: 'idx_class_discipline_schedules_unique',
      unique: true
    });

    // Índice para otimizar consultas por dia da semana
    await queryInterface.addIndex('class_discipline_schedules', ['day_of_week'], {
      name: 'idx_class_discipline_schedules_day',
      using: 'BTREE'
    });
  },

  /**
   * Reverte a migration - remove a tabela class_discipline_schedules
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('class_discipline_schedules');
  }
};
