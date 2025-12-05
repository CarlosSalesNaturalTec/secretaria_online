/**
 * Arquivo: backend/database/migrations/20251205181000-optimize-students-table.js
 * Descrição: Otimiza estrutura da tabela students para resolver travamentos no DBeaver
 * Criado em: 2025-12-05
 *
 * PROBLEMAS IDENTIFICADOS (logs DBeaver):
 * 1. Conexão fechando prematuramente ao ler tabela completa
 * 2. Múltiplas statements não sendo fechadas
 * 3. Timeout excedido em queries grandes
 *
 * CAUSAS PROVÁVEIS:
 * 1. Índice duplicado no CPF (já corrigido na migration anterior)
 * 2. Campos TEXT/BLOB muito grandes (endereco_complemento: 2000 chars)
 * 3. Falta de índices em campos frequentemente consultados
 * 4. Fragmentação da tabela
 *
 * OTIMIZAÇÕES:
 * 1. Reduzir tamanho de endereco_complemento de 2000 para 200
 * 2. Adicionar índice composto (nome, cpf) para buscas comuns
 * 3. Otimizar tabela (OPTIMIZE TABLE)
 * 4. Analisar e reconstruir estatísticas
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('=== INICIANDO OTIMIZAÇÃO DA TABELA STUDENTS ===\n');

    try {
      // 1. Reduzir tamanho de endereco_complemento
      console.log('1. Reduzindo tamanho do campo endereco_complemento...');
      await queryInterface.changeColumn('students', 'endereco_complemento', {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Complemento do endereço (otimizado)',
      });
      console.log('   ✓ Campo endereco_complemento reduzido de 2000 para 200 caracteres\n');

      // 2. Verificar e criar índice composto nome+cpf (se não existir)
      console.log('2. Verificando índice composto nome+cpf...');
      const [indexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM students WHERE Key_name = 'idx_students_nome_cpf'"
      );

      if (indexes.length === 0) {
        console.log('   Criando índice composto (nome, cpf)...');
        await queryInterface.addIndex('students', ['nome', 'cpf'], {
          name: 'idx_students_nome_cpf',
          comment: 'Índice composto para buscas por nome e CPF',
        });
        console.log('   ✓ Índice composto criado com sucesso\n');
      } else {
        console.log('   ℹ Índice composto já existe\n');
      }

      // 3. Adicionar índice em campos de data para queries temporais
      console.log('3. Verificando índice em created_at...');
      const [createdAtIndex] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM students WHERE Key_name = 'idx_students_created_at'"
      );

      if (createdAtIndex.length === 0) {
        console.log('   Criando índice em created_at...');
        await queryInterface.addIndex('students', ['created_at'], {
          name: 'idx_students_created_at',
          comment: 'Índice para ordenação por data de criação',
        });
        console.log('   ✓ Índice em created_at criado\n');
      } else {
        console.log('   ℹ Índice em created_at já existe\n');
      }

      // 4. Otimizar tabela (desfragmentar e reconstruir índices)
      console.log('4. Executando OPTIMIZE TABLE (pode demorar)...');
      await queryInterface.sequelize.query('OPTIMIZE TABLE students');
      console.log('   ✓ Tabela otimizada (desfragmentação concluída)\n');

      // 5. Analisar tabela (atualizar estatísticas)
      console.log('5. Atualizando estatísticas da tabela...');
      await queryInterface.sequelize.query('ANALYZE TABLE students');
      console.log('   ✓ Estatísticas atualizadas\n');

      // 6. Verificar estrutura final
      console.log('6. Verificando estrutura final...');
      const [finalIndexes] = await queryInterface.sequelize.query('SHOW INDEX FROM students');

      const indexNames = [...new Set(finalIndexes.map(idx => idx.Key_name))];
      console.log(`   Total de índices: ${indexNames.length}`);
      indexNames.forEach(name => {
        console.log(`   - ${name}`);
      });

      console.log('\n=== OTIMIZAÇÃO CONCLUÍDA COM SUCESSO ===');
      console.log('A tabela students deve agora responder mais rapidamente no DBeaver\n');

    } catch (error) {
      console.error('❌ Erro durante otimização:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('Revertendo otimizações...');

    // 1. Reverter tamanho de endereco_complemento
    await queryInterface.changeColumn('students', 'endereco_complemento', {
      type: Sequelize.STRING(2000),
      allowNull: true,
      comment: 'Complemento do endereço',
    });

    // 2. Remover índices criados
    try {
      await queryInterface.removeIndex('students', 'idx_students_nome_cpf');
    } catch (e) {
      console.log('Índice idx_students_nome_cpf não existe');
    }

    try {
      await queryInterface.removeIndex('students', 'idx_students_created_at');
    } catch (e) {
      console.log('Índice idx_students_created_at não existe');
    }

    console.log('Otimizações revertidas');
  },
};
