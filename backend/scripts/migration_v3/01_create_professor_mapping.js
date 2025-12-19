const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function createProfessorMapping() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creating migration_professor_mapping table...');
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migration_professor_mapping (
        old_professor_id INT PRIMARY KEY,
        old_nome VARCHAR(200),
        old_login VARCHAR(30),
        old_senha VARCHAR(200),
        new_teacher_id INT UNSIGNED,
        new_user_id INT UNSIGNED,
        match_type ENUM('exact', 'fuzzy', 'not_found') DEFAULT 'not_found',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (new_teacher_id) REFERENCES teachers(id),
        FOREIGN KEY (new_user_id) REFERENCES users(id)
      );
    `, { transaction });

    // Function to normalize string
    function normalizeString(str) {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[
0300-036f]/g, '')
        .toLowerCase()
        .trim();
    }

    // Read old professors from CSV
    const professorsAntigos = [];
    const csvPath = path.join(__dirname, '../../../database/professor.csv');
    
    console.log(`Reading CSV from: ${csvPath}`);

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          professoresAntigos.push({
            professor_id: parseInt(row.professor_id),
            professor_nome: row.professor_nome,
            professor_login: row.professor_login,
            professor_senha: row.professor_senha,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Loaded ${professoresAntigos.length} professors from CSV.`);

    // Get existing teachers
    const teachersNovos = await db.Teacher.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'nome'],
      transaction
    });

    console.log(`Loaded ${teachersNovos.length} existing teachers from DB.`);

    const professorMapping = [];

    for (const prof of professorsAntigos) {
      const normalizedOld = normalizeString(prof.professor_nome);

      const match = teachersNovos.find(t =>
        normalizeString(t.nome) === normalizedOld
      );

      if (match) {
        professorMapping.push({
          old_id: prof.professor_id,
          old_nome: prof.professor_nome,
          old_login: prof.professor_login,
          old_senha: prof.professor_senha,
          new_teacher_id: match.id,
          match_type: 'exact'
        });
        console.log(`✅ Mapeado: ${prof.professor_nome} (old_id=${prof.professor_id}) -> teacher_id=${match.id}`);
      } else {
        console.warn(`⚠️ Professor NÃO existe em teachers (será ignorado): ${prof.professor_nome} (old_id=${prof.professor_id})`);
      }
    }

    // Insert mappings
    for (const map of professorMapping) {
      await db.sequelize.query(`
        INSERT INTO migration_professor_mapping
        (old_professor_id, old_nome, old_login, old_senha, new_teacher_id, match_type)
        VALUES (:old_id, :old_nome, :old_login, :old_senha, :new_teacher_id, :match_type)
        ON DUPLICATE KEY UPDATE
          new_teacher_id = VALUES(new_teacher_id),
          match_type = VALUES(match_type)
      `, {
        replacements: map,
        transaction
      });
    }

    await transaction.commit();
    console.log(`
✅ ${professorMapping.length} professores mapeados de ${professoresAntigos.length} do sistema antigo`);
    console.log(`⚠️ ${professoresAntigos.length - professorMapping.length} professores ignorados (não existem em teachers)`);

  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  createProfessorMapping();
}
