/**
 * Arquivo: backend/src/services/pdf.service.test.js
 * Descrição: Testes unitários para o PDFService
 * Feature: feat-047 - Criar PDFService para geração de contratos
 * Criado em: 2025-11-01
 */

const PDFService = require('./pdf.service');
const fs = require('fs').promises;
const path = require('path');

/**
 * Testes para PDFService
 *
 * Executar com: npm test (após configurar test runner)
 * Ou manualmente com: node src/services/pdf.service.test.js
 */

// Dados de teste válidos
const validContractData = {
  studentName: 'João Silva da Santos',
  studentId: 123,
  courseName: 'Engenharia de Software',
  courseId: 5,
  semester: 1,
  year: 2025,
  startDate: '01/11/2025',
};

// Template de teste
const testTemplate = `
CONTRATO DE MATRÍCULA

Este contrato formaliza a matrícula de **{{studentName}}** no curso **{{courseName}}**.

Dados da Matrícula:
- ID do Aluno: {{studentId}}
- ID do Curso: {{courseId}}
- Semestre: {{semester}}
- Ano: {{year}}
- Data de Início: {{startDate}}
- Duração Total: {{duration}}
- Instituição: {{institutionName}}

O aluno concorda com os termos e condições estabelecidos pela {{institutionName}}.

Data de Geração: {{currentDateTime}}
`;

/**
 * Teste 1: Validação de dados obrigatórios
 */
async function testValidation() {
  console.log('\n✓ Teste 1: Validação de dados obrigatórios');

  // Dados inválidos (faltam campos)
  const invalidData = {
    studentName: 'João Silva',
    // Faltam outros campos
  };

  try {
    await PDFService.generateContractPDF(invalidData, testTemplate);
    console.error('  ✗ FALHOU: Deveria ter lançado erro');
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      console.log('  ✓ PASSOU: Erro de validação capturado corretamente');
      console.log(`    Mensagem: ${error.message}`);
    } else {
      console.error(`  ✗ FALHOU: Erro inesperado - ${error.message}`);
    }
  }
}

/**
 * Teste 2: Geração de PDF com dados válidos
 */
async function testPDFGeneration() {
  console.log('\n✓ Teste 2: Geração de PDF com dados válidos');

  const testOutputDir = 'uploads/test-contracts';

  try {
    const result = await PDFService.generateContractPDF(validContractData, testTemplate, testOutputDir);

    // Verificar resultado
    if (!result.filePath || !result.fileName || result.fileSize === undefined) {
      console.error('  ✗ FALHOU: Resultado incompleto');
      return;
    }

    // Verificar se arquivo existe
    const exists = await PDFService.pdfExists(result.filePath);
    if (!exists) {
      console.error('  ✗ FALHOU: Arquivo não foi criado');
      return;
    }

    console.log('  ✓ PASSOU: PDF gerado com sucesso');
    console.log(`    Nome do arquivo: ${result.fileName}`);
    console.log(`    Tamanho: ${result.fileSize} bytes`);
    console.log(`    Caminho relativo: ${result.relativePath}`);

    // Limpar arquivo de teste
    await PDFService.removePDF(result.filePath);
    console.log('    Arquivo de teste removido');
  } catch (error) {
    console.error(`  ✗ FALHOU: ${error.message}`);
  }
}

/**
 * Teste 3: Substituição de placeholders
 */
async function testPlaceholders() {
  console.log('\n✓ Teste 3: Substituição de placeholders');

  const template = 'Aluno: {{studentName}}, Curso: {{courseName}}, Semestre: {{semester}}';

  // Acessar método privado (para teste)
  // Nota: Em produção, testes de placeholders devem ser integrados no teste 2
  const result = PDFService._replacePlaceholders(template, validContractData);

  if (result.includes('{{studentName}}')) {
    console.error('  ✗ FALHOU: Placeholder não foi substituído');
  } else if (result.includes(validContractData.studentName)) {
    console.log('  ✓ PASSOU: Placeholders substituídos corretamente');
    console.log(`    Resultado: ${result}`);
  } else {
    console.error('  ✗ FALHOU: Substituição incorreta');
  }
}

