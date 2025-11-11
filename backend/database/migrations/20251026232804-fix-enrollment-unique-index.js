/**
 * Arquivo: backend/database/migrations/20251026232804-fix-enrollment-unique-index.js
 * Descrição: Corrige índice único problemático em enrollments
 * Feature: feat-011 - Criar migration e model Enrollment
 * Criado em: 2025-10-26
 *
 * PROBLEMA IDENTIFICADO:
 * O índice único 'enrollments_student_active_unique' foi criado com a sintaxe:
 *
 *   UNIQUE (student_id, status) WHERE deleted_at IS NULL AND status IN ('active', 'pending')
 *
 * Porém, o MySQL NÃO suporta índices parciais com cláusula WHERE complexa.
 * O resultado foi um índice único SIMPLES em (student_id, status) que impede:
 * - Aluno ter 2 matrículas 'pending' (mesmo para cursos diferentes) ❌
 * - Aluno ter 2 matrículas 'active' ❌
 * - Aluno ter 2 matrículas 'cancelled' ❌
 *
 * SOLUÇÃO:
 * - Remover o índice único problemático
 * - Implementar validação no nível da aplicação (modelo Enrollment)
 * - Manter índices simples para performance
 *
 * REGRA DE NEGÓCIO (validada na aplicação):
 * - Um aluno pode ter apenas UMA matrícula com status 'active' OU 'pending' por vez
 * - Matrículas 'cancelled' não contam para essa restrição
 * - Matrículas deletadas (soft delete) não contam
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove o índice único problemático
    await queryInterface.removeIndex('enrollments', 'enrollments_student_active_unique');

    console.log('[Migration] Índice único problemático removido.');
    console.log('[Migration] Validação de unicidade agora é feita no modelo Enrollment.');
  },

  async down(queryInterface, Sequelize) {
    // Recriar o índice caso seja necessário reverter
    // NOTA: Este índice NÃO funciona como esperado no MySQL
    await queryInterface.addIndex('enrollments', ['student_id', 'status'], {
      name: 'enrollments_student_active_unique',
      unique: true,
    });

    console.log('[Migration Rollback] Índice único recriado (com limitações do MySQL).');
  },
};
