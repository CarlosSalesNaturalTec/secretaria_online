/**
 * Arquivo: src/models/Course.js
 * Descrição: Model Sequelize para a tabela courses (cursos)
 * Feature: feat-008 - Criar migrations para Course e Discipline
 * Criado em: 2025-10-26
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Course
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 *
 * @example
 * // Criar novo curso
 * const course = await Course.create({
 *   name: 'Administração',
 *   description: 'Curso de Bacharelado em Administração de Empresas',
 *   duration_semesters: 8
 * });
 *
 * // Buscar cursos ativos
 * const activeCourses = await Course.scope('active').findAll();
 *
 * // Buscar curso com suas disciplinas
 * const courseWithDisciplines = await Course.findByPk(1, {
 *   include: ['disciplines']
 * });
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model Course
   * Representa um curso oferecido pela instituição
   */
  class Course extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      // Associação N:N com Discipline através de course_disciplines
      // Será implementada na feat-009
      // Course.belongsToMany(models.Discipline, {
      //   through: 'course_disciplines',
      //   foreignKey: 'course_id',
      //   otherKey: 'discipline_id',
      //   as: 'disciplines'
      // });

      // Associação 1:N com Enrollment
      // Será implementada na feat-011
      // Course.hasMany(models.Enrollment, {
      //   foreignKey: 'course_id',
      //   as: 'enrollments'
      // });

      // Associação 1:N com Class
      // Será implementada na feat-010
      // Course.hasMany(models.Class, {
      //   foreignKey: 'course_id',
      //   as: 'classes'
      // });
    }

    /**
     * Verifica se o curso está ativo (não foi soft deleted)
     *
     * @returns {boolean} True se ativo, false se deletado
     */
    isActive() {
      return this.deletedAt === null;
    }

    /**
     * Retorna a duração do curso em anos
     *
     * @returns {number} Duração em anos (arredondado para cima)
     */
    getDurationInYears() {
      return Math.ceil(this.duration_semesters / 2);
    }

    /**
     * Retorna representação em string do curso
     *
     * @returns {string} Nome e duração do curso
     */
    toString() {
      return `${this.name} (${this.duration_semesters} semestres)`;
    }

    /**
     * Customiza serialização JSON
     * Remove campos sensíveis ou desnecessários
     *
     * @returns {Object} Objeto JSON customizado
     */
    toJSON() {
      const values = { ...this.get() };

      // Remove deletedAt se for null (não adiciona poluição visual)
      if (values.deletedAt === null) {
        delete values.deletedAt;
      }

      return values;
    }
  }

  /**
   * Inicializa o model com seus campos e configurações
   */
  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do curso'
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: {
          msg: 'Já existe um curso com este nome'
        },
        validate: {
          notNull: {
            msg: 'Nome do curso é obrigatório'
          },
          notEmpty: {
            msg: 'Nome do curso não pode ser vazio'
          },
          len: {
            args: [3, 200],
            msg: 'Nome do curso deve ter entre 3 e 200 caracteres'
          }
        },
        comment: 'Nome do curso (ex: Administração, Enfermagem)'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 5000],
            msg: 'Descrição não pode exceder 5000 caracteres'
          }
        },
        comment: 'Descrição detalhada do curso, objetivos, área de atuação'
      },
      duration_semesters: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Duração do curso é obrigatória'
          },
          isInt: {
            msg: 'Duração deve ser um número inteiro'
          },
          min: {
            args: [1],
            msg: 'Duração mínima é de 1 semestre'
          },
          max: {
            args: [20],
            msg: 'Duração máxima é de 20 semestres'
          }
        },
        comment: 'Duração do curso em semestres (ex: 6, 8, 10)'
      }
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'courses',
      timestamps: true,
      paranoid: true, // Habilita soft delete
      underscored: true, // Converte camelCase do JS para snake_case no SQL

      // Índices adicionais (além dos definidos na migration)
      indexes: [
        {
          name: 'courses_name_unique',
          unique: true,
          fields: ['name']
        },
        {
          name: 'courses_deleted_at_index',
          fields: ['deleted_at']
        }
      ],

      // Scopes personalizados para queries comuns
      scopes: {
        /**
         * Scope: active
         * Retorna apenas cursos ativos (não deletados)
         */
        active: {
          where: {
            deletedAt: null
          }
        },

        /**
         * Scope: shortDuration
         * Retorna cursos com duração <= 4 semestres (cursos rápidos/técnicos)
         */
        shortDuration: {
          where: {
            duration_semesters: {
              [sequelize.Sequelize.Op.lte]: 4
            }
          }
        },

        /**
         * Scope: longDuration
         * Retorna cursos com duração >= 8 semestres (bacharelados)
         */
        longDuration: {
          where: {
            duration_semesters: {
              [sequelize.Sequelize.Op.gte]: 8
            }
          }
        },

        /**
         * Scope: withDescription
         * Retorna apenas cursos que têm descrição preenchida
         */
        withDescription: {
          where: {
            description: {
              [sequelize.Sequelize.Op.ne]: null
            }
          }
        },

        /**
         * Scope: orderByName
         * Ordena cursos alfabeticamente por nome
         */
        orderByName: {
          order: [['name', 'ASC']]
        }
      },

      // Hooks do modelo
      hooks: {
        /**
         * Hook: beforeValidate
         * Executado antes de validar os dados
         * Normaliza o nome do curso (trim)
         */
        beforeValidate: (course) => {
          if (course.name) {
            course.name = course.name.trim();
          }
          if (course.description) {
            course.description = course.description.trim();
          }
        },

        /**
         * Hook: afterCreate
         * Executado após criar um novo curso
         * Útil para logs ou notificações
         */
        afterCreate: (course) => {
          console.log(`[Course] Curso criado: ${course.name} (ID: ${course.id})`);
        },

        /**
         * Hook: afterUpdate
         * Executado após atualizar um curso
         */
        afterUpdate: (course) => {
          console.log(`[Course] Curso atualizado: ${course.name} (ID: ${course.id})`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) um curso
         */
        beforeDestroy: (course) => {
          console.log(`[Course] Curso sendo desativado: ${course.name} (ID: ${course.id})`);
        }
      }
    }
  );

  return Course;
};
