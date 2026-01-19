/**
 * Arquivo: frontend/src/types/studentExtraDiscipline.types.ts
 * Descrição: Tipos e interfaces para disciplinas extras de alunos
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 */

import type { IClass } from './class.types';
import type { IDiscipline } from './course.types';
import type { IStudent } from './student.types';
import type { IClassSchedule, WeekSchedule } from './classSchedule.types';

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
   * Horários da disciplina extra (quando incluído)
   */
  schedules?: IClassSchedule[];
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
