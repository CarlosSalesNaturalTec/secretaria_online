/**
 * Script: 12_migrate_grades.js
 * Descrição: Migrar notas de boletim_novo_temp para grades
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - Apenas alunos mapeados terão notas migradas
 * - Validação de notas (0-10, arredondamento)
 * - 3 tipos de notas: teste, prova, final
 */

const { sequelize } = require('../../src/models');

/**
 * Migra notas de um tipo específico
 */
async function migrateGradesByType(type, field) {
  let query = '';

  if (type === 'final') {
    // Campo 'final' é VARCHAR, precisa converter
    query = `
      INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
      SELECT
        mem.evaluation_id,
        mms.student_id,
        CASE
          WHEN bn.${field} IS NULL OR bn.${field} = '' THEN NULL
          WHEN CAST(bn.${field} AS DECIMAL(4,2)) > 10 THEN 10.00
          ELSE ROUND(CAST(bn.${field} AS DECIMAL(4,2)), 2)
        END AS grade,
        NOW(),
        NOW()
      FROM boletim_novo_temp bn
      JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
      JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
      JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
      JOIN migration_evaluation_mapping mem
        ON mem.class_id = mscm.class_id
        AND mem.discipline_id = mdm.new_discipline_id
        AND mem.eval_type = ?
      WHERE mdm.new_discipline_id IS NOT NULL
        AND mscm.class_id IS NOT NULL
        AND mms.student_id IS NOT NULL
        AND bn.${field} IS NOT NULL
      ON DUPLICATE KEY UPDATE grade = VALUES(grade), updated_at = NOW()
    `;
  } else {
    // Campos 'teste' e 'prova' são FLOAT
    query = `
      INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
      SELECT
        mem.evaluation_id,
        mms.student_id,
        CASE
          WHEN bn.${field} > 10 THEN 10.00
          ELSE ROUND(bn.${field}, 2)
        END AS grade,
        NOW(),
        NOW()
      FROM boletim_novo_temp bn
      JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
      JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
      JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
      JOIN migration_evaluation_mapping mem
        ON mem.class_id = mscm.class_id
        AND mem.discipline_id = mdm.new_discipline_id
        AND mem.eval_type = ?
      WHERE mdm.new_discipline_id IS NOT NULL
        AND mscm.class_id IS NOT NULL
        AND mms.student_id IS NOT NULL
        AND bn.${field} IS NOT NULL
      ON DUPLICATE KEY UPDATE grade = VALUES(grade), updated_at = NOW()
    `;
  }

  const [result] = await sequelize.query(query, { replacements: [type] });
  return result.affectedRows;
}

/**
 * Estatísticas de notas migradas
 */
async function getStats() {
  const [total] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
  `);

  const [nullGrades] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%' AND g.grade IS NULL
  `);

  const [avgGrades] = await sequelize.query(`
    SELECT
      AVG(g.grade) AS avg_grade,
      MIN(g.grade) AS min_grade,
      MAX(g.grade) AS max_grade
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%' AND g.grade IS NOT NULL
  `);

  const [studentCount] = await sequelize.query(`
    SELECT COUNT(DISTINCT g.student_id) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
  `);

  const [byEvaluation] = await sequelize.query(`
    SELECT
      e.name AS evaluation_name,
      COUNT(*) AS num_grades,
      AVG(g.grade) AS avg_grade
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
    GROUP BY e.name
  `);

  return {
    total: total[0].total,
    nullGrades: nullGrades[0].total,
    avg: avgGrades[0],
    studentCount: studentCount[0].total,
    byEvaluation
  };
}

/**
 * Verifica registros órfãos
 */
async function checkOrphans() {
  const [orphans] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM boletim_novo_temp bn
    LEFT JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
    WHERE mms.student_id IS NULL
  `);

  return orphans[0].total;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n================================================');
  console.log('FASE 6.4: Migrar Notas (boletim → grades)');
  console.log('================================================\n');

  try {
    // 1. Verificar órfãos
    console.log('🔍 Verificando registros órfãos...');
    const orphans = await checkOrphans();
    if (orphans > 0) {
      console.log(`⚠️  ${orphans} registros de alunos não mapeados (serão ignorados)\n`);
    } else {
      console.log('✅ Nenhum registro órfão\n');
    }

    // 2. Migrar notas de Teste
    console.log('📝 Migrando notas de TESTE...');
    const teste = await migrateGradesByType('teste', 'teste');
    console.log(`✅ ${teste} notas migradas\n`);

    // 3. Migrar notas de Prova
    console.log('📝 Migrando notas de PROVA...');
    const prova = await migrateGradesByType('prova', 'prova');
    console.log(`✅ ${prova} notas migradas\n`);

    // 4. Migrar notas de Final
    console.log('📝 Migrando notas de FINAL...');
    const final = await migrateGradesByType('final', 'final');
    console.log(`✅ ${final} notas migradas\n`);

    // 5. Estatísticas
    console.log('📊 Estatísticas Finais:\n');
    const stats = await getStats();

    console.log(`   Total de notas migradas: ${stats.total}`);
    console.log(`   Notas NULL (sem valor): ${stats.nullGrades}`);
    console.log(`   Alunos com notas: ${stats.studentCount}\n`);

    if (stats.avg.avg_grade !== null) {
      console.log('   Estatísticas de notas:');
      console.log(`   Média geral: ${Number(stats.avg.avg_grade).toFixed(2)}`);
      console.log(`   Menor nota: ${Number(stats.avg.min_grade).toFixed(2)}`);
      console.log(`   Maior nota: ${Number(stats.avg.max_grade).toFixed(2)}\n`);
    }

    console.log('   Por tipo de avaliação:\n');
    console.log('   ┌────────────────────────────┬────────────┬─────────────┐');
    console.log('   │ Avaliação                  │ Num Notas  │ Média       │');
    console.log('   ├────────────────────────────┼────────────┼─────────────┤');
    stats.byEvaluation.forEach(e => {
      const name = String(e.evaluation_name).substring(0, 26).padEnd(26);
      const num = String(e.num_grades).padEnd(10);
      const avg = e.avg_grade ? Number(e.avg_grade).toFixed(2).padEnd(11) : 'N/A'.padEnd(11);
      console.log(`   │ ${name} │ ${num} │ ${avg} │`);
    });
    console.log('   └────────────────────────────┴────────────┴─────────────┘\n');

    console.log('✅ Migração de notas concluída!');
    console.log('=================================================\n');

  } catch (error) {
    console.error('❌ Erro ao migrar notas:', error);
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
