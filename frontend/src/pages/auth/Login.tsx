/**
 * Arquivo: frontend/src/pages/auth/Login.tsx
 * Descrição: Página de login da aplicação
 * Feature: feat-079 - Criar página de Login
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Renderizar formulário de login (login, senha)
 * - Validar dados com Zod antes de submeter
 * - Integrar com useAuth para autenticação
 * - Redirecionar para dashboard apropriado baseado em role
 * - Exibir mensagens de erro de forma clara
 * - Manter loading state durante autenticação
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { login as loginService } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import type { ILoginCredentials } from '@/types/user.types';

/**
 * Schema de validação com Zod para formulário de login
 *
 * Define regras de validação:
 * - login: mínimo 3 caracteres, obrigatório
 * - password: mínimo 6 caracteres, obrigatório
 */
const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'Login é obrigatório')
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

/**
 * Tipo inferido do schema de validação
 */
type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Mapeamento de roles para rotas de dashboard
 *
 * Define para qual rota redirecionar após login bem-sucedido
 * baseado no role do usuário autenticado
 */
const DASHBOARD_ROUTES = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
} as const;

/**
 * Página de Login
 *
 * Implementa formulário de autenticação com validação, integração
 * com API e redirecionamento baseado em perfil do usuário.
 *
 * @example
 * // Uso em rotas
 * <Route path="/login" element={<Login />} />
 */
export default function Login() {
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Configuração do React Hook Form com validação Zod
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Valida ao sair do campo
  });

  /**
   * Handler de submissão do formulário
   *
   * Fluxo:
   * 1. Valida dados com Zod (automático via resolver)
   * 2. Chama loginService para autenticar na API
   * 3. Armazena user e token no AuthContext via loginContext
   * 4. Redireciona para dashboard apropriado baseado em role
   * 5. Trata erros e exibe mensagens ao usuário
   *
   * @param data - Dados validados do formulário
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      // Limpa erro anterior
      setApiError('');
      setIsSubmitting(true);

      if (import.meta.env.DEV) {
        console.log('[Login] Iniciando autenticação...', { login: data.login });
      }

      // Chama serviço de login
      const credentials: ILoginCredentials = {
        login: data.login,
        password: data.password,
      };

      const { user, token } = await loginService(credentials);

      // Salva user e token no contexto
      loginContext(user, token);

      if (import.meta.env.DEV) {
        console.log('[Login] Autenticação bem-sucedida', {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
        });
      }

      // Redireciona para dashboard baseado no role
      const dashboardRoute =
        DASHBOARD_ROUTES[user.role as keyof typeof DASHBOARD_ROUTES];

      if (!dashboardRoute) {
        console.error('[Login] Role desconhecido:', user.role);
        setApiError(
          'Erro ao redirecionar: perfil de usuário não reconhecido. Contate o suporte.'
        );
        return;
      }

      if (import.meta.env.DEV) {
        console.log('[Login] Redirecionando para:', dashboardRoute);
      }

      navigate(dashboardRoute, { replace: true });
    } catch (error) {
      // Trata erros de autenticação
      console.error('[Login] Erro ao realizar login:', error);

      if (error instanceof Error) {
        // Mensagens de erro específicas
        if (
          error.message.includes('credenciais inválidas') ||
          error.message.includes('401')
        ) {
          setApiError('Login ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('rede') || error.message.includes('Network')) {
          setApiError(
            'Erro de conexão. Verifique sua internet e tente novamente.'
          );
        } else {
          setApiError(
            error.message || 'Erro ao realizar login. Tente novamente.'
          );
        }
      } else {
        setApiError('Erro inesperado ao realizar login. Tente novamente.');
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
            Secretaria Online
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-700">
            Faça login em sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite suas credenciais para acessar o sistema
          </p>
        </div>

        {/* Formulário de Login */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6 bg-white shadow-md rounded-lg p-8"
          noValidate
        >
          {/* Mensagem de erro geral da API */}
          {apiError && (
            <div
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Erro ao realizar login
                </p>
                <p className="text-sm text-red-700 mt-1">{apiError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Campo Login */}
            <Input
              {...register('login')}
              id="login"
              type="text"
              label="Login"
              placeholder="Digite seu login"
              error={errors.login?.message}
              required
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
            />

            {/* Campo Senha */}
            <Input
              {...register('password')}
              id="password"
              type="password"
              label="Senha"
              placeholder="Digite sua senha"
              error={errors.password?.message}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          {/* Botão de Submissão */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Esqueceu sua senha? Entre em contato com a secretaria.
            </p>
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
