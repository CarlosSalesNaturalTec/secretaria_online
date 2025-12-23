/**
 * Script de teste para validar a extração de semestre com os novos formatos
 */

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

// Casos de teste
const testCases = [
  { input: "I° Semestre Especialização em Docência no Ensino Superior", expected: 1 },
  { input: "II° Semestre Psicologia", expected: 2 },
  { input: "Bacharelado em Psicologia 9°", expected: 9 },
  { input: "Bacharelado em Psicologia 1°", expected: 1 },
  { input: "Licenciatura em Pedagogia 4°", expected: 4 },
  { input: "Superior em Gestão em Agronegócio 01", expected: 1 },
  { input: "8° Psicologia", expected: 8 },
  { input: "1° Psicologia", expected: 1 },
  { input: "4° Psicologia", expected: 4 },
  { input: "Técnico em Enfermagem I", expected: 1 },
  { input: "Técnico em Enfermagem II", expected: 2 },
  { input: "Especialização em Docência no Ensino Superior", expected: 1 },
  { input: "Especialização em Psicopedagogia Institucional e Clinica", expected: 1 },
  { input: "Atendente de Farmácia", expected: 1 },
  { input: "Complementação Pedagógica em Pedagogia I°", expected: 1 },
  { input: "Complementação Pedagógica em Pedagogia II°", expected: 2 },
  { input: "Gestão de Segurança Pública e Privada I", expected: 1 },
];

console.log('========== TESTE DE EXTRAÇÃO DE SEMESTRE ==========\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = extractSemesterNumber(test.input);
  const status = result === test.expected ? '✓' : '✗';

  if (result === test.expected) {
    passed++;
  } else {
    failed++;
    console.log(`${status} Teste ${index + 1}: FALHOU`);
    console.log(`  Input: "${test.input}"`);
    console.log(`  Esperado: ${test.expected}, Obtido: ${result}`);
  }
});

console.log(`\n========== RESULTADO ==========`);
console.log(`✓ Passou: ${passed}/${testCases.length}`);
console.log(`✗ Falhou: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n🎉 Todos os testes passaram!');
} else {
  console.log('\n❌ Alguns testes falharam. Revisar implementação.');
  process.exit(1);
}

process.exit(0);
