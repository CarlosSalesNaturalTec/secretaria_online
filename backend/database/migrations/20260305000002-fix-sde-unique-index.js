/**
 * Arquivo: backend/database/migrations/20260305000002-fix-sde-unique-index.js
 * Descrição: Remove índice único parcial (não suportado no MySQL) da tabela
 *            student_discipline_exemptions. A unicidade é garantida via service.
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove o índice único (se existir) - MySQL não suporta índices parciais com WHERE
    await queryInterface.sequelize.query(
      'ALTER TABLE `student_discipline_exemptions` DROP INDEX IF EXISTS `idx_sde_unique_student_discipline`'
    );

    // Adiciona índice composto simples (sem unicidade) para performance de queries
    // (só adiciona se ainda não existir)
    const [indexes] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `student_discipline_exemptions` WHERE Key_name = 'idx_sde_student_discipline'"
    );
    if (indexes.length === 0) {
      await queryInterface.addIndex(
        'student_discipline_exemptions',
        ['student_id', 'discipline_id'],
        { name: 'idx_sde_student_discipline', using: 'BTREE' }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'student_discipline_exemptions',
      'idx_sde_student_discipline'
    );

    await queryInterface.addIndex(
      'student_discipline_exemptions',
      ['student_id', 'discipline_id'],
      {
        name: 'idx_sde_unique_student_discipline',
        unique: true,
        where: { deleted_at: null }
      }
    );
  }
};
