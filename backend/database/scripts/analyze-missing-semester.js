/**
 * Script para analisar registros sem indicação de semestre no boletim_novo
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

function hasSemesterNumber(semestreString) {
  if (!semestreString) return false;

  // Formato 1: Número romano no início "I° Semestre..."
  const romanMatch = semestreString.match(/^([IVX]+)°/i);
  if (romanMatch) return true;

  // Formato 2: Número arábico no final "... 9°", "... 01", "... 1°"
  const arabicMatch = semestreString.match(/(\d+)°?\s*$/);
  if (arabicMatch) {
    const number = parseInt(arabicMatch[1], 10);
    if (number >= 1 && number <= 12) return true;
  }

  return false;
}

const sqlFilePath = path.join(__dirname, '../../../database/academico_bo.sql');
const content = fs.readFileSync(sqlFilePath, 'utf8');
const lines = content.split('\n');

let insideBoletimInserts = false;
const withSemester = new Map(); // valor -> [matrículas]
const withoutSemester = new Map(); // valor -> [matrículas]

const MATRICULA_INDEX = 1;
const SEMESTRE_INDEX = 9;

console.log('Analisando registros com e sem semestre...\n');

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
    const matriculaStr = extractFieldValue(trimmedLine, MATRICULA_INDEX);
    const semestreStr = extractFieldValue(trimmedLine, SEMESTRE_INDEX);

    if (semestreStr && matriculaStr) {
      const matricula = parseInt(matriculaStr, 10);

      if (hasSemesterNumber(semestreStr)) {
        if (!withSemester.has(semestreStr)) {
          withSemester.set(semestreStr, []);
        }
        withSemester.get(semestreStr).push(matricula);
      } else {
        if (!withoutSemester.has(semestreStr)) {
          withoutSemester.set(semestreStr, []);
        }
        withoutSemester.get(semestreStr).push(matricula);
      }
    }
  }
}

// Calcular totais
let totalWithSemester = 0;
for (const matriculas of withSemester.values()) {
  totalWithSemester += matriculas.length;
}

let totalWithoutSemester = 0;
for (const matriculas of withoutSemester.values()) {
  totalWithoutSemester += matriculas.length;
}

console.log('========== RESUMO ==========');
console.log(`Registros COM número de semestre: ${totalWithSemester}`);
console.log(`Registros SEM número de semestre: ${totalWithoutSemester}`);
console.log(`Total: ${totalWithSemester + totalWithoutSemester}`);

// Contar matrículas únicas em cada categoria
const uniqueWithSemester = new Set();
for (const matriculas of withSemester.values()) {
  matriculas.forEach(m => uniqueWithSemester.add(m));
}

const uniqueWithoutSemester = new Set();
for (const matriculas of withoutSemester.values()) {
  matriculas.forEach(m => uniqueWithoutSemester.add(m));
}

console.log(`\nMatrículas únicas COM semestre: ${uniqueWithSemester.size}`);
console.log(`Matrículas únicas SEM semestre: ${uniqueWithoutSemester.size}`);

// Verificar se há matrículas que aparecem em ambas categorias
const inBoth = new Set();
for (const m of uniqueWithSemester) {
  if (uniqueWithoutSemester.has(m)) {
    inBoth.add(m);
  }
}

console.log(`Matrículas que aparecem em AMBAS categorias: ${inBoth.size}`);

// Mostrar valores mais comuns SEM semestre
const sortedWithout = Array.from(withoutSemester.entries())
  .sort((a, b) => b[1].length - a[1].length);

console.log('\n========== VALORES SEM NÚMERO DE SEMESTRE (Top 20) ==========');
for (let i = 0; i < Math.min(20, sortedWithout.length); i++) {
  const [value, matriculas] = sortedWithout[i];
  const uniqueMatriculas = new Set(matriculas);
  console.log(`[${matriculas.length.toString().padStart(4)}x registros, ${uniqueMatriculas.size} alunos] "${value}"`);
}

// Mostrar algumas matrículas que SÓ aparecem sem semestre
const onlyWithout = new Set();
for (const m of uniqueWithoutSemester) {
  if (!uniqueWithSemester.has(m)) {
    onlyWithout.add(m);
  }
}

console.log(`\n========== ALUNOS QUE SÓ TÊM REGISTROS SEM SEMESTRE ==========`);
console.log(`Total de matrículas: ${onlyWithout.size}`);

if (onlyWithout.size > 0) {
  console.log('\nPrimeiros 10 exemplos:');
  let count = 0;
  for (const matricula of onlyWithout) {
    if (count >= 10) break;

    // Buscar quais valores de semestre essa matrícula tem
    const valores = [];
    for (const [value, matriculas] of withoutSemester.entries()) {
      if (matriculas.includes(matricula)) {
        valores.push(value);
      }
    }

    console.log(`  Matrícula ${matricula}:`);
    valores.forEach(v => console.log(`    - "${v}"`));
    count++;
  }
}

console.log('\n========== RECOMENDAÇÃO ==========');
if (onlyWithout.size > 0) {
  console.log('✓ Existem alunos que SÓ possuem registros sem indicação de semestre.');
  console.log('✓ Recomenda-se considerar esses registros como 1° semestre para não perder dados.');
  console.log(`✓ Isso afetaria ${onlyWithout.size} alunos adicionais.`);
} else {
  console.log('✓ Todos os alunos sem semestre TAMBÉM têm registros com semestre.');
  console.log('✓ O script atual já captura o semestre desses alunos corretamente.');
}

process.exit(0);
