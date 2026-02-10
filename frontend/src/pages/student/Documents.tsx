/**
 * Arquivo: frontend/src/pages/student/Documents.tsx
 * Descrição: Página de upload e listagem de documentos obrigatórios do aluno
 * Feature: feat-092 - Criar página Documents (aluno)
 * Criado em: 2025-11-04
 *
 * Responsabilidades:
 * - Exibir lista de documentos obrigatórios ainda não enviados
 * - Permitir upload de documentos (PDF, JPG, PNG)
 * - Exibir status de cada documento (pendente/aprovado/rejeitado)
 * - Permitir reenvio de documentos rejeitados
 * - Validar tamanho máximo de arquivo (10MB)
 * - Mostrar feedback visual de sucesso/erro
 */

import { useEffect, useState, type JSX } from 'react';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  getAll,
  downloadFile,
  viewFile,
  upload
} from '@/services/document.service';
import { getAll as getAllDocumentTypes } from '@/services/documentType.service';
import type { IDocument, DocumentStatus } from '@/types/document.types';
import type { IDocumentType } from '@/services/documentType.service';

/**
 * Estados para filtro de documentos
 */
type FilterStatus = 'all' | DocumentStatus;

/**
 * Documents - Página de gerenciamento de documentos do aluno
 *
 * Permite que o aluno visualize documentos obrigatórios, envie novos documentos
 * e acompanhe o status de cada um (pendente, aprovado, rejeitado).
 *
 * @example
 * <Documents />
 */
