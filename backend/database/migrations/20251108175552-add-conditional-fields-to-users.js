'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add conditional fields to users table
     * These fields are required for students and teachers, but optional for admins
     * - voter_title: Título de eleitor (voter registration)
     * - reservist: Número de reservista (military reserve registration)
     * - mother_name: Nome da mãe (mother's name)
     * - father_name: Nome do pai (father's name)
     * - address: Endereço (residential address)
     */
    await queryInterface.addColumn('users', 'voter_title', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Título de eleitor - optional for admin, required for students and teachers'
    });

    await queryInterface.addColumn('users', 'reservist', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Número de reservista - optional for admin, required for students and teachers'
    });

    await queryInterface.addColumn('users', 'mother_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Nome da mãe - optional for admin, required for students and teachers'
    });

    await queryInterface.addColumn('users', 'father_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Nome do pai - optional for admin, required for students and teachers'
    });

    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Endereço residencial - optional for admin, required for students and teachers'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Revert the conditional fields from users table
     */
    await queryInterface.removeColumn('users', 'voter_title');
    await queryInterface.removeColumn('users', 'reservist');
    await queryInterface.removeColumn('users', 'mother_name');
    await queryInterface.removeColumn('users', 'father_name');
    await queryInterface.removeColumn('users', 'address');
  }
};
