const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function createDisciplineMapping() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creating migration_discipline_mapping table...');
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migration_discipline_mapping (
        id INT AUTO_INCREMENT PRIMARY KEY,
        old_name VARCHAR(200) NOT NULL,
        old_name_normalized VARCHAR(200),
        new_discipline_id INT,
        match_type ENUM('exact', 'fuzzy', 'manual', 'not_found') DEFAULT 'not_found',
        similarity_score DECIMAL(3, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (new_discipline_id) REFERENCES disciplines(id)
      );
    `, { transaction });

    function normalizeString(str) {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    // Read unique disciplines from boletim_novo.csv
    const disciplinasAntigo = new Set();
    const csvPath = path.join(__dirname, '../../../database/boletim_novo.csv');
    console.log(`Reading CSV from: ${csvPath}`);

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          if (row.disciplina) {
            disciplinasAntigo.add(row.disciplina);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${disciplinasAntigo.size} unique discipline names in boletim_novo.`);

    // Get new disciplines
    const disciplinesNovo = await db.Discipline.findAll({
      attributes: ['id', 'name'],
      where: { deleted_at: null },
      transaction
    });

    // Match
    let matchedCount = 0;
    
    for (const oldName of disciplinasAntigo) {
      const normalizedOld = normalizeString(oldName);
      
      let match = disciplinesNovo.find(d => normalizeString(d.name) === normalizedOld);
      let matchType = 'not_found';
      
      // If no exact match, try simple fuzzy (contains)
      // or check if 'code' helps? No, boletim_novo has names.
      // Maybe some names in boletim_novo have typos.
      // But let's stick to exact match first as per script.
      // If we find issues, we can improve.
      
      // Strategy mentions "fuzzy" but doesn't provide implementation.
      // I'll add a simple fallback: if normalizedOld is contained in d.name or vice versa?
      
      if (!match) {
         match = disciplinesNovo.find(d => {
             const normNew = normalizeString(d.name);
             return normNew.includes(normalizedOld) || normalizedOld.includes(normNew);
         });
         if (match) matchType = 'fuzzy';
      } else {
         matchType = 'exact';
      }

      await db.sequelize.query(`
        INSERT INTO migration_discipline_mapping (old_name, old_name_normalized, new_discipline_id, match_type)
        VALUES (:old_name, :normalized, :new_id, :match_type)
        ON DUPLICATE KEY UPDATE new_discipline_id = VALUES(new_discipline_id)
      `, {
        replacements: {
          old_name: oldName,
          normalized: normalizedOld,
          new_id: match ? match.id : null,
          match_type: matchType
        },
        transaction
      });
      
      if (match) matchedCount++;
    }

    console.log(`✅ Mapped ${matchedCount} / ${disciplinasAntigo.size} disciplines.`);
    
    // List unmapped
    if (matchedCount < disciplinasAntigo.size) {
        console.warn('⚠️ Some disciplines were not mapped.');
        // Maybe I should try to map using the 'code' column if the name fails?
        // But boletim_novo ONLY has name.
        // What if name in boletim_novo is "Psicologia" but in DB it's "Introdução à Psicologia"?
        // My fuzzy logic above handles containment.
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
  createDisciplineMapping();
}
