/**
 * Arquivo: frontend/src/components/layout/DashboardLayout.tsx
 * Descrição: Componente de layout principal que compõe Header + Sidebar + conteúdo
 * Feature: feat-073 - Criar componente DashboardLayout
 * Criado em: 2025-11-03
 */

import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';

/**
 * Props do componente DashboardLayout
 *
 * @interface DashboardLayoutProps
 * @property {ReactNode} children - Conteúdo principal a ser renderizado
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Componente DashboardLayout
 *
 * Responsabilidades:
 * - Compor Header (fixo no topo)
 * - Compor Sidebar (menu lateral responsivo)
 * - Renderizar conteúdo principal (children)
 * - Gerenciar estado de abertura/fechamento da sidebar em mobile
 * - Garantir layout responsivo para desktop, tablet e mobile
 *
 * Estrutura visual:
 * ┌─────────────────────────────────────┐
 * │          Header (fixo)              │
 * ├──────────┬──────────────────────────┤
 * │          │                          │
 * │ Sidebar  │   Conteúdo Principal    │
 * │          │   (children)            │
 * │          │                          │
 * └──────────┴──────────────────────────┘
 *
 * @component
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <div>Conteúdo do dashboard</div>
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  /**
   * Alterna o estado de abertura/fechamento da sidebar
   * Usado principalmente em mobile via botão no Header
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Fecha a sidebar
   * Usado quando clica em um item do menu ou no overlay
   */
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /**
   * Handlers para o Header
   */
  const handleChangePassword = () => {
    // Será implementado posteriormente na feat de mudança de senha
    console.log('[DashboardLayout] Trocar senha');
  };

  const handleLogout = () => {
    // Será implementado posteriormente na feat de logout
    console.log('[DashboardLayout] Logout');
  };

  // Renderização segura com valores padrão
  const userName = user?.name || 'Usuário';
  const userRole = user?.role || ('student' as UserRole);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header - Fixo no topo */}
      <Header
        userName={userName}
        userRole={userRole}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />

      {/* Container principal com Sidebar e Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Responsivo */}
        <Sidebar
          userRole={userRole}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        {/* Overlay para fechar sidebar em mobile quando clicado */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-gray-600 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-auto">
          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
