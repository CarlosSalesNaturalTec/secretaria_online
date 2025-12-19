const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../src/models');

async function populateBaseData() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Populating Base Data (Courses & Disciplines)...');

    // 1. Courses
    const coursesPath = path.join(__dirname, '../../../secretaria_online_dados/secretaria_online_courses.csv');
    if (fs.existsSync(coursesPath)) {
        console.log(`Reading Courses from ${coursesPath}`);
        const courses = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(coursesPath, { encoding: 'latin1' })
                .pipe(csv({ separator: ';' }))
                .on('data', row => courses.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        for (const c of courses) {
            // Check if exists by name (including soft-deleted)
            const exists = await db.Course.findOne({ where: { name: c.name }, paranoid: false, transaction });
            if (!exists) {
                // The model expects: 'Semestres', 'Dias', 'Horas', 'Meses', 'Anos'
                let dType = c.duration_type;
                // If it's already one of the allowed values, keep it.
                // The CSV seems to have 'Semestres' already.
                
                // course_type expects: 'Mestrado/Doutorado', 'Cursos de Verão', 'Pós graduação', 'Superior', 'Supletivo/EJA', 'Técnicos'
                let cType = c.course_type;
                if (cType === 'Bacharelado') cType = 'Superior';

                await db.Course.create({
                    name: c.name,
                    description: c.description,
                    duration: parseInt(c.duration) || 8,
                    duration_type: dType || 'Semestres',
                    course_type: cType || 'Superior'
                }, { transaction });
                console.log(`Created Course: ${c.name}`);
            } else {
                // Optional: Restore if deleted? Or just log.
                if (exists.deleted_at) {
                    console.log(`Course ${c.name} exists but is deleted. Restoring...`);
                    await exists.restore({ transaction });
                }
            }
        }
    } else {
        console.warn('Courses CSV not found.');
    }

    // 2. Disciplines
    const disciplinesPath = path.join(__dirname, '../../../secretaria_online_dados/secretaria_online_disciplines.csv');
    if (fs.existsSync(disciplinesPath)) {
        console.log(`Reading Disciplines from ${disciplinesPath}`);
        const disciplines = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(disciplinesPath, { encoding: 'latin1' })
                .pipe(csv({ separator: ';' }))
                .on('data', row => disciplines.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        for (const d of disciplines) {
            // Check if exists by name OR by code (if code matches old ID)
            // old ID is in 'code' column in CSV?
            // CSV: id;name;code;...
            // "1";"Intro...";"8"
            // So `d.code` is the old ID.
            
            const exists = await db.Discipline.findOne({ 
                where: { 
                    [db.Sequelize.Op.or]: [
                        { name: d.name },
                        { code: d.code } // Check if code already used
                    ]
                }, 
                paranoid: false,
                transaction 
            });

            if (!exists) {
                await db.Discipline.create({
                    name: d.name,
                    code: d.code, // This is CRITICAL for script 08
                    workload_hours: parseInt(d.workload_hours) || 60
                }, { transaction });
                console.log(`Created Discipline: ${d.name} (Code: ${d.code})`);
            } else {
                // If exists but code is different, maybe update it?
                // If existing discipline has code 'ADS001' but we need '8'.
                // Script 08 relies on `code` being the Old ID.
                // If I find "Introdução à Psicologia" with code "PSY101", script 08 will fail to map 8 -> ID.
                // I should update the code if it doesn't match and looks like a sample code?
                // Or just trust name match in 09.
                // But 08 relies on code.
                
                if (exists.name === d.name && exists.code !== d.code) {
                    console.log(`Updating code for ${exists.name}: ${exists.code} -> ${d.code}`);
                    await exists.update({ code: d.code }, { transaction });
                }
            }
        }
    } else {
        console.warn('Disciplines CSV not found.');
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
  populateBaseData();
}
