/**
 * Arquivo: frontend/src/pages/admin/StudentDisciplineExemptions.tsx
 * Descrição: Página admin para gerenciar aproveitamentos de disciplinas de um aluno
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Toast, { type ToastType } from '@/components/ui/Toast';
import {
  useStudentExemptions,
  useCreateExemption,
  useDeleteExemption,
} from '@/hooks/useStudentExemptions';
import type { ICreateExemptionDTO, IStudentDisciplineExemption } from '@/types/studentDisciplineExemption.types';
import StudentService from '@/services/student.service';
import DisciplineService from '@/services/discipline.service';
import type { IStudent } from '@/types/student.types';
import type { IDiscipline } from '@/types/course.types';

export default function StudentDisciplineExemptionsPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const numericStudentId = Number(studentId);

  const [studentInfo, setStudentInfo] = useState<IStudent | null>(null);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form state
  const [formDisciplineId, setFormDisciplineId] = useState<string>('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const { data: exemptions = [], isLoading, error } = useStudentExemptions(numericStudentId);
  const createMutation = useCreateExemption(numericStudentId);
  const deleteMutation = useDeleteExemption(numericStudentId);

  useEffect(() => {
    if (!numericStudentId || isNaN(numericStudentId)) {
      navigate('/admin/students');
      return;
    }
    loadInitialData();
  }, [numericStudentId]);

  const loadInitialData = async () => {
    try {
      const [studentData, disciplinesResponse] = await Promise.all([
        StudentService.getById(numericStudentId),
        DisciplineService.getAll({ limit: 1000 }),
      ]);
      setStudentInfo(studentData);
      setDisciplines(disciplinesResponse.data);
    } catch (err) {
      console.error('[StudentDisciplineExemptionsPage] Erro ao carregar dados:', err);
    }
  };

  const handleOpenModal = () => {
    setFormDisciplineId('');
    setFormOrigin('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisciplineId) return;

    try {
      const data: ICreateExemptionDTO = {
        discipline_id: parseInt(formDisciplineId, 10),
        origin_institution: formOrigin || undefined,
        notes: formNotes || undefined,
      };
      await createMutation.mutateAsync(data);
      setToast({ message: 'Aproveitamento registrado com sucesso!', type: 'success' });
      handleCloseModal();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Erro ao registrar aproveitamento';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleDelete = async (exemption: IStudentDisciplineExemption) => {
    try {
      await deleteMutation.mutateAsync(exemption.id);
      setToast({ message: 'Aproveitamento removido com sucesso!', type: 'success' });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Erro ao remover aproveitamento';
      setToast({ message: msg, type: 'error' });
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
          Erro ao carregar aproveitamentos: {(error as Error).message}
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award size={28} className="text-amber-600" />
              Aproveitamentos de Disciplinas
            </h1>
            {studentInfo && (
              <p className="text-gray-600 mt-1">
                Aluno: {studentInfo.nome}
                {studentInfo.matricula ? ` (Matrícula: ${studentInfo.matricula})` : ''}
              </p>
            )}
          </div>
          <Button onClick={handleOpenModal}>
            <Plus size={16} className="mr-1" />
            Adicionar Aproveitamento
          </Button>
        </div>
      </div>

      {/* Tabela de aproveitamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {exemptions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Award size={40} className="mx-auto mb-3 text-gray-300" />
            <p>Nenhum aproveitamento registrado para este aluno.</p>
            <Button variant="secondary" className="mt-4" onClick={handleOpenModal}>
              <Plus size={16} className="mr-1" />
              Adicionar Aproveitamento
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instituição de Origem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exemptions.map((exemption) => (
                <tr key={exemption.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                      >
                        Dispensado
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {exemption.discipline?.name || '-'}
                      </span>
                      {exemption.discipline?.code && (
                        <span className="text-xs text-gray-500">
                          ({exemption.discipline.code})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exemption.origin_institution || <span className="text-gray-400 italic">Não informado</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    {exemption.notes ? (
                      <span className="truncate block" title={exemption.notes}>
                        {exemption.notes}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exemption.class
                      ? `${exemption.class.semester}º sem. / ${exemption.class.year}`
                      : <span className="text-gray-400 italic">Todas</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(exemption)}
                      title="Remover aproveitamento"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Adição */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Adicionar Aproveitamento de Disciplina"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina <span className="text-red-500">*</span>
            </label>
            <select
              value={formDisciplineId}
              onChange={(e) => setFormDisciplineId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione a disciplina dispensada</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.code ? ` (${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instituição de Origem
            </label>
            <input
              type="text"
              value={formOrigin}
              onChange={(e) => setFormOrigin(e.target.value)}
              placeholder="Ex.: Universidade Federal de São Paulo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              placeholder="Informações adicionais sobre o aproveitamento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending}
              disabled={createMutation.isPending || !formDisciplineId}
            >
              Registrar Aproveitamento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
