const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function createClassesFromSub() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creating migration_sub_class_mapping table...');
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migration_sub_class_mapping (
        sub_id INT PRIMARY KEY,
        class_id INT NOT NULL,
        course_name VARCHAR(200),
        semester INT,
        year INT,
        FOREIGN KEY (class_id) REFERENCES classes(id)
      );
    `, { transaction });

    const subs = [];
    const csvPath = path.join(__dirname, '../../../database/sub.csv');
    console.log(`Reading CSV from: ${csvPath}`);

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          // Extrair de "Bacharelado em Psicologia 8°"
          // Expected format: "Some Course Name N°" or similar?
          // Let's assume regex works: /(.+?)\s+(\d+)/
          // "Bacharelado em Psicologia 8°" -> "Bacharelado em Psicologia", "8"
          
          const title = row.sub_title; 
          const match = title.match(/(.+?)\s+(\d+)/);
          
          if (match) {
            subs.push({
              sub_id: parseInt(row.sub_id),
              sub_title: title,
              course_name: match[1].trim(),
              semester: parseInt(match[2]),
              sub_categoria: parseInt(row.sub_categoria),
            });
          } else {
            console.warn(`Could not parse sub_title: "${title}"`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Parsed ${subs.length} subs from CSV.`);
    const year = 2024; // Fixed year as per strategy

    for (const sub of subs) {
      // Find course
      // "Bacharelado em Psicologia" -> try to match "Psicologia"
      // Maybe clean up "Bacharelado em " or just use LIKE
      
      const [courses] = await db.sequelize.query(`
        SELECT id FROM courses
        WHERE name LIKE :namePattern
        LIMIT 1
      `, { 
        replacements: { namePattern: `%${sub.course_name.replace('Bacharelado em ', '')}%` },
        transaction 
      });

      if (courses.length === 0) {
        console.error(`❌ Curso não encontrado: ${sub.course_name} (sub_id=${sub.sub_id})`);
        continue;
      }

      const courseId = courses[0].id;

      // Check if class exists
      const existingClass = await db.Class.findOne({
        where: {
          course_id: courseId,
          semester: sub.semester,
          year: year,
          deleted_at: null
        },
        transaction
      });

      let classId;

      if (existingClass) {
        classId = existingClass.id;
        // console.log(`⚠️ Classe já existe: ${sub.sub_title} -> class_id=${classId}`);
      } else {
        const newClass = await db.Class.create({
          course_id: courseId,
          semester: sub.semester,
          year: year,
        }, { transaction });
        classId = newClass.id;
        console.log(`✅ Classe criada: ${sub.sub_title} -> class_id=${classId}`);
      }

      // Insert mapping
      await db.sequelize.query(`
        INSERT INTO migration_sub_class_mapping (sub_id, class_id, course_name, semester, year)
        VALUES (:sub_id, :class_id, :course_name, :semester, :year)
        ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)
      `, {
        replacements: {
          sub_id: sub.sub_id,
          class_id: classId,
          course_name: sub.course_name,
          semester: sub.semester,
          year: year
        },
        transaction
      });
    }

    await transaction.commit();
    console.log('Classes creation and mapping completed.');

  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  createClassesFromSub();
}
