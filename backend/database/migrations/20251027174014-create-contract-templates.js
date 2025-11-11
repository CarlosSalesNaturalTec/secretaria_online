/**
 * Arquivo: backend/database/migrations/20251027174014-create-contract-templates.js
 * Descrição: Migration para criar tabela contract_templates que armazena templates de contratos
 * Feature: feat-013 - Criar migrations para Contract e ContractTemplate
 * Criado em: 2025-10-27
 *
 * Esta tabela armazena templates de contratos em HTML com placeholders dinâmicos
 * que serão substituídos por dados reais ao gerar PDFs de contratos.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contract_templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do template de contrato',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment:
          'Nome do template (ex: Contrato de Matrícula 2025, Contrato Professor)',
      },
      content: {
        type: Sequelize.TEXT('long'), // LONGTEXT para armazenar HTML completo
        allowNull: false,
        comment:
          'Conteúdo HTML do template com placeholders {{studentName}}, {{courseName}}, etc.',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Define se o template está ativo e pode ser usado',
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
        comment: 'Soft delete - data de exclusão lógica',
      },
    });

    // Índices otimizados
    await queryInterface.addIndex('contract_templates', ['name'], {
      name: 'idx_contract_templates_name',
    });

    await queryInterface.addIndex('contract_templates', ['is_active'], {
      name: 'idx_contract_templates_is_active',
    });

    // Índice para templates ativos (não deletados)
    await queryInterface.addIndex('contract_templates', ['deleted_at'], {
      name: 'idx_contract_templates_deleted_at',
    });

    // Índice composto para buscar templates ativos disponíveis
    await queryInterface.addIndex(
      'contract_templates',
      ['is_active', 'deleted_at'],
      {
        name: 'idx_contract_templates_active_available',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contract_templates');
  },
};
