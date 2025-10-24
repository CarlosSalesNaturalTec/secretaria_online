/**
 * Arquivo: frontend/src/types/user.types.ts
 * Descrição: Tipos e interfaces de usuários
 * Feature: feat-003 - Setup do frontend React com Vite
 * Criado em: 2025-10-24
 */

import { USER_ROLES } from '@/utils/constants';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface IUser {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  login: string;
  cpf: string;
  rg?: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  title?: string;
  reservist?: string;
  firstAccessAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthUser {
  user: IUser;
  token: string;
}

export interface ILoginCredentials {
  login: string;
  password: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
