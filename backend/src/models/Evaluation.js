/**
 * Arquivo: src/models/Evaluation.js
 * Descrição: Model Sequelize para a tabela evaluations (avaliações)
 * Feature: feat-014 - Criar migrations para Evaluation e Grade
 * Criado em: 2025-10-27
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Evaluation (Avaliação)
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 * - Associações com Class, Teacher (User), Discipline e Grades
 *
 * @example
 * // Criar nova avaliação
 * const evaluation = await Evaluation.create({
 *   class_id: 1,
 *   teacher_id: 2,
 *   discipline_id: 3,
 *   name: 'Prova 1',
 *   date: '2025-11-15',
 *   type: 'grade'
 * });
 *
 * // Buscar avaliações ativas de uma turma
 * const evaluations = await Evaluation.scope('active').findAll({
 *   where: { class_id: 1 }
 * });
 *
 * // Buscar avaliação com notas dos alunos
 * const evalWithGrades = await Evaluation.findByPk(1, {
 *   include: ['grades', 'class', 'teacher', 'discipline']
 * });
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model Evaluation
   * Representa uma avaliação (prova, trabalho, atividade) aplicada a uma turma
   */
  class Evaluation extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Class
       * Uma avaliação pertence a uma turma
       */
      Evaluation.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação N:1 com Teacher
       * Uma avaliação é criada por um professor
       */
      Evaluation.belongsTo(models.Teacher, {
        foreignKey: 'teacher_id',
        as: 'teacher',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação N:1 com Discipline
       * Uma avaliação pertence a uma disciplina
       */
      Evaluation.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação 1:N com Grade
       * Uma avaliação possui múltiplas notas (uma para cada aluno)
       */
      Evaluation.hasMany(models.Grade, {
        foreignKey: 'evaluation_id',
        as: 'grades',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    /**
     * Método auxiliar: verifica se a avaliação está ativa
     *
     * @returns {boolean} True se a avaliação está ativa (não deletada)
     */
    isActive() {
      return this.deleted_at === null;
    }

    /**
     * Método auxiliar: verifica se a avaliação é por nota numérica
     *
     * @returns {boolean} True se type === 'grade'
     */
    isGradeType() {
      return this.type === 'grade';
    }

    /**
     * Método auxiliar: verifica se a avaliação é por conceito
     *
     * @returns {boolean} True se type === 'concept'
     */
    isConceptType() {
      return this.type === 'concept';
    }

    /**
     * Método auxiliar: retorna o label do tipo de avaliação
     *
     * @returns {string} "Nota (0-10)" ou "Conceito"
     */
    getTypeLabel() {
      return this.type === 'grade' ? 'Nota (0-10)' : 'Conceito';
    }

    /**
     * Método auxiliar: verifica se a avaliação já ocorreu
     *
     * @returns {boolean} True se a data da avaliação já passou
     */
    isPast() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evalDate = new Date(this.date);
      evalDate.setHours(0, 0, 0, 0);
      return evalDate < today;
    }

    /**
     * Método auxiliar: verifica se a avaliação é futura
     *
     * @returns {boolean} True se a data da avaliação ainda não chegou
     */
    isFuture() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evalDate = new Date(this.date);
      evalDate.setHours(0, 0, 0, 0);
      return evalDate > today;
    }

    /**
     * Método auxiliar: retorna a data formatada (DD/MM/YYYY)
     *
     * @returns {string} Data formatada
     */
    getFormattedDate() {
      const date = new Date(this.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    /**
     * Método estático: busca avaliações por turma
     *
     * @param {number} classId - ID da turma
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de avaliações da turma
     */
    static async findByClass(classId, options = {}) {
      return await this.findAll({
        where: { class_id: classId },
        order: [['date', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: busca avaliações por professor
     *
     * @param {number} teacherId - ID do professor
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de avaliações do professor
     */
    static async findByTeacher(teacherId, options = {}) {
      return await this.findAll({
        where: { teacher_id: teacherId },
        order: [['date', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: busca avaliações por disciplina
     *
     * @param {number} disciplineId - ID da disciplina
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de avaliações da disciplina
     */
    static async findByDiscipline(disciplineId, options = {}) {
      return await this.findAll({
        where: { discipline_id: disciplineId },
        order: [['date', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: busca avaliações futuras de uma turma
     *
     * @param {number} classId - ID da turma
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de avaliações futuras
     */
    static async findUpcomingByClass(classId, options = {}) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await this.findAll({
        where: {
          class_id: classId,
          date: {
            [sequelize.Sequelize.Op.gte]: today
          }
        },
        order: [['date', 'ASC']],
        ...options
      });
    }

    /**
     * Método estático: conta avaliações de uma turma
     *
     * @param {number} classId - ID da turma
     * @returns {Promise<number>} Quantidade de avaliações
     */
    static async countByClass(classId) {
      return await this.count({
        where: { class_id: classId }
      });
    }

    /**
     * Método estático: conta avaliações de um professor
     *
     * @param {number} teacherId - ID do professor
     * @returns {Promise<number>} Quantidade de avaliações
     */
    static async countByTeacher(teacherId) {
      return await this.count({
        where: { teacher_id: teacherId }
      });
    }
  }

  Evaluation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único da avaliação'
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
            msg: 'A turma é obrigatória'
          },
          notEmpty: {
            msg: 'A turma é obrigatória'
          },
          isInt: {
            msg: 'O ID da turma deve ser um número inteiro'
          }
        },
        comment: 'ID da turma à qual a avaliação pertence'
      },
      teacher_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O professor é obrigatório'
          },
          notEmpty: {
            msg: 'O professor é obrigatório'
          },
          isInt: {
            msg: 'O ID do professor deve ser um número inteiro'
          }
        },
        comment: 'ID do professor que criou a avaliação'
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
            msg: 'A disciplina é obrigatória'
          },
          notEmpty: {
            msg: 'A disciplina é obrigatória'
          },
          isInt: {
            msg: 'O ID da disciplina deve ser um número inteiro'
          }
        },
        comment: 'ID da disciplina avaliada'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O nome da avaliação é obrigatório'
          },
          notEmpty: {
            msg: 'O nome da avaliação é obrigatório'
          },
          len: {
            args: [3, 100],
            msg: 'O nome deve ter entre 3 e 100 caracteres'
          }
        },
        comment: 'Nome da avaliação (ex: Prova 1, Trabalho Final, etc.)'
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'A data da avaliação é obrigatória'
          },
          notEmpty: {
            msg: 'A data da avaliação é obrigatória'
          },
          isDate: {
            msg: 'A data deve ser válida'
          }
        },
        comment: 'Data da avaliação'
      },
      type: {
        type: DataTypes.ENUM('grade', 'concept'),
        allowNull: false,
        defaultValue: 'grade',
        validate: {
          notNull: {
            msg: 'O tipo de avaliação é obrigatório'
          },
          notEmpty: {
            msg: 'O tipo de avaliação é obrigatório'
          },
          isIn: {
            args: [['grade', 'concept']],
            msg: 'O tipo deve ser "grade" ou "concept"'
          }
        },
        comment: 'Tipo de avaliação: grade (nota 0-10) ou concept (satisfatório/não satisfatório)'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: 'Data de criação do registro'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: 'Data da última atualização do registro'
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'deleted_at',
        comment: 'Data de exclusão lógica (soft delete)'
      }
    },
    {
      sequelize,
      modelName: 'Evaluation',
      tableName: 'evaluations',
      timestamps: true,
      paranoid: true, // Habilita soft delete
      underscored: true, // Usa snake_case para colunas
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: 'Tabela de avaliações - provas, trabalhos e atividades avaliativas',

      // Índices (já criados na migration, mas declarados aqui para referência)
      indexes: [
        {
          name: 'idx_evaluations_class_id',
          fields: ['class_id']
        },
        {
          name: 'idx_evaluations_teacher_id',
          fields: ['teacher_id']
        },
        {
          name: 'idx_evaluations_discipline_id',
          fields: ['discipline_id']
        },
        {
          name: 'idx_evaluations_date',
          fields: ['date']
        },
        {
          name: 'idx_evaluations_type',
          fields: ['type']
        },
        {
          name: 'idx_evaluations_deleted_at',
          fields: ['deleted_at']
        },
        {
          name: 'idx_evaluations_class_active',
          fields: ['class_id', 'deleted_at']
        },
        {
          name: 'idx_evaluations_class_discipline',
          fields: ['class_id', 'discipline_id']
        },
        {
          name: 'idx_evaluations_teacher_class',
          fields: ['teacher_id', 'class_id']
        }
      ],

      // Scopes personalizados
      scopes: {
        /**
         * Scope: active
         * Retorna apenas avaliações ativas (não deletadas)
         */
        active: {
          where: {
            deleted_at: null
          }
        },

        /**
         * Scope: byType
         * Retorna avaliações de um tipo específico
         * @param {string} type - 'grade' ou 'concept'
         */
        byType(type) {
          return {
            where: {
              type
            }
          };
        },

        /**
         * Scope: upcoming
         * Retorna avaliações futuras
         */
        upcoming: {
          where: {
            date: {
              [sequelize.Sequelize.Op.gte]: new Date()
            }
          },
          order: [['date', 'ASC']]
        },

        /**
         * Scope: past
         * Retorna avaliações passadas
         */
        past: {
          where: {
            date: {
              [sequelize.Sequelize.Op.lt]: new Date()
            }
          },
          order: [['date', 'DESC']]
        },

        /**
         * Scope: withRelations
         * Inclui turma, professor, disciplina e notas
         */
        withRelations: {
          include: [
            {
              association: 'class',
              attributes: ['id', 'semester', 'year']
            },
            {
              association: 'teacher',
              attributes: ['id', 'name', 'email']
            },
            {
              association: 'discipline',
              attributes: ['id', 'name', 'code']
            },
            {
              association: 'grades',
              attributes: ['id', 'student_id', 'grade', 'concept']
            }
          ]
        },

        /**
         * Scope: recent
         * Retorna avaliações dos últimos 3 meses, ordenadas por data desc
         */
        recent: {
          where: {
            date: {
              [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
          },
          order: [['date', 'DESC']]
        }
      },

      // Hooks do modelo
      hooks: {
        /**
         * Hook: beforeValidate
         * Executado antes da validação
         */
        beforeValidate: (evaluation, options) => {
          // Normalizar valores
          if (evaluation.name) {
            evaluation.name = evaluation.name.trim();
          }
          if (evaluation.type) {
            evaluation.type = evaluation.type.toLowerCase();
          }
          // Converter IDs para inteiros
          if (evaluation.class_id) {
            evaluation.class_id = parseInt(evaluation.class_id, 10);
          }
          if (evaluation.teacher_id) {
            evaluation.teacher_id = parseInt(evaluation.teacher_id, 10);
          }
          if (evaluation.discipline_id) {
            evaluation.discipline_id = parseInt(evaluation.discipline_id, 10);
          }
        },

        /**
         * Hook: beforeCreate
         * Executado antes de criar registro
         */
        beforeCreate: (evaluation, options) => {
          console.log(`[Evaluation] Criando avaliação: ${evaluation.name} - Turma ID: ${evaluation.class_id}`);
        },

        /**
         * Hook: afterCreate
         * Executado após criar registro
         */
        afterCreate: (evaluation, options) => {
          console.log(`[Evaluation] Avaliação criada com sucesso: ID ${evaluation.id}`);
        },

        /**
         * Hook: beforeUpdate
         * Executado antes de atualizar registro
         */
        beforeUpdate: (evaluation, options) => {
          console.log(`[Evaluation] Atualizando avaliação ID: ${evaluation.id}`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) registro
         */
        beforeDestroy: (evaluation, options) => {
          console.log(`[Evaluation] Deletando avaliação ID: ${evaluation.id}`);
        }
      }
    }
  );

  return Evaluation;
};
