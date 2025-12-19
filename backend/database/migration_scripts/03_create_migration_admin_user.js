/**
 * Script: 03_create_migration_admin_user.js
 * Descrição: Criar usuário admin "Sistema Migração" para dados órfãos
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - Avaliações de professores não mapeados (TUTOR, Tony) serão atribuídas a este usuário
 * - Usuário tipo 'admin' (não precisa de teacher_id)
 */

const { sequelize } = require('../../src/models');

/**
 * Verifica se usuário já existe
 */
async function userExists() {
  const [rows] = await sequelize.query(`
    SELECT id FROM users WHERE login = 'migracao' AND role = 'admin'
  `);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Cria usuário admin de migração
 */
async function createMigrationUser() {
  await sequelize.query(`
    INSERT INTO users (name, email, login, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `, {
    replacements: [
      'Sistema Migração',
      'migracao@sistema.edu.br',
      'migracao',
      '$2a$10$dummy_hash_migracao_historica_v3',  // Hash dummy (conta não será usada para login)
      'admin'
    ]
  });

  // Buscar o ID do usuário recém-criado
  const [users] = await sequelize.query(`
    SELECT id FROM users WHERE login = 'migracao' AND role = 'admin'
  `);

  return users[0].id;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n=====================================================');
  console.log('FASE 1.4: Criar Usuário Admin "Sistema Migração"');
  console.log('=====================================================\n');

  try {
    // 1. Verificar se já existe
    console.log('🔍 Verificando se usuário já existe...');
    const existingId = await userExists();

    if (existingId) {
      console.log(`✅ Usuário "Sistema Migração" já existe (id=${existingId})\n`);
      console.log('📋 Informações do usuário:');
      console.log(`   Login: migracao`);
      console.log(`   Role: admin`);
      console.log(`   User ID: ${existingId}\n`);

      console.log('⚠️  Este usuário será usado para:');
      console.log('   - Avaliações de professores não mapeados (TUTOR, Tony)');
      console.log('   - Representa dados históricos sem professor correspondente\n');

      return existingId;
    }

    // 2. Criar usuário
    console.log('📝 Criando usuário "Sistema Migração"...');
    const userId = await createMigrationUser();
    console.log(`✅ Usuário criado com sucesso! (id=${userId})\n`);

    console.log('📋 Informações do usuário:');
    console.log(`   Login: migracao`);
    console.log(`   Email: migracao@sistema.edu.br`);
    console.log(`   Role: admin`);
    console.log(`   User ID: ${userId}\n`);

    console.log('⚠️  Este usuário será usado para:');
    console.log('   - Avaliações de professores não mapeados (TUTOR, Tony)');
    console.log('   - Representa dados históricos sem professor correspondente\n');

    console.log('✅ Criação concluída!');
    console.log('======================================================\n');

    return userId;

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = main;
