const db = require('../../src/models');

async function populateClassStudents() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Populating class_students...');

    const [result] = await db.sequelize.query(`
      INSERT INTO class_students (class_id, student_id, created_at, updated_at)
      SELECT DISTINCT
        mms.class_id,
        mms.student_id,
        NOW(),
        NOW()
      FROM migration_matricula_student mms
      WHERE mms.class_id IS NOT NULL
      ON DUPLICATE KEY UPDATE updated_at = NOW()
    `, { transaction });

    console.log(`✅ Associations inserted/updated: ${result.affectedRows}`);

    const [count] = await db.sequelize.query('SELECT COUNT(*) as count FROM class_students', { transaction });
    console.log(`Total records in class_students: ${count[0].count}`);

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
  populateClassStudents();
}
