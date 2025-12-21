'use strict';

/**
 * Migration: Adiciona campos para preservar informações do semestre original do sistema antigo
 *
 * Adiciona à tabela evaluations:
 * - original_semester: número do semestre extraído (1-12)
 * - original_course_name: nome do curso do sistema antigo
 * - original_semester_raw: valor bruto do campo "semestre" do CSV para referência
 *
 * Isso permite rastrear de qual semestre do sistema antigo cada avaliação histórica veio.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('evaluations', 'original_semester', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Número do semestre extraído do sistema antigo (1-12)',
      after: 'type'
    });

    await queryInterface.addColumn('evaluations', 'original_course_name', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Nome do curso do sistema antigo',
      after: 'original_semester'
    });

    await queryInterface.addColumn('evaluations', 'original_semester_raw', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Valor bruto do campo "semestre" do CSV (ex: "1° Psicologia")',
      after: 'original_course_name'
    });

    // Adiciona índice para facilitar queries por semestre original
    await queryInterface.addIndex('evaluations', ['original_semester'], {
      name: 'idx_evaluations_original_semester'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('evaluations', 'idx_evaluations_original_semester');
    await queryInterface.removeColumn('evaluations', 'original_semester_raw');
    await queryInterface.removeColumn('evaluations', 'original_course_name');
    await queryInterface.removeColumn('evaluations', 'original_semester');
  }
};
