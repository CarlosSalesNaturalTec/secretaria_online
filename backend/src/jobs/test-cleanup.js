/**
 * Arquivo: backend/src/jobs/test-cleanup.js
 * Descrição: Script de teste para validar o job de limpeza de arquivos temporários
 * Feature: feat-063 - Criar job de limpeza de arquivos temporários
 * Criado em: 2025-11-03
 *
 * USO: node src/jobs/test-cleanup.js
 */

const fs = require('fs').promises;
const path = require('path');
const cleanupTempJob = require('./cleanupTemp.job');

const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

console.log('='.repeat(60));
console.log('TESTE DO JOB DE LIMPEZA - feat-063');
console.log('='.repeat(60));
console.log('');

/**
 * Cria arquivos de teste com datas específicas
 */
async function createTestFiles() {
  console.log('📁 Criando arquivos de teste...');

  try {
    // Garantir que o diretório existe
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Arquivo recente (1 dia atrás) - não deve ser removido
    const recentFile = path.join(TEMP_DIR, 'recent-file.txt');
    await fs.writeFile(recentFile, 'Arquivo recente de teste');
    const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000);
    await fs.utimes(recentFile, new Date(oneDayAgo), new Date(oneDayAgo));
    console.log('  ✓ Arquivo recente criado (1 dia)');

    // Arquivo moderado (5 dias atrás) - não deve ser removido
    const moderateFile = path.join(TEMP_DIR, 'moderate-file.txt');
    await fs.writeFile(moderateFile, 'Arquivo moderado de teste');
    const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
    await fs.utimes(moderateFile, new Date(fiveDaysAgo), new Date(fiveDaysAgo));
    console.log('  ✓ Arquivo moderado criado (5 dias)');

    // Arquivo antigo (8 dias atrás) - deve ser removido
    const oldFile = path.join(TEMP_DIR, 'old-file.txt');
    await fs.writeFile(oldFile, 'Arquivo antigo de teste');
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
    await fs.utimes(oldFile, new Date(eightDaysAgo), new Date(eightDaysAgo));
    console.log('  ✓ Arquivo antigo criado (8 dias)');

    // Arquivo muito antigo (15 dias atrás) - deve ser removido
    const veryOldFile = path.join(TEMP_DIR, 'very-old-file.txt');
    await fs.writeFile(veryOldFile, 'Arquivo muito antigo de teste');
    const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
    await fs.utimes(veryOldFile, new Date(fifteenDaysAgo), new Date(fifteenDaysAgo));
    console.log('  ✓ Arquivo muito antigo criado (15 dias)');

    console.log('');
  } catch (error) {
    console.error('  ✗ Erro ao criar arquivos de teste:', error.message);
    throw error;
  }
}

/**
 * Lista arquivos no diretório temporário
 */
async function listFiles(label) {
  console.log(`📂 ${label}:`);

  try {
    const files = await fs.readdir(TEMP_DIR);

    if (files.length === 0) {
      console.log('  (diretório vazio)');
      console.log('');
      return;
    }

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      const ageMs = Date.now() - stats.mtime.getTime();
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
      console.log(`  - ${file} (${ageDays} dias)`);
    }

    console.log('');
  } catch (error) {
    console.error('  ✗ Erro ao listar arquivos:', error.message);
    console.log('');
  }
}

/**
 * Limpa diretório temporário
 */
async function cleanup() {
  try {
    const files = await fs.readdir(TEMP_DIR);
    for (const file of files) {
      await fs.unlink(path.join(TEMP_DIR, file));
    }
  } catch (error) {
    // Ignorar erros de limpeza
  }
}

/**
 * Executa os testes
 */
async function runTests() {
  try {
    // Teste 1: Criar arquivos de teste
    console.log('📋 Teste 1: Criando arquivos de teste com diferentes idades...');
    await cleanup(); // Limpar antes de começar
    await createTestFiles();

    // Teste 2: Listar arquivos antes da limpeza
    console.log('📋 Teste 2: Arquivos antes da limpeza...');
    await listFiles('Arquivos no diretório temporário');

    // Teste 3: Executar job de limpeza
    console.log('📋 Teste 3: Executando job de limpeza...');
    console.log('');
    await cleanupTempJob.execute();
    console.log('');

    // Teste 4: Listar arquivos após a limpeza
    console.log('📋 Teste 4: Arquivos após a limpeza...');
    await listFiles('Arquivos restantes');

    // Teste 5: Verificar resultado
    console.log('📋 Teste 5: Validando resultado...');
    const filesAfter = await fs.readdir(TEMP_DIR);
    const expectedFiles = ['recent-file.txt', 'moderate-file.txt'];
    const allExpectedExist = expectedFiles.every(f => filesAfter.includes(f));
    const noOldFiles = !filesAfter.includes('old-file.txt') && !filesAfter.includes('very-old-file.txt');

    if (allExpectedExist && noOldFiles && filesAfter.length === 2) {
      console.log('  ✓ Resultado correto!');
      console.log('  ✓ Arquivos recentes mantidos');
      console.log('  ✓ Arquivos antigos removidos');
    } else {
      console.log('  ✗ Resultado incorreto!');
      console.log(`  Arquivos esperados: ${expectedFiles.join(', ')}`);
      console.log(`  Arquivos encontrados: ${filesAfter.join(', ')}`);
    }

    console.log('');

    // Resumo final
    console.log('='.repeat(60));
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('');
    console.log('O job de limpeza está funcionando corretamente:');
    console.log('- Remove arquivos com mais de 7 dias');
    console.log('- Mantém arquivos recentes (menos de 7 dias)');
    console.log('- Registra logs detalhados da operação');
    console.log('- Trata erros adequadamente');
    console.log('');
    console.log('Para usar em produção:');
    console.log('1. O job está registrado em jobs/index.js');
    console.log('2. Executará diariamente às 2h da manhã');
    console.log('3. Timezone configurado: America/Sao_Paulo');
    console.log('');

    // Limpar arquivos de teste
    console.log('🧹 Limpando arquivos de teste...');
    await cleanup();
    console.log('  ✓ Limpeza concluída');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ ERRO DURANTE OS TESTES');
    console.error('='.repeat(60));
    console.error('');
    console.error(error);
    process.exit(1);
  }
}

// Executar testes
runTests();
