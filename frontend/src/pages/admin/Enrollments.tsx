/**
 * Arquivo: frontend/src/pages/admin/Enrollments.tsx
 * Descrição: Página de listagem e gerenciamento de matrículas de alunos em cursos
 * Feature: feat-106 - Gerenciar matrículas de alunos em cursos (Frontend)
 * Criado em: 2025-11-09
 *
 * Responsabilidades:
 * - Exibir tabela de matrículas cadastradas
 * - Permitir criação de nova matrícula via modal
 * - Permitir edição de matrícula existente via modal
 * - Permitir exclusão de matrícula com confirmação
 * - Filtrar matrículas por status
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Filter } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast, { type ToastType } from '@/components/ui/Toast';
import { EnrollmentForm, type EnrollmentFormData } from '@/components/forms/EnrollmentForm';
import {
  useEnrollments,
  useCreateEnrollment,
  useUpdateEnrollment,
  useDeleteEnrollment,
} from '@/hooks/useEnrollments';
import StudentService from '@/services/student.service';
import CourseService from '@/services/course.service';
import type { IEnrollment } from '@/types/enrollment.types';
import type { IUser } from '@/types/user.types';
import type { ICourse } from '@/types/course.types';

/**
 * Tipo de modal ativo
 */
type ModalType = 'create' | 'edit' | 'delete' | null;

/**
 * Status disponíveis para filtro
 */
const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'pending', label: 'Aguardando Confirmação' },
  { value: 'active', label: 'Ativa' },
  { value: 'cancelled', label: 'Cancelada' },
];

/**
 * Formata data para exibição
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

/**
 * Retorna badge de status com cores apropriadas
 */
function getStatusBadge(status: string) {
  const badges: Record<string, { bg: string; text: string; label: string }> =
    {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Aguardando',
      },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativa' },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Cancelada',
      },
    };

  const badge = badges[status] || badges.pending;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}

/**
 * EnrollmentsPage - Página de gerenciamento de matrículas
 *
 * Responsabilidades:
 * - Carregar e exibir lista de matrículas
 * - Gerenciar modais de criação, edição e exclusão
 * - Integrar com hooks de matrículas para operações CRUD
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de matrículas
 */
