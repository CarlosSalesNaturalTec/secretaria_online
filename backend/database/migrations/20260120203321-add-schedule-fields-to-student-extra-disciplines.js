'use strict';

/**
 * Migration: Adicionar campos de horário em student_extra_disciplines
 * Descrição: Adiciona campos day_of_week, start_time, end_time e online_link
 *            para que cada disciplina extra tenha seu próprio horário individual
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Data: 2026-01-20
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('student_extra_disciplines', 'day_of_week', {
      type: Sequelize.TINYINT,
      allowNull: true,
      comment: 'Dia da semana: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo',
      after: 'class_id'
    });

    await queryInterface.addColumn('student_extra_disciplines', 'start_time', {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Horário de início da aula (formato HH:MM:SS)',
      after: 'day_of_week'
    });

    await queryInterface.addColumn('student_extra_disciplines', 'end_time', {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Horário de término da aula (formato HH:MM:SS)',
      after: 'start_time'
    });

    await queryInterface.addColumn('student_extra_disciplines', 'online_link', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL da aula online (Google Meet, Zoom, Teams, etc) - campo opcional',
      after: 'end_time'
    });

    // Adicionar índice para otimizar buscas por dia da semana
    await queryInterface.addIndex('student_extra_disciplines', ['day_of_week'], {
      name: 'idx_student_extra_disciplines_day_of_week'
    });

    // Adicionar índice composto para student_id + day_of_week
    await queryInterface.addIndex('student_extra_disciplines', ['student_id', 'day_of_week'], {
      name: 'idx_student_extra_disciplines_student_day'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('student_extra_disciplines', 'idx_student_extra_disciplines_student_day');
    await queryInterface.removeIndex('student_extra_disciplines', 'idx_student_extra_disciplines_day_of_week');

    // Remover colunas
    await queryInterface.removeColumn('student_extra_disciplines', 'online_link');
    await queryInterface.removeColumn('student_extra_disciplines', 'end_time');
    await queryInterface.removeColumn('student_extra_disciplines', 'start_time');
    await queryInterface.removeColumn('student_extra_disciplines', 'day_of_week');
  }
};
