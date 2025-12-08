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
import { Plus, Pencil, Trash2, AlertCircle, BookOpen, List, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // Estado da lista de cursos
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  // Estado de busca
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');

  // Estado dos modais
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  // Estado de operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carrega lista de cursos ao montar o componente, mudar de página ou filtrar
   */
  useEffect(() => {
    loadCourses();
  }, [currentPage, activeSearch]);

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
   * Carrega lista de cursos da API com paginação e filtro
   */
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await CourseService.getAll({
        page: currentPage,
        limit: pageSize,
        search: activeSearch,
      });
      setCourses(result.data);
      setTotalPages(result.totalPages);
      setTotalCourses(result.total);
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
      setCurrentPage(1); // Voltar para primeira página
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
   * Navega para página de gerenciamento de disciplinas do curso
   */
  const handleManageDisciplines = (course: ICourse) => {
    navigate(`/admin/courses/${course.id}/disciplines`);
  };

  /**
   * Navega para a página anterior
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navega para a próxima página
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Navega para uma página específica
   */
  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * Executa a busca
   */
  const handleSearch = () => {
    setActiveSearch(searchTerm);
    setCurrentPage(1); // Resetar para primeira página ao buscar
  };

  /**
   * Limpa o filtro de busca
   */
  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  /**
   * Permite buscar ao pressionar Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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
            variant="primary"
            onClick={() => handleManageDisciplines(course)}
            title="Gerenciar disciplinas"
          >
            <List size={16} />
          </Button>

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
      cellClassName: 'w-40',
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

      {/* Barra de busca */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar curso por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>
          <Search size={18} />
          Buscar
        </Button>
        {activeSearch && (
          <Button variant="secondary" onClick={handleClearSearch}>
            <X size={18} />
            Limpar filtro
          </Button>
        )}
      </div>

      {/* Indicador de filtro ativo */}
      {activeSearch && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Buscando por: <strong>{activeSearch}</strong>
              {totalCourses > 0 && (
                <span className="ml-2">
                  ({totalCourses} {totalCourses === 1 ? 'curso encontrado' : 'cursos encontrados'})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Limpar
          </button>
        </div>
      )}

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

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalCourses)}
            </span>{' '}
            de <span className="font-medium">{totalCourses}</span> cursos
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Mostrar primeira página, última página e páginas próximas à atual
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Mostrar "..." entre páginas
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handleGoToPage(page)}
                    className={`
                      px-3 py-1 rounded-md text-sm font-medium transition-colors
                      ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

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
