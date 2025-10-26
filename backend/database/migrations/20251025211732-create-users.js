/**
 * Arquivo: database/migrations/20251025211732-create-users.js
 * Descrição: Migration para criação da tabela users com todos os campos necessários
 * Feature: feat-007 - Criar migration e model User
 * Criado em: 2025-10-25
 *
 * Esta migration cria a tabela users que armazena dados de todos os usuários do sistema:
 * - Administradores (role: admin)
 * - Professores (role: teacher)
 * - Alunos (role: student)
 *
 * Implementa soft delete através do campo deleted_at (paranoid)
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Método executado ao rodar a migration (npm run db:migrate)
   * Cria a tabela users com todos os campos, índices e constraints
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize com tipos de dados
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      // Chave primária
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do usuário (auto-incremento)',
      },

      // Perfil do usuário (admin, teacher, student)
      role: {
        type: Sequelize.ENUM('admin', 'teacher', 'student'),
        allowNull: false,
        defaultValue: 'student',
        comment: 'Perfil do usuário no sistema (admin, teacher ou student)',
      },

      // Dados pessoais
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nome completo do usuário',
      },

      // Credenciais de acesso
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Email único para contato e recuperação de senha',
      },

      login: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Login único para autenticação no sistema',
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hash bcrypt da senha do usuário (nunca armazena senha em texto plano)',
      },

      // Documentos
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
        comment: 'CPF do usuário (apenas números, validado no model)',
      },

      rg: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'RG do usuário (formato pode variar por estado)',
      },

      // Timestamps padrão do Sequelize
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora de criação do registro',
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora da última atualização do registro',
      },

      // Soft delete (paranoid)
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment:
          'Data e hora de exclusão lógica (soft delete). Null = ativo, Data = excluído',
      },
    });

    // Índices para otimização de queries

    // Índice único para email (já criado com unique: true, mas explicitando)
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true,
      comment: 'Índice único para garantir emails únicos e acelerar buscas por email',
    });

    // Índice único para login
    await queryInterface.addIndex('users', ['login'], {
      name: 'idx_users_login',
      unique: true,
      comment: 'Índice único para garantir logins únicos e acelerar autenticação',
    });

    // Índice único para CPF
    await queryInterface.addIndex('users', ['cpf'], {
      name: 'idx_users_cpf',
      unique: true,
      comment: 'Índice único para garantir CPFs únicos e acelerar buscas por CPF',
    });

    // Índice composto para role (para filtrar usuários por perfil rapidamente)
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role',
      comment: 'Índice para acelerar queries que filtram por perfil (admin, teacher, student)',
    });

    // Índice para deleted_at (paranoid queries)
    await queryInterface.addIndex('users', ['deleted_at'], {
      name: 'idx_users_deleted_at',
      comment: 'Índice para acelerar queries de soft delete (apenas registros ativos)',
    });

    console.log('✓ Tabela users criada com sucesso');
  },

  /**
   * Método executado ao reverter a migration (npm run db:migrate:undo)
   * Remove a tabela users e todos os dados
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize
   */
  async down(queryInterface, Sequelize) {
    // Remover índices primeiro (boa prática, embora drop table remova automaticamente)
    await queryInterface.removeIndex('users', 'idx_users_email');
    await queryInterface.removeIndex('users', 'idx_users_login');
    await queryInterface.removeIndex('users', 'idx_users_cpf');
    await queryInterface.removeIndex('users', 'idx_users_role');
    await queryInterface.removeIndex('users', 'idx_users_deleted_at');

    // Remover tabela
    await queryInterface.dropTable('users');

    console.log('✓ Tabela users removida com sucesso');
  },
};
