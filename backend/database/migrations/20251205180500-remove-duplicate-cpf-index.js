/**
 * Arquivo: backend/database/migrations/20251205180500-remove-duplicate-cpf-index.js
 * Descrição: Remove índice duplicado do CPF que está causando travamentos
 * Criado em: 2025-12-05
 *
 * PROBLEMA:
 * A tabela students tem dois índices únicos na coluna cpf:
 * 1. 'cpf' (criado automaticamente pelo Sequelize devido ao unique: true)
 * 2. 'idx_students_cpf' (criado manualmente na migration)
 *
 * Isso causa:
 * - Lentidão severa ao listar todos os registros
 * - Travamentos no DBeaver ao exportar dados
 * - Overhead desnecessário em INSERTs e UPDATEs
 *
 * SOLUÇÃO:
 * Remover o índice duplicado 'cpf' e manter apenas 'idx_students_cpf'
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Verificando e removendo índice duplicado do CPF...');

    try {
      // Verificar se o índice 'cpf' existe
      const [indexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM students WHERE Key_name = 'cpf'"
      );

      if (indexes.length > 0) {
        console.log('✓ Índice duplicado "cpf" encontrado, removendo...');

        // Remover índice duplicado
        await queryInterface.removeIndex('students', 'cpf');

        console.log('✓ Índice duplicado "cpf" removido com sucesso');
        console.log('✓ Mantendo apenas "idx_students_cpf" como índice único do CPF');
      } else {
        console.log('ℹ Índice duplicado "cpf" não existe, nada a fazer');
      }

      // Verificar se idx_students_cpf existe
      const [primaryIndex] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM students WHERE Key_name = 'idx_students_cpf'"
      );

      if (primaryIndex.length === 0) {
        console.log('⚠️  Índice principal "idx_students_cpf" não encontrado!');
        console.log('   Criando índice único do CPF...');

        await queryInterface.addIndex('students', ['cpf'], {
          name: 'idx_students_cpf',
          unique: true,
          comment: 'Índice único para garantir CPFs únicos e acelerar buscas por CPF',
        });

        console.log('✓ Índice "idx_students_cpf" criado com sucesso');
      } else {
        console.log('✓ Índice principal "idx_students_cpf" existe e está correto');
      }

    } catch (error) {
      console.error('❌ Erro ao remover índice duplicado:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('Revertendo remoção do índice duplicado...');

    // Nota: Não vamos recriar o índice duplicado na reversão
    // porque ele causava problemas. Se reverter, manteremos apenas idx_students_cpf
    console.log('ℹ Reversão não recria o índice duplicado (mantém apenas idx_students_cpf)');
  },
};
