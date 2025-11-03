/**
 * Arquivo: frontend/src/components/ui/Table.tsx
 * Descrição: Componente de tabela reutilizável com suporte a colunas customizáveis, sorting básico e loading state
 * Feature: feat-069 - Criar componente Table
 * Criado em: 2025-11-03
 */

import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react';

/**
 * Direção de ordenação
 */
type SortDirection = 'asc' | 'desc' | null;

/**
 * Definição de uma coluna da tabela
 *
 * @template T - Tipo dos dados da linha
 */
export interface Column<T> {
  /**
   * Identificador único da coluna
   */
  key: string;

  /**
   * Título exibido no cabeçalho da coluna
   */
  header: string;

  /**
   * Função para acessar o valor da célula a partir dos dados da linha
   * Pode retornar qualquer tipo: string, number, React.ReactNode, etc.
   */
  accessor: (row: T) => React.ReactNode;

  /**
   * Se true, permite ordenação por esta coluna
   * @default false
   */
  sortable?: boolean;

  /**
   * Função customizada de comparação para sorting
   * Se não fornecida, usa comparação padrão
   */
  sortFn?: (a: T, b: T) => number;

  /**
   * Classes CSS adicionais para as células desta coluna
   */
  cellClassName?: string;

  /**
   * Classes CSS adicionais para o header desta coluna
   */
  headerClassName?: string;

  /**
   * Alinhamento do conteúdo da coluna
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * Props do componente Table
 *
 * @template T - Tipo dos dados das linhas
 */
interface TableProps<T> {
  /**
   * Array de dados a serem exibidos na tabela
   */
  data: T[];

  /**
   * Definição das colunas da tabela
   */
  columns: Column<T>[];

  /**
   * Indica se a tabela está em estado de carregamento
   * Exibe skeleton/spinner quando true
   * @default false
   */
  loading?: boolean;

  /**
   * Mensagem exibida quando não há dados
   * @default 'Nenhum registro encontrado'
   */
  emptyMessage?: string;

  /**
   * Função para extrair uma chave única de cada linha (para React keys)
   * Se não fornecida, usa o índice (não recomendado para listas dinâmicas)
   */
  getRowKey?: (row: T, index: number) => string | number;

  /**
   * Classes CSS adicionais para o container da tabela
   */
  className?: string;

  /**
   * Se true, adiciona hover effect nas linhas
   * @default true
   */
  hoverable?: boolean;

  /**
   * Se true, adiciona zebra striping (linhas alternadas)
   * @default false
   */
  striped?: boolean;
}

/**
 * Mapeamento de alinhamento para classes CSS
 */
const alignmentStyles: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Componente Table
 *
 * Tabela reutilizável e genérica com suporte a colunas customizáveis, ordenação básica
 * e estados de loading/empty.
 *
 * Responsabilidades:
 * - Renderizar tabela com cabeçalho e corpo
 * - Exibir dados de forma organizada em colunas
 * - Permitir ordenação por colunas sortable
 * - Exibir loading state durante carregamento
 * - Exibir mensagem quando não há dados
 * - Garantir acessibilidade
 * - Suportar tipos genéricos para type-safety
 *
 * @example
 * // Tabela simples de usuários
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   role: string;
 * }
 *
 * const columns: Column<User>[] = [
 *   {
 *     key: 'name',
 *     header: 'Nome',
 *     accessor: (user) => user.name,
 *     sortable: true,
 *   },
 *   {
 *     key: 'email',
 *     header: 'Email',
 *     accessor: (user) => user.email,
 *   },
 *   {
 *     key: 'role',
 *     header: 'Perfil',
 *     accessor: (user) => user.role,
 *     align: 'center',
 *   },
 * ];
 *
 * <Table
 *   data={users}
 *   columns={columns}
 *   loading={isLoading}
 *   getRowKey={(user) => user.id}
 * />
 *
 * @example
 * // Tabela com células customizadas
 * const columns: Column<Student>[] = [
 *   {
 *     key: 'name',
 *     header: 'Nome',
 *     accessor: (student) => student.name,
 *     sortable: true,
 *   },
 *   {
 *     key: 'status',
 *     header: 'Status',
 *     accessor: (student) => (
 *       <span className={student.active ? 'text-green-600' : 'text-red-600'}>
 *         {student.active ? 'Ativo' : 'Inativo'}
 *       </span>
 *     ),
 *     align: 'center',
 *   },
 *   {
 *     key: 'actions',
 *     header: 'Ações',
 *     accessor: (student) => (
 *       <Button size="sm" onClick={() => handleEdit(student.id)}>
 *         Editar
 *       </Button>
 *     ),
 *     align: 'right',
 *   },
 * ];
 */
