/**
 * Arquivo: src/models/Grade.js
 * Descrição: Model Sequelize para a tabela grades (notas)
 * Feature: feat-014 - Criar migrations para Evaluation e Grade
 * Criado em: 2025-10-27
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Grade (Nota)
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco
 * - Garantir que apenas grade OU concept esteja preenchido
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 * - Associações com Evaluation e Student (User)
 *
 * @example
 * // Criar nova nota numérica
 * const grade = await Grade.create({
 *   evaluation_id: 1,
 *   student_id: 5,
 *   grade: 8.5,
 *   concept: null
 * });
 *
 * // Criar novo conceito
 * const concept = await Grade.create({
 *   evaluation_id: 2,
 *   student_id: 5,
 *   grade: null,
 *   concept: 'satisfactory'
 * });
 *
 * // Buscar notas de um aluno
 * const studentGrades = await Grade.findByStudent(5);
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model Grade
   * Representa uma nota/conceito de um aluno em uma avaliação
   */
  class Grade extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Evaluation
       * Uma nota pertence a uma avaliação
       */
      Grade.belongsTo(models.Evaluation, {
        foreignKey: 'evaluation_id',
        as: 'evaluation',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      /**
       * Associação N:1 com Student
       * Uma nota pertence a um aluno
       */
      Grade.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }

    /**
     * Método auxiliar: verifica se a nota está ativa
     *
     * @returns {boolean} True se a nota está ativa (não deletada)
     */
    isActive() {
      return this.deleted_at === null;
    }

    /**
     * Método auxiliar: verifica se é nota numérica
     *
     * @returns {boolean} True se grade está preenchido
     */
    isGrade() {
      return this.grade !== null && this.grade !== undefined;
    }

    /**
     * Método auxiliar: verifica se é conceito
     *
     * @returns {boolean} True se concept está preenchido
     */
    isConcept() {
      return this.concept !== null && this.concept !== undefined;
    }

    /**
     * Método auxiliar: retorna a nota/conceito formatado
     *
     * @returns {string} Nota formatada ou conceito traduzido
     */
    getFormattedValue() {
      if (this.isGrade()) {
        return parseFloat(this.grade).toFixed(2);
      }
      if (this.isConcept()) {
        return this.concept === 'satisfactory' ? 'Satisfatório' : 'Não Satisfatório';
      }
      return 'Não lançada';
    }

    /**
     * Método auxiliar: verifica se a nota é maior ou igual a 7 (aprovado)
     * Aplicável apenas para notas numéricas
     *
     * @returns {boolean|null} True se aprovado, False se reprovado, null se não aplicável
     */
    isPassing() {
      if (this.isGrade()) {
        return parseFloat(this.grade) >= 7.0;
      }
      if (this.isConcept()) {
        return this.concept === 'satisfactory';
      }
      return null;
    }

    /**
     * Método auxiliar: retorna o status da nota (Aprovado/Reprovado)
     *
     * @returns {string} "Aprovado", "Reprovado" ou "Não lançada"
     */
    getStatus() {
      const passing = this.isPassing();
      if (passing === null) return 'Não lançada';
      return passing ? 'Aprovado' : 'Reprovado';
    }

    /**
     * Método estático: busca notas por avaliação
     *
     * @param {number} evaluationId - ID da avaliação
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de notas da avaliação
     */
    static async findByEvaluation(evaluationId, options = {}) {
      return await this.findAll({
        where: { evaluation_id: evaluationId },
        order: [['created_at', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: busca notas por aluno
     *
     * @param {number} studentId - ID do aluno
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de notas do aluno
     */
    static async findByStudent(studentId, options = {}) {
      return await this.findAll({
        where: { student_id: studentId },
        order: [['created_at', 'DESC']],
        ...options
      });
    }

    /**
     * Método estático: busca nota específica de um aluno em uma avaliação
     *
     * @param {number} evaluationId - ID da avaliação
     * @param {number} studentId - ID do aluno
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Grade|null>} Nota encontrada ou null
     */
    static async findByEvaluationAndStudent(evaluationId, studentId, options = {}) {
      return await this.findOne({
        where: {
          evaluation_id: evaluationId,
          student_id: studentId
        },
        ...options
      });
    }

    /**
     * Método estático: calcula média das notas numéricas de um aluno
     *
     * @param {number} studentId - ID do aluno
     * @returns {Promise<number|null>} Média calculada ou null se não houver notas
     */
    static async calculateAverageByStudent(studentId) {
      const grades = await this.findAll({
        where: {
          student_id: studentId,
          grade: {
            [sequelize.Sequelize.Op.ne]: null
          }
        },
        attributes: ['grade']
      });

      if (grades.length === 0) return null;

      const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade), 0);
      return (sum / grades.length).toFixed(2);
    }

    /**
     * Método estático: conta notas de um aluno
     *
     * @param {number} studentId - ID do aluno
     * @returns {Promise<number>} Quantidade de notas
     */
    static async countByStudent(studentId) {
      return await this.count({
        where: { student_id: studentId }
      });
    }

    /**
     * Método estático: conta notas de uma avaliação
     *
     * @param {number} evaluationId - ID da avaliação
     * @returns {Promise<number>} Quantidade de notas
     */
    static async countByEvaluation(evaluationId) {
      return await this.count({
        where: { evaluation_id: evaluationId }
      });
    }

    /**
     * Método estático: busca notas não lançadas de uma avaliação
     * (registros onde grade e concept são null)
     *
     * @param {number} evaluationId - ID da avaliação
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de notas pendentes
     */
    static async findPendingByEvaluation(evaluationId, options = {}) {
      return await this.findAll({
        where: {
          evaluation_id: evaluationId,
          [sequelize.Sequelize.Op.and]: [
            { grade: null },
            { concept: null }
          ]
        },
        ...options
      });
    }
  }

  Grade.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único da nota'
      },
      evaluation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'evaluations',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'A avaliação é obrigatória'
          },
          notEmpty: {
            msg: 'A avaliação é obrigatória'
          },
          isInt: {
            msg: 'O ID da avaliação deve ser um número inteiro'
          }
        },
        comment: 'ID da avaliação à qual a nota pertence'
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
            msg: 'O aluno é obrigatório'
          },
          notEmpty: {
            msg: 'O aluno é obrigatório'
          },
          isInt: {
            msg: 'O ID do aluno deve ser um número inteiro'
          }
        },
        comment: 'ID do aluno que recebeu a nota'
      },
      grade: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: null,
        validate: {
          isDecimal: {
            msg: 'A nota deve ser um número decimal'
          },
          min: {
            args: [0.00],
            msg: 'A nota mínima é 0.00'
          },
          max: {
            args: [10.00],
            msg: 'A nota máxima é 10.00'
          },
          // Validação customizada: grade XOR concept
          customValidation(value) {
            if (value !== null && value !== undefined && this.concept !== null && this.concept !== undefined) {
              throw new Error('Apenas "grade" OU "concept" pode ser preenchido, não ambos');
            }
            if ((value === null || value === undefined) && (this.concept === null || this.concept === undefined)) {
              throw new Error('É necessário preencher "grade" ou "concept"');
            }
          }
        },
        comment: 'Nota numérica (0.00 a 10.00) - usado quando evaluation.type = "grade"'
      },
      concept: {
        type: DataTypes.ENUM('satisfactory', 'unsatisfactory'),
        allowNull: true,
        defaultValue: null,
        validate: {
          isIn: {
            args: [['satisfactory', 'unsatisfactory']],
            msg: 'O conceito deve ser "satisfactory" ou "unsatisfactory"'
          }
        },
        comment: 'Conceito - usado quando evaluation.type = "concept"'
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
      modelName: 'Grade',
      tableName: 'grades',
      timestamps: true,
      paranoid: true, // Habilita soft delete
      underscored: true, // Usa snake_case para colunas
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: 'Tabela de notas - armazena as notas dos alunos nas avaliações',

      // Índices (já criados na migration, mas declarados aqui para referência)
      indexes: [
        {
          name: 'idx_grades_evaluation_id',
          fields: ['evaluation_id']
        },
        {
          name: 'idx_grades_student_id',
          fields: ['student_id']
        },
        {
          name: 'idx_grades_unique_evaluation_student',
          unique: true,
          fields: ['evaluation_id', 'student_id'],
          where: {
            deleted_at: null
          }
        },
        {
          name: 'idx_grades_deleted_at',
          fields: ['deleted_at']
        },
        {
          name: 'idx_grades_student_active',
          fields: ['student_id', 'deleted_at']
        },
        {
          name: 'idx_grades_created_at',
          fields: ['created_at']
        }
      ],

      // Scopes personalizados
      scopes: {
        /**
         * Scope: active
         * Retorna apenas notas ativas (não deletadas)
         */
        active: {
          where: {
            deleted_at: null
          }
        },

        /**
         * Scope: withGrades
         * Retorna apenas notas numéricas (grade preenchido)
         */
        withGrades: {
          where: {
            grade: {
              [sequelize.Sequelize.Op.ne]: null
            }
          }
        },

        /**
         * Scope: withConcepts
         * Retorna apenas conceitos (concept preenchido)
         */
        withConcepts: {
          where: {
            concept: {
              [sequelize.Sequelize.Op.ne]: null
            }
          }
        },

        /**
         * Scope: passing
         * Retorna apenas notas de aprovação (nota >= 7 ou concept = 'satisfactory')
         */
        passing: {
          where: {
            [sequelize.Sequelize.Op.or]: [
              {
                grade: {
                  [sequelize.Sequelize.Op.gte]: 7.0
                }
              },
              {
                concept: 'satisfactory'
              }
            ]
          }
        },

        /**
         * Scope: failing
         * Retorna apenas notas de reprovação (nota < 7 ou concept = 'unsatisfactory')
         */
        failing: {
          where: {
            [sequelize.Sequelize.Op.or]: [
              {
                grade: {
                  [sequelize.Sequelize.Op.lt]: 7.0
                }
              },
              {
                concept: 'unsatisfactory'
              }
            ]
          }
        },

        /**
         * Scope: withRelations
         * Inclui avaliação e aluno
         */
        withRelations: {
          include: [
            {
              association: 'evaluation',
              attributes: ['id', 'name', 'date', 'type']
            },
            {
              association: 'student',
              attributes: ['id', 'name', 'email']
            }
          ]
        },

        /**
         * Scope: recent
         * Retorna notas dos últimos 30 dias, ordenadas por data de criação desc
         */
        recent: {
          where: {
            created_at: {
              [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          order: [['created_at', 'DESC']]
        }
      },

      // Hooks do modelo
      hooks: {
        /**
         * Hook: beforeValidate
         * Executado antes da validação
         */
        beforeValidate: (grade, options) => {
          // Converter IDs para inteiros
          if (grade.evaluation_id) {
            grade.evaluation_id = parseInt(grade.evaluation_id, 10);
          }
          if (grade.student_id) {
            grade.student_id = parseInt(grade.student_id, 10);
          }
          // Converter grade para decimal se for string
          if (grade.grade && typeof grade.grade === 'string') {
            grade.grade = parseFloat(grade.grade);
          }
          // Normalizar concept
          if (grade.concept) {
            grade.concept = grade.concept.toLowerCase();
          }
        },

        /**
         * Hook: beforeCreate
         * Executado antes de criar registro
         */
        beforeCreate: (grade, options) => {
          console.log(`[Grade] Criando nota para aluno ID: ${grade.student_id} - Avaliação ID: ${grade.evaluation_id}`);
        },

        /**
         * Hook: afterCreate
         * Executado após criar registro
         */
        afterCreate: (grade, options) => {
          console.log(`[Grade] Nota criada com sucesso: ID ${grade.id}`);
        },

        /**
         * Hook: beforeUpdate
         * Executado antes de atualizar registro
         */
        beforeUpdate: (grade, options) => {
          console.log(`[Grade] Atualizando nota ID: ${grade.id}`);
        },

        /**
         * Hook: afterUpdate
         * Executado após atualizar registro
         */
        afterUpdate: (grade, options) => {
          console.log(`[Grade] Nota atualizada: ID ${grade.id} - Novo valor: ${grade.getFormattedValue()}`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) registro
         */
        beforeDestroy: (grade, options) => {
          console.log(`[Grade] Deletando nota ID: ${grade.id}`);
        }
      }
    }
  );

  return Grade;
};
