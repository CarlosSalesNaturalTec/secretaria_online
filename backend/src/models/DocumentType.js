/**
 * Arquivo: backend/src/models/DocumentType.js
 * Descrição: Model para tipos de documentos obrigatórios
 * Feature: feat-012 - Criar migrations para Document e DocumentType
 * Criado em: 2025-10-27
 *
 * Responsabilidades:
 * - Representa tipos de documentos obrigatórios no sistema
 * - Define documentos específicos para alunos, professores ou ambos
 * - Gerencia configurações de obrigatoriedade de documentos
 *
 * @example
 * // Criar novo tipo de documento
 * const docType = await DocumentType.create({
 *   name: 'RG',
 *   description: 'Registro Geral - Documento de Identidade',
 *   user_type: 'both',
 *   is_required: true
 * });
 *
 * // Buscar documentos obrigatórios para alunos
 * const studentDocs = await DocumentType.findRequiredForUserType('student');
 */

'use strict';

/**
 * Factory function do Model DocumentType
 * Executada pelo models/index.js durante inicialização do Sequelize
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model DocumentType configurado
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Model DocumentType
   * Representa tipos de documentos obrigatórios
   */
  const DocumentType = sequelize.define(
    'DocumentType',
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
            msg: 'O nome do tipo de documento é obrigatório',
          },
          notEmpty: {
            msg: 'O nome do tipo de documento não pode estar vazio',
          },
          len: {
            args: [3, 100],
            msg: 'O nome deve ter entre 3 e 100 caracteres',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_type: {
        type: DataTypes.ENUM('student', 'teacher', 'both'),
        allowNull: false,
        defaultValue: 'both',
        validate: {
          notNull: {
            msg: 'O tipo de usuário é obrigatório',
          },
          isIn: {
            args: [['student', 'teacher', 'both']],
            msg: 'Tipo de usuário inválido',
          },
        },
      },
      is_required: {
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
      tableName: 'document_types',
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
        required: {
          where: {
            is_required: true,
          },
        },
        forStudents: {
          where: {
            [sequelize.Sequelize.Op.or]: [
              { user_type: 'student' },
              { user_type: 'both' },
            ],
          },
        },
        forTeachers: {
          where: {
            [sequelize.Sequelize.Op.or]: [
              { user_type: 'teacher' },
              { user_type: 'both' },
            ],
          },
        },
      },
      hooks: {
        beforeValidate: (documentType) => {
          if (documentType.name) {
            documentType.name = documentType.name.trim();
          }
        },
        afterCreate: (documentType) => {
          console.log(
            `[DocumentType] Novo tipo de documento criado: ${documentType.name} (ID: ${documentType.id})`,
          );
        },
        afterUpdate: (documentType) => {
          console.log(
            `[DocumentType] Tipo de documento atualizado: ${documentType.name} (ID: ${documentType.id})`,
          );
        },
        afterDestroy: (documentType) => {
          console.log(
            `[DocumentType] Tipo de documento deletado: ${documentType.name} (ID: ${documentType.id})`,
          );
        },
      },
    },
  );

  /**
   * Métodos de Instância
   */

  /**
   * Verifica se o documento é obrigatório para alunos
   * @returns {boolean}
   */
  DocumentType.prototype.isRequiredForStudents = function () {
    return (
      this.is_required &&
      (this.user_type === 'student' || this.user_type === 'both')
    );
  };

  /**
   * Verifica se o documento é obrigatório para professores
   * @returns {boolean}
   */
  DocumentType.prototype.isRequiredForTeachers = function () {
    return (
      this.is_required &&
      (this.user_type === 'teacher' || this.user_type === 'both')
    );
  };

  /**
   * Verifica se o documento é aplicável para um determinado tipo de usuário
   * @param {string} userRole - Role do usuário (student, teacher)
   * @returns {boolean}
   */
  DocumentType.prototype.isApplicableFor = function (userRole) {
    if (this.user_type === 'both') return true;
    return this.user_type === userRole;
  };

  /**
   * Retorna label amigável para o tipo de usuário
   * @returns {string}
   */
  DocumentType.prototype.getUserTypeLabel = function () {
    const labels = {
      student: 'Aluno',
      teacher: 'Professor',
      both: 'Aluno e Professor',
    };
    return labels[this.user_type] || this.user_type;
  };

  /**
   * Métodos Estáticos (Class Methods)
   */

  /**
   * Busca tipos de documentos obrigatórios para um tipo específico de usuário
   * @param {string} userType - student, teacher ou both
   * @returns {Promise<DocumentType[]>}
   */
  DocumentType.findRequiredForUserType = async function (userType) {
    return await DocumentType.findAll({
      where: {
        is_required: true,
        [sequelize.Sequelize.Op.or]: [
          { user_type: userType },
          { user_type: 'both' },
        ],
      },
    });
  };

  /**
   * Busca tipos de documentos ativos (não deletados)
   * @returns {Promise<DocumentType[]>}
   */
  DocumentType.findActive = async function () {
    return await DocumentType.scope('active').findAll({
      order: [['name', 'ASC']],
    });
  };

  /**
   * Configurar associações
   * Executado pelo models/index.js após todos os models serem carregados
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  DocumentType.associate = function (models) {
    // Um tipo de documento pode ter vários documentos
    DocumentType.hasMany(models.Document, {
      foreignKey: 'document_type_id',
      as: 'documents',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  };

  return DocumentType;
};
