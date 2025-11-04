/**
 * Arquivo: frontend/src/pages/admin/Teachers.tsx
 * Descrição: Página de listagem e gerenciamento de professores (CRUD completo)
 * Feature: feat-084 - Criar teacher.service.ts e página Teachers
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir tabela de professores cadastrados
 * - Permitir criação de novo professor via modal
 * - Permitir edição de professor existente via modal
 * - Permitir exclusão de professor com confirmação
 * - Permitir reset de senha provisória
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, KeyRound, AlertCircle } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TeacherForm } from '@/components/forms/TeacherForm';
import TeacherService from '@/services/teacher.service';
import type { IUser } from '@/types/user.types';
import type { ICreateTeacherData, IUpdateTeacherData } from '@/services/teacher.service';

/**
 * Tipo de modal ativo
 */
type ModalType = 'create' | 'edit' | 'delete' | 'resetPassword' | null;

/**
 * TeachersPage - Página de gerenciamento de professores
 *
 * Responsabilidades:
 * - Carregar e exibir lista de professores
 * - Gerenciar modais de criação, edição, exclusão e reset de senha
 * - Integrar com teacher.service para operações CRUD
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de professores
 */
export default function TeachersPage() {
  // Estado da lista de professores
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<IUser | null>(null);

  // Estado de operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carrega lista de professores ao montar o componente
   */
  useEffect(() => {
    loadTeachers();
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
   * Carrega lista de professores da API
   */
  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TeacherService.getAll();
      setTeachers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de professores';
      setError(errorMessage);
      console.error('[TeachersPage] Erro ao carregar professores:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre modal de criação
   */
  const handleOpenCreateModal = () => {
    setSelectedTeacher(null);
    setActiveModal('create');
  };

  /**
   * Abre modal de edição
   */
  const handleOpenEditModal = (teacher: IUser) => {
    setSelectedTeacher(teacher);
    setActiveModal('edit');
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleOpenDeleteModal = (teacher: IUser) => {
    setSelectedTeacher(teacher);
    setActiveModal('delete');
  };

  /**
   * Abre modal de confirmação de reset de senha
   */
  const handleOpenResetPasswordModal = (teacher: IUser) => {
    setSelectedTeacher(teacher);
    setActiveModal('resetPassword');
  };

  /**
   * Fecha todos os modais
   */
  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedTeacher(null);
  };

  /**
   * Handler de criação de professor
   */
  const handleCreate = async (data: ICreateTeacherData | IUpdateTeacherData) => {
    try {
      setIsSubmitting(true);
      await TeacherService.create(data as ICreateTeacherData);
      setSuccessMessage('Professor cadastrado com sucesso!');
      handleCloseModal();
      await loadTeachers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar professor';
      alert(errorMessage);
      console.error('[TeachersPage] Erro ao criar professor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de atualização de professor
   */
  const handleUpdate = async (data: ICreateTeacherData | IUpdateTeacherData) => {
    if (!selectedTeacher) return;

    try {
      setIsSubmitting(true);
      await TeacherService.update(selectedTeacher.id, data);
      setSuccessMessage('Professor atualizado com sucesso!');
      handleCloseModal();
      await loadTeachers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar professor';
      alert(errorMessage);
      console.error('[TeachersPage] Erro ao atualizar professor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de exclusão de professor
   */
  const handleDelete = async () => {
    if (!selectedTeacher) return;

    try {
      setIsSubmitting(true);
      await TeacherService.delete(selectedTeacher.id);
      setSuccessMessage('Professor removido com sucesso!');
      handleCloseModal();
      await loadTeachers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover professor';
      alert(errorMessage);
      console.error('[TeachersPage] Erro ao deletar professor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de reset de senha
   */
  const handleResetPassword = async () => {
    if (!selectedTeacher) return;

    try {
      setIsSubmitting(true);
      await TeacherService.resetPassword(selectedTeacher.id);
      setSuccessMessage(
        'Senha provisória regenerada e enviada para o email do professor!'
      );
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao regenerar senha';
      alert(errorMessage);
      console.error('[TeachersPage] Erro ao resetar senha:', err);
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
      accessor: (teacher) => teacher.name,
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (teacher) => teacher.email,
      sortable: true,
    },
    {
      key: 'login',
      header: 'Login',
      accessor: (teacher) => teacher.login,
      sortable: true,
    },
    {
      key: 'cpf',
      header: 'CPF',
      accessor: (teacher) => formatCPF(teacher.cpf),
      align: 'center',
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (teacher) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenEditModal(teacher)}
            title="Editar professor"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenResetPasswordModal(teacher)}
            title="Resetar senha"
          >
            <KeyRound size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDeleteModal(teacher)}
            title="Remover professor"
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
              Erro ao carregar professores
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadTeachers}
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
          <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
          <p className="text-gray-600 mt-2">
            Gerencie o cadastro de professores do sistema
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Novo professor
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

      {/* Tabela de professores */}
      <Table
        data={teachers}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum professor cadastrado"
        getRowKey={(teacher) => teacher.id}
        hoverable
      />

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        title="Cadastrar novo professor"
        description="Preencha os dados do professor abaixo"
        size="lg"
      >
        <TeacherForm
          onSubmit={handleCreate}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        title="Editar professor"
        description="Atualize os dados do professor abaixo"
        size="lg"
      >
        <TeacherForm
          initialData={selectedTeacher || undefined}
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
            Tem certeza que deseja remover o professor{' '}
            <strong>{selectedTeacher?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita. O professor será removido do sistema
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
            Deseja regenerar a senha provisória do professor{' '}
            <strong>{selectedTeacher?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Uma nova senha provisória será gerada e enviada para o email{' '}
            <strong>{selectedTeacher?.email}</strong>. O professor deverá alterá-la
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
