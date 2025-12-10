/**
 * Arquivo: src/models/ClassStudent.js
 * Descrição: Model Sequelize para a tabela class_students (relação turma-aluno)
 * Feature: feat-010 - Criar migrations para Class e relacionamentos
 * Criado em: 2025-10-30
 * Atualizado em: 2025-12-10 - Corrigido FK para referenciar students ao invés de users
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade ClassStudent
 * - Representa o relacionamento N:N entre Class e Student
 * - Implementar validações de integridade referencial
 *
 * @example
 * // Adicionar aluno à turma
 * const association = await ClassStudent.create({
 *   class_id: 1,
 *   student_id: 5
 * });
 *
 * // Buscar todas as turmas de um aluno
 * const classes = await ClassStudent.findAll({
 *   where: { student_id: 5 },
 *   include: ['class', 'student']
 * });
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model ClassStudent
   * Tabela pivot para relacionamento N:N entre Class e Student
   */
  class ClassStudent extends Model {
    /**
     * Define associações entre models
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Class
       * Muitos alunos podem estar associados a uma turma
       */
      ClassStudent.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      /**
       * Associação N:1 com Student
       * Muitos registros podem estar associados a um aluno
       */
      ClassStudent.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }
  }

  ClassStudent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do relacionamento'
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O ID da turma é obrigatório'
          },
          isInt: {
            msg: 'O ID da turma deve ser um número inteiro'
          }
        },
        comment: 'ID da turma'
      },
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O ID do aluno é obrigatório'
          },
          isInt: {
            msg: 'O ID do aluno deve ser um número inteiro'
          }
        },
        comment: 'ID do aluno (referência à tabela students)'
      }
    },
    {
      sequelize,
      modelName: 'ClassStudent',
      tableName: 'class_students',
      timestamps: false,
      underscored: true,
      comment: 'Tabela pivot para relacionamento N:N entre turmas e alunos',

      indexes: [
        {
          name: 'idx_class_students_unique',
          fields: ['class_id', 'student_id'],
          unique: true
        },
        {
          name: 'idx_class_students_class_id',
          fields: ['class_id']
        },
        {
          name: 'idx_class_students_student_id',
          fields: ['student_id']
        }
      ],

      hooks: {
        beforeValidate: (classStudent, options) => {
          if (classStudent.class_id) {
            classStudent.class_id = parseInt(classStudent.class_id, 10);
          }
          if (classStudent.student_id) {
            classStudent.student_id = parseInt(classStudent.student_id, 10);
          }
        },

        beforeCreate: (classStudent, options) => {
          console.log(
            `[ClassStudent] Adicionando aluno ${classStudent.student_id} à turma ${classStudent.class_id}`
          );
        },

        afterCreate: (classStudent, options) => {
          console.log(
            `[ClassStudent] Associação criada com sucesso: ID ${classStudent.id}`
          );
        },

        beforeDestroy: (classStudent, options) => {
          console.log(
            `[ClassStudent] Removendo aluno ${classStudent.student_id} da turma ${classStudent.class_id}`
          );
        }
      }
    }
  );

  return ClassStudent;
};
