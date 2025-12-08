/**
 * Arquivo: frontend/src/pages/admin/CourseDisciplines.tsx
 * Descrição: Página de gerenciamento de disciplinas de um curso
 * Criado em: 2025-12-08
 *
 * Responsabilidades:
 * - Exibir lista de disciplinas vinculadas ao curso
 * - Permitir adicionar disciplinas da lista geral ao curso
 * - Permitir remover disciplinas do curso
 * - Gerenciar estados de loading e erro
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertCircle, BookOpen } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import CourseService from '@/services/course.service';
import DisciplineService from '@/services/discipline.service';
import type { ICourse } from '@/types/course.types';
import type { IDiscipline } from '@/types/discipline.types';

/**
 * Interface para disciplinas do curso com informações do semestre
 */
interface ICourseDiscipline extends IDiscipline {
  CourseDiscipline?: {
    semester: number;
  };
  course_disciplines?: {
    semester: number;
  };
}

/**
 * CourseDisciplinesPage - Página de gerenciamento de disciplinas do curso
 *
 * Responsabilidades:
 * - Carregar e exibir curso e suas disciplinas
 * - Gerenciar modal de adição de disciplina
 * - Integrar com course.service para operações
 * - Exibir feedbacks de sucesso e erro
 *
 * @returns Página de gerenciamento de disciplinas do curso
 */
