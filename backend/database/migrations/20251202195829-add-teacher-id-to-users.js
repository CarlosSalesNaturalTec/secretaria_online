'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'teacher_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Referência opcional para tabela teachers',
    });

    // Adicionar índice para melhorar performance
    await queryInterface.addIndex('users', ['teacher_id'], {
      name: 'idx_users_teacher_id',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice primeiro
    await queryInterface.removeIndex('users', 'idx_users_teacher_id');

    // Remover coluna
    await queryInterface.removeColumn('users', 'teacher_id');
  },
};
