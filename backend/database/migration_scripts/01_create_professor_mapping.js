/**
 * Script: 01_create_professor_mapping.js
 * Descrição: Mapear professores do sistema antigo para teachers existentes
 * Versão: 3.0 - APENAS MAPEIA EXISTENTES (NÃO CRIA NOVOS)
 * Data: 2025-12-19
 *
 * IMPORTANTE:
 * - NÃO cria novos registros em teachers
 * - APENAS mapeia professores que JÁ EXISTEM
 * - Usa match por nome normalizado
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { sequelize } = require('../../src/models');

/**
 * Normaliza string para comparação
 * Remove acentos, converte para lowercase, remove espaços extras
 */
function normalizeString(str) {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Remove espaços extras
}

/**
 * Lê CSV de professores do sistema antigo
 */
async function readProfessoresCSV() {
  return new Promise((resolve, reject) => {
    const professores = [];
    const csvPath = path.join(__dirname, '../../../database/professor.csv');

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('utf-8'))
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        professores.push({
          professor_id: parseInt(row.professor_id),
          professor_nome: row.professor_nome,
          professor_login: row.professor_login,
          professor_senha: row.professor_senha,
        });
      })
      .on('end', () => resolve(professores))
      .on('error', reject);
  });
}

/**
 * Busca professores que já existem na tabela teachers
 */
async function getExistingTeachers() {
  const [teachers] = await sequelize.query(
    'SELECT id, nome FROM teachers WHERE deleted_at IS NULL'
  );
  return teachers;
}

/**
 * Mapeia professores antigos para teachers existentes
 */
function mapProfessores(professoresAntigos, teachersNovos) {
  const mapeamentos = [];
  const ignorados = [];

  for (const prof of professoresAntigos) {
    const normalizedOld = normalizeString(prof.professor_nome);

    // Tentar match exato por nome normalizado
    const match = teachersNovos.find(t =>
      normalizeString(t.nome) === normalizedOld
    );

    if (match) {
      mapeamentos.push({
        old_id: prof.professor_id,
        old_nome: prof.professor_nome,
        old_login: prof.professor_login,
        old_senha: prof.professor_senha,
        new_teacher_id: match.id,
        match_type: 'exact'
      });

      console.log(`✅ Mapeado: ${prof.professor_nome} (old_id=${prof.professor_id}) → teacher_id=${match.id}`);
    } else {
      ignorados.push(prof);
      console.warn(`⚠️  Professor NÃO existe em teachers (será ignorado): ${prof.professor_nome} (old_id=${prof.professor_id})`);
    }
  }

  return { mapeamentos, ignorados };
}

/**
 * Insere mapeamentos no banco de dados
 */
async function insertMappings(mapeamentos) {
  if (mapeamentos.length === 0) {
    console.log('⚠️  Nenhum mapeamento para inserir.');
    return;
  }

  const values = mapeamentos.map(m => [
    m.old_id,
    m.old_nome,
    m.old_login,
    m.old_senha,
    m.new_teacher_id,
    m.match_type
  ]);

  const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(',');

  await sequelize.query(
    `INSERT INTO migration_professor_mapping
     (old_professor_id, old_nome, old_login, old_senha, new_teacher_id, match_type)
     VALUES ${placeholders}`,
    { replacements: values.flat() }
  );

  console.log(`✅ ${mapeamentos.length} mapeamentos inseridos no banco`);
}

/**
 * Função principal
 */
async function main() {
  console.log('\n========================================');
  console.log('FASE 1.2: Mapeamento de Professores v3');
  console.log('========================================\n');

  try {
    // 1. Ler professores do CSV
    console.log('📂 Lendo professores do sistema antigo...');
    const professoresAntigos = await readProfessoresCSV();
    console.log(`   Encontrados: ${professoresAntigos.length} professores\n`);

    // 2. Buscar teachers existentes
    console.log('🔍 Buscando teachers no sistema novo...');
    const teachersNovos = await getExistingTeachers();
    console.log(`   Encontrados: ${teachersNovos.length} teachers\n`);

    // 3. Fazer mapeamento
    console.log('🔗 Mapeando professores...\n');
    const { mapeamentos, ignorados } = mapProfessores(professoresAntigos, teachersNovos);

    console.log('\n📊 Resumo do Mapeamento:');
    console.log(`   ✅ Mapeados: ${mapeamentos.length}`);
    console.log(`   ❌ Ignorados: ${ignorados.length}`);
    console.log(`   📈 Taxa de sucesso: ${((mapeamentos.length / professoresAntigos.length) * 100).toFixed(1)}%\n`);

    // 4. Inserir no banco
    console.log('💾 Inserindo mapeamentos no banco...');
    await insertMappings(mapeamentos);

    console.log('\n✅ Mapeamento de professores concluído!');
    console.log('=========================================\n');

    // Mostrar ignorados
    if (ignorados.length > 0) {
      console.log('⚠️  Professores ignorados (não existem em teachers):');
      ignorados.forEach(p => {
        console.log(`   - ${p.professor_nome} (id=${p.professor_id})`);
      });
      console.log();
    }

  } catch (error) {
    console.error('❌ Erro ao mapear professores:', error);
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
