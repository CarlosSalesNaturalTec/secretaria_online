/**
 * Script para exportar dados da tabela students de produção
 * Exporta em lotes (batches) para evitar travamentos
 *
 * IMPORTANTE: Configure as credenciais de PRODUÇÃO nas variáveis abaixo
 *
 * Uso:
 * 1. Editar credenciais de produção abaixo
 * 2. node backend/database/scripts/export-students-production.js
 * 3. Arquivo students_export.sql será gerado
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ====== CONFIGURAR CREDENCIAIS DE PRODUÇÃO AQUI ======
const PROD_CONFIG = {
  host: 'SEU_HOST_PRODUCAO',        // Ex: mysql.seudominio.com.br
  port: 3306,
  database: 'SEU_BANCO_PRODUCAO',   // Ex: secretaria_online
  username: 'SEU_USUARIO',           // Ex: root ou usuario_db
  password: 'SUA_SENHA',             // Senha do banco de produção
};

// ====== CONFIGURAÇÕES DO EXPORT ======
const BATCH_SIZE = 100; // Exportar 100 registros por vez
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'students_export.sql');

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
  }
);

/**
 * Escapa valores para SQL
 */
function escapeSQLValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }

  // String - escapar aspas simples
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Gera INSERT SQL para um lote de registros
 */
function generateInsertSQL(records) {
  if (records.length === 0) return '';

  const columns = Object.keys(records[0]);
  const values = records.map(record => {
    const vals = columns.map(col => escapeSQLValue(record[col]));
    return `(${vals.join(', ')})`;
  });

  return `INSERT INTO students (${columns.join(', ')}) VALUES\n${values.join(',\n')};\n\n`;
}

async function exportStudents() {
  console.log('=== EXPORTAÇÃO DE STUDENTS DE PRODUÇÃO ===\n');

  try {
    // Validar configuração
    if (PROD_CONFIG.host === 'SEU_HOST_PRODUCAO') {
      console.error('❌ ERRO: Configure as credenciais de produção no script!');
      console.error('   Edite o arquivo:', __filename);
      process.exit(1);
    }

    // Conectar ao banco de produção
    console.log('Conectando ao banco de produção...');
    await sequelize.authenticate();
    console.log('✓ Conexão estabelecida\n');

    // Contar total de registros
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM students'
    );
    const totalRecords = countResult[0].total;
    console.log(`Total de registros a exportar: ${totalRecords}\n`);

    if (totalRecords === 0) {
      console.log('⚠️  Tabela students está vazia em produção!');
      await sequelize.close();
      return;
    }

    // Criar arquivo de saída
    const stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });

    // Cabeçalho do SQL
    stream.write('-- Exportação da tabela students de produção\n');
    stream.write(`-- Data: ${new Date().toISOString()}\n`);
    stream.write(`-- Total de registros: ${totalRecords}\n\n`);
    stream.write('SET FOREIGN_KEY_CHECKS=0;\n\n');
    stream.write('-- Limpar tabela students antes de importar\n');
    stream.write('TRUNCATE TABLE students;\n\n');

    // Exportar em lotes
    let offset = 0;
    let batchNumber = 1;

    while (offset < totalRecords) {
      console.log(`Exportando lote ${batchNumber} (registros ${offset + 1} a ${Math.min(offset + BATCH_SIZE, totalRecords)})...`);

      const [records] = await sequelize.query(
        `SELECT * FROM students LIMIT ${BATCH_SIZE} OFFSET ${offset}`
      );

      if (records.length > 0) {
        const sql = generateInsertSQL(records);
        stream.write(sql);
      }

      offset += BATCH_SIZE;
      batchNumber++;

      // Pequena pausa para não sobrecarregar o banco
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Rodapé do SQL
    stream.write('SET FOREIGN_KEY_CHECKS=1;\n');
    stream.end();

    console.log(`\n✓ Exportação concluída com sucesso!`);
    console.log(`   Arquivo gerado: ${OUTPUT_FILE}`);
    console.log(`   Tamanho: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);

    console.log('Para importar no banco local, execute:');
    console.log(`   mysql -u root -p secretaria_online < "${OUTPUT_FILE}"`);

  } catch (error) {
    console.error('❌ Erro ao exportar:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Executar exportação
exportStudents()
  .then(() => {
    console.log('\nExportação finalizada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
