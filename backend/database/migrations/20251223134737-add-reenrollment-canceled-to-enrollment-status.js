/**
 * Migration: Adiciona novos status 'reenrollment' e 'canceled' ao ENUM de status da tabela enrollments
 * Criado em: 2025-12-23
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona os novos valores ao ENUM de status
    await queryInterface.sequelize.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending', 'active', 'cancelled', 'reenrollment', 'canceled')
      NOT NULL DEFAULT 'pending'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove os novos valores do ENUM de status (retorna ao estado anterior)
    await queryInterface.sequelize.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending', 'active', 'cancelled')
      NOT NULL DEFAULT 'pending'
    `);
  },
};
