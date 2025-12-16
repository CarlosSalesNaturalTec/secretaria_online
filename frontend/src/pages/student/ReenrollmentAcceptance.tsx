/**
 * Arquivo: frontend/src/pages/student/ReenrollmentAcceptance.tsx
 * Descrição: Página de aceite de rematrícula para estudantes
 * Feature: feat-reenrollment-etapa-7 - Frontend Tela de Aceite
 * Criado em: 2025-12-15
 *
 * Responsabilidades:
 * - Exibir contrato de rematrícula em HTML para estudante com status 'pending'
 * - Permitir aceite de rematrícula via botão de confirmação
 * - Bloquear acesso a outras rotas até aceitar contrato
 * - Redirecionar para dashboard após aceite
 * - Mostrar loading, erro e feedback durante processo
 */

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useContractPreview, useAcceptReenrollment } from '@/hooks/useReenrollment';
import { AuthContext } from '@/contexts/AuthContext';
import enrollmentService from '@/services/enrollment.service';

/**
 * ReenrollmentAcceptance - Página de aceite de rematrícula
 *
 * Exibe contrato de rematrícula dinâmico para estudantes com enrollment pending.
 * Estudante deve aceitar contrato antes de acessar sistema normalmente.
 *
 * FLUXO:
 * 1. Busca enrollment ativo do estudante
 * 2. Busca preview do contrato HTML
 * 3. Exibe contrato em div scrollable
 * 4. Estudante clica em "Aceitar e Confirmar Rematrícula"
 * 5. Chama mutation para aceitar
 * 6. Enrollment status muda para 'active' e contrato é criado
 * 7. Redireciona para dashboard
 *
 * @example
 * <ReenrollmentAcceptance />
 */
export default function ReenrollmentAcceptance() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  // Hook para buscar preview do contrato
  const {
    data: preview,
    isLoading: isLoadingPreview,
    error: previewError,
  } = useContractPreview(enrollmentId);

  // Hook para aceitar rematrícula
  const {
    mutate: acceptReenrollment,
    isPending: isAccepting,
    error: acceptError,
  } = useAcceptReenrollment();

  /**
   * Busca enrollment ativo do estudante ao montar componente
   */
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setLoadingEnrollment(true);
        setEnrollmentError(null);

        const pendingEnrollment = await enrollmentService.getMyPendingEnrollment();

        if (!pendingEnrollment) {
          // Se não há enrollment pending, redirecionar para dashboard
          console.log(
            '[ReenrollmentAcceptance] Nenhum enrollment pendente. Redirecionando...'
          );
          navigate('/student/dashboard');
          return;
        }

        setEnrollmentId(pendingEnrollment.id);
      } catch (error: any) {
        console.error('[ReenrollmentAcceptance] Erro ao buscar enrollment:', error);
        setEnrollmentError(
          error.message || 'Erro ao carregar dados de matrícula'
        );
      } finally {
        setLoadingEnrollment(false);
      }
    };

    if (user?.role === 'student') {
      fetchEnrollment();
    }
  }, [user, navigate]);

  /**
   * Aceita rematrícula e redireciona para dashboard
   */
  const handleAcceptReenrollment = () => {
    if (!enrollmentId) {
      alert('Erro: ID do enrollment não encontrado');
      return;
    }

    acceptReenrollment(enrollmentId, {
      onSuccess: (data) => {
        console.log(
          '[ReenrollmentAcceptance] Rematrícula aceita com sucesso:',
          data
        );
        // Redirecionar para dashboard após aceite
        navigate('/student/dashboard');
      },
      onError: (error) => {
        console.error('[ReenrollmentAcceptance] Erro ao aceitar:', error);
        alert(`Erro ao aceitar rematrícula: ${error.message}`);
      },
    });
  };

  // Loading inicial: buscando enrollment
  if (loadingEnrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-600">
            Carregando dados de matrícula...
          </p>
        </div>
      </div>
    );
  }

  // Erro ao buscar enrollment
  if (enrollmentError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Erro ao Carregar Matrícula
          </h1>
          <p className="text-gray-600 text-center mb-4">{enrollmentError}</p>
          <Button
            onClick={() => navigate('/student/dashboard')}
            variant="primary"
            className="w-full"
          >
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Loading: buscando preview do contrato
  if (isLoadingPreview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto text-blue-600 animate-pulse" />
          <p className="mt-4 text-lg text-gray-600">
            Carregando contrato de rematrícula...
          </p>
        </div>
      </div>
    );
  }

  // Erro ao buscar preview
  if (previewError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Erro ao Carregar Contrato
          </h1>
          <p className="text-gray-600 text-center mb-4">
            {previewError.message}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="w-full"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Preview carregado com sucesso
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Aceite de Rematrícula
            </h1>
          </div>
          <p className="text-gray-600">
            Por favor, leia o contrato de rematrícula abaixo e clique em "Aceitar
            e Confirmar Rematrícula" para continuar.
          </p>
          {preview && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Período:</span>
              <span>
                {preview.semester}º Semestre de {preview.year}
              </span>
            </div>
          )}
        </div>

        {/* Alert de atenção */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Você precisa aceitar este contrato para
                continuar acessando o sistema. Leia com atenção todos os termos
                antes de aceitar.
              </p>
            </div>
          </div>
        </div>

        {/* Contrato em HTML */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div
            className="prose max-w-none overflow-y-auto border border-gray-200 rounded-lg p-6"
            style={{
              maxHeight: '500px',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{
              __html: preview?.contractHTML || '',
            }}
          />
        </div>

        {/* Erro ao aceitar */}
        {acceptError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">
                  <strong>Erro:</strong> {acceptError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAcceptReenrollment}
              variant="primary"
              disabled={isAccepting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Aceitar e Confirmar Rematrícula
                </>
              )}
            </Button>
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">
            Ao clicar em "Aceitar e Confirmar Rematrícula", você concorda com todos
            os termos apresentados acima.
          </p>
        </div>
      </div>
    </div>
  );
}
