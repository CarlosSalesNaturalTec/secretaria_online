/**
 * Script para analisar o conteúdo do campo 'semestre' no boletim_novo
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

const sqlFilePath = path.join(__dirname, '../../../database/academico_bo.sql');
const content = fs.readFileSync(sqlFilePath, 'utf8');
const lines = content.split('\n');

let insideBoletimInserts = false;
const semestreValues = new Map(); // valor -> contagem
const MATRICULA_INDEX = 1;
const SEMESTRE_INDEX = 9;

console.log('Analisando valores do campo semestre...\n');

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
    const semestreStr = extractFieldValue(trimmedLine, SEMESTRE_INDEX);

    if (semestreStr) {
      semestreValues.set(semestreStr, (semestreValues.get(semestreStr) || 0) + 1);
    }
  }
}

// Ordenar por contagem
const sortedValues = Array.from(semestreValues.entries())
  .sort((a, b) => b[1] - a[1]);

console.log(`Total de valores únicos no campo semestre: ${sortedValues.length}\n`);
console.log('Top 30 valores mais comuns:\n');

for (let i = 0; i < Math.min(30, sortedValues.length); i++) {
  const [value, count] = sortedValues[i];
  console.log(`[${count.toString().padStart(4)}x] "${value}"`);
}

// Contar quantos têm número romano
let withRoman = 0;
let withoutRoman = 0;

for (const [value, count] of semestreValues.entries()) {
  if (/[IVX]+°/.test(value)) {
    withRoman += count;
  } else {
    withoutRoman += count;
  }
}

console.log(`\nResumo:`);
console.log(`  Com número romano (I°, II°, etc.): ${withRoman}`);
console.log(`  Sem número romano: ${withoutRoman}`);
console.log(`  Total: ${withRoman + withoutRoman}`);

process.exit(0);
