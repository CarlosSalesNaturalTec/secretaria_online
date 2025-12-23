/**
 * Script temporário para analisar quantas matrículas únicas existem
 * na tabela boletim_novo do banco antigo
 */

const fs = require('fs');
const path = require('path');

function extractFieldValue(insertLine, fieldIndex) {
  const match = insertLine.match(/\((.+)\)(?:,|\;)/);
  if (!match) return null;

  const values = match[1];
  const fields = [];
  let currentField = '';
  let inString = false;
  let escapeNext = false;

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

  if (currentField) {
    fields.push(currentField.trim());
  }

  if (fieldIndex >= fields.length) return null;

  let value = fields[fieldIndex];

  if (value.startsWith("'") && value.endsWith("'")) {
    value = value.substring(1, value.length - 1);
  }

  if (value === 'NULL') return null;

  return value;
}

function romanToArabic(roman) {
  const romanNumerals = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
    'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12
  };
  return romanNumerals[roman] || null;
}

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
  const romanAtEnd = semestreString.match(/\s([IVX]+)°?\s*$/i);
  if (romanAtEnd) {
    const roman = romanAtEnd[1].toUpperCase();
    const arabic = romanToArabic(roman);
    if (arabic) {
      return arabic;
    }
  }

  // Formato 5: Cursos sem indicação numérica
  if (semestreString.length > 0) {
    return 1; // Padrão: considerar como 1° semestre
  }

  return null;
}

const sqlFilePath = path.join(__dirname, '../../../database/academico_bo.sql');
const content = fs.readFileSync(sqlFilePath, 'utf8');
const lines = content.split('\n');

const studentSemesters = new Map();
let insideBoletimInserts = false;
let totalLines = 0;
let validLines = 0;

const MATRICULA_INDEX = 1;
const SEMESTRE_INDEX = 9;

console.log('Analisando arquivo...\n');

for (const line of lines) {
  const trimmedLine = line.trim();

  if (trimmedLine.includes("INSERT INTO `boletim_novo`")) {
    insideBoletimInserts = true;
    continue;
  }

  if (insideBoletimInserts && (trimmedLine.startsWith('--') || (trimmedLine.includes('INSERT INTO') && !trimmedLine.includes('INSERT INTO `boletim_novo`')))) {
    insideBoletimInserts = false;
  }

  if (insideBoletimInserts && trimmedLine.startsWith('(')) {
    totalLines++;
    const matriculaStr = extractFieldValue(trimmedLine, MATRICULA_INDEX);
    const semestreStr = extractFieldValue(trimmedLine, SEMESTRE_INDEX);

    if (matriculaStr && semestreStr) {
      const matricula = parseInt(matriculaStr, 10);
      const semestre = extractSemesterNumber(semestreStr);

      if (!isNaN(matricula) && semestre !== null) {
        validLines++;
        if (!studentSemesters.has(matricula)) {
          studentSemesters.set(matricula, []);
        }
        studentSemesters.get(matricula).push(semestre);
      }
    }
  }
}

console.log(`Total de linhas no boletim_novo: ${totalLines}`);
console.log(`Linhas válidas com semestre: ${validLines}`);
console.log(`Matrículas únicas encontradas: ${studentSemesters.size}`);

// Análise de distribuição de semestres
const semestreCount = {};
for (const [matricula, semestres] of studentSemesters.entries()) {
  const maxSemestre = Math.max(...semestres);
  semestreCount[maxSemestre] = (semestreCount[maxSemestre] || 0) + 1;
}

console.log('\nDistribuição de alunos por semestre mais alto:');
for (let i = 1; i <= 12; i++) {
  if (semestreCount[i]) {
    console.log(`  ${i}° semestre: ${semestreCount[i]} alunos`);
  }
}

// Mostrar algumas matrículas de exemplo
console.log('\nAlgumas matrículas encontradas:');
let count = 0;
for (const [matricula, semestres] of studentSemesters.entries()) {
  if (count >= 10) break;
  const maxSemestre = Math.max(...semestres);
  console.log(`  Matrícula ${matricula} -> ${maxSemestre}° semestre`);
  count++;
}

process.exit(0);
