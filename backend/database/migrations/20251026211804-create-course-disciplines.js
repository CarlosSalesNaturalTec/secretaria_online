/**
 * Arquivo: backend/database/migrations/20251026211804-create-course-disciplines.js
 * Descrição: Migration para criar tabela pivot course_disciplines (relação N:N entre courses e disciplines)
 * Feature: feat-009 - Criar migration course_disciplines (relação N:N)
 * Criado em: 2025-10-26
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Cria a tabela course_disciplines para relacionar cursos e disciplinas
   * Permite que uma disciplina seja oferecida em múltiplos semestres de um curso
   *
   * @param {QueryInterface} queryInterface - Interface de queries do Sequelize
   * @param {Sequelize} Sequelize - Instância do Sequelize
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('course_disciplines', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do relacionamento curso-disciplina',
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Impede exclusão de curso se houver disciplinas vinculadas
        comment: 'Chave estrangeira referenciando o curso',
      },
      discipline_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplines',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Impede exclusão de disciplina se estiver vinculada a curso
        comment: 'Chave estrangeira referenciando a disciplina',
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12, // Suporta até 12 semestres (6 anos)
        },
        comment: 'Semestre em que a disciplina é oferecida no curso (1-12)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data de criação do registro',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Data da última atualização do registro',
      },
    });

    // Índice composto único: Uma disciplina não pode ser oferecida mais de uma vez no mesmo semestre do mesmo curso
    await queryInterface.addIndex('course_disciplines', ['course_id', 'discipline_id', 'semester'], {
      unique: true,
      name: 'unique_course_discipline_semester',
    });

    // Índice para otimizar consultas de disciplinas por curso
    await queryInterface.addIndex('course_disciplines', ['course_id'], {
      name: 'idx_course_disciplines_course_id',
    });

    // Índice para otimizar consultas de cursos por disciplina
    await queryInterface.addIndex('course_disciplines', ['discipline_id'], {
      name: 'idx_course_disciplines_discipline_id',
    });

    // Índice para consultas filtradas por semestre
    await queryInterface.addIndex('course_disciplines', ['semester'], {
      name: 'idx_course_disciplines_semester',
    });
  },

  /**
   * Reverte a criação da tabela course_disciplines
   *
   * @param {QueryInterface} queryInterface - Interface de queries do Sequelize
   * @param {Sequelize} Sequelize - Instância do Sequelize
   */
  async down(queryInterface, Sequelize) {
    // Remove índices primeiro
    await queryInterface.removeIndex('course_disciplines', 'unique_course_discipline_semester');
    await queryInterface.removeIndex('course_disciplines', 'idx_course_disciplines_course_id');
    await queryInterface.removeIndex('course_disciplines', 'idx_course_disciplines_discipline_id');
    await queryInterface.removeIndex('course_disciplines', 'idx_course_disciplines_semester');

    // Remove a tabela
    await queryInterface.dropTable('course_disciplines');
  },
};
