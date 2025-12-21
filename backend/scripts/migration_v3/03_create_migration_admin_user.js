const db = require('../../src/models');

async function createMigrationAdminUser() {
  const transaction = await db.sequelize.transaction();

  try {
    const login = 'migracao';
    
    // Check if exists
    const existing = await db.User.findOne({ where: { login }, transaction });
    
    if (existing) {
      console.log(`✅ User '${login}' already exists with ID: ${existing.id}`);
    } else {
      const user = await db.User.create({
        name: 'Sistema Migração',
        email: 'migracao@sistema.edu.br',
        login: login,
        password_hash: '$2a$10$dummy_hash_migracao_historica_v3',
        role: 'admin',
      }, { transaction });
      
      console.log(`✅ User '${login}' created with ID: ${user.id}`);
    }

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  createMigrationAdminUser();
}
