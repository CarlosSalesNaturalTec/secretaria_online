/**
 * Arquivo: frontend/src/pages/student/Requests.tsx
 * Descrição: Página de solicitações do aluno com formulário para criar solicitações e listagem
 * Feature: feat-093 - Criar página Requests (aluno)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir formulário para criar nova solicitação
 * - Listar todas as solicitações do aluno autenticado
 * - Exibir status de cada solicitação (pendente/aprovada/rejeitada)
 * - Permitir filtro por status
 * - Exibir prazo estimado de resposta
 * - Exibir observações do revisor quando disponível
 */

import { useEffect, useState, type JSX } from 'react';
import {
  FileText,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  create,
  getAll,
  getRequestTypes,
  calculateExpectedDate,
} from '@/services/request.service';
import type { IRequest, RequestStatus, IRequestType } from '@/types/request.types';

/**
 * Estados para filtro de solicitações
 */
type FilterStatus = 'all' | RequestStatus;

/**
 * Requests - Página de gerenciamento de solicitações do aluno
 *
 * Permite que o aluno visualize suas solicitações, crie novas solicitações
 * e acompanhe o status de cada uma (pendente, aprovada, rejeitada).
 *
 * @example
 * <Requests />
 */
export default function Requests() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [requestTypes, setRequestTypes] = useState<IRequestType[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);

  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  /**
   * Carrega solicitações e tipos de solicitação ao montar o componente
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Limpa mensagens de sucesso após 5 segundos
   */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  /**
   * Carrega solicitações e tipos de solicitação
   *
   * @throws {Error} Quando ocorre erro ao carregar dados
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar tipos de solicitação
      const types = await getRequestTypes();
      setRequestTypes(types);

      // Buscar solicitações do aluno autenticado
      const response = await getAll();
      setRequests(response.data);
    } catch (err) {
      console.error('[Requests] Erro ao carregar dados:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar suas solicitações. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra solicitações baseado no status selecionado
   *
   * @returns {IRequest[]} Lista de solicitações filtradas
   */
  const getFilteredRequests = (): IRequest[] => {
    if (filterStatus === 'all') {
      return requests;
    }
    return requests.filter((req) => req.status === filterStatus);
  };

  /**
   * Trata envio do formulário para criar nova solicitação
   *
   * @throws {Error} Quando validação ou envio falha
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTypeId || !description.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const newRequest = await create({
        requestTypeId: selectedTypeId,
        description: description.trim(),
      });

      setSuccess('Solicitação criada com sucesso!');
      setRequests([newRequest, ...requests]);

      // Resetar formulário
      setSelectedTypeId(null);
      setDescription('');
      setShowForm(false);

      if (import.meta.env.DEV) {
        console.log('[Requests] Solicitação criada:', newRequest);
      }
    } catch (err) {
      console.error('[Requests] Erro ao criar solicitação:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao criar solicitação. Tente novamente.'
      );
    } finally {
      setCreating(false);
    }
  };

  /**
   * Retorna ícone e cor baseado no status da solicitação
   *
   * @param {RequestStatus} status - Status da solicitação
   * @returns {{ icon: JSX.Element, colorClass: string, label: string }}
   */
  const getStatusIndicator = (
    status: RequestStatus
  ): { icon: JSX.Element; colorClass: string; label: string } => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          colorClass: 'text-green-600 bg-green-50 border-green-200',
          label: 'Aprovada',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          colorClass: 'text-red-600 bg-red-50 border-red-200',
          label: 'Rejeitada',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          label: 'Pendente',
        };
    }
  };

  /**
   * Formata data para exibição
   *
   * @param {string} dateString - Data em formato ISO
   * @returns {string} Data formatada (dd/mm/yyyy HH:mm)
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Obtém dados do tipo de solicitação pelo ID
   *
   * @param {number} typeId - ID do tipo de solicitação
   * @returns {IRequestType | undefined} Dados do tipo ou undefined
   */
  const getRequestType = (typeId: number): IRequestType | undefined => {
    return requestTypes.find((t) => t.id === typeId);
  };

  const filteredRequests = getFilteredRequests();
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Solicitações</h1>
          <p className="text-gray-600">
            Crie novas solicitações e acompanhe o status de cada uma
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancelar' : 'Nova Solicitação'}
        </Button>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Erro</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Sucesso</h3>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total</h3>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Solicitação(ões)</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pendentes</h3>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Aguardando análise</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Aprovadas</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-xs text-gray-500 mt-1">Solicitação(ões)</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Rejeitadas</h3>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
          <p className="text-xs text-gray-500 mt-1">Solicitação(ões)</p>
        </div>
      </div>

      {/* Formulário de Nova Solicitação */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600" />
            Criar Nova Solicitação
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Solicitação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Solicitação *
              </label>
              <select
                value={selectedTypeId || ''}
                onChange={(e) => setSelectedTypeId(Number(e.target.value) || null)}
                disabled={creating}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecione um tipo de solicitação</option>
                {requestTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.expectedDays} dias úteis)
                  </option>
                ))}
              </select>
              {selectedTypeId && (
                <p className="text-xs text-gray-500 mt-1">
                  {getRequestType(selectedTypeId)?.description}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição / Observações *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
                required
                placeholder="Descreva sua solicitação em detalhes..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 1000 caracteres</p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedTypeId(null);
                  setDescription('');
                  setError(null);
                }}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={creating}
                disabled={!selectedTypeId || !description.trim()}
              >
                Enviar Solicitação
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filtro de Status */}
      {requests.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filtrar por:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
              const labels: Record<FilterStatus, string> = {
                all: 'Todas',
                pending: 'Pendentes',
                approved: 'Aprovadas',
                rejected: 'Rejeitadas',
              };

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Solicitações */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {requests.length === 0
                ? 'Nenhuma solicitação criada'
                : 'Nenhuma solicitação com esse filtro'}
            </h3>
            <p className="text-gray-600">
              {requests.length === 0
                ? 'Crie sua primeira solicitação usando o botão acima.'
                : 'Tente ajustar os filtros para visualizar outras solicitações.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const statusIndicator = getStatusIndicator(request.status);
            const requestType = getRequestType(request.requestTypeId);
            const isExpanded = expandedRequestId === request.id;

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md border-l-4 border-gray-300 hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Cabeçalho da Solicitação */}
                <button
                  onClick={() =>
                    setExpandedRequestId(isExpanded ? null : request.id)
                  }
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
                >
                  {/* Informações Principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {requestType?.name || 'Solicitação'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 whitespace-nowrap ${statusIndicator.colorClass}`}
                      >
                        {statusIndicator.icon}
                        {statusIndicator.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Data:</span>{' '}
                        {formatDate(request.createdAt)}
                      </div>
                      {requestType && request.status === 'pending' && (
                        <div>
                          <span className="font-medium">Prazo estimado:</span>{' '}
                          {calculateExpectedDate(
                            new Date(request.createdAt),
                            requestType.expectedDays
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Expandir */}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
                    {/* Descrição Completa */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Descrição Completa
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {request.description}
                      </p>
                    </div>

                    {/* Informações Detalhadas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          ID da Solicitação
                        </p>
                        <p className="text-sm text-gray-900">#{request.id}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Tipo
                        </p>
                        <p className="text-sm text-gray-900">
                          {requestType?.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Criada em
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>

                      {request.reviewedAt && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Análise em
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(request.reviewedAt)}
                          </p>
                        </div>
                      )}

                      {requestType && request.status === 'pending' && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Prazo Estimado
                          </p>
                          <p className="text-sm text-gray-900">
                            {calculateExpectedDate(
                              new Date(request.createdAt),
                              requestType.expectedDays
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observações do Revisor */}
                    {request.status !== 'pending' && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          Observação do Revisor
                        </p>
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-2">
                          <p>
                            A solicitação foi{' '}
                            <span className="font-semibold">
                              {request.status === 'approved'
                                ? 'aprovada'
                                : 'rejeitada'}
                            </span>
                            {request.reviewer && (
                              <>
                                {' '}
                                por <span className="font-semibold">
                                  {request.reviewer.name}
                                </span>
                              </>
                            )}
                            .
                          </p>
                          {request.observations && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                Observações:
                              </p>
                              <p className="whitespace-pre-wrap">{request.observations}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
