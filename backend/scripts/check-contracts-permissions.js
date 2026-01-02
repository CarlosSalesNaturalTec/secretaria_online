/**
 * Script: check-contracts-permissions.js
 * Descrição: Verifica e corrige permissões e estrutura de diretórios para contratos
 * Uso: node scripts/check-contracts-permissions.js
 */

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Caminhos a verificar
const baseDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(baseDir, 'uploads');
const contractsDir = path.join(uploadsDir, 'contracts');
const documentsDir = path.join(uploadsDir, 'documents');
const tempDir = path.join(uploadsDir, 'temp');

log('\n=== Verificação de Diretórios de Upload ===\n', 'blue');
log(`Diretório base: ${baseDir}`, 'blue');
log(`Working directory: ${process.cwd()}\n`, 'blue');

/**
 * Verifica e cria diretório se necessário
 */
function checkAndCreateDirectory(dirPath, label) {
  log(`\nVerificando: ${label}`, 'yellow');
  log(`Caminho: ${dirPath}`);

  try {
    // Verificar se existe
    if (fs.existsSync(dirPath)) {
      log('✓ Diretório existe', 'green');

      // Verificar permissões de leitura
      try {
        fs.accessSync(dirPath, fs.constants.R_OK);
        log('✓ Permissão de leitura: OK', 'green');
      } catch (err) {
        log('✗ Sem permissão de leitura', 'red');
        return false;
      }

      // Verificar permissões de escrita
      try {
        fs.accessSync(dirPath, fs.constants.W_OK);
        log('✓ Permissão de escrita: OK', 'green');
      } catch (err) {
        log('✗ Sem permissão de escrita', 'red');
        log('Tentando corrigir permissões...', 'yellow');
        try {
          fs.chmodSync(dirPath, 0o755);
          log('✓ Permissões corrigidas para 755', 'green');
        } catch (chmodErr) {
          log(`✗ Erro ao corrigir permissões: ${chmodErr.message}`, 'red');
          return false;
        }
      }

      // Listar conteúdo
      try {
        const files = fs.readdirSync(dirPath);
        log(`✓ Arquivos no diretório: ${files.length}`, 'green');
        if (files.length > 0 && files.length <= 5) {
          files.forEach((file) => log(`  - ${file}`));
        } else if (files.length > 5) {
          log(`  Primeiros 5 arquivos:`);
          files.slice(0, 5).forEach((file) => log(`  - ${file}`));
          log(`  ... e mais ${files.length - 5} arquivo(s)`);
        }
      } catch (err) {
        log(`✗ Erro ao listar arquivos: ${err.message}`, 'red');
      }

      return true;
    } else {
      log('✗ Diretório não existe', 'red');
      log('Tentando criar diretório...', 'yellow');

      try {
        fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
        log('✓ Diretório criado com sucesso (permissões 755)', 'green');
        return true;
      } catch (err) {
        log(`✗ Erro ao criar diretório: ${err.message}`, 'red');
        return false;
      }
    }
  } catch (err) {
    log(`✗ Erro inesperado: ${err.message}`, 'red');
    return false;
  }
}

/**
 * Testa criação de arquivo
 */
function testFileCreation(dirPath, label) {
  log(`\nTestando criação de arquivo em: ${label}`, 'yellow');

  const testFilePath = path.join(dirPath, `test-${Date.now()}.txt`);
  const testContent = 'Test file created by check-contracts-permissions.js';

  try {
    // Criar arquivo de teste
    fs.writeFileSync(testFilePath, testContent);
    log('✓ Arquivo de teste criado', 'green');

    // Ler arquivo de teste
    const content = fs.readFileSync(testFilePath, 'utf-8');
    if (content === testContent) {
      log('✓ Arquivo de teste lido corretamente', 'green');
    } else {
      log('✗ Conteúdo do arquivo de teste não corresponde', 'red');
    }

    // Deletar arquivo de teste
    fs.unlinkSync(testFilePath);
    log('✓ Arquivo de teste removido', 'green');

    return true;
  } catch (err) {
    log(`✗ Erro ao testar criação de arquivo: ${err.message}`, 'red');

    // Tentar remover arquivo de teste se foi criado
    try {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    } catch (cleanupErr) {
      // Ignorar erro de limpeza
    }

    return false;
  }
}

/**
 * Verifica espaço em disco
 */
function checkDiskSpace(dirPath) {
  log(`\nVerificando espaço em disco...`, 'yellow');

  try {
    const stats = fs.statSync(dirPath);
    log(`✓ Diretório acessível`, 'green');
    // Nota: Node.js não tem API nativa para verificar espaço em disco
    // Isso requer bibliotecas externas como 'check-disk-space'
    log(`ℹ Para verificar espaço em disco, use: df -h ${dirPath}`, 'blue');
    return true;
  } catch (err) {
    log(`✗ Erro ao verificar diretório: ${err.message}`, 'red');
    return false;
  }
}

// Executar verificações
const results = {
  uploads: checkAndCreateDirectory(uploadsDir, 'Diretório de Uploads'),
  contracts: checkAndCreateDirectory(contractsDir, 'Diretório de Contratos'),
  documents: checkAndCreateDirectory(documentsDir, 'Diretório de Documentos'),
  temp: checkAndCreateDirectory(tempDir, 'Diretório Temporário'),
};

// Testar criação de arquivos
const testResults = {
  contracts: false,
};

if (results.contracts) {
  testResults.contracts = testFileCreation(contractsDir, 'Diretório de Contratos');
}

// Verificar espaço em disco
checkDiskSpace(uploadsDir);

// Resumo final
log('\n=== RESUMO ===\n', 'blue');

const allPassed = Object.values(results).every((r) => r === true) && testResults.contracts;

if (allPassed) {
  log('✓ Todas as verificações passaram!', 'green');
  log('✓ Sistema de upload de contratos está funcionando corretamente', 'green');
  process.exit(0);
} else {
  log('✗ Algumas verificações falharam', 'red');
  log('\nProblemas encontrados:', 'yellow');

  Object.entries(results).forEach(([key, value]) => {
    if (!value) {
      log(`  - ${key}: FALHOU`, 'red');
    }
  });

  if (!testResults.contracts) {
    log(`  - Teste de criação de arquivo em contratos: FALHOU`, 'red');
  }

  log('\nAções recomendadas:', 'yellow');
  log('1. Verificar permissões do diretório com: ls -la backend/uploads/', 'blue');
  log('2. Corrigir permissões com: chmod -R 755 backend/uploads/', 'blue');
  log('3. Verificar proprietário com: ls -la backend/uploads/', 'blue');
  log('4. Corrigir proprietário se necessário (como root): chown -R user:group backend/uploads/', 'blue');
  log('5. Verificar espaço em disco com: df -h', 'blue');

  process.exit(1);
}
