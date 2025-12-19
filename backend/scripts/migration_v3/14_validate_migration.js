const db = require('../../src/models');

async function validateMigration() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Validating Migration...\n');

    // 1. Total records
    const [q1] = await db.sequelize.query("SELECT COUNT(*) as c FROM boletim_novo_temp", { transaction });
    console.log(`Original Records (boletim_novo): ${q1[0].c}`);

    const [q2] = await db.sequelize.query(`
      SELECT COUNT(*) as c FROM grades 
      WHERE evaluation_id IN (SELECT id FROM evaluations WHERE name LIKE '%(histórico)%')
    `, { transaction });
    console.log(`Migrated Grades: ${q2[0].c}`);

    // 2. Teachers used
    const [q3] = await db.sequelize.query(`
      SELECT
        u.name AS professor,
        u.role,
        COUNT(DISTINCT e.id) AS num_avaliacoes
      FROM evaluations e
      JOIN users u ON e.teacher_id = u.id
      WHERE e.name LIKE '%(histórico)%'
      GROUP BY u.id, u.name, u.role
    `, { transaction });
    console.log('\nEvaluations per Teacher:');
    console.table(q3);

    // 3. Students covered
    const [q4] = await db.sequelize.query(`
      SELECT COUNT(DISTINCT student_id) AS alunos_com_notas
      FROM grades
      WHERE evaluation_id IN (
        SELECT id FROM evaluations WHERE name LIKE '%(histórico)%'
      )
    `, { transaction });
    console.log(`\nStudents with migrated grades: ${q4[0].alunos_com_notas}`);

    // 4. Unmapped Disciplines
    const [q5] = await db.sequelize.query(`
      SELECT old_name FROM migration_discipline_mapping WHERE new_discipline_id IS NULL
    `, { transaction });
    console.log(`\nUnmapped Disciplines (${q5.length}):`);
    if (q5.length > 0) console.log(q5.map(x => x.old_name).join(', '));

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  validateMigration();
}
