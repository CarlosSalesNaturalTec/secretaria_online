/**
 * Arquivo: frontend/src/components/forms/ClassScheduleModal.tsx
 * Descrição: Modal para gerenciar horários das disciplinas da turma
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  IClass,
  IClassDisciplineSchedule,
  IClassDisciplineScheduleCreateRequest,
  DayOfWeek,
} from '@/types/class.types';
import ClassDisciplineScheduleService from '@/services/classDisciplineSchedule.service';

interface ClassScheduleModalProps {
  classData: IClass;
  onClose: () => void;
  onSuccess: () => void;
}

interface ScheduleForm {
  classTeacherId: number;
  disciplineName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export function ClassScheduleModal({ classData, onClose, onSuccess }: ClassScheduleModalProps) {
  const [schedules, setSchedules] = useState<IClassDisciplineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSchedule, setNewSchedule] = useState<ScheduleForm>({
    classTeacherId: 0,
    disciplineName: '',
    dayOfWeek: 'segunda',
    startTime: '',
    endTime: '',
  });

  // Log dos dados brutos recebidos
  useEffect(() => {
    console.log('[ClassScheduleModal] classData RAW:', classData);
    console.log('[ClassScheduleModal] classData.teachers RAW:', classData.teachers);
    if (classData.teachers && classData.teachers.length > 0) {
      console.log('[ClassScheduleModal] Primeiro professor RAW:', JSON.stringify(classData.teachers[0], null, 2));
    }
  }, [classData]);

  // Carregar horários existentes
  useEffect(() => {
    loadSchedules();
  }, [classData.id]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await ClassDisciplineScheduleService.getSchedulesByClass(classData.id);
      setSchedules(data);
    } catch (error) {
      console.error('[ClassScheduleModal] Erro ao carregar horários:', error);
      alert('Erro ao carregar horários da turma');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.classTeacherId || !newSchedule.startTime || !newSchedule.endTime) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const createData: IClassDisciplineScheduleCreateRequest = {
        classTeacherId: newSchedule.classTeacherId,
        dayOfWeek: newSchedule.dayOfWeek,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
      };

      await ClassDisciplineScheduleService.create(createData);

      // Resetar formulário
      setNewSchedule({
        classTeacherId: 0,
        disciplineName: '',
        dayOfWeek: 'segunda',
        startTime: '',
        endTime: '',
      });

      // Recarregar lista
      await loadSchedules();
    } catch (error: any) {
      console.error('[ClassScheduleModal] Erro ao criar horário:', error);
      alert(error.response?.data?.error?.message || 'Erro ao criar horário');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Deseja realmente remover este horário?')) {
      return;
    }

    try {
      setSaving(true);
      await ClassDisciplineScheduleService.delete(scheduleId);
      await loadSchedules();
    } catch (error) {
      console.error('[ClassScheduleModal] Erro ao deletar horário:', error);
      alert('Erro ao remover horário');
    } finally {
      setSaving(false);
    }
  };

  // Obter lista de disciplinas com professores da turma
  const getClassTeacherOptions = () => {
    if (!classData.teachers || !classData.disciplines) {
      console.log('[ClassScheduleModal] Sem professores ou disciplinas', {
        teachers: classData.teachers,
        disciplines: classData.disciplines
      });
      return [];
    }

    console.log('[ClassScheduleModal] Dados da turma:', {
      teachers: classData.teachers,
      disciplines: classData.disciplines
    });

    const options = classData.teachers.map((teacher: any) => {
      console.log('[ClassScheduleModal] Processando professor:', teacher);

      // Tentar diferentes estruturas de dados para pegar discipline_id
      let disciplineId = 0;
      let classTeacherId = 0;

      if (teacher.class_teachers?.discipline_id) {
        disciplineId = teacher.class_teachers.discipline_id;
        classTeacherId = teacher.class_teachers.id;
      } else if (teacher.dataValues?.class_teachers?.discipline_id) {
        disciplineId = teacher.dataValues.class_teachers.discipline_id;
        classTeacherId = teacher.dataValues.class_teachers.id;
      } else if (Array.isArray(teacher.class_teachers) && teacher.class_teachers.length > 0) {
        disciplineId = teacher.class_teachers[0].discipline_id;
        classTeacherId = teacher.class_teachers[0].id;
      }

      console.log('[ClassScheduleModal] Extraído:', { disciplineId, classTeacherId });

      const discipline = classData.disciplines?.find((d: any) => d.id === disciplineId);

      const option = {
        classTeacherId: classTeacherId,
        teacherName: teacher.name || teacher.nome,
        disciplineName: discipline?.name || 'Disciplina não encontrada',
        disciplineCode: discipline?.code || '',
      };

      console.log('[ClassScheduleModal] Opção criada:', option);

      return option;
    }).filter(opt => opt.classTeacherId > 0);

    console.log('[ClassScheduleModal] Opções finais:', options);

    return options;
  };

  const classTeacherOptions = getClassTeacherOptions();

  // Agrupar horários por dia da semana
  const schedulesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.value] = schedules
      .filter((s) => s.dayOfWeek === day.value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<DayOfWeek, IClassDisciplineSchedule[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} />
              Grade de Horários
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {classData.course?.name} - {classData.semester}º semestre - {classData.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Carregando horários...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Formulário de adicionar horário */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Plus size={18} />
                  Adicionar Novo Horário
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disciplina
                    </label>
                    <select
                      value={newSchedule.classTeacherId}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = classTeacherOptions.find(
                          (opt) => opt.classTeacherId === selectedId
                        );
                        setNewSchedule({
                          ...newSchedule,
                          classTeacherId: selectedId,
                          disciplineName: selected?.disciplineName || '',
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Selecione...</option>
                      {classTeacherOptions.map((opt) => (
                        <option key={opt.classTeacherId} value={opt.classTeacherId}>
                          {opt.disciplineName} ({opt.disciplineCode}) - {opt.teacherName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia da Semana
                    </label>
                    <select
                      value={newSchedule.dayOfWeek}
                      onChange={(e) =>
                        setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value as DayOfWeek })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Início
                    </label>
                    <input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Término
                    </label>
                    <input
                      type="time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Button onClick={handleAddSchedule} loading={saving} disabled={saving}>
                    <Plus size={16} />
                    Adicionar Horário
                  </Button>
                </div>
              </div>

              {/* Grade de horários */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Grade de Horários
                </h3>

                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySchedules = schedulesByDay[day.value];

                    return (
                      <div key={day.value} className="border border-gray-200 rounded-lg bg-white">
                        <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-900 rounded-t-lg">
                          {day.label}
                        </div>
                        <div className="p-3">
                          {daySchedules.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Nenhum horário cadastrado</p>
                          ) : (
                            <div className="space-y-2">
                              {daySchedules.map((schedule) => {
                                const classTeacher = classTeacherOptions.find(
                                  (opt) => opt.classTeacherId === schedule.classTeacherId
                                );

                                return (
                                  <div
                                    key={schedule.id}
                                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {classTeacher?.disciplineName || 'Disciplina'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                                        {classTeacher && (
                                          <span className="ml-2 text-gray-500">
                                            • {classTeacher.teacherName}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSchedule(schedule.id)}
                                      disabled={saving}
                                      className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                                      title="Remover horário"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
