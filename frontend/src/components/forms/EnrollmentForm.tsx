/**
 * Arquivo: frontend/src/components/forms/EnrollmentForm.tsx
 * Descrição: Formulário para criar/editar matrículas
 * Feature: feat-106 - Gerenciar matrículas de alunos em cursos (Frontend)
 * Criado em: 2025-11-09
 *
 * Responsabilidades:
 * - Validação de dados de matrícula com Zod
 * - Renderização de formulário com React Hook Form
 * - Tratamento de submissão e erros
 * - Suporte para criar e editar matrículas
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { IEnrollment } from '@/types/enrollment.types';

/**
 * Schema de validação para formulário de matrícula
 */
const enrollmentSchema = z.object({
  studentId: z.number().min(1, 'Selecione um aluno'),
  courseId: z.number().min(1, 'Selecione um curso'),
  enrollmentDate: z.string().min(1, 'Data de matrícula é obrigatória'),
});

/**
 * Tipo inferido do schema de validação
 */
export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

/**
 * Props do componente EnrollmentForm
 */
interface EnrollmentFormProps {
  /** Dados iniciais para edição (opcional) */
  initialData?: IEnrollment;

  /** Lista de alunos disponíveis */
  students: Array<{ id: number; name: string }>;

  /** Lista de cursos disponíveis */
  courses: Array<{ id: number; name: string }>;

  /** Callback executado ao submeter o formulário */
  onSubmit: (data: EnrollmentFormData) => Promise<void>;

  /** Flag indicando se está carregando */
  isLoading?: boolean;

  /** Erro para exibir */
  error?: string | null;
}

/**
 * EnrollmentForm - Componente de formulário para matrículas
 *
 * Responsabilidades:
 * - Renderizar campos do formulário (aluno, curso, data)
 * - Validar dados com Zod
 * - Exibir erros de validação
 * - Gerenciar estado de submissão
 *
 * @param props - Props do componente
 * @returns Componente de formulário
 *
 * @example
 * <EnrollmentForm
 *   students={students}
 *   courses={courses}
 *   onSubmit={async (data) => {
 *     await enrollmentService.create(data);
 *   }}
 * />
 */
export function EnrollmentForm({
  initialData,
  students,
  courses,
  onSubmit,
  isLoading = false,
  error: externalError,
}: EnrollmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      studentId: initialData?.studentId || undefined,
      courseId: initialData?.courseId || undefined,
      enrollmentDate: initialData?.enrollmentDate
        ? initialData.enrollmentDate.split('T')[0]
        : undefined,
    },
  });

  // Resetar formulário quando dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      reset({
        studentId: initialData.studentId,
        courseId: initialData.courseId,
        enrollmentDate: initialData.enrollmentDate.split('T')[0],
      });
    }
  }, [initialData, reset]);

  const studentId = watch('studentId');
  const courseId = watch('courseId');

  // Verificar se aluno está selecionado
  const selectedStudent = students.find((s) => s.id === studentId);
  // Verificar se curso está selecionado
  const selectedCourse = courses.find((c) => c.id === courseId);

  const handleFormSubmit = async (data: EnrollmentFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (err) {
      // Erro já é tratado pelo componente pai
      console.error('[EnrollmentForm] Erro ao submeter:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Exibir erro externo se houver */}
      {externalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{externalError}</p>
        </div>
      )}

      {/* Campo: Selecionar Aluno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aluno *
        </label>
        <select
          {...register('studentId', {
            valueAsNumber: true,
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.studentId
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300'
          }`}
          disabled={isLoading || isSubmitting}
        >
          <option value="">-- Selecione um aluno --</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
        )}
        {selectedStudent && (
          <p className="mt-2 text-sm text-gray-600">
            Selecionado: <strong>{selectedStudent.name}</strong>
          </p>
        )}
      </div>

      {/* Campo: Selecionar Curso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Curso *
        </label>
        <select
          {...register('courseId', {
            valueAsNumber: true,
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.courseId ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          disabled={isLoading || isSubmitting}
        >
          <option value="">-- Selecione um curso --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        {errors.courseId && (
          <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
        )}
        {selectedCourse && (
          <p className="mt-2 text-sm text-gray-600">
            Selecionado: <strong>{selectedCourse.name}</strong>
          </p>
        )}
      </div>

      {/* Campo: Data de Matrícula */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data de Matrícula *
        </label>
        <Input
          type="date"
          {...register('enrollmentDate')}
          placeholder="Data de matrícula"
          disabled={isLoading || isSubmitting}
          error={errors.enrollmentDate?.message}
          className={errors.enrollmentDate ? 'border-red-500' : ''}
        />
        {errors.enrollmentDate && (
          <p className="mt-1 text-sm text-red-600">
            {errors.enrollmentDate.message}
          </p>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Processando...' : initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </div>

      {/* Informação de carregamento */}
      {(isLoading || isSubmitting) && (
        <div className="text-center text-sm text-gray-600">
          Processando... Por favor, aguarde.
        </div>
      )}
    </form>
  );
}
