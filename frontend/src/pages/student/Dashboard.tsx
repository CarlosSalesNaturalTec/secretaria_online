/**
 * Arquivo: frontend/src/pages/student/Dashboard.tsx
 * Descrição: Dashboard do aluno - página principal para usuários estudantes
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Criado em: 2025-11-03
 */

/**
 * StudentDashboard - Dashboard do aluno
 *
 * Responsabilidades:
 * - Exibir informações acadêmicas do aluno (notas, disciplinas)
 * - Fornecer acesso rápido para upload de documentos e solicitações
 * - Mostrar status do contrato de matrícula
 *
 * TODO: Implementar funcionalidades específicas do dashboard
 *
 * @returns Página do dashboard do aluno
 */
export default function StudentDashboard() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard do Aluno</h1>
      <p className="text-gray-600 mb-6">
        Bem-vindo ao seu painel de aluno. Esta página está em desenvolvimento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Minhas Notas</h2>
          <p className="text-sm text-blue-700">Consultar notas e avaliações</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Documentos</h2>
          <p className="text-sm text-green-700">Upload de documentos obrigatórios</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">Solicitações</h2>
          <p className="text-sm text-purple-700">Fazer solicitações acadêmicas</p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">Contrato</h2>
          <p className="text-sm text-orange-700">Visualizar e aceitar contrato</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Informações</h2>
          <p className="text-sm text-red-700">Dados pessoais e acadêmicos</p>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-900 mb-2">Perfil</h2>
          <p className="text-sm text-indigo-700">Gerenciar meu perfil e senha</p>
        </div>
      </div>
    </div>
  );
}
