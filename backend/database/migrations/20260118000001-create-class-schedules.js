/**
 * Arquivo: backend/database/migrations/20260118000001-create-class-schedules.js
 * Descrição: Migration para criação da tabela class_schedules (grade de horários das turmas)
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela class_schedules
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do horário'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Turma associada ao horário'
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
        comment: 'Disciplina ministrada neste horário'
      },
      teacher_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Professor que ministra a aula (opcional)'
      },
      day_of_week: {
        type: Sequelize.TINYINT,
        allowNull: false,
        comment: 'Dia da semana: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo'
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
      online_link: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL da aula online (Google Meet, Zoom, Teams, etc)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora de criação do registro'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Data e hora da última atualização'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Data e hora da exclusão lógica (soft delete)'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Tabela de grade de horários - armazena os horários de aulas das turmas'
    });

    // Índice para otimizar buscas por turma
    await queryInterface.addIndex('class_schedules', ['class_id'], {
      name: 'idx_class_schedules_class_id',
      using: 'BTREE'
    });

    // Índice para otimizar buscas por disciplina
    await queryInterface.addIndex('class_schedules', ['discipline_id'], {
      name: 'idx_class_schedules_discipline_id',
      using: 'BTREE'
    });

    // Índice para otimizar buscas por professor
    await queryInterface.addIndex('class_schedules', ['teacher_id'], {
      name: 'idx_class_schedules_teacher_id',
      using: 'BTREE'
    });

    // Índice para otimizar filtros por dia da semana
    await queryInterface.addIndex('class_schedules', ['day_of_week'], {
      name: 'idx_class_schedules_day_of_week',
      using: 'BTREE'
    });

    // Índice composto para otimizar buscas por turma e dia
    await queryInterface.addIndex('class_schedules', ['class_id', 'day_of_week'], {
      name: 'idx_class_schedules_class_day',
      using: 'BTREE'
    });

    // Índice para otimizar queries de soft delete
    await queryInterface.addIndex('class_schedules', ['deleted_at'], {
      name: 'idx_class_schedules_deleted_at',
      using: 'BTREE'
    });

    // Índice único para garantir que não haja horários duplicados
    // (mesma turma, disciplina, dia e horário de início)
    await queryInterface.addIndex('class_schedules', ['class_id', 'discipline_id', 'day_of_week', 'start_time'], {
      name: 'idx_class_schedules_unique',
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  /**
   * Reverte a migration - remove a tabela class_schedules
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('class_schedules');
  }
};
