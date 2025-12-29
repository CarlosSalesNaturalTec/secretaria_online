/**
 * Migration: Adiciona status 'contract' ao ENUM de status da tabela enrollments
 * Descrição: Adiciona novo valor 'contract' para indicar que matrícula está aguardando aceite de contrato
 * Criado em: 2025-12-29
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona o valor 'contract' ao ENUM de status
    await queryInterface.sequelize.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending', 'active', 'cancelled', 'reenrollment', 'canceled', 'completed', 'contract')
      NOT NULL DEFAULT 'pending'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove o valor 'contract' do ENUM de status (retorna ao estado anterior)
    await queryInterface.sequelize.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending', 'active', 'cancelled', 'reenrollment', 'canceled', 'completed')
      NOT NULL DEFAULT 'pending'
    `);
  },
};
