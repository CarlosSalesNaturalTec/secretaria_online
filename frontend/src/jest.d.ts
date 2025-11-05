/**
 * Arquivo: frontend/src/jest.d.ts
 * Descrição: Definição de tipos para matchers do Jest e Testing Library
 * Feature: feat-105 - Configurar Jest e React Testing Library
 * Criado em: 2025-11-04
 */

/// <reference types="jest" />
/// <reference types="react" />
/// <reference types="react/jsx-runtime" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toBeRequired(): R;
      toBePartiallyChecked(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string | string[]): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveDescription(text?: string | RegExp): R;
      toHaveErrorMessage(message: string): R;
    }
  }
}

export {};
