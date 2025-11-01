/**
 * Arquivo: backend/src/services/pdf.service.js
 * Descrição: Serviço responsável pela geração de PDFs de contratos
 * Feature: feat-047 - Criar PDFService para geração de contratos
 * Criado em: 2025-11-01
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * PDFService
 *
 * Responsabilidades:
 * - Gerar PDFs de contratos a partir de templates HTML/texto
 * - Substituir placeholders dinâmicos com dados reais
 * - Salvar PDFs em diretório estruturado
 * - Gerenciar permissões de arquivo
 * - Validar dados de entrada
 */
class PDFService {
  /**
   * Gera um PDF de contrato a partir de dados e template
   *
   * @param {Object} contractData - Dados para preencher o contrato
   * @param {string} contractData.studentName - Nome do aluno
   * @param {string} contractData.studentId - ID do aluno
   * @param {string} contractData.courseName - Nome do curso
   * @param {string} contractData.courseId - ID do curso
   * @param {string} contractData.semester - Semestre/período
   * @param {string} contractData.year - Ano da matrícula
   * @param {string} [contractData.startDate] - Data de início
   * @param {string} [contractData.duration] - Duração do curso em semestres
   * @param {string} [contractData.institutionName='Secretaria Online'] - Nome da instituição
   * @param {string} templateContent - Conteúdo do template (texto com placeholders)
   * @param {string} [outputDir='uploads/contracts'] - Diretório de saída
   *
   * @returns {Promise<Object>} Objeto com informações do PDF gerado
   * @returns {string} .filePath - Caminho completo do arquivo gerado
   * @returns {string} .fileName - Nome do arquivo
   * @returns {string} .fileSize - Tamanho do arquivo em bytes
   * @returns {string} .relativePath - Caminho relativo para armazenamento em BD
   *
   * @throws {Error} Se dados obrigatórios estiverem faltando
   * @throws {Error} Se houver erro ao criar arquivo
   *
   * @example
   * const result = await PDFService.generateContractPDF(
   *   {
   *     studentName: 'João Silva',
   *     studentId: 123,
   *     courseName: 'Engenharia de Software',
   *     courseId: 5,
   *     semester: 1,
   *     year: 2025
   *   },
   *   templateContent,
   *   'uploads/contracts'
   * );
   * // Returns:
   * // {
   * //   filePath: 'C:\...\backend\uploads\contracts\contract_123_1_2025.pdf',
   * //   fileName: 'contract_123_1_2025.pdf',
   * //   fileSize: 2048,
   * //   relativePath: 'contracts/contract_123_1_2025.pdf'
   * // }
   */
  static async generateContractPDF(contractData, templateContent, outputDir = 'uploads/contracts') {
    try {
      // Validar dados obrigatórios
      this._validateContractData(contractData);

      // Substituir placeholders no template
      const processedContent = this._replacePlaceholders(templateContent, contractData);

      // Gerar nome do arquivo
      const fileName = this._generateFileName(contractData);

      // Garantir que o diretório existe
      const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
      await this._ensureDirectoryExists(absoluteOutputDir);

      // Caminho completo do arquivo
      const filePath = path.join(absoluteOutputDir, fileName);

      // Gerar PDF
      await this._generatePDFFile(processedContent, filePath, contractData);

      // Obter informações do arquivo gerado
      const stats = await fsPromises.stat(filePath);

      const result = {
        filePath,
        fileName,
        fileSize: stats.size,
        relativePath: path.join(outputDir, fileName).replace(/\\/g, '/'),
      };

      logger.info('[PDFService] Contrato gerado com sucesso', {
        studentId: contractData.studentId,
        fileName,
        fileSize: stats.size,
      });

      return result;
    } catch (error) {
      logger.error('[PDFService] Erro ao gerar contrato PDF', {
        studentId: contractData?.studentId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Valida os dados obrigatórios do contrato
   *
   * @param {Object} contractData - Dados a validar
   * @throws {Error} Se dados obrigatórios estiverem faltando
   *
   * @private
   */
  static _validateContractData(contractData) {
    const requiredFields = ['studentName', 'studentId', 'courseName', 'courseId', 'semester', 'year'];
    const missingFields = requiredFields.filter((field) => !contractData[field]);

    if (missingFields.length > 0) {
      const error = new Error(
        `Campos obrigatórios faltando no contrato: ${missingFields.join(', ')}`
      );
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Validar tipos de dados
    if (typeof contractData.studentId !== 'number' && typeof contractData.studentId !== 'string') {
      throw new Error('studentId deve ser um número ou string');
    }

    if (typeof contractData.semester !== 'number') {
      throw new Error('semester deve ser um número');
    }

    if (typeof contractData.year !== 'number') {
      throw new Error('year deve ser um número');
    }
  }

  /**
   * Substitui placeholders no template com dados reais
   *
   * @param {string} template - Template com placeholders
   * @param {Object} data - Dados para substituição
   * @returns {string} Template processado
   *
   * @private
   */
  static _replacePlaceholders(template, data) {
    let processed = template;

    // Placeholders padrão
    const placeholders = {
      '{{studentName}}': data.studentName,
      '{{courseName}}': data.courseName,
      '{{semester}}': data.semester,
      '{{year}}': data.year,
      '{{studentId}}': data.studentId,
      '{{courseId}}': data.courseId,
      '{{startDate}}': data.startDate || new Date().toLocaleDateString('pt-BR'),
      '{{duration}}': data.duration || 'conforme currículo',
      '{{institutionName}}': data.institutionName || 'Secretaria Online',
      '{{currentDate}}': new Date().toLocaleDateString('pt-BR'),
      '{{currentDateTime}}': new Date().toLocaleString('pt-BR'),
    };

    // Substituir cada placeholder
    Object.entries(placeholders).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(key, 'g'), String(value));
    });

    return processed;
  }

  /**
   * Gera um nome único para o arquivo PDF
   *
   * @param {Object} contractData - Dados do contrato
   * @returns {string} Nome do arquivo
   *
   * @private
   */
  static _generateFileName(contractData) {
    const timestamp = Date.now();
    return `contract_${contractData.studentId}_s${contractData.semester}_${contractData.year}_${timestamp}.pdf`;
  }

  /**
   * Garante que o diretório de saída existe
   *
   * @param {string} dirPath - Caminho do diretório
   * @throws {Error} Se não conseguir criar o diretório
   *
   * @private
   */
  static async _ensureDirectoryExists(dirPath) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      const newError = new Error(`Erro ao criar diretório de uploads: ${error.message}`);
      newError.code = 'DIRECTORY_ERROR';
      throw newError;
    }
  }

