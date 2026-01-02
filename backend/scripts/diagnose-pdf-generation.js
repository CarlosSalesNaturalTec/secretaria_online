/**
 * Script: diagnose-pdf-generation.js
 * Descrição: Diagnostica o processo de geração de PDFs de contratos
 * Uso: node scripts/diagnose-pdf-generation.js
 */

const path = require('path');
const fs = require('fs');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

log('\n=== Diagnóstico de Geração de PDFs ===\n', 'blue');

// 1. Verificar variáveis de ambiente
log('1. VARIÁVEIS DE AMBIENTE', 'magenta');
log(`   NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`, 'blue');
log(`   PORT: ${process.env.PORT || 'não definido'}`, 'blue');
log(`   Working Directory (cwd): ${process.cwd()}`, 'blue');
log(`   __dirname (deste script): ${__dirname}`, 'blue');
log(`   __dirname (projeto): ${path.resolve(__dirname, '..')}`, 'blue');

// 2. Verificar caminhos configurados
log('\n2. CAMINHOS CONFIGURADOS', 'magenta');

try {
  // Importar configuração
  const pdfConfig = require('../src/config/pdf');

  log(`   UPLOADS_BASE_PATH: ${pdfConfig.UPLOADS_BASE_PATH}`, 'blue');
  log(`   CONTRACTS_PATH: ${pdfConfig.CONTRACTS_PATH}`, 'blue');
  log(`   TEMP_PDF_PATH: ${pdfConfig.TEMP_PDF_PATH}`, 'blue');

  // Verificar se os caminhos existem
  log('\n   Verificação de existência:', 'yellow');
  log(`   UPLOADS_BASE_PATH existe? ${fs.existsSync(pdfConfig.UPLOADS_BASE_PATH) ? '✓' : '✗'}`,
    fs.existsSync(pdfConfig.UPLOADS_BASE_PATH) ? 'green' : 'red');
  log(`   CONTRACTS_PATH existe? ${fs.existsSync(pdfConfig.CONTRACTS_PATH) ? '✓' : '✗'}`,
    fs.existsSync(pdfConfig.CONTRACTS_PATH) ? 'green' : 'red');
  log(`   TEMP_PDF_PATH existe? ${fs.existsSync(pdfConfig.TEMP_PDF_PATH) ? '✓' : '✗'}`,
    fs.existsSync(pdfConfig.TEMP_PDF_PATH) ? 'green' : 'red');

} catch (err) {
  log(`   ✗ Erro ao carregar configuração de PDF: ${err.message}`, 'red');
}

// 3. Simular geração de caminho como no PDFService
log('\n3. SIMULAÇÃO DE GERAÇÃO DE CAMINHO', 'magenta');

try {
  const { CONTRACTS_PATH } = require('../src/config/pdf');
  const outputDir = CONTRACTS_PATH;

  log(`   outputDir (da config): ${outputDir}`, 'blue');

  // Simular o que o PDFService faz
  const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
  log(`   path.resolve(cwd, outputDir): ${absoluteOutputDir}`, 'blue');

  // Verificar se é o mesmo caminho
  if (absoluteOutputDir === outputDir) {
    log(`   ✓ Caminho já é absoluto`, 'green');
  } else {
    log(`   ⚠ Caminho foi modificado pelo path.resolve`, 'yellow');
    log(`   Original: ${outputDir}`, 'blue');
    log(`   Resolvido: ${absoluteOutputDir}`, 'blue');
  }

  // Verificar se o diretório resolvido existe
  log(`   Diretório resolvido existe? ${fs.existsSync(absoluteOutputDir) ? '✓' : '✗'}`,
    fs.existsSync(absoluteOutputDir) ? 'green' : 'red');

} catch (err) {
  log(`   ✗ Erro na simulação: ${err.message}`, 'red');
}

// 4. Testar geração de PDF de teste
log('\n4. TESTE DE GERAÇÃO DE PDF', 'magenta');

