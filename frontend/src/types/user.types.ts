/**
 * Arquivo: frontend/src/types/user.types.ts
 * Descrição: Tipos e interfaces de usuários
 * Feature: feat-003 - Setup do frontend React com Vite
 * Feature: feat-101 - Criar types TypeScript (atualização)
 * Criado em: 2025-10-24
 * Atualizado em: 2025-11-04
 */

import { USER_ROLES } from '@/utils/constants';

/**
 * Tipos de role de usuário no sistema
 */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Representa um usuário genérico do sistema
 *
 * Responsabilidades:
 * - Armazenar dados básicos de qualquer tipo de usuário
 * - Indicar o papel (role) do usuário no sistema
 * - Rastrear primeiro acesso e datas de criação
 */
export interface IUser {
  /** ID único do usuário */
  id: number;

  /** Papel do usuário no sistema */
  role: UserRole;

  /** Nome completo do usuário */
  name: string;

  /** Email do usuário */
  email: string;

  /** Login para autenticação */
  login: string;

  /** Data do primeiro acesso (null se nunca acessou) */
  firstAccessAt?: string;
  first_access_at?: string;

  /** Data de criação */
  createdAt?: string;
  created_at?: string;

  /** Data da última atualização */
  updatedAt?: string;
  updated_at?: string;

  /** Data de exclusão lógica (soft delete) */
  deletedAt?: string | null;
  deleted_at?: string | null;

  /** Status da matrícula do estudante (se aplicável) */
  enrollmentStatus?: 'contract' | 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed';

  /** ID do estudante na tabela students (se role === 'student') */
  studentId?: number;
  student_id?: number;

  /** ID do professor na tabela teachers (se role === 'teacher') */
  teacherId?: number;
  teacher_id?: number;
}

/**
 * Dados do usuário para autenticação com token
 * Retornado após login bem-sucedido
 */
export interface IAuthUser {
  /** Dados do usuário autenticado */
  user: IUser;

  /** Token JWT para acessar recursos protegidos */
  token: string;
}

/**
 * Credenciais para fazer login
 *
 * @example
 * const credentials: ILoginCredentials = {
 *   login: 'joao123',
 *   password: 'senha_provisoria_123'
 * };
 */
export interface ILoginCredentials {
  /** Login do usuário */
  login: string;

  /** Senha do usuário */
  password: string;
}

/**
 * Dados para mudança de senha
 */
export interface IChangePassword {
  /** Senha atual do usuário */
  oldPassword: string;

  /** Nova senha desejada */
  newPassword: string;

  /** Confirmação da nova senha */
  confirmPassword: string;
}

/**
 * Resposta de sucesso após login
 * @deprecated Use IAuthUser em vez disso
 */
export interface ILoginResponse extends IAuthUser {
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Contexto de autenticação no frontend
 * Utilizado pelo AuthContext para gerenciar estado de autenticação
 */
export interface IAuthContext {
  /** Usuário atualmente autenticado (null se não autenticado) */
  user: IUser | null;

  /** Token JWT atual */
  accessToken: string | null;

  /** Indica se usuário está autenticado */
  isAuthenticated: boolean;

  /** Indica se está fazendo requisição de autenticação */
  isLoading: boolean;

  /** Erro de autenticação (se houver) */
  error: string | null;

  /** Função para fazer login */
  login: (credentials: ILoginCredentials) => Promise<void>;

  /** Função para fazer logout */
  logout: () => void;

  /** Função para renovar token */
  refreshToken: () => Promise<void>;
}

/**
 * Dados para criação de usuário
 */
export interface IUserCreateRequest {
  /** Nome completo */
  name: string;

  /** Email */
  email: string;

  /** Login único */
  login: string;

  /** Senha */
  password: string;

  /** Role do usuário */
  role: UserRole;
}

/**
 * Dados para criação de usuário (alias)
 */
export interface ICreateUser {
  name: string;
  email: string;
  login: string;
  password: string;
  role: UserRole;
}

/**
 * Dados para atualização de usuário (alias)
 */
export interface IUpdateUser {
  name?: string;
  email?: string;
  login?: string;
  password?: string;
  role?: UserRole;
}

/**
 * Dados para edição de usuário
 */
export interface IUserUpdateRequest {
  /** Nome (opcional) */
  name?: string;

  /** Email (opcional) */
  email?: string;

  /** Login (opcional) */
  login?: string;

  /** Senha (opcional) */
  password?: string;

  /** Role (opcional) */
  role?: UserRole;
}