export default function CourseDisciplinesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Estado do curso e disciplinas
  const [course, setCourse] = useState<ICourse | null>(null);
  const [courseDisciplines, setCourseDisciplines] = useState<ICourseDiscipline[]>([]);
  const [allDisciplines, setAllDisciplines] = useState<IDiscipline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do modal de adição
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<number | null>(null);
  const [semester, setSemester] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado de mensagens de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carrega dados ao montar o componente
   */
  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

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
   * Normaliza os dados da disciplina vindos do backend
   */
  const normalizeDiscipline = (discipline: any): ICourseDiscipline => {
    if (import.meta.env.DEV) {
      console.log('[CourseDisciplinesPage] Disciplina original:', discipline);
    }

    const normalized = {
      ...discipline,
      workloadHours: discipline.workload_hours || discipline.workloadHours,
      CourseDiscipline: discipline.CourseDiscipline || {
        semester: discipline.course_disciplines?.semester || 0,
      },
    };

    if (import.meta.env.DEV) {
      console.log('[CourseDisciplinesPage] Disciplina normalizada:', normalized);
    }

    return normalized;
  };

  /**
   * Carrega curso, disciplinas do curso e todas as disciplinas
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!courseId) {
        throw new Error('ID do curso não fornecido');
      }

      const courseIdNumber = parseInt(courseId, 10);

      // Carregar curso, disciplinas do curso e todas as disciplinas em paralelo
      const [courseData, courseDisciplinesData, allDisciplinesResponse] = await Promise.all([
        CourseService.getById(courseIdNumber),
        CourseService.getCourseDisciplines(courseIdNumber),
        DisciplineService.getAll(),
      ]);

      setCourse(courseData);
      // Normaliza os dados das disciplinas do curso
      setCourseDisciplines(courseDisciplinesData.map(normalizeDiscipline));
      // Extrai o array de disciplinas do objeto paginado
      setAllDisciplines(allDisciplinesResponse.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar dados do curso';
      setError(errorMessage);
      console.error('[CourseDisciplinesPage] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre modal de adição de disciplina
   */
  const handleOpenAddModal = () => {
    setSelectedDisciplineId(null);
    setSemester(1);
    setIsAddModalOpen(true);
  };

  /**
   * Fecha modal de adição
   */
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDisciplineId(null);
    setSemester(1);
  };

  /**
   * Handler de adição de disciplina ao curso
   */
  const handleAddDiscipline = async () => {
    if (!courseId || !selectedDisciplineId) return;

    try {
      setIsSubmitting(true);

      const courseIdNumber = parseInt(courseId, 10);

      await CourseService.addDisciplineToCourse(
        courseIdNumber,
        selectedDisciplineId,
        semester
      );

      setSuccessMessage('Disciplina adicionada com sucesso!');
      handleCloseAddModal();
      await loadData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao adicionar disciplina';
      alert(errorMessage);
      console.error('[CourseDisciplinesPage] Erro ao adicionar disciplina:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler de remoção de disciplina do curso
   */
  const handleRemoveDiscipline = async (disciplineId: number) => {
    if (!courseId) return;

    const confirmed = window.confirm(
      'Tem certeza que deseja remover esta disciplina do curso?'
    );

    if (!confirmed) return;

    try {
      const courseIdNumber = parseInt(courseId, 10);

      await CourseService.removeDisciplineFromCourse(
        courseIdNumber,
        disciplineId
      );

      setSuccessMessage('Disciplina removida com sucesso!');
      await loadData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao remover disciplina';
      alert(errorMessage);
      console.error('[CourseDisciplinesPage] Erro ao remover disciplina:', err);
    }
  };

  /**
   * Retorna disciplinas disponíveis (não vinculadas ao curso)
   */
  const getAvailableDisciplines = (): IDiscipline[] => {
    const courseDisciplineIds = new Set(
      courseDisciplines.map((cd) => cd.id)
    );

    return allDisciplines.filter((d) => !courseDisciplineIds.has(d.id));
  };

  /**
   * Definição das colunas da tabela
   */
  const columns: Column<ICourseDiscipline>[] = [
    {
      key: 'code',
      header: 'Código',
      accessor: (discipline) => discipline.code || 'N/A',
      sortable: true,
    },
    {
      key: 'name',
      header: 'Nome da Disciplina',
      accessor: (discipline) => discipline.name,
      sortable: true,
    },
    {
      key: 'workloadHours',
      header: 'Carga Horária',
      accessor: (discipline) => (
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-gray-500" />
          <span>{discipline.workloadHours ? `${discipline.workloadHours}h` : 'N/A'}</span>
        </div>
      ),
      align: 'center',
      sortable: true,
    },
    {
      key: 'semester',
      header: 'Semestre',
      accessor: (discipline) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
          {discipline.CourseDiscipline?.semester || 'N/A'}
        </span>
      ),
      align: 'center',
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (discipline) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleRemoveDiscipline(discipline.id)}
            title="Remover disciplina do curso"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      align: 'right',
      cellClassName: 'w-24',
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
              Erro ao carregar dados do curso
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadData}
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
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/courses')}
          className="mb-4"
        >
          <ArrowLeft size={16} />
          Voltar para cursos
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Disciplinas
            </h1>
            {course && (
              <p className="text-gray-600 mt-2">
                Curso: <strong>{course.name}</strong>
              </p>
            )}
          </div>

          <Button onClick={handleOpenAddModal}>
            <Plus size={20} />
            Adicionar disciplina
          </Button>
        </div>
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

      {/* Tabela de disciplinas do curso */}
      <Table
        data={courseDisciplines}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhuma disciplina cadastrada neste curso"
        getRowKey={(discipline) => discipline.id}
        hoverable
      />

      {/* Modal de adição de disciplina */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Adicionar disciplina ao curso"
        description="Selecione uma disciplina e o semestre em que ela será oferecida"
        size="md"
      >
        <div className="space-y-4">
          {/* Select de disciplina */}
          <div>
            <label
              htmlFor="discipline"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Disciplina *
            </label>
            <select
              id="discipline"
              value={selectedDisciplineId || ''}
              onChange={(e) =>
                setSelectedDisciplineId(
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma disciplina</option>
              {getAvailableDisciplines().map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.code ? `${discipline.code} - ` : ''}
                  {discipline.name}
                  {discipline.workloadHours
                    ? ` (${discipline.workloadHours}h)`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Input de semestre */}
          <div>
            <label
              htmlFor="semester"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Semestre *
            </label>
            <input
              id="semester"
              type="number"
              min="1"
              max="20"
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe o semestre em que a disciplina será oferecida
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCloseAddModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddDiscipline}
              loading={isSubmitting}
              disabled={isSubmitting || !selectedDisciplineId}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
