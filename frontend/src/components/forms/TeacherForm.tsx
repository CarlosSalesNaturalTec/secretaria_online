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
    .min(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números'),

  rg: z.string()
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  motherName: z.string()
    .max(100, 'Nome da mãe deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  fatherName: z.string()
    .max(100, 'Nome do pai deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  title: z.string()
    .max(20, 'Título de eleitor deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  reservist: z.string()
    .max(20, 'Número do reservista deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
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
      motherName: '',
      fatherName: '',
      address: '',
      title: '',
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
        motherName: initialData.motherName || '',
        fatherName: initialData.fatherName || '',
        address: initialData.address || '',
        title: initialData.title || '',
        reservist: initialData.reservist || '',
      });
    }
  }, [initialData, reset]);

  /**
   * Handler de submit do formulário
   * Remove máscara do CPF antes de enviar
   */
  const handleFormSubmit = async (data: TeacherFormData) => {
    try {
      // Remove caracteres não numéricos do CPF (caso tenha máscara)
      const cleanedData = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        // Remove campos vazios opcionais
        rg: data.rg?.trim() || undefined,
        motherName: data.motherName?.trim() || undefined,
        fatherName: data.fatherName?.trim() || undefined,
        address: data.address?.trim() || undefined,
        title: data.title?.trim() || undefined,
        reservist: data.reservist?.trim() || undefined,
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
            {...register('title')}
            label="Título de eleitor"
            placeholder="0000 0000 0000"
            error={errors.title?.message}
            disabled={loading}
          />

          {/* Reservista */}
          <Input
            {...register('reservist')}
            label="Certificado de reservista"
            placeholder="000000000"
            error={errors.reservist?.message}
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
            {...register('motherName')}
            label="Nome da mãe"
            placeholder="Digite o nome da mãe"
            error={errors.motherName?.message}
            disabled={loading}
          />

          {/* Nome do pai */}
          <Input
            {...register('fatherName')}
            label="Nome do pai"
            placeholder="Digite o nome do pai"
            error={errors.fatherName?.message}
            disabled={loading}
          />

          {/* Endereço */}
          <Input
            {...register('address')}
            label="Endereço completo"
            placeholder="Rua, número, bairro, cidade, estado"
            error={errors.address?.message}
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
