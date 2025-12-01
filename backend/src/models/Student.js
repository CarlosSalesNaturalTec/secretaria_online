/**
 * Arquivo: src/models/Student.js
 * Descrição: Model Sequelize para a tabela students (estudantes)
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-12-01
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade Student
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco (CPF, email, etc)
 * - Soft delete (paranoid) para exclusão lógica
 * - Associação com User (opcional, via student_id)
 *
 * @example
 * // Criar novo estudante
 * const student = await Student.create({
 *   nome: 'João Silva',
 *   email: 'joao@exemplo.com',
 *   cpf: '12345678901',
 *   data_nascimento: '2000-01-15',
 *   sexo: 1
 * });
 *
 * // Buscar estudante com usuário associado
 * const student = await Student.findByPk(1, {
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
  if (!cpf) return true; // CPF é opcional na tabela students

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
   * Model Student
   * Representa um estudante da instituição
   */
  class Student extends Model {
    /**
     * Define associações entre models
     * Será configurada automaticamente pelo Sequelize
     *
     * @param {Object} models - Objeto contendo todos os models
     */
    static associate(models) {
      // Student pode ter um User (1:1 opcional)
      Student.hasOne(models.User, {
        foreignKey: 'student_id',
        as: 'user',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });

      // Associações futuras com outras entidades
      // Student.hasMany(models.Enrollment, { ... });
      // Student.hasMany(models.Grade, { ... });
    }

    /**
     * Verifica se o estudante está ativo (não foi soft deleted)
     *
     * @returns {boolean} True se ativo, false se deletado
     */
    isActive() {
      return this.deleted_at === null;
    }

    /**
     * Verifica se o estudante tem um usuário criado
     *
     * @returns {Promise<boolean>} True se tem usuário, false caso contrário
     */
    async hasUser() {
      if (!this.user && this.id) {
        const User = sequelize.models.User;
        const user = await User.findOne({ where: { student_id: this.id } });
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
      if (this.cep) parts.push(`CEP: ${this.cep}`);

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

      // Remove senha (deprecated - usar tabela users)
      delete values.senha;

      return values;
    }
  }

  /**
   * Inicializa o model com seus campos e configurações
   */
  Student.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do estudante',
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
        comment: 'Nome completo do estudante',
      },
      cpf: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: {
          msg: 'Este CPF já está cadastrado',
        },
        validate: {
          isValidCPF(value) {
            if (value && !isValidCPF(value)) {
              throw new Error('CPF inválido');
            }
          },
        },
        comment: 'CPF do estudante',
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
      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Email inválido',
          },
        },
        comment: 'Email do estudante',
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
      cep: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'CEP',
      },
      sexo: {
        type: DataTypes.BIGINT,
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
      celular: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Celular',
      },
      categoria: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Categoria do estudante',
      },
      sub_categoria: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Sub-categoria do estudante',
      },
      matricula: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Número de matrícula',
      },
      ano_matricula: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Ano da matrícula',
      },
      profissao: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Profissão do estudante',
      },
      responsavel: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Responsável legal (se menor de idade)',
      },
      contrato: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Referência ao contrato',
      },
      foto: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Caminho da foto do estudante',
      },
      senha: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Senha (deprecated - usar tabela users)',
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
      rg_data: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'Data de emissão do RG',
      },
      serie: {
        type: DataTypes.STRING(35),
        allowNull: true,
        comment: 'Série/Período',
      },
      curso: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Curso',
      },
      semestre: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Semestre atual',
      },
      contrato_aceito: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: 'Contrato aceito: S/N',
      },
      contrato_dia: {
        type: DataTypes.STRING(5),
        allowNull: true,
        comment: 'Dia de aceite do contrato',
      },
      contrato_mes: {
        type: DataTypes.STRING(5),
        allowNull: true,
        comment: 'Mês de aceite do contrato',
      },
      contrato_ano: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Ano de aceite do contrato',
      },
      chave_eletronica: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Chave eletrônica de acesso',
      },
      data_geral: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Data geral de cadastro',
      },
    },
    {
      sequelize,
      modelName: 'Student',
      tableName: 'students',
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
        beforeValidate: (student) => {
          if (student.nome) student.nome = student.nome.trim();
          if (student.email) student.email = student.email.trim().toLowerCase();
          if (student.cpf) student.cpf = student.cpf.replace(/[^\d]/g, ''); // Remove caracteres não numéricos
        },

        /**
         * Hook: afterCreate
         * Executado após criar um novo estudante
         */
        afterCreate: (student) => {
          console.log(`[Student] Estudante criado: ${student.nome} (ID: ${student.id})`);
        },

        /**
         * Hook: afterUpdate
         * Executado após atualizar um estudante
         */
        afterUpdate: (student) => {
          console.log(`[Student] Estudante atualizado: ${student.nome} (ID: ${student.id})`);
        },

        /**
         * Hook: beforeDestroy
         * Executado antes de deletar (soft delete) um estudante
         */
        beforeDestroy: (student) => {
          console.log(`[Student] Estudante sendo desativado: ${student.nome} (ID: ${student.id})`);
        },
      },
    }
  );

  /**
   * Métodos estáticos (class methods)
   */

  /**
   * Busca estudante por CPF
   *
   * @param {string} cpf - CPF do estudante
   * @returns {Promise<Student|null>} Estudante encontrado ou null
   */
  Student.findByCPF = async function (cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    return this.findOne({ where: { cpf } });
  };

  /**
   * Busca estudante por email
   *
   * @param {string} email - Email do estudante
   * @returns {Promise<Student|null>} Estudante encontrado ou null
   */
  Student.findByEmail = async function (email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  /**
   * Busca estudante por matrícula
   *
   * @param {number} matricula - Número de matrícula
   * @returns {Promise<Student|null>} Estudante encontrado ou null
   */
  Student.findByMatricula = async function (matricula) {
    return this.findOne({ where: { matricula } });
  };

  return Student;
};
