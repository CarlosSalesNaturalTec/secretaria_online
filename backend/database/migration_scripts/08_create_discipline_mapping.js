/**
 * Script: 08_create_discipline_mapping.js
 * Descrição: Mapear disciplinas do sistema antigo para disciplines
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * Estratégia:
 * 1. Extrair nomes únicos de disciplinas de boletim_novo.csv
 * 2. Fazer match com disciplines (exato e fuzzy)
 * 3. Armazenar em migration_discipline_mapping
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { sequelize } = require('../../src/models');

/**
 * Normaliza string para comparação
 */
function normalizeString(str) {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Calcula similaridade entre duas strings (algoritmo simplificado)
 * Retorna valor entre 0 e 1
 */
function calculateSimilarity(str1, str2) {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein simplificado (conta palavras em comum)
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');

  const commonWords = words1.filter(w => words2.includes(w)).length;
  const totalWords = Math.max(words1.length, words2.length);

  return totalWords > 0 ? commonWords / totalWords : 0;
}

/**
 * Extrai nomes únicos de disciplinas de boletim_novo.csv
 */
async function extractDisciplinesFromBoletim() {
  return new Promise((resolve, reject) => {
    const disciplinas = new Set();
    const csvPath = path.join(__dirname, '../../../database/boletim_novo.csv');

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('utf-8'))
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        if (row.disciplina && row.disciplina.trim()) {
          disciplinas.add(row.disciplina.trim());
        }
      })
      .on('end', () => resolve(Array.from(disciplinas)))
      .on('error', reject);
  });
}

/**
 * Busca disciplinas no sistema novo
 */
async function getExistingDisciplines() {
  const [disciplines] = await sequelize.query(
    'SELECT id, name FROM disciplines WHERE deleted_at IS NULL'
  );
  return disciplines;
}

/**
 * Mapeia disciplinas antigas para novas
 */
function mapDisciplines(oldDisciplines, newDisciplines) {
  const mappings = [];

  for (const oldName of oldDisciplines) {
    const normalized = normalizeString(oldName);

    // 1. Tentar match exato
    const exactMatch = newDisciplines.find(d =>
      normalizeString(d.name) === normalized
    );

    if (exactMatch) {
      mappings.push({
        old_name: oldName,
        old_name_normalized: normalized,
        new_discipline_id: exactMatch.id,
        match_type: 'exact',
        similarity_score: 1.0
      });
      continue;
    }

    // 2. Tentar match fuzzy (similaridade > 0.7)
    let bestMatch = null;
    let bestScore = 0;

    for (const newDisc of newDisciplines) {
      const score = calculateSimilarity(oldName, newDisc.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = newDisc;
      }
    }

    if (bestScore >= 0.7) {
      mappings.push({
        old_name: oldName,
        old_name_normalized: normalized,
        new_discipline_id: bestMatch.id,
        match_type: 'fuzzy',
        similarity_score: bestScore
      });
    } else {
      // Sem match
      mappings.push({
        old_name: oldName,
        old_name_normalized: normalized,
        new_discipline_id: null,
        match_type: 'not_found',
        similarity_score: bestScore
      });
    }
  }

  return mappings;
}

/**
 * Insere mapeamentos no banco
 */
async function insertMappings(mappings) {
  if (mappings.length === 0) return 0;

  const values = mappings.map(m => [
    m.old_name,
    m.old_name_normalized,
    m.new_discipline_id,
    m.match_type,
    m.similarity_score
  ]);

  const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(',');

  const [result] = await sequelize.query(
    `INSERT INTO migration_discipline_mapping
     (old_name, old_name_normalized, new_discipline_id, match_type, similarity_score)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       new_discipline_id = VALUES(new_discipline_id),
       match_type = VALUES(match_type),
       similarity_score = VALUES(similarity_score)`,
    { replacements: values.flat() }
  );

  return result.affectedRows;
}

/**
 * Estatísticas de mapeamento
 */
function getStats(mappings) {
  const exact = mappings.filter(m => m.match_type === 'exact').length;
  const fuzzy = mappings.filter(m => m.match_type === 'fuzzy').length;
  const notFound = mappings.filter(m => m.match_type === 'not_found').length;

  return { total: mappings.length, exact, fuzzy, notFound };
}

/**
 * Função principal
 */
async function main() {
  console.log('\n=============================================');
  console.log('FASE 5: Mapeamento de Disciplinas');
  console.log('=============================================\n');

  try {
    // 1. Extrair disciplinas de boletim_novo
    console.log('📂 Extraindo disciplinas de boletim_novo.csv...');
    const oldDisciplines = await extractDisciplinesFromBoletim();
    console.log(`   Encontradas: ${oldDisciplines.length} disciplinas únicas\n`);

    // 2. Buscar disciplinas no sistema novo
    console.log('🔍 Buscando disciplinas no sistema novo...');
    const newDisciplines = await getExistingDisciplines();
    console.log(`   Encontradas: ${newDisciplines.length} disciplinas\n`);

    // 3. Fazer mapeamento
    console.log('🔗 Mapeando disciplinas...\n');
    const mappings = mapDisciplines(oldDisciplines, newDisciplines);

    const stats = getStats(mappings);

    console.log('📊 Resultados do mapeamento:');
    console.log(`   ✅ Match exato: ${stats.exact}`);
    console.log(`   🔍 Match fuzzy: ${stats.fuzzy}`);
    console.log(`   ❌ Não encontradas: ${stats.notFound}`);
    console.log(`   📈 Taxa de sucesso: ${((stats.exact + stats.fuzzy) / stats.total * 100).toFixed(1)}%\n`);

    // 4. Mostrar não encontradas
    if (stats.notFound > 0) {
      console.log('⚠️  Disciplinas não encontradas (precisam ser criadas manualmente):\n');
      const notFound = mappings.filter(m => m.match_type === 'not_found');
      notFound.forEach(m => {
        console.log(`   - ${m.old_name}`);
      });
      console.log();
    }

    // 5. Mostrar fuzzy matches para revisão
    const fuzzyMatches = mappings.filter(m => m.match_type === 'fuzzy');
    if (fuzzyMatches.length > 0) {
      console.log('🔍 Matches fuzzy (revisar se corretos):\n');
      for (const m of fuzzyMatches) {
        const newDisc = newDisciplines.find(d => d.id === m.new_discipline_id);
        const score = (m.similarity_score * 100).toFixed(0);
        console.log(`   "${m.old_name}" → "${newDisc.name}" (${score}%)`);
      }
      console.log();
    }

    // 6. Inserir no banco
    console.log('💾 Inserindo mapeamentos no banco...');
    const inserted = await insertMappings(mappings);
    console.log(`✅ ${inserted} mapeamentos inseridos/atualizados\n`);

    console.log('✅ Mapeamento de disciplinas concluído!');
    console.log('==============================================\n');

  } catch (error) {
    console.error('❌ Erro ao mapear disciplinas:', error);
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
