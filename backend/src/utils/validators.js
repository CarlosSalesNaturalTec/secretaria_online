/**
 * Arquivo: backend/src/utils/validators.js
 * Descrição: Funções de validação customizadas reutilizáveis
 * Feature: feat-025 - Criar middleware de validação com express-validator
 * Criado em: 2025-10-28
 */

/**
 * Valida se um CPF é válido
 *
 * Verifica o formato (11 dígitos numéricos) e valida os dígitos verificadores
 * segundo o algoritmo oficial do CPF brasileiro
 *
 * @param {string} cpf - CPF a ser validado (pode conter pontos e traços)
 * @returns {boolean} True se o CPF for válido, false caso contrário
 *
 * @example
 * validateCPF('123.456.789-09') // true ou false
 * validateCPF('12345678909') // true ou false
 */
const validateCPF = (cpf) => {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;

  if (digit1 !== parseInt(cleanCPF.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;

  if (digit2 !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

/**
 * Valida se uma senha atende aos requisitos de segurança
 *
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 *
 * @param {string} password - Senha a ser validada
 * @returns {boolean} True se a senha for forte, false caso contrário
 *
 * @example
 * validateStrongPassword('Senha123') // true
 * validateStrongPassword('senha') // false
 */
const validateStrongPassword = (password) => {
  if (!password) return false;

  // Verifica comprimento mínimo
  if (password.length < 8) return false;

  // Verifica se tem pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) return false;

  // Verifica se tem pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) return false;

  // Verifica se tem pelo menos um número
  if (!/[0-9]/.test(password)) return false;

  return true;
};

/**
 * Valida se uma data de nascimento é válida
 *
 * Verifica:
 * - Se a data é válida
 * - Se a pessoa tem pelo menos 16 anos (para alunos)
 * - Se a data não está no futuro
 *
 * @param {string|Date} date - Data a ser validada
 * @param {number} minAge - Idade mínima (padrão: 16)
 * @returns {boolean} True se a data for válida, false caso contrário
 */
const validateBirthDate = (date, minAge = 16) => {
  if (!date) return false;

  const birthDate = new Date(date);
  const today = new Date();

  // Verifica se a data é válida
  if (isNaN(birthDate.getTime())) return false;

  // Verifica se não está no futuro
  if (birthDate > today) return false;

  // Calcula a idade
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Verifica idade mínima
  return age >= minAge;
};

/**
 * Valida se uma string contém apenas letras e espaços
 *
 * Útil para validação de nomes
 *
 * @param {string} str - String a ser validada
 * @returns {boolean} True se contiver apenas letras e espaços, false caso contrário
 */
const validateOnlyLetters = (str) => {
  if (!str) return false;
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(str);
};

/**
 * Valida se uma string é um número de telefone brasileiro válido
 *
 * Aceita formatos:
 * - (11) 98765-4321
 * - (11) 3456-7890
 * - 11987654321
 * - 1134567890
 *
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} True se for um telefone válido, false caso contrário
 */
const validatePhone = (phone) => {
  if (!phone) return false;

  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Verifica se tem 10 ou 11 dígitos (com ou sem 9 no celular)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1+$/.test(cleanPhone)) return false;

  return true;
};

/**
 * Valida se um código de curso/disciplina segue o padrão esperado
 *
 * Formato aceito: letras maiúsculas seguidas de números (ex: CS101, MAT200)
 *
 * @param {string} code - Código a ser validado
 * @returns {boolean} True se o código for válido, false caso contrário
 */
const validateCourseCode = (code) => {
  if (!code) return false;
  // Aceita 2-4 letras maiúsculas seguidas de 2-4 números
  return /^[A-Z]{2,4}\d{2,4}$/.test(code);
};

/**
 * Valida se um valor está dentro de um intervalo
 *
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo (inclusivo)
 * @param {number} max - Valor máximo (inclusivo)
 * @returns {boolean} True se o valor estiver dentro do intervalo, false caso contrário
 */
const validateRange = (value, min, max) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Valida se um arquivo tem uma extensão permitida
 *
 * @param {string} filename - Nome do arquivo
 * @param {string[]} allowedExtensions - Array de extensões permitidas (ex: ['pdf', 'jpg', 'png'])
 * @returns {boolean} True se a extensão for permitida, false caso contrário
 */
const validateFileExtension = (filename, allowedExtensions) => {
  if (!filename || !allowedExtensions || !Array.isArray(allowedExtensions)) {
    return false;
  }

  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Valida se um semestre é válido (1-12, considerando cursos de até 6 anos)
 *
 * @param {number} semester - Número do semestre
 * @returns {boolean} True se o semestre for válido, false caso contrário
 */
const validateSemester = (semester) => {
  return validateRange(semester, 1, 12);
};

/**
 * Valida se uma nota está no formato correto (0-10 com até 2 casas decimais)
 *
 * @param {number} grade - Nota a ser validada
 * @returns {boolean} True se a nota for válida, false caso contrário
 */
const validateGrade = (grade) => {
  if (grade === null || grade === undefined) return false;

  const num = Number(grade);
  if (isNaN(num)) return false;

  // Verifica range 0-10
  if (num < 0 || num > 10) return false;

  // Verifica se tem no máximo 2 casas decimais
  const decimalPlaces = (num.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

module.exports = {
  validateCPF,
  validateStrongPassword,
  validateBirthDate,
  validateOnlyLetters,
  validatePhone,
  validateCourseCode,
  validateRange,
  validateFileExtension,
  validateSemester,
  validateGrade,
};
