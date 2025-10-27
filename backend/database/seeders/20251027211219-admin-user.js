/**
 * Arquivo: backend/database/seeders/20251027211219-admin-user.js
 * Descrição: Seeder para criar o usuário administrativo inicial do sistema
 * Feature: feat-016 - Criar seeders de dados iniciais
 * Criado em: 2025-10-27
 */

'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Cria o usuário administrativo inicial
     * Login: admin
     * Senha: admin123 (deve ser alterada no primeiro acesso)
     */

    // Verificar se já existe um usuário admin
    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'admin' AND login = 'admin' LIMIT 1;`
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Usuário admin já existe. Seeder ignorado.');
      return;
    }

    // Hash da senha com bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        role: 'admin',
        name: 'Administrador do Sistema',
        email: 'admin@secretariaonline.com',
        login: 'admin',
        password_hash: passwordHash,
        cpf: '00000000000', // CPF fictício para admin
        rg: '0000000',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('   Login: admin');
    console.log('   Senha: admin123');
    console.log('   ⚠️  IMPORTANTE: Altere a senha no primeiro acesso!');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove o usuário admin criado
     */
    await queryInterface.bulkDelete('users', {
      role: 'admin',
      login: 'admin',
    }, {});

    console.log('✅ Usuário admin removido.');
  }
};
