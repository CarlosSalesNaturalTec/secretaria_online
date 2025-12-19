const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function mapExistingStudents() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creating migration_matricula_student table (persistent)...');
    
    // We make it persistent to share across scripts
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migration_matricula_student (
        old_matricula BIGINT PRIMARY KEY,
        student_id INT UNSIGNED NOT NULL,
        sub_id INT,
        class_id INT,
        FOREIGN KEY (student_id) REFERENCES students(id)
      );
    `, { transaction });

    console.log('Populating migration_matricula_student from existing students...');

    // Populate only with students that HAVE matricula and sub_categoria (which maps to sub_id)
    // Note: 'sub_categoria' field in students table seems to store the old 'sub_id' or 'sub' FK?
    // Let's check contextDoc or schema.
    // In contextDoc: "students (..., sub_categoria, ...)"
    // In README_EXTRACAO: "cliente_sub: FK para sub".
    // I assume `students.sub_categoria` holds the value of `cliente_sub` from the CSV migration done previously (feat-005?).
    // If not, I might need to rely on CSV again.
    // But the strategy says: "SELECT s.matricula AS old_matricula, s.id AS student_id, s.sub_categoria AS sub_id FROM students s"
    // So it assumes `sub_categoria` has the data.

    await db.sequelize.query(`
      INSERT INTO migration_matricula_student (old_matricula, student_id, sub_id)
      SELECT
        s.matricula,
        s.id,
        s.sub_categoria
      FROM students s
      WHERE s.matricula IS NOT NULL
        AND s.deleted_at IS NULL
      ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), sub_id = VALUES(sub_id)
    `, { transaction });

    const [results] = await db.sequelize.query('SELECT COUNT(*) AS count FROM migration_matricula_student', { transaction });
    const mappedCount = results[0].count;
    console.log(`✅ ${mappedCount} students mapped.`);

    // Check against CSV for reporting
    const csvPath = path.join(__dirname, '../../../database/cliente.csv');
    console.log(`Checking against CSV: ${csvPath}`);
    
    const alunosAntigos = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          alunosAntigos.push({
            matricula: row.cliente_matricula,
            nome: row.cliente_nome,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Check who is missing
    let missingCount = 0;
    // We can query the DB table we just filled
    const [mappedMatriculas] = await db.sequelize.query('SELECT old_matricula FROM migration_matricula_student', { transaction });
    const mappedSet = new Set(mappedMatriculas.map(m => String(m.old_matricula)));

    for (const aluno of alunosAntigos) {
      if (!mappedSet.has(String(aluno.matricula))) {
        // console.warn(`⚠️ Aluno NÃO existe em students: ${aluno.nome} (matricula=${aluno.matricula})`);
        missingCount++;
      }
    }

    console.log(`\n⚠️ ${missingCount} students from old system NOT found in current students table (will be ignored).`);
    console.log(`✅ ${mappedCount} students found and ready for migration.`);

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
  mapExistingStudents();
}
