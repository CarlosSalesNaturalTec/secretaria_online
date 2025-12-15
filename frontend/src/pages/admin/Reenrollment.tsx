/**
 * Arquivo: frontend/src/pages/admin/Reenrollment.tsx
 * Descrição: Página administrativa para rematrícula global de estudantes
 * Feature: feat-reenrollment-etapa-5 - Frontend Interface de Rematrícula Global
 * Criado em: 2025-12-15
 *
 * Responsabilidades:
 * - Exibir informações sobre a funcionalidade de rematrícula global
 * - Botão principal para abrir modal de rematrícula
 * - Exibir total de estudantes ativos (se disponível)
 * - Gerenciar estado do modal (aberto/fechado)
 */

import { useState } from 'react';
import {
  AlertTriangle,
  RefreshCcw,
  Users,
  Info,
  CheckCircle2,
} from 'lucide-react';
import GlobalReenrollmentModal from '@/components/modals/GlobalReenrollmentModal';

/**
 * Reenrollment - Página de Rematrícula Global
 *
 * Permite que administradores processem rematrícula de TODOS os estudantes
 * do sistema de uma vez, alterando status de matrículas para 'pending'.
 *
 * @returns Página de rematrícula global
 */
export default function Reenrollment() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Buscar total de estudantes ativos via API (opcional)
  // const totalActiveStudents = 150;

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Rematrícula Global de Estudantes
        </h1>
        <p className="mt-2 text-gray-600">
          Processe a rematrícula semestral de todos os estudantes ativos do
          sistema
        </p>
      </div>

      {/* Card de Informações */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-blue-900">
              Como funciona a rematrícula global?
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Todos os estudantes com matrícula <strong>ativa</strong> terão
                  seu status alterado para <strong>pendente</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Estudantes receberão notificação para aceitar contrato de
                  rematrícula
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Após aceitar, matrícula volta a ficar <strong>ativa</strong>{' '}
                  automaticamente
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Estudantes com status pendente não podem acessar o sistema
                  normalmente
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Card de Alerta */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600" />
          <div>
            <h2 className="text-lg font-semibold text-yellow-900">Atenção</h2>
            <ul className="mt-3 space-y-2 text-sm text-yellow-800">
              <li>
                • Esta operação afeta <strong>TODOS</strong> os estudantes
                ativos do sistema
              </li>
              <li>
                • A operação é processada em lote e não pode ser desfeita
                facilmente
              </li>
              <li>
                • Você precisará confirmar sua senha antes de processar
              </li>
              <li>
                • Recomenda-se executar esta operação fora do horário de pico
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Card Principal de Ação */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          {/* Ícone */}
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <RefreshCcw className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          {/* Título */}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Processar Rematrícula Global
          </h2>

          {/* Descrição */}
          <p className="mt-2 text-gray-600">
            Clique no botão abaixo para iniciar o processo de rematrícula de
            todos os estudantes
          </p>

          {/* TODO: Exibir total de estudantes ativos (quando disponível) */}
          {/* {totalActiveStudents !== undefined && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">
                {totalActiveStudents} estudantes ativos
              </span>
            </div>
          )} */}

          {/* Botão Principal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCcw className="h-5 w-5" />
            Iniciar Rematrícula Global
          </button>
        </div>
      </div>

      {/* Modal de Rematrícula */}
      <GlobalReenrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // totalActiveStudents={totalActiveStudents}
      />
    </div>
  );
}
