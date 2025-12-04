'use strict';

/**
 * Migration: Corrige duration_type de 'Semestre' para 'Semestres'
 *
 * Atualiza registros existentes que usam 'Semestre' para 'Semestres'
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Atualizar registros que têm 'Semestre' para 'Semestres'
    await queryInterface.sequelize.query(`
      UPDATE courses
      SET duration_type = 'Semestres'
      WHERE duration_type = 'Semestre'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Reverter para 'Semestre' caso necessário
    await queryInterface.sequelize.query(`
      UPDATE courses
      SET duration_type = 'Semestre'
      WHERE duration_type = 'Semestres'
    `);
  }
};
