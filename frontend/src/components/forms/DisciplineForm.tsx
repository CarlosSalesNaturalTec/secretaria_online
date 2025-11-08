/**
 * Arquivo: frontend/src/components/forms/DisciplineForm.tsx
 * Descrição: Formulário de cadastro e edição de disciplinas
 * Feature: feat-111 - Implementar cadastro de disciplinas no frontend
 * Criado em: 2025-11-08
 *
 * Responsabilidades:
 * - Renderizar formulário completo de disciplina
 * - Validar dados com Zod schema
 * - Suportar modo criação e edição
 * - Integrar com React Hook Form
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { IDiscipline } from '@/types/course.types';
import type { ICreateDisciplineData, IUpdateDisciplineData } from '@/services/discipline.service';

/**
 * Schema de validação Zod para formulário de disciplina
 *
 * Valida todos os campos obrigatórios com suas respectivas regras
 */
const disciplineFormSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  code: z.string()
    .min(2, 'Código deve ter no mínimo 2 caracteres')
    .max(20, 'Código deve ter no máximo 20 caracteres')
    .trim()
    .toUpperCase(),

  workloadHours: z.number()
    .int('Carga horária deve ser um número inteiro')
    .min(1, 'Carga horária mínima é 1 hora')
    .max(500, 'Carga horária máxima é 500 horas'),
});

/**
 * Tipo inferido do schema de validação
 */
type DisciplineFormData = z.infer<typeof disciplineFormSchema>;

/**
 * Props do componente DisciplineForm
 */
interface DisciplineFormProps {
  /**
   * Dados iniciais da disciplina (modo edição)
   * Se não fornecido, formulário inicia vazio (modo criação)
   */
  initialData?: IDiscipline;

  /**
   * Callback executado ao submeter o formulário
   * Recebe os dados validados da disciplina
   */
  onSubmit: (data: ICreateDisciplineData | IUpdateDisciplineData) => void | Promise<void>;

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
 * Componente DisciplineForm
 *
 * Formulário completo de cadastro e edição de disciplinas com validação robusta.
 *
 * @example
 * // Modo criação
 * <DisciplineForm
 *   onSubmit={handleCreate}
 *   onCancel={handleCancel}
 *   loading={isCreating}
 * />
 *
 * @example
 * // Modo edição
 * <DisciplineForm
 *   initialData={discipline}
 *   onSubmit={handleUpdate}
 *   onCancel={handleCancel}
 *   loading={isUpdating}
 * />
 */
export function DisciplineForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: DisciplineFormProps) {
  /**
   * Configuração do React Hook Form com Zod resolver
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DisciplineFormData>({
    resolver: zodResolver(disciplineFormSchema),
    defaultValues: {
      name: '',
      code: '',
      workloadHours: 40,
    },
  });

  /**
   * Preenche formulário com dados iniciais quando em modo edição
   */
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        workloadHours: initialData.workloadHours || 40,
      });
    }
  }, [initialData, reset]);

  /**
   * Handler de submit do formulário
   */
  const handleFormSubmit = async (data: DisciplineFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('[DisciplineForm] Erro ao submeter formulário:', error);
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações da Disciplina</h3>

        <div className="space-y-3">
          {/* Nome da disciplina */}
          <Input
            {...register('name')}
            label="Nome da disciplina"
            placeholder="Digite o nome da disciplina"
            error={errors.name?.message}
            required
            disabled={loading}
          />

          {/* Código da disciplina */}
          <Input
            {...register('code')}
            label="Código"
            placeholder="Digite o código (ex: PROG001)"
            helperText="Identificador único da disciplina (será convertido para maiúsculas)"
            error={errors.code?.message}
            required
            disabled={loading}
            maxLength={20}
          />

          {/* Carga horária */}
          <Input
            {...register('workloadHours', { valueAsNumber: true })}
            type="number"
            label="Carga Horária"
            placeholder="40"
            helperText="Total de horas-aula da disciplina"
            error={errors.workloadHours?.message}
            required
            disabled={loading}
            min={1}
            max={500}
          />
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
          {isEditMode ? 'Atualizar disciplina' : 'Cadastrar disciplina'}
        </Button>
      </div>
    </form>
  );
}
