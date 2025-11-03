/**
 * Arquivo: frontend/src/components/layout/Header.tsx
 * Descrição: Componente de cabeçalho do sistema com logo, nome do usuário e dropdown de perfil
 * Feature: feat-071 - Criar componente Header
 * Criado em: 2025-11-03
 *
 * Responsabilidades:
 * - Exibir logo e nome da aplicação
 * - Mostrar nome do usuário logado
 * - Fornecer dropdown com opções de perfil (trocar senha, logout)
 */

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, KeyIcon, LogOutIcon, UserIcon } from 'lucide-react';

/**
 * Props do componente Header
 */
interface HeaderProps {
  userName: string;
  userRole: string;
  onChangePassword: () => void;
  onLogout: () => void;
}

/**
 * Componente Header
 *
 * Exibe o cabeçalho principal do sistema com logo, informações do usuário
 * e menu dropdown para ações de perfil
 *
 * @param {HeaderProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente Header renderizado
 *
 * @example
 * <Header
 *   userName="João Silva"
 *   userRole="admin"
 *   onChangePassword={() => navigate('/change-password')}
 *   onLogout={() => handleLogout()}
 * />
 */
export function Header({ userName, userRole, onChangePassword, onLogout }: HeaderProps) {
  /**
   * Formata o nome da role para exibição
   *
   * @param {string} role - Role do usuário (admin, teacher, student)
   * @returns {string} Nome formatado da role
   */
  const formatRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: 'Administrador',
      teacher: 'Professor',
      student: 'Aluno',
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Aplicação */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                {/* Logo Icon */}
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SO</span>
                </div>
                {/* Nome da Aplicação */}
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Secretaria Online
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Menu do Usuário */}
          <div className="flex items-center">
            <Menu as="div" className="relative ml-3">
              {/* Botão do Menu */}
              <div>
                <Menu.Button className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  {/* Avatar do Usuário */}
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Informações do Usuário (escondido em mobile) */}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">
                      {userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRole(userRole)}
                    </span>
                  </div>

                  {/* Ícone de Dropdown */}
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                </Menu.Button>
              </div>

              {/* Dropdown Menu */}
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {/* Header do Dropdown - Informações do Usuário (mobile) */}
                    <div className="px-4 py-3 md:hidden border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRole(userRole)}
                      </p>
                    </div>

                    {/* Opção: Trocar Senha */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onChangePassword}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors`}
                        >
                          <KeyIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Trocar Senha
                        </button>
                      )}
                    </Menu.Item>

                    {/* Separador */}
                    <div className="border-t border-gray-100" />

                    {/* Opção: Logout */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={`${
                            active ? 'bg-red-50' : ''
                          } flex w-full items-center px-4 py-2 text-sm text-red-600 transition-colors`}
                        >
                          <LogOutIcon className="mr-3 h-5 w-5 text-red-500" aria-hidden="true" />
                          Sair
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
