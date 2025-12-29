/**
 * Arquivo: frontend/src/contexts/AuthContext.tsx
 * Descrição: Context API para gerenciamento de autenticação
 * Feature: feat-076 - Criar AuthContext e AuthProvider
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Gerenciar estado global de autenticação (user, token, loading)
 * - Persistir dados de autenticação no localStorage
 * - Fornecer métodos para login, logout e atualização de usuário
 * - Inicializar estado a partir do localStorage ao carregar aplicação
 * - Sincronizar estado com localStorage em todas as operações
 */

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { IUser } from '@/types/user.types';

/**
 * Interface do estado de autenticação
 */
interface AuthState {
  /** Usuário autenticado (null se não autenticado) */
  user: IUser | null;
  /** Token JWT de autenticação */
  token: string | null;
  /** Indica se está carregando dados do localStorage */
  loading: boolean;
}

/**
 * Interface dos métodos do contexto de autenticação
 */
interface AuthContextType extends AuthState {
  /**
   * Realiza login do usuário
   *
   * @param user - Dados do usuário autenticado
   * @param token - Token JWT recebido da API
   * @returns void
   * @throws Error se user ou token forem inválidos
   */
  login: (user: IUser, token: string) => void;

  /**
   * Realiza logout do usuário
   * Remove dados do localStorage e limpa estado
   *
   * @returns void
   */
  logout: () => void;

  /**
   * Atualiza dados do usuário autenticado
   * Útil após edição de perfil ou atualização de informações
   *
   * @param user - Dados atualizados do usuário
   * @returns void
   * @throws Error se não houver usuário autenticado
   */
  updateUser: (user: IUser) => void;

  /**
   * Verifica se usuário está autenticado
   *
   * @returns true se token e user existem
   */
  isAuthenticated: boolean;

  /**
   * Indica se o estudante logado tem rematrícula pendente
   *
   * @returns true se usuário for estudante e tiver enrollment 'pending'
   */
  hasEnrollmentPending: boolean;
}

/**
 * Chaves do localStorage para persistência
 */
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

/**
 * Contexto de autenticação
 * Usado por consumers via useContext(AuthContext)
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * Props do AuthProvider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação
 * Deve envolver toda a aplicação para disponibilizar contexto de auth
 *
 * @example
 * // App.tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router />
 *     </AuthProvider>
 *   );
 * }
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  /**
   * Inicializa estado a partir do localStorage ao montar componente
   *
   * Carrega user e token salvos previamente, se existirem.
   * Em caso de dados corrompidos, limpa o localStorage.
   */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        const parsedUser: IUser = JSON.parse(storedUser);

        // Valida estrutura mínima do user
        if (parsedUser.id && parsedUser.role && parsedUser.name) {
          setState({
            user: parsedUser,
            token: storedToken,
            loading: false,
          });

          console.log('[AuthContext] Usuário restaurado do localStorage:', {
            id: parsedUser.id,
            name: parsedUser.name,
            role: parsedUser.role,
          });
        } else {
          throw new Error('Dados de usuário inválidos no localStorage');
        }
      } else {
        // Não há dados salvos
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error(
        '[AuthContext] Erro ao carregar dados do localStorage:',
        error
      );

      // Limpa localStorage em caso de dados corrompidos
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      setState({
        user: null,
        token: null,
        loading: false,
      });
    }
  }, []);

  /**
   * Realiza login salvando user e token no estado e localStorage
   *
   * @param user - Dados do usuário autenticado
   * @param token - Token JWT
   */
  const login = useCallback((user: IUser, token: string) => {
    if (!user || !token) {
      console.error('[AuthContext] Login falhou: user ou token inválidos');
      throw new Error('Dados de autenticação inválidos');
    }

    try {
      // Persiste no localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Atualiza estado
      setState({
        user,
        token,
        loading: false,
      });

      console.log('[AuthContext] Login realizado com sucesso:', {
        id: user.id,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error('[AuthContext] Erro ao salvar dados de login:', error);
      throw new Error('Falha ao realizar login');
    }
  }, []);

  /**
   * Realiza logout removendo dados do estado e localStorage
   */
  const logout = useCallback(() => {
    try {
      // Remove do localStorage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Limpa estado
      setState({
        user: null,
        token: null,
        loading: false,
      });

      console.log('[AuthContext] Logout realizado com sucesso');
    } catch (error) {
      console.error('[AuthContext] Erro ao realizar logout:', error);

      // Garante limpeza mesmo em caso de erro
      setState({
        user: null,
        token: null,
        loading: false,
      });
    }
  }, []);

  /**
   * Atualiza dados do usuário no estado e localStorage
   *
   * @param user - Dados atualizados do usuário
   * @throws Error se não houver usuário autenticado
   */
  const updateUser = useCallback(
    (user: IUser) => {
      if (!state.token) {
        console.error(
          '[AuthContext] Não é possível atualizar: usuário não autenticado'
        );
        throw new Error('Usuário não autenticado');
      }

      try {
        // Persiste no localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        // Atualiza estado mantendo token existente
        setState((prev) => ({
          ...prev,
          user,
        }));

        console.log('[AuthContext] Usuário atualizado com sucesso:', {
          id: user.id,
          name: user.name,
        });
      } catch (error) {
        console.error('[AuthContext] Erro ao atualizar usuário:', error);
        throw new Error('Falha ao atualizar dados do usuário');
      }
    },
    [state.token]
  );

  /**
   * Computed property: verifica se usuário está autenticado
   */
  const isAuthenticated = Boolean(state.token && state.user);

  /**
   * Computed property: verifica se estudante tem enrollment pendente
   * (aguardando aceite de contrato ou rematrícula)
   */
  const hasEnrollmentPending =
    state.user?.role === 'student' &&
    (state.user?.enrollmentStatus === 'reenrollment' ||
      state.user?.enrollmentStatus === 'contract');

  /**
   * Valor do contexto exposto aos consumers
   */
  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    hasEnrollmentPending,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
