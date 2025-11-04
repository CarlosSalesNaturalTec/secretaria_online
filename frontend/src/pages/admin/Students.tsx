/**
 * Arquivo: frontend/src/pages/admin/Students.tsx
 * Descrição: Página de listagem e gerenciamento de alunos (CRUD completo)
 * Feature: feat-083 - Criar página Students (listagem e CRUD)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir tabela de alunos cadastrados
 * - Permitir criação de novo aluno via modal
 * - Permitir edição de aluno existente via modal
 * - Permitir exclusão de aluno com confirmação
 * - Permitir reset de senha provisória
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, KeyRound, AlertCircle } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StudentForm } from '@/components/forms/StudentForm';
import StudentService from '@/services/student.service';
import type { IUser } from '@/types/user.types';
import type { ICreateStudentData, IUpdateStudentData } from '@/services/student.service';

/**
 * Tipo de modal ativo
 */
type ModalType = 'create' | 'edit' | 'delete' | 'resetPassword' | null;

/**
 * StudentsPage - Página de gerenciamento de alunos
 *
 * Responsabilidades:
 * - Carregar e exibir lista de alunos
 * - Gerenciar modais de criação, edição, exclusão e reset de senha
 * - Integrar com student.service para operações CRUD
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de alunos
 */
export default function StudentsPage() {
  // Estado da lista de alunos
  const [students, setStudents] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStudent, setSelectedStudent] = useState<IUser | null>(null);

  // Estado de operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carrega lista de alunos ao montar o componente
   */
  useEffect(() => {
    loadStudents();
  }, []);

  /**
   * Remove mensagem de sucesso após 5 segundos
   */
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Carrega lista de alunos da API
   */
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StudentService.getAll();
      setStudents(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de alunos';
      setError(errorMessage);
      console.error('[StudentsPage] Erro ao carregar alunos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre modal de criação
   */
  const handleOpenCreateModal = () => {
    setSelectedStudent(null);
    setActiveModal('create');
  };

  /**
   * Abre modal de edição
   */
  const handleOpenEditModal = (student: IUser) => {
    setSelectedStudent(student);
    setActiveModal('edit');
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleOpenDeleteModal = (student: IUser) => {
    setSelectedStudent(student);
    setActiveModal('delete');
  };

  /**
   * Abre modal de confirmação de reset de senha
   */
  const handleOpenResetPasswordModal = (student: IUser) => {
    setSelectedStudent(student);
    setActiveModal('resetPassword');
  };

  /**
   * Fecha todos os modais
   */
  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedStudent(null);
  };

  /**
   * Handler de criação de aluno
   */
  const handleCreate = async (data: ICreateStudentData | IUpdateStudentData) => {
    try {
      setIsSubmitting(true);
      await StudentService.create(data as ICreateStudentData);
      setSuccessMessage('Aluno cadastrado com sucesso!');
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar aluno';
      alert(errorMessage);
      console.error('[StudentsPage] Erro ao criar aluno:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de atualização de aluno
   */
  const handleUpdate = async (data: ICreateStudentData | IUpdateStudentData) => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.update(selectedStudent.id, data);
      setSuccessMessage('Aluno atualizado com sucesso!');
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar aluno';
      alert(errorMessage);
      console.error('[StudentsPage] Erro ao atualizar aluno:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de exclusão de aluno
   */
  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.delete(selectedStudent.id);
      setSuccessMessage('Aluno removido com sucesso!');
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover aluno';
      alert(errorMessage);
      console.error('[StudentsPage] Erro ao deletar aluno:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de reset de senha
   */
  const handleResetPassword = async () => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await StudentService.resetPassword(selectedStudent.id);
      setSuccessMessage(
        'Senha provisória regenerada e enviada para o email do aluno!'
      );
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao regenerar senha';
      alert(errorMessage);
      console.error('[StudentsPage] Erro ao resetar senha:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Formata CPF para exibição
   */
  const formatCPF = (cpf: string): string => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  /**
   * Definição das colunas da tabela
   */
  const columns: Column<IUser>[] = [
    {
      key: 'name',
      header: 'Nome',
      accessor: (student) => student.name,
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (student) => student.email,
      sortable: true,
    },
    {
      key: 'login',
      header: 'Login',
      accessor: (student) => student.login,
      sortable: true,
    },
    {
      key: 'cpf',
      header: 'CPF',
      accessor: (student) => formatCPF(student.cpf),
      align: 'center',
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (student) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenEditModal(student)}
            title="Editar aluno"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenResetPasswordModal(student)}
            title="Resetar senha"
          >
            <KeyRound size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDeleteModal(student)}
            title="Remover aluno"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      align: 'right',
      cellClassName: 'w-48',
    },
  ];

  /**
   * Renderiza estado de erro
   */
  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Erro ao carregar alunos
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

  /**
   * Renderiza página principal
   */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie o cadastro de alunos do sistema
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Novo aluno
        </Button>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-1">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Tabela de alunos */}
      <Table
        data={students}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum aluno cadastrado"
        getRowKey={(student) => student.id}
        hoverable
      />

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        title="Cadastrar novo aluno"
        description="Preencha os dados do aluno abaixo"
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
        title="Editar aluno"
        description="Atualize os dados do aluno abaixo"
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
            Tem certeza que deseja remover o aluno{' '}
            <strong>{selectedStudent?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita. O aluno será removido do sistema
            e perderá acesso à plataforma.
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
            Deseja regenerar a senha provisória do aluno{' '}
            <strong>{selectedStudent?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Uma nova senha provisória será gerada e enviada para o email{' '}
            <strong>{selectedStudent?.email}</strong>. O aluno deverá alterá-la
            no próximo acesso.
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
    </div>
  );
}
