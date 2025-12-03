/**
 * Arquivo: frontend/src/components/forms/TeacherForm.tsx
 * Descrição: Formulário de cadastro e edição de professores
 * Feature: feat-110 - Criar tabela teachers e migrar dados de users
 * Atualizado em: 2025-12-02
 *
 * Responsabilidades:
 * - Renderizar formulário completo de professor
 * - Validar dados com Zod schema
 * - Suportar modo criação e edição
 * - Integrar com React Hook Form
 * - Trabalhar com a nova tabela teachers (separada de users)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ITeacher } from '@/types/teacher.types';
import type { ICreateTeacherData, IUpdateTeacherData } from '@/services/teacher.service';

/**
 * Schema de validação Zod para formulário de professor
 *
 * Valida todos os campos obrigatórios e opcionais com suas respectivas regras
 * Baseado na estrutura da tabela teachers (similar a students)
 */
const teacherFormSchema = z.object({
  // Dados pessoais básicos
  nome: z.string()
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  email: z.string()
    .trim()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      'Email inválido'
    )
    .or(z.literal('')),

  cpf: z.string()
    .trim()
    .optional()
    .refine(
      (cpf) => !cpf || cpf.replace(/\D/g, '').length === 0 || cpf.replace(/\D/g, '').length === 11,
      'CPF deve ter 11 dígitos'
    )
    .or(z.literal('')),

  rg: z.string()
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  rg_data: z.string()
    .max(10, 'Data do RG inválida')
    .optional()
    .or(z.literal('')),

  data_nascimento: z.string()
    .optional()
    .or(z.literal('')),

  sexo: z.union([
    z.literal('M'),
    z.literal('F'),
    z.literal('1'),
    z.literal('2'),
    z.literal(''),
  ]).optional(),

  // Contato
  telefone: z.string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  celular: z.string()
    .max(20, 'Celular deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  // Endereço completo
  endereco_rua: z.string()
    .max(300, 'Rua deve ter no máximo 300 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_numero: z.string()
    .max(10, 'Número deve ter no máximo 10 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_complemento: z.string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_bairro: z.string()
    .max(200, 'Bairro deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_cidade: z.string()
    .max(200, 'Cidade deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_uf: z.string()
    .max(2, 'UF deve ter 2 caracteres')
    .toUpperCase()
    .optional()
    .or(z.literal('')),

  cep: z.string()
    .max(20, 'CEP deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  // Filiação
  mae: z.string()
    .max(100, 'Nome da mãe deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  pai: z.string()
    .max(100, 'Nome do pai deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Documentos adicionais
  titulo_eleitor: z.string()
    .max(25, 'Título de eleitor deve ter no máximo 25 caracteres')
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
  initialData?: ITeacher;

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
      nome: '',
      email: '',
      cpf: '',
      rg: '',
      rg_data: '',
      data_nascimento: '',
      sexo: '' as '' | 'M' | 'F' | '1' | '2' | undefined,
      telefone: '',
      celular: '',
      endereco_rua: '',
      endereco_numero: '',
      endereco_complemento: '',
      endereco_bairro: '',
      endereco_cidade: '',
      endereco_uf: '',
      cep: '',
      mae: '',
      pai: '',
      titulo_eleitor: '',
    },
  });

  /**
   * Preenche formulário com dados iniciais quando em modo edição
   */
  useEffect(() => {
    if (initialData) {
      reset({
        nome: initialData.nome || '',
        email: initialData.email || '',
        cpf: initialData.cpf || '',
        rg: initialData.rg || '',
        rg_data: initialData.rg_data || '',
        data_nascimento: initialData.data_nascimento || '',
        // Converte de número (1 ou 2) para string ('M' ou 'F') no modo edição
        sexo: initialData.sexo
          ? ((initialData.sexo === 1 || initialData.sexo === '1') ? 'M' as const : 'F' as const)
          : ('' as const),
        telefone: initialData.telefone || '',
        celular: initialData.celular || '',
        endereco_rua: initialData.endereco_rua || '',
        endereco_numero: initialData.endereco_numero || '',
        endereco_complemento: initialData.endereco_complemento || '',
        endereco_bairro: initialData.endereco_bairro || '',
        endereco_cidade: initialData.endereco_cidade || '',
        endereco_uf: initialData.endereco_uf || '',
        cep: initialData.cep || '',
        mae: initialData.mae || '',
        pai: initialData.pai || '',
        titulo_eleitor: initialData.titulo_eleitor || '',
      });
    }
  }, [initialData, reset]);

  /**
   * Handler de submit do formulário
   * Remove máscaras de todos os campos numéricos antes de enviar
   *
   * Campos que recebem limpeza:
   * - cpf: Remove máscara (###.###.###-##) → apenas números
   * - cep: Remove máscara (#####-###) → apenas números
   * - telefone: Remove máscaras
   * - celular: Remove máscaras
   */
  const handleFormSubmit = async (data: TeacherFormData) => {
    try {
      // Converte sexo para número antes de montar o cleanedData
      const sexoValue = data.sexo as string | undefined;
      let sexoNumerico: 1 | 2 | undefined = undefined;

      if (sexoValue && sexoValue !== '') {
        sexoNumerico = (sexoValue === 'M' || sexoValue === '1') ? 1 : 2;
      }

      const cleanedData = {
        // Campos opcionais - envia null quando vazio para permitir limpar o campo
        cpf: data.cpf ? (data.cpf.replace(/\D/g, '').trim() || null) : null,
        nome: data.nome?.trim() || null,
        email: data.email?.trim() || null,
        cep: data.cep ? (data.cep.replace(/\D/g, '').trim() || null) : null,
        rg: data.rg ? (data.rg.replace(/\D/g, '').trim() || null) : null,
        rg_data: data.rg_data?.trim() || null,
        data_nascimento: data.data_nascimento?.trim() || null,
        telefone: data.telefone ? (data.telefone.replace(/\D/g, '').trim() || null) : null,
        celular: data.celular ? (data.celular.replace(/\D/g, '').trim() || null) : null,
        titulo_eleitor: data.titulo_eleitor ? (data.titulo_eleitor.replace(/\D/g, '').trim() || null) : null,

        // Sexo convertido para número (backend espera 1 ou 2) - envia null quando vazio
        sexo: sexoNumerico || null,

        // Endereço - todos opcionais - envia null quando vazio
        endereco_rua: data.endereco_rua?.trim() || null,
        endereco_numero: data.endereco_numero?.trim() || null,
        endereco_complemento: data.endereco_complemento?.trim() || null,
        endereco_bairro: data.endereco_bairro?.trim() || null,
        endereco_cidade: data.endereco_cidade?.trim() || null,
        endereco_uf: data.endereco_uf ? (data.endereco_uf.toUpperCase().trim() || null) : null,

        // Filiação - opcionais - envia null quando vazio
        mae: data.mae?.trim() || null,
        pai: data.pai?.trim() || null,
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Seção: Dados Pessoais */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome completo */}
          <div className="md:col-span-2">
            <Input
              {...register('nome')}
              label="Nome completo"
              placeholder="Digite o nome completo do professor"
              error={errors.nome?.message}
              disabled={loading}
            />
          </div>

          {/* CPF */}
          <Input
            {...register('cpf')}
            label="CPF"
            placeholder="000.000.000-00"
            mask="cpf"
            error={errors.cpf?.message}
            disabled={loading}
          />

          {/* RG */}
          <Input
            {...register('rg')}
            label="RG"
            placeholder="00.000.000-0"
            error={errors.rg?.message}
            disabled={loading}
          />

          {/* Data emissão RG */}
          <Input
            {...register('rg_data')}
            type="date"
            label="Data de emissão do RG"
            error={errors.rg_data?.message}
            disabled={loading}
          />

          {/* Data de nascimento */}
          <Input
            {...register('data_nascimento')}
            type="date"
            label="Data de nascimento"
            error={errors.data_nascimento?.message}
            disabled={loading}
          />

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo
            </label>
            <select
              {...register('sexo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            {errors.sexo && (
              <p className="mt-1 text-sm text-red-600">{errors.sexo.message}</p>
            )}
          </div>

          {/* Título de eleitor */}
          <Input
            {...register('titulo_eleitor')}
            label="Título de eleitor"
            placeholder="0000 0000 0000"
            error={errors.titulo_eleitor?.message}
            disabled={loading}
          />

          {/* Email */}
          <div className="md:col-span-2">
            <Input
              {...register('email')}
              type="email"
              label="Email"
              placeholder="email@exemplo.com"
              error={errors.email?.message}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Seção: Contato */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telefone */}
          <Input
            {...register('telefone')}
            label="Telefone"
            placeholder="(00) 0000-0000"
            mask="phone"
            error={errors.telefone?.message}
            disabled={loading}
          />

          {/* Celular */}
          <Input
            {...register('celular')}
            label="Celular"
            placeholder="(00) 00000-0000"
            mask="celular"
            error={errors.celular?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Seção: Endereço */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CEP */}
          <Input
            {...register('cep')}
            label="CEP"
            placeholder="00000-000"
            mask="cep"
            error={errors.cep?.message}
            disabled={loading}
          />

          {/* Rua */}
          <div className="md:col-span-2">
            <Input
              {...register('endereco_rua')}
              label="Rua"
              placeholder="Nome da rua"
              error={errors.endereco_rua?.message}
              disabled={loading}
            />
          </div>

          {/* Número */}
          <Input
            {...register('endereco_numero')}
            label="Número"
            placeholder="000"
            error={errors.endereco_numero?.message}
            disabled={loading}
          />

          {/* Complemento */}
          <Input
            {...register('endereco_complemento')}
            label="Complemento"
            placeholder="Apto, bloco, etc."
            error={errors.endereco_complemento?.message}
            disabled={loading}
          />

          {/* Bairro */}
          <Input
            {...register('endereco_bairro')}
            label="Bairro"
            placeholder="Nome do bairro"
            error={errors.endereco_bairro?.message}
            disabled={loading}
          />

          {/* Cidade */}
          <Input
            {...register('endereco_cidade')}
            label="Cidade"
            placeholder="Nome da cidade"
            error={errors.endereco_cidade?.message}
            disabled={loading}
          />

          {/* UF */}
          <Input
            {...register('endereco_uf')}
            label="UF"
            placeholder="MG"
            maxLength={2}
            error={errors.endereco_uf?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Seção: Filiação */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filiação</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome da mãe */}
          <div className="md:col-span-2">
            <Input
              {...register('mae')}
              label="Nome da mãe"
              placeholder="Digite o nome completo da mãe"
              error={errors.mae?.message}
              disabled={loading}
            />
          </div>

          {/* Nome do pai */}
          <div className="md:col-span-2">
            <Input
              {...register('pai')}
              label="Nome do pai"
              placeholder="Digite o nome completo do pai"
              error={errors.pai?.message}
              disabled={loading}
            />
          </div>
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
