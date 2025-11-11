/**
 * Arquivo: frontend/src/pages/teacher/Students.tsx
 * Descrição: Página de visualização de alunos da turma (read-only)
 * Feature: feat-096 - Criar página Students (professor - visualização)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir listagem de turmas do professor (selecionáveis)
 * - Mostrar lista de alunos da turma selecionada
 * - Exibir informações básicas do aluno: nome, matrícula, status
 * - Permitir busca e filtro de alunos
 * - Modo read-only (visualização apenas)
 * - Responsividade em desktop, tablet e smartphone
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  Search,
  Users,
  User,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getAll as getAllClasses, getById as getClassById } from '@/services/class.service';
import type { IClass, IClassStudent } from '@/types/class.types';

/**
 * TeacherStudents - Página de visualização de alunos da turma
 *
 * Exibe lista de alunos matriculados na turma selecionada, com:
 * - Informações básicas (nome, email, status)
 * - Busca e filtro por nome
 * - Layout responsivo com tabela (desktop) e cards (mobile)
 * - Estados de carregamento, erro e vazio
 *
 * @example
 * <TeacherStudents />
 */
export default function TeacherStudents() {
  // ===== ESTADOS DE CARREGAMENTO E ERRO =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classLoading, setClassLoading] = useState(false);

  // ===== ESTADOS DE DADOS =====
  const [allClasses, setAllClasses] = useState<IClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [classStudents, setClassStudents] = useState<IClassStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<IClassStudent[]>([]);

  // ===== ESTADOS DE FILTRO =====
  const [searchTerm, setSearchTerm] = useState('');

  // ===== PARAM FROM URL =====
  const { classId } = useParams<{ classId?: string }>();

  /**
   * Carrega as turmas ao montar o componente
   */
  useEffect(() => {
    loadClasses();
  }, []);

  /**
   * Seleciona a turma baseado no URL ou valor atual
   */
  useEffect(() => {
    if (classId && allClasses.length > 0) {
      const id = parseInt(classId, 10);
      const cls = allClasses.find((c) => c.id === id);
      if (cls) {
        selectClass(cls);
      }
    }
  }, [classId, allClasses]);

  /**
   * Atualiza a listagem filtrada quando os filtros mudam
   */
  useEffect(() => {
    applyFilters();
  }, [classStudents, searchTerm]);

  /**
   * Carrega todas as turmas do professor
   *
   * TODO: Implementar endpoint específico para "minhas turmas" quando backend estiver pronto.
   * Atualmente, busca todas as turmas e filtra no frontend (temporário para desenvolvimento).
   *
   * @throws {Error} Quando ocorre erro na comunicação com API
   */
  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Substituir por /api/v1/teachers/me/classes quando endpoint estiver disponível
      // Atualmente usa endpoint de admin (busca todas as turmas)
      const classes = await getAllClasses();

      // NOTA: No futuro, filtrar por teacherId do usuário autenticado
      // Por enquanto, exibe todas as turmas para desenvolvimento
      setAllClasses(classes);

      if (import.meta.env.DEV) {
        console.log('[TeacherStudents] Turmas carregadas:', classes.length);
      }
    } catch (err) {
      console.error('[TeacherStudents] Erro ao carregar turmas:', err);
      setError('Erro ao carregar turmas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleciona uma turma e carrega seus alunos
   *
   * @param {IClass} cls - Turma a ser selecionada
   */
  const selectClass = async (cls: IClass) => {
    try {
      setClassLoading(true);
      setError(null);

      // Buscar detalhes completos da turma (incluindo alunos)
      const classData = await getClassById(cls.id);

      setSelectedClass(classData);
      // Converte IUser[] para IClassStudent[]
      const students = (classData.students || []).map((user, index) => ({
        id: index,
        classId: classData.id,
        studentId: user.id,
        student: user,
      }));
      setClassStudents(students);

      if (import.meta.env.DEV) {
        console.log('[TeacherStudents] Turma selecionada:', classData.id, 'Alunos:', classData.students?.length || 0);
      }
    } catch (err) {
      console.error('[TeacherStudents] Erro ao carregar alunos da turma:', err);
      setError('Erro ao carregar alunos. Por favor, tente novamente.');
      setSelectedClass(cls);
      setClassStudents([]);
    } finally {
      setClassLoading(false);
    }
  };

  /**
   * Aplica filtros de busca à listagem de alunos
   *
   * Realiza busca por:
   * - Nome do aluno (case-insensitive)
   */
  const applyFilters = () => {
    let filtered = [...classStudents];

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((cs) =>
        cs.student?.name?.toLowerCase().includes(term) ||
        cs.student?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  };

  /**
   * Retorna cor de badge para status do aluno
   *
   * @param {string | undefined} status - Status da matrícula
   * @returns {string} Classe Tailwind para cor
   */
  const getStatusBadgeColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ===== ESTADOS DE RENDERIZAÇÃO =====

  // Estado de carregamento inicial
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando turmas...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error && !selectedClass) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar dados</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button size="sm" onClick={loadClasses}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDERIZAÇÃO PRINCIPAL =====

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Alunos da Turma
          </h1>
          <p className="text-gray-600 mt-1">Visualizar alunos matriculados na turma selecionada</p>
        </div>
      </div>

      {/* Seleção de turma */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecione uma Turma</h2>

        {allClasses.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600">Você não tem nenhuma turma atribuída.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allClasses.map((cls) => (
              <button
                key={cls.id}
                onClick={() => selectClass(cls)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedClass?.id === cls.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                }`}
              >
                <div className="font-semibold text-gray-900">
                  {cls.semester}º Semestre - {cls.year}
                </div>
                <div className="text-sm text-gray-600 mt-1">{cls.course?.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                  <Users className="w-4 h-4" />
                  {cls.students?.length || 0} aluno{(cls.students?.length || 0) !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo principal (apenas se turma selecionada) */}
      {selectedClass && (
        <>
          {/* Informações da turma selecionada */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedClass.semester}º Semestre • {selectedClass.year}
                </h2>
                <p className="text-gray-600 mt-1">{selectedClass.course?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total de alunos</p>
                <p className="text-3xl font-bold text-blue-600">{classStudents.length}</p>
              </div>
            </div>
          </div>

          {/* Filtro de busca */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscar Alunos</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Buscar por nome ou email
              </label>
              <Input
                type="text"
                placeholder="Digite o nome ou email do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Listagem de alunos */}
          {classLoading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-blue-600 animate-spin" />
              <p className="text-gray-600">Carregando alunos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar alunos</h3>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <Button size="sm" onClick={() => selectClass(selectedClass)}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {classStudents.length === 0 ? 'Nenhum aluno matriculado' : 'Nenhum aluno encontrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {classStudents.length === 0
                  ? 'Esta turma ainda não tem alunos matriculados.'
                  : 'Nenhum aluno corresponde ao termo de busca.'}
              </p>
              {classStudents.length > 0 && searchTerm && (
                <Button size="sm" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Tabela para desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((classStudent) => (
                      <tr key={classStudent.id} className="hover:bg-gray-50 transition-colors">
                        {/* Nome */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {classStudent.student?.name || 'Aluno desconhecido'}
                              </p>
                              {classStudent.student?.login && (
                                <p className="text-sm text-gray-500">
                                  {classStudent.student.login}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {classStudent.student?.email || 'Email não informado'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                              classStudent.student?.role
                            )}`}
                          >
                            <UserCheck className="w-4 h-4" />
                            Matriculado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para mobile */}
              <div className="md:hidden space-y-4 p-4">
                {filteredStudents.map((classStudent) => (
                  <div
                    key={classStudent.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    {/* Cabeçalho do card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {classStudent.student?.name || 'Aluno desconhecido'}
                          </h3>
                          {classStudent.student?.login && (
                            <p className="text-sm text-gray-500 mt-1">
                              {classStudent.student.login}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 whitespace-nowrap">
                        Matriculado
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {classStudent.student?.email || 'Email não informado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informação adicional */}
          {filteredStudents.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Informação:</p>
                <p>
                  Exibindo{' '}
                  <span className="font-semibold">{filteredStudents.length}</span> de{' '}
                  <span className="font-semibold">{classStudents.length}</span> aluno
                  {classStudents.length !== 1 ? 's' : ''} da turma.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