async function testPDFGeneration() {
  try {
    const PDFService = require('../src/services/pdf.service');
    const { CONTRACTS_PATH } = require('../src/config/pdf');

    const testData = {
      studentName: 'Teste Diagnóstico',
      studentId: 999999,
      courseName: 'Curso de Teste',
      courseId: 999,
      semester: 1,
      year: 2025,
    };

    const testTemplate = `
      Contrato de Teste

      Aluno: {{studentName}}
      Curso: {{courseName}}
      Período: {{semester}}/{{year}}

      Este é um contrato de teste gerado pelo script de diagnóstico.
    `;

    log('   Gerando PDF de teste...', 'yellow');

    const result = await PDFService.generateContractPDF(
      testData,
      testTemplate,
      CONTRACTS_PATH
    );

    log(`   ✓ PDF gerado com sucesso!`, 'green');
    log(`   Caminho completo: ${result.filePath}`, 'blue');
    log(`   Nome do arquivo: ${result.fileName}`, 'blue');
    log(`   Tamanho: ${result.fileSize} bytes`, 'blue');
    log(`   Caminho relativo: ${result.relativePath}`, 'blue');

    // Verificar se o arquivo realmente existe
    if (fs.existsSync(result.filePath)) {
      log(`   ✓ Arquivo realmente existe no disco`, 'green');

      // Remover arquivo de teste
      fs.unlinkSync(result.filePath);
      log(`   ✓ Arquivo de teste removido`, 'green');
    } else {
      log(`   ✗ ATENÇÃO: PDFService retornou sucesso mas arquivo não existe!`, 'red');
    }

    return true;
  } catch (err) {
    log(`   ✗ Erro ao gerar PDF de teste: ${err.message}`, 'red');
    log(`   Stack: ${err.stack}`, 'red');
    return false;
  }
}

// 5. Verificar banco de dados
log('\n5. VERIFICAÇÃO DO BANCO DE DADOS', 'magenta');

async function checkDatabase() {
  try {
    const { Contract } = require('../src/models');

    // Contar contratos com e sem PDF
    const totalContracts = await Contract.count();
    const contractsWithPDF = await Contract.count({
      where: {
        file_path: { [require('sequelize').Op.ne]: null },
      },
    });
    const contractsWithoutPDF = totalContracts - contractsWithPDF;

    log(`   Total de contratos: ${totalContracts}`, 'blue');
    log(`   Contratos com PDF: ${contractsWithPDF}`, 'green');
    log(`   Contratos sem PDF: ${contractsWithoutPDF}`, contractsWithoutPDF > 0 ? 'yellow' : 'green');

    if (contractsWithoutPDF > 0) {
      log(`   ⚠ Há ${contractsWithoutPDF} contrato(s) sem PDF`, 'yellow');

      // Buscar exemplos de contratos sem PDF
      const examplesWithoutPDF = await Contract.findAll({
        where: {
          file_path: null,
        },
        limit: 3,
        order: [['created_at', 'DESC']],
      });

      if (examplesWithoutPDF.length > 0) {
        log(`   Exemplos de contratos sem PDF (últimos 3):`, 'yellow');
        examplesWithoutPDF.forEach((contract) => {
          log(`     - ID: ${contract.id}, Usuário: ${contract.user_id}, Criado em: ${contract.created_at}`, 'blue');
        });
      }
    }

    return true;
  } catch (err) {
    log(`   ✗ Erro ao verificar banco de dados: ${err.message}`, 'red');
    return false;
  }
}

// Executar testes
(async () => {
  try {
    const pdfTestResult = await testPDFGeneration();
    const dbTestResult = await checkDatabase();

    log('\n=== RESUMO DO DIAGNÓSTICO ===\n', 'blue');

    if (pdfTestResult && dbTestResult) {
      log('✓ Todos os testes passaram', 'green');
      log('\nPossíveis causas do problema em produção:', 'yellow');
      log('1. Permissões de pasta diferentes em produção', 'blue');
      log('2. Caminho absoluto diferente devido a deployment', 'blue');
      log('3. Erro durante geração do contrato que não está sendo logado', 'blue');
      log('4. Processo PM2 rodando com usuário diferente', 'blue');

      log('\nRecomendações:', 'yellow');
      log('1. Execute este script em produção: node scripts/diagnose-pdf-generation.js', 'green');
      log('2. Execute o script de permissões: node scripts/check-contracts-permissions.js', 'green');
      log('3. Verifique os logs do Winston em backend/logs/', 'green');
      log('4. Verifique o usuário do processo PM2: pm2 describe secretaria-online', 'green');
    } else {
      log('✗ Alguns testes falharam - verifique os erros acima', 'red');
    }

  } catch (err) {
    log(`\n✗ Erro fatal durante diagnóstico: ${err.message}`, 'red');
    log(`Stack: ${err.stack}`, 'red');
    process.exit(1);
  }
})();
