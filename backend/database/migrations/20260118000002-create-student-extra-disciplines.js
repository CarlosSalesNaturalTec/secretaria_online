/**
 * Arquivo: backend/database/migrations/20260118000002-create-student-extra-disciplines.js
 * Descrição: Migration para criação da tabela student_extra_disciplines (disciplinas extras de alunos)
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 */

'use strict';

module.exports = {
  /**
   * Executa a migration - cria a tabela student_extra_disciplines
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_extra_disciplines', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da disciplina extra'
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
        comment: 'Aluno matriculado na disciplina extra'
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
        comment: 'Disciplina extra/avulsa'
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
        comment: 'Turma de origem onde a disciplina extra está sendo oferecida (opcional)'
      },
      enrollment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Data de matrícula na disciplina extra'
      },
      reason: {
        type: Sequelize.ENUM('dependency', 'recovery', 'advancement', 'other'),
        allowNull: false,
        defaultValue: 'dependency',
        comment: 'Motivo da disciplina extra: dependency=Dependência, recovery=Recuperação, advancement=Adiantamento, other=Outro'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações sobre a disciplina extra (opcional)'
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Status da disciplina extra: active=Ativa, completed=Concluída, cancelled=Cancelada'
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
      comment: 'Tabela de disciplinas extras - vincula disciplinas avulsas aos alunos (dependências, recuperações, etc)'
    });

    // Índice para otimizar buscas por aluno
    await queryInterface.addIndex('student_extra_disciplines', ['student_id'], {
      name: 'idx_student_extra_disciplines_student_id',
      using: 'BTREE'
    });

    // Índice para otimizar buscas por disciplina
    await queryInterface.addIndex('student_extra_disciplines', ['discipline_id'], {
      name: 'idx_student_extra_disciplines_discipline_id',
      using: 'BTREE'
    });

    // Índice para otimizar buscas por turma
    await queryInterface.addIndex('student_extra_disciplines', ['class_id'], {
      name: 'idx_student_extra_disciplines_class_id',
      using: 'BTREE'
    });

    // Índice para otimizar filtros por status
    await queryInterface.addIndex('student_extra_disciplines', ['status'], {
      name: 'idx_student_extra_disciplines_status',
      using: 'BTREE'
    });

    // Índice para otimizar filtros por motivo
    await queryInterface.addIndex('student_extra_disciplines', ['reason'], {
      name: 'idx_student_extra_disciplines_reason',
      using: 'BTREE'
    });

    // Índice para otimizar queries de soft delete
    await queryInterface.addIndex('student_extra_disciplines', ['deleted_at'], {
      name: 'idx_student_extra_disciplines_deleted_at',
      using: 'BTREE'
    });

    // Índice único para garantir que um aluno não tenha a mesma disciplina extra duplicada
    await queryInterface.addIndex('student_extra_disciplines', ['student_id', 'discipline_id'], {
      name: 'idx_student_extra_disciplines_unique',
      unique: true,
      where: {
        deleted_at: null
      }
    });

    // Índice composto para consultas de disciplinas extras ativas
    await queryInterface.addIndex('student_extra_disciplines', ['student_id', 'status', 'deleted_at'], {
      name: 'idx_student_extra_disciplines_active',
      using: 'BTREE'
    });
  },

  /**
   * Reverte a migration - remove a tabela student_extra_disciplines
   *
   * @param {QueryInterface} queryInterface - Interface do Sequelize para queries
   * @param {Sequelize} Sequelize - Objeto Sequelize com tipos de dados
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_extra_disciplines');
  }
};
