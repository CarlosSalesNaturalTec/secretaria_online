/**
 * Arquivo: frontend/src/pages/admin/Contracts.tsx
 * Descrição: Página de visualização e gerenciamento de contratos (admin)
 * Criado em: 2025-12-24
 *
 * Responsabilidades:
 * - Exibir lista de TODOS os contratos do sistema
 * - Mostrar informações do aluno de cada contrato
 * - Permitir filtrar por status (Pendente/Aceito)
 * - Permitir download de PDF dos contratos
 * - Mostrar semestre, ano e data de aceite
 */

import { useState, type JSX } from 'react';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
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
 * Contracts - Página de contratos para administradores
 *
 * Permite que administradores visualizem todos os contratos do sistema,
 * filtrem por status e façam download dos PDFs.
 *
 * @example
 * <Contracts />
 */
export default function Contracts() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar contratos (sem filtro de userId, admin vê todos)
  const { data: contracts, isLoading, error, refetch } = useContracts(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
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
          console.log('[AdminContracts] PDF baixado com sucesso');
        },
        onError: (err) => {
          console.error('[AdminContracts] Erro ao baixar PDF:', err);
          alert('Erro ao baixar PDF. Tente novamente.');
        },
      }
    );
  };

  // Filtrar contratos por nome do aluno
  const filteredContracts = contracts?.filter((contract) => {
    if (!searchTerm) return true;
    const userName = contract.user?.name?.toLowerCase() || '';
    const userEmail = contract.user?.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return userName.includes(search) || userEmail.includes(search);
  });

  // Estatísticas
  const stats = {
    total: contracts?.length || 0,
    pending: contracts?.filter((c) => c.status === 'pending').length || 0,
    accepted: contracts?.filter((c) => c.status === 'accepted').length || 0,
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
          <Button onClick={() => refetch()} variant="secondary" size="sm">
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
          <p className="text-gray-600">Não há contratos cadastrados no sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contratos de Alunos</h1>
        <p className="mt-1 text-gray-600">
          Visualize e gerencie todos os contratos de matrícula e rematrícula
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Contratos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aceitos</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row">
        {/* Busca por aluno */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou email do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por status */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'accepted')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="accepted">Aceitos</option>
          </select>
        </div>
      </div>

      {/* Tabela de contratos */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Aluno
                </th>
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
              {filteredContracts && filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {contract.user?.name || 'Sem nome'}
                        </span>
                        <span className="text-sm text-gray-500">{contract.user?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {contract.semester}º Semestre / {contract.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contract.status)}</td>
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
                          variant="secondary"
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum contrato encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer com resumo */}
      <div className="mt-4 text-sm text-gray-600">
        {filteredContracts && filteredContracts.length > 0 ? (
          <span>
            Exibindo <span className="font-medium">{filteredContracts.length}</span> de{' '}
            <span className="font-medium">{contracts.length}</span> contratos
          </span>
        ) : (
          <span>Total de contratos: <span className="font-medium">{contracts.length}</span></span>
        )}
      </div>
    </div>
  );
}
