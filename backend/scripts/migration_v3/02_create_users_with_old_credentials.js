const db = require('../../src/models');

async function createUsersWithOldCredentials() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Fetching mapped professors without users...');
    
    // Select mapped professors who don't have a user associated yet (or check via mapping)
    // We check via the mapping table and join with users to see if a user for that teacher already exists.
    // However, the logic in the strategy doc suggests:
    // SELECT ... FROM migration_professor_mapping mpm JOIN teachers t ... LEFT JOIN users u ... WHERE u.id IS NULL
    
    // Note: A teacher might already have a user but not linked in the mapping table yet?
    // The strategy assumes we want to create users if they don't exist for the teacher.
    
    const [professoresSemUser] = await db.sequelize.query(`
      SELECT
        mpm.old_professor_id,
        mpm.old_nome,
        mpm.old_login,
        mpm.old_senha,
        mpm.new_teacher_id,
        t.nome
      FROM migration_professor_mapping mpm
      JOIN teachers t ON mpm.new_teacher_id = t.id
      LEFT JOIN users u ON u.teacher_id = t.id
      WHERE u.id IS NULL
    `, { transaction });

    console.log(`\n📝 Criando usuários para ${professoresSemUser.length} professores...`);

    for (const prof of professoresSemUser) {
      // Check if login already exists to avoid unique constraint error
      const existingUser = await db.User.findOne({ 
        where: { login: prof.old_login },
        transaction 
      });

      if (existingUser) {
        console.warn(`⚠️ User with login '${prof.old_login}' already exists (ID: ${existingUser.id}). associating with teacher ${prof.new_teacher_id}...`);
        // If exists, just update the teacher_id if it's null? Or skip?
        // Strategy says: create users. If collision, we have a problem.
        // Assuming unique logins.
        
        if (!existingUser.teacher_id) {
           await existingUser.update({ teacher_id: prof.new_teacher_id }, { transaction });
           console.log(`   Updated existing user ${existingUser.id} with teacher_id ${prof.new_teacher_id}`);
        }
        continue;
      }

      const [result] = await db.sequelize.query(`
        INSERT INTO users (name, email, login, password_hash, role, teacher_id, created_at, updated_at)
        VALUES (:name, :email, :login, :password_hash, 'teacher', :teacher_id, NOW(), NOW())
      `, {
        replacements: {
          name: prof.nome,
          email: `${prof.old_login}@sistema.edu.br`,
          login: prof.old_login,
          password_hash: prof.old_senha,
          teacher_id: prof.new_teacher_id
        },
        transaction
      });
      
      console.log(`✅ Usuário criado: login="${prof.old_login}", teacher_id=${prof.new_teacher_id} (${prof.nome})`);
    }

    // Update mapping with user_ids
    await db.sequelize.query(`
      UPDATE migration_professor_mapping mpm
      JOIN teachers t ON mpm.new_teacher_id = t.id
      JOIN users u ON u.teacher_id = t.id
      SET mpm.new_user_id = u.id
    `, { transaction });

    await transaction.commit();
    console.log(`\n✅ Mapeamento atualizado com user_ids`);

  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  createUsersWithOldCredentials();
}
