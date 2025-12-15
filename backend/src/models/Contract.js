/**
 * Arquivo: backend/src/models/Contract.js
 * Descrição: Model para contratos de alunos e professores
 * Feature: feat-013 - Criar migrations para Contract e ContractTemplate
 * Criado em: 2025-10-27
 *
 * Responsabilidades:
 * - Representa contratos gerados em PDF vinculados a usuários
 * - Gerencia status de aceite de contratos
 * - Fornece métodos para buscar contratos por usuário, período e status
 *
 * @example
 * // Criar novo contrato
 * const contract = await Contract.create({
 *   user_id: 1,
 *   template_id: 1,
 *   file_path: 'uploads/contracts/contract_123.pdf',
 *   file_name: 'contrato_joao_silva_2025_1.pdf',
 *   semester: 1,
 *   year: 2025
 * });
 *
 * // Aceitar contrato
 * await contract.accept();
 *
 * // Buscar contratos pendentes de aceite
 * const pending = await Contract.findPending();
 */

'use strict';

/**
 * Factory function do Model Contract
 * Executada pelo models/index.js durante inicialização do Sequelize
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model Contract configurado
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Model Contract
   * Representa contratos de alunos e professores
   */
  const Contract = sequelize.define(
    'Contract',
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
        },
      },
      enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable para retrocompatibilidade com contratos antigos
        validate: {
          /**
           * Validação customizada: Se enrollment_id é fornecido, deve existir e pertencer ao user_id
           */
          async isValidEnrollment(value) {
            if (value === null || value === undefined) {
              return; // Permite null (contratos antigos)
            }

            // Verifica se enrollment existe
            const { Enrollment, User } = require('./index');
            const enrollment = await Enrollment.findByPk(value);

            if (!enrollment) {
              throw new Error('Enrollment não encontrado');
            }

            // Verifica se enrollment pertence ao usuário do contrato
            if (this.user_id) {
              const user = await User.findByPk(this.user_id);
              if (user && user.student_id && user.student_id !== enrollment.student_id) {
                throw new Error('Enrollment não pertence a este usuário');
              }
            }
          },
        },
      },
      template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O ID do template é obrigatório',
          },
        },
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: true, // ALTERADO: Permite null para contratos de rematrícula sem PDF
        validate: {
          /**
           * Validação customizada: Se fornecido, não pode estar vazio
           */
          isValidPath(value) {
            if (value !== null && value !== undefined && value.trim() === '') {
              throw new Error('file_path, se fornecido, não pode estar vazio');
            }
          },
          /**
           * Validação customizada: file_path e file_name devem ser fornecidos juntos
           */
          bothOrNone(value) {
            const hasPath = value !== null && value !== undefined;
            const hasName = this.file_name !== null && this.file_name !== undefined;

            if (hasPath !== hasName) {
              throw new Error('file_path e file_name devem ser fornecidos juntos ou ambos nulos');
            }
          },
        },
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: true, // ALTERADO: Permite null para contratos de rematrícula sem PDF
        validate: {
          /**
           * Validação customizada: Se fornecido, não pode estar vazio
           */
          isValidFileName(value) {
            if (value !== null && value !== undefined && value.trim() === '') {
              throw new Error('file_name, se fornecido, não pode estar vazio');
            }
          },
        },
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O semestre é obrigatório',
          },
          min: {
            args: [1],
            msg: 'O semestre deve ser maior ou igual a 1',
          },
          max: {
            args: [12],
            msg: 'O semestre deve ser menor ou igual a 12',
          },
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'O ano é obrigatório',
          },
          min: {
            args: [2020],
            msg: 'O ano deve ser maior ou igual a 2020',
          },
          max: {
            args: [2100],
            msg: 'O ano deve ser menor ou igual a 2100',
          },
        },
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
      tableName: 'contracts',
      timestamps: true,
      paranoid: true, // Soft delete
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      scopes: {
        // Scope para buscar apenas contratos ativos (não deletados)
        active: {
          where: {
            deleted_at: null,
          },
        },
        // Scope para buscar contratos pendentes de aceite
        pending: {
          where: {
            accepted_at: null,
          },
        },
        // Scope para buscar contratos aceitos
        accepted: {
          where: {
            accepted_at: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        // Scope para incluir relacionamentos
        withRelations: {
          include: [
            {
              association: 'user',
              attributes: ['id', 'name', 'email', 'role'],
            },
            {
              association: 'template',
              attributes: ['id', 'name'],
            },
          ],
        },
        // Scope para ordenação recente
        recent: {
          order: [['created_at', 'DESC']],
        },
      },
      hooks: {
        beforeValidate: (contract) => {
          // Normalizar nomes de arquivo (trim)
          if (contract.file_path) {
            contract.file_path = contract.file_path.trim();
          }
          if (contract.file_name) {
            contract.file_name = contract.file_name.trim();
          }
        },
        afterCreate: (contract) => {
          console.log(
            `[Contract] Novo contrato criado: ID ${contract.id} para usuário ${contract.user_id}`,
          );
        },
        afterUpdate: (contract) => {
          if (contract.accepted_at && contract.changed('accepted_at')) {
            console.log(
              `[Contract] Contrato aceito: ID ${contract.id} por usuário ${contract.user_id}`,
            );
          }
        },
        afterDestroy: (contract) => {
          console.log(
            `[Contract] Contrato deletado: ID ${contract.id} de usuário ${contract.user_id}`,
          );
        },
      },
    },
  );

  /**
   * Métodos de Instância
   */

  /**
   * Verifica se o contrato foi aceito
   * @returns {boolean}
   */
  Contract.prototype.isAccepted = function () {
    return this.accepted_at !== null;
  };

  /**
   * Verifica se o contrato está pendente de aceite
   * @returns {boolean}
   */
  Contract.prototype.isPending = function () {
    return this.accepted_at === null;
  };

  /**
   * Aceita o contrato (registra data e hora do aceite)
   * @returns {Promise<Contract>}
   */
  Contract.prototype.accept = async function () {
    if (this.isAccepted()) {
      throw new Error('Este contrato já foi aceito');
    }

    this.accepted_at = new Date();
    return await this.save();
  };

  /**
   * Retorna label de status do contrato
   * @returns {string}
   */
  Contract.prototype.getStatusLabel = function () {
    return this.isAccepted() ? 'Aceito' : 'Pendente';
  };

  /**
   * Retorna período do contrato formatado
   * @returns {string}
   */
  Contract.prototype.getPeriodLabel = function () {
    return `${this.semester}º Semestre / ${this.year}`;
  };

  /**
   * Verifica se o contrato é do semestre/ano atual
   * @returns {boolean}
   */
  Contract.prototype.isCurrent = function () {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Simplificação: considera semestre 1 (jan-jun) e semestre 2 (jul-dez)
    const currentSemester = now.getMonth() < 6 ? 1 : 2;

    return this.year === currentYear && this.semester === currentSemester;
  };

  /**
   * Verifica se o contrato possui PDF gerado
   * @returns {boolean}
   */
  Contract.prototype.hasPDF = function () {
    return this.file_path !== null && this.file_name !== null;
  };

  /**
   * Retorna o tipo do contrato (com ou sem PDF)
   * @returns {string}
   */
  Contract.prototype.getContractType = function () {
    return this.hasPDF() ? 'PDF Gerado' : 'Aceite Digital';
  };

  /**
   * Métodos Estáticos (Class Methods)
   */

  /**
   * Busca contratos de um usuário específico
   * @param {number} userId - ID do usuário
   * @returns {Promise<Contract[]>}
   */
  Contract.findByUser = async function (userId) {
    return await Contract.scope('active', 'withRelations', 'recent').findAll({
      where: { user_id: userId },
    });
  };

  /**
   * Busca contratos pendentes de aceite
   * @returns {Promise<Contract[]>}
   */
  Contract.findPending = async function () {
    return await Contract.scope('pending', 'withRelations', 'recent').findAll();
  };

  /**
   * Busca contratos aceitos
   * @returns {Promise<Contract[]>}
   */
  Contract.findAccepted = async function () {
    return await Contract.scope('accepted', 'withRelations', 'recent').findAll();
  };

  /**
   * Busca contratos de um usuário em período específico
   * @param {number} userId - ID do usuário
   * @param {number} semester - Semestre (1-12)
   * @param {number} year - Ano
   * @returns {Promise<Contract[]>}
   */
  Contract.findByUserAndPeriod = async function (userId, semester, year) {
    return await Contract.scope('active', 'withRelations').findAll({
      where: {
        user_id: userId,
        semester: semester,
        year: year,
      },
    });
  };

  /**
   * Busca contratos pendentes de um usuário específico
   * @param {number} userId - ID do usuário
   * @returns {Promise<Contract[]>}
   */
  Contract.findPendingByUser = async function (userId) {
    return await Contract.scope('pending', 'withRelations', 'recent').findAll({
      where: { user_id: userId },
    });
  };

  /**
   * Conta quantos contratos pendentes um usuário tem
   * @param {number} userId - ID do usuário
   * @returns {Promise<number>}
   */
  Contract.countPendingByUser = async function (userId) {
    return await Contract.count({
      where: {
        user_id: userId,
        accepted_at: null,
        deleted_at: null,
      },
    });
  };

  /**
   * Conta quantos contratos aceitos um usuário tem
   * @param {number} userId - ID do usuário
   * @returns {Promise<number>}
   */
  Contract.countAcceptedByUser = async function (userId) {
    return await Contract.count({
      where: {
        user_id: userId,
        accepted_at: {
          [sequelize.Sequelize.Op.ne]: null,
        },
        deleted_at: null,
      },
    });
  };

  /**
   * Configurar associações
   * Executado pelo models/index.js após todos os models serem carregados
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  Contract.associate = function (models) {
    // Um contrato pertence a um usuário
    Contract.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'RESTRICT', // Não permite deletar usuário com contratos
      onUpdate: 'CASCADE',
    });

    // Um contrato pertence a uma matrícula (enrollment) - NOVO
    // Usado para contratos de rematrícula (vínculo explícito com enrollment)
    Contract.belongsTo(models.Enrollment, {
      foreignKey: 'enrollment_id',
      as: 'enrollment',
      onDelete: 'RESTRICT', // Não permite deletar enrollment com contratos
      onUpdate: 'CASCADE',
    });

    // Um contrato pertence a um template
    Contract.belongsTo(models.ContractTemplate, {
      foreignKey: 'template_id',
      as: 'template',
      onDelete: 'RESTRICT', // Não permite deletar template usado em contratos
      onUpdate: 'CASCADE',
    });
  };

  return Contract;
};
