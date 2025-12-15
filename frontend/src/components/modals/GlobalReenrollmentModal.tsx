/**
 * Arquivo: frontend/src/components/modals/GlobalReenrollmentModal.tsx
 * Descrição: Modal para processar rematrícula global de TODOS os estudantes do sistema
 * Feature: feat-reenrollment-etapa-5 - Frontend Interface de Rematrícula Global
 * Criado em: 2025-12-15
 *
 * Responsabilidades:
 * - Exibir formulário para capturar semestre, ano e senha do admin
 * - Validar dados antes de enviar
 * - Exibir confirmação antes de processar rematrícula
 * - Mostrar loading durante processamento
 * - Exibir feedback de sucesso/erro
 * - Invalidar cache após sucesso
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import { useProcessGlobalReenrollment } from '@/hooks/useReenrollment';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Schema de validação com Zod
 */
const reenrollmentSchema = z.object({
  semester: z
    .number({ required_error: 'Semestre é obrigatório' })
    .int('Semestre deve ser um número inteiro')
    .min(1, 'Semestre deve ser 1 ou 2')
    .max(2, 'Semestre deve ser 1 ou 2'),
  year: z
    .number({ required_error: 'Ano é obrigatório' })
    .int('Ano deve ser um número inteiro')
    .min(2020, 'Ano inválido')
    .max(2100, 'Ano inválido'),
  adminPassword: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type ReenrollmentFormData = z.infer<typeof reenrollmentSchema>;

interface GlobalReenrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalActiveStudents?: number; // Total de estudantes ativos (opcional, para exibir no modal)
}

/**
 * Modal de Rematrícula Global
 *
 * Permite que administradores processem rematrícula de TODOS os estudantes
 * do sistema de uma vez, capturando semestre, ano e validando senha.
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <GlobalReenrollmentModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   totalActiveStudents={150}
 * />
 */
export default function GlobalReenrollmentModal({
  isOpen,
  onClose,
  totalActiveStudents,
}: GlobalReenrollmentModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] =
    useState<ReenrollmentFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReenrollmentFormData>({
    resolver: zodResolver(reenrollmentSchema),
    defaultValues: {
      semester: 1,
      year: new Date().getFullYear(),
      adminPassword: '',
    },
  });

  const { mutate: processReenrollment, isPending } =
    useProcessGlobalReenrollment();

  /**
   * Primeiro step: Validar formulário e mostrar confirmação
   */
  const onSubmitForm = (data: ReenrollmentFormData) => {
    setFormDataToSubmit(data);
    setShowConfirmation(true);
  };

  /**
   * Segundo step: Confirmar e processar rematrícula
   */
  const handleConfirmReenrollment = () => {
    if (!formDataToSubmit) return;

    processReenrollment(formDataToSubmit, {
      onSuccess: (data) => {
        // Fechar modal
        handleCloseModal();

        // Exibir toast de sucesso (pode usar biblioteca de toast externa)
        alert(
          `Rematrícula processada com sucesso!\n\n${data.totalStudents} estudantes foram rematriculados.`
        );
      },
      onError: (error: Error) => {
        // Voltar para formulário em caso de erro
        setShowConfirmation(false);

        // Exibir toast de erro
        alert(`Erro ao processar rematrícula:\n\n${error.message}`);
      },
    });
  };

  /**
   * Fecha modal e reseta estado
   */
  const handleCloseModal = () => {
    onClose();
    reset();
    setShowConfirmation(false);
    setFormDataToSubmit(null);
  };

  /**
   * Volta para formulário (cancela confirmação)
   */
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setFormDataToSubmit(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={
        showConfirmation
          ? 'Confirmar Rematrícula Global'
          : 'Rematrícula Global de Estudantes'
      }
      description={
        showConfirmation
          ? undefined
          : 'Processa rematrícula de TODOS os estudantes ativos do sistema'
      }
      size="md"
      closeOnOverlayClick={!isPending} // Não permitir fechar durante processamento
      showCloseButton={!isPending} // Não mostrar botão X durante processamento
    >
      {!showConfirmation ? (
        // FORMULÁRIO: Capturar dados
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Informação sobre total de estudantes */}
          {totalActiveStudents !== undefined && (
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <p>
                <strong>Total de estudantes ativos:</strong>{' '}
                {totalActiveStudents}
              </p>
              <p className="mt-1 text-xs">
                Todos os estudantes com matrícula ativa serão rematriculados.
              </p>
            </div>
          )}

          {/* Campo: Semestre */}
          <div>
            <label
              htmlFor="semester"
              className="block text-sm font-medium text-gray-700"
            >
              Semestre <span className="text-red-500">*</span>
            </label>
            <select
              id="semester"
              {...register('semester', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={1}>1º Semestre</option>
              <option value={2}>2º Semestre</option>
            </select>
            {errors.semester && (
              <p className="mt-1 text-sm text-red-600">
                {errors.semester.message}
              </p>
            )}
          </div>

          {/* Campo: Ano */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700"
            >
              Ano <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="year"
              {...register('year', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="2025"
              min={2020}
              max={2100}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>

          {/* Campo: Senha do Admin */}
          <div>
            <label
              htmlFor="adminPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Sua senha (confirmação) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="adminPassword"
              {...register('adminPassword')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Digite sua senha"
            />
            {errors.adminPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.adminPassword.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Sua senha será validada antes de processar a rematrícula.
            </p>
          </div>

          {/* Botões */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Avançar
            </button>
          </div>
        </form>
      ) : (
        // CONFIRMAÇÃO: Exibir resumo e confirmar
        <div className="space-y-4">
          {/* Ícone de alerta */}
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>

          {/* Mensagem de atenção */}
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-800">
              ATENÇÃO: Operação Irreversível
            </p>
            <p className="mt-2 text-sm text-yellow-700">
              Você está prestes a rematricular{' '}
              <strong>
                TODOS os{' '}
                {totalActiveStudents !== undefined
                  ? totalActiveStudents
                  : 'estudantes ativos'}{' '}
                do sistema
              </strong>
              .
            </p>
            <p className="mt-2 text-sm text-yellow-700">
              O status de matrícula de todos os estudantes será alterado para
              "Pendente" e eles precisarão aceitar o contrato de rematrícula
              antes de acessar o sistema novamente.
            </p>
          </div>

          {/* Resumo da operação */}
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">
              Dados da rematrícula:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>
                • <strong>Semestre:</strong> {formDataToSubmit?.semester}º
                Semestre
              </li>
              <li>
                • <strong>Ano:</strong> {formDataToSubmit?.year}
              </li>
              <li>
                • <strong>Estudantes afetados:</strong>{' '}
                {totalActiveStudents !== undefined
                  ? totalActiveStudents
                  : 'Todos os estudantes ativos'}
              </li>
            </ul>
          </div>

          {/* Mensagem durante processamento */}
          {isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processando rematrícula... Aguarde.</span>
            </div>
          )}

          {/* Botões */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelConfirmation}
              disabled={isPending}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleConfirmReenrollment}
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar e Processar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
