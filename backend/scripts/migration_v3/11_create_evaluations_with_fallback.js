const db = require('../../src/models');

async function createEvaluations() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Fetching migration admin user ID...');
    const migrationUser = await db.User.findOne({ where: { login: 'migracao' }, transaction });
    if (!migrationUser) {
      throw new Error('User "migracao" not found. Run script 03 first.');
    }
    const migrationUserId = migrationUser.id;
    console.log(`Using fallback teacher_id: ${migrationUserId}`);

    console.log('Creating Evaluations...');

    // Helper to run the insert for a type
    const insertEval = async (name, date, evalType, sourceCol) => {
        // sourceCol is just for comment, we use the name 'Teste (histórico)' etc.
        console.log(`Creating evaluations for: ${name}`);
        
        await db.sequelize.query(`
            INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
            SELECT DISTINCT
              mscm.class_id,
              COALESCE(u.id, :migrationUserId) AS teacher_id,
              mdm.new_discipline_id,
              :name,
              :date,
              'grade',
              NOW(),
              NOW()
            FROM boletim_novo_temp bn
            JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
            JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
            JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
            LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
            LEFT JOIN teachers t ON ct.teacher_id = t.id
            LEFT JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
            WHERE mdm.new_discipline_id IS NOT NULL
              AND mscm.class_id IS NOT NULL
              AND mms.student_id IS NOT NULL
        `, {
            replacements: {
                migrationUserId,
                name,
                date
            },
            transaction
        });
    };

    await insertEval('Teste (histórico)', '2024-01-15', 'grade', 'teste');
    await insertEval('Prova (histórico)', '2024-02-15', 'grade', 'prova');
    await insertEval('Prova Final (histórico)', '2024-03-15', 'grade', 'final');

    const [count] = await db.sequelize.query('SELECT COUNT(*) as count FROM evaluations WHERE name LIKE "%(histórico)%"', { transaction });
    console.log(`Total historical evaluations created: ${count[0].count}`);

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
  createEvaluations();
}
