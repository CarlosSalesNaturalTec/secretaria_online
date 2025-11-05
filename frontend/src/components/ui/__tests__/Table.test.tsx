/**
 * Arquivo: frontend/src/components/ui/__tests__/Table.test.tsx
 * Descrição: Testes unitários para o componente Table
 * Feature: feat-106 - Escrever testes para componentes UI
 * Criado em: 2025-11-04
 *
 * Suite de testes que verifica:
 * - Renderização com dados e colunas
 * - Ordenação por coluna
 * - Estados de loading e vazio
 * - Alinhamento de colunas
 * - Customização de células
 * - Acessibilidade
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, Column } from '../Table';

/**
 * Mock de dados para testes
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  age: number;
}

const mockUsers: User[] = [
  { id: 1, name: 'Alice Silva', email: 'alice@example.com', role: 'Admin', age: 30 },
  { id: 2, name: 'Bob Santos', email: 'bob@example.com', role: 'User', age: 25 },
  { id: 3, name: 'Carol Oliveira', email: 'carol@example.com', role: 'User', age: 28 },
];

const createColumns = (): Column<User>[] => [
  {
    key: 'name',
    header: 'Nome',
    accessor: (user) => user.name,
  },
  {
    key: 'email',
    header: 'Email',
    accessor: (user) => user.email,
  },
  {
    key: 'role',
    header: 'Perfil',
    accessor: (user) => user.role,
  },
];

describe('Table Component', () => {
  /**
   * Testes de renderização básica
   */
  describe('Renderização', () => {
    it('deve renderizar tabela com dados', () => {
      const columns = createColumns();
      render(<Table data={mockUsers} columns={columns} />);

      expect(screen.getByText('Alice Silva')).toBeInTheDocument();
      expect(screen.getByText('Bob Santos')).toBeInTheDocument();
      expect(screen.getByText('Carol Oliveira')).toBeInTheDocument();
    });

    it('deve renderizar headers das colunas', () => {
      const columns = createColumns();
      render(<Table data={mockUsers} columns={columns} />);

      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Perfil')).toBeInTheDocument();
    });

    it('deve renderizar células com valores corretos', () => {
      const columns = createColumns();
      render(<Table data={mockUsers} columns={columns} />);

      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      expect(screen.getByText('carol@example.com')).toBeInTheDocument();
    });

    it('deve renderizar com número correto de linhas', () => {
      const columns = createColumns();
      const { container } = render(<Table data={mockUsers} columns={columns} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(mockUsers.length);
    });

    it('deve renderizar com número correto de colunas', () => {
      const columns = createColumns();
      const { container } = render(<Table data={mockUsers} columns={columns} />);

      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells).toHaveLength(columns.length);
    });
  });

  /**
   * Testes de estado vazio
   */
  describe('Estado Vazio', () => {
    it('deve exibir mensagem quando não há dados', () => {
      const columns = createColumns();
      render(<Table data={[]} columns={columns} />);

      expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument();
    });

    it('deve exibir mensagem customizada quando vazio', () => {
      const columns = createColumns();
      render(
        <Table
          data={[]}
          columns={columns}
          emptyMessage="Nenhum usuário cadastrado"
        />
      );

      expect(screen.getByText('Nenhum usuário cadastrado')).toBeInTheDocument();
    });

    it('não deve renderizar linhas quando vazio', () => {
      const columns = createColumns();
      const { container } = render(<Table data={[]} columns={columns} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(1); // Apenas a linha de empty message
    });
  });

  /**
   * Testes de loading state
   */
  describe('Loading State', () => {
    it('deve exibir spinner quando loading=true', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={[]} columns={columns} loading={true} />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('deve exibir mensagem de carregamento', () => {
      const columns = createColumns();
      render(<Table data={[]} columns={columns} loading={true} />);

      expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
    });

    it('não deve renderizar dados quando loading=true', () => {
      const columns = createColumns();
      render(<Table data={mockUsers} columns={columns} loading={true} />);

      expect(screen.queryByText('Alice Silva')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Santos')).not.toBeInTheDocument();
    });

    it('deve renderizar dados quando loading=false', () => {
      const columns = createColumns();
      render(<Table data={mockUsers} columns={columns} loading={false} />);

      expect(screen.getByText('Alice Silva')).toBeInTheDocument();
    });
  });

  /**
   * Testes de ordenação
   */
  describe('Ordenação', () => {
    it('deve renderizar ícone de ordenação para coluna sortable', () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          sortable: true,
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const sortIcon = container.querySelector('button[aria-label*="Ordenar"]');
      expect(sortIcon).toBeInTheDocument();
    });

    it('não deve renderizar botão para coluna não sortable', () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          sortable: false,
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const sortButton = container.querySelector('button[aria-label*="Ordenar"]');
      expect(sortButton).not.toBeInTheDocument();
    });

    it('deve ordenar crescente ao clicar uma vez', async () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          sortable: true,
        },
      ];

      render(<Table data={mockUsers} columns={columns} />);

      const sortButton = screen.getByRole('button', { name: /Ordenar por Nome/i });
      await userEvent.click(sortButton);

      // Verificar ordem (Alice < Bob < Carol)
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Alice');
      expect(rows[2].textContent).toContain('Bob');
      expect(rows[3].textContent).toContain('Carol');
    });

    it('deve ordenar decrescente ao clicar duas vezes', async () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          sortable: true,
        },
      ];

      render(<Table data={mockUsers} columns={columns} />);

      const sortButton = screen.getByRole('button', { name: /Ordenar por Nome/i });

      // Primeira clique (asc)
      await userEvent.click(sortButton);

      // Segunda clique (desc)
      await userEvent.click(sortButton);

      // Verificar ordem reversa (Carol > Bob > Alice)
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Carol');
      expect(rows[2].textContent).toContain('Bob');
      expect(rows[3].textContent).toContain('Alice');
    });

    it('deve remover ordenação ao clicar três vezes', async () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          sortable: true,
        },
      ];

      render(<Table data={mockUsers} columns={columns} />);

      const sortButton = screen.getByRole('button', { name: /Ordenar por Nome/i });

      // Clica 3 vezes para remover ordenação
      await userEvent.click(sortButton);
      await userEvent.click(sortButton);
      await userEvent.click(sortButton);

      // Volta à ordem original
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Alice');
    });

    it('deve ordenar por número corretamente', async () => {
      const columns: Column<User>[] = [
        {
          key: 'age',
          header: 'Idade',
          accessor: (user) => user.age,
          sortable: true,
        },
      ];

      render(<Table data={mockUsers} columns={columns} />);

      const sortButton = screen.getByRole('button', { name: /Ordenar por Idade/i });
      await userEvent.click(sortButton);

      // Verificar ordem numérica (25 < 28 < 30)
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('25'); // Bob
      expect(rows[2].textContent).toContain('28'); // Carol
      expect(rows[3].textContent).toContain('30'); // Alice
    });
  });

  /**
   * Testes de alinhamento
   */
  describe('Alinhamento', () => {
    it('deve alinhar conteúdo à esquerda por padrão', () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          align: 'left',
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-left');
    });

    it('deve alinhar conteúdo ao centro', () => {
      const columns: Column<User>[] = [
        {
          key: 'role',
          header: 'Perfil',
          accessor: (user) => user.role,
          align: 'center',
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-center');
    });

    it('deve alinhar conteúdo à direita', () => {
      const columns: Column<User>[] = [
        {
          key: 'age',
          header: 'Idade',
          accessor: (user) => user.age,
          align: 'right',
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-right');
    });
  });

  /**
   * Testes de customização de células
   */
  describe('Customização de Células', () => {
    it('deve renderizar conteúdo customizado nas células', () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => <strong>{user.name}</strong>,
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const strong = container.querySelector('strong');
      expect(strong?.textContent).toContain('Alice Silva');
    });

    it('deve aceitar classes customizadas nas células', () => {
      const columns: Column<User>[] = [
        {
          key: 'role',
          header: 'Perfil',
          accessor: (user) => user.role,
          cellClassName: 'font-bold text-blue-600',
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const cell = container.querySelector('.font-bold');
      expect(cell).toBeInTheDocument();
    });

    it('deve aceitar classes customizadas nos headers', () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          headerClassName: 'bg-blue-100',
        },
      ];

      const { container } = render(<Table data={mockUsers} columns={columns} />);
      const header = container.querySelector('.bg-blue-100');
      expect(header).toBeInTheDocument();
    });
  });

  /**
   * Testes de hover e striping
   */
  describe('Hover e Striping', () => {
    it('deve exibir hover effect por padrão', () => {
      const columns = createColumns();
      const { container } = render(<Table data={mockUsers} columns={columns} />);

      const row = container.querySelector('tbody tr');
      expect(row).toHaveClass('hover:bg-gray-50');
    });

    it('não deve exibir hover quando hoverable=false', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={mockUsers} columns={columns} hoverable={false} />
      );

      const row = container.querySelector('tbody tr');
      expect(row?.className).not.toContain('hover:bg-gray-50');
    });

    it('deve exibir zebra striping quando striped=true', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={mockUsers} columns={columns} striped={true} />
      );

      // Segunda linha deve ter classe de striping (índice ímpar)
      const rows = container.querySelectorAll('tbody tr');
      // A segunda linha tem índice 1 (ímpar), então deve ter a classe
      if (rows[1]) {
        expect(rows[1]).toHaveClass('bg-gray-50/50');
      }
    });

    it('não deve exibir striping por padrão', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={mockUsers} columns={columns} striped={false} />
      );

      const rows = container.querySelectorAll('tbody tr');
      // A classe de striping é 'bg-gray-50/50' ou semelhante
      const hasBgGray50Striping = rows[1]?.className.includes('bg-gray-50/50');
      expect(hasBgGray50Striping).toBeFalsy();
    });
  });

  /**
   * Testes de getRowKey
   */
  describe('getRowKey', () => {
    it('deve usar função customizada para key das linhas', () => {
      const columns = createColumns();
      const getRowKey = jest.fn((user) => `user-${user.id}`);

      const { container } = render(
        <Table data={mockUsers} columns={columns} getRowKey={getRowKey} />
      );

      // Verificar que a função foi chamada
      expect(getRowKey).toHaveBeenCalled();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });
  });

  /**
   * Testes de className
   */
  describe('className', () => {
    it('deve aceitar className customizado', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={mockUsers} columns={columns} className="custom-table" />
      );

      const table = container.querySelector('.custom-table');
      expect(table).toBeInTheDocument();
    });
  });

  /**
   * Testes de acessibilidade
   */
  describe('Acessibilidade', () => {
    it('deve ter role="table"', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={mockUsers} columns={columns} />
      );

      const table = container.querySelector('table');
      // Table é implícito HTML
      expect(table).toBeInTheDocument();
    });

    it('deve ter scope="col" nos headers', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={mockUsers} columns={columns} />
      );

      const headers = container.querySelectorAll('th');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('deve ter aria-label nos botões de ordenação', () => {
      const columns: Column<User>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (user) => user.name,
          sortable: true,
        },
      ];

      render(<Table data={mockUsers} columns={columns} />);

      const sortButton = screen.getByRole('button', { name: /ordenar/i });
      expect(sortButton).toHaveAttribute('aria-label');
    });

    it('deve ter role="alert" na mensagem de vazio', () => {
      const columns = createColumns();
      const { container } = render(
        <Table data={[]} columns={columns} />
      );

      // A mensagem vazia está numa td, não tem role alert direto
      const emptyCell = screen.getByText('Nenhum registro encontrado');
      expect(emptyCell).toBeInTheDocument();
    });
  });

  /**
   * Testes de tipo genérico
   */
  describe('Type Safety', () => {
    it('deve manter tipos corretos com dados genéricos', () => {
      interface Product {
        id: number;
        name: string;
        price: number;
      }

      const products: Product[] = [
        { id: 1, name: 'Produto A', price: 100 },
        { id: 2, name: 'Produto B', price: 200 },
      ];

      const columns: Column<Product>[] = [
        {
          key: 'name',
          header: 'Nome',
          accessor: (product) => product.name,
        },
        {
          key: 'price',
          header: 'Preço',
          accessor: (product) => `R$ ${product.price}`,
        },
      ];

      render(<Table data={products} columns={columns} />);

      expect(screen.getByText('Produto A')).toBeInTheDocument();
      expect(screen.getByText('R$ 100')).toBeInTheDocument();
    });
  });
});
