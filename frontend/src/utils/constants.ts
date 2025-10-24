/**
 * Arquivo: frontend/src/utils/constants.ts
 * Descrição: Constantes globais da aplicação
 * Feature: feat-003 - Setup do frontend React com Vite
 * Criado em: 2025-10-24
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
} as const;

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const EVALUATION_TYPE = {
  GRADE: 'grade',
  CONCEPT: 'concept',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: '/users',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  COURSES: '/courses',
  DISCIPLINES: '/disciplines',
  CLASSES: '/classes',
  ENROLLMENTS: '/enrollments',
  DOCUMENTS: '/documents',
  CONTRACTS: '/contracts',
  GRADES: '/grades',
  EVALUATIONS: '/evaluations',
  REQUESTS: '/requests',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
