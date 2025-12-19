/**
 * Script Master: run_migration.js
 * Descrição: Orquestrador de todos os scripts de migração v3
 * Data: 2025-12-19
 *
 * Executa todos os scripts na ordem correta
 */

// Carregar variáveis de ambiente do diretório backend
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { sequelize } = require('../../src/models');

const SCRIPTS = [
  {
    name: 'Criar tabelas de migração (SQL)',
    file: '00_create_migration_tables.sql',
    type: 'sql'
  },
  {
    name: 'Mapear professores existentes',
    file: '01_create_professor_mapping.js',
    type: 'js'
  },
  {
    name: 'Criar usuários com credenciais antigas',
    file: '02_create_users_with_old_credentials.js',
    type: 'js'
  },
  {
    name: 'Criar usuário admin "Sistema Migração"',
    file: '03_create_migration_admin_user.js',
    type: 'js'
  },
  {
    name: 'Mapear alunos existentes',
    file: '04_map_existing_students.js',
    type: 'js'
  },
  {
    name: 'Criar turmas a partir de sub',
    file: '05_create_classes_from_sub.js',
    type: 'js'
  },
  {
    name: 'Popular class_students (alunos-turmas)',
    file: '06_populate_class_students.js',
    type: 'js'
  },
  {
    name: 'Popular class_teachers (professores-turmas)',
    file: '07_populate_class_teachers.js',
    type: 'js'
  },
  {
    name: 'Criar mapeamento de disciplinas',
    file: '08_create_discipline_mapping.js',
    type: 'js'
  },
  {
    name: 'Importar boletim_novo para tabela temp',
    file: '09_import_boletim_to_temp.js',
    type: 'js'
  },
  {
    name: 'Criar avaliações com fallback',
    file: '10_create_evaluations_with_fallback.js',
    type: 'js'
  },
  {
    name: 'Criar mapeamento de avaliações',
    file: '11_create_evaluation_mapping.js',
    type: 'js'
  },
  {
    name: 'Migrar notas (grades)',
    file: '12_migrate_grades.js',
    type: 'js'
  },
  {
    name: 'Validar migração',
    file: '13_validate_migration.js',
    type: 'js'
  },
  {
    name: 'Gerar relatório final',
    file: '14_generate_report.js',
    type: 'js'
  }
];

/**
 * Executa script SQL
 */
async function executeSqlScript(scriptPath) {
  const fs = require('fs');
  const path = require('path');

  const fullPath = path.join(__dirname, scriptPath);
  const sql = fs.readFileSync(fullPath, 'utf-8');

  // Remove comentários e linhas vazias
  const lines = sql.split('\n');
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('--');
  });

  const cleanedSql = cleanedLines.join('\n');

  // Separar por statement usando regex mais robusto
  // Considera ; seguido de quebra de linha ou espaços como delimitador
  const statements = cleanedSql
    .split(/;[\s\n]*(?=CREATE|DROP|INSERT|UPDATE|DELETE|SELECT|ALTER|TRUNCATE|SET)/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Adicionar o ; de volta se necessário e executar
  for (let stmt of statements) {
    if (stmt && !stmt.endsWith(';')) {
      stmt += ';';
    }
    if (stmt && stmt !== ';') {
      await sequelize.query(stmt);
    }
  }
}

/**
 * Executa script JS
 */
async function executeJsScript(scriptPath) {
  const path = require('path');
  const fullPath = path.join(__dirname, scriptPath);
  const script = require(fullPath);
  await script();
}

/**
 * Função principal
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   MIGRAÇÃO DE DADOS v3 - Sistema Antigo → Novo    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log('⚠️  IMPORTANTE: Esta migração seguirá as regras v3:');
  console.log('   - NÃO criará novos professores ou alunos');
  console.log('   - Usará credenciais antigas (login/senha)');
  console.log('   - Dados órfãos irão para "Sistema Migração"\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('Deseja continuar? (s/n): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 's') {
    console.log('\n❌ Migração cancelada pelo usuário.\n');
    return;
  }

  console.log('\n🚀 Iniciando migração...\n');

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < SCRIPTS.length; i++) {
    const script = SCRIPTS[i];
    const step = i + 1;

    console.log(`\n[${ step}/${SCRIPTS.length}] ${script.name}`);
    console.log('─'.repeat(60));

    try {
      if (script.type === 'sql') {
        await executeSqlScript(script.file);
      } else {
        await executeJsScript(script.file);
      }
      successCount++;
    } catch (error) {
      console.error(`\n❌ Erro ao executar: ${script.name}`);
      console.error(error.message);
      errorCount++;

      const continueAnswer = await new Promise(resolve => {
        const rl2 = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl2.question('\nDeseja continuar mesmo com o erro? (s/n): ', resolve);
        rl2.close();
      });

      if (continueAnswer.toLowerCase() !== 's') {
        console.log('\n❌ Migração interrompida.\n');
        return;
      }
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              MIGRAÇÃO CONCLUÍDA                    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`⏱️  Tempo total: ${duration}s`);
  console.log(`✅ Scripts executados com sucesso: ${successCount}`);
  console.log(`❌ Scripts com erro: ${errorCount}\n`);

  if (errorCount === 0) {
    console.log('🎉 Migração concluída sem erros!\n');
  } else {
    console.log('⚠️  Migração concluída com erros. Verifique os logs acima.\n');
  }
}

// Executar
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('\n❌ Erro fatal:', err);
      process.exit(1);
    });
}

module.exports = main;
