/**
 * Arquivo: database/migrations/20260102205925-change-ano-matricula-to-string.js
 * Descrição: Altera o tipo do campo ano_matricula de BIGINT para VARCHAR(20)
 * Criado em: 2026-01-02
 *
 * Esta migration converte o campo ano_matricula da tabela students de número para texto.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Método executado ao rodar a migration (npm run db:migrate)
   * Altera o tipo da coluna ano_matricula de BIGINT para VARCHAR(20)
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize com tipos de dados
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('students', 'ano_matricula', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Ano da matrícula',
    });

    console.log('✓ Coluna ano_matricula alterada para VARCHAR(20)');
  },

  /**
   * Método executado ao reverter a migration (npm run db:migrate:undo)
   * Reverte a coluna ano_matricula de volta para BIGINT
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('students', 'ano_matricula', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Ano da matrícula',
    });

    console.log('✓ Coluna ano_matricula revertida para BIGINT');
  },
};
