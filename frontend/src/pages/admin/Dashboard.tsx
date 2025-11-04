/**
 * Arquivo: frontend/src/pages/admin/Dashboard.tsx
 * Descrição: Dashboard administrativo - página principal para usuários administrativos
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Criado em: 2025-11-03
 */

/**
 * AdminDashboard - Dashboard administrativo
 *
 * Responsabilidades:
 * - Exibir visão geral das operações administrativas
 * - Fornecer acesso rápido às funcionalidades principais (alunos, professores, cursos, etc.)
 *
 * TODO: Implementar funcionalidades específicas do dashboard
 *
 * @returns Página do dashboard administrativo
 */
export default function AdminDashboard() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Administrativo</h1>
      <p className="text-gray-600 mb-6">
        Bem-vindo ao painel administrativo. Esta página está em desenvolvimento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Alunos</h2>
          <p className="text-sm text-blue-700">Gerenciar cadastro de alunos</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Professores</h2>
          <p className="text-sm text-green-700">Gerenciar cadastro de professores</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">Cursos</h2>
          <p className="text-sm text-purple-700">Gerenciar cursos e disciplinas</p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">Turmas</h2>
          <p className="text-sm text-orange-700">Gerenciar turmas e matrículas</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Documentos</h2>
          <p className="text-sm text-red-700">Validar documentos enviados</p>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-900 mb-2">Solicitações</h2>
          <p className="text-sm text-indigo-700">Processar solicitações de alunos</p>
        </div>
      </div>
    </div>
  );
}
