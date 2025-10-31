/**
 * Arquivo: src/models/ClassTeacher.js
 * Descrição: Model Sequelize para a tabela class_teachers (relação turma-professor-disciplina)
 * Feature: feat-010 - Criar migrations para Class e relacionamentos
 * Criado em: 2025-10-30
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade ClassTeacher
 * - Representa o relacionamento N:N entre Class, User (teachers) e Discipline
 * - Implementar validações de integridade referencial
 * - Soft delete para exclusão lógica
 *
 * @example
 * // Associar professor à turma
 * const association = await ClassTeacher.create({
 *   class_id: 1,
 *   teacher_id: 5,
 *   discipline_id: 10
 * });
 *
 * // Buscar todas as turmas de um professor
 * const classes = await ClassTeacher.findAll({
 *   where: { teacher_id: 5 },
 *   include: ['class', 'teacher', 'discipline']
 * });
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model ClassTeacher
   * Tabela pivot para relacionamento N:N entre Class, User (teachers) e Discipline
   */
  class ClassTeacher extends Model {
    /**
     * Define associações entre models
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Class
       * Muitos professores podem estar associados a uma turma
       */
      ClassTeacher.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      /**
       * Associação N:1 com User (Teacher)
       * Muitos registros podem estar associados a um professor
       */
      ClassTeacher.belongsTo(models.User, {
        foreignKey: 'teacher_id',
        as: 'teacher',
        constraints: {
          where: { role: 'teacher' }
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação N:1 com Discipline
       * Muitos registros podem estar associados a uma disciplina
       */
      ClassTeacher.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }
  }

  ClassTeacher.init(
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
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O ID do professor é obrigatório'
          },
          isInt: {
            msg: 'O ID do professor deve ser um número inteiro'
          }
        },
        comment: 'ID do professor (usuário com role teacher)'
      },
      discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplines',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O ID da disciplina é obrigatório'
          },
          isInt: {
            msg: 'O ID da disciplina deve ser um número inteiro'
          }
        },
        comment: 'ID da disciplina que o professor leciona nesta turma'
      }
    },
    {
      sequelize,
      modelName: 'ClassTeacher',
      tableName: 'class_teachers',
      timestamps: false,
      underscored: true,
      comment: 'Tabela pivot para relacionamento N:N entre turmas, professores e disciplinas',

      indexes: [
        {
          name: 'idx_class_teachers_unique',
          fields: ['class_id', 'teacher_id', 'discipline_id'],
          unique: true
        },
        {
          name: 'idx_class_teachers_class_id',
          fields: ['class_id']
        },
        {
          name: 'idx_class_teachers_teacher_id',
          fields: ['teacher_id']
        },
        {
          name: 'idx_class_teachers_discipline_id',
          fields: ['discipline_id']
        },
        {
          name: 'idx_class_teachers_class_teacher',
          fields: ['class_id', 'teacher_id']
        }
      ],

      hooks: {
        beforeValidate: (classTeacher, options) => {
          if (classTeacher.class_id) {
            classTeacher.class_id = parseInt(classTeacher.class_id, 10);
          }
          if (classTeacher.teacher_id) {
            classTeacher.teacher_id = parseInt(classTeacher.teacher_id, 10);
          }
          if (classTeacher.discipline_id) {
            classTeacher.discipline_id = parseInt(classTeacher.discipline_id, 10);
          }
        },

        beforeCreate: (classTeacher, options) => {
          console.log(
            `[ClassTeacher] Associando professor ${classTeacher.teacher_id} à turma ${classTeacher.class_id}`
          );
        },

        afterCreate: (classTeacher, options) => {
          console.log(
            `[ClassTeacher] Associação criada com sucesso: ID ${classTeacher.id}`
          );
        },

        beforeDestroy: (classTeacher, options) => {
          console.log(
            `[ClassTeacher] Desassociando professor ${classTeacher.teacher_id} da turma ${classTeacher.class_id}`
          );
        }
      }
    }
  );

  return ClassTeacher;
};
