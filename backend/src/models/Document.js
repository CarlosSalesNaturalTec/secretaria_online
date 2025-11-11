/**
 * Arquivo: backend/src/models/Document.js
 * Descrição: Model para documentos enviados pelos usuários
 * Feature: feat-012 - Criar migrations para Document e DocumentType
 * Criado em: 2025-10-27
 *
 * Responsabilidades:
 * - Representa documentos enviados por alunos e professores
 * - Gerencia status de aprovação/rejeição de documentos
 * - Armazena metadados dos arquivos (caminho, tamanho, tipo MIME)
 * - Registra informações de revisão (quem revisou e quando)
 *
 * @example
 * // Criar novo documento
 * const document = await Document.create({
 *   user_id: 1,
 *   document_type_id: 2,
 *   file_path: '/uploads/documents/rg_12345.pdf',
 *   file_name: 'rg.pdf',
 *   file_size: 1024000,
 *   mime_type: 'application/pdf',
 *   status: 'pending'
 * });
 *
 * // Aprovar documento
 * await document.approve(adminId, 'Documento aprovado');
 */

'use strict';

/**
 * Factory function do Model Document
 * Executada pelo models/index.js durante inicialização do Sequelize
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model Document configurado
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Model Document
   * Representa documentos enviados pelos usuários
   */
  const Document = sequelize.define(
    'Document',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O ID do usuário é obrigatório',
          },
          isInt: {
            msg: 'O ID do usuário deve ser um número inteiro',
          },
        },
      },
      document_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O ID do tipo de documento é obrigatório',
          },
          isInt: {
            msg: 'O ID do tipo de documento deve ser um número inteiro',
          },
        },
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O caminho do arquivo é obrigatório',
          },
          notEmpty: {
            msg: 'O caminho do arquivo não pode estar vazio',
          },
        },
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O nome do arquivo é obrigatório',
          },
          notEmpty: {
            msg: 'O nome do arquivo não pode estar vazio',
          },
        },
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: 'O tamanho do arquivo deve ser um número inteiro',
          },
          min: {
            args: [0],
            msg: 'O tamanho do arquivo não pode ser negativo',
          },
        },
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          notNull: {
            msg: 'O status é obrigatório',
          },
          isIn: {
            args: [['pending', 'approved', 'rejected']],
            msg: 'Status inválido',
          },
        },
      },
      reviewed_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'documents',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      scopes: {
        active: {
          where: {
            deleted_at: null,
          },
        },
        pending: {
          where: {
            status: 'pending',
          },
        },
        approved: {
          where: {
            status: 'approved',
          },
        },
        rejected: {
          where: {
            status: 'rejected',
          },
        },
        byStatus(status) {
          return {
            where: {
              status: status,
            },
          };
        },
        recent: {
          order: [['created_at', 'DESC']],
          limit: 50,
        },
        withRelations: {
          include: ['user', 'documentType', 'reviewer'],
        },
      },
      hooks: {
        beforeValidate: (document) => {
          if (document.file_name) {
            document.file_name = document.file_name.trim();
          }
        },
        afterCreate: (document) => {
          console.log(
            `[Document] Novo documento enviado: ${document.file_name} (ID: ${document.id}, User ID: ${document.user_id})`,
          );
        },
        afterUpdate: (document) => {
          if (document.changed('status')) {
            console.log(
              `[Document] Status do documento atualizado: ${document.file_name} (ID: ${document.id}) - Novo status: ${document.status}`,
            );
          }
        },
        afterDestroy: (document) => {
          console.log(
            `[Document] Documento deletado: ${document.file_name} (ID: ${document.id})`,
          );
        },
      },
    },
  );

  /**
   * Métodos de Instância
   */

  /**
   * Verifica se o documento está pendente de aprovação
   * @returns {boolean}
   */
  Document.prototype.isPending = function () {
    return this.status === 'pending';
  };

  /**
   * Verifica se o documento foi aprovado
   * @returns {boolean}
   */
  Document.prototype.isApproved = function () {
    return this.status === 'approved';
  };

  /**
   * Verifica se o documento foi rejeitado
   * @returns {boolean}
   */
  Document.prototype.isRejected = function () {
    return this.status === 'rejected';
  };

  /**
   * Retorna label amigável para o status
   * @returns {string}
   */
  Document.prototype.getStatusLabel = function () {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };
    return labels[this.status] || this.status;
  };

  /**
   * Aprova o documento
   * @param {number} reviewerId - ID do usuário que está aprovando
   * @param {string|null} observations - Observações opcionais
   * @returns {Promise<Document>}
   */
  Document.prototype.approve = async function (reviewerId, observations = null) {
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
   * Rejeita o documento
   * @param {number} reviewerId - ID do usuário que está rejeitando
   * @param {string} observations - Motivo da rejeição
   * @returns {Promise<Document>}
   */
  Document.prototype.reject = async function (reviewerId, observations) {
    if (!observations || observations.trim().length === 0) {
      throw new Error('Observações são obrigatórias ao rejeitar um documento');
    }
    this.status = 'rejected';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    this.observations = observations;
    await this.save();
    return this;
  };

  /**
   * Retorna o tamanho do arquivo formatado
   * @returns {string}
   */
  Document.prototype.getFormattedFileSize = function () {
    if (!this.file_size) return 'N/A';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.file_size === 0) return '0 Bytes';

    const i = parseInt(Math.floor(Math.log(this.file_size) / Math.log(1024)));
    return Math.round(this.file_size / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  /**
   * Métodos Estáticos (Class Methods)
   */

  /**
   * Busca documentos de um usuário específico
   * @param {number} userId - ID do usuário
   * @returns {Promise<Document[]>}
   */
  Document.findByUser = async function (userId) {
    return await Document.findAll({
      where: { user_id: userId },
      include: ['documentType', 'reviewer'],
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Busca documentos por status
   * @param {string} status - pending, approved ou rejected
   * @returns {Promise<Document[]>}
   */
  Document.findByStatus = async function (status) {
    return await Document.scope({ method: ['byStatus', status] }).findAll({
      include: ['user', 'documentType', 'reviewer'],
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Busca documentos pendentes
   * @returns {Promise<Document[]>}
   */
  Document.findPending = async function () {
    return await Document.scope('pending').findAll({
      include: ['user', 'documentType'],
      order: [['created_at', 'ASC']],
    });
  };

  /**
   * Verifica se um usuário já enviou um documento de determinado tipo
   * @param {number} userId - ID do usuário
   * @param {number} documentTypeId - ID do tipo de documento
   * @returns {Promise<Document|null>}
   */
  Document.findByUserAndType = async function (userId, documentTypeId) {
    return await Document.findOne({
      where: {
        user_id: userId,
        document_type_id: documentTypeId,
      },
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Conta documentos pendentes de um usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<number>}
   */
  Document.countPendingByUser = async function (userId) {
    return await Document.count({
      where: {
        user_id: userId,
        status: 'pending',
      },
    });
  };

  /**
   * Conta documentos aprovados de um usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<number>}
   */
  Document.countApprovedByUser = async function (userId) {
    return await Document.count({
      where: {
        user_id: userId,
        status: 'approved',
      },
    });
  };

  /**
   * Configurar associações
   * Executado pelo models/index.js após todos os models serem carregados
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  Document.associate = function (models) {
    // Um documento pertence a um usuário (que enviou)
    Document.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Um documento pertence a um tipo de documento
    Document.belongsTo(models.DocumentType, {
      foreignKey: 'document_type_id',
      as: 'documentType',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Um documento pode ter sido revisado por um usuário admin
    Document.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return Document;
};
