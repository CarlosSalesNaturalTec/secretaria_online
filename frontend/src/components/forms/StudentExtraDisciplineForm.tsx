/**
 * Arquivo: frontend/src/components/forms/StudentExtraDisciplineForm.tsx
 * Descrição: Formulário para vincular disciplina extra a aluno
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-19
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  REASON_LABELS,
  DAY_OF_WEEK_OPTIONS,
  type ExtraDisciplineReason,
  type IStudentExtraDiscipline,
  type IStudentExtraDisciplineFormData,
} from '@/types/studentExtraDiscipline.types';
import type { IDiscipline } from '@/types/course.types';
import type { IClass } from '@/types/class.types';

/**
 * Schema de validação para formulário de disciplina extra
 */
const studentExtraDisciplineFormSchema = z.object({
  discipline_id: z.number()
    .int()
    .positive('Disciplina é obrigatória'),

  class_id: z.number()
    .int()
    .nullable()
    .optional(),

  enrollment_date: z.string()
    .min(1, 'Data de matrícula é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'),

  reason: z.enum(['dependency', 'recovery', 'advancement', 'other']),

  notes: z.string()
    .max(2000, 'Observações devem ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),

  day_of_week: z.number()
    .int()
    .min(1, 'Dia inválido')
    .max(7, 'Dia inválido')
    .nullable()
    .optional(),

  start_time: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)')
    .nullable()
    .optional()
    .or(z.literal('')),

  end_time: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)')
    .nullable()
    .optional()
    .or(z.literal('')),

  online_link: z.string()
    .url('URL inválida')
    .nullable()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Se tiver algum campo de horário preenchido, todos devem estar
    const hasDay = !!data.day_of_week;
    const hasStart = !!data.start_time && data.start_time !== '';
    const hasEnd = !!data.end_time && data.end_time !== '';

    // Se algum está preenchido, todos devem estar
    if (hasDay || hasStart || hasEnd) {
      return hasDay && hasStart && hasEnd;
    }

    // Se nenhum está preenchido, tudo bem
    return true;
  },
  {
    message: 'Para definir horário, preencha dia da semana, horário de início e horário de término',
    path: ['day_of_week']
  }
).refine(
  (data) => {
    // Se tiver horário de início e fim, validar que fim > início
    if (data.start_time && data.end_time && data.start_time !== '' && data.end_time !== '') {
      return data.end_time > data.start_time;
    }
    return true;
  },
  {
    message: 'Horário de término deve ser maior que horário de início',
    path: ['end_time']
  }
);

type StudentExtraDisciplineFormData = z.infer<typeof studentExtraDisciplineFormSchema>;

/**
 * Props do StudentExtraDisciplineForm
 */
interface StudentExtraDisciplineFormProps {
  /**
   * ID do aluno
   */
  studentId: number;

  /**
   * Lista de disciplinas disponíveis
   */
  disciplines: IDiscipline[];

  /**
   * Lista de turmas disponíveis
   */
  classes: IClass[];

  /**
   * Callback ao sucesso da operação
   */
  onSuccess: () => void;

  /**
   * Callback ao cancelar
   */
  onCancel?: () => void;

  /**
   * Disciplina extra sendo editada (opcional)
   */
  editingExtraDiscipline?: IStudentExtraDiscipline | null;

  /**
   * Callback ao submeter
   */
  onSubmit: (data: IStudentExtraDisciplineFormData) => Promise<void>;

  /**
   * Indica se está enviando
   */
  isSubmitting?: boolean;
}

/**
 * Componente: StudentExtraDisciplineForm
 *
 * Formulário para vincular disciplina extra a um aluno.
 *
 * Features:
 * - Validação com Zod + React Hook Form
 * - Select de disciplina (obrigatório)
 * - Select de turma (opcional)
 * - Date picker para data de matrícula
 * - Select de motivo (dependência, recuperação, adiantamento, outro)
 * - Textarea para observações
 */
