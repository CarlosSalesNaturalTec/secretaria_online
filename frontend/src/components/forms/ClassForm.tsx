/**
 * Arquivo: frontend/src/components/forms/ClassForm.tsx
 * Descrição: Formulário de cadastro e edição de turmas
 * Feature: feat-086 - Criar class.service.ts e página Classes
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Renderizar formulário completo de turma
 * - Validar dados com Zod schema
 * - Suportar modo criação e edição
 * - Integrar com React Hook Form
 * - Permitir vinculação de professores e alunos
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { IClass } from '@/types/class.types';
import type { ICourse } from '@/types/course.types';
import type { IUser } from '@/types/user.types';
import type { IDiscipline } from '@/types/course.types';
import type {
  ICreateClassData,
  IUpdateClassData,
  ITeacherDisciplineAssignment
} from '@/services/class.service';
import * as CourseService from '@/services/course.service';
import * as StudentService from '@/services/student.service';
import * as TeacherService from '@/services/teacher.service';

/**
 * Schema de validação Zod para formulário de turma
 *
 * Valida todos os campos obrigatórios com suas respectivas regras
 */
const classFormSchema = z.object({
  courseId: z.number()
    .int('Curso deve ser selecionado')
    .min(1, 'Curso é obrigatório'),

  semester: z.number()
    .int('Semestre deve ser um número inteiro')
    .min(1, 'Semestre mínimo é 1')
    .max(20, 'Semestre máximo é 20'),

  year: z.number()
    .int('Ano deve ser um número inteiro')
    .min(new Date().getFullYear() - 10, `Ano mínimo é ${new Date().getFullYear() - 10}`)
    .max(new Date().getFullYear() + 10, `Ano máximo é ${new Date().getFullYear() + 10}`),
});

/**
 * Tipo inferido do schema de validação
 */
type ClassFormData = z.infer<typeof classFormSchema>;

/**
 * Props do componente ClassForm
 */
interface ClassFormProps {
  /**
   * Dados iniciais da turma (modo edição)
   * Se não fornecido, formulário inicia vazio (modo criação)
   */
  initialData?: IClass;

  /**
   * Callback executado ao submeter o formulário
   * Recebe os dados validados da turma
   */
  onSubmit: (data: ICreateClassData | IUpdateClassData) => void | Promise<void>;

  /**
   * Callback executado ao cancelar o formulário
   */
  onCancel?: () => void;

  /**
   * Indica se o formulário está em estado de loading (salvando)
   * @default false
   */
  loading?: boolean;
}

/**
 * Componente ClassForm
 *
 * Formulário completo de cadastro e edição de turmas com validação robusta
 * e vinculação de professores/alunos.
 *
 * @example
 * // Modo criação
 * <ClassForm
 *   onSubmit={handleCreate}
 *   onCancel={handleCancel}
 *   loading={isCreating}
 * />
 *
 * @example
 * // Modo edição
 * <ClassForm
 *   initialData={classData}
 *   onSubmit={handleUpdate}
 *   onCancel={handleCancel}
 *   loading={isUpdating}
 * />
 */