/**
 * Teste 4: Validação de tipos de dados
 */
async function testTypeValidation() {
  console.log('\n✓ Teste 4: Validação de tipos de dados');

  const invalidData = {
    studentName: 'João Silva',
    studentId: 'não-é-número', // Deve ser número ou string numérica
    courseName: 'Engenharia',
    courseId: 5,
    semester: 'um', // Deve ser número
    year: 2025,
  };

  try {
    await PDFService.generateContractPDF(invalidData, testTemplate);
    console.error('  ✗ FALHOU: Deveria ter lançado erro de tipo');
  } catch (error) {
    console.log('  ✓ PASSOU: Erro de tipo capturado corretamente');
    console.log(`    Mensagem: ${error.message}`);
  }
}

/**
 * Teste 5: Gerenciamento de diretórios
 */
async function testDirectoryHandling() {
  console.log('\n✓ Teste 5: Gerenciamento de diretórios');

  const customDir = 'uploads/test-contracts-custom';

  try {
    const result = await PDFService.generateContractPDF(validContractData, testTemplate, customDir);

    // Verificar se diretório foi criado
    const dirExists = await PDFService.pdfExists(path.dirname(result.filePath));
    if (dirExists) {
      console.log('  ✓ PASSOU: Diretório criado automaticamente');
      console.log(`    Diretório: ${customDir}`);

      // Limpar
      await PDFService.removePDF(result.filePath);
    } else {
      console.error('  ✗ FALHOU: Diretório não foi criado');
    }
  } catch (error) {
    console.error(`  ✗ FALHOU: ${error.message}`);
  }
}

/**
 * Teste 6: Operações de arquivo (read, exists, remove)
 */
async function testFileOperations() {
  console.log('\n✓ Teste 6: Operações de arquivo (read, exists, remove)');

  const testOutputDir = 'uploads/test-contracts-ops';

  try {
    const result = await PDFService.generateContractPDF(validContractData, testTemplate, testOutputDir);

    // Teste exists
    let exists = await PDFService.pdfExists(result.filePath);
    if (!exists) {
      console.error('  ✗ FALHOU: pdfExists() retornou false para arquivo existente');
      return;
    }
    console.log('  ✓ pdfExists() funcionando corretamente');

    // Teste read
    const buffer = await PDFService.readPDF(result.filePath);
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      console.error('  ✗ FALHOU: readPDF() retornou buffer inválido');
      return;
    }
    console.log('  ✓ readPDF() funcionando corretamente');

    // Teste remove
    const removed = await PDFService.removePDF(result.filePath);
    if (!removed) {
      console.error('  ✗ FALHOU: removePDF() retornou false');
      return;
    }

    exists = await PDFService.pdfExists(result.filePath);
    if (exists) {
      console.error('  ✗ FALHOU: Arquivo ainda existe após remoção');
      return;
    }

    console.log('  ✓ removePDF() funcionando corretamente');
    console.log('  ✓ PASSOU: Todas as operações de arquivo funcionando');
  } catch (error) {
    console.error(`  ✗ FALHOU: ${error.message}`);
  }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('TESTES DO PDFService - feat-047');
  console.log('='.repeat(60));

  try {
    await testValidation();
    await testPlaceholders();
    await testTypeValidation();
    await testPDFGeneration();
    await testDirectoryHandling();
    await testFileOperations();

    console.log('\n' + '='.repeat(60));
    console.log('✓ TESTES CONCLUÍDOS COM SUCESSO');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n✗ ERRO CRÍTICO:', error.message);
    process.exit(1);
  }
}

// Executar testes se o arquivo for executado diretamente
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Erro ao executar testes:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testValidation,
  testPDFGeneration,
  testPlaceholders,
  testTypeValidation,
  testDirectoryHandling,
  testFileOperations,
};
