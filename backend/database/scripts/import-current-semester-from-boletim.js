/**
 * Script: import-current-semester-from-boletim.js
 * Descrição: Importa informação de semestre acadêmico da tabela boletim_novo
 *            e popula o campo current_semester na tabela enrollments
 *
 * Como funciona:
 * 1. Lê o arquivo academico_bo.sql
 * 2. Faz parsing dos INSERTs da tabela boletim_novo
 * 3. Extrai matrícula e semestre (campo com "I° Semestre", "II° Semestre", etc.)
 * 4. Converte número romano para inteiro (I -> 1, II -> 2, etc.)
 * 5. Agrupa por matrícula e pega o semestre mais alto (último semestre cursado)
 * 6. Atualiza enrollment ativa do estudante com o semestre
 *
 * Como executar:
 * cd backend
 * node database/scripts/import-current-semester-from-boletim.js
 */

const fs = require('fs');
const path = require('path');
const db = require('../../src/models');

/**
 * Converte número romano para arábico
 *
 * @param {string} roman - Número romano (I, II, III, IV, etc.)
 * @returns {number|null} Número arábico ou null se inválido
 */
function romanToArabic(roman) {
  const romanNumerals = {
    'I': 1,
    'II': 2,
    'III': 3,
    'IV': 4,
    'V': 5,
    'VI': 6,
    'VII': 7,
    'VIII': 8,
    'IX': 9,
    'X': 10,
    'XI': 11,
    'XII': 12
  };

  return romanNumerals[roman] || null;
}

/**
 * Extrai o número do semestre de uma string
 *
 * Suporta múltiplos formatos:
 * 1. "I° Semestre Psicologia" -> 1
 * 2. "Bacharelado em Psicologia 9°" -> 9
 * 3. "8° Psicologia" -> 8
 * 4. "Técnico em Enfermagem I" -> 1
 * 5. "Especialização em Docência" -> 1 (padrão para cursos sem número)
 *
 * @param {string} semestreString - String do campo semestre
 * @returns {number|null} Número do semestre ou null
 */
function extractSemesterNumber(semestreString) {
  if (!semestreString) return null;

  // Formato 1: Número romano no início com ° "I° Semestre..."
  const romanWithDegree = semestreString.match(/^([IVX]+)°/i);
  if (romanWithDegree) {
    const roman = romanWithDegree[1].toUpperCase();
    return romanToArabic(roman);
  }

  // Formato 2: Número arábico no início "8° Psicologia"
  const arabicAtStart = semestreString.match(/^(\d+)°/);
  if (arabicAtStart) {
    const number = parseInt(arabicAtStart[1], 10);
    if (number >= 1 && number <= 12) {
      return number;
    }
  }

  // Formato 3: Número arábico no final "... 9°", "... 01"
  const arabicAtEnd = semestreString.match(/(\d+)°?\s*$/);
  if (arabicAtEnd) {
    const number = parseInt(arabicAtEnd[1], 10);
    if (number >= 1 && number <= 12) {
      return number;
    }
  }

  // Formato 4: Número romano no final com ou sem °
  // "Técnico em Enfermagem I" ou "Complementação Pedagógica II°"
  const romanAtEnd = semestreString.match(/\s([IVX]+)°?\s*$/i);
  if (romanAtEnd) {
    const roman = romanAtEnd[1].toUpperCase();
    const arabic = romanToArabic(roman);
    if (arabic) {
      return arabic;
    }
  }

  // Formato 5: Cursos sem indicação numérica (Especializações, cursos técnicos)
  // Considerar como 1° semestre por padrão
  // Exemplos: "Especialização em Docência no Ensino Superior", "Atendente de Farmácia"
  if (semestreString.length > 0) {
    return 1; // Padrão: considerar como 1° semestre
  }

  return null;
}

/**
 * Extrai valor de um campo específico de uma linha INSERT
 *
 * @param {string} insertLine - Linha de INSERT do SQL
 * @param {number} fieldIndex - Índice do campo (0-based)
 * @returns {string|null} Valor do campo ou null
 */
function extractFieldValue(insertLine, fieldIndex) {
  // Remove o prefixo INSERT e os parênteses
  const match = insertLine.match(/\((.+)\)(?:,|\;)/);
  if (!match) return null;

  const values = match[1];
  const fields = [];
  let currentField = '';
  let inString = false;
  let escapeNext = false;

  // Parse manual para lidar com vírgulas dentro de strings
  for (let i = 0; i < values.length; i++) {
    const char = values[i];

    if (escapeNext) {
      currentField += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      currentField += char;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      currentField += char;
      continue;
    }

    if (char === ',' && !inString) {
      fields.push(currentField.trim());
      currentField = '';
      continue;
    }

    currentField += char;
  }

  // Adiciona último campo
  if (currentField) {
    fields.push(currentField.trim());
  }

  if (fieldIndex >= fields.length) return null;

  let value = fields[fieldIndex];

  // Remove aspas
  if (value.startsWith("'") && value.endsWith("'")) {
    value = value.substring(1, value.length - 1);
  }

  // NULL value
  if (value === 'NULL') return null;

  return value;
}

/**
 * Processa o arquivo academico_bo.sql e extrai dados de matrícula e semestre
 *
 * @param {string} filePath - Caminho para o arquivo academico_bo.sql
 * @returns {Map<number, number>} Mapa de matrícula -> semestre mais alto
 */
