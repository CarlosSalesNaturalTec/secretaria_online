/**
 * Script: 05_create_classes_from_sub.js
 * Descrição: Criar turmas (classes) a partir dos dados de sub.csv
 * Versão: 3.0
 * Data: 2025-12-19
 *
 * Extrai informações de curso e semestre de sub_title
 * Exemplo: "Bacharelado em Psicologia 8°" → curso + semestre 8
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { sequelize } = require('../../src/models');

/**
 * Normaliza nome de curso para comparação
 */
function normalizeCourse(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extrai informações de curso e semestre de sub_title
 * Exemplo: "Bacharelado em Psicologia 8°" → { course_name: "Bacharelado em Psicologia", semester: 8 }
 */
function parseSubTitle(subTitle) {
  // Regex para extrair curso + semestre
  // Match exemplos: "Bacharelado em Psicologia 8°", "Licenciatura em Pedagogia 1°"
  const match = subTitle.match(/(.+?)\s+(\d+)/);

  if (match) {
    return {
      course_name: match[1].trim(),
      semester: parseInt(match[2])
    };
  }

  // Se não encontrar padrão, retorna curso completo e semestre 1
  return {
    course_name: subTitle.trim(),
    semester: 1
  };
}

/**
 * Lê CSV de subs do sistema antigo
 */
async function readSubsCSV() {
  return new Promise((resolve, reject) => {
    const subs = [];
    const csvPath = path.join(__dirname, '../../../database/sub.csv');

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('utf-8'))
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        const parsed = parseSubTitle(row.sub_title);
        subs.push({
          sub_id: parseInt(row.sub_id),
          sub_title: row.sub_title,
          course_name: parsed.course_name,
          semester: parsed.semester,
          sub_categoria: parseInt(row.sub_categoria)
        });
      })
      .on('end', () => resolve(subs))
      .on('error', reject);
  });
}

/**
 * Busca course_id correspondente ao nome
 */
async function findCourseId(courseName) {
  const normalized = normalizeCourse(courseName);

  const [courses] = await sequelize.query(
    'SELECT id, name FROM courses WHERE deleted_at IS NULL'
  );

  // Tentar match exato normalizado
  const exactMatch = courses.find(c =>
    normalizeCourse(c.name) === normalized
  );

  if (exactMatch) {
    return { id: exactMatch.id, name: exactMatch.name, matchType: 'exact' };
  }

  // Tentar match parcial (curso contém ou está contido)
  const partialMatch = courses.find(c => {
    const normalizedCourse = normalizeCourse(c.name);
    return normalizedCourse.includes(normalized) || normalized.includes(normalizedCourse);
  });

  if (partialMatch) {
    return { id: partialMatch.id, name: partialMatch.name, matchType: 'partial' };
  }

  return null;
}

/**
 * Cria ou busca classe existente
 */
async function createOrGetClass(courseId, semester, year) {
  // Verificar se já existe
  const [existing] = await sequelize.query(`
    SELECT id FROM classes
    WHERE course_id = ? AND semester = ? AND year = ? AND deleted_at IS NULL
  `, { replacements: [courseId, semester, year] });

  if (existing.length > 0) {
    return { id: existing[0].id, created: false };
  }

  // Criar nova classe
  const [result] = await sequelize.query(`
    INSERT INTO classes (course_id, semester, year, created_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW())
  `, { replacements: [courseId, semester, year] });

  // Buscar o ID da classe recém-criada
  const [newClass] = await sequelize.query(`
    SELECT id FROM classes
    WHERE course_id = ? AND semester = ? AND year = ? AND deleted_at IS NULL
    ORDER BY id DESC LIMIT 1
  `, { replacements: [courseId, semester, year] });

  return { id: newClass[0].id, created: true };
}

/**
 * Insere mapeamento sub -> class
 */
async function insertSubClassMapping(subId, classId, courseName, semester, year) {
  await sequelize.query(`
    INSERT INTO migration_sub_class_mapping (sub_id, class_id, course_name, semester, year)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE class_id = ?, course_name = ?, semester = ?, year = ?
  `, { replacements: [subId, classId, courseName, semester, year, classId, courseName, semester, year] });
}

/**
 * Função principal
 */
async function main() {
  console.log('\n==============================================');
  console.log('FASE 3.1: Criação de Turmas a partir de Sub');
  console.log('==============================================\n');

  const year = 2024; // Ano padrão (pode ser ajustado)
  const stats = {
    total: 0,
    created: 0,
    existing: 0,
    courseNotFound: 0
  };

  try {
    // 1. Ler subs do CSV
    console.log('📂 Lendo subs do sistema antigo...');
    const subs = await readSubsCSV();
    console.log(`   Encontrados: ${subs.length} subs\n`);

    // 2. Processar cada sub
    console.log('🔨 Criando turmas...\n');

    for (const sub of subs) {
      stats.total++;

      // Buscar course_id
      const course = await findCourseId(sub.course_name);

      if (!course) {
        console.warn(`⚠️  Curso não encontrado: "${sub.course_name}" (sub_id=${sub.sub_id})`);
        stats.courseNotFound++;
        continue;
      }

      if (course.matchType === 'partial') {
        console.log(`   🔍 Match parcial: "${sub.course_name}" → "${course.name}"`);
      }

      // Criar ou buscar classe
      const classResult = await createOrGetClass(course.id, sub.semester, year);

      if (classResult.created) {
        console.log(`✅ Classe criada: ${sub.sub_title} → class_id=${classResult.id}`);
        stats.created++;
      } else {
        console.log(`   ℹ️  Classe já existe: ${sub.sub_title} → class_id=${classResult.id}`);
        stats.existing++;
      }

      // Inserir mapeamento
      await insertSubClassMapping(sub.sub_id, classResult.id, sub.course_name, sub.semester, year);
    }

    // 3. Resumo
    console.log('\n📊 Resumo:');
    console.log(`   Total de subs processados: ${stats.total}`);
    console.log(`   ✅ Turmas criadas: ${stats.created}`);
    console.log(`   ℹ️  Turmas já existentes: ${stats.existing}`);
    console.log(`   ❌ Cursos não encontrados: ${stats.courseNotFound}\n`);

    if (stats.courseNotFound > 0) {
      console.log('⚠️  Alguns cursos não foram encontrados. Verifique os nomes em courses.\n');
    }

    console.log('✅ Criação de turmas concluída!');
    console.log('===============================================\n');

  } catch (error) {
    console.error('❌ Erro ao criar turmas:', error);
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
