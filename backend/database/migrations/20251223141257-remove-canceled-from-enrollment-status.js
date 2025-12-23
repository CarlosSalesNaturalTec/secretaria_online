/**
 * Migration: Remove status 'canceled' do ENUM de status da tabela enrollments
 * Mantém apenas 'cancelled' (padrão inglês britânico)
 * Criado em: 2025-12-23
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove o valor 'canceled' do ENUM de status
    await queryInterface.sequelize.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending', 'active', 'cancelled', 'reenrollment', 'completed')
      NOT NULL DEFAULT 'pending'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Adiciona de volta o valor 'canceled' ao ENUM de status
    await queryInterface.sequelize.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending', 'active', 'cancelled', 'reenrollment', 'canceled', 'completed')
      NOT NULL DEFAULT 'pending'
    `);
  },
};
