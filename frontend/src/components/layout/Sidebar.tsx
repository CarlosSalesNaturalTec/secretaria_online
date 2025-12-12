/**
 * Arquivo: frontend/src/components/layout/Sidebar.tsx
 * Descrição: Componente de navegação lateral com menu dinâmico baseado no role do usuário
 * Feature: feat-072 - Criar componente Sidebar
 * Criado em: 2025-11-03
 *
 * Responsabilidades:
 * - Exibir menu de navegação lateral
 * - Renderizar itens de menu específicos por role (admin, teacher, student)
 * - Destacar rota ativa
 * - Suportar colapso em dispositivos móveis
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  LibraryIcon,
  CalendarIcon,
  FileTextIcon,
  ClipboardListIcon,
  SchoolIcon,
  ClipboardCheckIcon,
} from 'lucide-react';
import { type UserRole } from '@/types/user.types';

/**
 * Interface para item de navegação
 */
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props do componente Sidebar
 */
interface SidebarProps {
  userRole: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Retorna os itens de navegação baseado no role do usuário
 *
 * @param {UserRole} role - Role do usuário (admin, teacher, student)
 * @returns {NavigationItem[]} Array de itens de navegação
 */
const getNavigationItems = (role: UserRole): NavigationItem[] => {
  // Menu para Administradores
  if (role === 'admin') {
    return [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboardIcon },
      { name: 'Usuários Admin', href: '/admin/users', icon: UsersIcon },
      { name: 'Alunos', href: '/admin/students', icon: GraduationCapIcon },
      { name: 'Professores', href: '/admin/teachers', icon: SchoolIcon },
      { name: 'Cursos', href: '/admin/courses', icon: BookOpenIcon },
      { name: 'Disciplinas', href: '/admin/disciplines', icon: LibraryIcon },
      { name: 'Turmas', href: '/admin/classes', icon: CalendarIcon },
      { name: 'Avaliações', href: '/admin/evaluations', icon: ClipboardCheckIcon },
      { name: 'Lançar Notas', href: '/admin/grades', icon: ClipboardListIcon },
      { name: 'Documentos', href: '/admin/documents', icon: FileTextIcon },
      { name: 'Solicitações', href: '/admin/requests', icon: ClipboardListIcon },
    ];
  }

  // Menu para Professores
  if (role === 'teacher') {
    return [
      { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboardIcon },
      { name: 'Minhas Turmas', href: '/teacher/classes', icon: CalendarIcon },
      { name: 'Avaliações', href: '/teacher/evaluations', icon: ClipboardCheckIcon },
      { name: 'Lançar Notas', href: '/teacher/grades', icon: ClipboardListIcon },
      { name: 'Meus Documentos', href: '/teacher/documents', icon: FileTextIcon },
    ];
  }

  // Menu para Alunos
  if (role === 'student') {
    return [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboardIcon },
      { name: 'Minhas Notas', href: '/student/grades', icon: ClipboardListIcon },
      { name: 'Meus Documentos', href: '/student/documents', icon: FileTextIcon },
      { name: 'Solicitações', href: '/student/requests', icon: FileTextIcon },
    ];
  }

  // Fallback: retorna menu vazio
  return [];
};

/**
 * Componente Sidebar
 *
 * Renderiza a barra de navegação lateral com itens dinâmicos baseados no role do usuário.
 * Suporta estados ativos, hover e design responsivo.
 *
 * @param {SidebarProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente Sidebar renderizado
 *
 * @example
 * <Sidebar
 *   userRole="admin"
 *   isOpen={isSidebarOpen}
 *   onClose={() => setIsSidebarOpen(false)}
 * />
 */
export function Sidebar({ userRole, isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();

  /**
   * Verifica se a rota está ativa
   *
   * @param {string} href - URL da rota
   * @returns {boolean} True se a rota está ativa
   */
  const isActiveRoute = (href: string): boolean => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const navigationItems = getNavigationItems(userRole);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header da Sidebar (mobile) */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Fechar menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Fecha sidebar em mobile após clicar
                    if (window.innerWidth < 1024 && onClose) {
                      onClose();
                    }
                  }}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-700' : 'text-gray-400'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer da Sidebar (opcional) */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Secretaria Online v0.1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
