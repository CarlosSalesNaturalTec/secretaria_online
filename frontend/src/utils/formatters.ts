/**
 * Arquivo: frontend/src/utils/formatters.ts
 * Descrição: Funções para formatação de valores (CPF, telefone, data, moeda)
 * Feature: feat-100 - Criar formatters.ts
 * Criado em: 2025-11-04
 */

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata CPF para o padrão brasileiro (XXX.XXX.XXX-XX)
 *
 * @param {string} cpf - CPF a ser formatado (apenas dígitos)
 * @returns {string} CPF formatado ou string vazia se inválido
 *
 * @example
 * formatCPF('12345678901') // retorna '123.456.789-01'
 * formatCPF('123') // retorna ''
 */
export function formatCPF(cpf: string): string {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Valida se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return '';
  }

  // Formata: XXX.XXX.XXX-XX
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata número de telefone para o padrão brasileiro (XX XXXXX-XXXX)
 *
 * @param {string} phone - Telefone a ser formatado (apenas dígitos)
 * @returns {string} Telefone formatado ou string vazia se inválido
 *
 * @example
 * formatPhone('11987654321') // retorna '11 98765-4321'
 * formatPhone('119') // retorna ''
 */
export function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Valida se tem 10 ou 11 dígitos
  if (cleanPhone.length === 10) {
    // Formato: XX XXXX-XXXX (celular antigo ou fixo)
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
  } else if (cleanPhone.length === 11) {
    // Formato: XX XXXXX-XXXX (celular novo)
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
  }

  return '';
}

/**
 * Formata data para o padrão brasileiro (DD/MM/YYYY)
 *
 * @param {Date | string | number} date - Data a ser formatada
 * @returns {string} Data formatada ou string vazia se inválida
 *
 * @example
 * formatDate(new Date('2025-11-04')) // retorna '04/11/2025'
 * formatDate('2025-11-04') // retorna '04/11/2025'
 */
export function formatDate(date: Date | string | number): string {
  try {
    const dateObject = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    // Verifica se a data é válida
    if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
      return '';
    }

    return format(dateObject, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata valor numérico como moeda brasileira (R$ 1.234,56)
 *
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda BRL
 *
 * @example
 * formatCurrency(1234.56) // retorna 'R$ 1.234,56'
 * formatCurrency(0) // retorna 'R$ 0,00'
 * formatCurrency(-500.99) // retorna 'R$ -500,99'
 */
export function formatCurrency(value: number): string {
  // Formata usando Intl.NumberFormat para padrão brasileiro
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Remove formatação de CPF, retornando apenas dígitos
 *
 * @param {string} cpf - CPF formatado
 * @returns {string} CPF contendo apenas dígitos
 *
 * @example
 * unformatCPF('123.456.789-01') // retorna '12345678901'
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Remove formatação de telefone, retornando apenas dígitos
 *
 * @param {string} phone - Telefone formatado
 * @returns {string} Telefone contendo apenas dígitos
 *
 * @example
 * unformatPhone('11 98765-4321') // retorna '11987654321'
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formata data de forma completa em português (ex: "4 de novembro de 2025")
 *
 * @param {Date | string | number} date - Data a ser formatada
 * @returns {string} Data formatada de forma completa ou string vazia se inválida
 *
 * @example
 * formatDateLong(new Date('2025-11-04')) // retorna '4 de novembro de 2025'
 */
export function formatDateLong(date: Date | string | number): string {
  try {
    const dateObject = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
      return '';
    }

    return format(dateObject, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata data e hora em formato brasileiro (DD/MM/YYYY HH:mm)
 *
 * @param {Date | string | number} date - Data e hora a ser formatada
 * @returns {string} Data e hora formatadas ou string vazia se inválida
 *
 * @example
 * formatDateTime(new Date('2025-11-04T14:30:00')) // retorna '04/11/2025 14:30'
 */
export function formatDateTime(date: Date | string | number): string {
  try {
    const dateObject = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
      return '';
    }

    return format(dateObject, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return '';
  }
}
