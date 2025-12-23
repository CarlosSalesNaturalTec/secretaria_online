/**
 * Arquivo: frontend/src/pages/admin/Students.tsx
 * Descrição: Página de listagem e gerenciamento de estudantes
 * Feature: feat-083 - Criar página Students (listagem e CRUD)
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-11-04
 * Atualizado em: 2025-12-01
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, KeyRound, AlertCircle, UserPlus, Search, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import Toast, { type ToastType } from '@/components/ui/Toast';
import { StudentForm } from '@/components/forms/StudentForm';
import StudentService, { type IStudentsPaginatedResponse } from '@/services/student.service';
import type { IStudent, IStudentCreateRequest, IStudentUpdateRequest } from '@/types/student.types';

type ModalType = 'create' | 'edit' | 'delete' | 'resetPassword' | 'createUser' | null;

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // Paginação e busca
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [matriculaFilter, setMatriculaFilter] = useState<string>('');
  const [matriculaInput, setMatriculaInput] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const itemsPerPage = 10;

  useEffect(() => {
    loadStudents();
  }, [currentPage, searchTerm, matriculaFilter, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: IStudentsPaginatedResponse = await StudentService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        matricula: matriculaFilter || undefined,
        status: statusFilter || undefined,
      });
      setStudents(data.students);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de estudantes';
      setError(errorMessage);
      console.error('[StudentsPage] Erro ao carregar estudantes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setMatriculaFilter(matriculaInput);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setMatriculaInput('');
    setMatriculaFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenCreateModal = () => {
    setSelectedStudent(null);
    setActiveModal('create');
  };

  const handleOpenEditModal = (student: IStudent) => {
    setSelectedStudent(student);
    setActiveModal('edit');
  };

  const handleOpenDeleteModal = (student: IStudent) => {
    setSelectedStudent(student);
    setActiveModal('delete');
  };

  const handleOpenResetPasswordModal = (student: IStudent) => {
    setSelectedStudent(student);
    setActiveModal('resetPassword');
  };

  const handleOpenCreateUserModal = (student: IStudent) => {
    setSelectedStudent(student);
    setActiveModal('createUser');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedStudent(null);
  };

  const handleCreate = async (data: IStudentCreateRequest | IStudentUpdateRequest) => {
    try {
      setIsSubmitting(true);
      await StudentService.create(data as IStudentCreateRequest);
      setToast({
        message: 'Estudante cadastrado com sucesso!',
        type: 'success',
      });
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar estudante';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentsPage] Erro ao criar estudante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: IStudentCreateRequest | IStudentUpdateRequest) => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.update(selectedStudent.id, data);
      setToast({
        message: 'Estudante atualizado com sucesso!',
        type: 'success',
      });
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar estudante';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentsPage] Erro ao atualizar estudante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.delete(selectedStudent.id);
      setToast({
        message: 'Estudante removido com sucesso!',
        type: 'success',
      });
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover estudante';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentsPage] Erro ao deletar estudante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.resetPassword(selectedStudent.id);
      setToast({
        message: 'Senha provisória regenerada e enviada para o email!',
        type: 'success',
      });
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao regenerar senha';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentsPage] Erro ao resetar senha:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async () => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.createUserForStudent(selectedStudent.id);
      setToast({
        message: 'Usuário criado com sucesso! As credenciais foram enviadas por email.',
        type: 'success',
      });
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao criar usuário';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentsPage] Erro ao criar usuário:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<IStudent>[] = [
    {
      key: 'nome',
      header: 'Nome',
      accessor: (student) => student.nome || '-',
      sortable: true,
    },
    {
      key: 'course',
      header: 'Nome do Curso',
      accessor: (student) => {
        const enrollment = student.enrollments?.find(e => e.status === 'active') || student.enrollments?.[0];
        return enrollment?.course?.name || '-';
      },
    },
    {
      key: 'semester',
      header: 'Semestre',
      accessor: (student) => {
        const enrollment = student.enrollments?.find(e => e.status === 'active') || student.enrollments?.[0];
        return enrollment?.currentSemester ? `${enrollment.currentSemester}º` : '-';
      },
      align: 'center',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (student) => {
        const enrollment = student.enrollments?.find(e => e.status === 'active') || student.enrollments?.[0];
        const status = enrollment?.status || '-';

        const statusMap: Record<string, { label: string; color: string }> = {
          'active': { label: 'Ativo', color: 'bg-green-100 text-green-800' },
          'inactive': { label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
          'suspended': { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
          'graduated': { label: 'Concluído', color: 'bg-blue-100 text-blue-800' },
          'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
          'pending': { label: 'Pendente', color: 'bg-orange-100 text-orange-800' },
          'reenrollment': { label: 'Rematrícula', color: 'bg-purple-100 text-purple-800' },
          'completed': { label: 'Concluído', color: 'bg-blue-100 text-blue-800' },
        };

        const statusInfo = statusMap[status] || { label: '-', color: 'bg-gray-100 text-gray-800' };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        );
      },
      align: 'center',
    },
    {
      key: 'matricula',
      header: 'Matrícula',
      accessor: (student) => student.matricula || '-',
      align: 'center',
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (student) => (
        <div className="flex items-center justify-end gap-2">
          {/* Botão Gerenciar Cursos */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/admin/students/${student.id}/courses`)}
            title="Gerenciar cursos do estudante"
          >
            <BookOpen size={16} />
          </Button>

          {/* Botão Ver Notas */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/admin/students/${student.id}/grades`)}
            title="Ver notas do estudante"
          >
            <GraduationCap size={16} />
          </Button>

          {/* Botão Criar Usuário - só aparece se não tiver usuário */}
          {!student.user && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenCreateUserModal(student)}
              title="Criar usuário para este estudante"
            >
              <UserPlus size={16} />
            </Button>
          )}

          {/* Botão Reset Senha - só aparece se tiver usuário */}
          {student.user && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenResetPasswordModal(student)}
              title="Resetar senha"
            >
              <KeyRound size={16} />
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenEditModal(student)}
            title="Editar estudante"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDeleteModal(student)}
            title="Remover estudante"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      align: 'right',
      cellClassName: 'w-80',
    },
  ];

  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Erro ao carregar estudantes
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadStudents}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estudantes</h1>
          <p className="text-gray-600 mt-2">
            Gerencie o cadastro de estudantes do sistema
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Novo Estudante
        </Button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <input
              type="text"
              placeholder="Matrícula..."
              value={matriculaInput}
              onChange={(e) => setMatriculaInput(e.target.value)}
              className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="active">Ativo</option>
              <option value="cancelled">Cancelado</option>
              <option value="reenrollment">Rematrícula</option>
              <option value="completed">Concluído</option>
            </select>
            <Button type="submit" variant="primary">
              Buscar
            </Button>
            {(searchTerm || matriculaFilter || statusFilter) && (
              <Button type="button" variant="secondary" onClick={handleClearSearch}>
                Limpar
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Tabela de estudantes */}
      <Table
        data={students}
        columns={columns}
        loading={loading}
        emptyMessage={
          searchTerm
            ? `Nenhum estudante encontrado com "${searchTerm}"`
            : 'Nenhum estudante cadastrado'
        }
        getRowKey={(student) => student.id}
        hoverable
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        title="Cadastrar novo estudante"
        description="Preencha os dados do estudante abaixo"
        size="lg"
      >
        <StudentForm
          onSubmit={handleCreate}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        title="Editar estudante"
        description="Atualize os dados do estudante abaixo"
        size="lg"
      >
        <StudentForm
          initialData={selectedStudent || undefined}
          onSubmit={handleUpdate}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={activeModal === 'delete'}
        onClose={handleCloseModal}
        title="Confirmar exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja remover o estudante{' '}
            <strong>{selectedStudent?.nome}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirmar exclusão
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação de reset de senha */}
      <Modal
        isOpen={activeModal === 'resetPassword'}
        onClose={handleCloseModal}
        title="Resetar senha"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Deseja regenerar a senha provisória do estudante{' '}
            <strong>{selectedStudent?.nome}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Uma nova senha provisória será gerada e enviada para o email{' '}
            <strong>{selectedStudent?.email}</strong>.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirmar reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação de criação de usuário */}
      <Modal
        isOpen={activeModal === 'createUser'}
        onClose={handleCloseModal}
        title="Criar usuário"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Deseja criar um usuário de acesso para o estudante{' '}
            <strong>{selectedStudent?.nome}</strong>?
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Login:</strong> {selectedStudent?.matricula || 'Matrícula'}<br />
              <strong>Senha provisória:</strong> Matrícula do estudante<br />
              <strong>Email:</strong> {selectedStudent?.email || '-'}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Um email será enviado para o estudante com as credenciais de acesso.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Criar Usuário
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast de notificação */}
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
