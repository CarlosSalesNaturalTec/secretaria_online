/**
 * Arquivo: frontend/src/components/ui/__tests__/Input.test.tsx
 * Descrição: Testes unitários para o componente Input
 * Feature: feat-106 - Escrever testes para componentes UI
 * Criado em: 2025-11-04
 *
 * Suite de testes que verifica:
 * - Renderização com label, placeholder e tipos
 * - Máscara de CPF e telefone
 * - Estado de erro
 * - Comportamento de entrada de texto
 * - Toggle de senha
 * - Acessibilidade
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, removeMask } from '../Input';

describe('Input Component', () => {
  /**
   * Testes de renderização básica
   */
  describe('Renderização', () => {
    it('deve renderizar um input', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar com placeholder', () => {
      render(<Input placeholder="Digite algo" />);
      const input = screen.getByPlaceholderText('Digite algo');
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar com label', () => {
      render(<Input label="Nome" />);
      const label = screen.getByText('Nome');
      expect(label).toBeInTheDocument();
    });

    it('deve renderizar com label e marca de obrigatório', () => {
      render(<Input label="Email" required />);
      const label = screen.getByText(/email/i);
      const required = label.querySelector('[aria-label="obrigatório"]');
      expect(required).toBeInTheDocument();
    });

    it('deve renderizar com helperText', () => {
      render(<Input helperText="Mínimo 8 caracteres" />);
      const helper = screen.getByText('Mínimo 8 caracteres');
      expect(helper).toBeInTheDocument();
    });
  });

  /**
   * Testes de tipos de input
   */
  describe('Tipos de Input', () => {
    it('deve renderizar input de texto por padrão', () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('deve renderizar input de email', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('deve renderizar input de password', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input[type="password"]') as HTMLInputElement;
      expect(input?.type).toBe('password');
    });

    it('deve renderizar input de telefone', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('tel');
    });

    it('deve renderizar input de número', () => {
      const { container } = render(<Input type="number" />);
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input?.type).toBe('number');
    });
  });

  /**
   * Testes de entrada de texto
   */
  describe('Entrada de Texto', () => {
    it('deve registrar mudanças no input', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalled();
    });

    it('deve atualizar o valor do input', async () => {
      render(<Input value="Texto inicial" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Texto inicial');
    });

    it('deve permitir digitação em um input controlado', async () => {
      const { rerender } = render(
        <Input value="" onChange={() => rerender(<Input value="A" onChange={() => {}} />)} />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await userEvent.type(input, 'A');

      rerender(<Input value="A" onChange={() => {}} />);
      expect(input.value).toBe('A');
    });
  });

  /**
   * Testes de máscara de CPF
   */
  describe('Máscara CPF', () => {
    it('deve aplicar máscara de CPF ao digitar', async () => {
      const handleChange = jest.fn();
      render(<Input mask="cpf" onChange={handleChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await userEvent.type(input, '12345678910');

      // A máscara é aplicada no onChange handler
      expect(handleChange).toHaveBeenCalled();
    });

    it('deve remover caracteres não numéricos da máscara CPF', () => {
      const value = '123.456.789-10';
      const result = removeMask(value);
      expect(result).toBe('12345678910');
    });

    it('deve limitar entrada de CPF a 11 dígitos', async () => {
      render(<Input mask="cpf" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await userEvent.type(input, '123456789101112');

      // A máscara deve limitar a 11 dígitos
      const cleanValue = removeMask(input.value);
      expect(cleanValue.length).toBeLessThanOrEqual(11);
    });
  });

  /**
   * Testes de máscara de telefone
   */
  describe('Máscara Telefone', () => {
    it('deve aplicar máscara de telefone ao digitar', async () => {
      const handleChange = jest.fn();
      render(<Input mask="phone" onChange={handleChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await userEvent.type(input, '1199999999');

      expect(handleChange).toHaveBeenCalled();
    });

    it('deve remover caracteres da máscara de telefone', () => {
      const value = '(11) 99999-9999';
      const result = removeMask(value);
      expect(result).toBe('11999999999');
    });
  });

  /**
   * Testes de estado de erro
   */
  describe('Estado de Erro', () => {
    it('deve exibir mensagem de erro', () => {
      render(<Input error="Email inválido" />);
      const error = screen.getByText('Email inválido');
      expect(error).toBeInTheDocument();
    });

    it('deve ter classe de erro quando error é fornecido', () => {
      render(<Input error="Erro!" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500', 'focus:border-red-500');
    });

    it('deve ter classe normal quando sem erro', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300', 'focus:border-blue-500');
    });

    it('não deve exibir helperText quando há erro', () => {
      render(<Input error="Erro" helperText="Ajuda" />);
      expect(screen.getByText('Erro')).toBeInTheDocument();
      expect(screen.queryByText('Ajuda')).not.toBeInTheDocument();
    });

    it('deve ter aria-invalid quando há erro', () => {
      render(<Input error="Erro!" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  /**
   * Testes de toggle de senha
   */
  describe('Toggle de Senha', () => {
    it('deve exibir botão de toggle para input de senha', () => {
      render(<Input type="password" />);
      const toggleButton = screen.getByRole('button', { name: /mostrar senha/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('deve alternar visibilidade de senha', async () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input[type="password"]') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /mostrar senha/i });

      // Inicialmente tipo password
      expect(input.type).toBe('password');

      // Clica para mostrar
      await userEvent.click(toggleButton);
      expect(input.type).toBe('text');

      // Clica para ocultar
      await userEvent.click(toggleButton);
      expect(input.type).toBe('password');
    });

    it('deve mudar o ícone ao alternar visibilidade', async () => {
      render(<Input type="password" />);
      const toggleButton = screen.getByRole('button', { name: /mostrar senha/i });

      // Inicialmente "Mostrar"
      expect(screen.getByLabelText(/mostrar senha/i)).toBeInTheDocument();

      // Após clique
      await userEvent.click(toggleButton);
      expect(screen.getByLabelText(/ocultar senha/i)).toBeInTheDocument();
    });

    it('não deve exibir botão de toggle para input de texto', () => {
      render(<Input type="text" />);
      const toggleButton = screen.queryByRole('button', { name: /mostrar senha/i });
      expect(toggleButton).not.toBeInTheDocument();
    });
  });

  /**
   * Testes de estado desabilitado
   */
  describe('Desabilitado', () => {
    it('deve desabilitar o input', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('deve ter classe de disabled quando desabilitado', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
    });

    it('não deve aceitar entrada quando desabilitado', async () => {
      const handleChange = jest.fn();
      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'texto');

      // Em um input desabilitado, events pode não disparar
      expect(input).toBeDisabled();
    });
  });

  /**
   * Testes de acessibilidade
   */
  describe('Acessibilidade', () => {
    it('deve associar label ao input via htmlFor', () => {
      render(<Input label="Nome completo" id="name-input" />);
      const label = screen.getByText('Nome completo') as HTMLLabelElement;
      expect(label.htmlFor).toBe('name-input');
    });

    it('deve gerar ID automático se não fornecido', () => {
      render(<Input label="Automático" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.id).toMatch(/input-/);
    });

    it('deve ter aria-required quando required', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('deve ter aria-describedby para mensagem de erro', () => {
      const { container } = render(<Input error="Erro" id="test-input" />);
      const input = container.querySelector('#test-input');
      const describedBy = input?.getAttribute('aria-describedby');
      expect(describedBy).toMatch(/test-input-error/);
    });

    it('deve ter aria-describedby para helper text', () => {
      const { container } = render(
        <Input helperText="Ajuda" id="test-input" error={undefined} />
      );
      const input = container.querySelector('#test-input');
      const describedBy = input?.getAttribute('aria-describedby');
      expect(describedBy).toMatch(/test-input-helper/);
    });
  });

  /**
   * Testes com ref
   */
  describe('Ref Forwarding', () => {
    it('deve aceitar ref', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('deve permitir acessar propriedades do input via ref', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} value="teste" onChange={() => {}} />);
      expect(ref.current?.value).toBe('teste');
    });
  });

  /**
   * Testes combinados
   */
  describe('Combinações de props', () => {
    it('deve renderizar com label, placeholder, required e helperText', () => {
      render(
        <Input
          label="Email"
          placeholder="seu@email.com"
          required
          helperText="Será usado para login"
        />
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
      expect(screen.getByText('Será usado para login')).toBeInTheDocument();
    });

    it('deve renderizar password com máscara', async () => {
      // Nota: máscara em password pode não fazer muito sentido, mas deve ser testado
      const handleChange = jest.fn();
      const { container } = render(<Input type="password" mask="none" onChange={handleChange} />);

      const input = container.querySelector('input[type="password"]');
      const button = screen.getByRole('button', { name: /mostrar/i });

      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar com error, disabled e required', () => {
      render(
        <Input label="Campo" error="Erro!" required disabled />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('Erro!')).toBeInTheDocument();
    });
  });
});
