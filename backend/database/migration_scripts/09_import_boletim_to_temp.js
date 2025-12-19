/**
 * Script: 09_import_boletim_to_temp.js
 * Descrição: Importar boletim_novo.csv para tabela temporária
 * Versão: 3.0
 * Data: 2025-12-19
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { sequelize } = require('../../src/models');

/**
 * Cria tabela temporária
 */
async function createTempTable() {
  await sequelize.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS boletim_novo_temp (
      id INT,
      matricula INT,
      disciplina VARCHAR(200),
      periodo VARCHAR(15),
      teste FLOAT,
      prova FLOAT,
      final VARCHAR(16),
      resultado FLOAT,
      status VARCHAR(35),
      semestre VARCHAR(70),
      dia_hora VARCHAR(50),
      INDEX idx_matricula (matricula),
      INDEX idx_disciplina (disciplina)
    )
  `);

  // Limpar se já existir
  await sequelize.query('TRUNCATE TABLE boletim_novo_temp');
}

/**
 * Lê CSV e retorna dados
 */
async function readBoletimCSV() {
  return new Promise((resolve, reject) => {
    const data = [];
    const csvPath = path.join(__dirname, '../../../database/boletim_novo.csv');

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('utf-8'))
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        data.push({
          id: parseInt(row.id) || null,
          matricula: parseInt(row.matricula) || null,
          disciplina: row.disciplina || null,
          periodo: row.periodo || null,
          teste: parseFloat(row.teste) || null,
          prova: parseFloat(row.prova) || null,
          final: row.final || null,
          resultado: parseFloat(row.resultado) || null,
          status: row.status || null,
          semestre: row.semestre || null,
          dia_hora: row.dia_hora || null
        });
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

/**
 * Insere dados na tabela temporária (em lotes)
 */
async function insertInBatches(data, batchSize = 500) {
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const values = batch.map(row => [
      row.id,
      row.matricula,
      row.disciplina,
      row.periodo,
      row.teste,
      row.prova,
      row.final,
      row.resultado,
      row.status,
      row.semestre,
      row.dia_hora
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');

    await sequelize.query(
      `INSERT INTO boletim_novo_temp
       (id, matricula, disciplina, periodo, teste, prova, final, resultado, status, semestre, dia_hora)
       VALUES ${placeholders}`,
      { replacements: values.flat() }
    );

    inserted += batch.length;
    console.log(`   Inseridos: ${inserted}/${data.length}`);
  }

  return inserted;
}

/**
 * Estatísticas da tabela
 */
async function getStats() {
  const [total] = await sequelize.query('SELECT COUNT(*) AS total FROM boletim_novo_temp');

  const [byDiscipline] = await sequelize.query(`
    SELECT disciplina, COUNT(*) AS num_registros
    FROM boletim_novo_temp
    GROUP BY disciplina
    ORDER BY num_registros DESC
    LIMIT 10
  `);

  const [missingData] = await sequelize.query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN matricula IS NULL THEN 1 ELSE 0 END) AS sem_matricula,
      SUM(CASE WHEN disciplina IS NULL THEN 1 ELSE 0 END) AS sem_disciplina
    FROM boletim_novo_temp
  `);

  return {
    total: total[0].total,
    byDiscipline,
    missing: missingData[0]
  };
}

/**
 * Função principal
 */
async function main() {
  console.log('\n==================================================');
  console.log('FASE 6.1: Importar boletim_novo para Temp Table');
  console.log('==================================================\n');

  try {
    // 1. Criar tabela temporária
    console.log('🔨 Criando tabela temporária...');
    await createTempTable();
    console.log('✅ Tabela criada\n');

    // 2. Ler CSV
    console.log('📂 Lendo boletim_novo.csv...');
    const data = await readBoletimCSV();
    console.log(`   Encontrados: ${data.length} registros\n`);

    // 3. Inserir dados
    console.log('💾 Inserindo dados em lotes...\n');
    const inserted = await insertInBatches(data);
    console.log(`\n✅ ${inserted} registros inseridos\n`);

    // 4. Estatísticas
    console.log('📊 Estatísticas:\n');
    const stats = await getStats();

    console.log(`   Total de registros: ${stats.total}`);
    console.log(`   Sem matrícula: ${stats.missing.sem_matricula}`);
    console.log(`   Sem disciplina: ${stats.missing.sem_disciplina}\n`);

    console.log('   Top 10 disciplinas por número de registros:\n');
    console.log('   ┌─────────────────────────────────────────────┬───────────────┐');
    console.log('   │ Disciplina                                  │ Num Registros │');
    console.log('   ├─────────────────────────────────────────────┼───────────────┤');
    stats.byDiscipline.forEach(d => {
      const disciplina = String(d.disciplina || '').substring(0, 43).padEnd(43);
      const num = String(d.num_registros).padEnd(13);
      console.log(`   │ ${disciplina} │ ${num} │`);
    });
    console.log('   └─────────────────────────────────────────────┴───────────────┘\n');

    console.log('✅ Importação concluída!');
    console.log('===================================================\n');

  } catch (error) {
    console.error('❌ Erro ao importar boletim:', error);
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
