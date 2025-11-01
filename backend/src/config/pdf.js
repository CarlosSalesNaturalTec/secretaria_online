/**
 * Arquivo: src/config/pdf.js
 * Descrição: Configuração do PDFKit para geração de PDFs
 * Feature: feat-046 - Instalar e configurar PDFKit ou Puppeteer
 * Criado em: 2025-11-01
 */

const path = require('path');
const fs = require('fs');

/**
 * Diretório base para armazenamento de PDFs gerados
 */
const UPLOADS_BASE_PATH = path.join(__dirname, '../../uploads');

/**
 * Diretório específico para armazenamento de contratos em PDF
 * Estrutura: uploads/contracts/[timestamp]-contract-[userId].pdf
 */
const CONTRACTS_PATH = path.join(UPLOADS_BASE_PATH, 'contracts');

/**
 * Diretório para armazenamento de PDFs temporários durante geração
 * Estrutura: uploads/temp/[timestamp]-temp-[filename].pdf
 */
const TEMP_PDF_PATH = path.join(UPLOADS_BASE_PATH, 'temp');

/**
 * Configurações do PDFKit para geração de PDFs
 *
 * @type {Object}
 * @property {string} size - Tamanho padrão da página (A4)
 * @property {number} margin - Margem padrão em pontos (40pt ≈ 1.4cm)
 * @property {number} fontSize - Tamanho padrão de fonte em pontos (12pt)
 * @property {string} font - Fonte padrão (sistema operacional)
 */
const PDF_CONFIG = {
  // Formato de página
  size: 'A4', // Tamanho padrão para contratos
  margin: 40, // Margem padrão em pontos

  // Fonte e tamanho
  fontSize: 12,
  fontColor: '#000000',
  lineHeight: 1.5,

  // Configurações de página
  columns: 1,
  columnGap: 15,
};

/**
 * Constantes de configuração PDF para validações e limites
 *
 * @type {Object}
 */
const PDF_CONSTANTS = {
  CONTRACTS_PATH,
  TEMP_PDF_PATH,
  UPLOADS_BASE_PATH,
  MAX_PDF_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  TEMP_FILE_CLEANUP_DAYS: 7, // Limpar arquivos temporários com mais de 7 dias
  CONTRACT_FILENAME_PREFIX: 'contract',
  TEMP_FILENAME_PREFIX: 'temp',
};

/**
 * Inicializa os diretórios necessários para armazenamento de PDFs
 * Se os diretórios não existem, cria-os recursivamente
 *
 * @throws {Error} Se houver erro ao criar diretórios
 * @returns {void}
 */
function initializePDFDirectories() {
  try {
    // Criar diretório base se não existir
    if (!fs.existsSync(UPLOADS_BASE_PATH)) {
      fs.mkdirSync(UPLOADS_BASE_PATH, { recursive: true });
      console.info('[PDFConfig] Diretório base de uploads criado:', UPLOADS_BASE_PATH);
    }

    // Criar diretório de contratos se não existir
    if (!fs.existsSync(CONTRACTS_PATH)) {
      fs.mkdirSync(CONTRACTS_PATH, { recursive: true });
      console.info('[PDFConfig] Diretório de contratos criado:', CONTRACTS_PATH);
    }

    // Criar diretório temporário se não existir
    if (!fs.existsSync(TEMP_PDF_PATH)) {
      fs.mkdirSync(TEMP_PDF_PATH, { recursive: true });
      console.info('[PDFConfig] Diretório temporário de PDFs criado:', TEMP_PDF_PATH);
    }
  } catch (error) {
    console.error('[PDFConfig] Erro ao inicializar diretórios:', error.message);
    throw new Error(`Falha ao inicializar diretórios de PDF: ${error.message}`);
  }
}

/**
 * Gera um nome único para arquivo PDF baseado em timestamp
 *
 * @param {string} prefix - Prefixo do nome do arquivo (ex: 'contract', 'temp')
 * @param {number} userId - ID do usuário proprietário do PDF (opcional)
 * @returns {string} Nome do arquivo com timestamp e prefixo
 *
 * @example
 * // Retorna: contract-1698700200000-user-123.pdf
 * generatePDFFileName('contract', 123);
 *
 * // Retorna: temp-1698700200000.pdf
 * generatePDFFileName('temp');
 */
