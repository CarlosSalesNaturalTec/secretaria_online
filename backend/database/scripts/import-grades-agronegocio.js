/**
 * Script: import-grades-agronegocio.js
 * Descrição: Importa notas de avaliações do curso Gestão em Agronegócio
 *            da tabela boletim_novo do banco legado
 *
 * Origem: database/academico_bo.sql
 * Tabela: boletim_novo
 * Filtro: semestre IN ('Superior em Gestão em Agronegócio 01',
 *                      'Superior em Gestão em Agronegócio 02',
 *                      'Superior em Gestão em Agronegócio 03')
 *
 * Mapeamento:
 * - boletim_novo.matricula -> students.registration_number
 * - boletim_novo.disciplina -> disciplines.name
 * - boletim_novo.teste -> grade (teste)
 * - boletim_novo.prova -> grade (prova)
 * - boletim_novo.resultado -> grade final
 * - boletim_novo.periodo -> evaluation.date (período acadêmico)
 * - boletim_novo.semestre -> extraction semester (01, 02, 03)
 *
 * Como executar:
 * cd backend
 * node database/scripts/import-grades-agronegocio.js
 */

const fs = require('fs');
const path = require('path');
const db = require('../../src/models');

// ID do curso Gestão em Agronegócio
const COURSE_ID = 19;
const COURSE_NAME = 'Gestão em Agronegócio';

/**
 * Extrai o número do semestre do campo "semestre" do banco legado
 * Exemplo: "Superior em Gestão em Agronegócio 01" -> 1
 *          "Superior em Gestão em Agronegócio 02" -> 2
 *          "Superior em Gestão em Agronegócio 03" -> 3
 *
 * @param {string} semestre - Campo semestre do banco legado
 * @returns {number|null} Número do semestre (1-3) ou null
 */
