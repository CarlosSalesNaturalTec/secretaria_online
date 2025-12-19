const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function populateClassTeachers() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Populating class_teachers...');

    // Load CSVs
    const profSeries = [];
    const profMats = [];
    
    const profSeriePath = path.join(__dirname, '../../../database/profserie.csv');
    const profMatPath = path.join(__dirname, '../../../database/profmat.csv');

    console.log(`Reading profserie.csv from: ${profSeriePath}`);
    await new Promise((resolve, reject) => {
      fs.createReadStream(profSeriePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          profSeries.push({
            profserie_prof: parseInt(row.profserie_prof),
            profserie_sub: parseInt(row.profserie_sub),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Reading profmat.csv from: ${profMatPath}`);
    await new Promise((resolve, reject) => {
      fs.createReadStream(profMatPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          profMats.push({
            profmat_prof: parseInt(row.profmat_prof),
            profmat_mat: parseInt(row.profmat_mat),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Load mappings
    const [professorMapping] = await db.sequelize.query('SELECT * FROM migration_professor_mapping', { transaction });
    const [classMapping] = await db.sequelize.query('SELECT * FROM migration_sub_class_mapping', { transaction });

    // Helper maps
    const profMap = new Map(); // old_id -> new_teacher_id
    professorMapping.forEach(p => profMap.set(p.old_professor_id, p.new_teacher_id));

    const classMap = new Map(); // sub_id -> class_id
    classMapping.forEach(c => classMap.set(c.sub_id, c.class_id));
    
    // Load Disciplines to map Old ID (profmat_mat) -> New ID (id) via 'code' column
    const disciplines = await db.Discipline.findAll({ 
      attributes: ['id', 'code'],
      where: { deleted_at: null },
      transaction 
    });
    
    const disciplineMap = new Map(); // old_id (as string in code) -> new_id
    disciplines.forEach(d => {
      if (d.code) disciplineMap.set(String(d.code), d.id);
    });

    let insertedCount = 0;
    let skippedCount = 0;

    // Iterate
    // Logic: Join profserie and profmat on professor
    // For each professor P:
    //   For each Series S they teach (from profserie):
    //     For each Discipline D they teach (from profmat):
    //       Insert (Class(S), Teacher(P), Discipline(D))

    // Group data by professor
    const profs = new Set([...profSeries.map(x => x.profserie_prof), ...profMats.map(x => x.profmat_prof)]);

    for (const oldProfId of profs) {
      const newTeacherId = profMap.get(oldProfId);
      
      if (!newTeacherId) {
        // console.warn(`Skipping professor ${oldProfId} (not mapped)`);
        continue; // Skip ignored professors
      }

      const series = profSeries.filter(x => x.profserie_prof === oldProfId);
      const mats = profMats.filter(x => x.profmat_prof === oldProfId);

      for (const s of series) {
        const classId = classMap.get(s.profserie_sub);
        if (!classId) continue;

        for (const m of mats) {
          const disciplineId = disciplineMap.get(String(m.profmat_mat));
          
          if (!disciplineId) {
            console.warn(`Discipline old_id=${m.profmat_mat} not found in new disciplines table (lookup by code).`);
            skippedCount++;
            continue;
          }

          await db.ClassTeacher.create({
            class_id: classId,
            teacher_id: newTeacherId,
            discipline_id: disciplineId
          }, { 
            transaction,
            ignoreDuplicates: true // In case unique constraint exists
          });
          insertedCount++;
        }
      }
    }

    console.log(`✅ Inserted ${insertedCount} class_teacher relations.`);
    if (skippedCount > 0) console.warn(`⚠️ Skipped ${skippedCount} relations due to missing discipline mapping.`);

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
  populateClassTeachers();
}
