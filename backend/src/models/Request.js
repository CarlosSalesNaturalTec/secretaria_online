/**
 * Arquivo: src/models/Request.js
 * Descrição: Model para solicitações feitas por alunos
 * Feature: feat-015 - Criar migrations para Request e RequestType
 * Criado em: 2025-10-27
 */

/**
 * Define o model Request
 *
 * Representa uma solicitação feita por um aluno no sistema
 *
 * Responsabilidades:
 * - Registrar solicitações de alunos (atestado, histórico, certificado, etc)
 * - Controlar status (pendente, aprovada, rejeitada)
 * - Armazenar informações de revisão (quem revisou, quando, observações)
 * - Fornecer métodos auxiliares para gestão de solicitações
 *
 * Relacionamentos:
 * - belongsTo User (student) - Aluno que fez a solicitação
 * - belongsTo User (reviewer) - Admin que revisou a solicitação
 * - belongsTo RequestType - Tipo de solicitação
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model Request configurado
 */
module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define(
    'Request',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'ID do aluno é obrigatório',
          },
          isInt: {
            msg: 'ID do aluno deve ser um número inteiro',
          },
        },
        comment: 'FK para users - aluno que fez a solicitação',
      },
      request_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Tipo de solicitação é obrigatório',
          },
          isInt: {
            msg: 'ID do tipo de solicitação deve ser um número inteiro',
          },
        },
        comment: 'FK para request_types - tipo de solicitação',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição/justificativa da solicitação fornecida pelo aluno',
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'approved', 'rejected']],
            msg: 'Status deve ser: pending, approved ou rejected',
          },
        },
        comment:
          'Status da solicitação: pending (pendente), approved (aprovada), rejected (rejeitada)',
      },
      reviewed_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        validate: {
          isInt: {
            msg: 'ID do revisor deve ser um número inteiro',
          },
        },
        comment: 'FK para users - admin que revisou a solicitação',
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data e hora da revisão',
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações do revisor sobre a aprovação/rejeição',
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Request',
      tableName: 'requests',
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
      hooks: {
        /**
         * Hook executado antes de validar
         * Normaliza descrição e observações
         */
        beforeValidate: (request) => {
          if (request.description) {
            request.description = request.description.trim();
          }
          if (request.observations) {
            request.observations = request.observations.trim();
          }
        },
        /**
         * Hook executado após criar
         * Registra log de criação
         */
        afterCreate: (request) => {
          console.log(
            `[Request] Solicitação criada (ID: ${request.id}, Status: ${request.status})`
          );
        },
        /**
         * Hook executado após atualizar
         * Registra log de atualização
         */
        afterUpdate: (request) => {
          console.log(
            `[Request] Solicitação atualizada (ID: ${request.id}, Status: ${request.status})`
          );
        },
        /**
         * Hook executado após deletar (soft delete)
         * Registra log de exclusão
         */
        afterDestroy: (request) => {
          console.log(`[Request] Solicitação deletada (ID: ${request.id})`);
        },
      },
      scopes: {
        /**
         * Scope para solicitações ativas (não deletadas)
         */
        active: {
          where: {
            deleted_at: null,
          },
        },
        /**
         * Scope para solicitações pendentes
         */
        pending: {
          where: {
            status: 'pending',
            deleted_at: null,
          },
        },
        /**
         * Scope para solicitações aprovadas
         */
        approved: {
          where: {
            status: 'approved',
            deleted_at: null,
          },
        },
        /**
         * Scope para solicitações rejeitadas
         */
        rejected: {
          where: {
            status: 'rejected',
            deleted_at: null,
          },
        },
        /**
         * Scope para buscar por status
         * @param {string} status - Status da solicitação
         */
        byStatus: (status) => ({
          where: {
            status,
            deleted_at: null,
          },
        }),
        /**
         * Scope para incluir relações
         */
        withRelations: {
          include: [
            {
              association: 'student',
              attributes: ['id', 'name', 'email'],
            },
            {
              association: 'reviewer',
              attributes: ['id', 'name', 'email'],
            },
            {
              association: 'requestType',
              attributes: ['id', 'name', 'response_deadline_days'],
            },
          ],
        },
        /**
         * Scope para solicitações recentes (últimos 30 dias)
         */
        recent: {
          where: {
            created_at: {
              [sequelize.Sequelize.Op.gte]: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ),
            },
            deleted_at: null,
          },
          order: [['created_at', 'DESC']],
        },
      },
    }
  );

  // ==================== MÉTODOS DE INSTÂNCIA ====================

  /**
   * Verifica se a solicitação está ativa (não deletada)
   * @returns {boolean}
   */
  Request.prototype.isActive = function () {
    return !this.deleted_at;
  };

  /**
   * Verifica se a solicitação está pendente
   * @returns {boolean}
   */
  Request.prototype.isPending = function () {
    return this.status === 'pending';
  };

  /**
   * Verifica se a solicitação foi aprovada
   * @returns {boolean}
   */
  Request.prototype.isApproved = function () {
    return this.status === 'approved';
  };

  /**
   * Verifica se a solicitação foi rejeitada
   * @returns {boolean}
   */
  Request.prototype.isRejected = function () {
    return this.status === 'rejected';
  };

  /**
   * Retorna label do status
   * @returns {string}
   */
  Request.prototype.getStatusLabel = function () {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
    };
    return labels[this.status] || 'Desconhecido';
  };

  /**
   * Aprova a solicitação
   * @param {number} reviewerId - ID do admin que está aprovando
   * @param {string} observations - Observações sobre a aprovação
   * @returns {Promise<Request>}
   */
  Request.prototype.approve = async function (reviewerId, observations = null) {
    this.status = 'approved';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    if (observations) {
      this.observations = observations;
    }
    await this.save();
    return this;
  };

  /**
   * Rejeita a solicitação
   * @param {number} reviewerId - ID do admin que está rejeitando
   * @param {string} observations - Observações sobre a rejeição
   * @returns {Promise<Request>}
   */
  Request.prototype.reject = async function (reviewerId, observations = null) {
    this.status = 'rejected';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    if (observations) {
      this.observations = observations;
    }
    await this.save();
    return this;
  };

  /**
   * Formata a data de criação
   * @returns {string}
   */
  Request.prototype.getFormattedCreatedAt = function () {
    return this.created_at.toLocaleString('pt-BR');
  };

  /**
   * Formata a data de revisão
   * @returns {string|null}
   */
  Request.prototype.getFormattedReviewedAt = function () {
    return this.reviewed_at ? this.reviewed_at.toLocaleString('pt-BR') : null;
  };

  // ==================== MÉTODOS ESTÁTICOS ====================

  /**
   * Busca solicitações de um aluno específico
   * @param {number} studentId - ID do aluno
   * @returns {Promise<Request[]>}
   */
  Request.findByStudent = async function (studentId) {
    return await this.scope('active', 'withRelations').findAll({
      where: { student_id: studentId },
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Busca solicitações por status
   * @param {string} status - Status da solicitação
   * @returns {Promise<Request[]>}
   */
  Request.findByStatus = async function (status) {
    return await this.scope('withRelations').findAll({
      where: {
        status,
        deleted_at: null,
      },
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Busca solicitações pendentes
   * @returns {Promise<Request[]>}
   */
  Request.findPending = async function () {
    return await this.scope('pending', 'withRelations').findAll({
      order: [['created_at', 'ASC']],
    });
  };

  /**
   * Busca solicitações de um aluno por status
   * @param {number} studentId - ID do aluno
   * @param {string} status - Status da solicitação
   * @returns {Promise<Request[]>}
   */
  Request.findByStudentAndStatus = async function (studentId, status) {
    return await this.scope('withRelations').findAll({
      where: {
        student_id: studentId,
        status,
        deleted_at: null,
      },
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Conta solicitações pendentes de um aluno
   * @param {number} studentId - ID do aluno
   * @returns {Promise<number>}
   */
  Request.countPendingByStudent = async function (studentId) {
    return await this.count({
      where: {
        student_id: studentId,
        status: 'pending',
        deleted_at: null,
      },
    });
  };

  /**
   * Conta solicitações por status
   * @param {string} status - Status da solicitação
   * @returns {Promise<number>}
   */
  Request.countByStatus = async function (status) {
    return await this.count({
      where: {
        status,
        deleted_at: null,
      },
    });
  };

  /**
   * Conta total de solicitações pendentes
   * @returns {Promise<number>}
   */
  Request.countPending = async function () {
    return await this.countByStatus('pending');
  };

  /**
   * Busca solicitações de um tipo específico
   * @param {number} requestTypeId - ID do tipo de solicitação
   * @returns {Promise<Request[]>}
   */
  Request.findByType = async function (requestTypeId) {
    return await this.scope('active', 'withRelations').findAll({
      where: { request_type_id: requestTypeId },
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Busca solicitações revisadas por um admin específico
   * @param {number} reviewerId - ID do admin revisor
   * @returns {Promise<Request[]>}
   */
  Request.findByReviewer = async function (reviewerId) {
    return await this.scope('active', 'withRelations').findAll({
      where: { reviewed_by: reviewerId },
      order: [['reviewed_at', 'DESC']],
    });
  };

  // ==================== ASSOCIAÇÕES ====================

  /**
   * Define associações do model
   * @param {Object} models - Objeto contendo todos os models
   */
  Request.associate = function (models) {
    // Solicitação pertence a um aluno (User com role='student')
    Request.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student',
    });

    // Solicitação é revisada por um admin (User com role='admin')
    Request.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer',
    });

    // Solicitação pertence a um tipo de solicitação
    Request.belongsTo(models.RequestType, {
      foreignKey: 'request_type_id',
      as: 'requestType',
    });
  };

  return Request;
};
