/**
 * Arquivo: frontend/src/pages/admin/Requests.tsx
 * Descrição: Página de gestão de solicitações com listagem e ações de aprovação/rejeição
 * Feature: feat-088 - Criar request.service.ts e página Requests Admin
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Listar solicitações com filtros por status
 * - Visualizar detalhes de solicitações
 * - Aprovar solicitações pendentes
 * - Rejeitar solicitações com observações obrigatórias
 * - Exibir estatísticas de solicitações
 * - Calcular e exibir prazo estimado de resposta
 */

import { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import * as requestService from '@/services/request.service';
import type {
  IRequest,
  RequestStatus,
  IRequestStats,
} from '@/types/request.types';

/**
 * Cores de status para badges
 */
const statusColors: Record<
  RequestStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  approved: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
};

/**
 * Labels de status em português
 */
const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

/**
 * AdminRequests - Página de gestão de solicitações
 *
 * @returns Página de gestão de solicitações
 */
export default function AdminRequests() {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [stats, setStats] = useState<IRequestStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');

  // Estados do modal de ações
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [observations, setObservations] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  /**
   * Carrega solicitações e estatísticas ao montar o componente ou mudar filtro
   */
  useEffect(() => {
    loadRequestsAndStats();
  }, [filterStatus]);

  /**
   * Carrega solicitações da API com filtros aplicados
   */
  async function loadRequestsAndStats() {
    try {
      setLoading(true);
      setError(null);

      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};

      const [requestsResponse, statsData] = await Promise.all([
        requestService.getAll(filters),
        requestService.getStats(),
      ]);

      // Backend retorna data diretamente como array de requests (não data.requests)
      setRequests(Array.isArray(requestsResponse.data) ? requestsResponse.data : []);
      setStats(statsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar solicitações';
      setError(errorMessage);
      console.error('[AdminRequests] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Abre modal de detalhes
   */
  function handleOpenDetailsModal(request: IRequest) {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  }

  /**
   * Abre modal de aprovação
   */
  function handleOpenApproveModal(request: IRequest) {
    setSelectedRequest(request);
    setObservations('');
    setIsApproveModalOpen(true);
  }

  /**
   * Abre modal de rejeição
   */
  function handleOpenRejectModal(request: IRequest) {
    setSelectedRequest(request);
    setObservations('');
    setIsRejectModalOpen(true);
  }

  /**
   * Aprova solicitação
   */
  async function handleApprove() {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      await requestService.approve(selectedRequest.id, {
        observations: observations.trim() || undefined,
      });

      // Recarrega lista
      await loadRequestsAndStats();

      // Fecha modal
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      setObservations('');
    } catch (err) {
      console.error('[AdminRequests] Erro ao aprovar solicitação:', err);
      alert('Erro ao aprovar solicitação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  /**
   * Rejeita solicitação
   */
  async function handleReject() {
    if (!selectedRequest) return;

    if (!observations.trim()) {
      alert('Observações são obrigatórias ao rejeitar uma solicitação.');
      return;
    }

    try {
      setActionLoading(true);
      await requestService.reject(selectedRequest.id, {
        observations: observations.trim(),
      });

      // Recarrega lista
      await loadRequestsAndStats();

      // Fecha modal
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setObservations('');
    } catch (err) {
      console.error('[AdminRequests] Erro ao rejeitar solicitação:', err);
      alert('Erro ao rejeitar solicitação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  /**
   * Formata data para exibição
   */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formata data simples
   */
  function formatSimpleDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Calcula prazo estimado
   */
  function getExpectedDate(request: IRequest): string {
    if (!request.requestType) return 'N/A';

    return requestService.calculateExpectedDate(
      new Date(request.createdAt),
      request.requestType.expectedDays
    );
  }

  /**
   * Verifica se solicitação está atrasada
   */
  function isOverdue(request: IRequest): boolean {
    if (request.status !== 'pending' || !request.requestType) return false;

    const expectedDate = new Date(
      requestService.calculateExpectedDate(
        new Date(request.createdAt),
        request.requestType.expectedDays
      ).split('/').reverse().join('-')
    );

    return new Date() > expectedDate;
  }

  /**
   * Renderiza estado de loading
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de erro
   */
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Erro ao carregar solicitações
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => loadRequestsAndStats()}
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
   * Renderiza página de solicitações
   */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Solicitações
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie solicitações enviadas por alunos
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-600" size={20} />
          <label className="text-sm font-medium text-gray-700">
            Filtrar por status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Rejeitadas</option>
          </select>
        </div>
      </div>

      {/* Lista de solicitações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Solicitação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo Estimado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className={`hover:bg-gray-50 ${
                      isOverdue(request) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {request.student?.name || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {request.student?.email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {request.requestType?.name || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Prazo: {request.requestType?.expectedDays || 0} dias úteis
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                            statusColors[request.status].bg
                          } ${statusColors[request.status].text} ${
                            statusColors[request.status].border
                          }`}
                        >
                          {statusLabels[request.status]}
                        </span>
                        {isOverdue(request) && (
                          <AlertTriangle
                            className="text-red-600"
                            size={16}
                            aria-label="Solicitação atrasada"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSimpleDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.status === 'pending' ? (
                        <span
                          className={
                            isOverdue(request) ? 'text-red-600 font-semibold' : ''
                          }
                        >
                          {getExpectedDate(request)}
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetailsModal(request)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalhes"
                        >
                          <FileText size={18} />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApproveModal(request)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Aprovar"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(request)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Rejeitar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes da Solicitação"
        size="lg"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <User className="text-gray-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Aluno</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedRequest.student?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.student?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b">
              <FileText className="text-gray-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Tipo de Solicitação</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedRequest.requestType?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.requestType?.description || ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b">
              <Calendar className="text-gray-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Data da Solicitação</p>
                <p className="text-base font-semibold text-gray-900">
                  {formatDate(selectedRequest.createdAt)}
                </p>
                {selectedRequest.status === 'pending' && (
                  <p className="text-sm text-gray-600">
                    Prazo estimado: {getExpectedDate(selectedRequest)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Descrição</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedRequest.description || 'Sem descrição'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${
                  statusColors[selectedRequest.status].bg
                } ${statusColors[selectedRequest.status].text} ${
                  statusColors[selectedRequest.status].border
                }`}
              >
                {statusLabels[selectedRequest.status]}
              </span>
            </div>

            {selectedRequest.status !== 'pending' && (
              <>
                {selectedRequest.reviewedBy && selectedRequest.reviewer && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <User className="text-gray-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Revisado por</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedRequest.reviewer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.reviewedAt
                          ? formatDate(selectedRequest.reviewedAt)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de aprovação */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Aprovar Solicitação"
        description={`Você está prestes a aprovar a solicitação de "${selectedRequest?.requestType?.name}" de ${selectedRequest?.student?.name}`}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsApproveModalOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Aprovar
                </>
              )}
            </button>
          </div>
        }
      >
        <div>
          <label
            htmlFor="approve-observations"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Observações (opcional)
          </label>
          <textarea
            id="approve-observations"
            rows={4}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Adicione observações sobre a aprovação..."
          />
        </div>
      </Modal>

      {/* Modal de rejeição */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Rejeitar Solicitação"
        description={`Você está prestes a rejeitar a solicitação de "${selectedRequest?.requestType?.name}" de ${selectedRequest?.student?.name}`}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rejeitando...
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  Rejeitar
                </>
              )}
            </button>
          </div>
        }
      >
        <div>
          <label
            htmlFor="reject-observations"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Observações <span className="text-red-600">*</span>
          </label>
          <textarea
            id="reject-observations"
            rows={4}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Explique o motivo da rejeição (obrigatório)..."
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            As observações são obrigatórias ao rejeitar uma solicitação.
          </p>
        </div>
      </Modal>
    </div>
  );
}
