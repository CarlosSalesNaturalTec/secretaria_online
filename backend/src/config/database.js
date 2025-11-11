/**
 * Arquivo: src/config/database.js
 * Descrição: Configuração de conexão com MySQL usando Sequelize ORM
 * Feature: feat-006 - Configurar Sequelize e conexão MySQL
 * Criado em: 2025-10-25
 *
 * Este arquivo configura a conexão com o banco de dados MySQL,
 * define pool de conexões e configurações específicas para
 * diferentes ambientes (development, production, test).
 *
 * Utiliza variáveis de ambiente definidas no arquivo .env
 */

require('dotenv').config();

/**
 * Validação de variáveis de ambiente obrigatórias
 * Garante que todas as configurações necessárias estejam presentes
 *
 * @throws {Error} Se alguma variável obrigatória estiver ausente
 */
const validateEnvVariables = () => {
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env file and ensure all database variables are set.\n` +
        `Refer to .env.example for required variables.`
    );
  }
};

// Executar validação
validateEnvVariables();

/**
 * Configuração base do banco de dados
 * Valores padrão seguros e otimizados para shared hosting
 */
const baseConfig = {
  // Credenciais de acesso
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Configurações do Sequelize
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    // Timeout de conexão (30 segundos)
    connectTimeout: 30000,
    // Nota: collation é definido a nível de banco de dados (CREATE DATABASE)
    // e não deve ser passado como opção de conexão no MySQL2
  },

  // Pool de conexões
  // Configurado para shared hosting com limite de ~25-50 conexões
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 25,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  },

  // Definir timezone (importante para campos TIMESTAMP)
  timezone: process.env.DB_TIMEZONE || '-03:00', // America/Sao_Paulo

  // Logging
  // Em desenvolvimento: exibe queries SQL
  // Em produção: desabilitado para melhor performance
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // Define behavior para atributos não definidos no model
  define: {
    // Usar underscored (snake_case) para nomes de colunas
    underscored: true,

    // Adicionar timestamps automáticos (created_at, updated_at)
    timestamps: true,

    // Nome de colunas para timestamps
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    // Habilitar soft deletes (deleted_at ao invés de deletar registro)
    paranoid: true,
    deletedAt: 'deleted_at',

    // Evitar pluralização automática de nomes de tabelas
    freezeTableName: true,
  },
};

/**
 * Configurações específicas por ambiente
 *
 * Development: Configuração local com logging ativado
 * Test: Banco de testes separado, sem logging
 * Production: Configuração otimizada para produção
 */
module.exports = {
  development: {
    ...baseConfig,
    logging: console.log,
  },

  test: {
    ...baseConfig,
    database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`,
    logging: false,
  },

  production: {
    ...baseConfig,
    logging: false,

    // Em produção, pode ser necessário SSL dependendo do servidor
    dialectOptions: {
      ...baseConfig.dialectOptions,
      // Descomentar se o servidor exigir SSL
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false
      // }
    },

    // Pool mais conservador em produção
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 3,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
    },
  },
};
