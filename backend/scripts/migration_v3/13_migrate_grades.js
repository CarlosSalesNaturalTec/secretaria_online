const db = require('../../src/models');

async function migrateGrades() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Migrating grades...');

    // Teste
    console.log('Migrating Teste...');
    await db.sequelize.query(`
        INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
        SELECT
          mem.evaluation_id,
          mms.student_id,
          CASE
            WHEN bn.teste IS NULL THEN NULL
            WHEN bn.teste > 10 THEN 10.00
            ELSE ROUND(bn.teste, 2)
          END AS grade,
          NOW(),
          NOW()
        FROM boletim_novo_temp bn
        JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
        JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
        JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
        JOIN migration_evaluation_mapping mem
          ON mem.class_id = mscm.class_id
          AND mem.discipline_id = mdm.new_discipline_id
          AND mem.eval_type = 'teste'
        WHERE mdm.new_discipline_id IS NOT NULL
          AND mscm.class_id IS NOT NULL
          AND mms.student_id IS NOT NULL
          AND bn.teste IS NOT NULL
        ON DUPLICATE KEY UPDATE grade = VALUES(grade), updated_at = NOW()
    `, { transaction });

    // Prova
    console.log('Migrating Prova...');
    await db.sequelize.query(`
        INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
        SELECT
          mem.evaluation_id,
          mms.student_id,
          CASE
            WHEN bn.prova IS NULL THEN NULL
            WHEN bn.prova > 10 THEN 10.00
            ELSE ROUND(bn.prova, 2)
          END,
          NOW(),
          NOW()
        FROM boletim_novo_temp bn
        JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
        JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
        JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
        JOIN migration_evaluation_mapping mem
          ON mem.class_id = mscm.class_id
          AND mem.discipline_id = mdm.new_discipline_id
          AND mem.eval_type = 'prova'
        WHERE mdm.new_discipline_id IS NOT NULL
          AND mscm.class_id IS NOT NULL
          AND mms.student_id IS NOT NULL
          AND bn.prova IS NOT NULL
        ON DUPLICATE KEY UPDATE grade = VALUES(grade), updated_at = NOW()
    `, { transaction });

    // Final
    console.log('Migrating Final...');
    // Note: 'final' column in CSV might be string, but import script converted/handled it?
    // In `boletim_novo_temp`, final is VARCHAR(16).
    // We cast it.
    await db.sequelize.query(`
        INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
        SELECT
          mem.evaluation_id,
          mms.student_id,
          CASE
            WHEN bn.final IS NULL OR bn.final = '' THEN NULL
            WHEN CAST(REPLACE(bn.final, ',', '.') AS DECIMAL(4,2)) > 10 THEN 10.00
            ELSE ROUND(CAST(REPLACE(bn.final, ',', '.') AS DECIMAL(4,2)), 2)
          END,
          NOW(),
          NOW()
        FROM boletim_novo_temp bn
        JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
        JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
        JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
        JOIN migration_evaluation_mapping mem
          ON mem.class_id = mscm.class_id
          AND mem.discipline_id = mdm.new_discipline_id
          AND mem.eval_type = 'final'
        WHERE mdm.new_discipline_id IS NOT NULL
          AND mscm.class_id IS NOT NULL
          AND mms.student_id IS NOT NULL
          AND bn.final IS NOT NULL AND bn.final != ''
        ON DUPLICATE KEY UPDATE grade = VALUES(grade), updated_at = NOW()
    `, { transaction });

    const [count] = await db.sequelize.query('SELECT COUNT(*) as count FROM grades', { transaction });
    console.log(`Total grades in system: ${count[0].count}`);

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
  migrateGrades();
}
