/**
 * Arquivo: frontend/src/pages/student/Schedule.tsx
 * Descrição: Página para aluno visualizar sua grade de horários completa
 * Feature: feat-003 - Visualização da Grade pelo Aluno
 * Criado em: 2026-01-19
 */

import { useContext } from 'react';
import { Calendar, BookOpen } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { WeekScheduleGrid } from '@/components/schedules/WeekScheduleGrid';
import { ExtraDisciplinesList } from '@/components/students/ExtraDisciplinesList';
import { useStudentFullSchedule } from '@/hooks/useStudentExtraDiscipline';

export default function SchedulePage() {
  const authContext = useContext(AuthContext);
  // FIX: Usar o ID do estudante (student_id), não o ID do usuário (id)
  const studentId = authContext?.user?.student_id || authContext?.user?.studentId || 0;

  // Hook para buscar grade completa
  const { data: fullSchedule, isLoading, error } = useStudentFullSchedule(studentId || 0);

  const schedulesArray = fullSchedule ? [
    ...(fullSchedule.mainClassSchedules || []),
    ...(fullSchedule.extraDisciplineSchedules || []),
  ] : [];

  const hasExtraDisciplines = fullSchedule?.extraDisciplines && fullSchedule.extraDisciplines.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Erro ao carregar grade de horários</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar size={28} className="mr-2 text-blue-600" />
          Minha Grade de Horários
        </h1>
        <p className="text-gray-600 mt-1">
          Visualize seus horários de aula da turma principal e disciplinas extras
        </p>
      </div>

      {/* Grade de Horários */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {schedulesArray.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block">
              <WeekScheduleGrid
                schedules={schedulesArray}
                editable={false}
                showOnlineLinks={true}
                highlightExtra={true}
                variant="desktop"
              />
            </div>
            {/* Mobile View */}
            <div className="block lg:hidden">
              <WeekScheduleGrid
                schedules={schedulesArray}
                editable={false}
                showOnlineLinks={true}
                highlightExtra={true}
                variant="mobile"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Nenhum horário encontrado</p>
            <p className="text-sm mt-2">
              Nenhum horário cadastrado
            </p>
          </div>
        )}
      </div>

      {/* Lista de Disciplinas Extras (Detalhes) */}
      {hasExtraDisciplines && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen size={24} className="mr-2 text-orange-600" />
            Minhas Disciplinas Extras
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ExtraDisciplinesList
              studentId={studentId}
              extraDisciplines={fullSchedule.extraDisciplines}
              editable={false}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Legenda (se houver disciplinas extras e horários) */}
      {hasExtraDisciplines && schedulesArray.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Legenda:</h3>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-gray-300 rounded mr-2"></div>
              <span className="text-gray-700">Turma Principal</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-orange-500 rounded mr-2 ring-2 ring-orange-500 ring-offset-2"></div>
              <span className="text-gray-700">Disciplina Extra</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
