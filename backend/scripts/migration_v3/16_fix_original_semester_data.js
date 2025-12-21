const db = require('../../src/models');

/**
 * Script de correção: Popula campos de semestre original nas avaliações históricas
 *
 * Este script corrige a perda de informação identificada na migração v3.
 * Ele lê os dados da tabela temporária boletim_novo_temp e extrai as informações
 * do campo "semestre" para popular os novos campos nas avaliações.
 */

/**
 * Função para parsear o campo "semestre" do CSV
 * Exemplos de formatos:
 * - "1° Psicologia" → { semester: 1, course: "Psicologia" }
 * - "Bacharelado em Psicologia 8°" → { semester: 8, course: "Bacharelado em Psicologia" }
 * - "8° Serviço Social" → { semester: 8, course: "Serviço Social" }
 *
 * @param {string} semestreRaw - Valor do campo "semestre" do CSV
 * @returns {Object} { semester: number|null, courseName: string|null }
 */
function parseSemestre(semestreRaw) {
  if (!semestreRaw || semestreRaw.trim() === '') {
    return { semester: null, courseName: null };
  }

  const raw = semestreRaw.trim();

  // Pattern 1: "1° Psicologia", "8° Serviço Social" (número no início)
  const pattern1 = /^(\d+)[°º]\s+(.+)$/i;
  const match1 = raw.match(pattern1);
  if (match1) {
    return {
      semester: parseInt(match1[1], 10),
      courseName: match1[2].trim()
    };
  }

  // Pattern 2: "Bacharelado em Psicologia 1°", "Complementação Pedagógica em Geografia I°" (número no final)
  const pattern2 = /^(.+?)\s+(\d+|I{1,3}|IV|V|VI{1,3}|IX|X)[°º]?\s*$/i;
  const match2 = raw.match(pattern2);
  if (match2) {
    let semesterNum = match2[2];

    // Converte números romanos para arábicos
    const romanToArabic = {
      'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
      'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
      'XI': 11, 'XII': 12
    };

    if (romanToArabic[semesterNum.toUpperCase()]) {
      semesterNum = romanToArabic[semesterNum.toUpperCase()];
    } else {
      semesterNum = parseInt(semesterNum, 10);
    }

    return {
      semester: semesterNum,
      courseName: match2[1].trim()
    };
  }

  // Pattern 3: Cursos sem número de semestre (ex: "Atendente de Farmácia", "Especialização em...")
  // Nesses casos, retorna apenas o nome do curso sem semestre
  return {
    semester: null,
    courseName: raw
  };
}

async function fixOriginalSemesterData() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Iniciando correção dos dados de semestre original...\n');

    // 1. Buscar todos os registros únicos de semestre do CSV
    const [uniqueSemesters] = await db.sequelize.query(`
      SELECT DISTINCT semestre
      FROM boletim_novo_temp
      WHERE semestre IS NOT NULL AND semestre != ''
      ORDER BY semestre
    `, { transaction });

    console.log(`Encontrados ${uniqueSemesters.length} valores únicos de semestre no CSV.`);
    console.log('Testando parser...\n');

    // Teste do parser com alguns exemplos
    const samples = uniqueSemesters.slice(0, 10);
    samples.forEach(row => {
      const parsed = parseSemestre(row.semestre);
      console.log(`"${row.semestre}" → Semestre: ${parsed.semester}, Curso: "${parsed.courseName}"`);
    });
    console.log('');

    // 2. Atualizar avaliações com os dados parseados
    console.log('Atualizando avaliações históricas...');

    // Para cada tipo de avaliação (teste, prova, final)
    const evalTypes = [
      { type: 'teste', name: 'Teste (histórico)' },
      { type: 'prova', name: 'Prova (histórico)' },
      { type: 'final', name: 'Prova Final (histórico)' }
    ];

    let totalUpdated = 0;

    for (const evalType of evalTypes) {
      console.log(`\nProcessando: ${evalType.name}...`);

      // Buscar combinações únicas de (class_id, discipline_id, semestre) do CSV
      const [combinations] = await db.sequelize.query(`
        SELECT DISTINCT
          mscm.class_id,
          mdm.new_discipline_id as discipline_id,
          bn.semestre
        FROM boletim_novo_temp bn
        JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
        JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
        JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
        WHERE mdm.new_discipline_id IS NOT NULL
          AND mscm.class_id IS NOT NULL
          AND mms.student_id IS NOT NULL
      `, { transaction });

      console.log(`  Encontradas ${combinations.length} combinações únicas de turma/disciplina`);

      // Para cada combinação, atualizar a avaliação correspondente
      for (const combo of combinations) {
        const parsed = parseSemestre(combo.semestre);

        // Encontrar a avaliação correspondente
        const evaluation = await db.Evaluation.findOne({
          where: {
            class_id: combo.class_id,
            discipline_id: combo.discipline_id,
            name: evalType.name
          },
          transaction
        });

        if (evaluation) {
          await evaluation.update({
            original_semester: parsed.semester,
            original_course_name: parsed.courseName,
            original_semester_raw: combo.semestre
          }, { transaction });

          totalUpdated++;
        }
      }
    }

    console.log(`\n✅ Total de avaliações atualizadas: ${totalUpdated}`);

    // 3. Validação
    console.log('\nValidando resultados...');

    const [stats] = await db.sequelize.query(`
      SELECT
        COUNT(*) as total_avaliacoes,
        COUNT(original_semester) as com_semestre,
        COUNT(original_course_name) as com_curso,
        COUNT(original_semester_raw) as com_raw
      FROM evaluations
      WHERE name LIKE '%(histórico)%'
    `, { transaction });

    console.log('\nEstatísticas finais:');
    console.table(stats);

    // Mostrar exemplos de semestres mais comuns
    const [topSemesters] = await db.sequelize.query(`
      SELECT
        original_semester as semestre,
        original_course_name as curso,
        COUNT(*) as quantidade
      FROM evaluations
      WHERE name LIKE '%(histórico)%'
        AND original_semester IS NOT NULL
      GROUP BY original_semester, original_course_name
      ORDER BY quantidade DESC
      LIMIT 10
    `, { transaction });

    console.log('\nTop 10 combinações semestre/curso:');
    console.table(topSemesters);

    await transaction.commit();
    console.log('\n✅ Correção concluída com sucesso!');

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro durante a correção:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  fixOriginalSemesterData();
}

module.exports = fixOriginalSemesterData;
