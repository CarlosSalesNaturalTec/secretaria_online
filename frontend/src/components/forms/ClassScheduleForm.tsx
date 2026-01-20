/**
 * Arquivo: frontend/src/components/forms/ClassScheduleForm.tsx
 * Descrição: Formulário para criar/editar horário da grade
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-19
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { DAY_NAMES, type DayOfWeek, type IClassSchedule, type IClassScheduleFormData } from '@/types/classSchedule.types';
import type { IDiscipline } from '@/types/course.types';
import type { ITeacher } from '@/types/teacher.types';

/**
 * Schema de validação para formulário de horário
 */
const classScheduleFormSchema = z.object({
  discipline_id: z.number()
    .int()
    .positive('Disciplina é obrigatória'),

  teacher_id: z.number()
    .int()
    .positive()
    .nullable()
    .optional(),

  day_of_week: z.number()
    .int()
    .min(1, 'Dia da semana deve estar entre 1 e 7')
    .max(7, 'Dia da semana deve estar entre 1 e 7'),

  start_time: z.string()
    .min(1, 'Horário de início é obrigatório')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Formato inválido (HH:MM)'),

  end_time: z.string()
    .min(1, 'Horário de término é obrigatório')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Formato inválido (HH:MM)'),

  online_link: z.string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Validar que start_time < end_time
    const start = data.start_time.split(':').map(Number);
    const end = data.end_time.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return startMinutes < endMinutes;
  },
  {
    message: 'Horário de início deve ser menor que horário de término',
    path: ['end_time'],
  }
);

type ClassScheduleFormData = z.infer<typeof classScheduleFormSchema>;

/**
 * Props do ClassScheduleForm
 */
interface ClassScheduleFormProps {
  /**
   * ID da turma
   */
  classId: number;

  /**
   * Lista de disciplinas disponíveis
   */
  disciplines: IDiscipline[];

  /**
   * Lista de professores disponíveis
   */
  teachers: ITeacher[];

  /**
   * Callback ao sucesso da operação
   */
  onSuccess: () => void;

  /**
   * Callback ao cancelar
   */
  onCancel?: () => void;

  /**
   * Horário sendo editado (opcional)
   */
  editingSchedule?: IClassSchedule | null;

  /**
   * Callback ao submeter
   */
  onSubmit: (data: IClassScheduleFormData) => Promise<void>;

  /**
   * Indica se está enviando
   */
  isSubmitting?: boolean;
}

/**
 * Componente: ClassScheduleForm
 *
 * Formulário para criar ou editar horário da grade de uma turma.
 *
 * Features:
 * - Validação com Zod + React Hook Form
 * - Select de disciplina (obrigatório)
 * - Select de professor (opcional)
 * - Select de dia da semana
 * - Input de horário início/fim
 * - Input de link online (opcional)
 * - Validação de start_time < end_time
 */
export function ClassScheduleForm({
  classId: _classId,
  disciplines,
  teachers,
  onSuccess,
  onCancel,
  editingSchedule,
  onSubmit,
  isSubmitting = false,
}: ClassScheduleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClassScheduleFormData>({
    resolver: zodResolver(classScheduleFormSchema),
    defaultValues: {
      discipline_id: editingSchedule?.discipline_id || 0,
      teacher_id: editingSchedule?.teacher_id || null,
      day_of_week: editingSchedule?.day_of_week || 1,
      start_time: editingSchedule?.start_time?.substring(0, 5) || '',
      end_time: editingSchedule?.end_time?.substring(0, 5) || '',
      online_link: editingSchedule?.online_link || '',
    },
  });

  // Atualizar form quando editingSchedule mudar
  useEffect(() => {
    if (editingSchedule) {
      reset({
        discipline_id: editingSchedule.discipline_id,
        teacher_id: editingSchedule.teacher_id,
        day_of_week: editingSchedule.day_of_week,
        start_time: editingSchedule.start_time.substring(0, 5),
        end_time: editingSchedule.end_time.substring(0, 5),
        online_link: editingSchedule.online_link || '',
      });
    }
  }, [editingSchedule, reset]);

  /**
   * Handler ao submeter formulário
   */
  const handleFormSubmit = async (data: ClassScheduleFormData) => {
    try {
      // Garantir formato HH:MM:SS
      const formData: IClassScheduleFormData = {
        discipline_id: data.discipline_id,
        teacher_id: data.teacher_id,
        day_of_week: data.day_of_week as DayOfWeek,
        start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
        end_time: data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time,
        online_link: data.online_link || undefined,
      };

      await onSubmit(formData);
      onSuccess();
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Disciplina */}
      <div>
        <label htmlFor="discipline_id" className="block text-sm font-medium text-gray-700 mb-1">
          Disciplina <span className="text-red-500">*</span>
        </label>
        <select
          id="discipline_id"
          {...register('discipline_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecione uma disciplina</option>
          {disciplines.map((discipline) => (
            <option key={discipline.id} value={discipline.id}>
              {discipline.name} {discipline.code ? `(${discipline.code})` : ''}
            </option>
          ))}
        </select>
        {errors.discipline_id && (
          <p className="mt-1 text-sm text-red-600">{errors.discipline_id.message}</p>
        )}
      </div>

      {/* Professor */}
      <div>
        <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
          Professor (opcional)
        </label>
        <select
          id="teacher_id"
          {...register('teacher_id', { setValueAs: (v) => v === '' ? null : Number(v) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Nenhum</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.nome}
            </option>
          ))}
        </select>
        {errors.teacher_id && (
          <p className="mt-1 text-sm text-red-600">{errors.teacher_id.message}</p>
        )}
      </div>

      {/* Dia da Semana */}
      <div>
        <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
          Dia da Semana <span className="text-red-500">*</span>
        </label>
        <select
          id="day_of_week"
          {...register('day_of_week', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(DAY_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.day_of_week && (
          <p className="mt-1 text-sm text-red-600">{errors.day_of_week.message}</p>
        )}
      </div>

      {/* Horários */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
            Horário de Início <span className="text-red-500">*</span>
          </label>
          <input
            id="start_time"
            type="time"
            {...register('start_time')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.start_time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
            Horário de Término <span className="text-red-500">*</span>
          </label>
          <input
            id="end_time"
            type="time"
            {...register('end_time')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.end_time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      {/* Link Online */}
      <div>
        <label htmlFor="online_link" className="block text-sm font-medium text-gray-700 mb-1">
          Link da Aula Online (opcional)
        </label>
        <input
          id="online_link"
          type="url"
          placeholder="https://meet.google.com/..."
          {...register('online_link')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.online_link ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.online_link && (
          <p className="mt-1 text-sm text-red-600">{errors.online_link.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          URL completa para aula online (Google Meet, Zoom, Teams, etc.)
        </p>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {editingSchedule ? 'Atualizar Horário' : 'Adicionar Horário'}
        </Button>
      </div>
    </form>
  );
}

export default ClassScheduleForm;
