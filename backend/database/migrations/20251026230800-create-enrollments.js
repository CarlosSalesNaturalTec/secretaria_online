/**
 * Arquivo: backend/database/migrations/20251026230800-create-enrollments.js
 * Descrição: Migration para criação da tabela enrollments (matrículas de alunos em cursos)
 * Feature: feat-011 - Criar migration e model Enrollment
 * Criado em: 2025-10-26
 *
 * REGRAS DE NEGÓCIO:
 * - Um aluno pode estar matriculado em apenas um curso por vez
 * - Status: pending (aguardando confirmação), active (ativa), cancelled (cancelada)
 * - Matrícula fica "pending" até aprovação dos documentos obrigatórios
 * - Soft delete habilitado (deleted_at)
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enrollments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
        comment: 'Referência ao aluno (users.id com role=student)',
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
        comment: 'Curso em que o aluno está matriculado',
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status da matrícula: pending (aguardando docs), active (aprovada), cancelled (cancelada)',
      },
      enrollment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Data da matrícula',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Soft delete: se preenchido, registro está deletado',
      },
    });

    // Índice para student_id (consultas frequentes por aluno)
    await queryInterface.addIndex('enrollments', ['student_id'], {
      name: 'enrollments_student_id_idx',
    });

    // Índice para course_id (consultas por curso)
    await queryInterface.addIndex('enrollments', ['course_id'], {
      name: 'enrollments_course_id_idx',
    });

    // Índice para status (filtros por status)
    await queryInterface.addIndex('enrollments', ['status'], {
      name: 'enrollments_status_idx',
    });

    // Índice para enrollment_date (ordenação cronológica)
    await queryInterface.addIndex('enrollments', ['enrollment_date'], {
      name: 'enrollments_enrollment_date_idx',
    });

    // Índice único composto para garantir que um aluno tenha apenas UMA matrícula ativa/pending por vez
    // Ignora registros deletados (deleted_at IS NULL)
    await queryInterface.addIndex('enrollments', ['student_id', 'status'], {
      name: 'enrollments_student_active_unique',
      unique: true,
      where: {
        deleted_at: null,
        status: ['active', 'pending'], // Aplica a restrição apenas para matrículas ativas ou pendentes
      },
    });

    // Índice composto para consultas de matrículas ativas
    await queryInterface.addIndex('enrollments', ['student_id', 'course_id', 'deleted_at'], {
      name: 'enrollments_student_course_active_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove índices
    await queryInterface.removeIndex('enrollments', 'enrollments_student_id_idx');
    await queryInterface.removeIndex('enrollments', 'enrollments_course_id_idx');
    await queryInterface.removeIndex('enrollments', 'enrollments_status_idx');
    await queryInterface.removeIndex('enrollments', 'enrollments_enrollment_date_idx');
    await queryInterface.removeIndex('enrollments', 'enrollments_student_active_unique');
    await queryInterface.removeIndex('enrollments', 'enrollments_student_course_active_idx');

    // Remove tabela
    await queryInterface.dropTable('enrollments');
  },
};
