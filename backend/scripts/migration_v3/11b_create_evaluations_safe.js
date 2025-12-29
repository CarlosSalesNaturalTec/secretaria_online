const db = require('../../src/models');

/**
 * Script seguro para criar avaliações históricas
 * Usa INSERT IGNORE para evitar duplicatas em produção
 *
 * Diferença do script 11 original:
 * - Usa INSERT IGNORE ao invés de INSERT simples
 * - Seguro para re-execução em produção
 */

async function createEvaluationsSafe() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('='.repeat(80));
    console.log('CRIAÇÃO SEGURA DE AVALIAÇÕES HISTÓRICAS');
    console.log('='.repeat(80));

    console.log('\nFetching migration admin user ID...');
    const migrationAdmin = await db.Teacher.findOne({
      where: { nome: 'Sistema Migração' },
      transaction
    });

    const fallbackTeacherId = migrationAdmin ? migrationAdmin.id : 6;
    console.log(`Using fallback teacher_id: ${fallbackTeacherId}`);

    console.log('\nCreating Evaluations (only new ones)...');

    const evalTypes = [
      { name: 'Teste (histórico)', date: '2024-01-15', type: 'teste' },
      { name: 'Prova (histórico)', date: '2024-02-15', type: 'prova' },
      { name: 'Prova Final (histórico)', date: '2024-03-15', type: 'final' }
    ];

    for (const evalType of evalTypes) {
      console.log(`\nCreating evaluations for: ${evalType.name}`);

      // Contar quantas avaliações existentes há para este tipo
      const [countBefore] = await db.sequelize.query(`
        SELECT COUNT(*) as count FROM evaluations WHERE name = :evalName
      `, {
        replacements: { evalName: evalType.name },
        transaction
      });

      // Usar LEFT JOIN com evaluations existentes para inserir apenas novos registros
      await db.sequelize.query(`
        INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
        SELECT DISTINCT
          source.class_id,
          source.teacher_id,
          source.discipline_id,
          source.name,
          source.date,
          source.type,
          source.created_at,
          source.updated_at
        FROM (
          SELECT DISTINCT
            mscm.class_id,
            COALESCE(ct.teacher_id, :fallbackTeacherId) AS teacher_id,
            mdm.new_discipline_id AS discipline_id,
            :evalName AS name,
            :evalDate AS date,
            'grade' AS type,
            NOW() AS created_at,
            NOW() AS updated_at
          FROM boletim_novo_temp bn
          JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
          JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
          JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
          LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
          WHERE mdm.new_discipline_id IS NOT NULL
            AND mscm.class_id IS NOT NULL
            AND mms.student_id IS NOT NULL
        ) AS source
        LEFT JOIN evaluations e
          ON e.class_id = source.class_id
          AND e.discipline_id = source.discipline_id
          AND e.name = source.name
        WHERE e.id IS NULL
      `, {
        replacements: {
          fallbackTeacherId: fallbackTeacherId,
          evalName: evalType.name,
          evalDate: evalType.date
        },
        transaction
      });

      // Contar quantas avaliações há agora
      const [countAfter] = await db.sequelize.query(`
        SELECT COUNT(*) as count FROM evaluations WHERE name = :evalName
      `, {
        replacements: { evalName: evalType.name },
        transaction
      });

      const inserted = countAfter[0].count - countBefore[0].count;
      console.log(`  ✅ ${inserted} new evaluations created for ${evalType.name} (total: ${countAfter[0].count})`);
    }

    const [count] = await db.sequelize.query(
      'SELECT COUNT(*) as count FROM evaluations WHERE name LIKE "%(histórico)%"',
      { transaction }
    );

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ Total historical evaluations in system: ${count[0].count}`);
    console.log('='.repeat(80));

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  createEvaluationsSafe();
}

module.exports = createEvaluationsSafe;
