/**
 * Arquivo: src/models/Discipline.js
 * Descrição: Model Sequelize para a tabela disciplines (disciplinas)
 * Feature: feat-008 - Criar migrations para Course e Discipline
 * Criado em: 2025-10-26
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Discipline
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco
 * - Soft delete (paranoid) para exclusão lógica
 * - Scopes personalizados para queries comuns
 *
 * @example
 * // Criar nova disciplina
 * const discipline = await Discipline.create({
 *   name: 'Matemática Aplicada',
 *   code: 'MAT101',
 *   workload_hours: 80
 * });
 *
 * // Buscar disciplinas ativas
 * const activeDisciplines = await Discipline.scope('active').findAll();
 *
 * // Buscar disciplina por código
 * const discipline = await Discipline.findByCode('MAT101');
 */

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Model Discipline
   * Representa uma disciplina que pode ser oferecida em cursos
   */
  class Discipline extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      // Associação N:N com Course através de course_disciplines
      // Será implementada na feat-009
      // Discipline.belongsToMany(models.Course, {
      //   through: 'course_disciplines',
      //   foreignKey: 'discipline_id',
      //   otherKey: 'course_id',
      //   as: 'courses'
      // });

      // Associação 1:N com Evaluation
      // Será implementada na feat-014
      // Discipline.hasMany(models.Evaluation, {
      //   foreignKey: 'discipline_id',
      //   as: 'evaluations'
      // });

      // Associação N:N com Teacher através de class_teachers
      // Será implementada na feat-010
      // Discipline.belongsToMany(models.User, {
      //   through: 'class_teachers',
      //   foreignKey: 'discipline_id',
      //   otherKey: 'teacher_id',
      //   as: 'teachers'
      // });
    }

    /**
     * Busca disciplina por código (método estático)
     *
     * @param {string} code - Código da disciplina
     * @returns {Promise<Discipline|null>} Disciplina encontrada ou null
     */
    static async findByCode(code) {
      return await this.findOne({
        where: { code: code.toUpperCase() }
      });
    }

    /**
     * Verifica se a disciplina está ativa (não foi soft deleted)
     *
     * @returns {boolean} True se ativa, false se deletada
     */
    isActive() {
      return this.deletedAt === null;
    }

    /**
     * Retorna a carga horária em créditos (1 crédito = 15 horas)
     * Padrão comum em instituições de ensino
     *
     * @returns {number} Carga horária em créditos (arredondado)
     */
    getCredits() {
      return Math.round(this.workload_hours / 15);
    }

    /**
     * Verifica se é uma disciplina de alta carga horária (>= 80 horas)
     *
     * @returns {boolean} True se carga horária >= 80h
     */
    isHighWorkload() {
      return this.workload_hours >= 80;
    }

    /**
     * Retorna representação em string da disciplina
     *
     * @returns {string} Código e nome da disciplina
     */
    toString() {
      return `${this.code} - ${this.name} (${this.workload_hours}h)`;
    }

    /**
     * Customiza serialização JSON
     * Remove campos sensíveis ou desnecessários
     *
     * @returns {Object} Objeto JSON customizado
     */
    toJSON() {
      const values = { ...this.get() };

      // Remove deletedAt se for null
      if (values.deletedAt === null) {
        delete values.deletedAt;
      }

      // Adiciona campo computado de créditos
      values.credits = this.getCredits();

      return values;
    }
  }

  /**
   * Inicializa o model com seus campos e configurações
   */
  Discipline.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da disciplina'
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Nome da disciplina é obrigatório'
          },
          notEmpty: {
            msg: 'Nome da disciplina não pode ser vazio'
          },
          len: {
            args: [3, 200],
            msg: 'Nome da disciplina deve ter entre 3 e 200 caracteres'
          }
        },
        comment: 'Nome da disciplina (ex: Matemática Aplicada, Anatomia Humana)'
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: 'Já existe uma disciplina com este código'
        },
        validate: {
          notNull: {
            msg: 'Código da disciplina é obrigatório'
          },
          notEmpty: {
            msg: 'Código da disciplina não pode ser vazio'
          },
          len: {
            args: [2, 50],
            msg: 'Código deve ter entre 2 e 50 caracteres'
          },
          is: {
            args: /^[A-Z0-9\-_]+$/i,
            msg: 'Código deve conter apenas letras, números, hífen ou underscore'
          }
        },
        comment: 'Código identificador da disciplina (ex: MAT101, ANA201)'
      },
      workload_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Carga horária é obrigatória'
          },
          isInt: {
            msg: 'Carga horária deve ser um número inteiro'
          },
          min: {
            args: [1],
            msg: 'Carga horária mínima é de 1 hora'
          },
          max: {
            args: [500],
            msg: 'Carga horária máxima é de 500 horas'
          }
        },
        comment: 'Carga horária da disciplina em horas (ex: 60, 80, 120)'
      }
    },
    {
      sequelize,
      modelName: 'Discipline',
      tableName: 'disciplines',
      timestamps: true,
      paranoid: true, // Habilita soft delete
      underscored: true, // Converte camelCase do JS para snake_case no SQL

      // Índices adicionais (além dos definidos na migration)
      indexes: [
        {
          name: 'disciplines_code_unique',
          unique: true,
          fields: ['code']
        },
        {
          name: 'disciplines_name_index',
          fields: ['name']
        },
        {
          name: 'disciplines_deleted_at_index',
          fields: ['deleted_at']
        }
      ],

      // Scopes personalizados para queries comuns
      scopes: {
        /**
         * Scope: active
         * Retorna apenas disciplinas ativas (não deletadas)
         */
        active: {
          where: {
            deletedAt: null
          }
        },

        /**
         * Scope: lightWorkload
         * Retorna disciplinas com carga horária <= 40 horas
         */
        lightWorkload: {
          where: {
            workload_hours: {
              [sequelize.Sequelize.Op.lte]: 40
            }
          }
        },

        /**
         * Scope: mediumWorkload
         * Retorna disciplinas com carga horária entre 41 e 79 horas
         */
        mediumWorkload: {
          where: {
            workload_hours: {
              [sequelize.Sequelize.Op.between]: [41, 79]
            }
          }
        },

        /**
         * Scope: highWorkload
         * Retorna disciplinas com carga horária >= 80 horas
         */
        highWorkload: {
          where: {
            workload_hours: {
              [sequelize.Sequelize.Op.gte]: 80
            }
          }
        },

        /**
         * Scope: orderByCode
         * Ordena disciplinas por código
         */
        orderByCode: {
          order: [['code', 'ASC']]
        },

        /**
         * Scope: orderByName
         * Ordena disciplinas alfabeticamente por nome
         */
        orderByName: {
          order: [['name', 'ASC']]
        },

        /**
         * Scope: orderByWorkload
         * Ordena disciplinas por carga horária (decrescente)
         */
        orderByWorkload: {
          order: [['workload_hours', 'DESC']]
        }
      },

      // Hooks do modelo
      hooks: {
        /**
         * Hook: beforeValidate
         * Executado antes de validar os dados
         * Normaliza o código (uppercase) e nome (trim)
         */
        beforeValidate: (discipline) => {
          if (discipline.name) {
            discipline.name = discipline.name.trim();
          }
          if (discipline.code) {
            // Converte código para maiúsculas e remove espaços
            discipline.code = discipline.code.trim().toUpperCase();
          }
        },

        /**
         * Hook: afterCreate
         * Executado após criar uma nova disciplina
         * Útil para logs ou notificações
         */
        afterCreate: (discipline) => {
          console.log(`[Discipline] Disciplina criada: ${discipline.code} - ${discipline.name} (ID: ${discipline.id})`);
        },

        /**
         * Hook: afterUpdate
         * Executado após atualizar uma disciplina
         */
        afterUpdate: (discipline) => {
          console.log(`[Discipline] Disciplina atualizada: ${discipline.code} - ${discipline.name} (ID: ${discipline.id})`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) uma disciplina
         */
        beforeDestroy: (discipline) => {
          console.log(`[Discipline] Disciplina sendo desativada: ${discipline.code} - ${discipline.name} (ID: ${discipline.id})`);
        }
      }
    }
  );

  return Discipline;
};
