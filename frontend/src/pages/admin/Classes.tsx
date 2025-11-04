/**
 * Arquivo: frontend/src/pages/admin/Classes.tsx
 * Descrição: Página de listagem e gerenciamento de turmas (CRUD completo)
 * Feature: feat-086 - Criar class.service.ts e página Classes
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir tabela de turmas cadastradas
 * - Permitir criação de nova turma via modal
 * - Permitir edição de turma existente via modal
 * - Permitir exclusão de turma com confirmação
 * - Exibir informações de curso, professores e alunos vinculados
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Users, GraduationCap } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ClassForm } from '@/components/forms/ClassForm';
import ClassService from '@/services/class.service';
import type { IClass } from '@/types/class.types';
import type { ICreateClassData, IUpdateClassData } from '@/services/class.service';

/**
 * Tipo de modal ativo
 */
type ModalType = 'create' | 'edit' | 'delete' | 'viewDetails' | null;

/**
 * ClassesPage - Página de gerenciamento de turmas
 *
 * Responsabilidades:
 * - Carregar e exibir lista de turmas
 * - Gerenciar modais de criação, edição e exclusão
 * - Integrar com class.service para operações CRUD
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de turmas
 */
export default function ClassesPage() {
  // Estado da lista de turmas
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

  // Estado de operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carrega lista de turmas ao montar o componente
   */
  useEffect(() => {
    loadClasses();
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
   * Carrega lista de turmas da API
   */
  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ClassService.getAll();
      setClasses(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de turmas';
      setError(errorMessage);
      console.error('[ClassesPage] Erro ao carregar turmas:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre modal de criação
   */
  const handleOpenCreateModal = () => {
    setSelectedClass(null);
    setActiveModal('create');
  };

  /**
   * Abre modal de edição
   */
  const handleOpenEditModal = (classData: IClass) => {
    setSelectedClass(classData);
    setActiveModal('edit');
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleOpenDeleteModal = (classData: IClass) => {
    setSelectedClass(classData);
    setActiveModal('delete');
  };

  /**
   * Abre modal de detalhes
   */
  const handleOpenDetailsModal = (classData: IClass) => {
    setSelectedClass(classData);
    setActiveModal('viewDetails');
  };

  /**
   * Fecha todos os modais
   */
  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedClass(null);
  };

  /**
   * Handler de criação de turma
   */
  const handleCreate = async (data: ICreateClassData | IUpdateClassData) => {
    try {
      setIsSubmitting(true);
      await ClassService.create(data as ICreateClassData);
      setSuccessMessage('Turma cadastrada com sucesso!');
      handleCloseModal();
      await loadClasses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar turma';
      alert(errorMessage);
      console.error('[ClassesPage] Erro ao criar turma:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de atualização de turma
   */
  const handleUpdate = async (data: ICreateClassData | IUpdateClassData) => {
    if (!selectedClass) return;

    try {
      setIsSubmitting(true);
      await ClassService.update(selectedClass.id, data);
      setSuccessMessage('Turma atualizada com sucesso!');
      handleCloseModal();
      await loadClasses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar turma';
      alert(errorMessage);
      console.error('[ClassesPage] Erro ao atualizar turma:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de exclusão de turma
   */
  const handleDelete = async () => {
    if (!selectedClass) return;

    try {
      setIsSubmitting(true);
      await ClassService.delete(selectedClass.id);
      setSuccessMessage('Turma removida com sucesso!');
      handleCloseModal();
      await loadClasses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover turma';
      alert(errorMessage);
      console.error('[ClassesPage] Erro ao deletar turma:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Formata identificação da turma
   */
  const formatClassIdentifier = (classData: IClass): string => {
    return `${classData.semester}º semestre - ${classData.year}`;
  };

  /**
   * Conta total de alunos na turma
   */
  const countStudents = (classData: IClass): number => {
    return classData.students?.length || 0;
  };

  /**
   * Conta total de professores na turma
   */
  const countTeachers = (classData: IClass): number => {
    return classData.teachers?.length || 0;
  };

  /**
   * Definição das colunas da tabela
   */
  const columns: Column<IClass>[] = [
    {
      key: 'course',
      header: 'Curso',
      accessor: (classData) => classData.course?.name || '-',
      sortable: true,
    },
    {
      key: 'period',
      header: 'Período',
      accessor: (classData) => formatClassIdentifier(classData),
      sortable: true,
      align: 'center',
    },
    {
      key: 'teachers',
      header: 'Professores',
      accessor: (classData) => (
        <div className="flex items-center justify-center gap-2">
          <GraduationCap size={16} className="text-gray-600" />
          <span>{countTeachers(classData)}</span>
        </div>
      ),
      align: 'center',
    },
    {
      key: 'students',
      header: 'Alunos',
      accessor: (classData) => (
        <div className="flex items-center justify-center gap-2">
          <Users size={16} className="text-gray-600" />
          <span>{countStudents(classData)}</span>
        </div>
      ),
      align: 'center',
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (classData) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenDetailsModal(classData)}
            title="Ver detalhes"
          >
            <Users size={16} />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenEditModal(classData)}
            title="Editar turma"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDeleteModal(classData)}
            title="Remover turma"
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
              Erro ao carregar turmas
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadClasses}
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
          <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as turmas do sistema e vincule professores e alunos
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Nova turma
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

      {/* Tabela de turmas */}
      <Table
        data={classes}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhuma turma cadastrada"
        getRowKey={(classData) => classData.id}
        hoverable
      />

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        title="Cadastrar nova turma"
        description="Preencha os dados da turma e vincule professores e alunos"
        size="lg"
      >
        <ClassForm
          onSubmit={handleCreate}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        title="Editar turma"
        description="Atualize os dados da turma abaixo"
        size="lg"
      >
        <ClassForm
          initialData={selectedClass || undefined}
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
            Tem certeza que deseja remover a turma{' '}
            <strong>{selectedClass?.course?.name}</strong> -{' '}
            <strong>{selectedClass && formatClassIdentifier(selectedClass)}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita. A turma será removida do sistema.
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

      {/* Modal de detalhes */}
      <Modal
        isOpen={activeModal === 'viewDetails'}
        onClose={handleCloseModal}
        title="Detalhes da Turma"
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Informações básicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Curso:</span>
                  <p className="font-medium text-gray-900">{selectedClass.course?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Período:</span>
                  <p className="font-medium text-gray-900">{formatClassIdentifier(selectedClass)}</p>
                </div>
              </div>
            </div>

            {/* Professores */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap size={20} />
                Professores ({countTeachers(selectedClass)})
              </h4>
              {selectedClass.teachers && selectedClass.teachers.length > 0 ? (
                <div className="space-y-2">
                  {selectedClass.teachers.map((ct) => (
                    <div key={ct.id} className="bg-gray-50 rounded-md p-3">
                      <p className="font-medium text-gray-900">{ct.teacher?.name || 'Nome não disponível'}</p>
                      <p className="text-sm text-gray-600">
                        Disciplina: {ct.discipline?.name || 'Não informada'} ({ct.discipline?.code || '-'})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">Nenhum professor vinculado</p>
              )}
            </div>

            {/* Alunos */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={20} />
                Alunos ({countStudents(selectedClass)})
              </h4>
              {selectedClass.students && selectedClass.students.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedClass.students.map((cs) => (
                    <div key={cs.id} className="bg-gray-50 rounded-md p-3">
                      <p className="font-medium text-gray-900">{cs.student?.name || 'Nome não disponível'}</p>
                      <p className="text-sm text-gray-600">{cs.student?.email || 'Email não disponível'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">Nenhum aluno vinculado</p>
              )}
            </div>

            {/* Botão Fechar */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
