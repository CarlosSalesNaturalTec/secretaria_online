/**
 * Arquivo: backend/src/utils/formatters.js
 * Descrição: Funções utilitárias de formatação de dados
 * Feature: feat-028 - Criar utilitários de formatação e constantes
 * Criado em: 2025-10-28
 */

const { format, parseISO, isValid, parse } = require('date-fns');
const { ptBR } = require('date-fns/locale');

/**
 * Formata um CPF para o padrão brasileiro (000.000.000-00)
 *
 * @param {string} cpf - CPF sem formatação (somente números)
 * @returns {string} CPF formatado ou string vazia se inválido
 * @throws {Error} Se o CPF não tiver 11 dígitos
 *
 * @example
 * formatCPF('12345678901') // '123.456.789-01'
 */
function formatCPF(cpf) {
  if (!cpf) return '';

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) {
    return cpf; // Retorna original se não tiver 11 dígitos
  }

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove a formatação de um CPF (retorna apenas números)
 *
 * @param {string} cpf - CPF formatado ou não
 * @returns {string} CPF apenas com números
 *
 * @example
 * removeCPFMask('123.456.789-01') // '12345678901'
 */
function removeCPFMask(cpf) {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/YYYY)
 *
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada ou string vazia se inválida
 *
 * @example
 * formatDate(new Date('2025-10-28')) // '28/10/2025'
 */
function formatDate(date) {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('[FORMATTER] Erro ao formatar data:', error);
    return '';
  }
}

/**
 * Formata uma data com hora no padrão brasileiro (DD/MM/YYYY HH:mm)
 *
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora formatadas ou string vazia se inválida
 *
 * @example
 * formatDateTime(new Date('2025-10-28T10:30:00')) // '28/10/2025 10:30'
 */
function formatDateTime(date) {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('[FORMATTER] Erro ao formatar data/hora:', error);
    return '';
  }
}

/**
 * Formata uma data com hora e segundos (DD/MM/YYYY HH:mm:ss)
 *
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora completas ou string vazia se inválida
 *
 * @example
 * formatDateTimeFull(new Date('2025-10-28T10:30:45')) // '28/10/2025 10:30:45'
 */
function formatDateTimeFull(date) {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  } catch (error) {
    console.error('[FORMATTER] Erro ao formatar data/hora completa:', error);
    return '';
  }
}

/**
 * Converte string de data BR (DD/MM/YYYY) para objeto Date
 *
 * @param {string} dateString - Data em formato brasileiro
 * @returns {Date|null} Objeto Date ou null se inválido
 *
 * @example
 * parseBRDate('28/10/2025') // Date object
 */
function parseBRDate(dateString) {
  if (!dateString) return null;

  try {
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date(), { locale: ptBR });

    if (!isValid(parsedDate)) {
      return null;
    }

    return parsedDate;
  } catch (error) {
    console.error('[FORMATTER] Erro ao fazer parse de data BR:', error);
    return null;
  }
}

/**
 * Formata um valor monetário para o padrão brasileiro (R$ 0.000,00)
 *
 * @param {number|string} value - Valor a ser formatado
 * @returns {string} Valor formatado ou 'R$ 0,00' se inválido
 *
 * @example
 * formatCurrency(1234.56) // 'R$ 1.234,56'
 */
function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

/**
 * Formata um número decimal para o padrão brasileiro (0.000,00)
 *
 * @param {number|string} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Número formatado
 *
 * @example
 * formatDecimal(1234.567, 2) // '1.234,57'
 */
