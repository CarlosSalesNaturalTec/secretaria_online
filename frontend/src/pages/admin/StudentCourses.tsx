/**
 * Arquivo: frontend/src/pages/admin/StudentCourses.tsx
 * Descrição: Página para gerenciar cursos realizados por um estudante específico
 * Feature: Nova funcionalidade - Gestão de cursos realizados pelo aluno
 * Criado em: 2025-12-08
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader, Plus, X } from 'lucide-react';
import Toast, { type ToastType } from '@/components/ui/Toast';
import StudentService from '@/services/student.service';
import EnrollmentService from '@/services/enrollment.service';
import { getAll as getAllCourses } from '@/services/course.service';
import apiClient from '@/services/api';
import type { IStudent } from '@/types/student.types';
import type { IEnrollment } from '@/types/enrollment.types';
import type { ICourse } from '@/types/course.types';

export default function StudentCoursesPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<IStudent | null>(null);
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [enrollmentCoursesMap, setEnrollmentCoursesMap] = useState<
    Map<number, ICourse>
  >(new Map());
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // Estados para o modal de adicionar curso
  const [showAddCourseModal, setShowAddCourseModal] = useState<boolean>(false);
  const [allCourses, setAllCourses] = useState<ICourse[]>([]);
  const [selectedNewCourseId, setSelectedNewCourseId] = useState<number | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    if (!studentId) {
      setError('ID do estudante não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar dados do estudante
      const studentData = await StudentService.getById(Number(studentId));
      setStudent(studentData);

      // Carregar matrículas do estudante usando a rota correta: /students/:studentId/enrollments
      console.log(
        `[StudentCoursesPage] Buscando matrículas para student ID: ${studentId}`
      );
      const enrollmentsResponse = await apiClient.get(
        `/students/${studentId}/enrollments`
      );
      console.log(
        `[StudentCoursesPage] Resposta de matrículas:`,
        enrollmentsResponse
      );

      const rawEnrollments = Array.isArray(enrollmentsResponse.data)
        ? enrollmentsResponse.data
        : enrollmentsResponse.data?.data || [];

      // Converter snake_case para camelCase
      const enrollmentsData = rawEnrollments.map((enrollment: any) => ({
        ...enrollment,
        courseId: enrollment.course_id || enrollment.courseId,
        studentId: enrollment.student_id || enrollment.studentId,
        enrollmentDate: enrollment.enrollment_date || enrollment.enrollmentDate,
      }));

      console.log(
        `[StudentCoursesPage] Matrículas processadas:`,
        enrollmentsData
      );
      setEnrollments(enrollmentsData);

      // Criar mapa dos cursos das matrículas (apenas os cursos em que o aluno está matriculado)
      const coursesMap = new Map<number, ICourse>();

      // Extrair dados do curso das matrículas (que vêm com curso carregado)
      if (enrollmentsData && Array.isArray(enrollmentsData)) {
        enrollmentsData.forEach((enrollment: any) => {
          if (enrollment.course && enrollment.course.id) {
            // Normalizar os dados do curso (converter snake_case da API para camelCase)
            const courseData: ICourse = {
              id: enrollment.course.id,
              name: enrollment.course.name,
              description: enrollment.course.description || '',
              duration: enrollment.course.duration,
              // API retorna em snake_case, converter para camelCase
              durationType: enrollment.course.duration_type || enrollment.course.durationType || '',
              courseType: enrollment.course.course_type || enrollment.course.courseType || '',
            };

            console.log(`[StudentCoursesPage] Adicionando curso ao mapa:`, {
              id: courseData.id,
              name: courseData.name,
              courseType: courseData.courseType,
              durationType: courseData.durationType
            });

            coursesMap.set(enrollment.course.id, courseData);
          } else {
            console.warn(`[StudentCoursesPage] Matrícula ${enrollment.id} não tem dados do curso`);
          }
        });
      }

      console.log('[StudentCoursesPage] Mapa final de cursos:', Array.from(coursesMap.entries()));
      setEnrollmentCoursesMap(coursesMap);

      // Definir curso ativo como padrão
      const activeCourse = enrollmentsData.find(
        (e: any) => e.status === 'active'
      );
      if (activeCourse) {
        setSelectedCourseId(activeCourse.courseId);
      } else if (enrollmentsData.length > 0) {
        setSelectedCourseId(enrollmentsData[0].courseId);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('[StudentCoursesPage] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEnrollment = (courseId: number) => {
    return enrollments.find((e: any) => e.courseId === courseId) || null;
  };

  const getEnrollmentStatus = (courseId: number) => {
    const enrollment = getEnrollment(courseId);
    return enrollment?.status || null;
  };

  const getEnrollmentDate = (courseId: number) => {
    const enrollment = getEnrollment(courseId);
    if (!enrollment) return null;
    return new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR');
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'reenrollment':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'reenrollment':
        return 'Rematrícula';
      case 'completed':
        return 'Concluído';
      default:
        return 'Sem matrícula';
    }
  };

  const loadAllCourses = async () => {
    try {
      const response = await getAllCourses({ limit: 1000 });
      setAllCourses(response.data);
    } catch (err) {
      console.error('[StudentCoursesPage] Erro ao carregar cursos:', err);
      setToast({
        message: 'Erro ao carregar lista de cursos',
        type: 'error',
      });
    }
  };

  const handleOpenAddCourseModal = async () => {
    await loadAllCourses();
    setShowAddCourseModal(true);
  };

  const handleCloseAddCourseModal = () => {
    setShowAddCourseModal(false);
    setSelectedNewCourseId(null);
    setEnrollmentDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddCourse = async () => {
    if (!selectedNewCourseId || !studentId) {
      setToast({
        message: 'Selecione um curso para cadastrar',
        type: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Criar matrícula usando o serviço
      await EnrollmentService.create({
        studentId: Number(studentId),
        courseId: selectedNewCourseId,
        enrollmentDate: enrollmentDate,
      });

      setToast({
        message: 'Estudante cadastrado no curso com sucesso!',
        type: 'success',
      });

      // Fechar modal e recarregar dados
      handleCloseAddCourseModal();
      await loadData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cadastrar estudante no curso';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentCoursesPage] Erro ao adicionar curso:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    enrollmentId: number,
    newStatus: 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed'
  ) => {
    try {
      setLoading(true);

      await EnrollmentService.updateStatus(enrollmentId, newStatus);

      setToast({
        message: `Status da matrícula atualizado para "${getStatusLabel(newStatus)}" com sucesso!`,
        type: 'success',
      });

      // Recarregar dados para refletir a mudança
      await loadData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar status da matrícula';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      console.error('[StudentCoursesPage] Erro ao atualizar status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Erro ao carregar dados
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

  if (!student) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Estudante não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header com botão de voltar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/students')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            title="Voltar para lista de estudantes"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cursos do Estudante</h1>
            <p className="text-gray-600 mt-2">
              Gerencie os cursos realizados por <strong>{student.nome}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Card com informações do estudante */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nome do Estudante</p>
            <p className="text-lg font-semibold text-gray-900">{student.nome}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Matrícula</p>
            <p className="text-lg font-semibold text-gray-900">
              {student.matricula || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="text-lg font-semibold text-gray-900">{student.email || '-'}</p>
          </div>
        </div>

        {/* Botão para adicionar novo curso */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleOpenAddCourseModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Cadastrar em Novo Curso
          </button>
        </div>
      </div>

      {/* Seção de seleção de curso */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {enrollments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Este estudante não possui matrículas em cursos.
          </p>
        ) : (
          <label className="block mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Selecione um curso para visualizar detalhes
            </p>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 cursor-pointer"
            >
              <option value="">-- Selecione um curso --</option>
              {enrollments.map((enrollment: any) => {
                // API retorna course_id em snake_case
                const course = enrollmentCoursesMap.get(enrollment.course_id);
                const isActive = enrollment.status === 'active';
                return (
                  <option key={enrollment.id} value={enrollment.course_id}>
                    {course?.name || `Curso ${enrollment.course_id}`}
                    {isActive ? ' (Ativo)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
        )}

        {/* Informações detalhadas do curso selecionado */}
        {enrollments.length > 0 && selectedCourseId && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            {(() => {
              const selectedCourse = enrollmentCoursesMap.get(selectedCourseId);
              const status = getEnrollmentStatus(selectedCourseId);
              const enrollmentDate = getEnrollmentDate(selectedCourseId);

              return selectedCourse ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCourse.name}
                      </h2>
                      <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    </div>
                    {status && (
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ml-4 ${getStatusBadgeColor(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Duração</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedCourse.duration} {selectedCourse.durationType}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tipo de Curso</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedCourse.courseType}
                      </p>
                    </div>
                    {enrollmentDate && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Data de Matrícula</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {enrollmentDate}
                        </p>
                      </div>
                    )}
                  </div>

                  {status === 'active' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-green-800 text-sm">
                          ✓ O estudante está com matrícula <strong>ativa</strong> neste
                          curso.
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">
                            Alterar para:
                          </label>
                          <select
                            onChange={(e) => {
                              const enrollment = getEnrollment(selectedCourseId);
                              if (enrollment && e.target.value) {
                                handleStatusChange(
                                  enrollment.id,
                                  e.target.value as 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed'
                                );
                                e.target.value = '';
                              }
                            }}
                            className="px-3 py-1 border border-green-300 rounded-md text-xs bg-white hover:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="">-- Alterar Status --</option>
                            <option value="pending">Pendente</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="reenrollment">Rematrícula</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-yellow-800 text-sm">
                          ⚠ A matrícula neste curso está <strong>pendente</strong> de
                          aprovação de documentos.
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">
                            Alterar para:
                          </label>
                          <select
                            onChange={(e) => {
                              const enrollment = getEnrollment(selectedCourseId);
                              if (enrollment && e.target.value) {
                                handleStatusChange(
                                  enrollment.id,
                                  e.target.value as 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed'
                                );
                                e.target.value = '';
                              }
                            }}
                            className="px-3 py-1 border border-yellow-300 rounded-md text-xs bg-white hover:border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="">-- Alterar Status --</option>
                            <option value="active">Ativo</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="reenrollment">Rematrícula</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'cancelled' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-red-800 text-sm">
                          ✗ A matrícula neste curso foi <strong>cancelada</strong>.
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">
                            Alterar para:
                          </label>
                          <select
                            onChange={(e) => {
                              const enrollment = getEnrollment(selectedCourseId);
                              if (enrollment && e.target.value) {
                                handleStatusChange(
                                  enrollment.id,
                                  e.target.value as 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed'
                                );
                                e.target.value = '';
                              }
                            }}
                            className="px-3 py-1 border border-red-300 rounded-md text-xs bg-white hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="">-- Alterar Status --</option>
                            <option value="pending">Pendente</option>
                            <option value="active">Ativo</option>
                            <option value="reenrollment">Rematrícula</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'reenrollment' && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-blue-800 text-sm">
                          🔄 Este aluno está em processo de <strong>rematrícula</strong> neste curso.
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">
                            Alterar para:
                          </label>
                          <select
                            onChange={(e) => {
                              const enrollment = getEnrollment(selectedCourseId);
                              if (enrollment && e.target.value) {
                                handleStatusChange(
                                  enrollment.id,
                                  e.target.value as 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed'
                                );
                                e.target.value = '';
                              }
                            }}
                            className="px-3 py-1 border border-blue-300 rounded-md text-xs bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="">-- Alterar Status --</option>
                            <option value="pending">Pendente</option>
                            <option value="active">Ativo</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-purple-800 text-sm">
                          🎓 O aluno <strong>concluiu</strong> este curso com sucesso!
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">
                            Alterar para:
                          </label>
                          <select
                            onChange={(e) => {
                              const enrollment = getEnrollment(selectedCourseId);
                              if (enrollment && e.target.value) {
                                handleStatusChange(
                                  enrollment.id,
                                  e.target.value as 'pending' | 'active' | 'cancelled' | 'reenrollment' | 'completed'
                                );
                                e.target.value = '';
                              }
                            }}
                            className="px-3 py-1 border border-purple-300 rounded-md text-xs bg-white hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="">-- Alterar Status --</option>
                            <option value="active">Ativo</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {!status && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        Este estudante <strong>não possui matrícula</strong> neste curso.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Curso não encontrado</p>
              );
            })()}
          </div>
        )}
      </div>


      {/* Modal de adicionar curso */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Cadastrar em Novo Curso
              </h2>
              <button
                onClick={handleCloseAddCourseModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={submitting}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Curso
                </label>
                <select
                  value={selectedNewCourseId || ''}
                  onChange={(e) => setSelectedNewCourseId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="">-- Selecione um curso --</option>
                  {allCourses
                    .filter((course) => {
                      // Filtrar cursos em que o aluno já está matriculado
                      const alreadyEnrolled = enrollments.some(
                        (enrollment) => enrollment.courseId === course.id
                      );
                      return !alreadyEnrolled;
                    })
                    .map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Matrícula
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCourse}
                  disabled={submitting || !selectedNewCourseId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </button>
                <button
                  onClick={handleCloseAddCourseModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
