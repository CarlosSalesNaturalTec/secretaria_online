/**
 * Arquivo: frontend/src/pages/admin/Users.tsx
 * Descrição: Página de gerenciamento de usuários administradores
 * Feature: feat-082 - Implementar página de usuários admin
 * Criado em: 2025-11-07
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import UserService, { type IUserFilters } from '@/services/user.service';
import type { IUser, ICreateUser, IUpdateUser } from '@/types/user.types';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<IUserFilters>({
    page: 1,
    limit: 10,
    role: 'admin',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // Query para buscar usuários
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => UserService.getUsers(filters),
  });

  // Mutation para criar usuário
  const createMutation = useMutation({
    mutationFn: UserService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      alert('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      alert(`Erro ao criar usuário: ${error.message}`);
    },
  });

  // Mutation para atualizar usuário
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateUser }) =>
      UserService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(false);
      setSelectedUser(null);
      alert('Usuário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      alert(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  // Mutation para deletar usuário
  const deleteMutation = useMutation({
    mutationFn: UserService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('Usuário deletado com sucesso!');
    },
    onError: (error: Error) => {
      alert(`Erro ao deletar usuário: ${error.message}`);
    },
  });

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleRoleFilter = (role: 'admin' | 'teacher' | 'student' | undefined) => {
    setFilters({ ...filters, role, page: 1 });
  };

  const handleDelete = (userId: number) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteMutation.mutate(userId);
    }
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuários Administrativos</h1>
        <p className="text-gray-600 mt-2">
          Gerenciar usuários administradores do sistema
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, email ou login..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filtro por Role */}
          <div className="flex gap-2">
            <button
              onClick={() => handleRoleFilter(undefined)}
              className={`px-4 py-2 rounded-lg ${
                !filters.role
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleRoleFilter('admin')}
              className={`px-4 py-2 rounded-lg ${
                filters.role === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => handleRoleFilter('teacher')}
              className={`px-4 py-2 rounded-lg ${
                filters.role === 'teacher'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Professor
            </button>
            <button
              onClick={() => handleRoleFilter('student')}
              className={`px-4 py-2 rounded-lg ${
                filters.role === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aluno
            </button>
          </div>

          {/* Botão Criar */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="h-5 w-5" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Erro ao carregar usuários: {(error as Error).message}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum usuário encontrado
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.login}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'teacher'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.cpf}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginação */}
            {data.pagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) - 1 })
                    }
                    disabled={(filters.page || 1) <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) + 1 })
                    }
                    disabled={(filters.page || 1) >= (data.pagination.totalPages || 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">
                        {(((filters.page || 1) - 1) * (filters.limit || 10)) + 1}
                      </span>{' '}
                      a{' '}
                      <span className="font-medium">
                        {Math.min(
                          (filters.page || 1) * (filters.limit || 10),
                          data.pagination.total || 0
                        )}
                      </span>{' '}
                      de <span className="font-medium">{data.pagination.total}</span>{' '}
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setFilters({ ...filters, page: (filters.page || 1) - 1 })
                        }
                        disabled={(filters.page || 1) <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {filters.page || 1} / {data.pagination.totalPages || 1}
                      </span>
                      <button
                        onClick={() =>
                          setFilters({ ...filters, page: (filters.page || 1) + 1 })
                        }
                        disabled={
                          (filters.page || 1) >= (data.pagination.totalPages || 1)
                        }
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Próxima
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Criar (placeholder - será implementado) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento. Por favor, use a API diretamente.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar (placeholder - será implementado) */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>
            <p className="text-gray-600 mb-4">
              Editando: {selectedUser.name}
            </p>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento. Por favor, use a API diretamente.
            </p>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
