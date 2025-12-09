/**
 * Arquivo: frontend/src/pages/teacher/Grades.tsx
 * Descrição: Página para lançamento de notas e gerenciamento de avaliações do professor
 * Feature: feat-098 - Criar página Grades (professor - lançamento)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir e gerenciar avaliações de uma turma
 * - Criar novas avaliações (nome, data, tipo)
 * - Lançar notas de forma individual ou em lote
 * - Atualizar notas existentes
 * - Validar dados de avaliação e notas
 * - Tratamento de loading, erros e estado vazio
 * - Responsividade em desktop, tablet e smartphone
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Clock,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getAll as getAllClasses } from '@/services/class.service';
import type { IEvaluation, EvaluationType } from '@/types/evaluation.types';
import * as EvaluationService from '@/services/evaluation.service';
import {
  getGradesByEvaluation,
  createGrade,
  updateGrade,
  type ICreateGradeData,
  type IUpdateGradeData,
} from '@/services/grade.service';
import type { IClass, IClassStudent } from '@/types/class.types';
import type { IGrade } from '@/types/grade.types';

// Constantes para tipos de avaliação
const EVALUATION_TYPES = {
  GRADE: 'grade' as const,
  CONCEPT: 'concept' as const,
};

// Aliases para funções do evaluation service
const createEvaluation = EvaluationService.create;
const getEvaluationsByClass = async (classId: number) => {
  // TODO: Implementar filtro por turma quando disponível
  const allEvaluations = await EvaluationService.getAll();
  return allEvaluations.filter(e => e.classId === classId);
};
const deleteEvaluation = EvaluationService.deleteEvaluation;

/**
 * Schema de validação para criação de avaliação
 */
const createEvaluationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da avaliação é obrigatório')
    .max(255, 'Nome não pode exceder 255 caracteres'),
  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine((date) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(date);
    }, 'Data deve estar no formato YYYY-MM-DD'),
  type: z.enum([EVALUATION_TYPES.GRADE, EVALUATION_TYPES.CONCEPT]),
});

type CreateEvaluationFormData = z.infer<typeof createEvaluationSchema>;

/**
 * TeacherGrades - Página de lançamento de notas
 *
 * Exibe interface completa para:
 * - Criar avaliações para uma turma
 * - Visualizar avaliações existentes
 * - Lançar notas de forma individual ou em lote
 * - Atualizar notas já lançadas
 *
 * @example
 * <TeacherGrades />
 */
