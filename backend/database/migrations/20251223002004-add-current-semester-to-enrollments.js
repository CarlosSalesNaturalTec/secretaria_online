'use strict';

/**
 * Migration: Adiciona campo current_semester à tabela enrollments
 *
 * Adiciona:
 * - current_semester: INTEGER - semestre atual do aluno no curso (0 = não iniciado, 1-12 = semestres cursados)
 *
 * Isso permite rastrear em qual semestre acadêmico o aluno está no curso,
 * similar ao campo cliente_semestre do sistema antigo.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('enrollments', 'current_semester', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Semestre atual do aluno no curso (0 = não iniciado, 1-12 = semestres cursados)',
      after: 'enrollment_date'
    });

    // Adiciona índice para facilitar queries por semestre
    await queryInterface.addIndex('enrollments', ['current_semester'], {
      name: 'idx_enrollments_current_semester'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('enrollments', 'idx_enrollments_current_semester');
    await queryInterface.removeColumn('enrollments', 'current_semester');
  }
};
