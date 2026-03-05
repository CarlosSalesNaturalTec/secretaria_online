/**
 * Arquivo: frontend/src/types/studentDisciplineExemption.types.ts
 * Descrição: Tipos TypeScript para aproveitamento de disciplinas (dispensa)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

export interface IStudentDisciplineExemption {
  id: number;
  student_id: number;
  discipline_id: number;
  class_id?: number;
  origin_institution?: string;
  notes?: string;
  discipline?: { id: number; name: string; code?: string };
  class?: { id: number; semester: number; year: number };
  student?: { id: number; nome: string; matricula: string };
  created_at: string;
  updated_at: string;
}

export interface ICreateExemptionDTO {
  discipline_id: number;
  class_id?: number;
  origin_institution?: string;
  notes?: string;
}