function extractSemester(semestre) {
  if (!semestre) return null;

  const match = semestre.match(/Superior em Gestão em Agronegócio 0?(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

/**
 * Faz parsing dos INSERTs da tabela boletim_novo
 *
 * @param {string} sqlContent - Conteúdo do arquivo SQL
 * @returns {Array} Array de objetos com os dados parseados
 */
function parseBoletimNovoInserts(sqlContent) {
  const records = [];

  // Regex para encontrar INSERT INTO `boletim_novo`
  const insertPattern = /INSERT INTO `boletim_novo`[^(]*\(([^)]+)\) VALUES\s*([\s\S]*?);/gi;

  let match;
  while ((match = insertPattern.exec(sqlContent)) !== null) {
    const columns = match[1].split(',').map(col => col.trim().replace(/`/g, ''));
    const valuesBlock = match[2];

    // Extrai cada linha de valores
    const valuePattern = /\(([^)]+)\)/g;
    let valueMatch;

    while ((valueMatch = valuePattern.exec(valuesBlock)) !== null) {
      const values = [];
      const valueString = valueMatch[1];

      // Parse manual considerando strings com vírgulas
      let currentValue = '';
      let insideQuote = false;
      let quoteChar = null;

      for (let i = 0; i < valueString.length; i++) {
        const char = valueString[i];

        if ((char === "'" || char === '"') && (i === 0 || valueString[i - 1] !== '\\')) {
          if (!insideQuote) {
            insideQuote = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            insideQuote = false;
            quoteChar = null;
          } else {
            currentValue += char;
          }
        } else if (char === ',' && !insideQuote) {
          values.push(currentValue.trim());
          currentValue = '';
        } else if (char !== quoteChar || insideQuote) {
          currentValue += char;
        }
      }

      // Adiciona o último valor
      if (currentValue) {
        values.push(currentValue.trim());
      }

      // Cria objeto com campos mapeados
      const record = {};
      columns.forEach((col, index) => {
        let value = values[index];

        // Remove aspas e trata valores especiais
        if (value === 'NULL' || value === '') {
          value = null;
        } else if (value && (value.startsWith("'") || value.startsWith('"'))) {
          value = value.slice(1, -1);
        }

        record[col] = value;
      });

      // Filtra apenas registros do curso Gestão em Agronegócio
      if (record.semestre && record.semestre.includes('Superior em Gestão em Agronegócio')) {
        records.push(record);
      }
    }
  }

  return records;
}

/**
 * Converte período acadêmico (2024.1, 2024.2) em data aproximada
 *
 * @param {string} periodo - Período (ex: "2024.1", "2024.2")
 * @returns {string|null} Data no formato YYYY-MM-DD ou null
 */
function periodToDate(periodo) {
  if (!periodo) return null;

  const match = periodo.match(/(\d{4})\.(\d+)/);
  if (!match) return null;

  const year = match[1];
  const semester = parseInt(match[2], 10);

  // Semestre 1 -> Junho, Semestre 2 -> Dezembro
  const month = semester === 1 ? '06' : '12';

  return `${year}-${month}-15`;
}

/**
 * Normaliza nome de disciplina para facilitar matching
 *
 * @param {string} name - Nome da disciplina
 * @returns {string} Nome normalizado
 */
function normalizeDisciplineName(name) {
  if (!name) return '';

  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' '); // Normaliza espaços
}

/**
 * Busca disciplina pelo nome (matching fuzzy)
 *
 * @param {string} disciplineName - Nome da disciplina do sistema legado
 * @param {Array} disciplines - Array de disciplinas do banco novo
 * @returns {Object|null} Disciplina encontrada ou null
 */
function findDisciplineByName(disciplineName, disciplines) {
  const normalized = normalizeDisciplineName(disciplineName);

  // Busca exata
  let found = disciplines.find(d =>
    normalizeDisciplineName(d.name) === normalized
  );

  if (found) return found;

  // Busca parcial (disciplina do legado contém no novo)
  found = disciplines.find(d =>
    normalized.includes(normalizeDisciplineName(d.name))
  );

  if (found) return found;

  // Busca inversa (disciplina do novo contém no legado)
  found = disciplines.find(d =>
    normalizeDisciplineName(d.name).includes(normalized)
  );

  return found || null;
}

/**
 * Cria nova disciplina e a associa ao curso
 *
 * @param {string} disciplineName - Nome da disciplina
 * @param {number} courseId - ID do curso
 * @returns {Promise<Object>} Disciplina criada
 */
async function createDiscipline(disciplineName, courseId) {
  // Gera código da disciplina (primeiras letras + timestamp)
  const code = disciplineName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 6) + Date.now().toString().slice(-4);

  // Cria disciplina
  const discipline = await db.Discipline.create({
    name: disciplineName.trim(),
    code: code,
    description: `Disciplina importada do sistema legado - ${COURSE_NAME}`,
    workload: 60 // Carga horária padrão
  });

  // Associa disciplina ao curso
  await db.sequelize.query(
    `INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
     VALUES (?, ?, 1, NOW(), NOW())`,
    {
      replacements: [courseId, discipline.id],
      type: db.sequelize.QueryTypes.INSERT
    }
  );

  console.log(`   ✓ Disciplina criada: ${discipline.name} (ID: ${discipline.id}, Código: ${code})`);

  return discipline;
}

/**
 * Cria ou busca turma default para o curso
 *
 * @param {number} semester - Semestre (1, 2, 3)
 * @returns {Promise<Object>} Turma criada ou encontrada
 */
async function getOrCreateDefaultClass(semester) {
  const currentYear = new Date().getFullYear();

  // Busca turma existente
  let classRecord = await db.Class.findOne({
    where: {
      course_id: COURSE_ID,
      semester: semester,
      year: currentYear
    }
  });

  if (classRecord) {
    return classRecord;
  }

  // Cria nova turma
  classRecord = await db.Class.create({
    course_id: COURSE_ID,
    semester: semester,
    year: currentYear,
    start_date: `${currentYear}-01-01`,
    end_date: `${currentYear}-12-31`,
    status: 'active'
  });

  console.log(`  ✓ Turma criada: ${COURSE_NAME} - ${semester}° semestre - ${currentYear}`);

  return classRecord;
}

/**
 * Cria ou busca professor default para importação
 *
 * @returns {Promise<Object>} Professor
 */
async function getOrCreateDefaultTeacher() {
  // Busca primeiro professor do sistema (sem filtro de status)
  let teacher = await db.Teacher.findOne({
    order: [['id', 'ASC']]
  });

  if (!teacher) {
    throw new Error('Nenhum professor encontrado no sistema. Crie ao menos um professor antes de importar.');
  }

  return teacher;
}

/**
 * Cria avaliação para uma disciplina
 *
 * @param {Object} params - Parâmetros
 * @returns {Promise<Object>} Avaliação criada
 */
async function createEvaluation({ classId, teacherId, disciplineId, name, date, semester, courseName }) {
  const evaluation = await db.Evaluation.create({
    class_id: classId,
    teacher_id: teacherId,
    discipline_id: disciplineId,
    name: `${name} (histórico)`,
    date: date || new Date().toISOString().split('T')[0],
    type: 'grade',
    original_semester: semester,
    original_course_name: courseName,
    original_semester_raw: `Superior em Gestão em Agronegócio 0${semester}`
  });

  return evaluation;
}

/**
 * Processa e importa as notas
 */
async function importGrades() {
  console.log('\n========================================');
  console.log('IMPORTAÇÃO DE NOTAS - GESTÃO EM AGRONEGÓCIO');
  console.log('========================================\n');

  try {
    // 1. Lê arquivo SQL
    const sqlPath = path.join(__dirname, '../../../database/academico_bo.sql');

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo não encontrado: ${sqlPath}`);
    }

    console.log('1. Lendo arquivo academico_bo.sql...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    console.log('   ✓ Arquivo lido com sucesso\n');

    // 2. Parse dos dados
    console.log('2. Fazendo parse da tabela boletim_novo...');
    const records = parseBoletimNovoInserts(sqlContent);
    console.log(`   ✓ ${records.length} registros encontrados\n`);

    if (records.length === 0) {
      console.log('⚠ Nenhum registro encontrado para importar.');
      return;
    }

    // 3. Busca disciplinas do curso
    console.log('3. Buscando disciplinas do curso...');
    const courseDisciplines = await db.sequelize.query(
      `SELECT d.id, d.name, d.code
       FROM disciplines d
       INNER JOIN course_disciplines cd ON d.id = cd.discipline_id
       WHERE cd.course_id = :courseId
       ORDER BY d.name`,
      {
        replacements: { courseId: COURSE_ID },
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    console.log(`   ✓ ${courseDisciplines.length} disciplinas encontradas\n`);

    if (courseDisciplines.length === 0) {
      throw new Error('Nenhuma disciplina encontrada para o curso Gestão em Agronegócio (id: 19).');
    }

    // 4. Busca professor default
    console.log('4. Buscando professor para importação...');
    const defaultTeacher = await getOrCreateDefaultTeacher();
    console.log(`   ✓ Professor: ${defaultTeacher.name} (ID: ${defaultTeacher.id})\n`);

    // 5. Agrupa registros por semestre, disciplina e período
    console.log('5. Agrupando registros...');
    const grouped = {};

    records.forEach(record => {
      const semester = extractSemester(record.semestre);
      const disciplineName = record.disciplina;
      const periodo = record.periodo || '2024.1';

      if (!semester || !disciplineName) return;

      const key = `${semester}-${disciplineName}-${periodo}`;

      if (!grouped[key]) {
        grouped[key] = {
          semester,
          disciplineName,
          periodo,
          students: []
        };
      }

      grouped[key].students.push(record);
    });

    console.log(`   ✓ ${Object.keys(grouped).length} grupos (semestre + disciplina + período)\n`);

    // 6. Processa cada grupo
    console.log('6. Importando notas...\n');

    let stats = {
      evaluationsCreated: 0,
      gradesCreated: 0,
      studentsNotFound: 0,
      disciplinesNotFound: 0,
      disciplinesCreated: 0,
      errors: 0
    };

    for (const [key, group] of Object.entries(grouped)) {
      console.log(`\n   Processando: ${group.disciplineName} - ${group.semester}° sem - ${group.periodo}`);

      // Busca disciplina
      let discipline = findDisciplineByName(group.disciplineName, courseDisciplines);

      if (!discipline) {
        console.log(`   ⚠ Disciplina não encontrada: ${group.disciplineName}`);
        console.log(`   → Criando disciplina...`);

        try {
          discipline = await createDiscipline(group.disciplineName, COURSE_ID);

          // Adiciona a nova disciplina ao array para futuras buscas
          courseDisciplines.push({
            id: discipline.id,
            name: discipline.name,
            code: discipline.code
          });

          stats.disciplinesCreated++;
        } catch (error) {
          console.log(`   ✗ Erro ao criar disciplina: ${error.message}`);
          stats.disciplinesNotFound++;
          stats.errors++;
          continue;
        }
      } else {
        console.log(`   ✓ Disciplina encontrada: ${discipline.name} (ID: ${discipline.id})`);
      }

      // Cria ou busca turma
      const classRecord = await getOrCreateDefaultClass(group.semester);

      // Cria avaliações (Teste, Prova, Final)
      const evalDate = periodToDate(group.periodo);

      const evaluations = {
        teste: await createEvaluation({
          classId: classRecord.id,
          teacherId: defaultTeacher.id,
          disciplineId: discipline.id,
          name: 'Teste',
          date: evalDate,
          semester: group.semester,
          courseName: COURSE_NAME
        }),
        prova: await createEvaluation({
          classId: classRecord.id,
          teacherId: defaultTeacher.id,
          disciplineId: discipline.id,
          name: 'Prova',
          date: evalDate,
          semester: group.semester,
          courseName: COURSE_NAME
        }),
        resultado: await createEvaluation({
          classId: classRecord.id,
          teacherId: defaultTeacher.id,
          disciplineId: discipline.id,
          name: 'Resultado Final',
          date: evalDate,
          semester: group.semester,
          courseName: COURSE_NAME
        })
      };

      stats.evaluationsCreated += 3;
      console.log(`   ✓ 3 avaliações criadas (Teste, Prova, Resultado Final)`);

      // Processa notas dos alunos
      for (const studentRecord of group.students) {
        try {
          // Busca aluno por matrícula (campo 'matricula' na tabela students)
          const student = await db.Student.findOne({
            where: {
              matricula: parseInt(studentRecord.matricula, 10)
            }
          });

          if (!student) {
            console.log(`   ⚠ Aluno não encontrado: matrícula ${studentRecord.matricula}`);
            stats.studentsNotFound++;
            continue;
          }

          // Cria notas (incluindo notas zeradas - alunos que faltaram ou tiraram zero)
          const gradesToCreate = [];

          // Teste: importa se tiver valor numérico (incluindo 0)
          if (studentRecord.teste !== null && studentRecord.teste !== undefined && studentRecord.teste !== '') {
            const testeValue = parseFloat(studentRecord.teste);
            if (!isNaN(testeValue)) {
              gradesToCreate.push({
                evaluation_id: evaluations.teste.id,
                student_id: student.id,
                grade: testeValue,
                concept: null
              });
            }
          }

          // Prova: importa se tiver valor numérico (incluindo 0)
          if (studentRecord.prova !== null && studentRecord.prova !== undefined && studentRecord.prova !== '') {
            const provaValue = parseFloat(studentRecord.prova);
            if (!isNaN(provaValue)) {
              gradesToCreate.push({
                evaluation_id: evaluations.prova.id,
                student_id: student.id,
                grade: provaValue,
                concept: null
              });
            }
          }

          // Resultado: importa se tiver valor numérico (incluindo 0)
          if (studentRecord.resultado !== null && studentRecord.resultado !== undefined && studentRecord.resultado !== '') {
            const resultadoValue = parseFloat(studentRecord.resultado);
            if (!isNaN(resultadoValue)) {
              gradesToCreate.push({
                evaluation_id: evaluations.resultado.id,
                student_id: student.id,
                grade: resultadoValue,
                concept: null
              });
            }
          }

          // Insere notas
          if (gradesToCreate.length > 0) {
            await db.Grade.bulkCreate(gradesToCreate);
            stats.gradesCreated += gradesToCreate.length;
          }

        } catch (error) {
          console.log(`   ✗ Erro ao processar aluno ${studentRecord.matricula}: ${error.message}`);
          stats.errors++;
        }
      }

      console.log(`   ✓ Grupo processado: ${group.students.length} alunos`);
    }

    // 7. Resumo
    console.log('\n========================================');
    console.log('RESUMO DA IMPORTAÇÃO');
    console.log('========================================');
    console.log(`✓ Disciplinas criadas: ${stats.disciplinesCreated}`);
    console.log(`✓ Avaliações criadas: ${stats.evaluationsCreated}`);
    console.log(`✓ Notas importadas: ${stats.gradesCreated}`);
    console.log(`⚠ Alunos não encontrados: ${stats.studentsNotFound}`);
    console.log(`⚠ Disciplinas não encontradas (erros): ${stats.disciplinesNotFound}`);
    console.log(`✗ Erros: ${stats.errors}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ Erro fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

// Executa importação
importGrades();
