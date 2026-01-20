/**
 * Arquivo: src/models/StudentExtraDiscipline.js
 * Descrição: Model Sequelize para a tabela student_extra_disciplines (disciplinas extras de alunos)
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade StudentExtraDiscipline
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 * - Associações com Student, Discipline e Class
 */

'use strict';

const { Model, Op } = require('sequelize');

/**
 * Labels para os motivos de disciplina extra
 */
const REASON_LABELS = {
  dependency: 'Dependência',
  recovery: 'Recuperação',
  advancement: 'Adiantamento',
  other: 'Outro'
};

/**
 * Labels para os status de disciplina extra
 */
const STATUS_LABELS = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada'
};

module.exports = (sequelize, DataTypes) => {
  /**
   * Model StudentExtraDiscipline
   * Representa uma disciplina extra vinculada a um aluno
   */
  class StudentExtraDiscipline extends Model {
    /**
     * Define associações entre models
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Student
       * Uma disciplina extra pertence a um aluno
       */
      StudentExtraDiscipline.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      /**
       * Associação N:1 com Discipline
       * Uma disciplina extra referencia uma disciplina
       */
      StudentExtraDiscipline.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação N:1 com Class
       * Uma disciplina extra pode ter uma turma de origem (opcional)
       */
      StudentExtraDiscipline.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    /**
     * Método de instância: verifica se está ativa
     *
     * @returns {boolean} True se status é 'active'
     */
    isActive() {
      return this.status === 'active' && this.deleted_at === null;
    }

    /**
     * Método de instância: retorna label do motivo
     *
     * @returns {string} Label traduzida do motivo
     */
    getReasonLabel() {
      return REASON_LABELS[this.reason] || this.reason;
    }

    /**
     * Método de instância: retorna label do status
     *
     * @returns {string} Label traduzida do status
     */
    getStatusLabel() {
      return STATUS_LABELS[this.status] || this.status;
    }

    /**
     * Método de instância: retorna horário formatado
     *
     * @returns {string} Formato: "08:00 - 10:00" ou string vazia se não houver horário
     */
    getFormattedTime() {
      if (!this.start_time || !this.end_time) {
        return '';
      }
      const startTime = this.start_time.substring(0, 5);
      const endTime = this.end_time.substring(0, 5);
      return `${startTime} - ${endTime}`;
    }

    /**
     * Método de instância: retorna nome do dia da semana
     *
     * @returns {string} Nome do dia (ex: "Segunda-feira") ou string vazia
     */
    getDayName() {
      if (!this.day_of_week) {
        return '';
      }
      const DAY_NAMES = {
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado',
        7: 'Domingo'
      };
      return DAY_NAMES[this.day_of_week] || '';
    }

    /**
     * Método de instância: verifica se possui horário definido
     *
     * @returns {boolean} True se possui dia, hora início e fim
     */
    hasSchedule() {
      return !!(this.day_of_week && this.start_time && this.end_time);
    }

    /**
     * Método de instância: verifica se possui link de aula online
     *
     * @returns {boolean} True se possui link online
     */
    hasOnlineLink() {
      return !!(this.online_link && this.online_link.trim() !== '');
    }

    /**
     * Método estático: buscar disciplinas extras por aluno
     *
     * @param {number} studentId - ID do aluno
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de disciplinas extras
     */
    static async findByStudent(studentId, options = {}) {
      return await this.findAll({
        where: { student_id: studentId },
        order: [['enrollment_date', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: buscar disciplinas extras ativas por aluno
     *
     * @param {number} studentId - ID do aluno
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de disciplinas extras ativas
     */
    static async findActiveByStudent(studentId, options = {}) {
      return await this.findAll({
        where: {
          student_id: studentId,
          status: 'active',
          deleted_at: null
        },
        order: [['enrollment_date', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: buscar alunos matriculados em uma disciplina extra
     *
     * @param {number} disciplineId - ID da disciplina
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de registros
     */
    static async findByDiscipline(disciplineId, options = {}) {
      return await this.findAll({
        where: { discipline_id: disciplineId },
        ...options
      });
    }

    /**
     * Método estático: verificar se disciplina está na turma principal do aluno
     *
     * @param {number} studentId - ID do aluno
     * @param {number} disciplineId - ID da disciplina
     * @returns {Promise<boolean>} True se disciplina está na turma principal
     */
    static async isDisciplineInMainClass(studentId, disciplineId) {
      const { ClassStudent, ClassTeacher } = sequelize.models;

      // Buscar turmas do aluno
      const studentClasses = await ClassStudent.findAll({
        where: { student_id: studentId },
        attributes: ['class_id']
      });

      if (!studentClasses.length) {
        return false;
      }

      const classIds = studentClasses.map(sc => sc.class_id);

      // Verificar se alguma turma tem a disciplina
      const classTeacher = await ClassTeacher.findOne({
        where: {
          class_id: { [Op.in]: classIds },
          discipline_id: disciplineId
        }
      });

      return !!classTeacher;
    }

    /**
     * Método estático: verificar se aluno já tem a disciplina extra
     *
     * @param {number} studentId - ID do aluno
     * @param {number} disciplineId - ID da disciplina
     * @param {number|null} excludeId - ID a excluir (para updates)
     * @returns {Promise<boolean>} True se já existe
     */
    static async hasExtraDiscipline(studentId, disciplineId, excludeId = null) {
      const whereClause = {
        student_id: studentId,
        discipline_id: disciplineId,
        deleted_at: null
      };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const existing = await this.findOne({ where: whereClause });
      return !!existing;
    }
  }

  StudentExtraDiscipline.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da disciplina extra'
      },
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        validate: {
          notNull: { msg: 'O aluno é obrigatório' },
          notEmpty: { msg: 'O aluno é obrigatório' },
          isInt: { msg: 'O ID do aluno deve ser um número inteiro' }
        },
        comment: 'Aluno matriculado na disciplina extra'
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
        comment: 'Disciplina extra/avulsa'
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id'
        },
        validate: {
          isInt: { msg: 'O ID da turma deve ser um número inteiro' }
        },
        comment: 'Turma de origem onde a disciplina extra está sendo oferecida (opcional)'
      },
      enrollment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: { msg: 'A data de matrícula é obrigatória' },
          notEmpty: { msg: 'A data de matrícula é obrigatória' },
          isDate: { msg: 'A data de matrícula deve ser uma data válida' }
        },
        comment: 'Data de matrícula na disciplina extra'
      },
      reason: {
        type: DataTypes.ENUM('dependency', 'recovery', 'advancement', 'other'),
        allowNull: false,
        defaultValue: 'dependency',
        validate: {
          isIn: {
            args: [['dependency', 'recovery', 'advancement', 'other']],
            msg: 'O motivo deve ser: dependency, recovery, advancement ou other'
          }
        },
        comment: 'Motivo da disciplina extra: dependency=Dependência, recovery=Recuperação, advancement=Adiantamento, other=Outro'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre a disciplina extra (opcional)'
      },
      status: {
        type: DataTypes.ENUM('active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'completed', 'cancelled']],
            msg: 'O status deve ser: active, completed ou cancelled'
          }
        },
        comment: 'Status da disciplina extra: active=Ativa, completed=Concluída, cancelled=Cancelada'
      },
      day_of_week: {
        type: DataTypes.TINYINT,
        allowNull: true,
        validate: {
          isInt: { msg: 'O dia da semana deve ser um número inteiro' },
          min: { args: [1], msg: 'O dia da semana deve ser entre 1 (Segunda) e 7 (Domingo)' },
          max: { args: [7], msg: 'O dia da semana deve ser entre 1 (Segunda) e 7 (Domingo)' }
        },
        comment: 'Dia da semana: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo'
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Horário de início da aula (formato HH:MM:SS)'
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: true,
        validate: {
          isAfterStartTime(value) {
            if (this.start_time && value && value <= this.start_time) {
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
        comment: 'URL da aula online (Google Meet, Zoom, Teams, etc) - campo opcional'
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
      modelName: 'StudentExtraDiscipline',
      tableName: 'student_extra_disciplines',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: 'Tabela de disciplinas extras - vincula disciplinas avulsas aos alunos',

      indexes: [
        { name: 'idx_student_extra_disciplines_student_id', fields: ['student_id'] },
        { name: 'idx_student_extra_disciplines_discipline_id', fields: ['discipline_id'] },
        { name: 'idx_student_extra_disciplines_class_id', fields: ['class_id'] },
        { name: 'idx_student_extra_disciplines_status', fields: ['status'] },
        { name: 'idx_student_extra_disciplines_reason', fields: ['reason'] },
        { name: 'idx_student_extra_disciplines_deleted_at', fields: ['deleted_at'] },
        {
          name: 'idx_student_extra_disciplines_unique',
          unique: true,
          fields: ['student_id', 'discipline_id'],
          where: { deleted_at: null }
        },
        {
          name: 'idx_student_extra_disciplines_active',
          fields: ['student_id', 'status', 'deleted_at']
        }
      ],

      scopes: {
        /**
         * Scope: active
         * Retorna apenas disciplinas extras ativas e não deletadas
         */
        active: {
          where: {
            status: 'active',
            deleted_at: null
          }
        },

        /**
         * Scope: withRelations
         * Inclui student, discipline e class nas consultas
         */
        withRelations: {
          include: [
            { association: 'student', attributes: ['id', 'name', 'email', 'matricula'] },
            { association: 'discipline', attributes: ['id', 'name', 'code'] },
            { association: 'class', attributes: ['id', 'course_id', 'semester', 'year'] }
          ]
        },

        /**
         * Scope: byReason
         * Filtrar por motivo
         */
        byReason(reason) {
          return {
            where: { reason }
          };
        },

        /**
         * Scope: byStatus
         * Filtrar por status
         */
        byStatus(status) {
          return {
            where: { status }
          };
        }
      },

      hooks: {
        /**
         * Hook: beforeValidate
         * Normaliza valores antes da validação
         */
        beforeValidate: (extraDiscipline, options) => {
          if (extraDiscipline.student_id) {
            extraDiscipline.student_id = parseInt(extraDiscipline.student_id, 10);
          }
          if (extraDiscipline.discipline_id) {
            extraDiscipline.discipline_id = parseInt(extraDiscipline.discipline_id, 10);
          }
          if (extraDiscipline.class_id && extraDiscipline.class_id !== null) {
            extraDiscipline.class_id = parseInt(extraDiscipline.class_id, 10);
          }
          if (extraDiscipline.day_of_week && extraDiscipline.day_of_week !== null) {
            extraDiscipline.day_of_week = parseInt(extraDiscipline.day_of_week, 10);
          }
          // Limpar campos vazios
          if (extraDiscipline.notes === '') {
            extraDiscipline.notes = null;
          }
          if (extraDiscipline.online_link === '') {
            extraDiscipline.online_link = null;
          }
        },

        /**
         * Hook: beforeCreate
         * Validações antes de criar
         */
        beforeCreate: async (extraDiscipline, options) => {
          // Verificar se aluno já tem essa disciplina extra
          const hasExtra = await StudentExtraDiscipline.hasExtraDiscipline(
            extraDiscipline.student_id,
            extraDiscipline.discipline_id
          );

          if (hasExtra) {
            throw new Error('O aluno já possui esta disciplina extra cadastrada');
          }

          // Verificar se disciplina está na turma principal (aviso, não bloqueia)
          const isInMainClass = await StudentExtraDiscipline.isDisciplineInMainClass(
            extraDiscipline.student_id,
            extraDiscipline.discipline_id
          );

          if (isInMainClass) {
            console.warn(`[StudentExtraDiscipline] Aviso: Disciplina ${extraDiscipline.discipline_id} já está na turma principal do aluno ${extraDiscipline.student_id}`);
          }

          console.log(`[StudentExtraDiscipline] Criando disciplina extra: Aluno ${extraDiscipline.student_id}, Disciplina ${extraDiscipline.discipline_id}`);
        },

        /**
         * Hook: afterCreate
         */
        afterCreate: (extraDiscipline, options) => {
          console.log(`[StudentExtraDiscipline] Disciplina extra criada com sucesso: ID ${extraDiscipline.id}`);
        },

        /**
         * Hook: beforeUpdate
         */
        beforeUpdate: (extraDiscipline, options) => {
          console.log(`[StudentExtraDiscipline] Atualizando disciplina extra ID: ${extraDiscipline.id}`);
        },

        /**
         * Hook: beforeDestroy
         */
        beforeDestroy: (extraDiscipline, options) => {
          console.log(`[StudentExtraDiscipline] Deletando disciplina extra ID: ${extraDiscipline.id}`);
        }
      }
    }
  );

  // Exportar constantes para uso externo
  StudentExtraDiscipline.REASON_LABELS = REASON_LABELS;
  StudentExtraDiscipline.STATUS_LABELS = STATUS_LABELS;

  return StudentExtraDiscipline;
};
