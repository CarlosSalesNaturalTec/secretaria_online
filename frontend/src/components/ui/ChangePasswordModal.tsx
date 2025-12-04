/**
 * Arquivo: frontend/src/components/ui/ChangePasswordModal.tsx
 * Descrição: Modal para alteração de senha do usuário autenticado
 * Feature: Trocar senha
 * Criado em: 2025-12-04
 *
 * Responsabilidades:
 * - Exibir formulário de alteração de senha
 * - Validar campos (senha atual, nova senha, confirmação)
 * - Chamar serviço de autenticação para alterar senha
 * - Exibir feedback de sucesso ou erro
 */

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { changePassword } from '@/services/auth.service';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ChangePasswordModal - Modal para alterar senha
 *
 * Permite que usuário autenticado altere sua senha fornecendo:
 * - Senha atual
 * - Nova senha
 * - Confirmação da nova senha
 *
 * @param {ChangePasswordModalProps} props - Props do componente
 * @returns {JSX.Element} Modal de alteração de senha
 *
 * @example
 * <ChangePasswordModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 * />
 */
export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Reseta o estado do formulário
   */
  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(false);
  };

  /**
   * Fecha o modal e reseta formulário
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Valida os campos do formulário
   */
  const validateForm = (): string | null => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return 'Todos os campos são obrigatórios';
    }

    if (oldPassword.length < 6) {
      return 'Senha atual deve ter no mínimo 6 caracteres';
    }

    if (newPassword.length < 6) {
      return 'Nova senha deve ter no mínimo 6 caracteres';
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return 'Nova senha deve conter letras e números';
    }

    if (newPassword !== confirmPassword) {
      return 'Nova senha e confirmação não coincidem';
    }

    if (oldPassword === newPassword) {
      return 'Nova senha deve ser diferente da senha atual';
    }

    return null;
  };

  /**
   * Submete o formulário de alteração de senha
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);

      // Fecha o modal após 2 segundos de sucesso
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('[ChangePasswordModal] Erro ao alterar senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Trocar Senha"
      size="md"
    >
      {success ? (
        <div className="py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Senha alterada com sucesso!
            </h3>
            <p className="text-sm text-gray-600">
              Sua senha foi alterada. Fechando...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Campo: Senha Atual */}
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Senha Atual *
            </label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Campo: Nova Senha */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha *
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 6 caracteres, com letras e números
            </p>
          </div>

          {/* Campo: Confirmar Nova Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite novamente sua nova senha"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
