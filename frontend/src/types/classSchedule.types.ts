/**
 * Arquivo: frontend/src/types/classSchedule.types.ts
 * Descrição: Tipos e interfaces para grade de horários das turmas
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 */

import type { IClass } from './class.types';
import type { IDiscipline } from './course.types';
import type { ITeacher } from './teacher.types';

/**
 * Tipo para dia da semana (1-7)
 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Mapeamento de nomes dos dias da semana
 */
export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  7: 'Domingo'
};

/**
 * Mapeamento de nomes curtos dos dias da semana
 */
export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
  7: 'Dom'
};

/**
 * Interface para Horário da Grade
 *
 * Representa um horário de aula na grade de uma turma
 */
export interface IClassSchedule {
  /**
   * ID único do horário
   */
  id: number;

  /**
   * ID da turma
   */
  class_id: number;

  /**
   * ID da disciplina
   */
  discipline_id: number;

  /**
   * ID do professor (opcional)
   */
  teacher_id: number | null;

  /**
   * Dia da semana (1=Segunda, 2=Terça, ..., 7=Domingo)
   */
  day_of_week: DayOfWeek;

  /**
   * Horário de início (formato HH:MM:SS)
   */
  start_time: string;

  /**
   * Horário de término (formato HH:MM:SS)
   */
  end_time: string;

  /**
   * URL da aula online (opcional)
   */
  online_link: string | null;

  /**
   * Data de criação
   */
  created_at: string;

  /**
   * Data de última atualização
   */
  updated_at: string;

  /**
   * Dados da turma (quando incluído)
   */
  class?: IClass;

  /**
   * Dados da disciplina (quando incluído)
   */
  discipline?: IDiscipline;

  /**
   * Dados do professor (quando incluído)
   */
  teacher?: ITeacher & { name?: string };

  /**
   * Horário formatado (ex: "08:00 - 10:00")
   * Campo calculado pelo backend
   */
  formatted_time?: string;

  /**
   * Nome do dia da semana
   * Campo calculado pelo backend
   */
  day_name?: string;

  /**
   * Indica se possui link online
   * Campo calculado pelo backend
   */
  has_online_link?: boolean;

  /**
   * Indica se é horário de disciplina extra
   * Campo calculado pelo backend (apenas em full-schedule)
   */
  is_extra?: boolean;

  /**
   * Motivo da disciplina extra (se is_extra=true)
   */
  extra_reason?: string;
}

/**
 * Dados para criar/editar horário
 */
export interface IClassScheduleFormData {
  /**
   * ID da disciplina
   */
  discipline_id: number;

  /**
   * ID do professor (opcional)
   */
  teacher_id?: number | null;

  /**
   * Dia da semana (1-7)
   */
  day_of_week: DayOfWeek;

  /**
   * Horário de início (formato HH:MM ou HH:MM:SS)
   */
  start_time: string;

  /**
   * Horário de término (formato HH:MM ou HH:MM:SS)
   */
  end_time: string;

  /**
   * URL da aula online (opcional)
   */
  online_link?: string;
}

/**
 * Dados para criar horário (com class_id)
 */
export interface IClassScheduleCreateRequest extends IClassScheduleFormData {
  /**
   * ID da turma
   */
  class_id: number;
}

/**
 * Dados para atualizar horário
 */
export interface IClassScheduleUpdateRequest {
  /**
   * ID da disciplina (opcional)
   */
  discipline_id?: number;

  /**
   * ID do professor (opcional)
   */
  teacher_id?: number | null;

  /**
   * Dia da semana (opcional)
   */
  day_of_week?: DayOfWeek;

  /**
   * Horário de início (opcional)
   */
  start_time?: string;

  /**
   * Horário de término (opcional)
   */
  end_time?: string;

  /**
   * URL da aula online (opcional)
   */
  online_link?: string | null;
}

/**
 * Dados para criação em lote
 */
export interface IClassScheduleBulkCreateRequest {
  /**
   * Array de horários a criar
   */
  schedules: IClassScheduleFormData[];
}

/**
 * Grade da semana organizada por dia
 */
export type WeekSchedule = Record<DayOfWeek, IClassSchedule[]>;

/**
 * Resposta ao listar horários
 */
export interface IClassScheduleListResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Array de horários
   */
  data: IClassSchedule[];
}

/**
 * Resposta ao consultar horário específico
 */
export interface IClassScheduleResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Dados do horário
   */
  data: IClassSchedule;
}

/**
 * Resposta ao obter grade da semana
 */
export interface IWeekScheduleResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Grade organizada por dia da semana
   */
  data: WeekSchedule;
}

/**
 * Resposta ao criar em lote
 */
export interface IClassScheduleBulkCreateResponse {
  /**
   * Indica se todos foram criados com sucesso
   */
  success: boolean;

  /**
   * Dados do resultado
   */
  data: {
    /**
     * Horários criados com sucesso
     */
    created: IClassSchedule[];

    /**
     * Erros encontrados
     */
    errors: Array<{
      index: number;
      error: string;
    }>;
  };
}

/**
 * Filtros para busca de horários
 */
export interface IClassScheduleFilters {
  /**
   * Filtrar por dia da semana
   */
  dayOfWeek?: DayOfWeek;

  /**
   * Filtrar por disciplina
   */
  disciplineId?: number;
}

/**
 * Resposta de delete
 */
export interface IClassScheduleDeleteResponse {
  /**
   * Indica sucesso da operação
   */
  success: boolean;

  /**
   * Mensagem de sucesso
   */
  message: string;
}
