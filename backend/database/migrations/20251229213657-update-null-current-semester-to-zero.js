'use strict';

/**
 * Migration: Atualiza current_semester de NULL para 0 em enrollments existentes
 *
 * Corrige registros existentes que foram criados antes da alteração do default value
 * de NULL para 0. Isso garante que todos os enrollments tenham current_semester = 0
 * quando ainda não iniciaram o curso.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE enrollments
      SET current_semester = 0
      WHERE current_semester IS NULL
    `);
  },

  async down (queryInterface, Sequelize) {
    // Reverter a mudança não faz sentido, pois o valor NULL não tem significado semântico
    // Mas para manter a reversibilidade da migration, incluímos a operação contrária
    await queryInterface.sequelize.query(`
      UPDATE enrollments
      SET current_semester = NULL
      WHERE current_semester = 0
    `);
  }
};
