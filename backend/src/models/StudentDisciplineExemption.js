/**
 * Arquivo: backend/src/models/StudentDisciplineExemption.js
 * Descrição: Model Sequelize para aproveitamento de disciplinas (dispensa)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentDisciplineExemption extends Model {
    static associate(models) {
      StudentDisciplineExemption.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student'
      });

      StudentDisciplineExemption.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline'
      });

      StudentDisciplineExemption.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class'
      });
    }

    /**
     * Método estático: lista todas as dispensas de um aluno
     * @param {number} studentId
     * @returns {Promise<Array>}
     */
    static async findByStudent(studentId) {
      return this.findAll({
        where: { student_id: studentId },
        order: [['created_at', 'DESC']]
      });
    }
  }

  StudentDisciplineExemption.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          notNull: { msg: 'O aluno é obrigatório' },
          isInt: { msg: 'O ID do aluno deve ser um número inteiro' }
        }
      },
      discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'A disciplina é obrigatória' },
          isInt: { msg: 'O ID da disciplina deve ser um número inteiro' }
        }
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: 'O ID da turma deve ser um número inteiro' }
        }
      },
      origin_institution: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      }
    },
    {
      sequelize,
      modelName: 'StudentDisciplineExemption',
      tableName: 'student_discipline_exemptions',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        { name: 'idx_sde_student_id', fields: ['student_id'] },
        { name: 'idx_sde_discipline_id', fields: ['discipline_id'] },
        { name: 'idx_sde_class_id', fields: ['class_id'] },
        {
          name: 'idx_sde_unique_student_discipline',
          unique: true,
          fields: ['student_id', 'discipline_id'],
          where: { deleted_at: null }
        }
      ]
    }
  );

  return StudentDisciplineExemption;
};
