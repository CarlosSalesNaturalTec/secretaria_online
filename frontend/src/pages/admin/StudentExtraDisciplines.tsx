/**
 * Arquivo: frontend/src/pages/admin/StudentExtraDisciplines.tsx
 * Descrição: Página admin para gerenciar disciplinas extras de um aluno
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-19
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Toast, { type ToastType } from '@/components/ui/Toast';
import { StudentExtraDisciplineForm } from '@/components/forms/StudentExtraDisciplineForm';
import { ExtraDisciplinesList } from '@/components/students/ExtraDisciplinesList';
import {
  useStudentExtraDisciplines,
  useCreateStudentExtraDiscipline,
  useDeleteStudentExtraDiscipline,
} from '@/hooks/useStudentExtraDiscipline';
import type { IStudentExtraDiscipline, IStudentExtraDisciplineFormData } from '@/types/studentExtraDiscipline.types';
import StudentService from '@/services/student.service';
import DisciplineService from '@/services/discipline.service';
import ClassService from '@/services/class.service';
import type { IStudent } from '@/types/student.types';
import type { IDiscipline } from '@/types/course.types';
import type { IClass } from '@/types/class.types';

export default function StudentExtraDisciplinesPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const numericStudentId = Number(studentId);

  // Estados locais
  const [studentInfo, setStudentInfo] = useState<IStudent | null>(null);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Hooks de dados
  const { data: extraDisciplines = [], isLoading, error } = useStudentExtraDisciplines(numericStudentId);
  const createMutation = useCreateStudentExtraDiscipline();
  const deleteMutation = useDeleteStudentExtraDiscipline();

  // Carregar dados iniciais
  useEffect(() => {
    if (!numericStudentId || isNaN(numericStudentId)) {
      navigate('/admin/students');
      return;
    }
    loadInitialData();
  }, [numericStudentId]);

  const loadInitialData = async () => {
    try {
      const [studentData, disciplinesResponse, classesData] = await Promise.all([
        StudentService.getById(numericStudentId),
        DisciplineService.getAll({ limit: 1000 }), // Carrega todas as disciplinas sem paginação
        ClassService.getAll(),
      ]);
      setStudentInfo(studentData);
      setDisciplines(disciplinesResponse.data);
      setClasses(classesData);
    } catch (err) {
      console.error('[StudentExtraDisciplinesPage] Erro ao carregar dados iniciais:', err);
      setToast({
        message: 'Erro ao carregar informações do aluno',
        type: 'error',
      });
    }
  };

  // Handlers de modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Handler de criação
  const handleCreate = async (data: IStudentExtraDisciplineFormData) => {
    try {
      await createMutation.mutateAsync({ studentId: numericStudentId, data });
      setToast({
        message: 'Disciplina extra adicionada com sucesso!',
        type: 'success',
      });
      handleCloseModal();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao adicionar disciplina extra';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  // Handler de exclusão
  const handleDelete = async (extraDiscipline: IStudentExtraDiscipline) => {
    try {
      await deleteMutation.mutateAsync({ id: extraDiscipline.id, studentId: numericStudentId });
      setToast({
        message: 'Disciplina extra removida com sucesso!',
        type: 'success',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao remover disciplina extra';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    }
  };

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
          Erro ao carregar disciplinas extras: {error.message}
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
          onClick={() => navigate('/admin/students')}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar para Alunos
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookMarked size={28} className="mr-2 text-blue-600" />
            Disciplinas Extras
          </h1>
          {studentInfo && (
            <p className="text-gray-600 mt-1">
              Aluno: {studentInfo.nome} {studentInfo.matricula ? `(Matrícula: ${studentInfo.matricula})` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Lista de Disciplinas Extras */}
      <div className="bg-white rounded-lg shadow p-6">
        <ExtraDisciplinesList
          studentId={numericStudentId}
          extraDisciplines={extraDisciplines}
          editable={true}
          onAdd={handleOpenModal}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de Adicionar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Adicionar Disciplina Extra"
        size="lg"
      >
        <StudentExtraDisciplineForm
          studentId={numericStudentId}
          disciplines={disciplines}
          classes={classes}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
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
