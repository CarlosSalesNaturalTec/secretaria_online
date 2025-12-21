/**
 * Script: 04_map_existing_students.js
 * Descrição: Mapear APENAS alunos que já existem na tabela students
 * Versão: 3.0 - APENAS MAPEIA EXISTENTES (NÃO CRIA NOVOS)
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - NÃO cria novos registros em students
 * - APENAS mapeia alunos que JÁ EXISTEM
 * - Usa campo students.matricula para fazer match
 */

const { sequelize } = require('../../src/models');

/**
 * Mapeia alunos existentes
 * Usa o campo matricula da tabela students para fazer match
 */
async function mapExistingStudents() {
  const [result] = await sequelize.query(`
    INSERT INTO migration_matricula_student (old_matricula, student_id, sub_id)
    SELECT
      s.matricula AS old_matricula,
      s.id AS student_id,
      s.sub_categoria AS sub_id  -- Campo que armazena sub_id do sistema antigo
    FROM students s
    WHERE s.matricula IS NOT NULL
      AND s.deleted_at IS NULL  -- Apenas alunos ativos
    ON DUPLICATE KEY UPDATE student_id = student_id
  `);

  return result.affectedRows;
}

/**
 * Busca estatísticas de mapeamento
 */
async function getStats() {
  const [stats] = await sequelize.query(`
    SELECT
      COUNT(*) AS alunos_mapeados,
      COUNT(DISTINCT sub_id) AS subs_diferentes
    FROM migration_matricula_student
  `);

  const [alunosAtivos] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM students
    WHERE deleted_at IS NULL
  `);

  const [alunosSemMatricula] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM students
    WHERE (matricula IS NULL OR matricula = '')
      AND deleted_at IS NULL
  `);

  return {
    ...stats[0],
    total_alunos_ativos: alunosAtivos[0].total,
    alunos_sem_matricula: alunosSemMatricula[0].total
  };
}

/**
 * Lista alunos mapeados (sample)
 */
async function getSampleMappedStudents(limit = 10) {
  const [students] = await sequelize.query(`
    SELECT
      mms.old_matricula,
      s.nome,
      mms.sub_id,
      s.id AS student_id
    FROM migration_matricula_student mms
    JOIN students s ON mms.student_id = s.id
    ORDER BY mms.old_matricula
    LIMIT ?
  `, { replacements: [limit] });

  return students;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n===============================================');
  console.log('FASE 2.1: Mapeamento de Alunos Existentes v3');
  console.log('===============================================\n');

  try {
    // 1. Mapear alunos existentes
    console.log('🔗 Mapeando alunos que já existem em students...');
    const mapped = await mapExistingStudents();
    console.log(`✅ ${mapped} alunos mapeados\n`);

    // 2. Buscar estatísticas
    console.log('📊 Estatísticas de mapeamento:\n');
    const stats = await getStats();

    console.log(`   Total de alunos ativos: ${stats.total_alunos_ativos}`);
    console.log(`   Alunos mapeados: ${stats.alunos_mapeados}`);
    console.log(`   Alunos sem matrícula: ${stats.alunos_sem_matricula}`);
    console.log(`   Subs diferentes: ${stats.subs_diferentes}\n`);

    const taxaMapeamento = (stats.alunos_mapeados / stats.total_alunos_ativos * 100).toFixed(1);
    console.log(`   📈 Taxa de mapeamento: ${taxaMapeamento}%\n`);

    // 3. Mostrar sample de alunos mapeados
    console.log('📋 Sample de alunos mapeados (primeiros 10):\n');
    const sample = await getSampleMappedStudents(10);

    console.log('┌──────────────┬──────────────────────────────────┬────────┬─────────────┐');
    console.log('│ matricula    │ nome                             │ sub_id │ student_id  │');
    console.log('├──────────────┼──────────────────────────────────┼────────┼─────────────┤');
    sample.forEach(s => {
      const matricula = String(s.old_matricula || '').padEnd(12);
      const nome = String(s.nome || '').substring(0, 32).padEnd(32);
      const subId = String(s.sub_id || 'NULL').padEnd(6);
      const studentId = String(s.student_id).padEnd(11);
      console.log(`│ ${matricula} │ ${nome} │ ${subId} │ ${studentId} │`);
    });
    console.log('└──────────────┴──────────────────────────────────┴────────┴─────────────┘\n');

    // 4. Avisos
    if (stats.alunos_sem_matricula > 0) {
      console.log('⚠️  ATENÇÃO:');
      console.log(`   ${stats.alunos_sem_matricula} alunos não têm matrícula cadastrada`);
      console.log('   Esses alunos NÃO serão migrados (sem como fazer match com sistema antigo)\n');
    }

    console.log('✅ Mapeamento de alunos concluído!');
    console.log('================================================\n');

  } catch (error) {
    console.error('❌ Erro ao mapear alunos:', error);
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
