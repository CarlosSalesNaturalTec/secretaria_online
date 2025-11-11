/**
 * Arquivo: src/models/index.js
 * Descrição: Inicialização do Sequelize e carregamento dinâmico de models
 * Feature: feat-006 - Configurar Sequelize e conexão MySQL
 * Criado em: 2025-10-25
 *
 * Este arquivo é responsável por:
 * - Inicializar a conexão com o banco de dados usando Sequelize
 * - Carregar dinamicamente todos os models da pasta models/
 * - Configurar associações entre models
 * - Exportar a instância do Sequelize e todos os models
 *
 * Uso:
 *   const { sequelize, User, Course } = require('./models');
 *   await sequelize.authenticate(); // Testar conexão
 */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Carregar configuração do banco de dados
const config = require('../config/database.js');

// Determinar ambiente atual
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Objeto para armazenar models
const db = {};

/**
 * Inicializar conexão Sequelize
 * Cria uma instância do Sequelize com as configurações do ambiente atual
 */
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

/**
 * Carregar todos os models dinamicamente
 *
 * Lê todos os arquivos .js da pasta models/ (exceto index.js)
 * e importa cada model para o objeto db
 */
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && // Ignorar arquivos ocultos
      file !== 'index.js' && // Ignorar este arquivo
      file.slice(-3) === '.js' && // Apenas arquivos .js
      file.indexOf('.test.js') === -1 // Ignorar arquivos de teste
    );
  })
  .forEach((file) => {
    // Importar model
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);

    // Adicionar ao objeto db usando o nome do model
    db[model.name] = model;
  });

/**
 * Configurar associações entre models
 *
 * Se um model possui método 'associate', executa para criar
 * relacionamentos (hasMany, belongsTo, belongsToMany, etc)
 */
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Adicionar instância do Sequelize e classe Sequelize ao objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

/**
 * Método auxiliar para testar conexão com banco de dados
 *
 * @returns {Promise<boolean>} True se conectado, false se falhou
 */
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);

    // Exibir detalhes do erro apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error);
    }

    return false;
  }
};

/**
 * Método auxiliar para sincronizar models com banco de dados
 *
 * ATENÇÃO: Este método NÃO deve ser usado em produção!
 * Use migrations ao invés de sync() em produção.
 *
 * @param {Object} options - Opções do sequelize.sync()
 * @param {boolean} options.force - Se true, drop tables antes de criar
 * @param {boolean} options.alter - Se true, altera tabelas existentes
 * @returns {Promise<void>}
 */
db.syncDatabase = async (options = {}) => {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '⚠ WARNING: syncDatabase should NOT be used in production!\n' +
        'Use migrations instead: npm run db:migrate'
    );
    return;
  }

  try {
    await sequelize.sync(options);
    console.log('✓ Database synchronized successfully.');
  } catch (error) {
    console.error('✗ Failed to synchronize database:', error.message);

    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error);
    }

    throw error;
  }
};

/**
 * Método auxiliar para fechar conexão com banco de dados
 * Útil para encerramento gracioso da aplicação
 *
 * @returns {Promise<void>}
 */
db.closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✓ Database connection closed.');
  } catch (error) {
    console.error('✗ Failed to close database connection:', error.message);
    throw error;
  }
};

// Exportar objeto com sequelize, Sequelize e todos os models
module.exports = db;
