/**
 * Arquivo: frontend/src/components/forms/StudentForm.tsx
 * Descrição: Formulário de cadastro e edição de estudantes
 * Feature: feat-083 - Criar página Students (listagem e CRUD)
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-11-04
 * Atualizado em: 2025-12-01
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { parseDateToInput } from '@/utils/formatters';
import type { IStudent, IStudentCreateRequest, IStudentUpdateRequest } from '@/types/student.types';

/**
 * Schema de validação para formulário de estudante
 */
const studentFormSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  cpf: z.string()
    .optional()
    .refine(
      (cpf) => !cpf || cpf.replace(/\D/g, '').length === 11,
      'CPF deve ter 11 dígitos'
    ),

  data_nascimento: z.string()
    .optional()
    .or(z.literal('')),

  telefone: z.string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  celular: z.string()
    .max(20, 'Celular deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_rua: z.string()
    .max(300, 'Rua deve ter no máximo 300 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_numero: z.string()
    .max(20, 'Número deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  endereco_complemento: z.string()
    .max(2000, 'Complemento deve ter no máximo 2000 caracteres')
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
    .optional()
    .or(z.literal('')),

  cep: z.string()
    .max(20, 'CEP deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  sexo: z.coerce.number()
    .int()
    .min(1)
    .max(2)
    .optional(),

  mae: z.string()
    .max(100, 'Nome da mãe deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  pai: z.string()
    .max(100, 'Nome do pai deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  titulo_eleitor: z.string()
    .max(25, 'Título deve ter no máximo 25 caracteres')
    .optional()
    .or(z.literal('')),

  rg: z.string()
    .max(15, 'RG deve ter no máximo 15 caracteres')
    .optional()
    .or(z.literal('')),

  rg_data: z.string()
    .optional()
    .or(z.literal('')),

  profissao: z.string()
    .max(200, 'Profissão deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  responsavel: z.string()
    .max(200, 'Responsável deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  matricula: z.string()
    .optional()
    .or(z.literal('')),

  ano_matricula: z.string()
    .optional()
    .or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  initialData?: IStudent;
  onSubmit: (data: IStudentCreateRequest | IStudentUpdateRequest) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function StudentForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      data_nascimento: '',
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
      rg: '',
      rg_data: '',
      profissao: '',
      responsavel: '',
      matricula: '',
      ano_matricula: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      // Cast para any para acessar propriedades em camelCase que vêm da API
      const student = initialData as any;
      console.log('[StudentForm] Carregando dados do estudante:', student);

      reset({
        nome: student.nome || '',
        email: student.email || '',
        cpf: student.cpf || '',
        data_nascimento: parseDateToInput(student.data_nascimento || student.dataNascimento),
        telefone: student.telefone || '',
        celular: student.celular || '',
        endereco_rua: student.endereco_rua || student.enderecoRua || '',
        endereco_numero: student.endereco_numero || student.enderecoNumero || '',
        endereco_complemento: student.endereco_complemento || student.enderecoComplemento || '',
        endereco_bairro: student.endereco_bairro || student.enderecoBairro || '',
        endereco_cidade: student.endereco_cidade || student.enderecoCidade || '',
        endereco_uf: student.endereco_uf || student.enderecoUf || '',
        cep: student.cep || '',
        sexo: student.sexo || undefined,
        mae: student.mae || '',
        pai: student.pai || '',
        titulo_eleitor: student.titulo_eleitor || student.tituloEleitor || '',
        rg: student.rg || '',
        rg_data: parseDateToInput(student.rg_data || student.rgData),
        profissao: student.profissao || '',
        responsavel: student.responsavel || '',
        matricula: student.matricula ? String(student.matricula) : '',
        ano_matricula: (student.ano_matricula || student.anoMatricula) ? String(student.ano_matricula || student.anoMatricula) : '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      // Remove campos vazios e limpa máscaras
      const cleanedData: any = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          // Limpa máscaras de CPF e CEP
          if (key === 'cpf' || key === 'cep') {
            cleanedData[key] = String(value).replace(/\D/g, '');
          }
          // Converte campos numéricos de string para number
          else if (key === 'matricula' || key === 'ano_matricula' || key === 'sexo') {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              cleanedData[key] = numValue;
            }
          }
          else {
            cleanedData[key] = value;
          }
        }
      });

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('[StudentForm] Erro ao submeter formulário:', error);
    }
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Básicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('nome')}
            label="Nome completo"
            placeholder="Nome do estudante"
            error={errors.nome?.message}
            disabled={loading}
          />

          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="email@exemplo.com"
            error={errors.email?.message}
            disabled={loading}
          />

          <Input
            {...register('cpf')}
            label="CPF"
            placeholder="000.000.000-00"
            mask="cpf"
            error={errors.cpf?.message}
            disabled={loading}
          />

          <Input
            {...register('data_nascimento')}
            type="date"
            label="Data de Nascimento"
            error={errors.data_nascimento?.message}
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo
            </label>
            <select
              {...register('sexo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Selecione...</option>
              <option value="1">Masculino</option>
              <option value="2">Feminino</option>
            </select>
            {errors.sexo && (
              <p className="mt-1 text-sm text-red-600">{errors.sexo.message}</p>
            )}
          </div>

          <Input
            {...register('telefone')}
            label="Telefone"
            placeholder="(00) 0000-0000"
            error={errors.telefone?.message}
            disabled={loading}
          />

          <Input
            {...register('celular')}
            label="Celular"
            placeholder="(00) 00000-0000"
            error={errors.celular?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Endereço */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            {...register('cep')}
            label="CEP"
            placeholder="00000-000"
            error={errors.cep?.message}
            disabled={loading}
          />

          <div className="md:col-span-2">
            <Input
              {...register('endereco_rua')}
              label="Rua/Logradouro"
              placeholder="Nome da rua"
              error={errors.endereco_rua?.message}
              disabled={loading}
            />
          </div>

          <Input
            {...register('endereco_numero')}
            label="Número"
            placeholder="123"
            error={errors.endereco_numero?.message}
            disabled={loading}
          />

          <Input
            {...register('endereco_complemento')}
            label="Complemento"
            placeholder="Apto, Bloco..."
            error={errors.endereco_complemento?.message}
            disabled={loading}
          />

          <Input
            {...register('endereco_bairro')}
            label="Bairro"
            placeholder="Nome do bairro"
            error={errors.endereco_bairro?.message}
            disabled={loading}
          />

          <Input
            {...register('endereco_cidade')}
            label="Cidade"
            placeholder="Nome da cidade"
            error={errors.endereco_cidade?.message}
            disabled={loading}
          />

          <Input
            {...register('endereco_uf')}
            label="UF"
            placeholder="SP"
            maxLength={2}
            error={errors.endereco_uf?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Filiação */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filiação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('mae')}
            label="Nome da Mãe"
            placeholder="Nome da mãe"
            error={errors.mae?.message}
            disabled={loading}
          />

          <Input
            {...register('pai')}
            label="Nome do Pai"
            placeholder="Nome do pai"
            error={errors.pai?.message}
            disabled={loading}
          />

          <Input
            {...register('responsavel')}
            label="Responsável Legal"
            placeholder="Nome do responsável (se menor)"
            error={errors.responsavel?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Documentos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            {...register('rg')}
            label="RG"
            placeholder="00.000.000-0"
            error={errors.rg?.message}
            disabled={loading}
          />

          <Input
            {...register('rg_data')}
            type="date"
            label="Data de Emissão do RG"
            error={errors.rg_data?.message}
            disabled={loading}
          />

          <Input
            {...register('titulo_eleitor')}
            label="Título de Eleitor"
            placeholder="0000 0000 0000"
            error={errors.titulo_eleitor?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Dados Acadêmicos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Acadêmicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            {...register('matricula')}
            type="number"
            label="Matrícula"
            placeholder="Número da matrícula"
            error={errors.matricula?.message}
            disabled={loading}
          />

          <Input
            {...register('ano_matricula')}
            type="number"
            label="Ano da Matrícula"
            placeholder="2025"
            error={errors.ano_matricula?.message}
            disabled={loading}
          />

          <Input
            {...register('profissao')}
            label="Profissão"
            placeholder="Profissão do estudante"
            error={errors.profissao?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Botões */}
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
          {isEditMode ? 'Atualizar Estudante' : 'Cadastrar Estudante'}
        </Button>
      </div>
    </form>
  );
}
