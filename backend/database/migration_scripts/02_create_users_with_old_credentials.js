/**
 * Script: 02_create_users_with_old_credentials.js
 * Descrição: Criar usuários (users) com login e senha do sistema antigo
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - users.login = professor_login do sistema antigo
 * - users.password_hash = professor_senha do sistema antigo
 * - Apenas para professores mapeados
 */

const { sequelize } = require('../../src/models');

/**
 * Busca professores mapeados que ainda não têm usuário
 */
async function getProfessoresSemUser() {
  const [rows] = await sequelize.query(`
    SELECT
      mpm.old_professor_id,
      mpm.old_nome,
      mpm.old_login,
      mpm.old_senha,
      mpm.new_teacher_id,
      t.nome
    FROM migration_professor_mapping mpm
    JOIN teachers t ON mpm.new_teacher_id = t.id
    LEFT JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
    WHERE u.id IS NULL
      AND mpm.new_teacher_id IS NOT NULL
  `);

  return rows;
}

/**
 * Cria usuário para um professor
 */
async function createUser(professor) {
  const email = `${professor.old_login}@sistema.edu.br`;

  await sequelize.query(`
    INSERT INTO users (name, email, login, password_hash, role, teacher_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'teacher', ?, NOW(), NOW())
  `, { replacements: [
    professor.nome,
    email,
    professor.old_login,      // ✅ Login do sistema antigo
    professor.old_senha,      // ✅ Hash de senha do sistema antigo
    professor.new_teacher_id
  ] });

  // Buscar o ID do usuário recém-criado
  const [users] = await sequelize.query(`
    SELECT id FROM users WHERE login = ? AND role = 'teacher'
  `, { replacements: [professor.old_login] });

  return users[0].id;
}

/**
 * Atualiza mapeamento com user_id criado
 */
async function updateMappingWithUserId() {
  await sequelize.query(`
    UPDATE migration_professor_mapping mpm
    JOIN teachers t ON mpm.new_teacher_id = t.id
    JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
    SET mpm.new_user_id = u.id
    WHERE mpm.new_user_id IS NULL
  `);
}

/**
 * Verifica usuários criados
 */
async function verifyCreatedUsers() {
  const [users] = await sequelize.query(`
    SELECT
      u.id AS user_id,
      u.login,
      u.role,
      t.id AS teacher_id,
      t.nome AS teacher_nome
    FROM users u
    JOIN teachers t ON u.teacher_id = t.id
    WHERE u.role = 'teacher'
    ORDER BY u.id
  `);

  return users;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n=======================================================');
  console.log('FASE 1.3: Criar Usuários com Credenciais Antigas v3');
  console.log('=======================================================\n');

  try {
    // 1. Buscar professores sem usuário
    console.log('🔍 Buscando professores mapeados sem usuário...');
    const professoresSemUser = await getProfessoresSemUser();
    console.log(`   Encontrados: ${professoresSemUser.length} professores\n`);

    if (professoresSemUser.length === 0) {
      console.log('✅ Todos os professores já têm usuários criados!');
      return;
    }

    // 2. Criar usuários
    console.log('📝 Criando usuários...\n');
    for (const prof of professoresSemUser) {
      const userId = await createUser(prof);
      console.log(`✅ Usuário criado: login="${prof.old_login}", teacher_id=${prof.new_teacher_id}, user_id=${userId} (${prof.nome})`);
    }

    // 3. Atualizar mapeamento
    console.log('\n💾 Atualizando mapeamento com user_ids...');
    await updateMappingWithUserId();
    console.log('✅ Mapeamento atualizado!');

    // 4. Verificar usuários criados
    console.log('\n📊 Verificando usuários criados...\n');
    const users = await verifyCreatedUsers();
    console.log('Usuários de professores:');
    console.log('┌─────────┬──────────────┬──────────┬─────────────┬──────────────────────────────────┐');
    console.log('│ user_id │ login        │ role     │ teacher_id  │ teacher_nome                      │');
    console.log('├─────────┼──────────────┼──────────┼─────────────┼──────────────────────────────────┤');
    users.forEach(u => {
      console.log(`│ ${String(u.user_id).padEnd(7)} │ ${String(u.login).padEnd(12)} │ ${String(u.role).padEnd(8)} │ ${String(u.teacher_id).padEnd(11)} │ ${String(u.teacher_nome).padEnd(32)} │`);
    });
    console.log('└─────────┴──────────────┴──────────┴─────────────┴──────────────────────────────────┘\n');

    console.log('✅ Criação de usuários concluída!');
    console.log('========================================================\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
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
