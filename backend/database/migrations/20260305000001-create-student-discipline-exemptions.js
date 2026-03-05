/**
 * Arquivo: backend/database/migrations/20260305000001-create-student-discipline-exemptions.js
 * Descrição: Migration para criação da tabela student_discipline_exemptions (aproveitamento de disciplinas)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_discipline_exemptions', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do aproveitamento de disciplina'
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Aluno que recebeu a dispensa'
      },
      discipline_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplines',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Disciplina dispensada'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Turma à qual a dispensa se aplica (opcional)'
      },
      origin_institution: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Instituição de origem onde a disciplina foi cursada'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações sobre o aproveitamento'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora de criação do registro'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Data e hora da última atualização'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Data e hora da exclusão lógica (soft delete)'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Tabela de aproveitamentos de disciplinas - dispensa de disciplinas cursadas em outras instituições'
    });

    // Índice por aluno
    await queryInterface.addIndex('student_discipline_exemptions', ['student_id'], {
      name: 'idx_sde_student_id',
      using: 'BTREE'
    });

    // Índice por disciplina
    await queryInterface.addIndex('student_discipline_exemptions', ['discipline_id'], {
      name: 'idx_sde_discipline_id',
      using: 'BTREE'
    });

    // Índice por turma
    await queryInterface.addIndex('student_discipline_exemptions', ['class_id'], {
      name: 'idx_sde_class_id',
      using: 'BTREE'
    });

    // Índice composto para queries de aluno + disciplina (unicidade garantida no service)
    // NOTA: MySQL não suporta índices parciais (WHERE clause), então não usamos unique aqui.
    //       A validação de unicidade (sem deleted) é feita na camada de serviço.
    await queryInterface.addIndex('student_discipline_exemptions', ['student_id', 'discipline_id'], {
      name: 'idx_sde_student_discipline',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_discipline_exemptions');
  }
};
