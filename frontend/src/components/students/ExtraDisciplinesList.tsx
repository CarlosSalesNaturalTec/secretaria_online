/**
 * Arquivo: frontend/src/components/students/ExtraDisciplinesList.tsx
 * Descrição: Lista de disciplinas extras de um aluno
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-19
 */

import { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  REASON_LABELS,
  type IStudentExtraDiscipline,
  type ExtraDisciplineStatus,
} from '@/types/studentExtraDiscipline.types';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

/**
 * Props do ExtraDisciplinesList
 */
interface ExtraDisciplinesListProps {
  /**
   * ID do aluno
   */
  studentId: number;

  /**
   * Lista de disciplinas extras
   */
  extraDisciplines: IStudentExtraDiscipline[];

  /**
   * Se true, mostra botões de adicionar/remover
   */
  editable?: boolean;

  /**
   * Callback ao clicar em adicionar
   */
  onAdd?: () => void;

  /**
   * Callback ao clicar em remover
   */
  onDelete?: (extraDiscipline: IStudentExtraDiscipline) => void;

  /**
   * Indica se está carregando
   */
  isLoading?: boolean;
}

/**
 * Badge colorido para status
 */
function StatusBadge({ status }: { status: ExtraDisciplineStatus }) {
  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  const color = STATUS_COLORS[status];
  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.green;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Componente: ExtraDisciplinesList
 *
 * Lista de disciplinas extras de um aluno em formato de tabela.
 *
 * Features:
 * - Tabela com colunas: Disciplina, Horário, Turma, Motivo, Status, Data Matrícula, Ações
 * - Exibição de horários individuais (dia, hora início/fim, link online)
 * - Badge colorido para status
 * - Filtro por status
 * - Botão "Adicionar" (se editable=true)
 * - Botão "Remover" por linha (se editable=true)
 * - Confirmação antes de remover
 */
export function ExtraDisciplinesList({
  studentId: _studentId,
  extraDisciplines,
  editable = false,
  onAdd,
  onDelete,
  isLoading = false,
}: ExtraDisciplinesListProps) {
  const [statusFilter, setStatusFilter] = useState<ExtraDisciplineStatus | 'all'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * Filtra disciplinas extras por status
   */
  const filteredExtraDisciplines = useMemo(() => {
    if (statusFilter === 'all') {
      return extraDisciplines;
    }
    return extraDisciplines.filter((ed) => ed.status === statusFilter);
  }, [extraDisciplines, statusFilter]);

  /**
   * Handler para confirmar remoção
   */
  const handleDelete = (extraDiscipline: IStudentExtraDiscipline) => {
    if (window.confirm(
      `Tem certeza que deseja remover a disciplina extra "${extraDiscipline.discipline?.name}"?\n\n` +
      'Esta ação não pode ser desfeita.'
    )) {
      setDeletingId(extraDiscipline.id);
      onDelete?.(extraDiscipline);
    }
  };

  /**
   * Colunas da tabela
   */
  const columns = [
    {
      key: 'discipline',
      header: 'Disciplina',
      accessor: (row: IStudentExtraDiscipline) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.discipline?.name || 'Disciplina'}
          </p>
          {row.discipline?.code && (
            <p className="text-xs text-gray-500">{row.discipline.code}</p>
          )}
        </div>
      ),
    },
    {
      key: 'day_of_week',
      header: 'Dia da Semana',
      accessor: (row: IStudentExtraDiscipline) => (
        row.dayOfWeek ? (
          <div className="flex items-center text-sm text-gray-900">
            <Calendar size={14} className="mr-1 text-blue-600" />
            <span className="font-medium">{row.dayName}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">-</span>
        )
      ),
    },
    {
      key: 'schedule',
      header: 'Horário',
      accessor: (row: IStudentExtraDiscipline) => (
        row.startTime && row.endTime ? (
          <div className="text-sm">
            <div className="flex items-center text-gray-600">
              <Clock size={14} className="mr-1" />
              <span>{row.formattedTime}</span>
            </div>
            {row.hasOnlineLink && (
              <a
                href={row.onlineLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon size={14} className="mr-1" />
                <span className="text-xs underline">Aula online</span>
              </a>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">-</span>
        )
      ),
    },
    {
      key: 'class',
      header: 'Turma',
      accessor: (row: IStudentExtraDiscipline) => (
        row.class ? (
          <div className="text-sm">
            <p className="font-medium">{row.class.course?.name}</p>
            <p className="text-xs text-gray-500">
              {row.class.semester}º Sem - {row.class.year}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Sem turma</span>
        )
      ),
    },
    {
      key: 'reason',
      header: 'Motivo',
      accessor: (row: IStudentExtraDiscipline) => (
        <span className="text-sm text-gray-700">
          {REASON_LABELS[row.reason]}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: IStudentExtraDiscipline) => (
        <StatusBadge status={row.status} />
      ),
    },
    ...(editable ? [{
      key: 'actions',
      header: 'Ações',
      accessor: (row: IStudentExtraDiscipline) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(row)}
          disabled={deletingId === row.id}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} className="mr-1" />
          Remover
        </Button>
      ),
    }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros e botão adicionar */}
      <div className="flex items-center justify-between">
        {/* Filtro por status */}
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filtrar por status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExtraDisciplineStatus | 'all')}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Botão Adicionar */}
        {editable && onAdd && (
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus size={16} className="mr-1" />
            Adicionar Disciplina Extra
          </Button>
        )}
      </div>

      {/* Tabela */}
      {filteredExtraDisciplines.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            data={filteredExtraDisciplines}
            columns={columns}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'Nenhuma disciplina extra cadastrada'
              : `Nenhuma disciplina extra com status "${STATUS_LABELS[statusFilter as ExtraDisciplineStatus]}"`}
          </p>
          {editable && onAdd && statusFilter === 'all' && (
            <Button variant="primary" size="sm" onClick={onAdd} className="mt-4">
              <Plus size={16} className="mr-1" />
              Adicionar primeira disciplina extra
            </Button>
          )}
        </div>
      )}

      {/* Contador */}
      {filteredExtraDisciplines.length > 0 && (
        <p className="text-sm text-gray-600 text-right">
          {filteredExtraDisciplines.length} disciplina{filteredExtraDisciplines.length !== 1 ? 's' : ''} extra
          {filteredExtraDisciplines.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' && ` (${STATUS_LABELS[statusFilter as ExtraDisciplineStatus]})`}
        </p>
      )}
    </div>
  );
}

export default ExtraDisciplinesList;
