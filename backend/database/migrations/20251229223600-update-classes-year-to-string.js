/**
 * Arquivo: backend/database/migrations/20251229223600-update-classes-year-to-string.js
 * Descrição: Migration para alterar o campo 'year' da tabela classes de INTEGER para STRING(10)
 * Criado em: 2025-12-29
 *
 * Motivo: Permitir dados alfanuméricos no campo 'year' (ex: "2025/1", "2025-A", etc.)
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Executa a migration - altera o tipo do campo 'year' para STRING(10)
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    // Altera o tipo da coluna 'year' de INTEGER para STRING(10)
    await queryInterface.changeColumn('classes', 'year', {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: 'Ano da turma (alfanumérico)'
    });
  },

  /**
   * Reverte a migration - volta o campo 'year' para INTEGER
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    // Volta o tipo da coluna 'year' para INTEGER
    await queryInterface.changeColumn('classes', 'year', {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2100
      },
      comment: 'Ano da turma'
    });
  }
};
