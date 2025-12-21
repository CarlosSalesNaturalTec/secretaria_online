const db = require('../../src/models');

async function createEvaluationMapping() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creating migration_evaluation_mapping table...');
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migration_evaluation_mapping (
        class_id INT,
        discipline_id INT,
        eval_type ENUM('teste', 'prova', 'final'),
        evaluation_id INT,
        PRIMARY KEY (class_id, discipline_id, eval_type),
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
      );
    `, { transaction });

    console.log('Populating mapping...');

    const insertMap = async (type, name) => {
        await db.sequelize.query(`
            INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
            SELECT class_id, discipline_id, :type, id 
            FROM evaluations 
            WHERE name = :name
            ON DUPLICATE KEY UPDATE evaluation_id = VALUES(evaluation_id)
        `, {
            replacements: { type, name },
            transaction
        });
    };

    await insertMap('teste', 'Teste (histórico)');
    await insertMap('prova', 'Prova (histórico)');
    await insertMap('final', 'Prova Final (histórico)');

    const [count] = await db.sequelize.query('SELECT COUNT(*) as count FROM migration_evaluation_mapping', { transaction });
    console.log(`Mapped ${count[0].count} evaluations.`);

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
  createEvaluationMapping();
}