  /**
   * Gera o arquivo PDF usando PDFKit
   *
   * @param {string} content - Conteúdo formatado para o PDF
   * @param {string} filePath - Caminho onde salvar o arquivo
   * @param {Object} contractData - Dados do contrato (para metadata)
   *
   * @private
   */
  static _generatePDFFile(content, filePath, contractData) {
    return new Promise((resolve, reject) => {
      try {
        // Criar documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
        });

        // Criar stream de escrita
        const writeStream = fs.createWriteStream(filePath);

        // Conectar documento ao stream
        doc.pipe(writeStream);

        // Adicionar conteúdo
        this._addContentToPDF(doc, content);

        // Finalizar documento
        doc.end();

        // Handlers para o stream
        writeStream.on('finish', () => {
          resolve();
        });

        writeStream.on('error', (error) => {
          const newError = new Error(`Erro ao escrever arquivo PDF: ${error.message}`);
          newError.code = 'FILE_WRITE_ERROR';
          reject(newError);
        });

        doc.on('error', (error) => {
          const newError = new Error(`Erro ao gerar documento PDF: ${error.message}`);
          newError.code = 'PDF_GENERATION_ERROR';
          reject(newError);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Adiciona conteúdo formatado ao documento PDF
   *
   * @param {PDFDocument} doc - Documento PDFKit
   * @param {string} content - Conteúdo a adicionar
   *
   * @private
   */
  static _addContentToPDF(doc, content) {
    // Adicionar título
    doc.fontSize(20).font('Helvetica-Bold').text('CONTRATO DE MATRÍCULA', {
      align: 'center',
      underline: true,
    });

    doc.moveDown(2);

    // Adicionar conteúdo principal
    // Suportar quebras de linha e formatação básica
    const lines = content.split('\n');

    doc.fontSize(11).font('Helvetica');

    lines.forEach((line) => {
      if (line.trim()) {
        // Suportar markdown simples (**texto** para bold)
        this._addFormattedLine(doc, line);
      } else {
        // Linha em branco
        doc.moveDown(0.5);
      }
    });

    // Adicionar assinatura
    doc.moveDown(2);
    doc.fontSize(10).text('_' + '_'.repeat(50), { align: 'center' });
    doc.text('Assinatura do responsável', { align: 'center', fontSize: 9 });

    // Rodapé
    doc.moveDown(3);
    doc.fontSize(8).text('Documento gerado eletronicamente por Secretaria Online', {
      align: 'center',
    });
    doc
      .fontSize(8)
      .text(`Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, {
        align: 'center',
      });
  }

  /**
   * Adiciona uma linha com formatação básica (suporta **texto** para bold)
   *
   * @param {PDFDocument} doc - Documento PDFKit
   * @param {string} line - Linha com possível formatação
   *
   * @private
   */
  static _addFormattedLine(doc, line) {
    // Simples suporte para **texto** = bold
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      // Adicionar texto normal antes do bold
      if (match.index > lastIndex) {
        doc.font('Helvetica').text(line.substring(lastIndex, match.index), {
          continued: true,
        });
      }

      // Adicionar texto em bold
      doc.font('Helvetica-Bold').text(match[1], { continued: true });

      lastIndex = boldRegex.lastIndex;
    }

    // Adicionar texto restante
    if (lastIndex < line.length) {
      doc.font('Helvetica').text(line.substring(lastIndex));
    } else if (lastIndex > 0) {
      doc.text('');
    }

    doc.moveDown(0.5);
  }

  /**
   * Remove um arquivo PDF do disco
   *
   * @param {string} filePath - Caminho completo do arquivo
   * @returns {Promise<boolean>} true se removido com sucesso
   *
   * @throws {Error} Se o arquivo não existir
   *
   * @example
   * await PDFService.removePDF('uploads/contracts/contract_123_1_2025.pdf');
   */
  static async removePDF(filePath) {
    try {
      await fsPromises.unlink(filePath);
      logger.info('[PDFService] Arquivo PDF removido', { filePath });
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('[PDFService] Arquivo PDF não encontrado', { filePath });
        return false;
      }
      logger.error('[PDFService] Erro ao remover arquivo PDF', {
        filePath,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verifica se um arquivo PDF existe
   *
   * @param {string} filePath - Caminho completo do arquivo
   * @returns {Promise<boolean>} true se existe
   *
   * @example
   * const exists = await PDFService.pdfExists('uploads/contracts/contract_123_1_2025.pdf');
   */
  static async pdfExists(filePath) {
    try {
      await fsPromises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retorna o conteúdo de um arquivo PDF
   *
   * @param {string} filePath - Caminho completo do arquivo
   * @returns {Promise<Buffer>} Buffer do arquivo
   *
   * @throws {Error} Se o arquivo não existir ou não puder ser lido
   *
   * @example
   * const buffer = await PDFService.readPDF('uploads/contracts/contract_123_1_2025.pdf');
   */
  static async readPDF(filePath) {
    try {
      return await fsPromises.readFile(filePath);
    } catch (error) {
      logger.error('[PDFService] Erro ao ler arquivo PDF', {
        filePath,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = PDFService;
