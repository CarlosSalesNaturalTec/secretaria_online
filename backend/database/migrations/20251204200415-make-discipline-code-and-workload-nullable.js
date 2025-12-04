/**
 * Arquivo: database/migrations/20251204200415-make-discipline-code-and-workload-nullable.js
 * Descrição: Torna os campos code e workload_hours opcionais (nullable) na tabela disciplines
 * Criado em: 2025-12-04
 *
 * Alterações:
 * - code: allowNull: false -> allowNull: true (remove constraint unique temporariamente e recria)
 * - workload_hours: allowNull: false -> allowNull: true
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover índice único do code
    await queryInterface.removeIndex('disciplines', 'disciplines_code_unique');

    // Alterar coluna code para permitir NULL e remover unique
    await queryInterface.changeColumn('disciplines', 'code', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Código identificador da disciplina (ex: MAT101, ANA201) - Opcional'
    });

    // Recriar índice único, mas permitindo NULL
    await queryInterface.addIndex('disciplines', ['code'], {
      name: 'disciplines_code_unique',
      unique: true,
      where: {
        code: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Alterar coluna workload_hours para permitir NULL
    await queryInterface.changeColumn('disciplines', 'workload_hours', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Carga horária da disciplina em horas (ex: 60, 80, 120) - Opcional'
    });

    console.log('✓ Campos code e workload_hours da tabela disciplines agora permitem NULL');
  },

  async down(queryInterface, Sequelize) {
    // Remover índice único do code
    await queryInterface.removeIndex('disciplines', 'disciplines_code_unique');

    // Reverter coluna code para NOT NULL e unique
    await queryInterface.changeColumn('disciplines', 'code', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Código identificador da disciplina (ex: MAT101, ANA201)'
    });

    // Recriar índice único sem a condição WHERE
    await queryInterface.addIndex('disciplines', ['code'], {
      name: 'disciplines_code_unique',
      unique: true
    });

    // Reverter coluna workload_hours para NOT NULL
    await queryInterface.changeColumn('disciplines', 'workload_hours', {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      },
      comment: 'Carga horária da disciplina em horas (ex: 60, 80, 120)'
    });

    console.log('✓ Campos code e workload_hours da tabela disciplines voltaram a ser obrigatórios');
  }
};
