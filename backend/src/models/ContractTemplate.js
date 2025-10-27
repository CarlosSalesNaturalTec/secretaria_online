/**
 * Arquivo: backend/src/models/ContractTemplate.js
 * Descrição: Model para templates de contratos
 * Feature: feat-013 - Criar migrations para Contract e ContractTemplate
 * Criado em: 2025-10-27
 *
 * Responsabilidades:
 * - Representa templates de contratos em HTML com placeholders
 * - Gerencia templates ativos e inativos
 * - Fornece métodos para buscar templates disponíveis
 *
 * @example
 * // Criar novo template de contrato
 * const template = await ContractTemplate.create({
 *   name: 'Contrato de Matrícula 2025',
 *   content: '<html><body><h1>{{studentName}}</h1></body></html>',
 *   is_active: true
 * });
 *
 * // Buscar templates ativos
 * const activeTemplates = await ContractTemplate.findActive();
 */

'use strict';

/**
 * Factory function do Model ContractTemplate
 * Executada pelo models/index.js durante inicialização do Sequelize
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model ContractTemplate configurado
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Model ContractTemplate
   * Representa templates de contratos
   */
  const ContractTemplate = sequelize.define(
    'ContractTemplate',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O nome do template é obrigatório',
          },
          notEmpty: {
            msg: 'O nome do template não pode estar vazio',
          },
          len: {
            args: [3, 100],
            msg: 'O nome deve ter entre 3 e 100 caracteres',
          },
        },
      },
      content: {
        type: DataTypes.TEXT('long'), // LONGTEXT para armazenar HTML completo
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O conteúdo do template é obrigatório',
          },
          notEmpty: {
            msg: 'O conteúdo do template não pode estar vazio',
          },
          // Validação customizada para verificar se contém placeholders básicos
          hasBasicStructure(value) {
            if (!value.includes('<html') && !value.includes('<body')) {
              throw new Error(
                'O conteúdo do template deve conter estrutura HTML básica',
              );
            }
          },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      tableName: 'contract_templates',
      timestamps: true,
      paranoid: true, // Soft delete
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      scopes: {
        // Scope para buscar apenas templates ativos (não deletados)
        active: {
          where: {
            deleted_at: null,
          },
        },
        // Scope para buscar templates disponíveis para uso
        available: {
          where: {
            is_active: true,
            deleted_at: null,
          },
        },
        // Scope para ordenação alfabética
        ordered: {
          order: [['name', 'ASC']],
        },
      },
      hooks: {
        beforeValidate: (template) => {
          // Normalizar nome (trim)
          if (template.name) {
            template.name = template.name.trim();
          }
          // Normalizar conteúdo (trim)
          if (template.content) {
            template.content = template.content.trim();
          }
        },
        afterCreate: (template) => {
          console.log(
            `[ContractTemplate] Novo template criado: ${template.name} (ID: ${template.id})`,
          );
        },
        afterUpdate: (template) => {
          console.log(
            `[ContractTemplate] Template atualizado: ${template.name} (ID: ${template.id})`,
          );
        },
        afterDestroy: (template) => {
          console.log(
            `[ContractTemplate] Template deletado: ${template.name} (ID: ${template.id})`,
          );
        },
      },
    },
  );

  /**
   * Métodos de Instância
   */

  /**
   * Verifica se o template está ativo
   * @returns {boolean}
   */
  ContractTemplate.prototype.isActive = function () {
    return this.is_active && !this.deleted_at;
  };

  /**
   * Ativa o template
   * @returns {Promise<ContractTemplate>}
   */
  ContractTemplate.prototype.activate = async function () {
    this.is_active = true;
    return await this.save();
  };

  /**
   * Desativa o template
   * @returns {Promise<ContractTemplate>}
   */
  ContractTemplate.prototype.deactivate = async function () {
    this.is_active = false;
    return await this.save();
  };

  /**
   * Substitui placeholders no conteúdo do template
   * @param {Object} data - Objeto com dados para substituição
   * @returns {string} Conteúdo com placeholders substituídos
   *
   * @example
   * const content = template.replacePlaceholders({
   *   studentName: 'João Silva',
   *   courseName: 'Engenharia de Software',
   *   semester: 1,
   *   year: 2025
   * });
   */
  ContractTemplate.prototype.replacePlaceholders = function (data) {
    let result = this.content;

    // Substituir cada placeholder no formato {{key}}
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value);
    }

    return result;
  };

  /**
   * Extrai lista de placeholders presentes no template
   * @returns {string[]} Array com nomes dos placeholders encontrados
   *
   * @example
   * const placeholders = template.getPlaceholders();
   * // ['studentName', 'courseName', 'semester', 'year']
   */
  ContractTemplate.prototype.getPlaceholders = function () {
    const regex = /{{(\w+)}}/g;
    const placeholders = [];
    let match;

    while ((match = regex.exec(this.content)) !== null) {
      placeholders.push(match[1]);
    }

    return [...new Set(placeholders)]; // Remove duplicados
  };

  /**
   * Métodos Estáticos (Class Methods)
   */

  /**
   * Busca templates ativos (não deletados)
   * @returns {Promise<ContractTemplate[]>}
   */
  ContractTemplate.findActive = async function () {
    return await ContractTemplate.scope('active', 'ordered').findAll();
  };

  /**
   * Busca templates disponíveis para uso (ativos e não deletados)
   * @returns {Promise<ContractTemplate[]>}
   */
  ContractTemplate.findAvailable = async function () {
    return await ContractTemplate.scope('available', 'ordered').findAll();
  };

  /**
   * Busca template ativo por ID
   * @param {number} id - ID do template
   * @returns {Promise<ContractTemplate|null>}
   */
  ContractTemplate.findActiveById = async function (id) {
    return await ContractTemplate.scope('active').findByPk(id);
  };

  /**
   * Busca template por nome
   * @param {string} name - Nome do template
   * @returns {Promise<ContractTemplate|null>}
   */
  ContractTemplate.findByName = async function (name) {
    return await ContractTemplate.findOne({
      where: {
        name: name.trim(),
      },
    });
  };

  /**
   * Configurar associações
   * Executado pelo models/index.js após todos os models serem carregados
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  ContractTemplate.associate = function (models) {
    // Um template pode ter vários contratos
    ContractTemplate.hasMany(models.Contract, {
      foreignKey: 'template_id',
      as: 'contracts',
      onDelete: 'RESTRICT', // Não permite deletar template usado em contratos
      onUpdate: 'CASCADE',
    });
  };

  return ContractTemplate;
};