export default function Documents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<IDocumentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(null);

  /**
   * Carrega documentos e tipos de documentos ao montar o componente
   */
  useEffect(() => {
    loadDocuments();
    loadDocumentTypes();
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
   * Carrega todos os documentos do aluno autenticado
   *
   * @throws {Error} Quando ocorre erro ao carregar documentos
   */
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar documentos do aluno autenticado
      const response = await getAll({ userType: 'student' });
      setDocuments(response.data.documents);

      if (import.meta.env.DEV) {
        console.log('[Documents] Documentos carregados:', response.data.documents.length);
      }
    } catch (err) {
      console.error('[Documents] Erro ao carregar documentos:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar seus documentos. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega tipos de documentos para alunos
   *
   * @throws {Error} Quando ocorre erro ao carregar tipos de documentos
   */
  const loadDocumentTypes = async () => {
    try {
      setLoadingTypes(true);

      // Buscar tipos de documentos para alunos
      const response = await getAllDocumentTypes({ userType: 'student' });
      setDocumentTypes(response.data.documentTypes);

      if (import.meta.env.DEV) {
        console.log('[Documents] Tipos de documentos carregados:', response.data.documentTypes.length);
      }
    } catch (err) {
      console.error('[Documents] Erro ao carregar tipos de documentos:', err);
      // Não exibe erro na interface, apenas log
    } finally {
      setLoadingTypes(false);
    }
  };

  /**
   * Filtra documentos baseado no status selecionado
   *
   * @returns {IDocument[]} Lista de documentos filtrados
   */
  const getFilteredDocuments = (): IDocument[] => {
    if (filterStatus === 'all') {
      return documents;
    }
    return documents.filter((doc) => doc.status === filterStatus);
  };

  /**
   * Valida o arquivo selecionado
   *
   * @param {File} file - Arquivo a validar
   * @returns {boolean} True se arquivo é válido
   */
  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Apenas arquivos PDF, JPG e PNG são permitidos');
      return false;
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 10MB permitido');
      return false;
    }

    return true;
  };

  /**
   * Trata mudança de arquivo selecionado
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de mudança de input
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setError(null);
    } else if (file) {
      event.target.value = '';
    }
  };

  /**
   * Trata envio de novo documento
   *
   * @throws {Error} Quando validação ou envio falha
   */
  const handleUpload = async () => {
    if (!selectedFile || !selectedDocTypeId) {
      setError('Selecione um arquivo e um tipo de documento');
      return;
    }

    try {
      setUploadingId(selectedDocTypeId);
      setError(null);

      // Criar FormData com arquivo
      const formData = new FormData();
      formData.append('document_type_id', selectedDocTypeId.toString());
      formData.append('document', selectedFile);

      if (import.meta.env.DEV) {
        console.log('[Documents] Enviando arquivo:', {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          documentTypeId: selectedDocTypeId,
        });
      }

      // Fazer upload do documento
      await upload(formData);

      setSuccess(`Documento "${selectedFile.name}" enviado com sucesso!`);
      setSelectedFile(null);
      setSelectedDocTypeId(null);

      // Resetar input de arquivo
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Recarregar documentos
      await loadDocuments();
    } catch (err) {
      console.error('[Documents] Erro ao fazer upload:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao fazer upload do arquivo'
      );
    } finally {
      setUploadingId(null);
    }
  };

  /**
   * Trata download de documento
   *
   * @param {IDocument} document - Documento a baixar
   */
  const handleDownload = async (document: IDocument) => {
    try {
      setError(null);
      await downloadFile(document.id, document.fileName);
    } catch (err) {
      console.error('[Documents] Erro ao baixar documento:', err);
      setError('Erro ao baixar o documento. Tente novamente');
    }
  };

  /**
   * Trata visualização de documento
   *
   * @param {IDocument} document - Documento a visualizar
   */
  const handleView = async (document: IDocument) => {
    try {
      setError(null);

      // Buscar arquivo com autenticação
      const blob = await viewFile(document.id);

      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(blob);

      // Abrir em nova aba
      window.open(url, '_blank');

      // Liberar URL após um tempo
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('[Documents] Erro ao visualizar documento:', err);
      setError('Erro ao visualizar o documento. Tente novamente');
    }
  };

  /**
   * Retorna ícone e cor baseado no status do documento
   *
   * @param {DocumentStatus} status - Status do documento
   * @returns {{ icon: JSX.Element, colorClass: string, label: string }}
   */
  const getStatusIndicator = (
    status: DocumentStatus
  ): { icon: JSX.Element; colorClass: string; label: string } => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          colorClass: 'text-green-600 bg-green-50 border-green-200',
          label: 'Aprovado',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          colorClass: 'text-red-600 bg-red-50 border-red-200',
          label: 'Rejeitado',
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
   * Formata tamanho de arquivo para exibição
   *
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado (ex: "2.5 MB")
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocuments = getFilteredDocuments();
  const stats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === 'approved').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Documentos</h1>
        <p className="text-gray-600">
          Envie os documentos obrigatórios e acompanhe o status de cada um
        </p>
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
          <p className="text-xs text-gray-500 mt-1">Documentos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Aprovados</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-xs text-gray-500 mt-1">Documento(s)</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pendentes</h3>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Análise</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Rejeitados</h3>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
          <p className="text-xs text-gray-500 mt-1">Para reenviar</p>
        </div>
      </div>

      {/* Formulário de Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          Enviar Novo Documento
        </h2>

        <div className="space-y-4">
          {/* Seleção de Tipo de Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento *
            </label>
            <select
              value={selectedDocTypeId || ''}
              onChange={(e) => setSelectedDocTypeId(Number(e.target.value) || null)}
              disabled={uploadingId !== null || loadingTypes}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingTypes ? 'Carregando tipos...' : 'Selecione um tipo de documento'}
              </option>
              {documentTypes.map((docType) => (
                <option key={docType.id} value={docType.id}>
                  {docType.name}
                  {docType.is_required ? ' (Obrigatório)' : ''}
                </option>
              ))}
            </select>
            {selectedDocTypeId && documentTypes.find(dt => dt.id === selectedDocTypeId)?.description && (
              <p className="mt-2 text-sm text-gray-600">
                {documentTypes.find(dt => dt.id === selectedDocTypeId)?.description}
              </p>
            )}
          </div>

          {/* Input de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo (PDF, JPG, PNG) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="file-input"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={uploadingId !== null}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Clique para selecionar ou arraste o arquivo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 10MB • PDF, JPG ou PNG
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-600">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Botão de Upload */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedDocTypeId || uploadingId !== null}
            className="w-full"
          >
            {uploadingId !== null ? 'Enviando...' : 'Enviar Documento'}
          </Button>
        </div>
      </div>

      {/* Filtro de Status */}
      {documents.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filtrar por:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
              const labels: Record<FilterStatus, string> = {
                all: 'Todos',
                pending: 'Pendentes',
                approved: 'Aprovados',
                rejected: 'Rejeitados',
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

      {/* Lista de Documentos */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {documents.length === 0
                ? 'Nenhum documento enviado'
                : 'Nenhum documento com esse filtro'}
            </h3>
            <p className="text-gray-600">
              {documents.length === 0
                ? 'Comece a enviar seus documentos obrigatórios usando o formulário acima.'
                : 'Tente ajustar os filtros para visualizar outros documentos.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((document) => {
            const statusIndicator = getStatusIndicator(document.status);

            return (
              <div
                key={document.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-300 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Informações do Documento */}
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.documentType?.name || 'Documento'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusIndicator.colorClass}`}>
                          {statusIndicator.icon}
                          {statusIndicator.label}
                        </span>
                      </div>

                      {document.documentType?.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {document.documentType.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Arquivo</p>
                          <p className="text-gray-900 font-medium">
                            {document.fileName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tamanho</p>
                          <p className="text-gray-900 font-medium">
                            {formatFileSize(document.fileSize)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data de Envio</p>
                          <p className="text-gray-900 font-medium">
                            {formatDate(document.createdAt)}
                          </p>
                        </div>
                        {document.reviewedAt && (
                          <div>
                            <p className="text-gray-500">Data de Análise</p>
                            <p className="text-gray-900 font-medium">
                              {formatDate(document.reviewedAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Observações do Revisor */}
                      {document.observations && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Observação do Revisor:
                          </p>
                          <p className="text-sm text-gray-700">
                            {document.observations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleView(document)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
