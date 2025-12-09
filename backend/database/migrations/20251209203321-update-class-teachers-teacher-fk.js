/**
 * Arquivo: backend/database/migrations/20251209203321-update-class-teachers-teacher-fk.js
 * Descrição: Migration para alterar FK teacher_id de users para teachers
 * Feature: Ajuste de cadastro de turmas após separação da tabela teachers
 * Criado em: 2025-12-09
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remover a constraint antiga (FK para users)
    await queryInterface.removeConstraint(
      'class_teachers',
      'class_teachers_ibfk_2' // Nome padrão da constraint do MySQL
    );

    // 2. Modificar a coluna teacher_id para referenciar teachers
    await queryInterface.changeColumn('class_teachers', 'teacher_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'ID do professor (tabela teachers)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverter: remover constraint de teachers e voltar para users
    await queryInterface.removeConstraint(
      'class_teachers',
      'class_teachers_ibfk_2'
    );

    await queryInterface.changeColumn('class_teachers', 'teacher_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'ID do professor (usuário com role teacher)'
    });
  }
};