export function StudentExtraDisciplineForm({
  studentId: _studentId,
  disciplines,
  classes,
  onSuccess,
  onCancel,
  editingExtraDiscipline,
  onSubmit,
  isSubmitting = false,
}: StudentExtraDisciplineFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentExtraDisciplineFormData>({
    resolver: zodResolver(studentExtraDisciplineFormSchema),
    defaultValues: {
      discipline_id: editingExtraDiscipline?.discipline_id || 0,
      class_id: editingExtraDiscipline?.class_id || null,
      enrollment_date: editingExtraDiscipline?.enrollment_date || new Date().toISOString().split('T')[0],
      reason: editingExtraDiscipline?.reason || 'dependency',
      notes: editingExtraDiscipline?.notes || '',
      day_of_week: editingExtraDiscipline?.day_of_week || null,
      start_time: editingExtraDiscipline?.start_time?.substring(0, 5) || '',
      end_time: editingExtraDiscipline?.end_time?.substring(0, 5) || '',
      online_link: editingExtraDiscipline?.online_link || '',
    },
  });

  // Atualizar form quando editingExtraDiscipline mudar
  useEffect(() => {
    if (editingExtraDiscipline) {
      reset({
        discipline_id: editingExtraDiscipline.discipline_id,
        class_id: editingExtraDiscipline.class_id,
        enrollment_date: editingExtraDiscipline.enrollment_date,
        reason: editingExtraDiscipline.reason,
        notes: editingExtraDiscipline.notes || '',
        day_of_week: editingExtraDiscipline.day_of_week || null,
        start_time: editingExtraDiscipline.start_time?.substring(0, 5) || '',
        end_time: editingExtraDiscipline.end_time?.substring(0, 5) || '',
        online_link: editingExtraDiscipline.online_link || '',
      });
    }
  }, [editingExtraDiscipline, reset]);

  /**
   * Handler ao submeter formulário
   */
  const handleFormSubmit = async (data: StudentExtraDisciplineFormData) => {
    try {
      const formData: IStudentExtraDisciplineFormData = {
        discipline_id: data.discipline_id,
        class_id: data.class_id || undefined,
        enrollment_date: data.enrollment_date,
        reason: data.reason as ExtraDisciplineReason,
        notes: data.notes || undefined,
        day_of_week: data.day_of_week || undefined,
        start_time: data.start_time && data.start_time !== '' ? data.start_time : undefined,
        end_time: data.end_time && data.end_time !== '' ? data.end_time : undefined,
        online_link: data.online_link && data.online_link !== '' ? data.online_link : undefined,
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
          disabled={!!editingExtraDiscipline}
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
        {editingExtraDiscipline && (
          <p className="mt-1 text-xs text-gray-500">
            A disciplina não pode ser alterada após criação
          </p>
        )}
      </div>

      {/* Turma */}
      <div>
        <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
          Turma de Origem (opcional)
        </label>
        <select
          id="class_id"
          {...register('class_id', { setValueAs: (v) => v === '' ? null : Number(v) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Nenhuma</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.course?.name} - {classItem.semester}º Semestre ({classItem.year})
            </option>
          ))}
        </select>
        {errors.class_id && (
          <p className="mt-1 text-sm text-red-600">{errors.class_id.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Turma onde a disciplina extra está sendo oferecida
        </p>
      </div>

      {/* Data de Matrícula */}
      <div>
        <label htmlFor="enrollment_date" className="block text-sm font-medium text-gray-700 mb-1">
          Data de Matrícula <span className="text-red-500">*</span>
        </label>
        <Input
          id="enrollment_date"
          type="date"
          {...register('enrollment_date')}
          error={errors.enrollment_date?.message}
        />
      </div>

      {/* Motivo */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo <span className="text-red-500">*</span>
        </label>
        <select
          id="reason"
          {...register('reason')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={4}
          placeholder="Observações adicionais sobre a disciplina extra..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Seção de Horário */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Horário da Aula (opcional)
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Preencha todos os campos abaixo para definir o horário da disciplina extra
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dia da Semana */}
          <div>
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
              Dia da Semana
            </label>
            <select
              id="day_of_week"
              {...register('day_of_week', { setValueAs: (v) => v === '' ? null : Number(v) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione</option>
              {DAY_OF_WEEK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.day_of_week && (
              <p className="mt-1 text-sm text-red-600">{errors.day_of_week.message}</p>
            )}
          </div>

          {/* Horário de Início */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
              Horário de Início
            </label>
            <Input
              id="start_time"
              type="time"
              {...register('start_time')}
              error={errors.start_time?.message}
              placeholder="08:00"
            />
          </div>

          {/* Horário de Término */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
              Horário de Término
            </label>
            <Input
              id="end_time"
              type="time"
              {...register('end_time')}
              error={errors.end_time?.message}
              placeholder="10:00"
            />
          </div>
        </div>

        {/* Link Online */}
        <div className="mt-4">
          <label htmlFor="online_link" className="block text-sm font-medium text-gray-700 mb-1">
            Link da Aula Online (opcional)
          </label>
          <Input
            id="online_link"
            type="url"
            {...register('online_link')}
            error={errors.online_link?.message}
            placeholder="https://meet.google.com/..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Link para aulas remotas (Google Meet, Zoom, Teams, etc.)
          </p>
        </div>
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
          {editingExtraDiscipline ? 'Atualizar' : 'Adicionar Disciplina Extra'}
        </Button>
      </div>
    </form>
  );
}

export default StudentExtraDisciplineForm;
