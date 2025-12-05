/**
 * Arquivo: backend/database/migrations/20251205181500-force-endereco-complemento-200.js
 * Descrição: Garante que endereco_complemento seja reduzido para 200 caracteres
 * Criado em: 2025-12-05
 *
 * Esta migration força a alteração do campo endereco_complemento para 200 caracteres,
 * mesmo que outra migration já tenha tentado alterar para 500.
 *
 * IMPORTANTE: Verifica se há valores com mais de 200 caracteres antes de truncar.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Verificando e ajustando endereco_complemento para 200 caracteres...\n');

    try {
      // 1. Verificar valores atuais maiores que 200 caracteres
      console.log('1. Verificando registros com endereco_complemento > 200 chars...');
      const [longValues] = await queryInterface.sequelize.query(`
        SELECT id, nome, LENGTH(endereco_complemento) as len
        FROM students
        WHERE LENGTH(endereco_complemento) > 200
        LIMIT 5
      `);

      if (longValues.length > 0) {
        console.log(`   ⚠️  Encontrados ${longValues.length} registros com valores > 200 chars:`);
        longValues.forEach(record => {
          console.log(`      ID ${record.id} (${record.nome}): ${record.len} chars`);
        });

        // Truncar valores antes de alterar coluna
        console.log('\n2. Truncando valores para 200 caracteres...');
        await queryInterface.sequelize.query(`
          UPDATE students
          SET endereco_complemento = LEFT(endereco_complemento, 200)
          WHERE LENGTH(endereco_complemento) > 200
        `);
        console.log('   ✓ Valores truncados\n');
      } else {
        console.log('   ✓ Nenhum valor excede 200 caracteres\n');
      }

      // 2. Alterar estrutura da coluna
      console.log('3. Alterando estrutura da coluna para VARCHAR(200)...');
      await queryInterface.changeColumn('students', 'endereco_complemento', {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Complemento do endereço (limitado a 200 chars)',
      });
      console.log('   ✓ Coluna alterada com sucesso\n');

      // 3. Verificar alteração
      const [columnInfo] = await queryInterface.sequelize.query(`
        SELECT COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'students'
          AND COLUMN_NAME = 'endereco_complemento'
      `);

      console.log(`4. Verificação final: ${columnInfo[0].COLUMN_TYPE}`);

      if (columnInfo[0].COLUMN_TYPE === 'varchar(200)') {
        console.log('   ✓ Alteração confirmada: endereco_complemento agora é VARCHAR(200)\n');
      } else {
        console.log(`   ⚠️  Tipo atual: ${columnInfo[0].COLUMN_TYPE}`);
      }

    } catch (error) {
      console.error('❌ Erro ao alterar endereco_complemento:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('Revertendo endereco_complemento para 2000 caracteres...');

    await queryInterface.changeColumn('students', 'endereco_complemento', {
      type: Sequelize.STRING(2000),
      allowNull: true,
      comment: 'Complemento do endereço',
    });

    console.log('✓ Revertido para VARCHAR(2000)');
  },
};
