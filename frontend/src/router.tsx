/**
 * Arquivo: frontend/src/router.tsx
 * Descrição: Configuração central de rotas da aplicação com suporte a rotas públicas e privadas
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Criado em: 2025-11-03
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { PrivateRoute } from './components';

// ============================================================================
// IMPORTS LAZY LOADING - Páginas que serão carregadas sob demanda
// ============================================================================

/**
 * Páginas de Autenticação
 * Carregadas normalmente pois são públicas e pequenas
 */
import Login from './pages/auth/Login';
// import FirstAccess from './pages/auth/FirstAccess';

/**
 * Layouts
 */
// import DashboardLayout from './components/layout/DashboardLayout';

/**
 * Páginas Administrativas (Lazy Loading)
 * Carregadas apenas quando acessadas
 */
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

/**
 * Páginas de Aluno (Lazy Loading)
 */
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));

/**
 * Páginas de Professor (Lazy Loading)
 */
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));

// ============================================================================
// LOADING FALLBACK
// ============================================================================

/**
 * Componente de loading enquanto páginas lazy são carregadas
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

// ============================================================================
// DEFINIÇÃO DE ROTAS
// ============================================================================

/**
 * Rotas públicas (acessíveis sem autenticação)
 */
const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
    errorElement: <div>Erro ao carregar página de login</div>,
  },
  {
    path: '/first-access',
    element: <div>First Access Page (to be implemented)</div>, // TODO: Implementar FirstAccess
    errorElement: <div>Erro ao carregar página de primeiro acesso</div>,
  },
];

/**
 * Rotas privadas (requerem autenticação e autorização)
 *
 * Estrutura:
 * - Admin routes: apenas usuários com role 'admin'
 * - Teacher routes: apenas usuários com role 'teacher'
 * - Student routes: apenas usuários com role 'student'
 */
const privateRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <PrivateRoute requiredRole="admin"><div>Admin Layout (to be implemented)</div></PrivateRoute>,
    errorElement: <div>Erro ao carregar área administrativa</div>,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      /**
       * TODO: Adicionar rotas filhas do admin
       * - /admin/students
       * - /admin/teachers
       * - /admin/courses
       * - /admin/classes
       * - /admin/enrollments
       * - /admin/documents
       * - /admin/contracts
       * - /admin/requests
       */
    ],
  },
  {
    path: '/teacher',
    element: <PrivateRoute requiredRole="teacher"><div>Teacher Layout (to be implemented)</div></PrivateRoute>,
    errorElement: <div>Erro ao carregar área do professor</div>,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TeacherDashboard />
          </Suspense>
        ),
      },
      /**
       * TODO: Adicionar rotas filhas do professor
       * - /teacher/classes
       * - /teacher/students
       * - /teacher/grades
       */
    ],
  },
  {
    path: '/student',
    element: <PrivateRoute requiredRole="student"><div>Student Layout (to be implemented)</div></PrivateRoute>,
    errorElement: <div>Erro ao carregar área do aluno</div>,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StudentDashboard />
          </Suspense>
        ),
      },
      /**
       * TODO: Adicionar rotas filhas do aluno
       * - /student/documents
       * - /student/grades
       * - /student/requests
       */
    ],
  },
];

// ============================================================================
// ROTA RAIZ E REDIRECIONAMENTOS
// ============================================================================

/**
 * Lógica de redirecionamento para rota raiz (/)
 *
 * Fluxo:
 * 1. Verifica se o usuário está autenticado (token em localStorage)
 * 2. Se autenticado, decodifica o token e extrai o papel do usuário
 * 3. Redireciona para o dashboard apropriado baseado no papel
 * 4. Se não autenticado, redireciona para /login
 */
function RootRedirect() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Não autenticado, redirecionar para login
    window.location.href = '/login';
    return <div>Redirecionando para login...</div>;
  }

  try {
    // Decodificar token para obter papel do usuário
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token inválido');
    }

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    const userRole = payload.role;

    // Mapa de papéis para dashboards
    const dashboardMap: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };

    const redirectPath = dashboardMap[userRole] || '/login';
    window.location.href = redirectPath;
    return <div>Redirecionando para seu dashboard...</div>;
  } catch (error) {
    console.error('[RootRedirect] Erro ao processar token:', error);
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    return <div>Redirecionando para login...</div>;
  }
}

const rootRoute: RouteObject[] = [
  {
    path: '/',
    element: <RootRedirect />,
  },
];

// ============================================================================
// ROTA 404
// ============================================================================

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-600 mb-8">Página não encontrada</p>
      <a href="/login" className="text-blue-600 hover:underline">
        Voltar para login
      </a>
    </div>
  );
}

const notFoundRoute: RouteObject[] = [
  {
    path: '*',
    element: <NotFound />,
  },
];

// ============================================================================
// CONFIGURAÇÃO FINAL DO ROUTER
// ============================================================================

/**
 * Ordem de rotas é importante:
 * 1. Rotas raiz e redirecionamentos
 * 2. Rotas públicas
 * 3. Rotas privadas
 * 4. Rotas 404 (deve ser última)
 */
const routes: RouteObject[] = [
  ...rootRoute,
  ...publicRoutes,
  ...privateRoutes,
  ...notFoundRoute,
];

/**
 * Criar e exportar router
 *
 * Modo hash é útil para shared hosting que não suporta URL rewriting
 * Descomente `basename: process.env.REACT_APP_BASENAME` se precisar subdiretório
 */
export const router = createBrowserRouter(routes, {
  // basename: process.env.REACT_APP_BASENAME, // Para produção em subdiretório
});

export default router;
