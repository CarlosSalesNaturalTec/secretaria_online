/**
 * Arquivo: frontend/src/hooks/index.ts
 * Descrição: Agregador e exportador de todos os hooks customizados
 * Feature: feat-104 - Criar custom hooks com React Query
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Centralizar exportações de todos os hooks
 * - Facilitar importações em componentes
 * - Manter interface consistente entre hooks
 */

// Hooks de autenticação
export { useAuth } from './useAuth';

// Hooks de gerenciamento de dados com React Query
export { useStudents, type IUseStudentsReturn } from './useStudents';
export { useTeachers, type IUseTeachersReturn } from './useTeachers';
export { useCourses, type IUseCoursesReturn } from './useCourses';
export { useClasses, type IUseClassesReturn } from './useClasses';

// Hooks de matrículas
export {
  useEnrollments,
  useEnrollmentById,
  useCreateEnrollment,
  useUpdateEnrollment,
  useUpdateEnrollmentStatus,
  useDeleteEnrollment,
} from './useEnrollments';