export function ClassForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ClassFormProps) {
  /**
   * Estado para listas de dados
   */
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [students, setStudents] = useState<IUser[]>([]);
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);

  /**
   * Estado de loading para carregar dados
   */
  const [loadingData, setLoadingData] = useState<boolean>(true);

  /**
   * Estado para gerenciar professores vinculados
   */
  const [selectedTeachers, setSelectedTeachers] = useState<ITeacherDisciplineAssignment[]>([]);

  /**
   * Estado para gerenciar alunos vinculados
   */
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  /**
   * Configuração do React Hook Form com Zod resolver
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      courseId: 0,
      semester: 1,
      year: new Date().getFullYear(),
    },
  });

  /**
   * Observa mudanças no curso selecionado para carregar disciplinas
   */
  const selectedCourseId = watch('courseId');

  /**
   * Carrega dados necessários ao montar o componente
   */
  useEffect(() => {
    loadFormData();
  }, []);

  /**
   * Atualiza lista de disciplinas quando curso muda
   */
  useEffect(() => {
    if (selectedCourseId > 0) {
      const course = courses.find(c => c.id === selectedCourseId);

      if (course && course.disciplines && course.disciplines.length > 0) {
        // Extrai as disciplinas do array de ICourseDiscipline
        const courseDisciplines = course.disciplines
          .map(cd => cd.discipline)
          .filter(Boolean);

        setDisciplines(courseDisciplines);
      } else {
        setDisciplines([]);
      }
    } else {
      setDisciplines([]);
    }
  }, [selectedCourseId, courses]);

  /**
   * Preenche formulário com dados iniciais quando em modo edição
   */
  useEffect(() => {
    if (initialData) {
      reset({
        courseId: initialData.courseId || 0,
        semester: initialData.semester || 1,
        year: initialData.year || new Date().getFullYear(),
      });

      // Preencher professores vinculados
      if (initialData.teachers && initialData.teachers.length > 0) {
        const teacherAssignments = initialData.teachers.map(ct => ({
          teacherId: ct.teacherId,
          disciplineId: ct.disciplineId,
        }));
        setSelectedTeachers(teacherAssignments);
      }

      // Preencher alunos vinculados
      if (initialData.students && initialData.students.length > 0) {
        const studentIds = initialData.students.map(cs => cs.studentId);
        setSelectedStudents(studentIds);
      }
    }
  }, [initialData, reset]);

  /**
   * Carrega cursos, professores e alunos
   */
  const loadFormData = async () => {
    try {
      setLoadingData(true);

      const [coursesData, studentsData, teachersData] = await Promise.all([
        CourseService.getAll(),
        StudentService.getAll(),
        TeacherService.getAll(),
      ]);

      setCourses(coursesData);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('[ClassForm] Erro ao carregar dados:', error);
      alert('Erro ao carregar dados necessários para o formulário');
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Adiciona professor à lista de vinculados
   */
  const handleAddTeacher = () => {
    setSelectedTeachers([...selectedTeachers, { teacherId: 0, disciplineId: 0 }]);
  };

  /**
   * Remove professor da lista de vinculados
   */
  const handleRemoveTeacher = (index: number) => {
    setSelectedTeachers(selectedTeachers.filter((_, i) => i !== index));
  };

  /**
   * Atualiza professor vinculado
   */
  const handleUpdateTeacher = (index: number, field: 'teacherId' | 'disciplineId', value: number) => {
    const updated = [...selectedTeachers];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedTeachers(updated);
  };

  /**
   * Toggle de aluno selecionado
   */
  const handleToggleStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  /**
   * Handler de submit do formulário
   */
  const handleFormSubmit = async (data: ClassFormData) => {
    try {
      // Validar professores
      const validTeachers = selectedTeachers.filter(
        t => t.teacherId > 0 && t.disciplineId > 0
      );

      // Construir payload
      const payload: ICreateClassData | IUpdateClassData = {
        courseId: data.courseId,
        semester: data.semester,
        year: data.year,
        teachers: validTeachers.length > 0 ? validTeachers : undefined,
        studentIds: selectedStudents.length > 0 ? selectedStudents : undefined,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error('[ClassForm] Erro ao submeter formulário:', error);
    }
  };

  /**
   * Determina se está em modo edição ou criação
   */
  const isEditMode = !!initialData;

  /**
   * Renderiza estado de carregamento
   */
  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Seção: Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Dados Básicos
        </h3>

        {/* Curso */}
        <div>
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
            Curso <span className="text-red-500">*</span>
          </label>
          <select
            id="courseId"
            {...register('courseId', { valueAsNumber: true })}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={0}>Selecione um curso</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
          )}
        </div>

        {/* Semestre e Ano */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Semestre"
            type="number"
            required
            min={1}
            max={20}
            {...register('semester', { valueAsNumber: true })}
            error={errors.semester?.message}
            disabled={loading}
          />

          <Input
            label="Ano"
            type="number"
            required
            min={new Date().getFullYear() - 10}
            max={new Date().getFullYear() + 10}
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
            disabled={loading}
          />
        </div>
      </div>

      {/* Seção: Professores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Professores
          </h3>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddTeacher}
            disabled={loading || disciplines.length === 0}
          >
            <Plus size={16} />
            Adicionar Professor
          </Button>
        </div>

        {disciplines.length === 0 && (
          <p className="text-sm text-gray-600 italic">
            Selecione um curso primeiro para vincular professores
          </p>
        )}

        {selectedTeachers.map((teacher, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
            <div className="flex-1 grid grid-cols-2 gap-3">
              {/* Professor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professor
                </label>
                <select
                  value={teacher.teacherId}
                  onChange={(e) => handleUpdateTeacher(index, 'teacherId', Number(e.target.value))}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value={0}>Selecione um professor</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Disciplina */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disciplina
                </label>
                <select
                  value={teacher.disciplineId}
                  onChange={(e) => handleUpdateTeacher(index, 'disciplineId', Number(e.target.value))}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value={0}>Selecione uma disciplina</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botão Remover */}
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => handleRemoveTeacher(index)}
              disabled={loading}
              title="Remover professor"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>

      {/* Seção: Alunos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Alunos
        </h3>

        {students.length === 0 ? (
          <p className="text-sm text-gray-600 italic">
            Nenhum aluno cadastrado no sistema
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
            {students.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleToggleStudent(student.id)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-600">{student.email}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600">
          {selectedStudents.length} aluno(s) selecionado(s)
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}

        <Button type="submit" loading={loading} disabled={loading}>
          {isEditMode ? 'Atualizar turma' : 'Cadastrar turma'}
        </Button>
      </div>
    </form>
  );
}
