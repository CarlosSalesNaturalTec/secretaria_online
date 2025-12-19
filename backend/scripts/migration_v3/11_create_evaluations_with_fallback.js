const db = require('../../src/models');

async function createEvaluations() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Fetching migration admin user ID...');
    // We actually need a TEACHER for the evaluations table FK, not just a USER.
    // The previous script created a USER 'migracao'. We need a corresponding TEACHER.
    
    let migrationTeacher = await db.Teacher.findOne({ where: { nome: 'Sistema Migração' }, transaction });
    
    if (!migrationTeacher) {
        console.log('Creating fallback Teacher "Sistema Migração"...');
        migrationTeacher = await db.Teacher.create({
            nome: 'Sistema Migração',
            email: 'migracao@sistema.edu.br', // Optional if model allows
            // Add other required fields if any. Assuming 'nome' is enough based on prev scripts.
        }, { transaction });
    }
    
    const migrationTeacherId = migrationTeacher.id;
    console.log(`Using fallback teacher_id: ${migrationTeacherId}`);

    console.log('Creating Evaluations...');

    // Helper to run the insert for a type
    const insertEval = async (name, date, evalType, sourceCol) => {
        // sourceCol is just for comment, we use the name 'Teste (histórico)' etc.
        console.log(`Creating evaluations for: ${name}`);
        
        await db.sequelize.query(`
            INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
            SELECT DISTINCT
              mscm.class_id,
              COALESCE(ct.teacher_id, :migrationTeacherId) AS teacher_id, -- Use class_teacher relation or fallback
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
            WHERE mdm.new_discipline_id IS NOT NULL
              AND mscm.class_id IS NOT NULL
              AND mms.student_id IS NOT NULL
        `, {
            replacements: {
                migrationTeacherId,
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
