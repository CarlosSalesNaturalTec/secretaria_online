'use strict';

/**
 * Migration: Adicionar campos de PDF e hash de assinatura à tabela requests
 * Descrição: Adiciona pdf_path (caminho do PDF gerado) e signature_hash
 *            (hash de assinatura eletrônica de 16 chars) para atestados de matrícula
 * Feature: Atestado de Matrícula com Assinatura Eletrônica
 * Data: 2026-02-24
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna para o caminho do PDF gerado
    await queryInterface.addColumn('requests', 'pdf_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
      comment: 'Caminho relativo do PDF gerado (ex: uploads/atestados/atestado_1_1234.pdf)',
      after: 'observations',
    });

    // Adicionar coluna para o hash de assinatura eletrônica
    await queryInterface.addColumn('requests', 'signature_hash', {
      type: Sequelize.STRING(16),
      allowNull: true,
      defaultValue: null,
      unique: true,
      comment: 'Hash de assinatura eletrônica (16 chars hex) para validação pública do atestado',
      after: 'pdf_path',
    });

    // Índice único para buscas rápidas por hash
    await queryInterface.addIndex('requests', ['signature_hash'], {
      name: 'idx_requests_signature_hash',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('requests', 'idx_requests_signature_hash');
    await queryInterface.removeColumn('requests', 'signature_hash');
    await queryInterface.removeColumn('requests', 'pdf_path');
  },
};