function parseBoletimNovo(filePath) {
  console.log(`[Import] Lendo arquivo ${filePath}...`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Map para armazenar matrícula -> array de semestres
  const studentSemesters = new Map();

  let insideBoletimInserts = false;

  // Índices dos campos na tabela boletim_novo:
  // 0: id, 1: matricula, 2: disciplina, 3: periodo, 4: teste, 5: prova,
  // 6: final, 7: resultado, 8: status, 9: semestre, 10: dia_hora
  const MATRICULA_INDEX = 1;
  const SEMESTRE_INDEX = 9;

  console.log('[Import] Procurando INSERTs da tabela boletim_novo...');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Detectar início dos INSERTs da tabela boletim_novo
    if (trimmedLine.includes("INSERT INTO `boletim_novo`")) {
      insideBoletimInserts = true;
      console.log('[Import] Encontrou INSERTs da tabela boletim_novo');
      continue;
    }

    // Detectar fim dos INSERTs
    if (insideBoletimInserts && (trimmedLine.startsWith('--') || (trimmedLine.includes('INSERT INTO') && !trimmedLine.includes('INSERT INTO `boletim_novo`')))) {
      insideBoletimInserts = false;
    }

    // Processar linha de INSERT
    if (insideBoletimInserts && trimmedLine.startsWith('(')) {
      const matriculaStr = extractFieldValue(trimmedLine, MATRICULA_INDEX);
      const semestreStr = extractFieldValue(trimmedLine, SEMESTRE_INDEX);

      if (matriculaStr && semestreStr) {
        const matricula = parseInt(matriculaStr, 10);
        const semestre = extractSemesterNumber(semestreStr);

        if (!isNaN(matricula) && semestre !== null) {
          if (!studentSemesters.has(matricula)) {
            studentSemesters.set(matricula, []);
          }
          studentSemesters.get(matricula).push(semestre);
        }
      }
    }
  }

  console.log(`[Import] Encontradas ${studentSemesters.size} matrículas com semestres`);

  // Para cada matrícula, pegar o semestre mais alto (último semestre cursado)
  const result = new Map();
  for (const [matricula, semestres] of studentSemesters.entries()) {
    const maxSemestre = Math.max(...semestres);
    result.set(matricula, maxSemestre);
  }

  console.log(`[Import] Processadas ${result.size} matrículas únicas`);
  return result;
}

/**
 * Atualiza enrollments no banco atual com os semestres importados
 *
 * @param {Map<number, number>} studentSemestersMap - Mapa matrícula -> semestre
 */
async function updateEnrollments(studentSemestersMap) {
  console.log('[Import] Iniciando atualização de enrollments...');

  let updated = 0;
  let notFound = 0;
  let noEnrollment = 0;
  let errors = 0;

  for (const [matricula, semestre] of studentSemestersMap.entries()) {
    try {
      // Buscar estudante pela matrícula
      const student = await db.Student.findOne({
        where: { matricula: matricula },
      });

      if (!student) {
        notFound++;
        console.log(`[Import] Estudante com matrícula ${matricula} não encontrado no banco atual`);
        continue;
      }

      // Buscar enrollment ativa do estudante
      const enrollment = await db.Enrollment.findOne({
        where: {
          student_id: student.id,
          status: ['active', 'pending'],
          deleted_at: null,
        },
      });

      if (!enrollment) {
        noEnrollment++;
        console.log(`[Import] Estudante ${student.nome} (matrícula ${matricula}) não possui enrollment ativa`);
        continue;
      }

      // Atualizar current_semester
      await enrollment.update({ current_semester: semestre });
      updated++;
      console.log(`[Import] ✓ Atualizado: ${student.nome} (matrícula ${matricula}) -> ${semestre}° semestre`);
    } catch (error) {
      errors++;
      console.error(`[Import] ✗ Erro ao processar matrícula ${matricula}:`, error.message);
    }
  }

  console.log('\n[Import] ========== RESUMO DA IMPORTAÇÃO ==========');
  console.log(`[Import] Total de matrículas processadas: ${studentSemestersMap.size}`);
  console.log(`[Import] Enrollments atualizados: ${updated}`);
  console.log(`[Import] Estudantes não encontrados: ${notFound}`);
  console.log(`[Import] Estudantes sem enrollment ativa: ${noEnrollment}`);
  console.log(`[Import] Erros: ${errors}`);
  console.log('[Import] =============================================\n');
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('[Import] ===== IMPORTAÇÃO DE SEMESTRES DA TABELA BOLETIM_NOVO =====\n');

    // Caminho para o arquivo academico_bo.sql
    const sqlFilePath = path.join(__dirname, '../../../database/academico_bo.sql');

    // Verificar se arquivo existe
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`[Import] ✗ Arquivo não encontrado: ${sqlFilePath}`);
      console.error('[Import] Certifique-se de que o arquivo academico_bo.sql está em database/academico_bo.sql');
      process.exit(1);
    }

    // Parse do arquivo SQL
    const studentSemestersMap = parseBoletimNovo(sqlFilePath);

    if (studentSemestersMap.size === 0) {
      console.log('[Import] Nenhum dado para importar. Encerrando.');
      process.exit(0);
    }

    // Confirmar antes de continuar
    console.log(`\n[Import] Pronto para atualizar ${studentSemestersMap.size} enrollments.`);
    console.log('[Import] Aguardando 3 segundos antes de iniciar...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Atualizar enrollments
    await updateEnrollments(studentSemestersMap);

    console.log('[Import] ===== IMPORTAÇÃO CONCLUÍDA =====\n');
    process.exit(0);
  } catch (error) {
    console.error('[Import] ✗ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar script
main();