export default function AdminEnrollments() {
  // Estado dos dados
  const [students, setStudents] = useState<IUser[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<IEnrollment | null>(null);

  // Estado de feedback
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // Queries e mutations
  const { data: enrollments = [], isLoading: isLoadingEnrollments, error: enrollmentsError } =
    useEnrollments();

  // Log para debug
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[EnrollmentsPage] Matrículas atualizadas:', enrollments);
      console.log('[EnrollmentsPage] Loading:', isLoadingEnrollments);
      console.log('[EnrollmentsPage] Error:', enrollmentsError);
    }
  }, [enrollments, isLoadingEnrollments, enrollmentsError]);

  const {
    mutate: createEnrollment,
    isPending: isCreating,
    error: createError,
  } = useCreateEnrollment();
  const {
    mutate: updateEnrollment,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateEnrollment();
  const { mutate: deleteEnrollment, isPending: isDeleting } =
    useDeleteEnrollment();

  // Carregar alunos e cursos ao montar
  useEffect(() => {
    loadStudentsAndCourses();
  }, []);

  /**
   * Carrega lista de alunos e cursos
   */
  const loadStudentsAndCourses = async () => {
    try {
      const [studentsData, coursesData] = await Promise.all([
        StudentService.getAll(),
        CourseService.getAll(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('[EnrollmentsPage] Erro ao carregar dados:', error);
      showToast('Erro ao carregar alunos e cursos', 'error');
    }
  };

  /**
   * Exibe toast de feedback
   */
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  /**
   * Abre modal de criação
   */
  const handleOpenCreate = () => {
    setSelectedEnrollment(null);
    setActiveModal('create');
  };

  /**
   * Abre modal de edição
   */
  const handleOpenEdit = (enrollment: IEnrollment) => {
    setSelectedEnrollment(enrollment);
    setActiveModal('edit');
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleOpenDelete = (enrollment: IEnrollment) => {
    setSelectedEnrollment(enrollment);
    setActiveModal('delete');
  };

  /**
   * Submete criação de matrícula
   */
  const handleCreateSubmit = async (data: EnrollmentFormData) => {
    try {
      createEnrollment(data, {
        onSuccess: () => {
          showToast('Matrícula criada com sucesso!', 'success');
          setActiveModal(null);
          setSelectedEnrollment(null);
        },
        onError: (error) => {
          showToast(
            error instanceof Error ? error.message : 'Erro ao criar matrícula',
            'error'
          );
        },
      });
    } catch (error) {
      console.error('[EnrollmentsPage] Erro ao criar:', error);
    }
  };

  /**
   * Submete edição de matrícula
   */
  const handleEditSubmit = async (data: EnrollmentFormData) => {
    if (!selectedEnrollment) return;

    try {
      updateEnrollment(
        { id: selectedEnrollment.id, data },
        {
          onSuccess: () => {
            showToast('Matrícula atualizada com sucesso!', 'success');
            setActiveModal(null);
            setSelectedEnrollment(null);
          },
          onError: (error) => {
            showToast(
              error instanceof Error
                ? error.message
                : 'Erro ao atualizar matrícula',
              'error'
            );
          },
        }
      );
    } catch (error) {
      console.error('[EnrollmentsPage] Erro ao editar:', error);
    }
  };

  /**
   * Confirma e deleta matrícula
   */
  const handleConfirmDelete = () => {
    if (!selectedEnrollment) return;

    deleteEnrollment(selectedEnrollment.id, {
      onSuccess: () => {
        showToast('Matrícula deletada com sucesso!', 'success');
        setActiveModal(null);
        setSelectedEnrollment(null);
      },
      onError: (error) => {
        showToast(
          error instanceof Error ? error.message : 'Erro ao deletar matrícula',
          'error'
        );
      },
    });
  };

  /**
   * Filtra matrículas por status
   */
  const filteredEnrollments = statusFilter
    ? enrollments.filter((e) => e.status === statusFilter)
    : enrollments;

  /**
   * Colunas da tabela
   */
  const columns: Column<IEnrollment>[] = [
    {
      key: 'id',
      header: 'ID',
      accessor: (row) => row.id,
    },
    {
      key: 'student',
      header: 'Aluno',
      accessor: (row) => {
        const student = students.find((s) => s.id === row.studentId);
        return student?.name || 'N/A';
      },
    },
    {
      key: 'course',
      header: 'Curso',
      accessor: (row) => {
        const course = courses.find((c) => c.id === row.courseId);
        return course?.name || 'N/A';
      },
    },
    {
      key: 'enrollmentDate',
      header: 'Data de Matrícula',
      accessor: (row) => formatDate(row.enrollmentDate),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            disabled={isUpdating || isDeleting}
            title="Editar matrícula"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenDelete(row)}
            disabled={isDeleting}
            title="Deletar matrícula"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Matrículas</h1>
        <p className="text-gray-600 mt-2">
          Gerenciar matrículas de alunos em cursos
        </p>
      </div>

      {/* Toast de notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Botão de criar */}
        <Button
          onClick={handleOpenCreate}
          disabled={isCreating || students.length === 0 || courses.length === 0}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Matrícula
        </Button>

        {/* Filtro por status */}
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info de quantidade */}
        <div className="text-sm text-gray-600 sm:ml-auto">
          {filteredEnrollments.length} matrícula(s)
        </div>
      </div>

      {/* Avisos e erros */}
      {students.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-yellow-700 flex-shrink-0" />
          <p className="text-yellow-700 text-sm">
            Nenhum aluno cadastrado. Crie alunos antes de criar matrículas.
          </p>
        </div>
      )}

      {courses.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-yellow-700 flex-shrink-0" />
          <p className="text-yellow-700 text-sm">
            Nenhum curso cadastrado. Crie cursos antes de criar matrículas.
          </p>
        </div>
      )}

      {createError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-700 flex-shrink-0" />
          <p className="text-red-700 text-sm">
            Erro ao criar matrícula:{' '}
            {createError instanceof Error
              ? createError.message
              : 'Erro desconhecido'}
          </p>
        </div>
      )}

      {updateError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-700 flex-shrink-0" />
          <p className="text-red-700 text-sm">
            Erro ao atualizar matrícula:{' '}
            {updateError instanceof Error
              ? updateError.message
              : 'Erro desconhecido'}
          </p>
        </div>
      )}

      {/* Tabela de matrículas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoadingEnrollments ? (
          <div className="p-8 text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Carregando matrículas...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle
              size={40}
              className="mx-auto text-gray-400 mb-4"
            />
            <p className="text-gray-600">Nenhuma matrícula encontrada</p>
          </div>
        ) : (
          <Table<IEnrollment>
            columns={columns}
            data={filteredEnrollments}
            striped
          />
        )}
      </div>

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={() => setActiveModal(null)}
        title="Criar Nova Matrícula"
        size="md"
      >
        <EnrollmentForm
          students={students}
          courses={courses}
          onSubmit={handleCreateSubmit}
          isLoading={isCreating}
          error={
            createError instanceof Error ? createError.message : null
          }
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={activeModal === 'edit' && !!selectedEnrollment}
        onClose={() => setActiveModal(null)}
        title="Editar Matrícula"
        size="md"
      >
        {selectedEnrollment && (
          <EnrollmentForm
            initialData={selectedEnrollment}
            students={students}
            courses={courses}
            onSubmit={handleEditSubmit}
            isLoading={isUpdating}
            error={
              updateError instanceof Error ? updateError.message : null
            }
          />
        )}
      </Modal>

      {/* Modal de confirmação de exclusão */}
      {activeModal === 'delete' && selectedEnrollment && (
        <ConfirmModal
          onCancel={() => setActiveModal(null)}
          onConfirm={handleConfirmDelete}
          title="Deletar Matrícula"
          message={`Tem certeza que deseja deletar a matrícula de "${
            students.find((s) => s.id === selectedEnrollment.studentId)?.name ||
            'Desconhecido'
          }"? Esta ação não pode ser desfeita.`}
          isLoading={isDeleting}
          type="danger"
          confirmText="Deletar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}
