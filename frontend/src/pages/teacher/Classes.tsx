/**
 * Arquivo: frontend/src/pages/teacher/Classes.tsx
 * Descrição: Página de listagem de turmas do professor com opções para gerenciar alunos e lançar notas
 * Feature: feat-095 - Criar página Classes (professor)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir listagem completa de turmas do professor autenticado
 * - Mostrar informações da turma: curso, disciplina, semestre, ano, quantidade de alunos
 * - Fornecer links de ação: "Ver Alunos" e "Lançar Notas"
 * - Tratamento de loading, erros e estado vazio
 * - Busca e filtro de turmas (por semestre/ano ou curso)
 * - Responsividade em desktop, tablet e smartphone
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Search,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getAll as getAllClasses } from '@/services/class.service';
import type { IClass } from '@/types/class.types';

/**
 * TeacherClasses - Página de turmas do professor
 *
 * Exibe uma tabela com todas as turmas do professor logado, incluindo:
 * - Nome da turma (semestre e ano)
 * - Curso
 * - Disciplinas (professores)
 * - Quantidade de alunos
 * - Ações (ver alunos, lançar notas)
 *
 * @example
 * <TeacherClasses />
 */
export default function TeacherClasses() {
  // Estados de carregamento e erro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de dados
  const [allClasses, setAllClasses] = useState<IClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<IClass[]>([]);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  /**
   * Carrega as turmas ao montar o componente
   */
  useEffect(() => {
    loadClasses();
  }, []);

  /**
   * Atualiza a listagem filtrada quando os filtros mudam
   */
  useEffect(() => {
    applyFilters();
  }, [allClasses, searchTerm, selectedSemester]);

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
      setFilteredClasses(classes);

      if (import.meta.env.DEV) {
        console.log('[TeacherClasses] Turmas carregadas:', classes.length);
      }
    } catch (err) {
      console.error('[TeacherClasses] Erro ao carregar turmas:', err);
      setError('Erro ao carregar turmas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplica filtros de busca e semestre à listagem de turmas
   *
   * Realiza busca por:
   * - Nome do curso (case-insensitive)
   * - Semestre (se selecionado)
   * - Ano letivo
   */
  const applyFilters = () => {
    let filtered = [...allClasses];

    // Filtro por semestre
    if (selectedSemester !== 'all') {
      const [semester, year] = selectedSemester.split('-');
      filtered = filtered.filter(
        (cls) =>
          cls.semester.toString() === semester &&
          cls.year.toString() === year
      );
    }

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((cls) =>
        cls.course?.name?.toLowerCase().includes(term)
      );
    }

    setFilteredClasses(filtered);
  };

  /**
   * Obtém lista de semestres únicos para o filtro
   *
   * @returns {Array<{semester: number, year: number}>} Lista de semestres disponíveis
   */
  const getUniqueSemesters = (): Array<{ semester: number; year: number }> => {
    const semesters = new Map<string, { semester: number; year: number }>();

    allClasses.forEach((cls) => {
      const key = `${cls.semester}-${cls.year}`;
      if (!semesters.has(key)) {
        semesters.set(key, { semester: cls.semester, year: cls.year });
      }
    });

    return Array.from(semesters.values()).sort(
      (a, b) => b.year - a.year || b.semester - a.semester
    );
  };

  /**
   * Formata informações de professores/disciplinas
   *
   * @param {IClass} classItem - Turma para extrair informações
   * @returns {string} String com nomes de disciplinas
   */
  const formatDisciplines = (classItem: IClass): string => {
    if (!classItem.disciplines || classItem.disciplines.length === 0) {
      return 'Sem disciplinas atribuídas';
    }

    return classItem.disciplines
      .map((d) => d.name || 'Disciplina desconhecida')
      .join(', ');
  };

  /**
   * Retorna cor de badge para semestre
   *
   * @param {number} semester - Semestre
   * @returns {string} Classe Tailwind para cor
   */
  const getSemesterBadgeColor = (semester: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[(semester - 1) % colors.length];
  };

  // Estado de carregamento
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
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar turmas</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button size="sm" onClick={loadClasses}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Cabeçalho
  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Minhas Turmas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerenciar turmas, visualizar alunos e lançar notas
          </p>
        </div>

        {/* Botão para criar turma (admin only, comentado para teacher) */}
        {/* <Link to="/teacher/classes/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Turma
          </Button>
        </Link> */}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Busca por curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              Buscar por curso
            </label>
            <Input
              type="text"
              placeholder="Digite o nome do curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtro por semestre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Semestre/Ano
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              {getUniqueSemesters().map((sem) => (
                <option
                  key={`${sem.semester}-${sem.year}`}
                  value={`${sem.semester}-${sem.year}`}
                >
                  {sem.semester}º Semestre / {sem.year}
                </option>
              ))}
            </select>
          </div>

          {/* Informação de resultados */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {filteredClasses.length}
              </span>{' '}
              turma{filteredClasses.length !== 1 ? 's' : ''} encontrada
              {filteredClasses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Listagem de turmas */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma turma encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {allClasses.length === 0
              ? 'Você ainda não tem nenhuma turma atribuída.'
              : 'Nenhuma turma corresponde aos filtros selecionados.'}
          </p>
          {allClasses.length > 0 && searchTerm && (
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
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Disciplinas
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Alunos
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClasses.map((classItem) => (
                  <tr
                    key={classItem.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Turma */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {classItem.semester}º Semestre
                          </p>
                          <p className="text-sm text-gray-600">
                            Ano {classItem.year}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Curso */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {classItem.course?.name || 'Curso desconhecido'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {classItem.course?.duration}{' '}
                        {classItem.course?.durationType}
                      </p>
                    </td>

                    {/* Disciplinas */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDisciplines(classItem)}
                      </p>
                    </td>

                    {/* Quantidade de alunos */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {classItem.students?.length || 0}
                        </span>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/teacher/classes/${classItem.id}/students`}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver Alunos</span>
                        </Link>
                        <Link
                          to={`/teacher/classes/${classItem.id}/grades`}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Lançar Notas</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards para mobile */}
          <div className="md:hidden space-y-4 p-4">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {/* Cabeçalho do card */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {classItem.semester}º Semestre • {classItem.year}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {classItem.course?.name || 'Curso desconhecido'}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getSemesterBadgeColor(
                      classItem.semester
                    )}`}
                  >
                    Semestre {classItem.semester}
                  </span>
                </div>

                {/* Informações */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Disciplinas:</p>
                    <p className="text-gray-900 font-medium">
                      {formatDisciplines(classItem)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {classItem.students?.length || 0} aluno
                      {(classItem.students?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-2">
                  <Link
                    to={`/teacher/classes/${classItem.id}/students`}
                    className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                  >
                    Ver Alunos
                  </Link>
                  <Link
                    to={`/teacher/classes/${classItem.id}/grades`}
                    className="flex-1 py-2 px-3 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                  >
                    Lançar Notas
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informação adicional */}
      {filteredClasses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Dica:</p>
            <p>
              Clique em "Ver Alunos" para gerenciar os alunos da turma ou em
              "Lançar Notas" para fazer o lançamento de avaliações.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
