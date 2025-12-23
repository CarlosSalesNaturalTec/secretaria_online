/**
 * Script: import-current-semester.js
 * Descrição: Importa informação de semestre atual do banco antigo (academico_bo.sql)
 *            e popula o campo current_semester na tabela enrollments
 *
 * Como funciona:
 * 1. Lê o arquivo academico_bo.sql
 * 2. Faz parsing dos INSERTs da tabela cliente
 * 3. Extrai matrícula e cliente_semestre de cada aluno
 * 4. Converte cliente_semestre (string como "1", "2", "3") para número inteiro
 * 5. Busca estudante no banco atual pela matrícula
 * 6. Atualiza enrollment ativa do estudante com o semestre
 *
 * Como executar:
 * cd backend
 * node database/scripts/import-current-semester.js
 */

const fs = require('fs');
const path = require('path');
const db = require('../../src/models');

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
 * Converte o valor do campo cliente_semestre para número inteiro
 * Exemplos: "1" -> 1, "2" -> 2, "10" -> 10
 *
 * @param {string} semesterValue - Valor do campo cliente_semestre
 * @returns {number|null} Número do semestre ou null se inválido
 */
function parseSemester(semesterValue) {
  if (!semesterValue || semesterValue === 'NULL' || semesterValue === '') {
    return null;
  }

  // Remove caracteres não numéricos exceto dígitos
  const numericValue = semesterValue.replace(/[^\d]/g, '');

  if (!numericValue) return null;

  const semester = parseInt(numericValue, 10);

  // Validação: semestre deve estar entre 1 e 12
  if (isNaN(semester) || semester < 1 || semester > 12) {
    return null;
  }

  return semester;
}

/**
 * Processa o arquivo academico_bo.sql e extrai dados de matrícula e semestre
 *
 * @param {string} filePath - Caminho para o arquivo academico_bo.sql
 * @returns {Array<{matricula: number, semestre: number}>} Lista de alunos com matrícula e semestre
 */
function parseOldDatabase(filePath) {
  console.log(`[Import] Lendo arquivo ${filePath}...`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const students = [];
  let insideClienteInserts = false;
  let clienteFieldIndexes = null;

  // Identificar índices dos campos na tabela cliente
  // Baseado na estrutura CREATE TABLE `cliente`:
  // 0: cliente_id, 1: cliente_nome, ... 17: cliente_matricula, ... 35: cliente_semestre
  const MATRICULA_INDEX = 17; // cliente_matricula
  const SEMESTRE_INDEX = 35;  // cliente_semestre

  console.log('[Import] Procurando INSERTs da tabela cliente...');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Detectar início dos INSERTs da tabela cliente
    if (trimmedLine.includes("INSERT INTO `cliente`")) {
      insideClienteInserts = true;
      console.log('[Import] Encontrou INSERTs da tabela cliente');
      continue;
    }

    // Detectar fim dos INSERTs (próxima tabela ou comentário)
    if (insideClienteInserts && (trimmedLine.startsWith('--') || trimmedLine.includes('INSERT INTO') && !trimmedLine.includes('INSERT INTO `cliente`'))) {
      insideClienteInserts = false;
    }

    // Processar linha de INSERT
    if (insideClienteInserts && trimmedLine.startsWith('(')) {
      const matricula = extractFieldValue(trimmedLine, MATRICULA_INDEX);
      const semestreRaw = extractFieldValue(trimmedLine, SEMESTRE_INDEX);

      if (matricula && semestreRaw) {
        const semestre = parseSemester(semestreRaw);

        if (semestre !== null) {
          students.push({
            matricula: parseInt(matricula, 10),
            semestre: semestre,
          });
        } else {
          console.log(`[Import] Semestre inválido para matrícula ${matricula}: "${semestreRaw}"`);
        }
      }
    }
  }

  console.log(`[Import] Encontrados ${students.length} alunos com semestre definido`);
  return students;
}

/**
 * Atualiza enrollments no banco atual com os semestres importados
 *
 * @param {Array<{matricula: number, semestre: number}>} studentsData - Dados extraídos do banco antigo
 */
async function updateEnrollments(studentsData) {
  console.log('[Import] Iniciando atualização de enrollments...');

  let updated = 0;
  let notFound = 0;
  let noEnrollment = 0;
  let errors = 0;

  for (const { matricula, semestre } of studentsData) {
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
      console.log(`[Import] ✓ Atualizado: ${student.nome} (matrícula ${matricula}) -> ${semestre}º semestre`);
    } catch (error) {
      errors++;
      console.error(`[Import] ✗ Erro ao processar matrícula ${matricula}:`, error.message);
    }
  }

  console.log('\n[Import] ========== RESUMO DA IMPORTAÇÃO ==========');
  console.log(`[Import] Total de registros processados: ${studentsData.length}`);
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
    console.log('[Import] ===== IMPORTAÇÃO DE SEMESTRES DO BANCO ANTIGO =====\n');

    // Caminho para o arquivo academico_bo.sql
    const sqlFilePath = path.join(__dirname, '../../../database/academico_bo.sql');

    // Verificar se arquivo existe
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`[Import] ✗ Arquivo não encontrado: ${sqlFilePath}`);
      console.error('[Import] Certifique-se de que o arquivo academico_bo.sql está em database/academico_bo.sql');
      process.exit(1);
    }

    // Parse do arquivo SQL
    const studentsData = parseOldDatabase(sqlFilePath);

    if (studentsData.length === 0) {
      console.log('[Import] Nenhum dado para importar. Encerrando.');
      process.exit(0);
    }

    // Confirmar antes de continuar
    console.log(`\n[Import] Pronto para atualizar ${studentsData.length} enrollments.`);
    console.log('[Import] Aguardando 3 segundos antes de iniciar...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Atualizar enrollments
    await updateEnrollments(studentsData);

    console.log('[Import] ===== IMPORTAÇÃO CONCLUÍDA =====\n');
    process.exit(0);
  } catch (error) {
    console.error('[Import] ✗ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar script
main();
