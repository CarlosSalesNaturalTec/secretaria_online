/**
 * Arquivo: frontend/src/pages/admin/Disciplines.tsx
 * Descrição: Página de listagem e gerenciamento de disciplinas (CRUD completo)
 * Feature: feat-111 - Implementar cadastro de disciplinas no frontend
 * Criado em: 2025-11-08
 *
 * Responsabilidades:
 * - Exibir tabela de disciplinas cadastradas
 * - Permitir criação de nova disciplina via modal
 * - Permitir edição de disciplina existente via modal
 * - Permitir exclusão de disciplina com confirmação
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, BookMarked, Search } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { DisciplineForm } from '@/components/forms/DisciplineForm';
import DisciplineService from '@/services/discipline.service';
import type { IDiscipline } from '@/types/course.types';
import type { ICreateDisciplineData, IUpdateDisciplineData } from '@/services/discipline.service';

/**
 * Tipo de modal ativo
 */
type ModalType = 'create' | 'edit' | 'delete' | null;

/**
 * DisciplinesPage - Página de gerenciamento de disciplinas
 *
 * Responsabilidades:
 * - Carregar e exibir lista de disciplinas
 * - Gerenciar modais de criação, edição e exclusão
 * - Integrar com discipline.service para operações CRUD
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de disciplinas
 */
export default function DisciplinesPage() {
  // Estado da lista de disciplinas
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

  // Estado de busca
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<IDiscipline | null>(null);

  // Estado de operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Debounce para busca (espera 500ms após usuário parar de digitar)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Carrega lista de disciplinas ao montar o componente ou quando mudar página/busca
   */
  useEffect(() => {
    loadDisciplines();
  }, [currentPage, debouncedSearch]);

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
   * Carrega lista de disciplinas da API com paginação e busca
   */
  const loadDisciplines = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DisciplineService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
      });
      setDisciplines(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de disciplinas';
      setError(errorMessage);
      console.error('[DisciplinesPage] Erro ao carregar disciplinas:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler de mudança de página
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handler de mudança no campo de busca
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Volta para primeira página ao buscar
  };

  /**
   * Abre modal de criação
   */
  const handleOpenCreateModal = () => {
    setSelectedDiscipline(null);
    setActiveModal('create');
  };

  /**
   * Abre modal de edição
   */
  const handleOpenEditModal = (discipline: IDiscipline) => {
    setSelectedDiscipline(discipline);
    setActiveModal('edit');
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleOpenDeleteModal = (discipline: IDiscipline) => {
    setSelectedDiscipline(discipline);
    setActiveModal('delete');
  };

  /**
   * Fecha todos os modais
   */
  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedDiscipline(null);
  };

  /**
   * Handler de criação de disciplina
   */
  const handleCreate = async (data: ICreateDisciplineData | IUpdateDisciplineData) => {
    try {
      setIsSubmitting(true);
      await DisciplineService.create(data as ICreateDisciplineData);
      setSuccessMessage('Disciplina cadastrada com sucesso!');
      handleCloseModal();
      await loadDisciplines();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar disciplina';
      alert(errorMessage);
      console.error('[DisciplinesPage] Erro ao criar disciplina:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de atualização de disciplina
   */
  const handleUpdate = async (data: ICreateDisciplineData | IUpdateDisciplineData) => {
    if (!selectedDiscipline) return;

    try {
      setIsSubmitting(true);
      await DisciplineService.update(selectedDiscipline.id, data);
      setSuccessMessage('Disciplina atualizada com sucesso!');
      handleCloseModal();
      await loadDisciplines();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar disciplina';
      alert(errorMessage);
      console.error('[DisciplinesPage] Erro ao atualizar disciplina:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de exclusão de disciplina
   */
  const handleDelete = async () => {
    if (!selectedDiscipline) return;

    try {
      setIsSubmitting(true);
      await DisciplineService.delete(selectedDiscipline.id);
      setSuccessMessage('Disciplina removida com sucesso!');
      handleCloseModal();
      await loadDisciplines();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover disciplina';
      alert(errorMessage);
      console.error('[DisciplinesPage] Erro ao deletar disciplina:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Formata carga horária para exibição
   */
  const formatWorkload = (hours: number): string => {
    if (hours === 1) return '1 hora';
    return `${hours}h`;
  };

  /**
   * Definição das colunas da tabela
   */
  const columns: Column<IDiscipline>[] = [
    {
      key: 'code',
      header: 'Código',
      accessor: (discipline) => (
        <div className="flex items-center gap-2">
          <BookMarked size={16} className="text-blue-600 flex-shrink-0" />
          <span className="font-mono font-semibold text-gray-900">
            {discipline.code}
          </span>
        </div>
      ),
      sortable: true,
      cellClassName: 'w-[120px]',
    },
    {
      key: 'name',
      header: 'Nome da Disciplina',
      accessor: (discipline) => discipline.name,
      sortable: true,
    },
    {
      key: 'workload',
      header: 'Carga Horária',
      accessor: (discipline) => (
        <div className="flex items-center gap-1 text-gray-700">
          <span>{formatWorkload(discipline.workloadHours)}</span>
        </div>
      ),
      align: 'center',
      sortable: true,
      cellClassName: 'w-[120px]',
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (discipline) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenEditModal(discipline)}
            title="Editar disciplina"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDeleteModal(discipline)}
            title="Remover disciplina"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      align: 'right',
      cellClassName: 'w-32',
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
              Erro ao carregar disciplinas
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadDisciplines}
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
          <h1 className="text-3xl font-bold text-gray-900">Disciplinas</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as disciplinas oferecidas pela instituição
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Nova disciplina
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

      {/* Barra de busca */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar disciplina por nome..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela de disciplinas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table
          data={disciplines}
          columns={columns}
          loading={loading}
          emptyMessage={
            debouncedSearch
              ? `Nenhuma disciplina encontrada com "${debouncedSearch}"`
              : 'Nenhuma disciplina cadastrada'
          }
          getRowKey={(discipline) => discipline.id}
          hoverable
        />

        {/* Paginação */}
        {!loading && disciplines.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        title="Cadastrar nova disciplina"
        description="Preencha os dados da disciplina abaixo"
        size="lg"
      >
        <DisciplineForm
          onSubmit={handleCreate}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        title="Editar disciplina"
        description="Atualize os dados da disciplina abaixo"
        size="lg"
      >
        <DisciplineForm
          initialData={selectedDiscipline || undefined}
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
            Tem certeza que deseja remover a disciplina{' '}
            <strong>{selectedDiscipline?.name}</strong>{' '}
            (<span className="font-mono">{selectedDiscipline?.code}</span>)?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita. A disciplina será removida do sistema.
          </p>

          {selectedDiscipline?.workloadHours && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Esta disciplina tem carga horária de{' '}
                {formatWorkload(selectedDiscipline.workloadHours)}. Certifique-se de que
                não está vinculada a nenhum curso antes de removê-la.
              </p>
            </div>
          )}

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
    </div>
  );
}
