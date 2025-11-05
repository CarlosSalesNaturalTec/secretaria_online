/**
 * Arquivo: frontend/src/utils/validators.ts
 * Descrição: Schemas Zod para validação de formulários e dados
 * Feature: feat-099 - Criar validators.ts com Zod schemas
 * Criado em: 2025-11-04
 */

import { z } from 'zod';

/**
 * Validador de CPF
 *
 * Verifica:
 * - Formato: 11 dígitos numéricos
 * - Dígitos verificadores: algoritmo padrão CPF
 * - Rejeita sequências repetidas (ex: 111.111.111-11)
 *
 * @param cpf - String com CPF no formato com ou sem máscara
 * @returns boolean - true se CPF é válido
 */
export function cpfValidator(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem exatamente 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Rejeita sequências repetidas
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  let remainder = 0;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  remainder = remainder === 10 ? 0 : remainder;

  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return false;
  }

  // Calcula segundo dígito verificador
  sum = 0;

  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  remainder = remainder === 10 ? 0 : remainder;

  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Validador de Email
 *
 * Verifica:
 * - Formato básico de email (RFC 5322 simplificado)
 * - Comprimento máximo: 254 caracteres
 *
 * @param email - String com endereço de email
 * @returns boolean - true se email é válido
 */
export function emailValidator(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Schema de Login
 *
 * Usado para validação de credenciais na tela de login.
 * Aceita login (email ou nome de usuário) e senha.
 *
 * @example
 * const result = loginSchema.parse({
 *   login: "admin",
 *   password: "senha123"
 * });
 */
export const loginSchema = z.object({
  login: z.string()
    .min(3, { message: 'Login deve ter no mínimo 3 caracteres' })
    .max(100, { message: 'Login não pode exceder 100 caracteres' })
    .trim(),
  password: z.string()
    .min(1, { message: 'Senha é obrigatória' })
    .max(100, { message: 'Senha não pode exceder 100 caracteres' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de Aluno
 *
 * Usado para validação de cadastro e edição de alunos.
 * Inclui validações conforme specification em requirements.md:
 * - Campos obrigatórios: nome, RG, CPF, nome da mãe, nome do pai, endereço, título
 * - Validação de CPF com dígito verificador
 * - Email como identificador único
 * - Reservista (opcional)
 *
 * @example
 * const result = studentSchema.parse({
 *   name: "João Silva",
 *   email: "joao@example.com",
 *   cpf: "123.456.789-10",
 *   rg: "12.345.678-9",
 *   motherName: "Maria Silva",
 *   fatherName: "José Silva",
 *   address: "Rua A, 123",
 *   title: "Ensino Médio",
 *   reservist: "Dispensado",
 *   login: "joao_silva"
 * });
 */
export const studentSchema = z.object({
  name: z.string()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .max(150, { message: 'Nome não pode exceder 150 caracteres' })
    .trim(),
  email: z.string()
    .email({ message: 'Email inválido' })
    .max(254, { message: 'Email não pode exceder 254 caracteres' })
    .trim(),
  cpf: z.string()
    .refine(cpfValidator, { message: 'CPF inválido' }),
  rg: z.string()
    .min(5, { message: 'RG deve ter no mínimo 5 caracteres' })
    .max(20, { message: 'RG não pode exceder 20 caracteres' })
    .trim(),
  motherName: z.string()
    .min(3, { message: 'Nome da mãe deve ter no mínimo 3 caracteres' })
    .max(150, { message: 'Nome da mãe não pode exceder 150 caracteres' })
    .trim(),
  fatherName: z.string()
    .min(3, { message: 'Nome do pai deve ter no mínimo 3 caracteres' })
    .max(150, { message: 'Nome do pai não pode exceder 150 caracteres' })
    .trim(),
  address: z.string()
    .min(5, { message: 'Endereço deve ter no mínimo 5 caracteres' })
    .max(300, { message: 'Endereço não pode exceder 300 caracteres' })
    .trim(),
  title: z.string()
    .min(2, { message: 'Título deve ter no mínimo 2 caracteres' })
    .max(100, { message: 'Título não pode exceder 100 caracteres' })
    .trim(),
  reservist: z.string()
    .max(50, { message: 'Status de reservista não pode exceder 50 caracteres' })
    .trim()
    .optional(),
  login: z.string()
    .min(3, { message: 'Login deve ter no mínimo 3 caracteres' })
    .max(50, { message: 'Login não pode exceder 50 caracteres' })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Login deve conter apenas letras, números, hífen e underscore' })
    .trim(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

/**
 * Schema de Professor
 *
 * Usado para validação de cadastro e edição de professores.
 * Inclui validações conforme specification em requirements.md:
 * - Campos obrigatórios: nome, RG, CPF, nome da mãe, nome do pai, endereço, título
 * - Validação de CPF com dígito verificador
 * - Email como identificador único
 * - Reservista (opcional)
 *
 * @example
 * const result = teacherSchema.parse({
 *   name: "Prof. João Silva",
 *   email: "prof@example.com",
 *   cpf: "123.456.789-10",
 *   rg: "12.345.678-9",
 *   motherName: "Maria Silva",
 *   fatherName: "José Silva",
 *   address: "Rua A, 123",
 *   title: "Mestrado em Educação",
 *   reservist: "Dispensado",
 *   login: "prof_joao"
 * });
 */
export const teacherSchema = z.object({
  name: z.string()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .max(150, { message: 'Nome não pode exceder 150 caracteres' })
    .trim(),
  email: z.string()
    .email({ message: 'Email inválido' })
    .max(254, { message: 'Email não pode exceder 254 caracteres' })
    .trim(),
  cpf: z.string()
    .refine(cpfValidator, { message: 'CPF inválido' }),
  rg: z.string()
    .min(5, { message: 'RG deve ter no mínimo 5 caracteres' })
    .max(20, { message: 'RG não pode exceder 20 caracteres' })
    .trim(),
  motherName: z.string()
    .min(3, { message: 'Nome da mãe deve ter no mínimo 3 caracteres' })
    .max(150, { message: 'Nome da mãe não pode exceder 150 caracteres' })
    .trim(),
  fatherName: z.string()
    .min(3, { message: 'Nome do pai deve ter no mínimo 3 caracteres' })
    .max(150, { message: 'Nome do pai não pode exceder 150 caracteres' })
    .trim(),
  address: z.string()
    .min(5, { message: 'Endereço deve ter no mínimo 5 caracteres' })
    .max(300, { message: 'Endereço não pode exceder 300 caracteres' })
    .trim(),
  title: z.string()
    .min(2, { message: 'Título deve ter no mínimo 2 caracteres' })
    .max(100, { message: 'Título não pode exceder 100 caracteres' })
    .trim(),
  reservist: z.string()
    .max(50, { message: 'Status de reservista não pode exceder 50 caracteres' })
    .trim()
    .optional(),
  login: z.string()
    .min(3, { message: 'Login deve ter no mínimo 3 caracteres' })
    .max(50, { message: 'Login não pode exceder 50 caracteres' })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Login deve conter apenas letras, números, hífen e underscore' })
    .trim(),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
