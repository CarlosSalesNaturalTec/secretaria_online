/**
 * Arquivo: src/models/User.js
 * Descrição: Model Sequelize para a tabela users (administradores, professores e alunos)
 * Feature: feat-007 - Criar migration e model User
 * Criado em: 2025-10-25
 *
 * Responsabilidades:
 * - Definir estrutura e validações para a entidade User
 * - Implementar métodos de instância e estáticos
 * - Validar dados antes de salvar no banco (CPF, email, etc)
 * - Hash automático de senha antes de criar/atualizar
 * - Soft delete (paranoid) para exclusão lógica
 * - Ocultar senha em respostas JSON
 *
 * @example
 * // Criar novo usuário
 * const user = await User.create({
 *   role: 'student',
 *   name: 'João Silva',
 *   email: 'joao@exemplo.com',
 *   login: 'joao.silva',
 *   password: 'senha123',  // Será hasheado automaticamente
 *   cpf: '12345678901',
 *   rg: 'MG1234567'
 * });
 *
 * // Validar senha
 * const isValid = await user.validatePassword('senha123');
 *
 * // Buscar apenas alunos ativos
 * const students = await User.findAll({ where: { role: 'student' } });
 */

'use strict';

const bcrypt = require('bcryptjs');

/**
 * Constantes para configuração de hash de senha
 */
const BCRYPT_SALT_ROUNDS = 10; // Nível de segurança do hash (10 é padrão recomendado)

/**
 * Validador personalizado de CPF
 * Valida formato e dígitos verificadores do CPF brasileiro
 *
 * @param {string} cpf - CPF a ser validado (apenas números)
 * @returns {boolean} True se CPF válido, false caso contrário
 */