export default function TeacherGrades() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // Estados de carregamento e erro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados de dados
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [allClasses, setAllClasses] = useState<IClass[]>([]);
  const [evaluations, setEvaluations] = useState<IEvaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<IEvaluation | null>(
    null
  );
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [students, setStudents] = useState<IClassStudent[]>([]);

  // Estados de UI
  const [showCreateEvaluationForm, setShowCreateEvaluationForm] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [batchEditMode, setBatchEditMode] = useState(false);
  const [batchGrades, setBatchGrades] = useState<Record<number, string>>({});

  // Formulário de criação de avaliação
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<CreateEvaluationFormData>({
    resolver: zodResolver(createEvaluationSchema),
  });

  /**
   * Carrega dados iniciais
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Carrega dados da turma e avaliações quando classId muda
   */
  useEffect(() => {
    if (classId && selectedClass?.id.toString() === classId) {
      loadClassData();
    }
  }, [classId, selectedClass?.id]);

  /**
   * Carrega avaliações da turma selecionada
   */
  useEffect(() => {
    if (selectedClass) {
      loadEvaluations();
    }
  }, [selectedClass]);

  /**
   * Carrega notas quando avaliação é selecionada
   */
  useEffect(() => {
    if (selectedEvaluation) {
      loadGrades();
    }
  }, [selectedEvaluation]);

  /**
   * Carrega classes e dados iniciais
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const classes = await getAllClasses();
      setAllClasses(classes);

      // Se URL contém classId, seleciona aquela turma
      if (classId) {
        const selectedCls = classes.find((c) => c.id.toString() === classId);
        if (selectedCls) {
          setSelectedClass(selectedCls);
          // Converte IUser[] para IClassStudent[]
          const classStudents = (selectedCls.students || []).map((user, index) => ({
            id: index,
            classId: selectedCls.id,
            studentId: user.id,
            student: user,
          }));
          setStudents(classStudents);
        }
      } else if (classes.length > 0) {
        // Caso contrário, seleciona primeira turma
        setSelectedClass(classes[0]);
        // Converte IUser[] para IClassStudent[]
        const classStudents = (classes[0].students || []).map((user, index) => ({
          id: index,
          classId: classes[0].id,
          studentId: user.id,
          student: user,
        }));
        setStudents(classStudents);
      }

      if (import.meta.env.DEV) {
        console.log('[TeacherGrades] Dados iniciais carregados:', classes.length);
      }
    } catch (err) {
      console.error('[TeacherGrades] Erro ao carregar dados iniciais:', err);
      setError('Erro ao carregar turmas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega dados específicos da turma selecionada
   */
  const loadClassData = async () => {
    if (!selectedClass) return;

    try {
      // Converte IUser[] para IClassStudent[]
      const classStudents = (selectedClass.students || []).map((user, index) => ({
        id: index,
        classId: selectedClass.id,
        studentId: user.id,
        student: user,
      }));
      setStudents(classStudents);
      if (import.meta.env.DEV) {
        console.log(
          '[TeacherGrades] Dados da turma carregados:',
          selectedClass.id
        );
      }
    } catch (err) {
      console.error('[TeacherGrades] Erro ao carregar dados da turma:', err);
    }
  };

  /**
   * Carrega avaliações da turma selecionada
   */
  const loadEvaluations = async () => {
    if (!selectedClass) return;

    try {
      const loadedEvaluations = await getEvaluationsByClass(selectedClass.id);
      setEvaluations(loadedEvaluations);
      setSelectedEvaluation(null);
      setGrades([]);

      if (import.meta.env.DEV) {
        console.log(
          '[TeacherGrades] Avaliações carregadas:',
          loadedEvaluations.length
        );
      }
    } catch (err) {
      console.error('[TeacherGrades] Erro ao carregar avaliações:', err);
      setError('Erro ao carregar avaliações. Por favor, tente novamente.');
    }
  };

  /**
   * Carrega notas da avaliação selecionada
   */
  const loadGrades = async () => {
    if (!selectedEvaluation) return;

    try {
      const loadedGrades = await getGradesByEvaluation(selectedEvaluation.id);
      setGrades(loadedGrades);
      setBatchGrades({});

      if (import.meta.env.DEV) {
        console.log('[TeacherGrades] Notas carregadas:', loadedGrades.length);
      }
    } catch (err) {
      console.error('[TeacherGrades] Erro ao carregar notas:', err);
      setError('Erro ao carregar notas. Por favor, tente novamente.');
    }
  };

  /**
   * Altera turma selecionada
   */
  const handleSelectClass = (classItem: IClass) => {
    setSelectedClass(classItem);
    setSelectedEvaluation(null);
    setGrades([]);
    // Converte IUser[] para IClassStudent[]
    const classStudents = (classItem.students || []).map((user, index) => ({
      id: index,
      classId: classItem.id,
      studentId: user.id,
      student: user,
    }));
    setStudents(classStudents);
    navigate(`/teacher/classes/${classItem.id}/grades`);
  };

  /**
   * Cria nova avaliação
   */
  const onCreateEvaluation = async (data: CreateEvaluationFormData) => {
    if (!selectedClass) {
      setError('Selecione uma turma primeiro');
      return;
    }

    try {
      // Encontra primeira disciplina da turma para usar como disciplineId
      const discipline = selectedClass.disciplines?.[0];
      if (!discipline) {
        setError(
          'Turma não possui disciplinas atribuídas. Configure as disciplinas primeiro.'
        );
        return;
      }

      const newEvaluation = await createEvaluation({
        classId: selectedClass.id,
        disciplineId: discipline.id,
        name: data.name,
        date: data.date,
        type: data.type,
      });

      setEvaluations([...evaluations, newEvaluation]);
      setShowCreateEvaluationForm(false);
      resetForm();
      setSuccessMessage(
        `Avaliação "${newEvaluation.name}" criada com sucesso!`
      );

      setTimeout(() => setSuccessMessage(null), 3000);

      if (import.meta.env.DEV) {
        console.log('[TeacherGrades] Avaliação criada:', newEvaluation.id);
      }
    } catch (err) {
      console.error('[TeacherGrades] Erro ao criar avaliação:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao criar avaliação';
      setError(errorMsg);
    }
  };

  /**
   * Deleta uma avaliação
   */
  const handleDeleteEvaluation = async (evaluationId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta avaliação?')) return;

    try {
      await deleteEvaluation(evaluationId);
      setEvaluations(evaluations.filter((e) => e.id !== evaluationId));
      if (selectedEvaluation?.id === evaluationId) {
        setSelectedEvaluation(null);
        setGrades([]);
      }
      setSuccessMessage('Avaliação removida com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('[TeacherGrades] Erro ao deletar avaliação:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao deletar avaliação';
      setError(errorMsg);
    }
  };

  /**
   * Salva grade individual
   */
  const handleSaveGrade = async (
    studentId: number,
    gradeValue: number | string | null,
    gradeType: EvaluationType
  ) => {
    if (!selectedEvaluation) return;

    try {
      // Valida valor de acordo com tipo
      if (gradeType === EVALUATION_TYPES.GRADE) {
        const numGrade = gradeValue !== null ? parseFloat(gradeValue as string) : null;

        if (numGrade !== null && (numGrade < 0 || numGrade > 10)) {
          setError('Nota deve estar entre 0 e 10');
          return;
        }
      }

      // Encontra grade existente
      const existingGrade = grades.find(
        (g) => g.studentId === studentId && g.evaluationId === selectedEvaluation.id
      );

      let updatedGrade: IGrade;

      if (existingGrade) {
        // Atualiza grade existente
        const updateData: IUpdateGradeData = {};
        if (gradeType === EVALUATION_TYPES.GRADE) {
          updateData.grade =
            gradeValue !== null ? parseFloat(gradeValue as string) : null;
        } else {
          updateData.concept = (gradeValue as any) || null;
        }

        updatedGrade = await updateGrade(existingGrade.id, updateData);
        setGrades(
          grades.map((g) => (g.id === existingGrade.id ? updatedGrade : g))
        );
      } else {
        // Cria nova grade
        const createData: ICreateGradeData = {
          evaluationId: selectedEvaluation.id,
          studentId,
        };

        if (gradeType === EVALUATION_TYPES.GRADE) {
          createData.grade =
            gradeValue !== null ? parseFloat(gradeValue as string) : null;
        } else {
          createData.concept = (gradeValue as any) || null;
        }

        updatedGrade = await createGrade(createData);
        setGrades([...grades, updatedGrade]);
      }

      setEditingGradeId(null);
      setSuccessMessage('Nota salva com sucesso!');
      setTimeout(() => setSuccessMessage(null), 2000);

      if (import.meta.env.DEV) {
        console.log('[TeacherGrades] Nota salva:', updatedGrade.id);
      }
    } catch (err) {
      console.error('[TeacherGrades] Erro ao salvar nota:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar nota';
      setError(errorMsg);
    }
  };

  /**
   * Inicia edição em lote
   */
  const handleStartBatchEdit = () => {
    setBatchEditMode(true);
    const batch: Record<number, string> = {};
    grades.forEach((g) => {
      if (selectedEvaluation?.type === EVALUATION_TYPES.GRADE && g.grade !== null) {
        batch[g.studentId] = g.grade.toString();
      } else if (selectedEvaluation?.type === EVALUATION_TYPES.CONCEPT && g.concept) {
        batch[g.studentId] = g.concept;
      }
    });
    setBatchGrades(batch);
  };

  /**
   * Cancela edição em lote
   */
  const handleCancelBatchEdit = () => {
    setBatchEditMode(false);
    setBatchGrades({});
  };

  /**
   * Salva todas as notas do modo em lote
   */
  const handleSaveBatchGrades = async () => {
    if (!selectedEvaluation) return;

    try {
      const savePromises = Object.entries(batchGrades).map(
        ([studentId, gradeValue]) => {
          const stdId = parseInt(studentId);
          return handleSaveGrade(
            stdId,
            gradeValue,
            selectedEvaluation.type
          );
        }
      );

      await Promise.all(savePromises);
      setBatchEditMode(false);
      setBatchGrades({});
      setSuccessMessage('Todas as notas foram salvas com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('[TeacherGrades] Erro ao salvar notas em lote:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao salvar notas em lote';
      setError(errorMsg);
    }
  };

  /**
   * Obtém grade de um aluno para uma avaliação
   */
  const getStudentGrade = (studentId: number): IGrade | undefined => {
    return grades.find(
      (g) =>
        g.studentId === studentId &&
        g.evaluationId === selectedEvaluation?.id
    );
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  /**
   * Obtém label do tipo de avaliação
   */
  const getEvaluationTypeLabel = (type: EvaluationType): string => {
    return type === EVALUATION_TYPES.GRADE ? 'Nota (0-10)' : 'Conceito';
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-purple-600" />
          Lançamento de Notas
        </h1>
        <p className="text-gray-600 mt-1">
          Gerenciar avaliações e lançar notas dos alunos
        </p>
      </div>

      {/* Seleção de turma */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Turma
        </label>
        <select
          value={selectedClass?.id || ''}
          onChange={(e) => {
            const cls = allClasses.find((c) => c.id === parseInt(e.target.value));
            if (cls) handleSelectClass(cls);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Escolha uma turma...</option>
          {allClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.course?.name} - {cls.semester}º Semestre {cls.year}
            </option>
          ))}
        </select>
      </div>

      {/* Seção de avaliações */}
      {selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda: Avaliações */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Avaliações
                </h2>
                <Button
                  size="sm"
                  onClick={() => setShowCreateEvaluationForm(!showCreateEvaluationForm)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Nova
                </Button>
              </div>

              {/* Formulário de criação */}
              {showCreateEvaluationForm && (
                <form
                  onSubmit={handleSubmit(onCreateEvaluation)}
                  className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nome da Avaliação
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Ex: Prova 1, Trabalho Final"
                      type="text"
                      className="w-full"
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <input
                      {...register('date')}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {formErrors.date && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.date.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={EVALUATION_TYPES.GRADE}>Nota (0-10)</option>
                      <option value={EVALUATION_TYPES.CONCEPT}>Conceito</option>
                    </select>
                    {formErrors.type && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="sm"
                      className="flex-1"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowCreateEvaluationForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              {/* Lista de avaliações */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {evaluations.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-600">
                      Nenhuma avaliação criada
                    </p>
                  </div>
                ) : (
                  evaluations.map((evaluation) => (
                    <button
                      key={evaluation.id}
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedEvaluation?.id === evaluation.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {evaluation.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(evaluation.date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getEvaluationTypeLabel(evaluation.type)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvaluation(evaluation.id);
                          }}
                          className="text-red-600 hover:text-red-800 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Coluna direita: Lançamento de notas */}
          <div className="lg:col-span-2">
            {!selectedEvaluation ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma avaliação
                </h3>
                <p className="text-gray-600">
                  Escolha uma avaliação na lista ao lado para começar a lançar
                  notas
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                {/* Cabeçalho da avaliação */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedEvaluation.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>📅 {formatDate(selectedEvaluation.date)}</span>
                        <span>📊 {getEvaluationTypeLabel(selectedEvaluation.type)}</span>
                        <span>
                          👥 {students.length}{' '}
                          {students.length !== 1 ? 'alunos' : 'aluno'}
                        </span>
                      </div>
                    </div>
                    {!batchEditMode && students.length > 0 && (
                      <Button
                        size="sm"
                        onClick={handleStartBatchEdit}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Edição em Lote
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tabela de notas */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Aluno
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">
                          {getEvaluationTypeLabel(selectedEvaluation.type)}
                        </th>
                        {!batchEditMode && (
                          <th className="px-4 py-3 text-right font-semibold text-gray-900">
                            Ações
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-6 text-center text-gray-600"
                          >
                            Nenhum aluno nesta turma
                          </td>
                        </tr>
                      ) : (
                        students.map((classStudent) => {
                          const studentGrade = getStudentGrade(
                            classStudent.studentId
                          );
                          const isEditing =
                            editingGradeId === classStudent.studentId;

                          return (
                            <tr key={classStudent.studentId} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">
                                  {classStudent.student?.name || 'Aluno desconhecido'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ID: {classStudent.studentId}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-center">
                                {batchEditMode ? (
                                  selectedEvaluation.type ===
                                  EVALUATION_TYPES.GRADE ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      value={
                                        batchGrades[classStudent.studentId] || ''
                                      }
                                      onChange={(e) =>
                                        setBatchGrades({
                                          ...batchGrades,
                                          [classStudent.studentId]:
                                            e.target.value,
                                        })
                                      }
                                      placeholder="0-10"
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                  ) : (
                                    <select
                                      value={
                                        batchGrades[classStudent.studentId] || ''
                                      }
                                      onChange={(e) =>
                                        setBatchGrades({
                                          ...batchGrades,
                                          [classStudent.studentId]:
                                            e.target.value,
                                        })
                                      }
                                      className="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                      <option value="">Selecione...</option>
                                      <option value="satisfactory">
                                        Satisfatório
                                      </option>
                                      <option value="unsatisfactory">
                                        Não Satisfatório
                                      </option>
                                    </select>
                                  )
                                ) : isEditing ? (
                                  <div className="flex items-center gap-2">
                                    {selectedEvaluation.type ===
                                    EVALUATION_TYPES.GRADE ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        defaultValue={
                                          studentGrade?.grade || ''
                                        }
                                        onBlur={(e) => {
                                          handleSaveGrade(
                                            classStudent.studentId,
                                            e.target.value,
                                            selectedEvaluation.type
                                          );
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveGrade(
                                              classStudent.studentId,
                                              (
                                                e.target as HTMLInputElement
                                              ).value,
                                              selectedEvaluation.type
                                            );
                                          } else if (e.key === 'Escape') {
                                            setEditingGradeId(null);
                                          }
                                        }}
                                        autoFocus
                                        placeholder="0-10"
                                        className="w-20 px-2 py-1 border border-purple-500 rounded text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      />
                                    ) : (
                                      <select
                                        defaultValue={
                                          studentGrade?.concept || ''
                                        }
                                        onChange={(e) => {
                                          handleSaveGrade(
                                            classStudent.studentId,
                                            e.target.value,
                                            selectedEvaluation.type
                                          );
                                        }}
                                        autoFocus
                                        className="w-40 px-2 py-1 border border-purple-500 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      >
                                        <option value="">Selecione...</option>
                                        <option value="satisfactory">
                                          Satisfatório
                                        </option>
                                        <option value="unsatisfactory">
                                          Não Satisfatório
                                        </option>
                                      </select>
                                    )}
                                  </div>
                                ) : (
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                      !studentGrade
                                        ? 'bg-gray-100 text-gray-600'
                                        : selectedEvaluation.type ===
                                            EVALUATION_TYPES.GRADE
                                          ? `${
                                              (studentGrade.grade || 0) >= 7
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                            }`
                                          : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {!studentGrade
                                      ? 'Não lançada'
                                      : selectedEvaluation.type ===
                                          EVALUATION_TYPES.GRADE
                                        ? `${studentGrade.grade?.toFixed(1) || '-'}`
                                        : studentGrade.concept ===
                                            'satisfactory'
                                          ? 'Satisfatório'
                                          : 'Não Satisfatório'}
                                  </span>
                                )}
                              </td>

                              {!batchEditMode && (
                                <td className="px-4 py-3 text-right">
                                  {!isEditing && (
                                    <button
                                      onClick={() =>
                                        setEditingGradeId(classStudent.studentId)
                                      }
                                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Editar
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Botões de ação em lote */}
                {batchEditMode && (
                  <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      onClick={handleCancelBatchEdit}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveBatchGrades}
                    >
                      Salvar Todas as Notas
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
