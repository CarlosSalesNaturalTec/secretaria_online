'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove colunas curso, serie e semestre da tabela students
    await queryInterface.removeColumn('students', 'curso');
    await queryInterface.removeColumn('students', 'serie');
    await queryInterface.removeColumn('students', 'semestre');
  },

  async down(queryInterface, Sequelize) {
    // Recriar as colunas removidas (rollback)
    await queryInterface.addColumn('students', 'serie', {
      type: Sequelize.STRING(35),
      allowNull: true,
      comment: 'Série/Período',
    });

    await queryInterface.addColumn('students', 'curso', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Curso',
    });

    await queryInterface.addColumn('students', 'semestre', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Semestre atual',
    });
  }
};
