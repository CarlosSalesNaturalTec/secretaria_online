const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function importBoletim() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creating boletim_novo_temp table...');
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS boletim_novo_temp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        matricula BIGINT,
        disciplina VARCHAR(200),
        periodo VARCHAR(15),
        teste FLOAT,
        prova FLOAT,
        final VARCHAR(16),
        resultado FLOAT,
        status VARCHAR(35),
        semestre VARCHAR(70),
        dia_hora VARCHAR(50)
      );
    `, { transaction });

    console.log('Truncating boletim_novo_temp...');
    await db.sequelize.query('TRUNCATE TABLE boletim_novo_temp', { transaction });

    const csvPath = path.join(__dirname, '../../../database/boletim_novo.csv');
    console.log(`Reading CSV from: ${csvPath}`);

    const records = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            // Parse floats (replace , with .)
            const parseVal = (v) => {
                if (!v) return null;
                return parseFloat(v.replace(',', '.'));
            };
            
            records.push({
                matricula: parseInt(row.matricula),
                disciplina: row.disciplina,
                periodo: row.periodo,
                teste: parseVal(row.teste),
                prova: parseVal(row.prova),
                final: row.final, // Keep as string as per strategy doc (some might be empty or non-numeric?)
                resultado: parseVal(row.resultado),
                status: row.status,
                semestre: row.semestre,
                dia_hora: row.dia_hora
            });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Inserting ${records.length} records...`);
    
    // Batch insert
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        // Construct query manually or use bulkInsert if model exists. 
        // No model for temp table. Use query.
        // Or create a temporary model definition? No, raw query is safer for temp stuff.
        
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
        const replacements = batch.flatMap(r => [
            r.matricula, r.disciplina, r.periodo, r.teste, r.prova, r.final, r.resultado, r.status, r.semestre, r.dia_hora
        ]);
        
        await db.sequelize.query(`
            INSERT INTO boletim_novo_temp (matricula, disciplina, periodo, teste, prova, final, resultado, status, semestre, dia_hora)
            VALUES ${placeholders}
        `, { replacements, transaction });
    }

    console.log('Import completed.');
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
  importBoletim();
}
