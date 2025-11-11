/**
 * Arquivo: frontend/src/pages/auth/FirstAccess.tsx
 * Descrição: Página de primeiro acesso para troca de senha provisória
 * Feature: feat-080 - Criar página de Primeiro Acesso
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Renderizar formulário de troca de senha (senha atual, nova senha, confirmar senha)
 * - Validar dados com Zod antes de submeter
 * - Integrar com auth.service.changePassword
 * - Exibir mensagens de erro e sucesso de forma clara
 * - Redirecionar para dashboard do aluno após sucesso
 * - Manter loading state durante processamento
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePassword } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Schema de validação com Zod para formulário de primeiro acesso
 *
 * Define regras de validação:
 * - currentPassword: mínimo 6 caracteres, obrigatório
 * - newPassword: mínimo 6 caracteres, deve conter letras e números
 * - confirmPassword: deve ser idêntico à nova senha
 */
const firstAccessSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Senha atual é obrigatória')
      .min(6, 'Senha atual deve ter no mínimo 6 caracteres'),
    newPassword: z
      .string()
      .min(1, 'Nova senha é obrigatória')
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
      .regex(/[A-Za-z]/, 'Nova senha deve conter letras')
      .regex(/[0-9]/, 'Nova senha deve conter números'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não correspondem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  });

/**
 * Tipo inferido do schema de validação
 */
type FirstAccessFormData = z.infer<typeof firstAccessSchema>;

/**
 * Página de Primeiro Acesso
 *
 * Implementa formulário para troca de senha provisória com validação,
 * integração com API e redirecionamento após sucesso.
 *
 * @example
 * // Uso em rotas
 * <Route path="/primeiro-acesso" element={<FirstAccess />} />
 */
export default function FirstAccess() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Configuração do React Hook Form com validação Zod
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FirstAccessFormData>({
    resolver: zodResolver(firstAccessSchema),
    mode: 'onBlur', // Valida ao sair do campo
  });

  /**
   * Handler de submissão do formulário
   *
   * Fluxo:
   * 1. Valida dados com Zod (automático via resolver)
   * 2. Chama changePassword do auth.service
   * 3. Exibe mensagem de sucesso
   * 4. Redireciona para dashboard do aluno após 2 segundos
   * 5. Trata erros e exibe mensagens ao usuário
   *
   * @param data - Dados validados do formulário
   */
  const onSubmit = async (data: FirstAccessFormData) => {
    try {
      // Limpa erro anterior
      setApiError('');
      setShowSuccess(false);
      setIsSubmitting(true);

      if (import.meta.env.DEV) {
        console.log('[FirstAccess] Iniciando troca de senha...');
      }

      // Chama serviço de troca de senha
      await changePassword(data.currentPassword, data.newPassword);

      if (import.meta.env.DEV) {
        console.log('[FirstAccess] Senha alterada com sucesso');
      }

      // Exibe mensagem de sucesso
      setShowSuccess(true);

      // Redireciona após 2 segundos
      setTimeout(() => {
        if (import.meta.env.DEV) {
          console.log('[FirstAccess] Redirecionando para dashboard do aluno...');
        }
        navigate('/student/dashboard', { replace: true });
      }, 2000);
    } catch (error) {
      // Trata erros de troca de senha
      console.error('[FirstAccess] Erro ao trocar senha:', error);

      if (error instanceof Error) {
        // Mensagens de erro específicas
        if (
          error.message.includes('senha atual incorreta') ||
          error.message.includes('senha atual inválida') ||
          error.message.includes('401')
        ) {
          setApiError('Senha atual incorreta. Verifique e tente novamente.');
        } else if (error.message.includes('senha deve')) {
          setApiError(error.message);
        } else if (error.message.includes('rede') || error.message.includes('Network')) {
          setApiError('Erro de conexão. Verifique sua internet e tente novamente.');
        } else {
          setApiError(error.message || 'Erro ao trocar senha. Tente novamente.');
        }
      } else {
        setApiError('Erro inesperado ao trocar senha. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Primeiro Acesso
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-700">
            Troque sua senha provisória
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por segurança, você deve criar uma nova senha antes de continuar
          </p>
        </div>

        {/* Formulário de Primeiro Acesso */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6 bg-white shadow-md rounded-lg p-8"
          noValidate
        >
          {/* Mensagem de sucesso */}
          {showSuccess && (
            <div
              className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Senha alterada com sucesso!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Você será redirecionado em instantes...
                </p>
              </div>
            </div>
          )}

          {/* Mensagem de erro geral da API */}
          {apiError && !showSuccess && (
            <div
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Erro ao trocar senha
                </p>
                <p className="text-sm text-red-700 mt-1">{apiError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Campo Senha Atual */}
            <Input
              {...register('currentPassword')}
              id="currentPassword"
              type="password"
              label="Senha Atual"
              placeholder="Digite sua senha provisória"
              error={errors.currentPassword?.message}
              required
              autoComplete="current-password"
              autoFocus
              disabled={isSubmitting || showSuccess}
            />

            {/* Campo Nova Senha */}
            <Input
              {...register('newPassword')}
              id="newPassword"
              type="password"
              label="Nova Senha"
              placeholder="Digite sua nova senha"
              error={errors.newPassword?.message}
              required
              autoComplete="new-password"
              disabled={isSubmitting || showSuccess}
            />

            {/* Campo Confirmar Senha */}
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              label="Confirmar Nova Senha"
              placeholder="Digite novamente sua nova senha"
              error={errors.confirmPassword?.message}
              required
              autoComplete="new-password"
              disabled={isSubmitting || showSuccess}
            />
          </div>

          {/* Requisitos de senha */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-xs font-medium text-blue-800 mb-2">
              Requisitos da nova senha:
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Mínimo de 6 caracteres</li>
              <li>Deve conter letras (A-Z ou a-z)</li>
              <li>Deve conter números (0-9)</li>
              <li>Deve ser diferente da senha atual</li>
            </ul>
          </div>

          {/* Botão de Submissão */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting || showSuccess}
            >
              {isSubmitting ? 'Alterando senha...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          © 2025 Secretaria Online. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
