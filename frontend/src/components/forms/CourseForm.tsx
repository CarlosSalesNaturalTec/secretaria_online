/**
 * Arquivo: frontend/src/components/forms/CourseForm.tsx
 * Descrição: Formulário de cadastro e edição de cursos
 * Feature: feat-085 - Criar course.service.ts e página Courses
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Renderizar formulário completo de curso
 * - Validar dados com Zod schema
 * - Suportar modo criação e edição
 * - Integrar com React Hook Form
 * - Permitir gestão de disciplinas vinculadas
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ICourse } from '@/types/course.types';
import type { ICreateCourseData, IUpdateCourseData } from '@/services/course.service';

/**
 * Schema de validação Zod para formulário de curso
 *
 * Valida todos os campos obrigatórios e opcionais com suas respectivas regras
 */
const courseFormSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim(),

  durationSemesters: z.number()
    .int('Duração deve ser um número inteiro')
    .min(1, 'Duração mínima é 1 semestre')
    .max(20, 'Duração máxima é 20 semestres'),
});

/**
 * Tipo inferido do schema de validação
 */
type CourseFormData = z.infer<typeof courseFormSchema>;

/**
 * Props do componente CourseForm
 */
interface CourseFormProps {
  /**
   * Dados iniciais do curso (modo edição)
   * Se não fornecido, formulário inicia vazio (modo criação)
   */
  initialData?: ICourse;

  /**
   * Callback executado ao submeter o formulário
   * Recebe os dados validados do curso
   */
  onSubmit: (data: ICreateCourseData | IUpdateCourseData) => void | Promise<void>;

  /**
   * Callback executado ao cancelar o formulário
   */
  onCancel?: () => void;

  /**
   * Indica se o formulário está em estado de loading (salvando)
   * @default false
   */
  loading?: boolean;
}

/**
 * Componente CourseForm
 *
 * Formulário completo de cadastro e edição de cursos com validação robusta.
 *
 * @example
 * // Modo criação
 * <CourseForm
 *   onSubmit={handleCreate}
 *   onCancel={handleCancel}
 *   loading={isCreating}
 * />
 *
 * @example
 * // Modo edição
 * <CourseForm
 *   initialData={course}
 *   onSubmit={handleUpdate}
 *   onCancel={handleCancel}
 *   loading={isUpdating}
 * />
 */
export function CourseForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CourseFormProps) {
  /**
   * Configuração do React Hook Form com Zod resolver
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      durationSemesters: 1,
    },
  });

  /**
   * Preenche formulário com dados iniciais quando em modo edição
   */
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        durationSemesters: initialData.durationSemesters || 1,
      });
    }
  }, [initialData, reset]);

  /**
   * Handler de submit do formulário
   */
  const handleFormSubmit = async (data: CourseFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('[CourseForm] Erro ao submeter formulário:', error);
    }
  };

  /**
   * Determina se está em modo edição ou criação
   */
  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Seção: Informações Básicas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Curso</h3>

        <div className="space-y-3">
          {/* Nome do curso */}
          <Input
            {...register('name')}
            label="Nome do curso"
            placeholder="Digite o nome do curso"
            error={errors.name?.message}
            required
            disabled={loading}
          />

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="Descreva o curso de forma detalhada"
              rows={4}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300'
              } ${loading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Duração em semestres */}
          <Input
            {...register('durationSemesters')}
            type="number"
            label="Duração (semestres)"
            placeholder="8"
            helperText="Número de semestres necessários para conclusão do curso"
            error={errors.durationSemesters?.message}
            required
            disabled={loading}
            min={1}
            max={20}
          />
        </div>
      </div>

      {/* Seção: Disciplinas (placeholder para expansão futura) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Disciplinas</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            A gestão de disciplinas vinculadas ao curso será implementada em versão futura.
            Por enquanto, as disciplinas podem ser gerenciadas separadamente.
          </p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {isEditMode ? 'Atualizar curso' : 'Cadastrar curso'}
        </Button>
      </div>
    </form>
  );
}
