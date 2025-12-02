'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teachers', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      cpf: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      data_nascimento: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      celular: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      endereco_rua: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      endereco_numero: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      endereco_complemento: {
        type: Sequelize.STRING(2000),
        allowNull: true,
      },
      endereco_bairro: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      endereco_cidade: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      endereco_uf: {
        type: Sequelize.STRING(2),
        allowNull: true,
      },
      endereco_cep: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      sexo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: '1 = masc, 2 = fem',
      },
      mae: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pai: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      titulo_eleitor: {
        type: Sequelize.STRING(25),
        allowNull: true,
      },
      rg: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      rg_expedicao: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      foto: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teachers');
  },
};
