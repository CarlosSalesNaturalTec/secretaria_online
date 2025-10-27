/**
 * Arquivo: src/models/RequestType.js
 * Descrição: Model para tipos de solicitações que alunos podem fazer
 * Feature: feat-015 - Criar migrations para Request e RequestType
 * Criado em: 2025-10-27
 */

/**
 * Define o model RequestType
 *
 * Representa um tipo de solicitação no sistema
 *
 * Responsabilidades:
 * - Definir tipos de solicitações disponíveis (atestado, histórico, certificado, etc)
 * - Armazenar descrição e prazo de resposta
 * - Controlar quais tipos estão ativos/disponíveis
 * - Fornecer métodos auxiliares para gestão de tipos de solicitações
 *
 * Relacionamentos:
 * - hasMany Request - Um tipo de solicitação pode ter muitas solicitações
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model RequestType configurado
 */
module.exports = (sequelize, DataTypes) => {
  const RequestType = sequelize.define(
    'RequestType',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Nome do tipo de solicitação é obrigatório',
          },
          notEmpty: {
            msg: 'Nome do tipo de solicitação não pode estar vazio',
          },
          len: {
            args: [3, 100],
            msg: 'Nome do tipo de solicitação deve ter entre 3 e 100 caracteres',
          },
        },
        comment: 'Nome do tipo de solicitação (ex: Atestado, Histórico Escolar)',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do tipo de solicitação',
      },
      response_deadline_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
          notNull: {
            msg: 'Prazo de resposta é obrigatório',
          },
          isInt: {
            msg: 'Prazo de resposta deve ser um número inteiro',
          },
          min: {
            args: [0],
            msg: 'Prazo de resposta não pode ser negativo',
          },
        },
        comment: 'Prazo de resposta em dias úteis',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Define se o tipo de solicitação está ativo/disponível',
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'RequestType',
      tableName: 'request_types',
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
      hooks: {
        /**
         * Hook executado antes de validar
         * Normaliza o nome removendo espaços extras
         */
        beforeValidate: (requestType) => {
          if (requestType.name) {
            requestType.name = requestType.name.trim();
          }
        },
        /**
         * Hook executado após criar
         * Registra log de criação
         */
        afterCreate: (requestType) => {
          console.log(
            `[RequestType] Tipo de solicitação criado: ${requestType.name} (ID: ${requestType.id})`
          );
        },
        /**
         * Hook executado após atualizar
         * Registra log de atualização
         */
        afterUpdate: (requestType) => {
          console.log(
            `[RequestType] Tipo de solicitação atualizado: ${requestType.name} (ID: ${requestType.id})`
          );
        },
        /**
         * Hook executado após deletar (soft delete)
         * Registra log de exclusão
         */
        afterDestroy: (requestType) => {
          console.log(
            `[RequestType] Tipo de solicitação deletado: ${requestType.name} (ID: ${requestType.id})`
          );
        },
      },
      scopes: {
        /**
         * Scope para tipos de solicitações ativos (não deletados)
         */
        active: {
          where: {
            deleted_at: null,
          },
        },
        /**
         * Scope para tipos de solicitações disponíveis (ativos e habilitados)
         */
        available: {
          where: {
            is_active: true,
            deleted_at: null,
          },
        },
        /**
         * Scope para tipos de solicitações ordenados por nome
         */
        ordered: {
          order: [['name', 'ASC']],
        },
      },
    }
  );

  // ==================== MÉTODOS DE INSTÂNCIA ====================

  /**
   * Verifica se o tipo de solicitação está ativo e disponível
   * @returns {boolean}
   */
  RequestType.prototype.isActive = function () {
    return this.is_active && !this.deleted_at;
  };

  /**
   * Ativa o tipo de solicitação
   * @returns {Promise<RequestType>}
   */
  RequestType.prototype.activate = async function () {
    this.is_active = true;
    await this.save();
    return this;
  };

  /**
   * Desativa o tipo de solicitação
   * @returns {Promise<RequestType>}
   */
  RequestType.prototype.deactivate = async function () {
    this.is_active = false;
    await this.save();
    return this;
  };

  /**
   * Retorna descrição formatada do prazo de resposta
   * @returns {string}
   */
  RequestType.prototype.getDeadlineLabel = function () {
    return `${this.response_deadline_days} ${this.response_deadline_days === 1 ? 'dia útil' : 'dias úteis'}`;
  };

  /**
   * Retorna o status do tipo de solicitação
   * @returns {string}
   */
  RequestType.prototype.getStatusLabel = function () {
    if (this.deleted_at) return 'Deletado';
    if (this.is_active) return 'Ativo';
    return 'Inativo';
  };

  // ==================== MÉTODOS ESTÁTICOS ====================

  /**
   * Busca tipos de solicitações ativos
   * @returns {Promise<RequestType[]>}
   */
  RequestType.findActive = async function () {
    return await this.scope('active', 'ordered').findAll();
  };

  /**
   * Busca tipos de solicitações disponíveis
   * @returns {Promise<RequestType[]>}
   */
  RequestType.findAvailable = async function () {
    return await this.scope('available', 'ordered').findAll();
  };

  /**
   * Busca tipo de solicitação ativo por ID
   * @param {number} id - ID do tipo de solicitação
   * @returns {Promise<RequestType|null>}
   */
  RequestType.findActiveById = async function (id) {
    return await this.scope('active').findByPk(id);
  };

  /**
   * Busca tipo de solicitação por nome
   * @param {string} name - Nome do tipo de solicitação
   * @returns {Promise<RequestType|null>}
   */
  RequestType.findByName = async function (name) {
    return await this.findOne({
      where: {
        name: name.trim(),
        deleted_at: null,
      },
    });
  };

  /**
   * Conta quantos tipos de solicitações ativos existem
   * @returns {Promise<number>}
   */
  RequestType.countActive = async function () {
    return await this.scope('active').count();
  };

  /**
   * Conta quantos tipos de solicitações disponíveis existem
   * @returns {Promise<number>}
   */
  RequestType.countAvailable = async function () {
    return await this.scope('available').count();
  };

  // ==================== ASSOCIAÇÕES ====================

  /**
   * Define associações do model
   * @param {Object} models - Objeto contendo todos os models
   */
  RequestType.associate = function (models) {
    // Um tipo de solicitação pode ter muitas solicitações
    RequestType.hasMany(models.Request, {
      foreignKey: 'request_type_id',
      as: 'requests',
    });
  };

  return RequestType;
};
