/**
 * Arquivo: backend/database/migrations/20251027174643-create-contracts.js
 * Descrição: Migration para criar tabela contracts que armazena contratos de alunos e professores
 * Feature: feat-013 - Criar migrations para Contract e ContractTemplate
 * Criado em: 2025-10-27
 *
 * Esta tabela armazena contratos gerados em PDF vinculados a usuários (alunos/professores),
 * com informações de template utilizado, período (semestre/ano) e data de aceite.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do contrato',
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'ID do usuário (aluno ou professor) vinculado ao contrato',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Não permite deletar usuário com contratos
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID do template utilizado para gerar o contrato',
        references: {
          model: 'contract_templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Não permite deletar template usado em contratos
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Caminho do arquivo PDF gerado (ex: uploads/contracts/contract_123.pdf)',
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nome original do arquivo PDF',
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora em que o contrato foi aceito pelo usuário',
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Semestre do contrato (1-12)',
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Ano do contrato (ex: 2025)',
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

    // Índice para buscar contratos de um usuário específico
    await queryInterface.addIndex('contracts', ['user_id'], {
      name: 'idx_contracts_user_id',
    });

    // Índice para buscar contratos por template
    await queryInterface.addIndex('contracts', ['template_id'], {
      name: 'idx_contracts_template_id',
    });

    // Índice para buscar contratos por status de aceite
    await queryInterface.addIndex('contracts', ['accepted_at'], {
      name: 'idx_contracts_accepted_at',
    });

    // Índice para buscar contratos por semestre
    await queryInterface.addIndex('contracts', ['semester'], {
      name: 'idx_contracts_semester',
    });

    // Índice para buscar contratos por ano
    await queryInterface.addIndex('contracts', ['year'], {
      name: 'idx_contracts_year',
    });

    // Índice para soft delete
    await queryInterface.addIndex('contracts', ['deleted_at'], {
      name: 'idx_contracts_deleted_at',
    });

    // Índice composto para buscar contratos de usuário em período específico
    await queryInterface.addIndex('contracts', ['user_id', 'semester', 'year'], {
      name: 'idx_contracts_user_period',
    });

    // Índice composto para buscar contratos aceitos
    await queryInterface.addIndex('contracts', ['user_id', 'accepted_at'], {
      name: 'idx_contracts_user_accepted',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contracts');
  },
};
