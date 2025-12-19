const db = require('../../src/models');

async function mapSubToClasses() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Updating migration_matricula_student with class_id...');

    await db.sequelize.query(`
      UPDATE migration_matricula_student mms
      JOIN migration_sub_class_mapping mscm ON mms.sub_id = mscm.sub_id
      SET mms.class_id = mscm.class_id
    `, { transaction });

    // Check results
    const [results] = await db.sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(class_id) as mapped
      FROM migration_matricula_student
    `, { transaction });

    console.log(`Total students in migration table: ${results[0].total}`);
    console.log(`Students with class mapped: ${results[0].mapped}`);
    console.log(`Students missing class: ${results[0].total - results[0].mapped}`);

    if (results[0].total - results[0].mapped > 0) {
      console.warn('⚠️ Some students were not associated with a class (sub_id not found in mapping).');
      
      const [missing] = await db.sequelize.query(`
        SELECT mms.old_matricula, s.nome, mms.sub_id
        FROM migration_matricula_student mms
        JOIN students s ON mms.student_id = s.id
        WHERE mms.class_id IS NULL
      `, { transaction });
      
      console.log('Sample missing:', missing.slice(0, 5));
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
  mapSubToClasses();
}
