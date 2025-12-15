/**
 * Arquivo: backend/database/migrations/20251215120001-allow-null-file-fields-in-contracts.js
 * Descrição: Migration para permitir file_path e file_name nullable na tabela contracts
 * Feature: Rematrícula Global - Etapa 2
 * Criado em: 2025-12-15
 *
 * Esta migration altera os campos file_path e file_name para permitir valores nulos.
 * Isso possibilita criar contratos de rematrícula sem PDF (apenas registro de aceite digital).
 * Contratos antigos (com PDF) permanecem inalterados.
 *
 * IMPORTANTE: Rollback pode falhar se existirem contratos com file_path/file_name NULL no banco.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Alterar file_path para permitir NULL
    await queryInterface.changeColumn('contracts', 'file_path', {
      type: Sequelize.STRING(255),
      allowNull: true, // ALTERADO de false para true
      comment: 'Caminho do arquivo PDF gerado (null para contratos de rematrícula sem PDF)',
    });

    // 2. Alterar file_name para permitir NULL
    await queryInterface.changeColumn('contracts', 'file_name', {
      type: Sequelize.STRING(255),
      allowNull: true, // ALTERADO de false para true
      comment: 'Nome original do arquivo PDF (null para contratos de rematrícula sem PDF)',
    });

    console.log('[Migration] ✅ Campos file_path e file_name agora permitem NULL');
    console.log('[Migration] ℹ️  Contratos de rematrícula podem ser criados sem PDF');
    console.log('[Migration] ℹ️  Contratos antigos com PDF permanecem inalterados');
  },

  async down(queryInterface, Sequelize) {
    // ATENÇÃO: Rollback pode falhar se existirem contratos com file_path/file_name NULL

    // Verificar se existem contratos com file_path NULL antes de reverter
    const contractsWithNullPath = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM contracts WHERE file_path IS NULL AND deleted_at IS NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const count = contractsWithNullPath[0].count;

    if (count > 0) {
      console.warn(
        `[Migration Rollback] ⚠️  AVISO: ${count} contrato(s) com file_path NULL encontrado(s)`
      );
      console.warn('[Migration Rollback] ⚠️  Rollback pode falhar devido à constraint NOT NULL');
      console.warn(
        '[Migration Rollback] ⚠️  Considere preencher file_path/file_name antes de reverter'
      );
    }

    // 1. Reverter file_path para NOT NULL
    await queryInterface.changeColumn('contracts', 'file_path', {
      type: Sequelize.STRING(255),
      allowNull: false, // REVERTIDO para false
      comment: 'Caminho do arquivo PDF gerado (ex: uploads/contracts/contract_123.pdf)',
    });

    // 2. Reverter file_name para NOT NULL
    await queryInterface.changeColumn('contracts', 'file_name', {
      type: Sequelize.STRING(255),
      allowNull: false, // REVERTIDO para false
      comment: 'Nome original do arquivo PDF',
    });

    console.log('[Migration Rollback] ✅ Campos file_path e file_name voltaram a ser NOT NULL');
  },
};
