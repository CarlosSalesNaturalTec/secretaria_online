/**
 * Arquivo: src/models/Class.js
 * Descrição: Model Sequelize para a tabela classes (turmas)
 * Feature: feat-010 - Criar migrations para Class e relacionamentos
 * Criado em: 2025-10-26
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Class (Turma)
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 * - Associações com Course, Teachers (através de class_teachers) e Students (através de class_students)
 *
 * @example
 * // Criar nova turma
 * const classInstance = await Class.create({
 *   course_id: 1,
 *   semester: 2,
 *   year: 2025
 * });
 *
 * // Buscar turmas ativas
 * const activeClasses = await Class.scope('active').findAll();
 *
 * // Buscar turma com alunos e professores
 * const classWithMembers = await Class.findByPk(1, {
 *   include: ['course', 'students', 'teachers']
 * });
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model Class
   * Representa uma turma da instituição
   */
  class Class extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      /**
       * Associação N:1 com Course
       * Uma turma pertence a um curso
       */
      Class.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      /**
       * Associação N:N com Teacher através de class_teachers
       * Uma turma possui múltiplos professores (cada um lecionando disciplinas diferentes)
       * Um professor pode lecionar em múltiplas turmas
       */
      Class.belongsToMany(models.Teacher, {
        through: 'class_teachers',
        foreignKey: 'class_id',
        otherKey: 'teacher_id',
        as: 'teachers'
      });

      /**
       * Associação N:N com User (Students) através de class_students
       * Uma turma possui múltiplos alunos
       * Um aluno pode estar em múltiplas turmas (se estiver matriculado em mais de um curso)
       */
      Class.belongsToMany(models.User, {
        through: 'class_students',
        foreignKey: 'class_id',
        otherKey: 'student_id',
        as: 'students',
        scope: {
          role: 'student' // Apenas usuários com role student
        }
      });

      /**
       * Associação N:N com Discipline através de class_teachers
       * Para obter as disciplinas lecionadas nesta turma
       */
      Class.belongsToMany(models.Discipline, {
        through: 'class_teachers',
        foreignKey: 'class_id',
        otherKey: 'discipline_id',
        as: 'disciplines'
      });

      /**
       * Associação 1:N com Evaluation
       * Uma turma possui múltiplas avaliações
       */
      Class.hasMany(models.Evaluation, {
        foreignKey: 'class_id',
        as: 'evaluations',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }

    /**
     * Método auxiliar: verifica se a turma está ativa
     *
     * @returns {boolean} True se a turma está ativa (não deletada)
     */
    isActive() {
      return this.deleted_at === null;
    }

    /**
     * Método auxiliar: retorna o ano e semestre formatado
     *
     * @returns {string} Formato: "2025/1", "2025/2", etc.
     */
    getPeriodLabel() {
      return `${this.year}/${this.semester}`;
    }

    /**
     * Método auxiliar: verifica se a turma é do ano corrente
     *
     * @returns {boolean} True se a turma é do ano atual
     */
    isCurrentYear() {
      const currentYear = new Date().getFullYear();
      return this.year === currentYear;
    }

    /**
     * Método estático: busca turmas por curso
     *
     * @param {number} courseId - ID do curso
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de turmas do curso
     */
    static async findByCourse(courseId, options = {}) {
      return await this.findAll({
        where: { course_id: courseId },
        ...options
      });
    }

    /**
     * Método estático: busca turmas por ano
     *
     * @param {number} year - Ano da turma
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de turmas do ano
     */
    static async findByYear(year, options = {}) {
      return await this.findAll({
        where: { year },
        ...options
      });
    }

    /**
     * Método estático: busca turmas por semestre e ano
     *
     * @param {number} semester - Semestre (1-12)
     * @param {number} year - Ano
     * @param {Object} options - Opções adicionais do Sequelize
     * @returns {Promise<Array>} Lista de turmas do período
     */
    static async findByPeriod(semester, year, options = {}) {
      return await this.findAll({
        where: { semester, year },
        ...options
      });
    }

    /**
     * Método estático: conta alunos de uma turma
     *
     * @param {number} classId - ID da turma
     * @returns {Promise<number>} Quantidade de alunos
     */
    static async countStudents(classId) {
      const classInstance = await this.findByPk(classId, {
        include: [{
          model: sequelize.models.User,
          as: 'students',
          attributes: ['id']
        }]
      });

      return classInstance?.students?.length || 0;
    }

    /**
     * Método estático: conta professores de uma turma
     *
     * @param {number} classId - ID da turma
     * @returns {Promise<number>} Quantidade de professores
     */
    static async countTeachers(classId) {
      const classInstance = await this.findByPk(classId, {
        include: [{
          model: sequelize.models.Teacher,
          as: 'teachers',
          attributes: ['id']
        }]
      });

      return classInstance?.teachers?.length || 0;
    }
  }

  Class.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único da turma'
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        validate: {
          notNull: {
            msg: 'O curso é obrigatório'
          },
          notEmpty: {
            msg: 'O curso é obrigatório'
          },
          isInt: {
            msg: 'O ID do curso deve ser um número inteiro'
          }
        },
        comment: 'ID do curso ao qual a turma pertence'
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O semestre é obrigatório'
          },
          notEmpty: {
            msg: 'O semestre é obrigatório'
          },
          isInt: {
            msg: 'O semestre deve ser um número inteiro'
          },
          min: {
            args: [1],
            msg: 'O semestre deve ser no mínimo 1'
          },
          max: {
            args: [12],
            msg: 'O semestre deve ser no máximo 12'
          }
        },
        comment: 'Número do semestre da turma (1-12)'
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O ano é obrigatório'
          },
          notEmpty: {
            msg: 'O ano é obrigatório'
          },
          isInt: {
            msg: 'O ano deve ser um número inteiro'
          },
          min: {
            args: [2020],
            msg: 'O ano deve ser no mínimo 2020'
          },
          max: {
            args: [2100],
            msg: 'O ano deve ser no máximo 2100'
          }
        },
        comment: 'Ano da turma'
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
      modelName: 'Class',
      tableName: 'classes',
      timestamps: true,
      paranoid: true, // Habilita soft delete
      underscored: true, // Usa snake_case para colunas
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: 'Tabela de turmas - agrupa alunos em um curso/semestre específico',

      // Índices (já criados na migration, mas declarados aqui para referência)
      indexes: [
        {
          name: 'idx_classes_course_id',
          fields: ['course_id']
        },
        {
          name: 'idx_classes_semester_year',
          fields: ['semester', 'year']
        },
        {
          name: 'idx_classes_unique_course_semester_year',
          unique: true,
          fields: ['course_id', 'semester', 'year'],
          where: {
            deleted_at: null
          }
        },
        {
          name: 'idx_classes_deleted_at',
          fields: ['deleted_at']
        },
        {
          name: 'idx_classes_active',
          fields: ['course_id', 'deleted_at']
        }
      ],

      // Scopes personalizados
      scopes: {
        /**
         * Scope: active
         * Retorna apenas turmas ativas (não deletadas)
         */
        active: {
          where: {
            deleted_at: null
          }
        },

        /**
         * Scope: currentYear
         * Retorna turmas do ano corrente
         */
        currentYear: {
          where: {
            year: new Date().getFullYear()
          }
        },

        /**
         * Scope: withRelations
         * Inclui curso, alunos e professores
         */
        withRelations: {
          include: [
            {
              association: 'course',
              attributes: ['id', 'name', 'duration_semesters']
            },
            {
              association: 'students',
              attributes: ['id', 'name', 'email'],
              through: { attributes: [] } // Não retorna dados da tabela pivot
            },
            {
              association: 'teachers',
              attributes: ['id', 'nome', 'email'],
              through: { attributes: [] }
            }
          ]
        },

        /**
         * Scope: withCourse
         * Inclui apenas o curso
         */
        withCourse: {
          include: [
            {
              association: 'course',
              attributes: ['id', 'name', 'description', 'duration_semesters']
            }
          ]
        },

        /**
         * Scope: recent
         * Retorna turmas dos últimos 2 anos, ordenadas por ano/semestre desc
         */
        recent: {
          where: {
            year: {
              [sequelize.Sequelize.Op.gte]: new Date().getFullYear() - 2
            }
          },
          order: [
            ['year', 'DESC'],
            ['semester', 'DESC']
          ]
        }
      },

      // Hooks do modelo
      hooks: {
        /**
         * Hook: beforeValidate
         * Executado antes da validação
         */
        beforeValidate: (classInstance, options) => {
          // Normalizar valores numéricos
          if (classInstance.semester) {
            classInstance.semester = parseInt(classInstance.semester, 10);
          }
          if (classInstance.year) {
            classInstance.year = parseInt(classInstance.year, 10);
          }
          if (classInstance.course_id) {
            classInstance.course_id = parseInt(classInstance.course_id, 10);
          }
        },

        /**
         * Hook: beforeCreate
         * Executado antes de criar registro
         */
        beforeCreate: (classInstance, options) => {
          console.log(`[Class] Criando turma: ${classInstance.getPeriodLabel()} - Curso ID: ${classInstance.course_id}`);
        },

        /**
         * Hook: afterCreate
         * Executado após criar registro
         */
        afterCreate: (classInstance, options) => {
          console.log(`[Class] Turma criada com sucesso: ID ${classInstance.id}`);
        },

        /**
         * Hook: beforeUpdate
         * Executado antes de atualizar registro
         */
        beforeUpdate: (classInstance, options) => {
          console.log(`[Class] Atualizando turma ID: ${classInstance.id}`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) registro
         */
        beforeDestroy: (classInstance, options) => {
          console.log(`[Class] Deletando turma ID: ${classInstance.id}`);
        }
      }
    }
  );

  return Class;
};
