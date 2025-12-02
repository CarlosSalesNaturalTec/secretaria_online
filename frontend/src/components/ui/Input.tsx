/**
 * Arquivo: frontend/src/components/ui/Input.tsx
 * Descrição: Componente de input reutilizável com suporte a label, error message, tipos e máscaras
 * Feature: feat-067 - Criar componente Input
 * Criado em: 2025-11-03
 */

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Tipos de input disponíveis
 */
type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'date';

/**
 * Máscaras disponíveis para formatação automática
 */
type InputMask = 'cpf' | 'phone' | 'celular' | 'cep' | 'none';

/**
 * Props do componente Input
 *
 * Estende HTMLInputElement para suportar todas as props nativas do input
 *
 * @interface InputProps
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Tipo do input
   * @default 'text'
   */
  type?: InputType;

  /**
   * Label do input (opcional)
   */
  label?: string;

  /**
   * Mensagem de erro a ser exibida
   * Quando presente, o input entra em estado de erro
   */
  error?: string;

  /**
   * Texto de ajuda exibido abaixo do input
   */
  helperText?: string;

  /**
   * Máscara a ser aplicada no input
   * @default 'none'
   */
  mask?: InputMask;

  /**
   * Indica se o campo é obrigatório
   * Adiciona asterisco vermelho no label
   * @default false
   */
  required?: boolean;

  /**
   * ID do input (importante para acessibilidade)
   * Se não fornecido, será gerado automaticamente
   */
  id?: string;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * Aplica máscara de CPF (###.###.###-##)
 *
 * @param value - Valor a ser formatado
 * @returns Valor formatado como CPF
 */
const applyCPFMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

/**
 * Aplica máscara de telefone ((##) #####-####)
 *
 * @param value - Valor a ser formatado
 * @returns Valor formatado como telefone
 */
const applyPhoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

/**
 * Aplica máscara de celular ((##) #####-####)
 *
 * @param value - Valor a ser formatado
 * @returns Valor formatado como celular
 */
const applyCelularMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

/**
 * Aplica máscara de CEP (#####-###)
 *
 * @param value - Valor a ser formatado
 * @returns Valor formatado como CEP
 */
const applyCEPMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

/**
 * Aplica máscara baseada no tipo selecionado
 *
 * @param value - Valor a ser formatado
 * @param mask - Tipo de máscara a aplicar
 * @returns Valor formatado
 */
const applyMask = (value: string, mask: InputMask): string => {
  if (mask === 'cpf') return applyCPFMask(value);
  if (mask === 'phone') return applyPhoneMask(value);
  if (mask === 'celular') return applyCelularMask(value);
  if (mask === 'cep') return applyCEPMask(value);
  return value;
};

/**
 * Remove máscara e retorna apenas números
 *
 * @param value - Valor mascarado
 * @returns Apenas números
 */
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Componente Input
 *
 * Input reutilizável com suporte a label, mensagens de erro, tipos diversos e máscaras automáticas.
 *
 * Responsabilidades:
 * - Renderizar input com label e mensagens de ajuda/erro
 * - Aplicar máscaras automaticamente (CPF, telefone)
 * - Exibir/ocultar senha com botão toggle
 * - Manter estado de erro visual
 * - Garantir acessibilidade (aria-labels, aria-invalid, etc.)
 * - Integração com React Hook Form via forwardRef
 *
 * @example
 * // Input de texto simples
 * <Input
 *   label="Nome completo"
 *   placeholder="Digite seu nome"
 *   required
 * />
 *
 * @example
 * // Input com erro
 * <Input
 *   label="Email"
 *   type="email"
 *   error="Email inválido"
 * />
 *
 * @example
 * // Input com máscara de CPF
 * <Input
 *   label="CPF"
 *   mask="cpf"
 *   placeholder="000.000.000-00"
 *   required
 * />
 *
 * @example
 * // Input de senha com toggle
 * <Input
 *   label="Senha"
 *   type="password"
 *   helperText="Mínimo 8 caracteres"
 * />
 *
 * @example
 * // Uso com React Hook Form
 * <Input
 *   {...register('email')}
 *   label="Email"
 *   type="email"
 *   error={errors.email?.message}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      error,
      helperText,
      mask = 'none',
      required = false,
      id,
      className = '',
      disabled = false,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    // Estado para controlar visibilidade da senha
    const [showPassword, setShowPassword] = useState(false);

    // Gera ID único se não fornecido (importante para acessibilidade)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determina o tipo real do input (para toggle de senha)
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Classes base do input
    const baseClasses = [
      'block w-full rounded-md border px-3 py-2',
      'text-gray-900 placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'transition-colors duration-200',
      'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
    ];

    // Classes condicionais baseadas no estado
    const stateClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    // Classes para input com botão de toggle (senha)
    const paddingClass = type === 'password' ? 'pr-10' : '';

    const inputClasses = [...baseClasses, stateClasses, paddingClass, className].join(' ');

    /**
     * Handler para mudanças no input com aplicação de máscara
     *
     * @param e - Evento de mudança do input
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask !== 'none') {
        const maskedValue = applyMask(e.target.value, mask);
        e.target.value = maskedValue;
      }

      if (onChange) {
        onChange(e);
      }
    };

    /**
     * Toggle para mostrar/ocultar senha
     */
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
          </label>
        )}

        {/* Container do input com botão de toggle (se aplicável) */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            onChange={handleChange}
            value={value}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            aria-required={required}
            {...props}
          />

          {/* Botão de toggle para senha */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div
            id={`${inputId}-error`}
            className="mt-1 flex items-center gap-1 text-sm text-red-600"
            role="alert"
          >
            <AlertCircle size={14} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Texto de ajuda */}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Define display name para melhor debugging
Input.displayName = 'Input';
