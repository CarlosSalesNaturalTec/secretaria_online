/**
 * Script: 06_populate_class_students.js
 * Descrição: Popular tabela class_students (associação alunos-turmas)
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * Usa mapeamentos:
 * - migration_matricula_student (matricula -> student_id + class_id)
 */

const { sequelize } = require('../../src/models');

/**
 * Atualiza class_id em migration_matricula_student
 * Usa mapeamento sub_id -> class_id
 */
async function updateClassIds() {
  const [result] = await sequelize.query(`
    UPDATE migration_matricula_student mms
    JOIN migration_sub_class_mapping mscm ON mms.sub_id = mscm.sub_id
    SET mms.class_id = mscm.class_id
    WHERE mms.class_id IS NULL
  `);

  return result.affectedRows;
}

/**
 * Verifica alunos sem class_id
 */
async function getStudentsWithoutClass() {
  const [rows] = await sequelize.query(`
    SELECT
      mms.old_matricula,
      s.nome,
      mms.sub_id
    FROM migration_matricula_student mms
    JOIN students s ON mms.student_id = s.id
    WHERE mms.class_id IS NULL
    LIMIT 20
  `);

  return rows;
}

/**
 * Insere alunos nas turmas
 */
async function insertClassStudents() {
  const [result] = await sequelize.query(`
    INSERT INTO class_students (class_id, student_id, created_at, updated_at)
    SELECT DISTINCT
      mms.class_id,
      mms.student_id,
      NOW(),
      NOW()
    FROM migration_matricula_student mms
    WHERE mms.class_id IS NOT NULL
    ON DUPLICATE KEY UPDATE updated_at = NOW()
  `);

  return result.affectedRows;
}

/**
 * Busca estatísticas
 */
async function getStats() {
  const [total] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_matricula_student
  `);

  const [withClass] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_matricula_student WHERE class_id IS NOT NULL
  `);

  const [withoutClass] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_matricula_student WHERE class_id IS NULL
  `);

  const [inserted] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM class_students
  `);

  return {
    total: total[0].total,
    withClass: withClass[0].total,
    withoutClass: withoutClass[0].total,
    inserted: inserted[0].total
  };
}

/**
 * Sample de alunos por turma
 */
async function getClassSample(limit = 5) {
  const [rows] = await sequelize.query(`
    SELECT
      c.id AS class_id,
      co.name AS course_name,
      c.semester,
      c.year,
      COUNT(cs.student_id) AS num_students
    FROM classes c
    JOIN courses co ON c.course_id = co.id
    LEFT JOIN class_students cs ON c.id = cs.class_id
    GROUP BY c.id, co.name, c.semester, c.year
    ORDER BY num_students DESC
    LIMIT ?
  `, { replacements: [limit] });

  return rows;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n=================================================');
  console.log('FASE 4.1: Popular class_students (Alunos-Turmas)');
  console.log('=================================================\n');

  try {
    // 1. Atualizar class_id em mapeamento
    console.log('🔗 Associando alunos a turmas via sub_id...');
    const updated = await updateClassIds();
    console.log(`✅ ${updated} alunos associados a turmas\n`);

    // 2. Verificar alunos sem classe
    const withoutClass = await getStudentsWithoutClass();
    if (withoutClass.length > 0) {
      console.log(`⚠️  ${withoutClass.length} alunos sem class_id (sub_id não encontrado):\n`);
      withoutClass.forEach(s => {
        console.log(`   - ${s.nome} (matricula=${s.old_matricula}, sub_id=${s.sub_id})`);
      });
      console.log();
    }

    // 3. Inserir em class_students
    console.log('💾 Inserindo alunos nas turmas...');
    const inserted = await insertClassStudents();
    console.log(`✅ ${inserted} registros inseridos/atualizados em class_students\n`);

    // 4. Estatísticas
    const stats = await getStats();
    console.log('📊 Estatísticas:');
    console.log(`   Total de alunos mapeados: ${stats.total}`);
    console.log(`   Com turma atribuída: ${stats.withClass}`);
    console.log(`   Sem turma: ${stats.withoutClass}`);
    console.log(`   Registros em class_students: ${stats.inserted}\n`);

    // 5. Sample de turmas
    console.log('📋 Sample de turmas com mais alunos:\n');
    const sample = await getClassSample(5);

    console.log('┌──────────┬─────────────────────────────────┬──────────┬──────┬──────────────┐');
    console.log('│ class_id │ course_name                     │ semester │ year │ num_students │');
    console.log('├──────────┼─────────────────────────────────┼──────────┼──────┼──────────────┤');
    sample.forEach(c => {
      const classId = String(c.class_id).padEnd(8);
      const courseName = String(c.course_name).substring(0, 31).padEnd(31);
      const semester = String(c.semester || '').padEnd(8);
      const year = String(c.year || '').padEnd(4);
      const numStudents = String(c.num_students || 0).padEnd(12);
      console.log(`│ ${classId} │ ${courseName} │ ${semester} │ ${year} │ ${numStudents} │`);
    });
    console.log('└──────────┴─────────────────────────────────┴──────────┴──────┴──────────────┘\n');

    console.log('✅ Associação alunos-turmas concluída!');
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Erro ao popular class_students:', error);
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
