/**
 * Arquivo: frontend/src/pages/admin/Courses.tsx
 * Descrição: Página de listagem e gerenciamento de cursos (CRUD completo)
 * Feature: feat-085 - Criar course.service.ts e página Courses
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir tabela de cursos cadastrados
 * - Permitir criação de novo curso via modal
 * - Permitir edição de curso existente via modal
 * - Permitir exclusão de curso com confirmação
 * - Gerenciar disciplinas vinculadas ao curso
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, BookOpen } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CourseForm } from '@/components/forms/CourseForm';
import CourseService from '@/services/course.service';
import type { ICourse } from '@/types/course.types';
import type { ICreateCourseData, IUpdateCourseData } from '@/services/course.service';

/**
 * Tipo de modal ativo
 */
type ModalType = 'create' | 'edit' | 'delete' | null;

/**
 * CoursesPage - Página de gerenciamento de cursos
 *
 * Responsabilidades:
 * - Carregar e exibir lista de cursos
 * - Gerenciar modais de criação, edição e exclusão
 * - Integrar com course.service para operações CRUD
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de cursos
 */
export default function CoursesPage() {
  // Estado da lista de cursos
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  // Estado de operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carrega lista de cursos ao montar o componente
   */
  useEffect(() => {
    loadCourses();
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
   * Carrega lista de cursos da API
   */
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.getAll();
      setCourses(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de cursos';
      setError(errorMessage);
      console.error('[CoursesPage] Erro ao carregar cursos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre modal de criação
   */
  const handleOpenCreateModal = () => {
    setSelectedCourse(null);
    setActiveModal('create');
  };

  /**
   * Abre modal de edição
   */
  const handleOpenEditModal = (course: ICourse) => {
    setSelectedCourse(course);
    setActiveModal('edit');
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleOpenDeleteModal = (course: ICourse) => {
    setSelectedCourse(course);
    setActiveModal('delete');
  };

  /**
   * Fecha todos os modais
   */
  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedCourse(null);
  };

  /**
   * Handler de criação de curso
   */
  const handleCreate = async (data: ICreateCourseData | IUpdateCourseData) => {
    try {
      setIsSubmitting(true);
      await CourseService.create(data as ICreateCourseData);
      setSuccessMessage('Curso cadastrado com sucesso!');
      handleCloseModal();
      await loadCourses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar curso';
      alert(errorMessage);
      console.error('[CoursesPage] Erro ao criar curso:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de atualização de curso
   */
  const handleUpdate = async (data: ICreateCourseData | IUpdateCourseData) => {
    if (!selectedCourse) return;

    try {
      setIsSubmitting(true);
      await CourseService.update(selectedCourse.id, data);
      setSuccessMessage('Curso atualizado com sucesso!');
      handleCloseModal();
      await loadCourses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar curso';
      alert(errorMessage);
      console.error('[CoursesPage] Erro ao atualizar curso:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de exclusão de curso
   */
  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      setIsSubmitting(true);
      await CourseService.delete(selectedCourse.id);
      setSuccessMessage('Curso removido com sucesso!');
      handleCloseModal();
      await loadCourses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover curso';
      alert(errorMessage);
      console.error('[CoursesPage] Erro ao deletar curso:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Formata duração para exibição
   */
  const formatDuration = (duration: number, durationType: string): string => {
    return `${duration} ${durationType}`;
  };

  /**
   * Definição das colunas da tabela
   */
  const columns: Column<ICourse>[] = [
    {
      key: 'name',
      header: 'Nome do Curso',
      accessor: (course) => course.name,
      sortable: true,
    },
    {
      key: 'description',
      header: 'Descrição',
      accessor: (course) => (
        <div className="max-w-md truncate" title={course.description}>
          {course.description}
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duração',
      accessor: (course) => (
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-gray-500" />
          <span>{formatDuration(course.duration, course.durationType)}</span>
        </div>
      ),
      align: 'center',
      sortable: true,
    },
    {
      key: 'courseType',
      header: 'Tipo',
      accessor: (course) => course.courseType,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (course) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenEditModal(course)}
            title="Editar curso"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDeleteModal(course)}
            title="Remover curso"
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
              Erro ao carregar cursos
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadCourses}
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
          <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie os cursos oferecidos pela instituição
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Novo curso
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

      {/* Tabela de cursos */}
      <Table
        data={courses}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum curso cadastrado"
        getRowKey={(course) => course.id}
        hoverable
      />

      {/* Modal de criação */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        title="Cadastrar novo curso"
        description="Preencha os dados do curso abaixo"
        size="lg"
      >
        <CourseForm
          onSubmit={handleCreate}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        title="Editar curso"
        description="Atualize os dados do curso abaixo"
        size="lg"
      >
        <CourseForm
          initialData={selectedCourse || undefined}
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
            Tem certeza que deseja remover o curso{' '}
            <strong>{selectedCourse?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita. O curso será removido do sistema.
          </p>

          {selectedCourse?.duration && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Este curso tem duração de{' '}
                {formatDuration(selectedCourse.duration, selectedCourse.durationType)}. Certifique-se de que
                não há alunos matriculados antes de removê-lo.
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
