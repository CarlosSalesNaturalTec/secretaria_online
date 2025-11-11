/**
 * Arquivo: frontend/src/components/ui/Modal.tsx
 * Descrição: Componente de modal reutilizável usando Headless UI Dialog com overlay, close button e variantes de tamanho
 * Feature: feat-068 - Criar componente Modal
 * Criado em: 2025-11-03
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * Tamanhos disponíveis para o modal
 */
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props do componente Modal
 *
 * @interface ModalProps
 */
interface ModalProps {
  /**
   * Controla se o modal está aberto ou fechado
   */
  isOpen: boolean;

  /**
   * Callback executado quando o modal deve ser fechado
   * Chamado ao clicar no overlay, no botão X ou ao pressionar ESC
   */
  onClose: () => void;

  /**
   * Título do modal (opcional)
   * Exibido no topo com estilo destacado
   */
  title?: string;

  /**
   * Descrição/subtítulo do modal (opcional)
   * Exibido abaixo do título com cor mais suave
   */
  description?: string;

  /**
   * Conteúdo principal do modal
   */
  children: React.ReactNode;

  /**
   * Conteúdo do footer (opcional)
   * Normalmente usado para botões de ação (Salvar, Cancelar, etc.)
   */
  footer?: React.ReactNode;

  /**
   * Tamanho do modal
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Se true, exibe botão X para fechar no canto superior direito
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Se true, o modal pode ser fechado clicando no overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Classes CSS adicionais para o container do conteúdo
   */
  className?: string;
}

/**
 * Mapeamento de tamanhos para larguras máximas
 */
const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Componente Modal
 *
 * Modal reutilizável construído sobre Headless UI Dialog com suporte a diferentes tamanhos,
 * overlay, animações e acessibilidade completa.
 *
 * Responsabilidades:
 * - Renderizar overlay com backdrop blur
 * - Exibir conteúdo modal centralizado
 * - Gerenciar foco (focus trap)
 * - Permitir fechamento via ESC, overlay ou botão X
 * - Animar entrada e saída do modal
 * - Garantir acessibilidade (ARIA, keyboard navigation)
 * - Suportar diferentes tamanhos
 *
 * @example
 * // Modal básico
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmação"
 * >
 *   <p>Tem certeza que deseja continuar?</p>
 * </Modal>
 *
 * @example
 * // Modal com footer e ações
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Editar Aluno"
 *   description="Preencha os campos abaixo"
 *   size="lg"
 *   footer={
 *     <div className="flex justify-end gap-2">
 *       <Button variant="secondary" onClick={handleClose}>
 *         Cancelar
 *       </Button>
 *       <Button onClick={handleSave}>
 *         Salvar
 *       </Button>
 *     </div>
 *   }
 * >
 *   <StudentForm />
 * </Modal>
 *
 * @example
 * // Modal que não fecha ao clicar no overlay
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Processo em andamento"
 *   closeOnOverlayClick={false}
 *   showCloseButton={false}
 * >
 *   <p>Aguarde enquanto processamos sua solicitação...</p>
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}: ModalProps) {
  /**
   * Handler para clique no overlay
   * Só fecha o modal se closeOnOverlayClick for true
   */
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleOverlayClick}>
        {/* Overlay com backdrop blur e animação de fade */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* Container centralizado */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Panel do modal com animação de escala */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={[
                  'w-full',
                  sizeStyles[size],
                  'transform overflow-hidden rounded-lg',
                  'bg-white shadow-xl',
                  'transition-all',
                  className,
                ].join(' ')}
              >
                {/* Header (Título + Botão de fechar) */}
                {(title || showCloseButton) && (
                  <div className="relative border-b border-gray-200 px-6 py-4">
                    {/* Título e descrição */}
                    <div className={showCloseButton ? 'pr-8' : ''}>
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-gray-900"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-gray-500">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>

                    {/* Botão de fechar */}
                    {showCloseButton && (
                      <button
                        type="button"
                        className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        onClick={onClose}
                        aria-label="Fechar modal"
                      >
                        <X size={20} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Conteúdo principal */}
                <div className="px-6 py-4">
                  {children}
                </div>

                {/* Footer (ações) */}
                {footer && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
