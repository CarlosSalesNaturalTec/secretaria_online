/**
 * Arquivo: frontend/src/hooks/useAuth.ts
 * Descrição: Hook customizado para consumir AuthContext
 * Feature: feat-077 - Criar hook useAuth
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Consumir e expor dados do AuthContext de forma simplificada
 * - Validar se hook está sendo usado dentro do AuthProvider
 * - Fornecer acesso fácil a: user, login, logout, isAuthenticated
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook customizado para acessar contexto de autenticação
 *
 * Simplifica o acesso ao AuthContext, garantindo que está sendo
 * usado dentro do AuthProvider e fornecendo tipagem adequada.
 *
 * @returns Objeto com user, login, logout, isAuthenticated e outros dados de auth
 * @throws Error se usado fora do AuthProvider
 *
 * @example
 * // Em um componente
 * function Dashboard() {
 *   const { user, logout, isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Bem-vindo, {user?.name}</h1>
 *       <button onClick={logout}>Sair</button>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Na página de login
 * function Login() {
 *   const { login } = useAuth();
 *   const navigate = useNavigate();
 *
 *   const handleLogin = async (credentials) => {
 *     try {
 *       const response = await authService.login(credentials);
 *       login(response.user, response.token);
 *       navigate('/dashboard');
 *     } catch (error) {
 *       console.error('Erro ao fazer login:', error);
 *     }
 *   };
 *
 *   return <LoginForm onSubmit={handleLogin} />;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    console.error(
      '[useAuth] Hook usado fora do AuthProvider. ' +
        'Certifique-se de que o componente está envolvido por <AuthProvider>.'
    );
    throw new Error(
      'useAuth deve ser usado dentro de um AuthProvider. ' +
        'Envolva sua aplicação com <AuthProvider> no componente raiz.'
    );
  }

  return context;
}
