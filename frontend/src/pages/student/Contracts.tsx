/**
 * Arquivo: frontend/src/pages/student/Contracts.tsx
 * Descrição: Página de visualização e download de contratos do estudante
 * Criado em: 2025-12-24
 *
 * Responsabilidades:
 * - Exibir lista de todos os contratos do estudante
 * - Mostrar status de cada contrato (Pendente/Aceito)
 * - Permitir download de PDF dos contratos
 * - Mostrar semestre, ano e data de aceite
 */

import { type JSX } from 'react';
import { FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useContracts, useDownloadContractPdf } from '@/hooks';
import type { IContract } from '@/types/contract.types';

/**
 * Formata data para formato brasileiro (DD/MM/YYYY)
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Retorna ícone e cor baseado no status do contrato
 */
function getStatusBadge(status: 'pending' | 'accepted'): JSX.Element {
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Aceito
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
      <Clock className="w-3 h-3" />
      Pendente
    </span>
  );
}

/**
 * Contracts - Página de contratos do estudante
 *
 * Permite que o estudante visualize todos os seus contratos (histórico completo),
 * veja o status de cada um e faça download dos PDFs.
 *
 * @example
 * <Contracts />
 */
export default function Contracts() {
  const { data: contracts, isLoading, error, refetch } = useContracts();
  const { mutate: downloadPdf, isPending: isDownloading } = useDownloadContractPdf();

  /**
   * Faz download do PDF de um contrato
   */
  const handleDownloadPdf = (contract: IContract) => {
    if (!contract.fileName || !contract.filePath) {
      alert('PDF não disponível para este contrato');
      return;
    }

    downloadPdf(
      {
        id: contract.id,
        fileName: contract.fileName,
      },
      {
        onSuccess: () => {
          console.log('[Contracts] PDF baixado com sucesso');
        },
        onError: (err) => {
          console.error('[Contracts] Erro ao baixar PDF:', err);
          alert('Erro ao baixar PDF. Tente novamente.');
        },
      }
    );
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Carregando contratos...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Erro ao carregar contratos</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Estado vazio
  if (!contracts || contracts.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-16 h-16 mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhum contrato encontrado</h3>
          <p className="text-gray-600">Você ainda não possui contratos cadastrados no sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Contratos</h1>
        <p className="mt-1 text-gray-600">
          Visualize e baixe todos os seus contratos de matrícula e rematrícula
        </p>
      </div>

      {/* Tabela de contratos */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Semestre/Ano
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Data de Aceite
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Data de Criação
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {contract.semester}º Semestre / {contract.year}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contract.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(contract.acceptedAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(contract.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {contract.filePath && contract.fileName ? (
                      <Button
                        onClick={() => handleDownloadPdf(contract)}
                        disabled={isDownloading}
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">PDF não disponível</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer com resumo */}
      <div className="mt-4 text-sm text-gray-600">
        Total de contratos: <span className="font-medium">{contracts.length}</span>
      </div>
    </div>
  );
}
