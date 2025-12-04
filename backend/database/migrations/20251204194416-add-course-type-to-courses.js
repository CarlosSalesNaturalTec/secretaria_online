'use strict';

/**
 * Migration: Adiciona campo course_type à tabela courses
 *
 * Adiciona campo para categorizar o tipo de curso
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'course_type', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Superior',
      comment: 'Tipo de curso (Mestrado/Doutorado, Cursos de Verão, Pós graduação, Superior, Supletivo/EJA, Técnicos)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'course_type');
  }
};
