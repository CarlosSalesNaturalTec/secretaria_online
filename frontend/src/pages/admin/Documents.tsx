/**
 * Arquivo: frontend/src/pages/admin/Documents.tsx
 * Descrição: Página de gestão de documentos com listagem e ações de aprovação/rejeição
 * Feature: feat-087 - Criar document.service.ts e página Documents Admin
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Listar documentos com filtros por status
 * - Visualizar documentos enviados
 * - Aprovar documentos pendentes
 * - Rejeitar documentos com observações obrigatórias
 * - Exibir estatísticas de documentos
 */

import { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import * as documentService from '@/services/document.service';
import type {
  IDocument,
  DocumentStatus,
  IDocumentStats,
} from '@/types/document.types';

/**
 * Cores de status para badges
 */
const statusColors: Record<
  DocumentStatus,
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
const statusLabels: Record<DocumentStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

/**
 * AdminDocuments - Página de gestão de documentos
 *
 * @returns Página de gestão de documentos
 */
export default function AdminDocuments() {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [stats, setStats] = useState<IDocumentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');

  // Estados do modal de ações
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [observations, setObservations] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  /**
   * Carrega documentos e estatísticas ao montar o componente ou mudar filtro
   */
  useEffect(() => {
    loadDocumentsAndStats();
  }, [filterStatus]);

  /**
   * Carrega documentos da API com filtros aplicados
   */
  async function loadDocumentsAndStats() {
    try {
      setLoading(true);
      setError(null);

      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};

      const [documentsResponse, statsData] = await Promise.all([
        documentService.getAll(filters),
        documentService.getStats(),
      ]);

      setDocuments(documentsResponse.data.documents);
      setStats(statsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar documentos';
      setError(errorMessage);
      console.error('[AdminDocuments] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Abre modal de aprovação
   */
  function handleOpenApproveModal(document: IDocument) {
    setSelectedDocument(document);
    setObservations('');
    setIsApproveModalOpen(true);
  }

  /**
   * Abre modal de rejeição
   */
  function handleOpenRejectModal(document: IDocument) {
    setSelectedDocument(document);
    setObservations('');
    setIsRejectModalOpen(true);
  }

  /**
   * Aprova documento
   */
  async function handleApprove() {
    if (!selectedDocument) return;

    try {
      setActionLoading(true);
      await documentService.approve(selectedDocument.id, {
        observations: observations.trim() || undefined,
      });

      // Recarrega lista
      await loadDocumentsAndStats();

      // Fecha modal
      setIsApproveModalOpen(false);
      setSelectedDocument(null);
      setObservations('');
    } catch (err) {
      console.error('[AdminDocuments] Erro ao aprovar documento:', err);
      alert('Erro ao aprovar documento. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  /**
   * Rejeita documento
   */
  async function handleReject() {
    if (!selectedDocument) return;

    if (!observations.trim()) {
      alert('Observações são obrigatórias ao rejeitar um documento.');
      return;
    }

    try {
      setActionLoading(true);
      await documentService.reject(selectedDocument.id, {
        observations: observations.trim(),
      });

      // Recarrega lista
      await loadDocumentsAndStats();

      // Fecha modal
      setIsRejectModalOpen(false);
      setSelectedDocument(null);
      setObservations('');
    } catch (err) {
      console.error('[AdminDocuments] Erro ao rejeitar documento:', err);
      alert('Erro ao rejeitar documento. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  /**
   * Faz download do documento
   */
  async function handleDownload(document: IDocument) {
    try {
      await documentService.downloadFile(document.id, document.fileName);
    } catch (err) {
      console.error('[AdminDocuments] Erro ao baixar documento:', err);
      alert('Erro ao baixar documento. Tente novamente.');
    }
  }

  /**
   * Visualiza documento em nova aba
   */
  async function handleView(document: IDocument) {
    try {
      // Buscar arquivo com autenticação
      const blob = await documentService.viewFile(document.id);

      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(blob);

      // Abrir em nova aba
      window.open(url, '_blank');

      // Liberar URL após um tempo
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('[AdminDocuments] Erro ao visualizar documento:', err);
      alert('Erro ao visualizar documento. Tente novamente.');
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
   * Formata tamanho de arquivo
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Renderiza estado de loading
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentos...</p>
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
              Erro ao carregar documentos
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => loadDocumentsAndStats()}
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
   * Renderiza página de documentos
   */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Documentos
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e valide documentos enviados por alunos e professores
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
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejeitados</p>
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
            onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Nenhum documento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arquivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {document.user?.name || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {document.user?.email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {document.documentType?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {document.fileName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.fileSize)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                          statusColors[document.status].bg
                        } ${statusColors[document.status].text} ${
                          statusColors[document.status].border
                        }`}
                      >
                        {statusLabels[document.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(document.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(document)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(document)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Baixar"
                        >
                          <Download size={18} />
                        </button>
                        {document.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApproveModal(document)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Aprovar"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(document)}
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

      {/* Modal de aprovação */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Aprovar Documento"
        description={`Você está prestes a aprovar o documento "${selectedDocument?.documentType?.name}" de ${selectedDocument?.user?.name}`}
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
        title="Rejeitar Documento"
        description={`Você está prestes a rejeitar o documento "${selectedDocument?.documentType?.name}" de ${selectedDocument?.user?.name}`}
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
            As observações são obrigatórias ao rejeitar um documento.
          </p>
        </div>
      </Modal>
    </div>
  );
}
