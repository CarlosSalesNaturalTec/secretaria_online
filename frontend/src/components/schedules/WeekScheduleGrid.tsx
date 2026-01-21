/**
 * Arquivo: frontend/src/components/schedules/WeekScheduleGrid.tsx
 * Descrição: Grade visual da semana tipo calendário
 * Feature: feat-001 - Grade de Horários por Turma
 * Feature: feat-003 - Visualização da Grade pelo Aluno
 * Criado em: 2026-01-19
 */

import { useMemo } from 'react';
import { ExternalLink, Edit2, Trash2 } from 'lucide-react';
import {
  DAY_NAMES,
  DAY_NAMES_SHORT,
  type IClassSchedule,
  type DayOfWeek,
} from '@/types/classSchedule.types';
import { Button } from '@/components/ui/Button';

/**
 * Labels para os motivos de disciplina extra em português
 */
const EXTRA_REASON_LABELS: Record<string, string> = {
  dependency: 'Dependência',
  recovery: 'Recuperação',
  advancement: 'Adiantamento',
  other: 'Outro',
};

/**
 * Props do WeekScheduleGrid
 */
interface WeekScheduleGridProps {
  /**
   * Lista de horários
   */
  schedules: IClassSchedule[];

  /**
   * Se true, mostra botões de editar/deletar
   */
  editable?: boolean;

  /**
   * Se true, mostra ícone de link online
   */
  showOnlineLinks?: boolean;

  /**
   * Se true, destaca disciplinas extras
   */
  highlightExtra?: boolean;

  /**
   * Callback ao clicar para editar
   */
  onEdit?: (schedule: IClassSchedule) => void;

  /**
   * Callback ao clicar para deletar
   */
  onDelete?: (schedule: IClassSchedule) => void;

  /**
   * Tamanho da grade (responsive)
   */
  variant?: 'desktop' | 'mobile';
}

/**
 * Gera cor consistente baseada no ID da disciplina
 */
function getDisciplineColor(disciplineId: number): string {
  const colors = [
    'bg-blue-100 border-blue-300 text-blue-900',
    'bg-green-100 border-green-300 text-green-900',
    'bg-purple-100 border-purple-300 text-purple-900',
    'bg-yellow-100 border-yellow-300 text-yellow-900',
    'bg-pink-100 border-pink-300 text-pink-900',
    'bg-indigo-100 border-indigo-300 text-indigo-900',
    'bg-red-100 border-red-300 text-red-900',
    'bg-orange-100 border-orange-300 text-orange-900',
    'bg-teal-100 border-teal-300 text-teal-900',
    'bg-cyan-100 border-cyan-300 text-cyan-900',
  ];

  return colors[disciplineId % colors.length];
}

/**
 * Formata horário HH:MM:SS para HH:MM
 */
function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Componente: WeekScheduleGrid
 *
 * Grade visual da semana tipo calendário com horários de aula.
 *
 * Features:
 * - Grid de 7 colunas (dias da semana)
 * - Cores diferentes por disciplina (hash do ID)
 * - Ícone de link online quando disponível
 * - Destaque visual para disciplinas extras
 * - Tooltip com informações ao hover
 * - Botões de editar/deletar (se editable=true)
 * - Responsivo: grid em desktop, lista em mobile
 */
