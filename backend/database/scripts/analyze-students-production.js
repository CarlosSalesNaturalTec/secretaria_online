/**
 * Script de análise profunda da tabela students em produção
 * Identifica causas de travamento no DBeaver
 *
 * IMPORTANTE: Configure as credenciais de PRODUÇÃO nas variáveis abaixo
 *
 * Uso:
 * 1. Editar credenciais de produção abaixo
 * 2. node backend/database/scripts/analyze-students-production.js
 */

const { Sequelize } = require('sequelize');

// ====== CONFIGURAR CREDENCIAIS DE PRODUÇÃO AQUI ======
const PROD_CONFIG = {
  host: '35.184.213.146',           // Do seu log DBeaver
  port: 3306,
  database: 'secretaria_online',     // Do seu log DBeaver
  username: 'SEU_USUARIO',           // Configure aqui
  password: 'SUA_SENHA',             // Configure aqui
};

// ====== NÃO MODIFICAR ABAIXO DESTA LINHA ======

const sequelize = new Sequelize(
  PROD_CONFIG.database,
  PROD_CONFIG.username,
  PROD_CONFIG.password,
  {
    host: PROD_CONFIG.host,
    port: PROD_CONFIG.port,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000, // 60 segundos
    },
  }
);

async function analyzeProduction() {
  console.log('=== ANÁLISE PROFUNDA DA TABELA STUDENTS (PRODUÇÃO) ===\n');

  try {
    // Validar configuração
    if (PROD_CONFIG.username === 'SEU_USUARIO') {
      console.error('❌ ERRO: Configure as credenciais de produção no script!');
      process.exit(1);
    }

    console.log('Conectando ao servidor de produção...');
    console.log(`Host: ${PROD_CONFIG.host}:${PROD_CONFIG.port}`);
    console.log(`Database: ${PROD_CONFIG.database}\n`);

    await sequelize.authenticate();
    console.log('✓ Conexão estabelecida\n');

    // 1. Total de registros
    console.log('1. TOTAL DE REGISTROS:');
    const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM students');
    const total = countResult[0].total;
    console.log(`   ${total} registros\n`);

    // 2. Índices (verificar duplicados)
    console.log('2. ÍNDICES NA TABELA:');
    const [indexes] = await sequelize.query('SHOW INDEX FROM students');

    const indexMap = {};
    indexes.forEach(idx => {
      if (!indexMap[idx.Key_name]) {
        indexMap[idx.Key_name] = {
          name: idx.Key_name,
          unique: idx.Non_unique === 0,
          columns: [],
          type: idx.Index_type,
          cardinality: idx.Cardinality,
        };
      }
      indexMap[idx.Key_name].columns.push(idx.Column_name);
    });

    let duplicateIndexFound = false;
    Object.values(indexMap).forEach(idx => {
      const isDuplicate = idx.columns.includes('cpf') && idx.unique;
      console.log(`   ${idx.name} (${idx.type})${idx.unique ? ' [UNIQUE]' : ''}`);
      console.log(`      Colunas: ${idx.columns.join(', ')}`);
      console.log(`      Cardinalidade: ${idx.cardinality}`);

      if (isDuplicate && (idx.name === 'cpf' || idx.name === 'idx_students_cpf')) {
        if (duplicateIndexFound) {
          console.log(`      ⚠️  ÍNDICE DUPLICADO ENCONTRADO!`);
        }
        duplicateIndexFound = true;
      }
    });

    if (Object.values(indexMap).filter(idx =>
      idx.columns.includes('cpf') && idx.unique
    ).length > 1) {
      console.log('\n   ❌ PROBLEMA CRÍTICO: Índices duplicados no CPF!');
      console.log('      Execute a migration 20251205180500-remove-duplicate-cpf-index.js\n');
    }

    // 3. Tamanho da tabela
    console.log('\n3. TAMANHO DA TABELA:');
    const [sizeInfo] = await sequelize.query(`
      SELECT
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "size_mb",
        ROUND((data_length / 1024 / 1024), 2) AS "data_mb",
        ROUND((index_length / 1024 / 1024), 2) AS "index_mb",
        ROUND((data_free / 1024 / 1024), 2) AS "fragmented_mb"
      FROM information_schema.TABLES
      WHERE table_schema = '${PROD_CONFIG.database}'
        AND table_name = 'students'
    `);

    console.log(`   Tamanho total: ${sizeInfo[0].size_mb} MB`);
    console.log(`   Dados: ${sizeInfo[0].data_mb} MB`);
    console.log(`   Índices: ${sizeInfo[0].index_mb} MB`);
    console.log(`   Fragmentado: ${sizeInfo[0].fragmented_mb} MB`);

    if (sizeInfo[0].fragmented_mb > 10) {
      console.log('\n   ⚠️  TABELA FRAGMENTADA! Execute: OPTIMIZE TABLE students;\n');
    }

    // 4. Campos muito grandes
    console.log('\n4. CAMPOS COM VALORES MUITO GRANDES:');
    const [largeCols] = await sequelize.query(`
      SELECT
        ROUND(AVG(LENGTH(endereco_complemento)), 2) as avg_complemento,
        MAX(LENGTH(endereco_complemento)) as max_complemento,
        ROUND(AVG(LENGTH(nome)), 2) as avg_nome,
        MAX(LENGTH(nome)) as max_nome
      FROM students
      WHERE endereco_complemento IS NOT NULL OR nome IS NOT NULL
    `);

    console.log(`   endereco_complemento:`);
    console.log(`      Tamanho médio: ${largeCols[0].avg_complemento} chars`);
    console.log(`      Tamanho máximo: ${largeCols[0].max_complemento} chars`);
    if (largeCols[0].max_complemento > 500) {
      console.log(`      ⚠️  Valores muito grandes! Considere migrar para tabela separada`);
    }

    console.log(`   nome:`);
    console.log(`      Tamanho médio: ${largeCols[0].avg_nome} chars`);
    console.log(`      Tamanho máximo: ${largeCols[0].max_nome} chars`);

    // 5. Variáveis do MySQL que afetam performance
    console.log('\n5. CONFIGURAÇÕES DO MYSQL:');
    const [maxConnections] = await sequelize.query("SHOW VARIABLES LIKE 'max_connections'");
    const [connectTimeout] = await sequelize.query("SHOW VARIABLES LIKE 'wait_timeout'");
    const [netReadTimeout] = await sequelize.query("SHOW VARIABLES LIKE 'net_read_timeout'");
    const [maxAllowedPacket] = await sequelize.query("SHOW VARIABLES LIKE 'max_allowed_packet'");

    console.log(`   max_connections: ${maxConnections[0].Value}`);
    console.log(`   wait_timeout: ${connectTimeout[0].Value}s`);
    console.log(`   net_read_timeout: ${netReadTimeout[0].Value}s`);
    console.log(`   max_allowed_packet: ${(maxAllowedPacket[0].Value / 1024 / 1024).toFixed(2)} MB`);

    if (parseInt(netReadTimeout[0].Value) < 60) {
      console.log('\n   ⚠️  net_read_timeout muito baixo! Pode causar timeout em queries grandes.');
    }

    // 6. Teste de performance
    console.log('\n6. TESTE DE PERFORMANCE:');

    console.log('   Testando SELECT * LIMIT 10...');
    let start = Date.now();
    await sequelize.query('SELECT * FROM students LIMIT 10');
    console.log(`      Tempo: ${Date.now() - start}ms`);

    console.log('   Testando SELECT * LIMIT 100...');
    start = Date.now();
    await sequelize.query('SELECT * FROM students LIMIT 100');
    console.log(`      Tempo: ${Date.now() - start}ms`);

    console.log('   Testando COUNT(*)...');
    start = Date.now();
    await sequelize.query('SELECT COUNT(*) FROM students');
    console.log(`      Tempo: ${Date.now() - start}ms`);

    // Teste crítico: SELECT * sem LIMIT (com timeout)
    console.log('   Testando SELECT * (SEM LIMIT) - CRÍTICO...');
    start = Date.now();
    try {
      await Promise.race([
        sequelize.query('SELECT * FROM students'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        ),
      ]);
      console.log(`      ✓ Tempo: ${Date.now() - start}ms`);
    } catch (error) {
      if (error.message === 'Timeout') {
        console.log(`      ❌ TIMEOUT após 10 segundos!`);
        console.log(`      Este é o problema que causa travamento no DBeaver!`);
      } else {
        throw error;
      }
    }

    console.log('\n=== RECOMENDAÇÕES ===\n');
    console.log('1. Execute as migrations de correção:');
    console.log('   - 20251205180500-remove-duplicate-cpf-index.js');
    console.log('   - 20251205181000-optimize-students-table.js');
    console.log('');
    console.log('2. Se fragmentação > 10MB, execute: OPTIMIZE TABLE students;');
    console.log('');
    console.log('3. No DBeaver, configure:');
    console.log('   - Connection settings > Read timeout: 60000ms');
    console.log('   - Data Editor > Preferences > Result Set Max Rows: 500');
    console.log('');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

analyzeProduction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
