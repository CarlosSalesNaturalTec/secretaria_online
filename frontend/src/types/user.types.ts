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

  /** CPF do usuário (11 dígitos) */
  cpf: string;

  /** RG do usuário */
  rg?: string;

  /** Nome da mãe */
  motherName?: string;

  /** Nome do pai */
  fatherName?: string;

  /** Endereço completo */
  address?: string;

  /** Título/cargo */
  title?: string;

  /** Indicador se é reservista */
  reservist?: string;

  /** Data do primeiro acesso (null se nunca acessou) */
  firstAccessAt?: string;

  /** Data de criação */
  createdAt: string;

  /** Data da última atualização */
  updatedAt: string;

  /** Data de exclusão lógica (soft delete) */
  deletedAt?: string | null;
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

  /** CPF com validação */
  cpf: string;

  /** RG */
  rg?: string;

  /** Nome da mãe */
  motherName?: string;

  /** Nome do pai */
  fatherName?: string;

  /** Endereço */
  address?: string;

  /** Título/cargo (opcional) */
  title?: string;

  /** Se é reservista (opcional) */
  reservist?: boolean;
}

/**
 * Dados para edição de usuário
 */
export interface IUserUpdateRequest {
  /** Nome (opcional) */
  name?: string;

  /** Email (opcional) */
  email?: string;

  /** CPF (opcional) */
  cpf?: string;

  /** RG (opcional) */
  rg?: string;

  /** Nome da mãe (opcional) */
  motherName?: string;

  /** Nome do pai (opcional) */
  fatherName?: string;

  /** Endereço (opcional) */
  address?: string;

  /** Título/cargo (opcional) */
  title?: string;

  /** Reservista (opcional) */
  reservist?: boolean;
}
