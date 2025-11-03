/**
 * Arquivo: backend/src/config/email.js
 * Descrição: Configuração do Nodemailer para envio de emails via SMTP
 * Feature: feat-058 - Configurar Nodemailer com SMTP
 * Criado em: 2025-11-03
 *
 * Responsabilidades:
 * - Configurar transporter do Nodemailer com credenciais SMTP
 * - Validar variáveis de ambiente obrigatórias
 * - Exportar transporter e método de teste de conexão
 * - Fornecer configuração centralizada para EmailService
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Valida se todas as variáveis de ambiente necessárias estão configuradas
 *
 * @throws {Error} Se alguma variável obrigatória estiver ausente
 */
function validateEmailConfig() {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const errorMsg = `Configuração de email incompleta. Variáveis ausentes: ${missingVars.join(', ')}`;
    logger.error('[EMAIL_CONFIG] ' + errorMsg);
    throw new Error(errorMsg);
  }

  logger.info('[EMAIL_CONFIG] Configuração de email validada com sucesso');
}

/**
 * Cria e configura o transporter do Nodemailer
 *
 * Configurações:
 * - Host e porta SMTP do servidor de email
 * - Autenticação com usuário e senha
 * - Suporte a STARTTLS (porta 587) ou SSL/TLS (porta 465)
 *
 * @returns {nodemailer.Transporter} Transporter configurado
 */
function createTransporter() {
  try {
    validateEmailConfig();

    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true', // true para porta 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Timeout de conexão (30 segundos)
      connectionTimeout: 30000,
      // Timeout de socket (30 segundos)
      socketTimeout: 30000,
      // Log de debug apenas em desenvolvimento
      logger: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development',
    };

    const transporter = nodemailer.createTransport(config);

    logger.info('[EMAIL_CONFIG] Transporter Nodemailer criado com sucesso', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
    });

    return transporter;
  } catch (error) {
    logger.error('[EMAIL_CONFIG] Erro ao criar transporter Nodemailer:', error);
    throw error;
  }
}

// Cria o transporter na inicialização do módulo
const transporter = createTransporter();

/**
 * Testa a conexão com o servidor SMTP
 *
 * Útil para verificar se as credenciais e configurações estão corretas
 * durante a inicialização da aplicação ou em testes.
 *
 * @returns {Promise<boolean>} true se conexão for bem-sucedida
 * @throws {Error} Se houver erro na conexão
 *
 * @example
 * try {
 *   await testConnection();
 *   console.log('Conexão SMTP OK');
 * } catch (error) {
 *   console.error('Erro na conexão SMTP:', error.message);
 * }
 */
async function testConnection() {
  try {
    await transporter.verify();
    logger.info('[EMAIL_CONFIG] Conexão com servidor SMTP verificada com sucesso');
    return true;
  } catch (error) {
    logger.error('[EMAIL_CONFIG] Erro ao testar conexão SMTP:', {
      message: error.message,
      code: error.code,
    });
    throw new Error(`Falha na conexão SMTP: ${error.message}`);
  }
}

/**
 * Retorna o endereço de email do remetente padrão
 *
 * @returns {string} Email do remetente (formato: "Nome <email@dominio.com>")
 */
function getDefaultFrom() {
  return process.env.SMTP_FROM;
}

/**
 * Retorna informações sobre a configuração atual (sem expor credenciais)
 *
 * @returns {Object} Objeto com informações da configuração
 */
function getConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
  };
}

module.exports = {
  transporter,
  testConnection,
  getDefaultFrom,
  getConfig,
};
