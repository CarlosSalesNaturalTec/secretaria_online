/**
 * Arquivo: frontend/src/components/forms/EvaluationForm.tsx
 * Descrição: Formulário de cadastro e edição de avaliações
 * Feature: feat-evaluation-ui - Criar interface de gerenciamento de avaliações
 * Criado em: 2025-12-09
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTeachers } from '@/hooks/useTeachers';
import ClassService from '@/services/class.service';
import DisciplineService from '@/services/discipline.service';
import type { IEvaluation, ICreateEvaluationData, IUpdateEvaluationData } from '@/types/evaluation.types';
import type { IClass } from '@/types/class.types';
import type { IDiscipline } from '@/types/course.types';

const evaluationFormSchema = z.object({
  classId: z.coerce.number().min(1, 'Turma é obrigatória'),
  teacherId: z.coerce.number().optional(),
  disciplineId: z.coerce.number().min(1, 'Disciplina é obrigatória'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200, 'Nome deve ter no máximo 200 caracteres'),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['grade', 'concept'], { message: 'Tipo é obrigatório' }),
});

type EvaluationFormData = z.infer<typeof evaluationFormSchema>;

interface EvaluationFormProps {
  initialData?: IEvaluation;
  onSubmit: (data: ICreateEvaluationData | IUpdateEvaluationData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function EvaluationForm({ initialData, onSubmit, onCancel, loading = false }: EvaluationFormProps) {
  const { user } = useAuth();
  const { listTeachers } = useTeachers();

  const [classes, setClasses] = useState<IClass[]>([]);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingDisciplines, setLoadingDisciplines] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';
  const teachers = listTeachers.data || [];

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationFormSchema) as any,
    defaultValues: {
      classId: 0,
      teacherId: undefined,
      disciplineId: 0,
      name: '',
      date: '',
      type: 'grade',
    },
  });

  const watchClassId = watch('classId');

  useEffect(() => {
    loadClasses();
    loadDisciplines();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        classId: initialData.classId,
        teacherId: initialData.teacherId || undefined,
        disciplineId: initialData.disciplineId,
        name: initialData.name,
        date: initialData.date,
        type: initialData.type,
      });
      setSelectedClassId(initialData.classId);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (watchClassId) {
      setSelectedClassId(Number(watchClassId));
    }
  }, [watchClassId]);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const data = await ClassService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('[EvaluationForm] Erro ao carregar turmas:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadDisciplines = async () => {
    try {
      setLoadingDisciplines(true);
      const result = await DisciplineService.getAll();
      setDisciplines(result.data);
    } catch (error) {
      console.error('[EvaluationForm] Erro ao carregar disciplinas:', error);
    } finally {
      setLoadingDisciplines(false);
    }
  };

  const getFilteredDisciplines = (): IDiscipline[] => {
    if (!selectedClassId) return disciplines;

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    if (!selectedClass || !selectedClass.disciplines || selectedClass.disciplines.length === 0) {
      return disciplines;
    }

    const classDisciplineIds = selectedClass.disciplines.map((d) => d.id);
    return disciplines.filter((d) => classDisciplineIds.includes(d.id));
  };

  const handleFormSubmit = async (data: EvaluationFormData) => {
    try {
      // Validação: Admin deve selecionar um professor
      if (isAdmin && (!data.teacherId || data.teacherId === 0)) {
        alert('Por favor, selecione um professor responsável pela avaliação.');
        return;
      }

      // Se for professor, remove o teacherId do objeto (backend resolve automaticamente)
      if (!isAdmin) {
        delete data.teacherId;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('[EvaluationForm] Erro ao submeter formulário:', error);
    }
  };

  const isEditMode = !!initialData;
  const filteredDisciplines = getFilteredDisciplines();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Avaliação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turma <span className="text-red-500">*</span>
            </label>
            <select
              {...register('classId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || loadingClasses}
            >
              <option value="">Selecione uma turma...</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.course?.name} - Semestre {classItem.semester}/{classItem.year}
                </option>
              ))}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>}
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professor <span className="text-red-500">*</span>
              </label>
              <select
                {...register('teacherId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || listTeachers.isLoading}
              >
                <option value="">Selecione um professor...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.nome} {teacher.email ? `(${teacher.email})` : ''}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>}
              {listTeachers.isLoading && (
                <p className="mt-1 text-sm text-gray-500">Carregando professores...</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina <span className="text-red-500">*</span>
            </label>
            <select
              {...register('disciplineId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || loadingDisciplines || !selectedClassId}
            >
              <option value="">Selecione uma disciplina...</option>
              {filteredDisciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name} {discipline.code ? `(${discipline.code})` : ''}
                </option>
              ))}
            </select>
            {errors.disciplineId && <p className="mt-1 text-sm text-red-600">{errors.disciplineId.message}</p>}
            {selectedClassId && filteredDisciplines.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">Nenhuma disciplina vinculada a esta turma</p>
            )}
          </div>

          <Input
            {...register('name')}
            label="Nome da Avaliação"
            placeholder="Ex: Prova Final, Trabalho em Grupo"
            error={errors.name?.message}
            disabled={loading}
            required
          />

          <Input
            {...register('date')}
            type="date"
            label="Data"
            error={errors.date?.message}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Avaliação <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  {...register('type')}
                  type="radio"
                  value="grade"
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">Nota (0-10)</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('type')}
                  type="radio"
                  value="concept"
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">Conceito (Satisfatório/Insatisfatório)</span>
              </label>
            </div>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}

        <Button type="submit" loading={loading} disabled={loading}>
          {isEditMode ? 'Atualizar Avaliação' : 'Cadastrar Avaliação'}
        </Button>
      </div>
    </form>
  );
}
