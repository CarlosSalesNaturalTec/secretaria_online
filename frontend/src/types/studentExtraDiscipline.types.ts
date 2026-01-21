/**
 * Arquivo: frontend/src/types/studentExtraDiscipline.types.ts
 * Descrição: Tipos e interfaces para disciplinas extras de alunos
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 */

import type { IClass } from './class.types';
import type { IDiscipline } from './course.types';
import type { IStudent } from './student.types';
import type { IClassSchedule, WeekSchedule, DayOfWeek } from './classSchedule.types';

/**
 * Motivo da disciplina extra
 */
export type ExtraDisciplineReason = 'dependency' | 'recovery' | 'advancement' | 'other';

/**
 * Status da disciplina extra
 */
export type ExtraDisciplineStatus = 'active' | 'completed' | 'cancelled';

/**
 * Labels para os motivos de disciplina extra
 */
export const REASON_LABELS: Record<ExtraDisciplineReason, string> = {
  dependency: 'Dependência',
  recovery: 'Recuperação',
  advancement: 'Adiantamento',
  other: 'Outro'
};

/**
 * Labels para os status de disciplina extra
 */
export const STATUS_LABELS: Record<ExtraDisciplineStatus, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada'
};

/**
 * Cores para os status (para badges)
 */
export const STATUS_COLORS: Record<ExtraDisciplineStatus, string> = {
  active: 'green',
  completed: 'blue',
  cancelled: 'red'
};

/**
 * Interface para Disciplina Extra
 *
 * Representa uma disciplina extra vinculada a um aluno
 */
export interface IStudentExtraDiscipline {
  /**
   * ID único da disciplina extra
   */
  id: number;

  /**
   * ID do aluno
   */
  student_id: number;

  /**
   * ID da disciplina
   */
  discipline_id: number;

  /**
   * ID da turma de origem (opcional)
   */
  class_id: number | null;

  /**
   * Data de matrícula (formato YYYY-MM-DD)
   */
  enrollment_date: string;

  /**
   * Motivo da disciplina extra
   */
  reason: ExtraDisciplineReason;

  /**
   * Observações (opcional)
   */
  notes: string | null;

  /**
   * Status da disciplina extra
   */
  status: ExtraDisciplineStatus;

  /**
   * Dia da semana (1-7: 1=Segunda, 7=Domingo) - snake_case do banco
   */
  day_of_week?: number | null;

  /**
   * Dia da semana (1-7: 1=Segunda, 7=Domingo) - camelCase da API
   */
  dayOfWeek?: number | null;

  /**
   * Horário de início (formato HH:MM:SS) - snake_case do banco
   */
  start_time?: string | null;

  /**
   * Horário de início (formato HH:MM:SS) - camelCase da API
   */
  startTime?: string | null;

  /**
   * Horário de término (formato HH:MM:SS) - snake_case do banco
   */
  end_time?: string | null;

  /**
   * Horário de término (formato HH:MM:SS) - camelCase da API
   */
  endTime?: string | null;

  /**
   * Link da aula online (opcional) - snake_case do banco
   */
  online_link?: string | null;

  /**
   * Link da aula online (opcional) - camelCase da API
   */
  onlineLink?: string | null;

  /**
   * Data de criação
   */
  created_at: string;

  /**
   * Data de última atualização
   */
  updated_at: string;

  /**
   * Dados do aluno (quando incluído)
   */
  student?: IStudent & { name?: string };

  /**
   * Dados da disciplina (quando incluído)
   */
  discipline?: IDiscipline;

  /**
   * Dados da turma de origem (quando incluído)
   */
  class?: IClass;

  /**
   * Label do motivo (campo calculado pelo backend)
   */
  reason_label?: string;

  /**
   * Label do status (campo calculado pelo backend)
   */
  status_label?: string;

  /**
   * Indica se está ativa (campo calculado pelo backend)
   */
  is_active?: boolean;

  /**
   * Horário formatado (campo calculado pelo backend) - snake_case
   */
  formatted_time?: string;

  /**
   * Horário formatado (campo calculado pelo backend) - camelCase
   */
  formattedTime?: string;

  /**
   * Nome do dia da semana (campo calculado pelo backend) - snake_case
   */
  day_name?: string;

  /**
   * Nome do dia da semana (campo calculado pelo backend) - camelCase
   */
  dayName?: string;