function formatDecimal(value, decimals = 2) {
  if (value === null || value === undefined || value === '') {
    return '0' + (decimals > 0 ? ',' + '0'.repeat(decimals) : '');
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '0' + (decimals > 0 ? ',' + '0'.repeat(decimals) : '');
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
}

/**
 * Formata um número de telefone brasileiro
 * (00) 00000-0000 ou (00) 0000-0000
 *
 * @param {string} phone - Telefone sem formatação
 * @returns {string} Telefone formatado ou string vazia se inválido
 *
 * @example
 * formatPhone('11987654321') // '(11) 98765-4321'
 * formatPhone('1134567890') // '(11) 3456-7890'
 */
function formatPhone(phone) {
  if (!phone) return '';

  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Celular (11 dígitos)
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Telefone fixo (10 dígitos)
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  // Se não for 10 ou 11 dígitos, retorna original
  return phone;
}

/**
 * Remove a formatação de um telefone (retorna apenas números)
 *
 * @param {string} phone - Telefone formatado ou não
 * @returns {string} Telefone apenas com números
 *
 * @example
 * removePhoneMask('(11) 98765-4321') // '11987654321'
 */
function removePhoneMask(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Formata um CEP brasileiro (00000-000)
 *
 * @param {string} cep - CEP sem formatação
 * @returns {string} CEP formatado ou string vazia se inválido
 *
 * @example
 * formatCEP('01310100') // '01310-100'
 */
function formatCEP(cep) {
  if (!cep) return '';

  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');

  if (cleanCEP.length !== 8) {
    return cep; // Retorna original se não tiver 8 dígitos
  }

  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Remove a formatação de um CEP (retorna apenas números)
 *
 * @param {string} cep - CEP formatado ou não
 * @returns {string} CEP apenas com números
 *
 * @example
 * removeCEPMask('01310-100') // '01310100'
 */
function removeCEPMask(cep) {
  if (!cep) return '';
  return cep.replace(/\D/g, '');
}

/**
 * Capitaliza a primeira letra de cada palavra
 *
 * @param {string} text - Texto a ser capitalizado
 * @returns {string} Texto capitalizado
 *
 * @example
 * capitalizeWords('joão da silva') // 'João Da Silva'
 */
function capitalizeWords(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitaliza apenas a primeira letra do texto
 *
 * @param {string} text - Texto a ser capitalizado
 * @returns {string} Texto com primeira letra maiúscula
 *
 * @example
 * capitalizeFirst('exemplo de texto') // 'Exemplo de texto'
 */
function capitalizeFirst(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Trunca um texto adicionando reticências se exceder o limite
 *
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado
 *
 * @example
 * truncateText('Este é um texto longo', 10) // 'Este é ...'
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Remove acentuação de um texto
 *
 * @param {string} text - Texto com acentos
 * @returns {string} Texto sem acentos
 *
 * @example
 * removeAccents('José Pedrão') // 'Jose Pedrao'
 */
function removeAccents(text) {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Formata um nome de arquivo para padrão seguro (sem espaços e caracteres especiais)
 *
 * @param {string} filename - Nome do arquivo original
 * @returns {string} Nome do arquivo formatado
 *
 * @example
 * sanitizeFilename('Meu Documento.pdf') // 'meu-documento.pdf'
 */
function sanitizeFilename(filename) {
  if (!filename) return '';

  // Remove acentos
  let sanitized = removeAccents(filename);

  // Converte para minúsculas
  sanitized = sanitized.toLowerCase();

  // Substitui espaços por hífens
  sanitized = sanitized.replace(/\s+/g, '-');

  // Remove caracteres especiais (mantém letras, números, hífens, underscores e pontos)
  sanitized = sanitized.replace(/[^a-z0-9\-_.]/g, '');

  // Remove múltiplos hífens consecutivos
  sanitized = sanitized.replace(/-+/g, '-');

  return sanitized;
}

/**
 * Gera um nome de arquivo único com timestamp
 *
 * @param {string} originalName - Nome original do arquivo
 * @returns {string} Nome único com timestamp
 *
 * @example
 * generateUniqueFilename('documento.pdf') // '1698765432123-documento.pdf'
 */
function generateUniqueFilename(originalName) {
  if (!originalName) return `${Date.now()}.file`;

  const sanitized = sanitizeFilename(originalName);
  const timestamp = Date.now();

  return `${timestamp}-${sanitized}`;
}

/**
 * Formata bytes para formato legível (KB, MB, GB)
 *
 * @param {number} bytes - Tamanho em bytes
 * @param {number} decimals - Casas decimais (padrão: 2)
 * @returns {string} Tamanho formatado
 *
 * @example
 * formatBytes(1024) // '1.00 KB'
 * formatBytes(1048576) // '1.00 MB'
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formata um semestre (1 ou 2) com ano
 *
 * @param {number} semester - Número do semestre (1 ou 2)
 * @param {number} year - Ano
 * @returns {string} Semestre formatado
 *
 * @example
 * formatSemester(1, 2025) // '1º/2025'
 */
function formatSemester(semester, year) {
  if (!semester || !year) return '';
  return `${semester}º/${year}`;
}

module.exports = {
  // CPF
  formatCPF,
  removeCPFMask,

  // Datas
  formatDate,
  formatDateTime,
  formatDateTimeFull,
  parseBRDate,

  // Valores numéricos
  formatCurrency,
  formatDecimal,

  // Telefone
  formatPhone,
  removePhoneMask,

  // CEP
  formatCEP,
  removeCEPMask,

  // Texto
  capitalizeWords,
  capitalizeFirst,
  truncateText,
  removeAccents,

  // Arquivos
  sanitizeFilename,
  generateUniqueFilename,
  formatBytes,

  // Outros
  formatSemester,
};
