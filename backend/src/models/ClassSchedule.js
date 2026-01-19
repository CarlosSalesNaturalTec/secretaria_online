/**
 * Arquivo: src/models/ClassSchedule.js
 * Descrição: Model Sequelize para a tabela class_schedules (grade de horários das turmas)
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade ClassSchedule
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco (conflitos de horário, etc.)
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 * - Associações com Class, Discipline e Teacher
 */

'use strict';

const { Model, Op } = require('sequelize');

/**
 * Mapeamento de dias da semana
 */
const DAY_NAMES = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  7: 'Domingo'
};

module.exports = (sequelize, DataTypes) => {
  /**
   * Model ClassSchedule
   * Representa um horário na grade de uma turma
   */
  class ClassSchedule extends Model {
    /**
     * Define associações entre models
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Class
       * Um horário pertence a uma turma
       */
      ClassSchedule.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      /**
       * Associação N:1 com Discipline
       * Um horário está associado a uma disciplina
       */
      ClassSchedule.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação N:1 com Teacher
       * Um horário pode ter um professor (opcional)
       */
      ClassSchedule.belongsTo(models.Teacher, {
        foreignKey: 'teacher_id',
        as: 'teacher',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    /**
     * Método de instância: retorna horário formatado
     *
     * @returns {string} Formato: "08:00 - 10:00"
     */
    getFormattedTime() {
      const startTime = this.start_time ? this.start_time.substring(0, 5) : '';
      const endTime = this.end_time ? this.end_time.substring(0, 5) : '';
      return `${startTime} - ${endTime}`;
    }

    /**
     * Método de instância: retorna nome do dia da semana
     *
     * @returns {string} Nome do dia (ex: "Segunda-feira")
     */
    getDayName() {
      return DAY_NAMES[this.day_of_week] || '';
    }

    /**
     * Método de instância: verifica se possui link de aula online
     *
     * @returns {boolean} True se possui link online
     */
    hasOnlineLink() {
      return !!this.online_link && this.online_link.trim() !== '';
    }

    /**
     * Método de instância: verifica se o horário está ativo
     *
     * @returns {boolean} True se não está deletado
     */
    isActive() {
      return this.deleted_at === null;
    }

    /**
     * Método estático: buscar horários por turma
     *
     * @param {number} classId - ID da turma
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de horários
     */
    static async findByClass(classId, options = {}) {
      return await this.findAll({
        where: { class_id: classId },
        order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
        ...options
      });
    }

    /**
     * Método estático: buscar horários por dia da semana
     *
     * @param {number} classId - ID da turma
     * @param {number} dayOfWeek - Dia da semana (1-7)
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de horários
     */
    static async findByDayOfWeek(classId, dayOfWeek, options = {}) {
      return await this.findAll({
        where: { class_id: classId, day_of_week: dayOfWeek },
        order: [['start_time', 'ASC']],
        ...options
      });
    }

    /**
     * Método estático: validar conflito de horário
     * Verifica se há sobreposição de horários na mesma turma e dia
     *
     * @param {number} classId - ID da turma
     * @param {number} dayOfWeek - Dia da semana
     * @param {string} startTime - Horário de início (HH:MM:SS)
     * @param {string} endTime - Horário de término (HH:MM:SS)
     * @param {number|null} excludeId - ID do horário a excluir da verificação (para updates)
     * @returns {Promise<boolean>} True se há conflito
     */
    static async validateTimeConflict(classId, dayOfWeek, startTime, endTime, excludeId = null) {
      const whereClause = {
        class_id: classId,
        day_of_week: dayOfWeek,
        deleted_at: null,
        // Verifica sobreposição: (start1 < end2 AND start2 < end1)
        [Op.and]: [
          { start_time: { [Op.lt]: endTime } },
          { end_time: { [Op.gt]: startTime } }
        ]
      };

      // Excluir o próprio registro da verificação (para updates)
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const conflictingSchedule = await this.findOne({ where: whereClause });
      return !!conflictingSchedule;
    }

    /**
     * Método estático: obter grade da semana organizada
     *
     * @param {number} classId - ID da turma
     * @returns {Promise<Object>} Objeto com horários por dia { 1: [...], 2: [...], ... }
     */
    static async getWeekSchedule(classId) {
      const schedules = await this.findByClass(classId, {
        include: [
          { association: 'discipline', attributes: ['id', 'name', 'code'] },
          { association: 'teacher', attributes: ['id', 'nome', 'email'] }
        ]
      });

      // Organizar por dia da semana
      const weekSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
      schedules.forEach(schedule => {
        if (weekSchedule[schedule.day_of_week]) {
          weekSchedule[schedule.day_of_week].push(schedule);
        }
      });

      return weekSchedule;
    }
  }

  ClassSchedule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do horário'
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        validate: {
          notNull: { msg: 'A turma é obrigatória' },
          notEmpty: { msg: 'A turma é obrigatória' },
          isInt: { msg: 'O ID da turma deve ser um número inteiro' }
        },
        comment: 'Turma associada ao horário'
      },
      discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplines',
          key: 'id'
        },
        validate: {
          notNull: { msg: 'A disciplina é obrigatória' },
          notEmpty: { msg: 'A disciplina é obrigatória' },
          isInt: { msg: 'O ID da disciplina deve ser um número inteiro' }
        },
        comment: 'Disciplina ministrada neste horário'
      },
      teacher_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'teachers',
          key: 'id'
        },
        validate: {
          isInt: { msg: 'O ID do professor deve ser um número inteiro' }
        },
        comment: 'Professor que ministra a aula (opcional)'
      },
      day_of_week: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'O dia da semana é obrigatório' },
          isInt: { msg: 'O dia da semana deve ser um número inteiro' },
          min: { args: [1], msg: 'O dia da semana deve ser entre 1 (Segunda) e 7 (Domingo)' },
          max: { args: [7], msg: 'O dia da semana deve ser entre 1 (Segunda) e 7 (Domingo)' }
        },
        comment: 'Dia da semana: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo'
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notNull: { msg: 'O horário de início é obrigatório' },
          notEmpty: { msg: 'O horário de início é obrigatório' }
        },
        comment: 'Horário de início da aula (formato HH:MM:SS)'
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notNull: { msg: 'O horário de término é obrigatório' },
          notEmpty: { msg: 'O horário de término é obrigatório' },
          isAfterStartTime(value) {
            if (this.start_time && value <= this.start_time) {
              throw new Error('O horário de término deve ser maior que o horário de início');
            }
          }
        },
        comment: 'Horário de término da aula (formato HH:MM:SS)'
      },
      online_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: { msg: 'O link online deve ser uma URL válida' }
        },
        comment: 'URL da aula online (Google Meet, Zoom, Teams, etc)'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: 'Data e hora de criação do registro'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: 'Data e hora da última atualização'
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'deleted_at',
        comment: 'Data e hora da exclusão lógica (soft delete)'
      }
    },
    {
      sequelize,
      modelName: 'ClassSchedule',
      tableName: 'class_schedules',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: 'Tabela de grade de horários - armazena os horários de aulas das turmas',

      indexes: [
        { name: 'idx_class_schedules_class_id', fields: ['class_id'] },
        { name: 'idx_class_schedules_discipline_id', fields: ['discipline_id'] },
        { name: 'idx_class_schedules_teacher_id', fields: ['teacher_id'] },
        { name: 'idx_class_schedules_day_of_week', fields: ['day_of_week'] },
        { name: 'idx_class_schedules_class_day', fields: ['class_id', 'day_of_week'] },
        { name: 'idx_class_schedules_deleted_at', fields: ['deleted_at'] },
        {
          name: 'idx_class_schedules_unique',
          unique: true,
          fields: ['class_id', 'discipline_id', 'day_of_week', 'start_time'],
          where: { deleted_at: null }
        }
      ],

      scopes: {
        /**
         * Scope: active
         * Retorna apenas horários não deletados
         */
        active: {
          where: { deleted_at: null }
        },

        /**
         * Scope: withRelations
         * Inclui class, discipline e teacher nas consultas
         */
        withRelations: {
          include: [
            { association: 'class', attributes: ['id', 'course_id', 'semester', 'year'] },
            { association: 'discipline', attributes: ['id', 'name', 'code'] },
            { association: 'teacher', attributes: ['id', 'nome', 'email'] }
          ]
        },

        /**
         * Scope: byDay
         * Ordenar por day_of_week e start_time
         */
        byDay: {
          order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
        }
      },

      hooks: {
        /**
         * Hook: beforeValidate
         * Normaliza valores antes da validação
         */
        beforeValidate: (schedule, options) => {
          if (schedule.class_id) {
            schedule.class_id = parseInt(schedule.class_id, 10);
          }
          if (schedule.discipline_id) {
            schedule.discipline_id = parseInt(schedule.discipline_id, 10);
          }
          if (schedule.teacher_id && schedule.teacher_id !== null) {
            schedule.teacher_id = parseInt(schedule.teacher_id, 10);
          }
          if (schedule.day_of_week) {
            schedule.day_of_week = parseInt(schedule.day_of_week, 10);
          }
          // Limpar link online vazio
          if (schedule.online_link === '') {
            schedule.online_link = null;
          }
        },

        /**
         * Hook: beforeCreate
         * Valida conflitos de horário antes de criar
         */
        beforeCreate: async (schedule, options) => {
          const hasConflict = await ClassSchedule.validateTimeConflict(
            schedule.class_id,
            schedule.day_of_week,
            schedule.start_time,
            schedule.end_time
          );

          if (hasConflict) {
            throw new Error('Conflito de horário: já existe uma aula neste horário para esta turma');
          }

          console.log(`[ClassSchedule] Criando horário: ${DAY_NAMES[schedule.day_of_week]} ${schedule.start_time}-${schedule.end_time}`);
        },

        /**
         * Hook: beforeUpdate
         * Valida conflitos de horário antes de atualizar
         */
        beforeUpdate: async (schedule, options) => {
          // Só validar se houve mudança em campos relevantes
          const changedFields = schedule.changed();
          const relevantChanges = ['day_of_week', 'start_time', 'end_time', 'class_id'];
          const hasRelevantChanges = changedFields && relevantChanges.some(f => changedFields.includes(f));

          if (hasRelevantChanges) {
            const hasConflict = await ClassSchedule.validateTimeConflict(
              schedule.class_id,
              schedule.day_of_week,
              schedule.start_time,
              schedule.end_time,
              schedule.id // Excluir o próprio registro
            );

            if (hasConflict) {
              throw new Error('Conflito de horário: já existe uma aula neste horário para esta turma');
            }
          }

          console.log(`[ClassSchedule] Atualizando horário ID: ${schedule.id}`);
        },

        /**
         * Hook: afterCreate
         */
        afterCreate: (schedule, options) => {
          console.log(`[ClassSchedule] Horário criado com sucesso: ID ${schedule.id}`);
        },

        /**
         * Hook: beforeDestroy
         */
        beforeDestroy: (schedule, options) => {
          console.log(`[ClassSchedule] Deletando horário ID: ${schedule.id}`);
        }
      }
    }
  );

  // Exportar constante DAY_NAMES para uso externo
  ClassSchedule.DAY_NAMES = DAY_NAMES;

  return ClassSchedule;
};