function isValidCPF(cpf) {
  // CPF deve ter exatamente 11 dígitos
  if (!cpf || cpf.length !== 11) {
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

/**
 * Factory function do Model User
 * Executada pelo models/index.js durante inicialização do Sequelize
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model User configurado
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Model User
   * Representa usuários do sistema (admin, teacher, student)
   */
  const User = sequelize.define(
    'User',
    {
      // Definição dos campos (attributes)
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único do usuário',
      },

      role: {
        type: DataTypes.ENUM('admin', 'teacher', 'student'),
        allowNull: false,
        defaultValue: 'student',
        validate: {
          isIn: {
            args: [['admin', 'teacher', 'student']],
            msg: 'Role deve ser: admin, teacher ou student',
          },
        },
        comment: 'Perfil do usuário no sistema',
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Nome é obrigatório',
          },
          len: {
            args: [3, 255],
            msg: 'Nome deve ter entre 3 e 255 caracteres',
          },
        },
        comment: 'Nome completo do usuário',
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: 'unique_email',
          msg: 'Este email já está cadastrado',
        },
        validate: {
          isEmail: {
            msg: 'Email inválido',
          },
          notEmpty: {
            msg: 'Email é obrigatório',
          },
        },
        comment: 'Email único para contato',
      },

      login: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          name: 'unique_login',
          msg: 'Este login já está cadastrado',
        },
        validate: {
          notEmpty: {
            msg: 'Login é obrigatório',
          },
          len: {
            args: [3, 100],
            msg: 'Login deve ter entre 3 e 100 caracteres',
          },
          isAlphanumeric: {
            msg: 'Login deve conter apenas letras e números (sem espaços ou caracteres especiais)',
          },
        },
        comment: 'Login único para autenticação',
      },

      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Hash bcrypt da senha',
      },

      // Campo virtual para receber senha em texto plano
      password: {
        type: DataTypes.VIRTUAL,
        allowNull: true,
        validate: {
          len: {
            args: [6, 100],
            msg: 'Senha deve ter entre 6 e 100 caracteres',
          },
        },
        /**
         * FIX: Setter customizado para processar senha
         *
         * Problema: Hooks beforeCreate/beforeUpdate com getDataValue não funcionavam
         * Solução: Usar setter que processa senha e define password_hash automaticamente
         * Data: 2025-10-25
         *
         * FIX v2: Marcar password_hash como alterado no setter
         * Problema: Sequelize determinava campos do UPDATE antes dos hooks
         * Solução: Chamar this.changed() no setter para forçar inclusão no UPDATE
         * Data: 2025-10-26
         *
         * O setter é executado quando user.password = 'valor' é atribuído
         */
        set(value) {
          if (value) {
            // Armazenar temporariamente a senha em texto plano
            this.setDataValue('password', value);
            // Marcar que password_hash precisa ser atualizado
            this._passwordNeedsHash = value;
            // Marcar explicitamente que password_hash será alterado
            // CRÍTICO: Deve ser feito no setter para que Sequelize inclua no UPDATE
            this.changed('password_hash', true);
          }
        },
        comment: 'Campo virtual para receber senha (nunca armazenado no DB)',
      },

      cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: {
          name: 'unique_cpf',
          msg: 'Este CPF já está cadastrado',
        },
        validate: {
          notEmpty: {
            msg: 'CPF é obrigatório',
          },
          len: {
            args: [11, 11],
            msg: 'CPF deve ter exatamente 11 dígitos (apenas números)',
          },
          isNumeric: {
            msg: 'CPF deve conter apenas números',
          },
          isValidCPF(value) {
            if (!isValidCPF(value)) {
              throw new Error('CPF inválido');
            }
          },
        },
        comment: 'CPF do usuário (apenas números)',
      },

      rg: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: {
            args: [0, 20],
            msg: 'RG deve ter no máximo 20 caracteres',
          },
        },
        comment: 'RG do usuário',
      },
    },
    {
      // Opções do model
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true, // Ativa created_at e updated_at
      paranoid: true, // Ativa soft delete (deleted_at)
      underscored: true, // Usa snake_case para colunas (created_at ao invés de createdAt)

      // Hooks (lifecycle callbacks)
      hooks: {
        /**
         * Hook executado antes de validar (antes de criar ou atualizar)
         * Responsável por fazer hash da senha
         *
         * @param {User} user - Instância do usuário
         *
         * FIX v2: Usar beforeValidate e propriedade temporária _passwordNeedsHash
         * Problema: Hooks beforeCreate/beforeUpdate não acessavam campo virtual corretamente
         * Solução v1 (falhou): Tentou usar getDataValue('password')
         * Solução v2 (atual): Setter customizado marca senha para hash, hook processa antes da validação
         * Data: 2025-10-25
         *
         * FIX v3: Marcar explicitamente que password_hash foi alterado
         * Problema: Em updates, Sequelize não detectava mudança em password_hash
         * Solução: Usar user.changed('password_hash', true) para forçar detecção
         * Data: 2025-10-26
         *
         * beforeValidate é executado ANTES de beforeCreate/beforeUpdate, garantindo que
         * password_hash esteja preenchido antes das validações de NOT NULL
         */
        beforeValidate: async (user) => {
          // Verificar se há senha marcada para hash pelo setter
          if (user._passwordNeedsHash) {
            const password = user._passwordNeedsHash;
            // Gerar hash bcrypt
            const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
            // Definir password_hash
            user.password_hash = hash;
            // Marcar explicitamente que password_hash foi alterado
            // Necessário para que Sequelize detecte a mudança em updates
            user.changed('password_hash', true);
            // Limpar flag temporária
            delete user._passwordNeedsHash;
          }
        },
      },

      // Configurar como campos serão retornados em JSON
      defaultScope: {
        // Por padrão, não retorna password_hash em queries
        attributes: {
          exclude: ['password_hash'],
        },
      },

      // Scopes personalizados para queries específicas
      scopes: {
        // Scope para incluir password_hash (usado em autenticação)
        withPassword: {
          attributes: {
            include: ['password_hash'],
          },
        },

        // Scope para buscar apenas admins
        admins: {
          where: {
            role: 'admin',
          },
        },

        // Scope para buscar apenas professores
        teachers: {
          where: {
            role: 'teacher',
          },
        },

        // Scope para buscar apenas alunos
        students: {
          where: {
            role: 'student',
          },
        },
      },
    }
  );

  /**
   * Métodos de instância
   * Disponíveis em cada instância de User (ex: user.validatePassword())
   */

  /**
   * Valida se a senha fornecida corresponde ao hash armazenado
   * Usado durante login/autenticação
   *
   * @param {string} password - Senha em texto plano a ser validada
   * @returns {Promise<boolean>} True se senha válida, false caso contrário
   *
   * @example
   * const user = await User.scope('withPassword').findOne({ where: { login: 'joao' } });
   * const isValid = await user.validatePassword('senha123');
   */
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  /**
   * Retorna dados públicos do usuário (sem informações sensíveis)
   * Útil para retornar em APIs
   *
   * @returns {Object} Objeto com dados públicos do usuário
   *
   * @example
   * const user = await User.findByPk(1);
   * res.json(user.getPublicData());
   */
  User.prototype.getPublicData = function () {
    return {
      id: this.id,
      role: this.role,
      name: this.name,
      email: this.email,
      login: this.login,
      cpf: this.cpf,
      rg: this.rg,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  };

  /**
   * Verifica se o usuário é administrador
   *
   * @returns {boolean} True se admin, false caso contrário
   */
  User.prototype.isAdmin = function () {
    return this.role === 'admin';
  };

  /**
   * Verifica se o usuário é professor
   *
   * @returns {boolean} True se professor, false caso contrário
   */
  User.prototype.isTeacher = function () {
    return this.role === 'teacher';
  };

  /**
   * Verifica se o usuário é aluno
   *
   * @returns {boolean} True se aluno, false caso contrário
   */
  User.prototype.isStudent = function () {
    return this.role === 'student';
  };

  /**
   * Métodos estáticos (class methods)
   * Disponíveis diretamente no Model (ex: User.findByLogin())
   */

  /**
   * Busca usuário por login (incluindo password_hash para autenticação)
   *
   * @param {string} login - Login do usuário
   * @returns {Promise<User|null>} Usuário encontrado ou null
   *
   * @example
   * const user = await User.findByLogin('joao.silva');
   */
  User.findByLogin = async function (login) {
    return this.scope('withPassword').findOne({
      where: { login },
    });
  };

  /**
   * Busca usuário por email
   *
   * @param {string} email - Email do usuário
   * @returns {Promise<User|null>} Usuário encontrado ou null
   *
   * @example
   * const user = await User.findByEmail('joao@exemplo.com');
   */
  User.findByEmail = async function (email) {
    return this.findOne({
      where: { email },
    });
  };

  /**
   * Busca usuário por CPF
   *
   * @param {string} cpf - CPF do usuário (apenas números)
   * @returns {Promise<User|null>} Usuário encontrado ou null
   *
   * @example
   * const user = await User.findByCPF('12345678901');
   */
  User.findByCPF = async function (cpf) {
    return this.findOne({
      where: { cpf },
    });
  };

  /**
   * Associações (relationships)
   * Serão configuradas após todos os models serem carregados
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  User.associate = function (models) {
    // User (aluno) tem muitas Matrículas (Enrollments)
    User.hasMany(models.Enrollment, {
      foreignKey: 'student_id',
      as: 'enrollments',
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });

    // User tem muitos Documentos
    User.hasMany(models.Document, {
      foreignKey: 'user_id',
      as: 'documents',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // User (admin) pode ter revisado muitos Documentos
    User.hasMany(models.Document, {
      foreignKey: 'reviewed_by',
      as: 'reviewedDocuments',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // User (professor) tem muitas Avaliações
    User.hasMany(models.Evaluation, {
      foreignKey: 'teacher_id',
      as: 'evaluations',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // User (aluno) tem muitas Notas
    User.hasMany(models.Grade, {
      foreignKey: 'student_id',
      as: 'grades',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // TODO: Adicionar outras associações quando models forem criados
    // User.hasMany(models.Contract, { foreignKey: 'user_id', as: 'contracts' });
  };

  return User;
};
