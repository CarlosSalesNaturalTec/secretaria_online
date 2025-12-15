/**
 * Arquivo: backend/database/migrations/20251215120000-add-enrollment-id-to-contracts.js
 * Descrição: Migration para adicionar campo enrollment_id na tabela contracts
 * Feature: Rematrícula Global - Etapa 2
 * Criado em: 2025-12-15
 *
 * Esta migration adiciona o campo enrollment_id para vincular contratos a matrículas específicas.
 * Permite rastrear múltiplos contratos (renovações semestrais) para a mesma matrícula.
 * Campo é nullable para manter retrocompatibilidade com contratos existentes.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adicionar coluna enrollment_id (nullable para retrocompatibilidade)
    await queryInterface.addColumn('contracts', 'enrollment_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable para contratos antigos
      comment: 'ID da matrícula vinculada ao contrato (para contratos de rematrícula)',
      after: 'user_id', // Posicionar após user_id
    });

    // 2. Adicionar foreign key constraint
    await queryInterface.addConstraint('contracts', {
      fields: ['enrollment_id'],
      type: 'foreign key',
      name: 'fk_contracts_enrollment_id',
      references: {
        table: 'enrollments',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // Não permite deletar enrollment com contratos
    });

    // 3. Adicionar índice para performance em buscas por enrollment_id
    await queryInterface.addIndex('contracts', ['enrollment_id'], {
      name: 'idx_contracts_enrollment_id',
    });

    // 4. Adicionar índice composto para buscar contratos de enrollment em período específico
    await queryInterface.addIndex('contracts', ['enrollment_id', 'semester', 'year'], {
      name: 'idx_contracts_enrollment_period',
    });

    console.log('[Migration] ✅ Campo enrollment_id adicionado à tabela contracts');
    console.log('[Migration] ✅ Foreign key constraint adicionada');
    console.log('[Migration] ✅ Índices criados para performance');
  },

  async down(queryInterface, Sequelize) {
    // Reverter na ordem correta: constraint -> índices -> coluna

    // 1. Remover índice composto
    await queryInterface.removeIndex('contracts', 'idx_contracts_enrollment_period');

    // 2. Remover foreign key constraint (ANTES de remover o índice usado pela FK)
    await queryInterface.removeConstraint('contracts', 'fk_contracts_enrollment_id');

    // 3. Remover índice simples (APÓS remover a FK)
    await queryInterface.removeIndex('contracts', 'idx_contracts_enrollment_id');

    // 4. Remover coluna
    await queryInterface.removeColumn('contracts', 'enrollment_id');

    console.log('[Migration Rollback] ✅ Campo enrollment_id removido da tabela contracts');
  },
};
