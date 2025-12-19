/**
 * Script: 07_populate_class_teachers.js
 * Descrição: Popular tabela class_teachers (associação professores-turmas-disciplinas)
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - Apenas professores MAPEADOS terão relações criadas
 * - Usa profmat.csv (professor-disciplina) e profserie.csv (professor-turma)
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { sequelize } = require('../../src/models');

/**
 * Lê CSV de profmat
 */
async function readProfmatCSV() {
  return new Promise((resolve, reject) => {
    const data = [];
    const csvPath = path.join(__dirname, '../../../database/profmat.csv');

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('utf-8'))
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        data.push({
          profmat_id: parseInt(row.profmat_id),
          profmat_mat: parseInt(row.profmat_mat), // discipline_id
          profmat_prof: parseInt(row.profmat_prof) // professor_id
        });
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

/**
 * Lê CSV de profserie
 */
async function readProfserieCSV() {
  return new Promise((resolve, reject) => {
    const data = [];
    const csvPath = path.join(__dirname, '../../../database/profserie.csv');

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('utf-8'))
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        data.push({
          profserie_id: parseInt(row.profserie_id),
          profserie_prof: parseInt(row.profserie_prof), // professor_id
          profserie_sub: parseInt(row.profserie_sub) // sub_id
        });
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

/**
 * Cria tabelas temporárias e insere dados
 */
async function createTempTables(profmat, profserie) {
  // Criar tabelas temporárias
  await sequelize.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS profmat_temp (
      profmat_id INT,
      profmat_mat INT,
      profmat_prof INT,
      INDEX idx_prof (profmat_prof),
      INDEX idx_mat (profmat_mat)
    )
  `);

  await sequelize.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS profserie_temp (
      profserie_id INT,
      profserie_prof INT,
      profserie_sub INT,
      INDEX idx_prof (profserie_prof),
      INDEX idx_sub (profserie_sub)
    )
  `);

  // Inserir dados
  if (profmat.length > 0) {
    const values = profmat.map(p => [p.profmat_id, p.profmat_mat, p.profmat_prof]);
    const placeholders = values.map(() => '(?, ?, ?)').join(',');
    await sequelize.query(
      `INSERT INTO profmat_temp (profmat_id, profmat_mat, profmat_prof) VALUES ${placeholders}`,
      { replacements: values.flat() }
    );
  }

  if (profserie.length > 0) {
    const values = profserie.map(p => [p.profserie_id, p.profserie_prof, p.profserie_sub]);
    const placeholders = values.map(() => '(?, ?, ?)').join(',');
    await sequelize.query(
      `INSERT INTO profserie_temp (profserie_id, profserie_prof, profserie_sub) VALUES ${placeholders}`,
      { replacements: values.flat() }
    );
  }
}

/**
 * Insere relações em class_teachers
 * Apenas para professores mapeados
 */
async function insertClassTeachers() {
  const [result] = await sequelize.query(`
    INSERT INTO class_teachers (class_id, teacher_id, discipline_id, created_at, updated_at)
    SELECT DISTINCT
      mscm.class_id,
      mpm.new_teacher_id,
      pm.profmat_mat AS discipline_id,
      NOW(),
      NOW()
    FROM profserie_temp ps
    JOIN profmat_temp pm ON ps.profserie_prof = pm.profmat_prof
    JOIN migration_sub_class_mapping mscm ON ps.profserie_sub = mscm.sub_id
    JOIN migration_professor_mapping mpm ON ps.profserie_prof = mpm.old_professor_id
    WHERE mpm.new_teacher_id IS NOT NULL
      AND mscm.class_id IS NOT NULL
    ON DUPLICATE KEY UPDATE updated_at = NOW()
  `);

  return result.affectedRows;
}

/**
 * Estatísticas de associações
 */
async function getStats() {
  const [total] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM class_teachers
  `);

  const [byTeacher] = await sequelize.query(`
    SELECT
      t.nome AS teacher_name,
      COUNT(*) AS num_relations
    FROM class_teachers ct
    JOIN teachers t ON ct.teacher_id = t.id
    GROUP BY t.id, t.nome
    ORDER BY num_relations DESC
  `);

  const [classesWithoutTeacher] = await sequelize.query(`
    SELECT
      c.id AS class_id,
      co.name AS course_name,
      c.semester,
      c.year,
      COUNT(DISTINCT ct.teacher_id) AS num_teachers
    FROM classes c
    JOIN courses co ON c.course_id = co.id
    LEFT JOIN class_students cs ON c.id = cs.class_id
    LEFT JOIN class_teachers ct ON c.id = ct.class_id
    WHERE cs.student_id IS NOT NULL
    GROUP BY c.id, co.name, c.semester, c.year
    HAVING num_teachers = 0
    LIMIT 10
  `);

  return {
    total: total[0].total,
    byTeacher,
    classesWithoutTeacher
  };
}

/**
 * Função principal
 */
async function main() {
  console.log('\n========================================================');
  console.log('FASE 4.2: Popular class_teachers (Professores-Turmas)');
  console.log('========================================================\n');

  try {
    // 1. Ler CSVs
    console.log('📂 Lendo dados de profmat e profserie...');
    const profmat = await readProfmatCSV();
    const profserie = await readProfserieCSV();
    console.log(`   profmat: ${profmat.length} registros`);
    console.log(`   profserie: ${profserie.length} registros\n`);

    // 2. Criar tabelas temporárias
    console.log('🔨 Criando tabelas temporárias...');
    await createTempTables(profmat, profserie);
    console.log('✅ Tabelas temporárias criadas\n');

    // 3. Inserir relações
    console.log('💾 Inserindo relações professor-turma-disciplina...');
    console.log('⚠️  Apenas professores MAPEADOS serão incluídos\n');
    const inserted = await insertClassTeachers();
    console.log(`✅ ${inserted} relações inseridas/atualizadas\n`);

    // 4. Estatísticas
    console.log('📊 Estatísticas:\n');
    const stats = await getStats();

    console.log(`   Total de relações criadas: ${stats.total}\n`);

    console.log('   Relações por professor:');
    console.log('   ┌────────────────────────────────────┬──────────────┐');
    console.log('   │ Professor                          │ Num Relações │');
    console.log('   ├────────────────────────────────────┼──────────────┤');
    stats.byTeacher.forEach(t => {
      const name = String(t.teacher_name).substring(0, 34).padEnd(34);
      const num = String(t.num_relations).padEnd(12);
      console.log(`   │ ${name} │ ${num} │`);
    });
    console.log('   └────────────────────────────────────┴──────────────┘\n');

    if (stats.classesWithoutTeacher.length > 0) {
      console.log(`⚠️  Turmas com alunos mas SEM professores (${stats.classesWithoutTeacher.length}):`);
      console.log('   (Provavelmente turmas do professor TUTOR que não foi migrado)\n');

      console.log('   ┌──────────┬─────────────────────────────────┬──────────┬──────┐');
      console.log('   │ class_id │ course_name                     │ semester │ year │');
      console.log('   ├──────────┼─────────────────────────────────┼──────────┼──────┤');
      stats.classesWithoutTeacher.forEach(c => {
        const classId = String(c.class_id).padEnd(8);
        const courseName = String(c.course_name).substring(0, 31).padEnd(31);
        const semester = String(c.semester || '').padEnd(8);
        const year = String(c.year || '').padEnd(4);
        console.log(`   │ ${classId} │ ${courseName} │ ${semester} │ ${year} │`);
      });
      console.log('   └──────────┴─────────────────────────────────┴──────────┴──────┘\n');
    }

    console.log('✅ Associação professores-turmas concluída!');
    console.log('=========================================================\n');

  } catch (error) {
    console.error('❌ Erro ao popular class_teachers:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = main;