  /**
   * Indica se possui horário definido (campo calculado pelo backend) - snake_case
   */
  has_schedule?: boolean;

  /**
   * Indica se possui horário definido (campo calculado pelo backend) - camelCase
   */
  hasSchedule?: boolean;

  /**
   * Indica se possui link online (campo calculado pelo backend) - snake_case
   */
  has_online_link?: boolean;

  /**
   * Indica se possui link online (campo calculado pelo backend) - camelCase
   */
  hasOnlineLink?: boolean;
}

/**
 * Dados para criar disciplina extra
 */
export interface IStudentExtraDisciplineFormData {
  /**
   * ID da disciplina
   */
  discipline_id: number;

  /**
   * ID da turma de origem (opcional)
   */
  class_id?: number | null;

  /**
   * Data de matrícula (formato YYYY-MM-DD)
   */
  enrollment_date: string;

  /**
   * Motivo da disciplina extra
   */
  reason: ExtraDisciplineReason;

  /**
   * Observações (opcional)
   */
  notes?: string;

  /**
   * Dia da semana (1-7: 1=Segunda, 7=Domingo)
   */
  day_of_week?: number | null;

  /**
   * Horário de início (formato HH:MM)
   */
  start_time?: string | null;

  /**
   * Horário de término (formato HH:MM)
   */
  end_time?: string | null;

  /**
   * Link da aula online (opcional)
   */
  online_link?: string | null;
}

/**
 * Dados para criar disciplina extra (com student_id)
 */
export interface IStudentExtraDisciplineCreateRequest extends IStudentExtraDisciplineFormData {
  /**
   * ID do aluno
   */
  student_id: number;
}

/**
 * Dados para atualizar disciplina extra
 */
export interface IStudentExtraDisciplineUpdateRequest {
  /**
   * ID da turma de origem (opcional)
   */
  class_id?: number | null;

  /**
   * Status (opcional)
   */
  status?: ExtraDisciplineStatus;

  /**
   * Observações (opcional)
   */
  notes?: string | null;

  /**
   * Motivo (opcional)
   */
  reason?: ExtraDisciplineReason;
}

/**
 * Grade completa do aluno (turma principal + disciplinas extras)
 */
export interface IStudentFullSchedule {
  /**
   * Horários da turma principal
   */
  mainClassSchedules: IClassSchedule[];

  /**
   * Horários das disciplinas extras
   */
  extraDisciplineSchedules: IClassSchedule[];

  /**
   * Disciplinas extras ativas
   */
  extraDisciplines: IStudentExtraDiscipline[];

  /**
   * Grade consolidada organizada por dia da semana
   */
  weekSchedule: WeekSchedule;
}

/**
 * Resposta ao listar disciplinas extras
 */
export interface IStudentExtraDisciplineListResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Array de disciplinas extras
   */
  data: IStudentExtraDiscipline[];
}

/**
 * Resposta ao consultar disciplina extra específica
 */
export interface IStudentExtraDisciplineResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Dados da disciplina extra
   */
  data: IStudentExtraDiscipline;
}

/**
 * Resposta ao obter grade completa do aluno
 */
export interface IStudentFullScheduleResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Dados da grade completa
   */
  data: IStudentFullSchedule;
}

/**
 * Filtros para busca de disciplinas extras
 */
export interface IStudentExtraDisciplineFilters {
  /**
   * Filtrar por status
   */
  status?: ExtraDisciplineStatus;

  /**
   * Filtrar por motivo
   */
  reason?: ExtraDisciplineReason;

  /**
   * Incluir horários
   */
  includeSchedules?: boolean;
}

/**
 * Resposta de delete
 */
export interface IStudentExtraDisciplineDeleteResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Mensagem de sucesso
   */
  message: string;
}

/**
 * Opções para seleção de motivo
 */
export const REASON_OPTIONS: Array<{ value: ExtraDisciplineReason; label: string }> = [
  { value: 'dependency', label: 'Dependência' },
  { value: 'recovery', label: 'Recuperação' },
  { value: 'advancement', label: 'Adiantamento' },
  { value: 'other', label: 'Outro' }
];

/**
 * Opções para seleção de status
 */
export const STATUS_OPTIONS: Array<{ value: ExtraDisciplineStatus; label: string }> = [
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' }
];

/**
 * Opções para seleção de dia da semana
 */
export const DAY_OF_WEEK_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
];
