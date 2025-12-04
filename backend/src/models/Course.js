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
 *   duration: 8,
 *   duration_type: 'Semestres'
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
      /**
       * Associação N:N com Discipline através de course_disciplines
       * Um curso possui múltiplas disciplinas, e uma disciplina pode estar em múltiplos cursos
       * A tabela pivot 'course_disciplines' armazena também o semestre em que a disciplina é oferecida
       *
       * @example
       * // Buscar curso com suas disciplinas
       * const course = await Course.findByPk(1, {
       *   include: [{
       *     model: Discipline,
       *     as: 'disciplines',
       *     through: { attributes: ['semester'] } // Inclui o semestre da tabela pivot
       *   }]
       * });
       *
       * // Adicionar disciplina a um curso em um semestre específico
       * await course.addDiscipline(disciplineId, { through: { semester: 3 } });
       */
      Course.belongsToMany(models.Discipline, {
        through: 'course_disciplines',
        foreignKey: 'course_id',
        otherKey: 'discipline_id',
        as: 'disciplines'
      });

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
     * Retorna representação em string do curso
     *
     * @returns {string} Nome e duração do curso
     */
    toString() {
      return `${this.name} (${this.duration} ${this.duration_type})`;
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
      duration: {
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
            msg: 'Duração mínima é 1'
          },
          max: {
            args: [1000],
            msg: 'Duração máxima é 1000'
          }
        },
        comment: 'Duração do curso (valor numérico)'
      },
      duration_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Tipo de duração é obrigatório'
          },
          notEmpty: {
            msg: 'Tipo de duração não pode ser vazio'
          },
          isIn: {
            args: [['Semestres', 'Dias', 'Horas', 'Meses', 'Anos']],
            msg: 'Tipo de duração deve ser: Semestres, Dias, Horas, Meses ou Anos'
          }
        },
        comment: 'Tipo de duração (Semestres, Dias, Horas, Meses, Anos)'
      },
      course_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Superior',
        validate: {
          notNull: {
            msg: 'Tipo de curso é obrigatório'
          },
          notEmpty: {
            msg: 'Tipo de curso não pode ser vazio'
          },
          isIn: {
            args: [['Mestrado/Doutorado', 'Cursos de Verão', 'Pós graduação', 'Superior', 'Supletivo/EJA', 'Técnicos']],
            msg: 'Tipo de curso deve ser: Mestrado/Doutorado, Cursos de Verão, Pós graduação, Superior, Supletivo/EJA ou Técnicos'
          }
        },
        comment: 'Tipo de curso (Mestrado/Doutorado, Cursos de Verão, Pós graduação, Superior, Supletivo/EJA, Técnicos)'
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

  /**
   * Associações (relationships)
   * Serão configuradas após todos os models serem carregados
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  Course.associate = function (models) {
    // Course tem muitas Matrículas (Enrollments)
    Course.hasMany(models.Enrollment, {
      foreignKey: 'course_id',
      as: 'enrollments',
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });

    // Course pertence a muitas Disciplinas (através de course_disciplines)
    Course.belongsToMany(models.Discipline, {
      through: 'course_disciplines',
      foreignKey: 'course_id',
      otherKey: 'discipline_id',
      as: 'disciplines',
    });
  };

  return Course;
};
