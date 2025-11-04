/**
 * Arquivo: frontend/src/pages/teacher/Dashboard.tsx
 * Descrição: Dashboard do professor - página principal para usuários professores
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Criado em: 2025-11-03
 */

/**
 * TeacherDashboard - Dashboard do professor
 *
 * Responsabilidades:
 * - Exibir turmas do professor
 * - Fornecer acesso rápido aos alunos, avaliações e notas
 * - Mostrar documentos obrigatórios pendentes
 *
 * TODO: Implementar funcionalidades específicas do dashboard
 *
 * @returns Página do dashboard do professor
 */
export default function TeacherDashboard() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard do Professor</h1>
      <p className="text-gray-600 mb-6">
        Bem-vindo ao seu painel de professor. Esta página está em desenvolvimento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Minhas Turmas</h2>
          <p className="text-sm text-blue-700">Visualizar e gerenciar suas turmas</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Alunos</h2>
          <p className="text-sm text-green-700">Visualizar alunos das turmas</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">Avaliações</h2>
          <p className="text-sm text-purple-700">Cadastrar avaliações e notas</p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">Lançar Notas</h2>
          <p className="text-sm text-orange-700">Registrar notas dos alunos</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Documentos</h2>
          <p className="text-sm text-red-700">Upload de documentos obrigatórios</p>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-900 mb-2">Contrato</h2>
          <p className="text-sm text-indigo-700">Aceitar contrato semestral</p>
        </div>
      </div>
    </div>
  );
}
