/**
 * Script de diagnóstico para tabela students
 * Verifica índices, foreign keys, e possíveis problemas de performance
 *
 * Uso: node backend/database/scripts/diagnose-students-table.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function diagnoseStudentsTable() {
  console.log('=== DIAGNÓSTICO DA TABELA STUDENTS ===\n');

  try {
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✓ Conexão com banco de dados estabelecida\n');

    // 1. Verificar número de registros
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM students'
    );
    console.log('1. TOTAL DE REGISTROS:', countResult[0].total);

    // 2. Verificar índices
    console.log('\n2. ÍNDICES NA TABELA STUDENTS:');
    const [indexes] = await sequelize.query('SHOW INDEX FROM students');

    const indexMap = {};
    indexes.forEach((idx) => {
      if (!indexMap[idx.Key_name]) {
        indexMap[idx.Key_name] = {
          name: idx.Key_name,
          unique: idx.Non_unique === 0,
          columns: [],
          type: idx.Index_type,
        };
      }
      indexMap[idx.Key_name].columns.push(idx.Column_name);
    });

    Object.values(indexMap).forEach((idx) => {
      console.log(`   - ${idx.name} (${idx.type})${idx.unique ? ' [UNIQUE]' : ''}`);
      console.log(`     Colunas: ${idx.columns.join(', ')}`);
    });

    // 3. Verificar foreign keys apontando PARA students
    console.log('\n3. FOREIGN KEYS APONTANDO PARA STUDENTS:');
    const [fks] = await sequelize.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_SCHEMA = '${process.env.DB_NAME}'
        AND REFERENCED_TABLE_NAME = 'students'
    `);

    if (fks.length === 0) {
      console.log('   ⚠️  Nenhuma foreign key encontrada apontando para students');
    } else {
      fks.forEach((fk) => {
        console.log(`   - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        console.log(`     Constraint: ${fk.CONSTRAINT_NAME}`);
      });
    }

    // 4. Verificar foreign keys DE students para outras tabelas
    console.log('\n4. FOREIGN KEYS DE STUDENTS PARA OUTRAS TABELAS:');
    const [outFks] = await sequelize.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
        AND TABLE_NAME = 'students'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (outFks.length === 0) {
      console.log('   ✓ Nenhuma foreign key (students é tabela independente)');
    } else {
      outFks.forEach((fk) => {
        console.log(`   - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        console.log(`     Constraint: ${fk.CONSTRAINT_NAME}`);
      });
    }

    // 5. Verificar registros com deleted_at NULL vs NOT NULL
    console.log('\n5. SOFT DELETE STATUS:');
    const [softDeleteStatus] = await sequelize.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as excluidos
      FROM students
    `);
    console.log(`   Total: ${softDeleteStatus[0].total}`);
    console.log(`   Ativos: ${softDeleteStatus[0].ativos}`);
    console.log(`   Excluídos (soft delete): ${softDeleteStatus[0].excluidos}`);

    // 6. Verificar campos NULL vs NOT NULL
    console.log('\n6. ANÁLISE DE CAMPOS NULL/NOT NULL:');
    const [structure] = await sequelize.query('DESCRIBE students');

    const requiredFields = structure.filter(f => f.Null === 'NO');
    const optionalFields = structure.filter(f => f.Null === 'YES');

    console.log(`   Campos obrigatórios (NOT NULL): ${requiredFields.length}`);
    requiredFields.forEach(f => {
      console.log(`      - ${f.Field} (${f.Type})`);
    });

    console.log(`   Campos opcionais (NULL): ${optionalFields.length}`);

    // 7. Verificar tamanho da tabela
    console.log('\n7. TAMANHO DA TABELA:');
    const [sizeInfo] = await sequelize.query(`
      SELECT
        table_name,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)",
        ROUND((data_length / 1024 / 1024), 2) AS "Data Size (MB)",
        ROUND((index_length / 1024 / 1024), 2) AS "Index Size (MB)"
      FROM information_schema.TABLES
      WHERE table_schema = '${process.env.DB_NAME}'
        AND table_name = 'students'
    `);
    console.log(`   Tamanho total: ${sizeInfo[0]['Size (MB)']} MB`);
    console.log(`   Dados: ${sizeInfo[0]['Data Size (MB)']} MB`);
    console.log(`   Índices: ${sizeInfo[0]['Index Size (MB)']} MB`);

    // 8. Verificar fragmentação (opcional)
    console.log('\n8. VERIFICAR FRAGMENTAÇÃO:');
    const [fragmentation] = await sequelize.query(`
      SELECT
        table_name,
        data_free / 1024 / 1024 AS "Fragmented (MB)"
      FROM information_schema.TABLES
      WHERE table_schema = '${process.env.DB_NAME}'
        AND table_name = 'students'
    `);
    const fragMB = parseFloat(fragmentation[0]['Fragmented (MB)']);
    console.log(`   Espaço fragmentado: ${fragMB.toFixed(2)} MB`);

    if (fragMB > 10) {
      console.log('   ⚠️  Tabela pode estar fragmentada. Considere executar: OPTIMIZE TABLE students;');
    } else {
      console.log('   ✓ Fragmentação dentro do aceitável');
    }

    // 9. Verificar performance de uma query simples
    console.log('\n9. TESTE DE PERFORMANCE (SELECT * LIMIT 100):');
    const startTime = Date.now();
    await sequelize.query('SELECT * FROM students LIMIT 100');
    const endTime = Date.now();
    console.log(`   Tempo de execução: ${endTime - startTime}ms`);

    // 10. Verificar problemas conhecidos
    console.log('\n10. VERIFICAÇÕES DE PROBLEMAS CONHECIDOS:');

    // Verificar CPFs duplicados (apesar do índice único)
    const [dupCPFs] = await sequelize.query(`
      SELECT cpf, COUNT(*) as count
      FROM students
      WHERE cpf IS NOT NULL
      GROUP BY cpf
      HAVING COUNT(*) > 1
    `);

    if (dupCPFs.length > 0) {
      console.log(`   ⚠️  CPFs duplicados encontrados: ${dupCPFs.length}`);
      dupCPFs.slice(0, 5).forEach(dup => {
        console.log(`      CPF: ${dup.cpf} (${dup.count} registros)`);
      });
    } else {
      console.log('   ✓ Nenhum CPF duplicado encontrado');
    }

    // Verificar registros sem CPF
    const [noCPF] = await sequelize.query(`
      SELECT COUNT(*) as count FROM students WHERE cpf IS NULL OR cpf = ''
    `);
    console.log(`   Registros sem CPF: ${noCPF[0].count}`);

    // Verificar índice único do CPF
    const cpfIndex = Object.values(indexMap).find(idx =>
      idx.columns.includes('cpf') && idx.unique
    );

    if (!cpfIndex) {
      console.log('   ⚠️  PROBLEMA CRÍTICO: Índice único do CPF não encontrado!');
      console.log('       Isso pode causar lentidão no DBeaver ao tentar listar todos os registros.');
      console.log('       Solução: Executar migration para recriar índice único do CPF');
    } else {
      console.log(`   ✓ Índice único do CPF encontrado: ${cpfIndex.name}`);
    }

    console.log('\n=== FIM DO DIAGNÓSTICO ===\n');

  } catch (error) {
    console.error('❌ Erro ao executar diagnóstico:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Executar diagnóstico
diagnoseStudentsTable()
  .then(() => {
    console.log('Diagnóstico concluído com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar diagnóstico:', error);
    process.exit(1);
  });