export function Table<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  getRowKey,
  className = '',
  hoverable = true,
  striped = false,
}: TableProps<T>) {
  // Estado de ordenação
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  /**
   * Handler para clique no cabeçalho de coluna sortable
   * Cicla entre: null -> asc -> desc -> null
   *
   * @param columnKey - Key da coluna clicada
   */
  const handleSort = (columnKey: string) => {
    if (sortKey === columnKey) {
      // Mesma coluna: cicla através dos estados
      if (sortDirection === null) {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      // Nova coluna: inicia com asc
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  /**
   * Dados ordenados baseados no estado de sorting
   */
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return data;
    }

    const column = columns.find((col) => col.key === sortKey);
    if (!column) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      // Usa função customizada de sorting se fornecida
      if (column.sortFn) {
        return column.sortFn(a, b);
      }

      // Sorting padrão por valor de accessor
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      // Converte para string para comparação (funciona para números e strings)
      const aStr = String(aValue);
      const bStr = String(bValue);

      return aStr.localeCompare(bStr, 'pt-BR', { numeric: true });
    });

    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [data, columns, sortKey, sortDirection]);

  /**
   * Renderiza ícone de ordenação apropriado para o header
   *
   * @param columnKey - Key da coluna
   * @returns Ícone de ordenação
   */
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown size={16} className="text-gray-400" aria-hidden="true" />;
    }

    if (sortDirection === 'asc') {
      return <ArrowUp size={16} className="text-blue-600" aria-hidden="true" />;
    }

    if (sortDirection === 'desc') {
      return <ArrowDown size={16} className="text-blue-600" aria-hidden="true" />;
    }

    return <ArrowUpDown size={16} className="text-gray-400" aria-hidden="true" />;
  };

  /**
   * Renderiza skeleton loading state
   */
  const renderLoadingState = () => (
    <tr>
      <td colSpan={columns.length} className="px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} aria-hidden="true" />
          <span className="text-sm text-gray-500">Carregando dados...</span>
        </div>
      </td>
    </tr>
  );

  /**
   * Renderiza empty state
   */
  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full border-collapse bg-white text-sm">
        {/* Cabeçalho */}
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => {
              const align = column.align || 'left';
              const isSortable = column.sortable ?? false;

              return (
                <th
                  key={column.key}
                  className={[
                    'px-6 py-3 font-semibold text-gray-700',
                    alignmentStyles[align],
                    column.headerClassName || '',
                  ].join(' ')}
                  scope="col"
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-2 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition-colors"
                      aria-label={`Ordenar por ${column.header}`}
                    >
                      <span>{column.header}</span>
                      {renderSortIcon(column.key)}
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Corpo */}
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            renderLoadingState()
          ) : sortedData.length === 0 ? (
            renderEmptyState()
          ) : (
            sortedData.map((row, index) => {
              const rowKey = getRowKey ? getRowKey(row, index) : index;
              const rowClasses = [
                hoverable ? 'hover:bg-gray-50 transition-colors' : '',
                striped && index % 2 === 1 ? 'bg-gray-50/50' : '',
              ].join(' ');

              return (
                <tr key={rowKey} className={rowClasses}>
                  {columns.map((column) => {
                    const align = column.align || 'left';

                    return (
                      <td
                        key={`${rowKey}-${column.key}`}
                        className={[
                          'px-6 py-4',
                          alignmentStyles[align],
                          column.cellClassName || '',
                        ].join(' ')}
                      >
                        {column.accessor(row)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
