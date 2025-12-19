/**
 * Script: 10_create_evaluations_with_fallback.js
 * Descrição: Criar avaliações com professor real ou fallback "Sistema Migração"
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - Usa professor real quando possível (via class_teachers)
 * - Se não encontrar professor, usa "Sistema Migração" (admin)
 * - Cria 3 tipos de avaliação: Teste, Prova, Final
 */

const { sequelize } = require('../../src/models');

/**
 * Busca ou cria teacher para o usuário "Sistema Migração"
 */
async function getMigrationTeacherId() {
  // Verificar se já existe um teacher chamado "Sistema Migração"
  const [teachers] = await sequelize.query(`
    SELECT id FROM teachers WHERE nome = 'Sistema Migração' AND deleted_at IS NULL
  `);

  if (teachers.length > 0) {
    return teachers[0].id;
  }

  // Criar teacher "Sistema Migração"
  await sequelize.query(`
    INSERT INTO teachers (nome, cpf, created_at, updated_at)
    VALUES ('Sistema Migração', '00000000000', NOW(), NOW())
  `);

  // Buscar o ID do teacher recém-criado
  const [newTeacher] = await sequelize.query(`
    SELECT id FROM teachers WHERE nome = 'Sistema Migração' AND deleted_at IS NULL
  `);

  return newTeacher[0].id;
}

/**
 * Cria avaliações do tipo especificado
 */
async function createEvaluations(type, name, date, migrationTeacherId) {
  const [result] = await sequelize.query(`
    INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
    SELECT DISTINCT
      mscm.class_id,
      COALESCE(t.id, ?) AS teacher_id,
      mdm.new_discipline_id,
      ?,
      ?,
      ?,
      NOW(),
      NOW()
    FROM boletim_novo_temp bn
    JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
    JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
    JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
    LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
    LEFT JOIN teachers t ON ct.teacher_id = t.id
    WHERE mdm.new_discipline_id IS NOT NULL
      AND mscm.class_id IS NOT NULL
      AND mms.student_id IS NOT NULL
    ON DUPLICATE KEY UPDATE updated_at = NOW()
  `, { replacements: [migrationTeacherId, name, date, 'grade'] });

  return result.affectedRows;
}

/**
 * Estatísticas de avaliações criadas
 */
async function getStats(migrationTeacherId) {
  const [total] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM evaluations
    WHERE name LIKE '%(histórico)%'
  `);

  const [byTeacher] = await sequelize.query(`
    SELECT
      t.nome AS teacher_name,
      COUNT(*) AS num_evaluations
    FROM evaluations e
    JOIN teachers t ON e.teacher_id = t.id
    WHERE e.name LIKE '%(histórico)%'
    GROUP BY t.id, t.nome
    ORDER BY num_evaluations DESC
  `);

  const [withMigrationTeacher] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM evaluations
    WHERE name LIKE '%(histórico)%' AND teacher_id = ?
  `, { replacements: [migrationTeacherId] });

  const [withRealTeacher] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM evaluations e
    JOIN teachers t ON e.teacher_id = t.id
    WHERE e.name LIKE '%(histórico)%' AND t.nome != 'Sistema Migração'
  `);

  return {
    total: total[0].total,
    byTeacher,
    withMigrationTeacher: withMigrationTeacher[0].total,
    withRealTeacher: withRealTeacher[0].total
  };
}

/**
 * Função principal
 */
async function main() {
  console.log('\n===========================================================');
  console.log('FASE 6.2: Criar Avaliações com Professor Real ou Fallback');
  console.log('===========================================================\n');

  try {
    // 1. Buscar ou criar teacher de migração
    console.log('🔍 Buscando/criando teacher "Sistema Migração"...');
    const migrationTeacherId = await getMigrationTeacherId();
    console.log(`✅ Teacher ID: ${migrationTeacherId}\n`);

    // 2. Criar avaliações do tipo "Teste"
    console.log('📝 Criando avaliações "Teste (histórico)"...');
    const teste = await createEvaluations('teste', 'Teste (histórico)', '2024-01-15', migrationTeacherId);
    console.log(`✅ ${teste} avaliações criadas\n`);

    // 3. Criar avaliações do tipo "Prova"
    console.log('📝 Criando avaliações "Prova (histórico)"...');
    const prova = await createEvaluations('prova', 'Prova (histórico)', '2024-02-15', migrationTeacherId);
    console.log(`✅ ${prova} avaliações criadas\n`);

    // 4. Criar avaliações do tipo "Final"
    console.log('📝 Criando avaliações "Prova Final (histórico)"...');
    const final = await createEvaluations('final', 'Prova Final (histórico)', '2024-03-15', migrationTeacherId);
    console.log(`✅ ${final} avaliações criadas\n`);

    // 5. Estatísticas
    console.log('📊 Estatísticas:\n');
    const stats = await getStats(migrationTeacherId);

    console.log(`   Total de avaliações históricas: ${stats.total}`);
    console.log(`   ✅ Com professor real: ${stats.withRealTeacher}`);
    console.log(`   ⚠️  Com "Sistema Migração": ${stats.withMigrationTeacher}\n`);

    const percentMigration = (stats.withMigrationTeacher / stats.total * 100).toFixed(1);
    const percentReal = (stats.withRealTeacher / stats.total * 100).toFixed(1);

    console.log(`   📈 Professor real: ${percentReal}%`);
    console.log(`   📈 Sistema Migração: ${percentMigration}%\n`);

    console.log('   Avaliações por professor:\n');
    console.log('   ┌────────────────────────────────────┬──────┬────────────────┐');
    console.log('   │ Professor                          │ Role │ Num Avaliações │');
    console.log('   ├────────────────────────────────────┼──────┼────────────────┤');
    stats.byTeacher.forEach(t => {
      const name = String(t.teacher_name).substring(0, 34).padEnd(34);
      const role = String(t.role).padEnd(4);
      const num = String(t.num_evaluations).padEnd(14);
      console.log(`   │ ${name} │ ${role} │ ${num} │`);
    });
    console.log('   └────────────────────────────────────┴──────┴────────────────┘\n');

    if (stats.withMigrationUser > 0) {
      console.log('ℹ️  Avaliações atribuídas a "Sistema Migração" são aquelas que no');
      console.log('   sistema antigo pertenciam a professores não migrados (ex: TUTOR).\n');
    }

    console.log('✅ Criação de avaliações concluída!');
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ Erro ao criar avaliações:', error);
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
