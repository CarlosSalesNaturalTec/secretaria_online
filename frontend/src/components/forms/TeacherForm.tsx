/**
 * Arquivo: frontend/src/components/forms/TeacherForm.tsx
 * Descrição: Formulário de cadastro e edição de professores
 * Feature: feat-084 - Criar teacher.service.ts e página Teachers
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Renderizar formulário completo de professor
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
import type { IUser } from '@/types/user.types';
import type { ICreateTeacherData, IUpdateTeacherData } from '@/services/teacher.service';

/**
 * Schema de validação Zod para formulário de professor
 *
 * Valida todos os campos obrigatórios e opcionais com suas respectivas regras
 */
const teacherFormSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),

  login: z.string()
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .max(50, 'Login deve ter no máximo 50 caracteres')
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]+$/, 'Login deve conter apenas letras minúsculas, números e os caracteres . _ -'),

  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine(
      (cpf) => cpf.replace(/\D/g, '').length === 11,
      'CPF deve ter 11 dígitos'
    ),

  rg: z.string()
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  mother_name: z.string()
    .min(3, 'Nome da mãe deve ter no mínimo 3 caracteres')
    .max(255, 'Nome da mãe deve ter no máximo 255 caracteres'),

  father_name: z.string()
    .min(3, 'Nome do pai deve ter no mínimo 3 caracteres')
    .max(255, 'Nome do pai deve ter no máximo 255 caracteres'),

  address: z.string()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),

  voter_title: z.string()
    .min(1, 'Título de eleitor é obrigatório para professores')
    .max(20, 'Título de eleitor deve ter no máximo 20 caracteres'),

  reservist: z.string()
    .min(1, 'Número de reservista é obrigatório para professores')
    .max(20, 'Número do reservista deve ter no máximo 20 caracteres'),
});

/**
 * Tipo inferido do schema de validação
 */
type TeacherFormData = z.infer<typeof teacherFormSchema>;

/**
 * Props do componente TeacherForm
 */
interface TeacherFormProps {
  /**
   * Dados iniciais do professor (modo edição)
   * Se não fornecido, formulário inicia vazio (modo criação)
   */
  initialData?: IUser;

  /**
   * Callback executado ao submeter o formulário
   * Recebe os dados validados do professor
   */
  onSubmit: (data: ICreateTeacherData | IUpdateTeacherData) => void | Promise<void>;

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
 * Componente TeacherForm
 *
 * Formulário completo de cadastro e edição de professores com validação robusta.
 *
 * @example
 * // Modo criação
 * <TeacherForm
 *   onSubmit={handleCreate}
 *   onCancel={handleCancel}
 *   loading={isCreating}
 * />
 *
 * @example
 * // Modo edição
 * <TeacherForm
 *   initialData={teacher}
 *   onSubmit={handleUpdate}
 *   onCancel={handleCancel}
 *   loading={isUpdating}
 * />
 */
export function TeacherForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: TeacherFormProps) {
  /**
   * Configuração do React Hook Form com Zod resolver
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      email: '',
      login: '',
      cpf: '',
      rg: '',
      mother_name: '',
      father_name: '',
      address: '',
      voter_title: '',
      reservist: '',
    },
  });

  /**
   * Preenche formulário com dados iniciais quando em modo edição
   */
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        email: initialData.email || '',
        login: initialData.login || '',
        cpf: initialData.cpf || '',
        rg: initialData.rg || '',
        mother_name: initialData.mother_name || '',
        father_name: initialData.father_name || '',
        address: initialData.address || '',
        voter_title: initialData.voter_title || '',
        reservist: initialData.reservist || '',
      });
    }
  }, [initialData, reset]);

  /**
   * Handler de submit do formulário
   * Remove máscaras de todos os campos numéricos antes de enviar
   *
   * Campos que recebem limpeza:
   * - cpf: Remove máscara (###.###.###-##) → apenas números
   * - rg: Remove qualquer caractere não numérico
   * - voter_title: Remove qualquer caractere não numérico (título de eleitor)
   * - reservist: Remove qualquer caractere não numérico (número de reservista)
   */
  const handleFormSubmit = async (data: TeacherFormData) => {
    try {
      const cleanedData = {
        ...data,
        // Remove máscara do CPF: ###.###.###-## → apenas números
        cpf: data.cpf.replace(/\D/g, ''),
        // Remove máscaras e espaços dos campos opcionais
        rg: data.rg ? data.rg.replace(/\D/g, '').trim() || undefined : undefined,
        // Campos obrigatórios para professores
        mother_name: data.mother_name?.trim(),
        father_name: data.father_name?.trim(),
        address: data.address?.trim(),
        // Remove máscara do título de eleitor (se houver espaços ou caracteres especiais)
        voter_title: data.voter_title ? data.voter_title.replace(/\D/g, '').trim() : undefined,
        // Remove máscara do número de reservista (se houver espaços ou caracteres especiais)
        reservist: data.reservist ? data.reservist.replace(/\D/g, '').trim() : undefined,
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('[TeacherForm] Erro ao submeter formulário:', error);
    }
  };

  /**
   * Determina se está em modo edição ou criação
   */
  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Seção: Dados Básicos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados Básicos</h3>

        <div className="space-y-3">
          {/* Nome completo */}
          <Input
            {...register('name')}
            label="Nome completo"
            placeholder="Digite o nome completo do professor"
            error={errors.name?.message}
            required
            disabled={loading}
          />

          {/* Email */}
          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="email@exemplo.com"
            error={errors.email?.message}
            required
            disabled={loading}
          />

          {/* Login */}
          <Input
            {...register('login')}
            label="Login"
            placeholder="nome.sobrenome"
            helperText="Apenas letras minúsculas, números e os caracteres . _ -"
            error={errors.login?.message}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Seção: Documentos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* CPF */}
          <Input
            {...register('cpf')}
            label="CPF"
            placeholder="00000000000"
            mask="cpf"
            helperText="Apenas números"
            error={errors.cpf?.message}
            required
            disabled={loading}
          />

          {/* RG */}
          <Input
            {...register('rg')}
            label="RG"
            placeholder="000000000"
            error={errors.rg?.message}
            disabled={loading}
          />

          {/* Título de eleitor */}
          <Input
            {...register('voter_title')}
            label="Título de eleitor"
            placeholder="0000 0000 0000"
            error={errors.voter_title?.message}
            required
            disabled={loading}
          />

          {/* Reservista */}
          <Input
            {...register('reservist')}
            label="Certificado de reservista"
            placeholder="000000000"
            error={errors.reservist?.message}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Seção: Informações Adicionais */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Adicionais</h3>

        <div className="space-y-3">
          {/* Nome da mãe */}
          <Input
            {...register('mother_name')}
            label="Nome da mãe"
            placeholder="Digite o nome da mãe"
            error={errors.mother_name?.message}
            required
            disabled={loading}
          />

          {/* Nome do pai */}
          <Input
            {...register('father_name')}
            label="Nome do pai"
            placeholder="Digite o nome do pai"
            error={errors.father_name?.message}
            required
            disabled={loading}
          />

          {/* Endereço */}
          <Input
            {...register('address')}
            label="Endereço completo"
            placeholder="Rua, número, bairro, cidade, estado"
            error={errors.address?.message}
            required
            disabled={loading}
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
          {isEditMode ? 'Atualizar professor' : 'Cadastrar professor'}
        </Button>
      </div>
    </form>
  );
}
