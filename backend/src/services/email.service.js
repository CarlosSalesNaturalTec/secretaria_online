/**
 * Arquivo: backend/src/services/email.service.js
 * Descrição: Serviço de envio de emails para notificações do sistema
 * Feature: feat-059 - Criar EmailService
 * Criado em: 2025-11-03
 *
 * Responsabilidades:
 * - Enviar emails com senhas provisórias para alunos/professores
 * - Notificar usuários sobre aprovação de documentos
 * - Notificar usuários sobre rejeição de documentos
 * - Fornecer templates HTML profissionais para emails
 * - Tratar erros de envio e logar todas as operações
 */

const { transporter, getDefaultFrom } = require('../config/email');
const logger = require('../utils/logger');

/**
 * Classe de serviço para envio de emails
 *
 * Utiliza o transporter configurado em config/email.js
 * para enviar emails de notificação aos usuários do sistema.
 */
class EmailService {
  /**
   * Envia email com senha provisória para novo usuário
   *
   * Este método é chamado quando:
   * - Um aluno é criado pela secretaria
   * - Um professor é criado pela secretaria
   * - Uma senha provisória é regenerada
   *
   * @param {string} to - Endereço de email do destinatário
   * @param {string} password - Senha provisória gerada
   * @param {Object} options - Opções adicionais
   * @param {string} options.name - Nome do usuário (opcional)
   * @param {string} options.login - Login do usuário (opcional)
   * @returns {Promise<Object>} Informações sobre o envio
   * @throws {Error} Se houver erro no envio ou parâmetros inválidos
   *
   * @example
   * await EmailService.sendPasswordEmail(
   *   'joao.silva@email.com',
   *   'Abc123!@',
   *   { name: 'João Silva', login: 'joao.silva' }
   * );
   */
  async sendPasswordEmail(to, password, options = {}) {
    try {
      // Validação de parâmetros
      if (!to || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!this._isValidEmail(to)) {
        throw new Error(`Email inválido: ${to}`);
      }

      const { name, login } = options;

      // Template HTML do email
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Senha Provisória - Secretaria Online</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
              margin: -30px -30px 20px -30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              margin: 20px 0;
            }
            .credentials-box {
              background-color: #fff;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .credential-item {
              margin: 10px 0;
            }
            .credential-label {
              font-weight: bold;
              color: #666;
              display: inline-block;
              width: 120px;
            }
            .credential-value {
              color: #2563eb;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              font-weight: bold;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-title {
              font-weight: bold;
              color: #856404;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Secretaria Online</h1>
            </div>
            <div class="content">
              ${name ? `<p>Olá, <strong>${name}</strong>!</p>` : '<p>Olá!</p>'}

              <p>Seu acesso ao sistema <strong>Secretaria Online</strong> foi criado com sucesso.</p>

              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #2563eb;">Suas Credenciais de Acesso</h3>
                ${login ? `
                  <div class="credential-item">
                    <span class="credential-label">Login:</span>
                    <span class="credential-value">${login}</span>
                  </div>
                ` : ''}
                <div class="credential-item">
                  <span class="credential-label">Senha Provisória:</span>
                  <span class="credential-value">${password}</span>
                </div>
              </div>

              <div class="warning">
                <div class="warning-title">⚠️ IMPORTANTE</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Esta é uma <strong>senha provisória</strong> que deve ser alterada no primeiro acesso</li>
                  <li>Por questões de segurança, <strong>não compartilhe</strong> suas credenciais</li>
                  <li>Caso tenha problemas para acessar, entre em contato com a secretaria</li>
                </ul>
              </div>

              <p>Para acessar o sistema, utilize o link abaixo:</p>
              <p style="text-align: center;">
                <a href="${process.env.BASE_URL || 'http://localhost:5173'}"
                   style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Acessar Sistema
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; 2025 Secretaria Online. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Versão em texto plano (fallback)
      const textContent = `
Secretaria Online

${name ? `Olá, ${name}!` : 'Olá!'}

Seu acesso ao sistema Secretaria Online foi criado com sucesso.

SUAS CREDENCIAIS DE ACESSO:
${login ? `Login: ${login}` : ''}
Senha Provisória: ${password}

⚠️ IMPORTANTE:
- Esta é uma senha provisória que deve ser alterada no primeiro acesso
- Por questões de segurança, não compartilhe suas credenciais
- Caso tenha problemas para acessar, entre em contato com a secretaria

Para acessar o sistema: ${process.env.BASE_URL || 'http://localhost:5173'}

---
Este é um email automático, por favor não responda.
© 2025 Secretaria Online. Todos os direitos reservados.
      `;

      // Configuração do email
      const mailOptions = {
        from: getDefaultFrom(),
        to,
        subject: 'Sua Senha Provisória - Secretaria Online',
        text: textContent,
        html: htmlContent,
      };

      // Envio do email
      const info = await transporter.sendMail(mailOptions);

      logger.info('[EMAIL_SERVICE] Email de senha provisória enviado com sucesso', {
        to,
        messageId: info.messageId,
        hasLogin: !!login,
        hasName: !!name,
      });

      return {
        success: true,
        messageId: info.messageId,
        to,
      };
    } catch (error) {
      logger.error('[EMAIL_SERVICE] Erro ao enviar email de senha provisória:', {
        error: error.message,
        to,
      });
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }

  /**
   * Envia email notificando aprovação de documento
   *
   * Este método é chamado quando um administrador aprova
   * um documento enviado por aluno ou professor.
   *
   * @param {string} to - Endereço de email do destinatário
   * @param {string} documentType - Tipo do documento aprovado
   * @param {Object} options - Opções adicionais
   * @param {string} options.name - Nome do usuário (opcional)
   * @param {string} options.observations - Observações sobre a aprovação (opcional)
   * @returns {Promise<Object>} Informações sobre o envio
   * @throws {Error} Se houver erro no envio ou parâmetros inválidos
   *
   * @example
   * await EmailService.sendDocumentApprovedEmail(
   *   'joao.silva@email.com',
   *   'RG',
   *   { name: 'João Silva', observations: 'Documento está legível e válido.' }
   * );
   */
  async sendDocumentApprovedEmail(to, documentType, options = {}) {
    try {
      // Validação de parâmetros
      if (!to || !documentType) {
        throw new Error('Email e tipo do documento são obrigatórios');
      }

      if (!this._isValidEmail(to)) {
        throw new Error(`Email inválido: ${to}`);
      }

      const { name, observations } = options;

      // Template HTML do email
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documento Aprovado - Secretaria Online</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              background-color: #16a34a;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
              margin: -30px -30px 20px -30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .success-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .document-box {
              background-color: #fff;
              border: 2px solid #16a34a;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .document-type {
              font-size: 20px;
              font-weight: bold;
              color: #16a34a;
              margin: 10px 0;
            }
            .observations-box {
              background-color: #f0fdf4;
              border-left: 4px solid #16a34a;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .observations-title {
              font-weight: bold;
              color: #166534;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Secretaria Online</h1>
            </div>
            <div class="success-icon">✅</div>
            <div class="content">
              ${name ? `<p>Olá, <strong>${name}</strong>!</p>` : '<p>Olá!</p>'}

              <p>Temos uma ótima notícia! Seu documento foi <strong style="color: #16a34a;">APROVADO</strong> pela secretaria.</p>

              <div class="document-box">
                <div style="color: #666; font-size: 14px;">DOCUMENTO APROVADO</div>
                <div class="document-type">${documentType}</div>
                <div style="color: #16a34a; font-size: 14px; margin-top: 10px;">✓ Validado com sucesso</div>
              </div>

              ${observations ? `
                <div class="observations-box">
                  <div class="observations-title">📝 Observações da Secretaria</div>
                  <p style="margin: 5px 0;">${observations}</p>
                </div>
              ` : ''}

              <p>Agradecemos por enviar a documentação solicitada. Continue acompanhando o status dos seus documentos através do sistema.</p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.BASE_URL || 'http://localhost:5173'}"
                   style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Acessar Sistema
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; 2025 Secretaria Online. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Versão em texto plano (fallback)
      const textContent = `
Secretaria Online

${name ? `Olá, ${name}!` : 'Olá!'}

Temos uma ótima notícia! Seu documento foi APROVADO pela secretaria.

DOCUMENTO APROVADO: ${documentType}
Status: ✓ Validado com sucesso

${observations ? `OBSERVAÇÕES DA SECRETARIA:\n${observations}\n` : ''}

Agradecemos por enviar a documentação solicitada. Continue acompanhando o status dos seus documentos através do sistema.

Para acessar o sistema: ${process.env.BASE_URL || 'http://localhost:5173'}

---
Este é um email automático, por favor não responda.
© 2025 Secretaria Online. Todos os direitos reservados.
      `;

      // Configuração do email
      const mailOptions = {
        from: getDefaultFrom(),
        to,
        subject: `Documento Aprovado: ${documentType} - Secretaria Online`,
        text: textContent,
        html: htmlContent,
      };

      // Envio do email
      const info = await transporter.sendMail(mailOptions);

      logger.info('[EMAIL_SERVICE] Email de documento aprovado enviado com sucesso', {
        to,
        documentType,
        messageId: info.messageId,
        hasObservations: !!observations,
      });

      return {
        success: true,
        messageId: info.messageId,
        to,
        documentType,
      };
    } catch (error) {
      logger.error('[EMAIL_SERVICE] Erro ao enviar email de documento aprovado:', {
        error: error.message,
        to,
        documentType,
      });
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }

  /**
   * Envia email notificando rejeição de documento
   *
   * Este método é chamado quando um administrador rejeita
   * um documento enviado por aluno ou professor.
   *
   * @param {string} to - Endereço de email do destinatário
   * @param {string} documentType - Tipo do documento rejeitado
   * @param {string} observations - Motivo da rejeição (obrigatório)
   * @param {Object} options - Opções adicionais
   * @param {string} options.name - Nome do usuário (opcional)
   * @returns {Promise<Object>} Informações sobre o envio
   * @throws {Error} Se houver erro no envio ou parâmetros inválidos
   *
   * @example
   * await EmailService.sendDocumentRejectedEmail(
   *   'joao.silva@email.com',
   *   'RG',
   *   'Documento ilegível. Por favor, envie uma foto mais nítida.',
   *   { name: 'João Silva' }
   * );
   */
  async sendDocumentRejectedEmail(to, documentType, observations, options = {}) {
    try {
      // Validação de parâmetros
      if (!to || !documentType || !observations) {
        throw new Error('Email, tipo do documento e observações são obrigatórios');
      }

      if (!this._isValidEmail(to)) {
        throw new Error(`Email inválido: ${to}`);
      }

      const { name } = options;

      // Template HTML do email
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documento Rejeitado - Secretaria Online</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              background-color: #dc2626;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
              margin: -30px -30px 20px -30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .warning-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .document-box {
              background-color: #fff;
              border: 2px solid #dc2626;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .document-type {
              font-size: 20px;
              font-weight: bold;
              color: #dc2626;
              margin: 10px 0;
            }
            .observations-box {
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .observations-title {
              font-weight: bold;
              color: #991b1b;
              margin-bottom: 5px;
            }
            .action-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .action-title {
              font-weight: bold;
              color: #856404;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Secretaria Online</h1>
            </div>
            <div class="warning-icon">⚠️</div>
            <div class="content">
              ${name ? `<p>Olá, <strong>${name}</strong>!</p>` : '<p>Olá!</p>'}

              <p>Informamos que seu documento foi <strong style="color: #dc2626;">REJEITADO</strong> pela secretaria e precisa ser reenviado.</p>

              <div class="document-box">
                <div style="color: #666; font-size: 14px;">DOCUMENTO REJEITADO</div>
                <div class="document-type">${documentType}</div>
                <div style="color: #dc2626; font-size: 14px; margin-top: 10px;">✗ Requer correção</div>
              </div>

              <div class="observations-box">
                <div class="observations-title">📋 Motivo da Rejeição</div>
                <p style="margin: 5px 0;">${observations}</p>
              </div>

              <div class="action-box">
                <div class="action-title">📌 O que fazer agora?</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Leia atentamente o motivo da rejeição acima</li>
                  <li>Corrija o problema apontado pela secretaria</li>
                  <li>Acesse o sistema e envie novamente o documento</li>
                  <li>Em caso de dúvidas, entre em contato com a secretaria</li>
                </ul>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.BASE_URL || 'http://localhost:5173'}"
                   style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Enviar Documento Novamente
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; 2025 Secretaria Online. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Versão em texto plano (fallback)
      const textContent = `
Secretaria Online

${name ? `Olá, ${name}!` : 'Olá!'}

Informamos que seu documento foi REJEITADO pela secretaria e precisa ser reenviado.

DOCUMENTO REJEITADO: ${documentType}
Status: ✗ Requer correção

MOTIVO DA REJEIÇÃO:
${observations}

O QUE FAZER AGORA?
- Leia atentamente o motivo da rejeição acima
- Corrija o problema apontado pela secretaria
- Acesse o sistema e envie novamente o documento
- Em caso de dúvidas, entre em contato com a secretaria

Para acessar o sistema: ${process.env.BASE_URL || 'http://localhost:5173'}

---
Este é um email automático, por favor não responda.
© 2025 Secretaria Online. Todos os direitos reservados.
      `;

      // Configuração do email
      const mailOptions = {
        from: getDefaultFrom(),
        to,
        subject: `Documento Rejeitado: ${documentType} - Ação Necessária`,
        text: textContent,
        html: htmlContent,
      };

      // Envio do email
      const info = await transporter.sendMail(mailOptions);

      logger.info('[EMAIL_SERVICE] Email de documento rejeitado enviado com sucesso', {
        to,
        documentType,
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
        to,
        documentType,
      };
    } catch (error) {
      logger.error('[EMAIL_SERVICE] Erro ao enviar email de documento rejeitado:', {
        error: error.message,
        to,
        documentType,
      });
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }

  /**
   * Valida formato de email
   *
   * @private
   * @param {string} email - Email a ser validado
   * @returns {boolean} true se email for válido
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Exporta instância única do serviço (Singleton)
module.exports = new EmailService();
