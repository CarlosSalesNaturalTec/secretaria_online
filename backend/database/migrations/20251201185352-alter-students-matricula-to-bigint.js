/**
 * Arquivo: database/migrations/20251201185352-alter-students-matricula-to-bigint.js
 * Descrição: Altera coluna matricula de INT para BIGINT para suportar números maiores
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-12-01
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Alterar tipo da coluna matricula de INT para BIGINT
    await queryInterface.changeColumn('students', 'matricula', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Número de matrícula',
    });

    console.log('✓ Coluna matricula alterada para BIGINT com sucesso');
  },

  async down(queryInterface, Sequelize) {
    // Reverter para INT (cuidado: pode causar perda de dados se houver valores grandes)
    await queryInterface.changeColumn('students', 'matricula', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Número de matrícula',
    });

    console.log('✓ Coluna matricula revertida para INTEGER');
  },
};