function generatePDFFileName(prefix = 'document', userId = null) {
  const timestamp = Date.now();
  const userIdPart = userId ? `-user-${userId}` : '';
  return `${prefix}-${timestamp}${userIdPart}.pdf`;
}

/**
 * Gera o caminho completo para um arquivo PDF de contrato
 *
 * @param {string} fileName - Nome do arquivo
 * @returns {string} Caminho completo para o arquivo
 *
 * @example
 * // Retorna: C:\uploads\contracts\contract-1698700200000-user-123.pdf
 * getContractPDFPath('contract-1698700200000-user-123.pdf');
 */
function getContractPDFPath(fileName) {
  return path.join(CONTRACTS_PATH, fileName);
}

/**
 * Gera o caminho completo para um arquivo PDF temporário
 *
 * @param {string} fileName - Nome do arquivo
 * @returns {string} Caminho completo para o arquivo temporário
 *
 * @example
 * // Retorna: C:\uploads\temp\temp-1698700200000.pdf
 * getTempPDFPath('temp-1698700200000.pdf');
 */
function getTempPDFPath(fileName) {
  return path.join(TEMP_PDF_PATH, fileName);
}

/**
 * Limpa arquivos temporários PDF que envelheceram
 * Remove arquivos com mais de TEMP_FILE_CLEANUP_DAYS dias
 *
 * @param {number} daysOld - Número de dias para considerar arquivo antigo (padrão: 7)
 * @returns {Promise<number>} Número de arquivos removidos
 *
 * @example
 * // Remove arquivos temporários com mais de 7 dias
 * const removedCount = await cleanupOldTempPDFs(7);
 * console.log(`${removedCount} arquivos temporários foram removidos`);
 */
async function cleanupOldTempPDFs(daysOld = PDF_CONSTANTS.TEMP_FILE_CLEANUP_DAYS) {
  try {
    if (!fs.existsSync(TEMP_PDF_PATH)) {
      return 0;
    }

    const files = fs.readdirSync(TEMP_PDF_PATH);
    let removedCount = 0;
    const now = Date.now();
    const daysInMs = daysOld * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(TEMP_PDF_PATH, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > daysInMs) {
        fs.unlinkSync(filePath);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.info(
        `[PDFConfig] ${removedCount} arquivo(s) temporário(s) removido(s) com sucesso`
      );
    }

    return removedCount;
  } catch (error) {
    console.error('[PDFConfig] Erro ao limpar arquivos temporários:', error.message);
    return 0;
  }
}

/**
 * Valida se um arquivo é um PDF válido
 *
 * @param {string} filePath - Caminho completo do arquivo
 * @returns {boolean} True se é um arquivo PDF válido, false caso contrário
 *
 * @example
 * if (isValidPDF('./uploads/contract.pdf')) {
 *   console.log('PDF válido!');
 * }
 */
function isValidPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Verificar extensão
    if (!filePath.toLowerCase().endsWith('.pdf')) {
      return false;
    }

    // Verificar se o arquivo não está vazio
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return false;
    }

    // Verificar assinatura do PDF (%PDF)
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    return buffer.toString() === '%PDF';
  } catch (error) {
    console.error('[PDFConfig] Erro ao validar PDF:', error.message);
    return false;
  }
}

/**
 * Exporta configurações e funções do PDF
 */
module.exports = {
  // Configurações
  PDF_CONFIG,
  PDF_CONSTANTS,

  // Caminhos
  CONTRACTS_PATH,
  TEMP_PDF_PATH,
  UPLOADS_BASE_PATH,

  // Funções utilitárias
  initializePDFDirectories,
  generatePDFFileName,
  getContractPDFPath,
  getTempPDFPath,
  cleanupOldTempPDFs,
  isValidPDF,
};
