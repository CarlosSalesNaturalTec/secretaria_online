/**
 * Arquivo: frontend/src/components/ui/__tests__/Button.test.tsx
 * Descrição: Testes unitários para o componente Button
 * Feature: feat-106 - Escrever testes para componentes UI
 * Criado em: 2025-11-04
 *
 * Suite de testes que verifica:
 * - Renderização com diferentes variantes e tamanhos
 * - Comportamento de loading state
 * - Atributos desabilitados
 * - Interação com cliques
 * - Acessibilidade
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  /**
   * Testes de renderização básica
   */
  describe('Renderização', () => {
    it('deve renderizar o botão com texto', () => {
      render(<Button>Clique aqui</Button>);
      const button = screen.getByRole('button', { name: /clique aqui/i });
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar o botão com className personalizado', () => {
      render(<Button className="custom-class">Botão</Button>);
      const button = screen.getByRole('button', { name: /botão/i });
      expect(button).toHaveClass('custom-class');
    });

    it('deve renderizar com type="button" por padrão', () => {
      render(<Button>Botão</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('deve permitir alterar o type para submit', () => {
      render(<Button type="submit">Enviar</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  /**
   * Testes de variantes visuais
   */
  describe('Variantes', () => {
    it('deve renderizar variante primary por padrão', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('deve renderizar variante secondary', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200');
    });

    it('deve renderizar variante danger', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });
  });

  /**
   * Testes de tamanhos
   */
  describe('Tamanhos', () => {
    it('deve renderizar tamanho sm por padrão', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('deve renderizar tamanho md', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('deve renderizar tamanho lg', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  /**
   * Testes de estado loading
   */
  describe('Loading State', () => {
    it('deve exibir spinner quando loading=true', () => {
      render(<Button loading>Salvando...</Button>);
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('deve desabilitar o botão quando loading=true', () => {
      render(<Button loading>Aguarde</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('não deve exibir spinner quando loading=false', () => {
      const { container } = render(<Button loading={false}>Normal</Button>);
      const spinner = container.querySelector('svg.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    it('deve exibir o texto mesmo com loading=true', () => {
      render(<Button loading>Carregando</Button>);
      expect(screen.getByText('Carregando')).toBeInTheDocument();
    });
  });

  /**
   * Testes de estado desabilitado
   */
  describe('Desabilitado', () => {
    it('deve renderizar desabilitado quando disabled=true', () => {
      render(<Button disabled>Desabilitado</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('deve ter classe disabled quando desabilitado', () => {
      render(<Button disabled>Botão</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('não deve disparar onClick quando desabilitado', async () => {
      const handleClick = jest.fn();
      const { rerender } = render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  /**
   * Testes de interação com cliques
   */
  describe('Interações', () => {
    it('deve chamar onClick quando clicado', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('deve aceitar múltiplos cliques', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('não deve chamar onClick quando loading=true', async () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  /**
   * Testes de acessibilidade
   */
  describe('Acessibilidade', () => {
    it('deve ser acessível com keyboard', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
    });

    it('deve ter focus ring para acessibilidade', () => {
      render(<Button>Acessível</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('deve ter role="button" implícito', () => {
      render(<Button>Role Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  /**
   * Testes combinados
   */
  describe('Combinações de props', () => {
    it('deve renderizar corretamente com variant + size + loading', () => {
      render(
        <Button variant="danger" size="lg" loading>
          Delete
        </Button>
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
      expect(button).toBeDisabled();
    });

    it('deve renderizar corretamente com variant + disabled', () => {
      render(
        <Button variant="secondary" disabled>
          Desabilitado
        </Button>
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('bg-gray-200');
      expect(button).toBeDisabled();
    });

    it('deve manter state quando props mudam', async () => {
      const { rerender } = render(<Button>Count 1</Button>);
      expect(screen.getByText('Count 1')).toBeInTheDocument();

      rerender(<Button>Count 2</Button>);
      expect(screen.getByText('Count 2')).toBeInTheDocument();
      expect(screen.queryByText('Count 1')).not.toBeInTheDocument();
    });
  });

  /**
   * Testes de children complexos
   */
  describe('Children', () => {
    it('deve aceitar string como children', () => {
      render(<Button>Texto</Button>);
      expect(screen.getByText('Texto')).toBeInTheDocument();
    });

    it('deve aceitar elementos React como children', () => {
      render(
        <Button>
          <span>React Element</span>
        </Button>
      );
      expect(screen.getByText('React Element')).toBeInTheDocument();
    });

    it('deve aceitar múltiplos children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });
});
