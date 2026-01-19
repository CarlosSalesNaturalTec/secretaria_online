/**
 * Arquivo: frontend/src/pages/student/Schedule.tsx
 * Descrição: Página para aluno visualizar sua grade de horários completa
 * Feature: feat-003 - Visualização da Grade pelo Aluno
 * Criado em: 2026-01-19
 */

import { useState } from 'react';
import { Calendar, BookOpen, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WeekScheduleGrid } from '@/components/schedules/WeekScheduleGrid';
import { useStudentFullSchedule } from '@/hooks/useStudentExtraDiscipline';
import type { IClassSchedule } from '@/types/classSchedule.types';

type TabType = 'all' | 'main' | 'extra';

export default function SchedulePage() {
  const { user } = useAuth();
  const studentId = user?.id;
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Hook para buscar grade completa
  const { data: fullSchedule, isLoading, error } = useStudentFullSchedule(studentId || 0);

  // Organizar horários por aba
  const getSchedulesForTab = (): IClassSchedule[] => {
    if (!fullSchedule) return [];

    switch (activeTab) {
      case 'all':
        return [
          ...(fullSchedule.mainClassSchedules || []),
          ...(fullSchedule.extraDisciplineSchedules || []),
        ];
      case 'main':
        return fullSchedule.mainClassSchedules || [];
      case 'extra':
        return fullSchedule.extraDisciplineSchedules || [];
      default:
        return [];
    }
  };

  const schedulesArray = getSchedulesForTab();

  // Renderizar tabs
  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab('all')}
        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
          activeTab === 'all'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`}
      >
        <Calendar size={16} className="inline mr-2" />
        Grade Completa
      </button>
      <button
        onClick={() => setActiveTab('main')}
        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
          activeTab === 'main'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`}
      >
        <BookOpen size={16} className="inline mr-2" />
        Turma Principal
      </button>
      <button
        onClick={() => setActiveTab('extra')}
        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
          activeTab === 'extra'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`}
      >
        <BookOpen size={16} className="inline mr-2" />
        Disciplinas Extras
        {fullSchedule?.extraDisciplineSchedules && fullSchedule.extraDisciplineSchedules.length > 0 && (
          <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-semibold">
            {fullSchedule.extraDisciplineSchedules.length}
          </span>
        )}
      </button>
    </div>
  );

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

      {/* Info Alert (se houver disciplinas extras) */}
      {fullSchedule?.extraDisciplineSchedules && fullSchedule.extraDisciplineSchedules.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start">
          <Info size={20} className="text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800">
            <p className="font-semibold">Você possui disciplinas extras</p>
            <p className="mt-1">
              As disciplinas extras aparecerão destacadas na grade completa.
              Use as abas acima para filtrar a visualização.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {renderTabs()}

      {/* Grade de Horários */}
      <div className="bg-white rounded-lg shadow p-6">
        {schedulesArray.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block">
              <WeekScheduleGrid
                schedules={schedulesArray}
                editable={false}
                showOnlineLinks={true}
                highlightExtra={activeTab === 'all'}
                variant="desktop"
              />
            </div>
            {/* Mobile View */}
            <div className="block lg:hidden">
              <WeekScheduleGrid
                schedules={schedulesArray}
                editable={false}
                showOnlineLinks={true}
                highlightExtra={activeTab === 'all'}
                variant="mobile"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Nenhum horário encontrado</p>
            <p className="text-sm mt-2">
              {activeTab === 'main' && 'Você não possui horários na turma principal'}
              {activeTab === 'extra' && 'Você não possui disciplinas extras'}
              {activeTab === 'all' && 'Nenhum horário cadastrado'}
            </p>
          </div>
        )}
      </div>

      {/* Legenda (se houver disciplinas extras) */}
      {activeTab === 'all' && fullSchedule?.extraDisciplineSchedules && fullSchedule.extraDisciplineSchedules.length > 0 && (
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
