/**
 * Arquivo: frontend/src/services/auth.service.ts
 * Descrição: Serviço de autenticação para comunicação com API
 * Feature: feat-078 - Criar auth.service.ts
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Realizar login de usuários (admin, professor, aluno)
 * - Realizar logout de usuários
 * - Alterar senha de usuários autenticados
 * - Validar dados antes de enviar à API
 * - Tratar erros de autenticação de forma padronizada
 */

import api from './api';
import type { ILoginCredentials, IAuthUser } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Realiza login do usuário na API
 *
 * Envia credenciais (login e senha) para endpoint de autenticação.
 * Em caso de sucesso, retorna dados do usuário e token JWT.
 *
 * @param {ILoginCredentials} credentials - Credenciais de login (login e password)
 * @returns {Promise<IAuthUser>} Dados do usuário autenticado e token JWT
 * @throws {Error} Quando credenciais são inválidas ou ocorre erro na API
 *
 * @example
 * try {
 *   const { user, token } = await login({ login: 'admin', password: '123456' });
 *   console.log('Usuário logado:', user.name);
 * } catch (error) {
 *   console.error('Falha no login:', error);
 * }
 */
export async function login(credentials: ILoginCredentials): Promise<IAuthUser> {
  try {
    // Validação de credenciais
    if (!credentials.login || !credentials.password) {
      throw new Error('Login e senha são obrigatórios');
    }

    if (credentials.login.trim().length < 3) {
      throw new Error('Login deve ter no mínimo 3 caracteres');
    }

    if (credentials.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('[AuthService] Realizando login...', {
        login: credentials.login,
      });
    }

    // Chamada à API
    const response = await api.post<ApiResponse<IAuthUser>>('/auth/login', {
      login: credentials.login.trim(),
      password: credentials.password,
    });

    // Validação da resposta
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Erro ao realizar login');
    }

    const { user, token } = response.data.data;

    // Validação dos dados retornados
    if (!user || !token) {
      throw new Error('Resposta da API inválida: dados de autenticação não retornados');
    }

    if (import.meta.env.DEV) {
      console.log('[AuthService] Login realizado com sucesso:', {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      });
    }

    return { user, token };
  } catch (error) {
    // Log de erro
    console.error('[AuthService] Erro ao realizar login:', error);

    // Re-throw com mensagem apropriada
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao realizar login. Tente novamente.');
  }
}

/**
 * Realiza logout do usuário na API
 *
 * Notifica o servidor sobre o logout (invalidação de token no backend, se aplicável).
 * Mesmo que a chamada falhe, o logout local deve ser realizado no AuthContext.
 *
 * @returns {Promise<void>}
 * @throws {Error} Quando ocorre erro na comunicação com API (erro é logado mas não bloqueia logout)
 *
 * @example
 * try {
 *   await logout();
 *   console.log('Logout realizado');
 * } catch (error) {
 *   // Erro é logado mas não impede logout local
 *   console.warn('Erro ao notificar servidor sobre logout:', error);
 * }
 */
export async function logout(): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log('[AuthService] Realizando logout...');
    }

    // Chamada à API para invalidar token no servidor
    await api.post<ApiResponse<void>>('/auth/logout');

    if (import.meta.env.DEV) {
      console.log('[AuthService] Logout realizado com sucesso');
    }
  } catch (error) {
    // Log de erro mas não impede logout local
    console.error('[AuthService] Erro ao notificar servidor sobre logout:', error);

    // Não re-throw: logout local deve ocorrer mesmo se API falhar
    if (import.meta.env.DEV) {
      console.warn('[AuthService] Logout local será realizado mesmo com erro na API');
    }
  }
}

/**
 * Altera senha do usuário autenticado
 *
 * Valida e envia solicitação de troca de senha para a API.
 * Requer que usuário esteja autenticado (token JWT no header via interceptor).
 *
 * @param {string} oldPassword - Senha atual do usuário
 * @param {string} newPassword - Nova senha desejada
 * @returns {Promise<void>}
 * @throws {Error} Quando senhas são inválidas ou ocorre erro na API
 *
 * @example
 * try {
 *   await changePassword('senha123', 'novaSenha456');
 *   console.log('Senha alterada com sucesso');
 * } catch (error) {
 *   console.error('Falha ao alterar senha:', error);
 * }
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Validação de senhas
    if (!oldPassword || !newPassword) {
      throw new Error('Senha atual e nova senha são obrigatórias');
    }

    if (oldPassword.length < 6) {
      throw new Error('Senha atual deve ter no mínimo 6 caracteres');
    }

    if (newPassword.length < 6) {
      throw new Error('Nova senha deve ter no mínimo 6 caracteres');
    }

    if (oldPassword === newPassword) {
      throw new Error('Nova senha deve ser diferente da senha atual');
    }

    // Validação de complexidade da nova senha
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      throw new Error('Nova senha deve conter letras e números');
    }

    if (import.meta.env.DEV) {
      console.log('[AuthService] Alterando senha...');
    }

    // Chamada à API
    const response = await api.post<ApiResponse<void>>('/auth/change-password', {
      oldPassword,
      newPassword,
    });

    // Validação da resposta
    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || 'Erro ao alterar senha'
      );
    }

    if (import.meta.env.DEV) {
      console.log('[AuthService] Senha alterada com sucesso');
    }
  } catch (error) {
    // Log de erro
    console.error('[AuthService] Erro ao alterar senha:', error);

    // Re-throw com mensagem apropriada
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Falha ao alterar senha. Tente novamente.');
  }
}

/**
 * Exporta todas as funções do serviço como objeto
 *
 * Permite importação nomeada ou import do objeto completo
 *
 * @example
 * // Importação nomeada (recomendado)
 * import { login, logout, changePassword } from '@/services/auth.service';
 *
 * // Importação do objeto completo
 * import AuthService from '@/services/auth.service';
 * AuthService.login({ login: 'admin', password: '123' });
 */
const AuthService = {
  login,
  logout,
  changePassword,
};

export default AuthService;
