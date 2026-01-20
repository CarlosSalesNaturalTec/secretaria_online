/**
 * Arquivo: frontend/src/pages/admin/ClassSchedules.tsx
 * Descrição: Página admin para gerenciar grade de horários de uma turma
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-19
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Toast, { type ToastType } from '@/components/ui/Toast';
import { ClassScheduleForm } from '@/components/forms/ClassScheduleForm';
import { WeekScheduleGrid } from '@/components/schedules/WeekScheduleGrid';
import {
  useWeekSchedule,
  useCreateClassSchedule,
  useUpdateClassSchedule,
  useDeleteClassSchedule,
} from '@/hooks/useClassSchedule';
import type { IClassSchedule, IClassScheduleFormData } from '@/types/classSchedule.types';
import ClassService from '@/services/class.service';
import DisciplineService from '@/services/discipline.service';
import TeacherService from '@/services/teacher.service';
import type { IClass } from '@/types/class.types';
import type { IDiscipline } from '@/types/course.types';
import type { ITeacher } from '@/types/teacher.types';

type ModalType = 'create' | 'edit' | null;

export default function ClassSchedulesPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const numericClassId = Number(classId);

  // Estados locais
  const [classInfo, setClassInfo] = useState<IClass | null>(null);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<IClassSchedule | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Hooks de dados
  const { data: weekSchedule, isLoading, error } = useWeekSchedule(numericClassId);
  const createMutation = useCreateClassSchedule();
  const updateMutation = useUpdateClassSchedule();
  const deleteMutation = useDeleteClassSchedule();

  // Carregar dados iniciais
  useEffect(() => {
    if (!numericClassId || isNaN(numericClassId)) {
      navigate('/admin/classes');
      return;
    }
    loadInitialData();
  }, [numericClassId]);

  const loadInitialData = async () => {
    try {
      const [classData, disciplinesResponse, teachersData] = await Promise.all([
        ClassService.getById(numericClassId),
        DisciplineService.getAll(),
        TeacherService.getAll(),
      ]);
      setClassInfo(classData);
      setDisciplines(disciplinesResponse.data);
      setTeachers(teachersData);
    } catch (err) {
      console.error('[ClassSchedulesPage] Erro ao carregar dados iniciais:', err);
      setToast({
        message: 'Erro ao carregar informações da turma',
        type: 'error',
      });
    }
  };

  // Handlers de modal
  const handleOpenCreateModal = () => {
    setSelectedSchedule(null);
    setActiveModal('create');
  };

  const handleOpenEditModal = (schedule: IClassSchedule) => {
    setSelectedSchedule(schedule);
    setActiveModal('edit');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedSchedule(null);
  };

  // Handler de criação
  const handleCreate = async (data: IClassScheduleFormData) => {
    try {
      await createMutation.mutateAsync({ classId: numericClassId, data });
      setToast({
        message: 'Horário adicionado com sucesso!',
        type: 'success',
      });
      handleCloseModal();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao adicionar horário';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  // Handler de atualização
  const handleUpdate = async (data: IClassScheduleFormData) => {
    if (!selectedSchedule) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedSchedule.id,
        data,
        classId: numericClassId,
      });
      setToast({
        message: 'Horário atualizado com sucesso!',
        type: 'success',
      });
      handleCloseModal();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao atualizar horário';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  // Handler de exclusão
  const handleDelete = async (schedule: IClassSchedule) => {
    if (!window.confirm(`Tem certeza que deseja remover o horário de ${schedule.discipline?.name}?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: schedule.id, classId: numericClassId });
      setToast({
        message: 'Horário removido com sucesso!',
        type: 'success',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao remover horário';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  // Converter weekSchedule para array
  const schedulesArray: IClassSchedule[] = weekSchedule
    ? Object.values(weekSchedule).flat()
    : [];

  // Debug: log para verificar dados
  if (import.meta.env.DEV) {
    console.log('[ClassSchedulesPage] weekSchedule:', weekSchedule);
    console.log('[ClassSchedulesPage] schedulesArray:', schedulesArray);
  }

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
          Erro ao carregar grade de horários: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/classes')}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar para Turmas
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar size={28} className="mr-2 text-blue-600" />
              Grade de Horários
            </h1>
            {classInfo && (
              <p className="text-gray-600 mt-1">
                {classInfo.course?.name} - {classInfo.semester}º Semestre ({classInfo.year})
              </p>
            )}
          </div>
          <Button variant="primary" onClick={handleOpenCreateModal}>
            <Plus size={20} className="mr-1" />
            Adicionar Horário
          </Button>
        </div>
      </div>

      {/* Grade de Horários */}
      <div className="bg-white rounded-lg shadow p-6">
        <WeekScheduleGrid
          schedules={schedulesArray}
          editable={true}
          showOnlineLinks={true}
          highlightExtra={false}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={activeModal === 'create' || activeModal === 'edit'}
        onClose={handleCloseModal}
        title={activeModal === 'edit' ? 'Editar Horário' : 'Adicionar Horário'}
        size="lg"
      >
        <ClassScheduleForm
          classId={numericClassId}
          disciplines={disciplines}
          teachers={teachers}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
          editingSchedule={selectedSchedule}
          onSubmit={activeModal === 'edit' ? handleUpdate : handleCreate}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