export function WeekScheduleGrid({
  schedules,
  editable = false,
  showOnlineLinks = true,
  highlightExtra = false,
  onEdit,
  onDelete,
  variant = 'desktop',
}: WeekScheduleGridProps) {
  /**
   * Organiza horários por dia da semana
   */
  const weekSchedule = useMemo(() => {
    const organized: Record<DayOfWeek, IClassSchedule[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };

    // Debug: log para verificar dados recebidos
    if (import.meta.env.DEV) {
      console.log('[WeekScheduleGrid] Schedules recebidos:', schedules);
    }

    schedules.forEach((schedule) => {
      // Suporta tanto snake_case (day_of_week) quanto camelCase (dayOfWeek)
      const dayValue = schedule.day_of_week ?? (schedule as any).dayOfWeek;
      const day = Number(dayValue) as DayOfWeek;
      if (day >= 1 && day <= 7) {
        organized[day].push(schedule);
      } else if (import.meta.env.DEV) {
        console.warn('[WeekScheduleGrid] Schedule com day_of_week inválido:', schedule);
      }
    });

    // Ordenar por horário de início (suporta snake_case e camelCase)
    Object.keys(organized).forEach((day) => {
      organized[day as unknown as DayOfWeek].sort((a, b) => {
        const aTime = a.start_time ?? (a as any).startTime ?? '';
        const bTime = b.start_time ?? (b as any).startTime ?? '';
        return aTime.localeCompare(bTime);
      });
    });

    return organized;
  }, [schedules]);

  /**
   * Helper para acessar propriedades com suporte a snake_case e camelCase
   */
  const getScheduleValue = (schedule: IClassSchedule, snakeKey: keyof IClassSchedule, camelKey: string) => {
    return schedule[snakeKey] ?? (schedule as any)[camelKey];
  };

  /**
   * Renderiza um card de horário
   */
  const renderScheduleCard = (schedule: IClassSchedule) => {
    // Suporta tanto snake_case quanto camelCase
    const disciplineId = getScheduleValue(schedule, 'discipline_id', 'disciplineId');
    const startTime = getScheduleValue(schedule, 'start_time', 'startTime') || '';
    const endTime = getScheduleValue(schedule, 'end_time', 'endTime') || '';
    const onlineLink = getScheduleValue(schedule, 'online_link', 'onlineLink');
    const isExtraValue = getScheduleValue(schedule, 'is_extra', 'isExtra');
    const extraReason = getScheduleValue(schedule, 'extra_reason', 'extraReason');

    const colorClass = getDisciplineColor(disciplineId);
    const isExtra = highlightExtra && isExtraValue;

    return (
      <div
        key={schedule.id}
        className={`
          p-3 rounded-lg border-2 ${colorClass}
          ${isExtra ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
          transition-all hover:shadow-md
        `}
        title={`
          ${schedule.discipline?.name || 'Disciplina'}
          ${schedule.teacher?.nome ? `\nProfessor: ${schedule.teacher.nome}` : ''}
          ${isExtraValue ? `\n⚠️ Disciplina Extra (${EXTRA_REASON_LABELS[extraReason] || extraReason})` : ''}
        `}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {schedule.discipline?.name || 'Disciplina'}
            </p>
            <p className="text-xs opacity-75">
              {formatTime(startTime)} - {formatTime(endTime)}
            </p>
          </div>

          {/* Ícone de link online */}
          {showOnlineLinks && onlineLink && (
            <a
              href={onlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Abrir aula online"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Professor */}
        {schedule.teacher && (
          <p className="text-xs opacity-75 mb-2">
            {schedule.teacher.nome || schedule.teacher.name}
          </p>
        )}

        {/* Badge de disciplina extra */}
        {isExtra && (
          <div className="flex items-center text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded mb-2">
            <span className="font-medium">Extra: {EXTRA_REASON_LABELS[extraReason] || extraReason}</span>
          </div>
        )}

        {/* Botões de ação (se editable) */}
        {editable && (
          <div className="flex space-x-2 mt-2 pt-2 border-t border-current/20">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(schedule);
              }}
              className="flex-1 text-xs"
            >
              <Edit2 size={14} className="mr-1" />
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(schedule);
              }}
              className="flex-1 text-xs"
            >
              <Trash2 size={14} className="mr-1" />
              Remover
            </Button>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza versão mobile (lista)
   */
  if (variant === 'mobile') {
    return (
      <div className="space-y-6">
        {Object.entries(DAY_NAMES).map(([dayNum, dayName]) => {
          const daySchedules = weekSchedule[dayNum as unknown as DayOfWeek];
          if (daySchedules.length === 0) return null;

          return (
            <div key={dayNum} className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">
                {dayName}
              </h3>
              <div className="space-y-2">
                {daySchedules.map((schedule) => renderScheduleCard(schedule))}
              </div>
            </div>
          );
        })}
        {schedules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum horário cadastrado</p>
          </div>
        )}
      </div>
    );
  }

  /**
   * Renderiza versão desktop (grid)
   */
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 gap-3 mb-3">
          {Object.entries(DAY_NAMES_SHORT).map(([dayNum, dayName]) => (
            <div
              key={dayNum}
              className="text-center font-semibold text-sm text-gray-700 bg-gray-100 py-2 rounded-t-lg"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grid de horários */}
        <div className="grid grid-cols-7 gap-3">
          {Object.entries(DAY_NAMES).map(([dayNum]) => {
            const daySchedules = weekSchedule[dayNum as unknown as DayOfWeek];

            return (
              <div
                key={dayNum}
                className="min-h-[200px] bg-gray-50 rounded-lg p-2 space-y-2"
              >
                {daySchedules.length > 0 ? (
                  daySchedules.map((schedule) => renderScheduleCard(schedule))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Sem aulas
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {schedules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum horário cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeekScheduleGrid;
