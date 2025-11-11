/**
 * Arquivo: frontend/src/components/ui/Button.tsx
 * Descrição: Componente de botão reutilizável com suporte a variantes, tamanhos e loading state
 * Feature: feat-066 - Criar componente Button
 * Criado em: 2025-11-03
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Variantes de estilo disponíveis para o botão
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger';

/**
 * Tamanhos disponíveis para o botão
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props do componente Button
 *
 * Estende HTMLButtonElement para suportar todas as props nativas do button
 *
 * @interface ButtonProps
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visual do botão
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Tamanho do botão
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Indica se o botão está em estado de carregamento
   * Quando true, exibe um spinner e desabilita o botão
   * @default false
   */
  loading?: boolean;

  /**
   * Conteúdo do botão (texto ou elementos React)
   */
  children: React.ReactNode;
}

/**
 * Mapeamento de variantes para classes CSS do Tailwind
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
};

/**
 * Mapeamento de tamanhos para classes CSS do Tailwind
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Componente Button
 *
 * Botão reutilizável com suporte a múltiplas variantes, tamanhos e estado de loading.
 *
 * Responsabilidades:
 * - Renderizar botão com estilo apropriado baseado em variante e tamanho
 * - Exibir spinner durante loading state
 * - Desabilitar interação quando loading ou disabled
 * - Manter acessibilidade adequada
 *
 * @example
 * // Botão primary padrão
 * <Button onClick={handleClick}>Salvar</Button>
 *
 * @example
 * // Botão danger com loading
 * <Button variant="danger" loading={isDeleting}>
 *   Excluir
 * </Button>
 *
 * @example
 * // Botão secondary pequeno
 * <Button variant="secondary" size="sm">
 *   Cancelar
 * </Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  // Combina classes base com variante, tamanho e classes customizadas
  const buttonClasses = [
    // Classes base
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-md',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    // Classes de variante
    variantStyles[variant],
    // Classes de tamanho
    sizeStyles[size],
    // Classes customizadas
    className,
  ].join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Loader2
          className="animate-spin"
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
