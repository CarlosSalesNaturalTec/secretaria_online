/**
 * Script: 11_create_evaluation_mapping.js
 * Descrição: Criar mapeamento entre tipos de avaliação e evaluation_id
 * Versão: 3.0
 * Data: 2025-12-19
 */

const { sequelize } = require('../../src/models');

/**
 * Popular mapeamento para cada tipo de avaliação
 */
async function createMapping(evalType, evalName) {
  const [result] = await sequelize.query(`
    INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
    SELECT class_id, discipline_id, ?, id
    FROM evaluations
    WHERE name = ?
    ON DUPLICATE KEY UPDATE evaluation_id = VALUES(evaluation_id)
  `, { replacements: [evalType, evalName] });

  return result.affectedRows;
}

/**
 * Verificar mapeamentos criados
 */
async function getMappingStats() {
  const [total] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_evaluation_mapping
  `);

  const [byType] = await sequelize.query(`
    SELECT eval_type, COUNT(*) AS num_mappings
    FROM migration_evaluation_mapping
    GROUP BY eval_type
  `);

  return {
    total: total[0].total,
    byType
  };
}

/**
 * Sample de mapeamentos
 */
async function getSample(limit = 5) {
  const [rows] = await sequelize.query(`
    SELECT
      mem.class_id,
      c.semester,
      co.name AS course_name,
      d.name AS discipline_name,
      mem.eval_type,
      mem.evaluation_id
    FROM migration_evaluation_mapping mem
    JOIN classes c ON mem.class_id = c.id
    JOIN courses co ON c.course_id = co.id
    JOIN disciplines d ON mem.discipline_id = d.id
    LIMIT ?
  `, { replacements: [limit] });

  return rows;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n===================================================');
  console.log('FASE 6.3: Criar Mapeamento de Avaliações');
  console.log('===================================================\n');

  try {
    // 1. Criar mapeamento para Teste
    console.log('🔗 Mapeando avaliações "Teste (histórico)"...');
    const teste = await createMapping('teste', 'Teste (histórico)');
    console.log(`✅ ${teste} mapeamentos criados\n`);

    // 2. Criar mapeamento para Prova
    console.log('🔗 Mapeando avaliações "Prova (histórico)"...');
    const prova = await createMapping('prova', 'Prova (histórico)');
    console.log(`✅ ${prova} mapeamentos criados\n`);

    // 3. Criar mapeamento para Final
    console.log('🔗 Mapeando avaliações "Prova Final (histórico)"...');
    const final = await createMapping('final', 'Prova Final (histórico)');
    console.log(`✅ ${final} mapeamentos criados\n`);

    // 4. Estatísticas
    console.log('📊 Estatísticas:\n');
    const stats = await getMappingStats();

    console.log(`   Total de mapeamentos: ${stats.total}\n`);

    console.log('   Por tipo de avaliação:');
    console.log('   ┌──────────────┬───────────────┐');
    console.log('   │ Tipo         │ Num Mappings  │');
    console.log('   ├──────────────┼───────────────┤');
    stats.byType.forEach(t => {
      const type = String(t.eval_type).padEnd(12);
      const num = String(t.num_mappings).padEnd(13);
      console.log(`   │ ${type} │ ${num} │`);
    });
    console.log('   └──────────────┴───────────────┘\n');

    // 5. Sample
    console.log('📋 Sample de mapeamentos:\n');
    const sample = await getSample(5);

    console.log('┌──────────┬──────────┬──────────────────┬────────────────────────┬──────────┬───────────────┐');
    console.log('│ class_id │ semester │ course           │ discipline             │ type     │ evaluation_id │');
    console.log('├──────────┼──────────┼──────────────────┼────────────────────────┼──────────┼───────────────┤');
    sample.forEach(s => {
      const classId = String(s.class_id).padEnd(8);
      const semester = String(s.semester || '').padEnd(8);
      const course = String(s.course_name).substring(0, 16).padEnd(16);
      const discipline = String(s.discipline_name).substring(0, 22).padEnd(22);
      const type = String(s.eval_type).padEnd(8);
      const evalId = String(s.evaluation_id).padEnd(13);
      console.log(`│ ${classId} │ ${semester} │ ${course} │ ${discipline} │ ${type} │ ${evalId} │`);
    });
    console.log('└──────────┴──────────┴──────────────────┴────────────────────────┴──────────┴───────────────┘\n');

    console.log('✅ Mapeamento de avaliações concluído!');
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Erro ao criar mapeamento:', error);
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
