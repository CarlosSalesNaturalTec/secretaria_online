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
import { parseDateToInput } from '@/utils/formatters';
import {
  REASON_LABELS,
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
  discipline_id: z.coerce.number({
    required_error: 'Disciplina é obrigatória',
    invalid_type_error: 'Disciplina é obrigatória',
  }).int().positive('Disciplina é obrigatória'),

  class_id: z.coerce.number().int().positive().optional().nullable(),

  enrollment_date: z.string()
    .min(1, 'Data de matrícula é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'),

  reason: z.enum(['dependency', 'recovery', 'advancement', 'other'], {
    required_error: 'Motivo é obrigatório',
    invalid_type_error: 'Motivo inválido',
  }) as z.ZodType<ExtraDisciplineReason>,

  notes: z.string()
    .max(2000, 'Observações devem ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
});

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
  studentId,
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
      });
    }
  }, [editingExtraDiscipline, reset]);

  /**
   * Handler ao submeter formulário
   */
  const handleFormSubmit = async (data: StudentExtraDisciplineFormData) => {
    try {
      const formData: IStudentExtraDisciplineFormData = {
        ...data,
        class_id: data.class_id || undefined,
        notes: data.notes || undefined,
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
          {...register('discipline_id')}
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
          {...register('class_id')}
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

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
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
