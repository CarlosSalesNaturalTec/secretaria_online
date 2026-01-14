/**
 * Arquivo: src/models/ClassDisciplineSchedule.js
 * Descrição: Model Sequelize para a tabela class_discipline_schedules (horários das disciplinas da turma)
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 *
 * Responsabilidades:
 * - Definir estrutura e validações para horários de aulas
 * - Representa os horários das disciplinas vinculadas a turmas
 * - Implementar validações de horário
 *
 * @example
 * // Criar horário para uma disciplina na turma
 * const schedule = await ClassDisciplineSchedule.create({
 *   class_teacher_id: 1,
 *   day_of_week: 'segunda',
 *   start_time: '08:00:00',
 *   end_time: '10:00:00'
 * });
 *
 * // Buscar todos os horários de uma turma
 * const schedules = await ClassDisciplineSchedule.findAll({
 *   include: [{
 *     model: ClassTeacher,
 *     as: 'classTeacher',
 *     include: ['discipline', 'teacher', 'class']
 *   }]
 * });
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model ClassDisciplineSchedule
   * Representa os horários das disciplinas por turma
   */
  class ClassDisciplineSchedule extends Model {
    /**
     * Define associações entre models
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com ClassTeacher
       * Muitos horários podem estar associados a uma relação turma-professor-disciplina
       */
      ClassDisciplineSchedule.belongsTo(models.ClassTeacher, {
        foreignKey: 'class_teacher_id',
        as: 'classTeacher',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  }

  ClassDisciplineSchedule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único do horário'
      },
      class_teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'class_teachers',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O ID da relação turma-professor-disciplina é obrigatório'
          },
          isInt: {
            msg: 'O ID da relação turma-professor-disciplina deve ser um número inteiro'
          }
        },
        comment: 'ID da relação turma-professor-disciplina'
      },
      day_of_week: {
        type: DataTypes.ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O dia da semana é obrigatório'
          },
          isIn: {
            args: [['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']],
            msg: 'Dia da semana inválido'
          }
        },
        comment: 'Dia da semana da aula'
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O horário de início é obrigatório'
          },
          is: {
            args: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
            msg: 'Formato de horário inválido (use HH:MM ou HH:MM:SS)'
          }
        },
        comment: 'Horário de início da aula'
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O horário de término é obrigatório'
          },
          is: {
            args: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
            msg: 'Formato de horário inválido (use HH:MM ou HH:MM:SS)'
          }
        },
        comment: 'Horário de término da aula'
      }
    },
    {
      sequelize,
      modelName: 'ClassDisciplineSchedule',
      tableName: 'class_discipline_schedules',
      timestamps: true,
      paranoid: false, // Não usar soft delete
      underscored: true,
      comment: 'Tabela de horários das disciplinas por turma (grade de horários)',

      indexes: [
        {
          name: 'idx_class_discipline_schedules_class_teacher',
          fields: ['class_teacher_id']
        },
        {
          name: 'idx_class_discipline_schedules_unique',
          fields: ['class_teacher_id', 'day_of_week', 'start_time'],
          unique: true
        },
        {
          name: 'idx_class_discipline_schedules_day',
          fields: ['day_of_week']
        }
      ],

      hooks: {
        beforeValidate: (schedule, options) => {
          if (schedule.class_teacher_id) {
            schedule.class_teacher_id = parseInt(schedule.class_teacher_id, 10);
          }
        },

        beforeCreate: async (schedule, options) => {
          // Validar se end_time é maior que start_time
          if (schedule.start_time && schedule.end_time) {
            const start = schedule.start_time.split(':').map(Number);
            const end = schedule.end_time.split(':').map(Number);

            const startMinutes = start[0] * 60 + start[1];
            const endMinutes = end[0] * 60 + end[1];

            if (endMinutes <= startMinutes) {
              throw new Error('O horário de término deve ser maior que o horário de início');
            }
          }

          console.log(
            `[ClassDisciplineSchedule] Criando horário: ${schedule.day_of_week} ${schedule.start_time}-${schedule.end_time}`
          );
        },

        beforeUpdate: async (schedule, options) => {
          // Validar se end_time é maior que start_time
          if (schedule.start_time && schedule.end_time) {
            const start = schedule.start_time.split(':').map(Number);
            const end = schedule.end_time.split(':').map(Number);

            const startMinutes = start[0] * 60 + start[1];
            const endMinutes = end[0] * 60 + end[1];

            if (endMinutes <= startMinutes) {
              throw new Error('O horário de término deve ser maior que o horário de início');
            }
          }
        },

        afterCreate: (schedule, options) => {
          console.log(
            `[ClassDisciplineSchedule] Horário criado com sucesso: ID ${schedule.id}`
          );
        },

        beforeDestroy: (schedule, options) => {
          console.log(
            `[ClassDisciplineSchedule] Removendo horário ID ${schedule.id}`
          );
        }
      }
    }
  );

  return ClassDisciplineSchedule;
};
