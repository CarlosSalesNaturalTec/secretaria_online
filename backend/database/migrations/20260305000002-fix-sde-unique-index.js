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
    // Remove o índice único que o MySQL criou sem a cláusula WHERE (não suportada),
    // o que bloqueia re-inserção após soft delete.
    await queryInterface.removeIndex(
      'student_discipline_exemptions',
      'idx_sde_unique_student_discipline'
    );

    // Adiciona índice composto simples (sem unicidade) para performance de queries
    await queryInterface.addIndex(
      'student_discipline_exemptions',
      ['student_id', 'discipline_id'],
      { name: 'idx_sde_student_discipline', using: 'BTREE' }
    );
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
