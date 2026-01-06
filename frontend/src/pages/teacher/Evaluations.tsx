/**
 * Arquivo: frontend/src/pages/teacher/Evaluations.tsx
 * Descrição: Página de listagem e gerenciamento de avaliações
 * Feature: feat-evaluation-ui - Criar interface de gerenciamento de avaliações
 * Criado em: 2025-12-09
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Toast, { type ToastType } from '@/components/ui/Toast';
import { EvaluationForm } from '@/components/forms/EvaluationForm';
import EvaluationService from '@/services/evaluation.service';
import ClassService from '@/services/class.service';
import type { IEvaluation, ICreateEvaluationData, IUpdateEvaluationData } from '@/types/evaluation.types';
import type { IClass } from '@/types/class.types';

type ModalType = 'create' | 'edit' | 'delete' | null;

export default function EvaluationsPage() {
  const [filteredEvaluations, setFilteredEvaluations] = useState<IEvaluation[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<IEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassFilter === '') {
      setFilteredEvaluations([]);
    } else {
      loadEvaluationsByClass(Number(selectedClassFilter));
    }
  }, [selectedClassFilter]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EvaluationService.getAll();
      setFilteredEvaluations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar lista de avaliações';
      setError(errorMessage);
      console.error('[EvaluationsPage] Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluationsByClass = async (classId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EvaluationService.getAll();
      const filtered = data.filter(e => e.classId === classId);
      setFilteredEvaluations(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar lista de avaliações';
      setError(errorMessage);
      console.error('[EvaluationsPage] Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await ClassService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('[EvaluationsPage] Erro ao carregar turmas:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedEvaluation(null);
    setActiveModal('create');
  };

  const handleOpenEditModal = (evaluation: IEvaluation) => {
    setSelectedEvaluation(evaluation);
    setActiveModal('edit');
  };

  const handleOpenDeleteModal = (evaluation: IEvaluation) => {
    setSelectedEvaluation(evaluation);
    setActiveModal('delete');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedEvaluation(null);
  };

  const handleCreate = async (data: ICreateEvaluationData | IUpdateEvaluationData) => {
    try {
      setIsSubmitting(true);
      await EvaluationService.create(data as ICreateEvaluationData);
      setToast({ message: 'Avaliação cadastrada com sucesso!', type: 'success' });
      handleCloseModal();
      if (selectedClassFilter) {
        await loadEvaluationsByClass(Number(selectedClassFilter));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar avaliação';
      setToast({ message: errorMessage, type: 'error' });
      console.error('[EvaluationsPage] Erro ao criar avaliação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: ICreateEvaluationData | IUpdateEvaluationData) => {
    if (!selectedEvaluation) return;

    try {
      setIsSubmitting(true);
      await EvaluationService.update(selectedEvaluation.id, data);
      setToast({ message: 'Avaliação atualizada com sucesso!', type: 'success' });
      handleCloseModal();
      if (selectedClassFilter) {
        await loadEvaluationsByClass(Number(selectedClassFilter));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar avaliação';
      setToast({ message: errorMessage, type: 'error' });
      console.error('[EvaluationsPage] Erro ao atualizar avaliação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvaluation) return;

    try {
      setIsSubmitting(true);
      await EvaluationService.delete(selectedEvaluation.id);
      setToast({ message: 'Avaliação removida com sucesso!', type: 'success' });
      handleCloseModal();
      if (selectedClassFilter) {
        await loadEvaluationsByClass(Number(selectedClassFilter));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover avaliação';
      setToast({ message: errorMessage, type: 'error' });
      console.error('[EvaluationsPage] Erro ao deletar avaliação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const getTypeBadge = (type: 'grade' | 'concept'): React.ReactElement => {
    if (type === 'grade') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Nota</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Conceito</span>;
  };

  const columns: Column<IEvaluation>[] = [
    {
      key: 'name',
      header: 'Nome',
      accessor: (evaluation) => evaluation.name,
      sortable: true,
    },
    {
      key: 'class',
      header: 'Turma',
      accessor: (evaluation) => evaluation.class ? `${evaluation.class.course?.name} - Sem ${evaluation.class.semester}/${evaluation.class.year}` : '-',
    },
    {
      key: 'discipline',
      header: 'Disciplina',
      accessor: (evaluation) => evaluation.discipline?.name || '-',
    },
    {
      key: 'date',
      header: 'Data',
      accessor: (evaluation) => formatDate(evaluation.date),
      align: 'center',
    },
    {
      key: 'type',
      header: 'Tipo',
      accessor: (evaluation) => getTypeBadge(evaluation.type),
      align: 'center',
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (evaluation) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleOpenEditModal(evaluation)} title="Editar avaliação">
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleOpenDeleteModal(evaluation)} title="Remover avaliação">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      align: 'right',
      cellClassName: 'w-32',
    },
  ];

  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">Erro ao carregar avaliações</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={loadEvaluations} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-600 mt-2">Gerencie as avaliações cadastradas</p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Nova Avaliação
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Filter size={20} className="text-gray-500" />
        <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Selecione uma turma</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.course?.name} - Semestre {classItem.semester}/{classItem.year}
            </option>
          ))}
        </select>
        {selectedClassFilter && (
          <Button size="sm" variant="secondary" onClick={() => setSelectedClassFilter('')}>
            Limpar Seleção
          </Button>
        )}
      </div>

      <Table
        data={filteredEvaluations}
        columns={columns}
        loading={loading}
        emptyMessage={selectedClassFilter ? 'Nenhuma avaliação encontrada para esta turma' : 'Selecione uma turma para visualizar as avaliações'}
        getRowKey={(evaluation) => evaluation.id}
        hoverable
      />

      <Modal isOpen={activeModal === 'create'} onClose={handleCloseModal} title="Cadastrar nova avaliação" description="Preencha os dados da avaliação abaixo" size="lg">
        <EvaluationForm onSubmit={handleCreate} onCancel={handleCloseModal} loading={isSubmitting} />
      </Modal>

      <Modal isOpen={activeModal === 'edit'} onClose={handleCloseModal} title="Editar avaliação" description="Atualize os dados da avaliação abaixo" size="lg">
        <EvaluationForm initialData={selectedEvaluation || undefined} onSubmit={handleUpdate} onCancel={handleCloseModal} loading={isSubmitting} />
      </Modal>

      <Modal isOpen={activeModal === 'delete'} onClose={handleCloseModal} title="Confirmar exclusão" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">Tem certeza que deseja remover a avaliação <strong>{selectedEvaluation?.name}</strong>?</p>
          <p className="text-sm text-gray-600">Esta ação não poderá ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isSubmitting} disabled={isSubmitting}>
              Confirmar exclusão
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
