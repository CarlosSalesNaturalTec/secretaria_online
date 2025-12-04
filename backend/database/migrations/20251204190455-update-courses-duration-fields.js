'use strict';

/**
 * Migration: Update courses duration fields
 *
 * Altera estrutura da tabela courses:
 * - Remove campo duration_semesters
 * - Adiciona campo duration (INTEGER)
 * - Adiciona campo duration_type (STRING)
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar novos campos
    await queryInterface.addColumn('courses', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Duração do curso (valor numérico)',
    });

    await queryInterface.addColumn('courses', 'duration_type', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Semestres',
      comment: 'Tipo de duração (Semestres, Dias, Horas, Meses, Anos)',
    });

    // Migrar dados existentes (converter duration_semesters para duration com tipo Semestres)
    await queryInterface.sequelize.query(`
      UPDATE courses
      SET duration = duration_semesters,
          duration_type = 'Semestres'
      WHERE duration_semesters IS NOT NULL
    `);

    // Remover campo antigo
    await queryInterface.removeColumn('courses', 'duration_semesters');
  },

  async down(queryInterface, Sequelize) {
    // Recriar campo antigo
    await queryInterface.addColumn('courses', 'duration_semesters', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Duração em semestres',
    });

    // Restaurar dados (apenas se duration_type for 'Semestres')
    await queryInterface.sequelize.query(`
      UPDATE courses
      SET duration_semesters = duration
      WHERE duration_type = 'Semestres'
    `);

    // Remover novos campos
    await queryInterface.removeColumn('courses', 'duration_type');
    await queryInterface.removeColumn('courses', 'duration');
  }
};
