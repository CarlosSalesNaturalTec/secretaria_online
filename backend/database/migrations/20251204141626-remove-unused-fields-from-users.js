'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove campos que agora pertencem às tabelas students e teachers
    await queryInterface.removeColumn('users', 'cpf');
    await queryInterface.removeColumn('users', 'rg');
    await queryInterface.removeColumn('users', 'voter_title');
    await queryInterface.removeColumn('users', 'reservist');
    await queryInterface.removeColumn('users', 'mother_name');
    await queryInterface.removeColumn('users', 'father_name');
    await queryInterface.removeColumn('users', 'address');
  },

  async down (queryInterface, Sequelize) {
    // Recriar os campos removidos caso seja necessário reverter
    await queryInterface.addColumn('users', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: true,
      unique: true
    });
    await queryInterface.addColumn('users', 'rg', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'voter_title', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'reservist', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'mother_name', {
      type: Sequelize.STRING(150),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'father_name', {
      type: Sequelize.STRING(150),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
