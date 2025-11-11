/**
 * Arquivo: src/config/test-connection.js
 * Descrição: Script para testar conexão com banco de dados MySQL
 * Feature: feat-006 - Configurar Sequelize e conexão MySQL
 * Criado em: 2025-10-25
 *
 * Este script pode ser executado diretamente para verificar se a
 * configuração do banco de dados está correta e a conexão é bem-sucedida.
 *
 * Uso:
 *   node src/config/test-connection.js
 */

const db = require('../models');

/**
 * Função principal para testar conexão
 */
async function testDatabaseConnection() {
  console.log('==========================================');
  console.log('TESTE DE CONEXÃO COM BANCO DE DADOS');
  console.log('==========================================\n');

  console.log('Configurações:');
  console.log(`- Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Host: ${process.env.DB_HOST}`);
  console.log(`- Port: ${process.env.DB_PORT}`);
  console.log(`- Database: ${process.env.DB_NAME}`);
  console.log(`- User: ${process.env.DB_USER}`);
  console.log(`- Pool Max: ${process.env.DB_POOL_MAX || 25}`);
  console.log(`- Pool Min: ${process.env.DB_POOL_MIN || 5}\n`);

  console.log('Testando conexão...\n');

  try {
    // Tentar autenticar com banco de dados
    const isConnected = await db.testConnection();

    if (isConnected) {
      console.log('\n✓ SUCESSO: Conexão estabelecida com sucesso!');
      console.log('\nPróximos passos:');
      console.log('1. Execute migrations: npm run db:migrate');
      console.log('2. Execute seeders: npm run db:seed');
      console.log('3. Inicie o servidor: npm run dev\n');

      // Fechar conexão
      await db.closeConnection();
      process.exit(0);
    } else {
      console.log('\n✗ ERRO: Não foi possível conectar ao banco de dados.');
      console.log('\nVerifique:');
      console.log('1. MySQL está rodando?');
      console.log('2. Credenciais no .env estão corretas?');
      console.log('3. Banco de dados foi criado?');
      console.log('4. Usuário tem permissões adequadas?\n');

      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ ERRO CRÍTICO:', error.message);
    console.error('\nDetalhes do erro:', error);
    process.exit(1);
  }
}

// Executar teste
testDatabaseConnection();
