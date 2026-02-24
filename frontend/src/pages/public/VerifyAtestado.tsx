/**
 * Arquivo: frontend/src/pages/public/VerifyAtestado.tsx
 * Descrição: Página pública para verificação da autenticidade de Atestados de Matrícula
 *            via hash de assinatura eletrônica. Acessível sem autenticação.
 * Feature: Atestado de Matrícula com Assinatura Eletrônica
 * Criado em: 2026-02-24
 *
 * Responsabilidades:
 * - Receber o hash de assinatura via query param ou formulário
 * - Chamar API pública de verificação
 * - Exibir resultado da validação (válido / inválido)
 * - Exibir dados do atestado quando válido (nome, curso, data de emissão)
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Search, Shield, AlertCircle, FileText } from 'lucide-react';
import { verifyAtestado } from '@/services/request.service';
import type { IAtestadoVerificationResult } from '@/services/request.service';

/**
 * VerifyAtestado - Página pública de verificação de autenticidade de atestados
 *
 * Permite que qualquer pessoa consulte se um Atestado de Matrícula é autêntico
 * informando o hash de assinatura eletrônica impresso no rodapé do documento.
 *
 * @example
 * // Acesso direto com hash na URL:
 * /verificar-atestado?hash=a1b2c3d4e5f67890
 *
 * @returns Página de verificação de atestado
 */
export default function VerifyAtestado() {
  const [searchParams] = useSearchParams();
  const [hash, setHash] = useState<string>(searchParams.get('hash') ?? '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IAtestadoVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Se hash veio pela URL, realiza verificação automática ao montar
   */
  useEffect(() => {
    const hashFromUrl = searchParams.get('hash');
    if (hashFromUrl && hashFromUrl.trim().length === 16) {
      setHash(hashFromUrl.trim());
      handleVerify(hashFromUrl.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Realiza a verificação do hash na API pública
   *
   * @param {string} hashToVerify - Hash a verificar (opcional, usa estado se omitido)
   */
  async function handleVerify(hashToVerify?: string) {
    const targetHash = (hashToVerify ?? hash).trim().toLowerCase();

    if (!targetHash) {
      setErrorMessage('Informe o código de assinatura eletrônica do documento.');
      return;
    }

    if (!/^[0-9a-f]{16}$/i.test(targetHash)) {
      setErrorMessage('O código deve conter exatamente 16 caracteres hexadecimais (0-9 e a-f).');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setErrorMessage(null);

      const response = await verifyAtestado(targetHash);
      setResult(response);
    } catch (err) {
      console.error('[VerifyAtestado] Erro na verificação:', err);
      setErrorMessage('Erro ao consultar o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Trata envio do formulário
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleVerify();
  }

  /**
   * Formata data para exibição em português
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Verificação de Autenticidade
            </h1>
            <p className="text-sm text-gray-500">Secretaria Online — Sistema Acadêmico</p>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Card de instrução */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <FileText className="text-indigo-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Atestado de Matrícula — Consulta de Validade
                </h2>
                <p className="text-sm text-gray-600">
                  Informe o código de assinatura eletrônica (hash) impresso no rodapé do
                  Atestado de Matrícula para verificar se o documento é autêntico e foi
                  emitido por este sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário de verificação */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="hash-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Código de Assinatura Eletrônica
                </label>
                <div className="flex gap-3">
                  <input
                    id="hash-input"
                    type="text"
                    value={hash}
                    onChange={(e) => {
                      setHash(e.target.value);
                      setResult(null);
                      setErrorMessage(null);
                    }}
                    placeholder="Ex: a1b2c3d4e5f67890"
                    maxLength={16}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    disabled={loading || !hash.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Search size={18} />
                    )}
                    {loading ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  16 caracteres hexadecimais (letras de a até f e números de 0 a 9)
                </p>
              </div>
            </form>
          </div>

          {/* Mensagem de erro de validação */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Resultado: Documento VÁLIDO */}
          {result && result.valid && result.data && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={28} />
                <div>
                  <p className="text-lg font-bold text-green-800">Documento Válido</p>
                  <p className="text-sm text-green-700">
                    Este atestado foi emitido pelo sistema e é autêntico.
                  </p>
                </div>
              </div>

              <div className="border-t border-green-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                    Aluno
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{result.data.studentName}</p>
                  {result.data.studentMatricula && (
                    <p className="text-xs text-gray-500">
                      Matrícula: {result.data.studentMatricula}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                    Curso
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{result.data.courseName}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                    Data de Emissão
                  </p>
                  <p className="text-sm text-gray-900">
                    {result.data.issuedAt ? formatDate(result.data.issuedAt) : 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                    Assinatura Eletrônica
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-900">
                    {result.data.signatureHash}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultado: Documento INVÁLIDO */}
          {result && !result.valid && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 flex items-start gap-4">
              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={28} />
              <div>
                <p className="text-lg font-bold text-red-800">Documento Não Encontrado</p>
                <p className="text-sm text-red-700 mt-1">
                  {result.message ||
                    'O código informado não corresponde a nenhum atestado emitido por este sistema. ' +
                      'Verifique se o código foi digitado corretamente.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <p className="text-center text-xs text-gray-400">
          Secretaria Online — Sistema de Gestão Acadêmica
        </p>
      </footer>
    </div>
  );
}
