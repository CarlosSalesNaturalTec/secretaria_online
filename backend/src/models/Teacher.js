/**
 * Arquivo: src/models/Teacher.js
 * Descrição: Model Sequelize para a tabela teachers (professores)
 * Feature: feat-110 - Separar tabela de professores
 * Criado em: 2025-12-02
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Teacher
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco (CPF, email, etc)
 * - Soft delete (paranoid) para exclusão lógica
 * - Associação com User (opcional, via teacher_id)
 *
 * @example
 * // Criar novo professor
 * const teacher = await Teacher.create({
 *   nome: 'Maria Silva',
 *   email: 'maria@exemplo.com',
 *   cpf: '12345678901',
 *   data_nascimento: '1980-05-20',
 *   sexo: 2
 * });
 *
 * // Buscar professor com usuário associado
 * const teacher = await Teacher.findByPk(1, {
 *   include: ['user']
 * });
 */

'use strict';

const { Model } = require('sequelize');

/**
 * Validador personalizado de CPF
 * Valida formato e dígitos verificadores do CPF brasileiro
 *
 * @param {string} cpf - CPF a ser validado (apenas números)
 * @returns {boolean} True se CPF válido, false caso contrário
 */
function isValidCPF(cpf) {
  if (!cpf) return true; // CPF é opcional na tabela teachers

  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // CPF deve ter exatamente 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (CPF inválido: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Validar primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

module.exports = (sequelize, DataTypes) => {
  /**
   * Model Teacher
   * Representa um professor da instituição
   */
  class Teacher extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      // Teacher pode ter um User (1:1 opcional)
      Teacher.hasOne(models.User, {
        foreignKey: 'teacher_id',
        as: 'user',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });

      // Associação N:N com Class através de class_teachers
      Teacher.belongsToMany(models.Class, {
        through: 'class_teachers',
        foreignKey: 'teacher_id',
        otherKey: 'class_id',
        as: 'classes'
      });

      // Associação 1:N com Evaluation
      // Um professor pode criar múltiplas avaliações
      Teacher.hasMany(models.Evaluation, {
        foreignKey: 'teacher_id',
        as: 'evaluations',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }

    /**
     * Verifica se o professor está ativo (não foi soft deleted)
     *
     * @returns {boolean} True se ativo, false se deletado
     */
    isActive() {
      return this.deleted_at === null;
    }

    /**
     * Verifica se o professor tem um usuário criado
     *
     * @returns {Promise<boolean>} True se tem usuário, false caso contrário
     */
    async hasUser() {
      if (!this.user && this.id) {
        const User = sequelize.models.User;
        const user = await User.findOne({ where: { teacher_id: this.id } });
        return !!user;
      }
      return !!this.user;
    }

    /**
     * Retorna nome completo formatado
     *
     * @returns {string} Nome completo
     */
    getFullName() {
      return this.nome || 'Sem nome';
    }

    /**
     * Retorna endereço completo formatado
     *
     * @returns {string} Endereço completo
     */
    getFullAddress() {
      const parts = [];
      if (this.endereco_rua) parts.push(this.endereco_rua);
      if (this.endereco_numero) parts.push(this.endereco_numero);
      if (this.endereco_complemento) parts.push(this.endereco_complemento);
      if (this.endereco_bairro) parts.push(this.endereco_bairro);
      if (this.endereco_cidade) parts.push(this.endereco_cidade);
      if (this.endereco_uf) parts.push(this.endereco_uf);
      if (this.endereco_cep) parts.push(`CEP: ${this.endereco_cep}`);

      return parts.join(', ') || 'Endereço não informado';
    }

    /**
     * Customiza serialização JSON
     * Remove campos sensíveis ou desnecessários
     *
     * @returns {Object} Objeto JSON customizado
     */
    toJSON() {
      const values = { ...this.get() };

      // Remove deleted_at se for null (não adiciona poluição visual)
      if (values.deleted_at === null) {
        delete values.deleted_at;
      }

      return values;
    }
  }

  /**
   * Inicializa o model com seus campos e configurações
   */
  Teacher.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do professor',
      },
      nome: {
        type: DataTypes.STRING(200),
        allowNull: true,
        validate: {
          len: {
            args: [0, 200],
            msg: 'Nome deve ter no máximo 200 caracteres',
          },
        },
        comment: 'Nome completo do professor',
      },
      cpf: {
        type: DataTypes.STRING(20),
        allowNull: true,
        // Unique constraint removida - validação de unicidade agora é feita no service
        // considerando soft-delete (paranoid)
        validate: {
          isValidCPF(value) {
            if (value && !isValidCPF(value)) {
              throw new Error('CPF inválido');
            }
          },
        },
        comment: 'CPF do professor',
      },
      data_nascimento: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Data de nascimento',
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Telefone fixo',
      },
      celular: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Celular',
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Email inválido',
          },
        },
        comment: 'Email do professor',
      },
      endereco_rua: {
        type: DataTypes.STRING(300),
        allowNull: true,
        comment: 'Rua/Logradouro',
      },
      endereco_numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Número do endereço',
      },
      endereco_complemento: {
        type: DataTypes.STRING(2000),
        allowNull: true,
        comment: 'Complemento do endereço',
      },
      endereco_bairro: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Bairro',
      },
      endereco_cidade: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Cidade',
      },
      endereco_uf: {
        type: DataTypes.STRING(2),
        allowNull: true,
        validate: {
          len: {
            args: [0, 2],
            msg: 'UF deve ter 2 caracteres',
          },
        },
        comment: 'UF (Estado)',
      },
      endereco_cep: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'CEP',
      },
      sexo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        validate: {
          isIn: {
            args: [[1, 2]],
            msg: 'Sexo deve ser 1 (masculino) ou 2 (feminino)',
          },
        },
        comment: 'Sexo: 1 = masculino, 2 = feminino',
      },
      mae: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nome da mãe',
      },
      pai: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nome do pai',
      },
      titulo_eleitor: {
        type: DataTypes.STRING(25),
        allowNull: true,
        comment: 'Título de eleitor',
      },
      rg: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'RG',
      },
      rg_expedicao: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'Data de expedição do RG',
      },
      foto: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Caminho da foto do professor',
      },
    },
    {
      sequelize,
      modelName: 'Teacher',
      tableName: 'teachers',
      timestamps: true,
      paranoid: true, // Habilita soft delete
      underscored: true, // Converte camelCase do JS para snake_case no SQL

      // Hooks do modelo
      hooks: {
        /**
         * Hook: beforeValidate
         * Executado antes de validar os dados
         * Normaliza dados (trim)
         */
        beforeValidate: (teacher) => {
          if (teacher.nome) teacher.nome = teacher.nome.trim();
          if (teacher.email) teacher.email = teacher.email.trim().toLowerCase();
          if (teacher.cpf) teacher.cpf = teacher.cpf.replace(/[^\d]/g, ''); // Remove caracteres não numéricos
        },

        /**
         * Hook: afterCreate
         * Executado após criar um novo professor
         */
        afterCreate: (teacher) => {
          console.log(`[Teacher] Professor criado: ${teacher.nome} (ID: ${teacher.id})`);
        },

        /**
         * Hook: afterUpdate
         * Executado após atualizar um professor
         */
        afterUpdate: (teacher) => {
          console.log(`[Teacher] Professor atualizado: ${teacher.nome} (ID: ${teacher.id})`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) um professor
         */
        beforeDestroy: (teacher) => {
          console.log(`[Teacher] Professor sendo desativado: ${teacher.nome} (ID: ${teacher.id})`);
        },
      },
    }
  );

  /**
   * Métodos estáticos (class methods)
   */

  /**
   * Busca professor por CPF
   *
   * @param {string} cpf - CPF do professor
   * @returns {Promise<Teacher|null>} Professor encontrado ou null
   */
  Teacher.findByCPF = async function (cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    return this.findOne({ where: { cpf } });
  };

  /**
   * Busca professor por email
   *
   * @param {string} email - Email do professor
   * @returns {Promise<Teacher|null>} Professor encontrado ou null
   */
  Teacher.findByEmail = async function (email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  return Teacher;
};
