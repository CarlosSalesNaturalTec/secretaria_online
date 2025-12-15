/**
 * Arquivo: frontend/src/components/PrivateRoute.tsx
 * Descrição: Componente que verifica autenticação e autorização antes de renderizar rotas protegidas
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Criado em: 2025-11-03
 */

import { type ReactNode, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

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

/**
 * PrivateRoute - Wrapper para rotas protegidas
 *
 * Utiliza AuthContext para verificar autenticação e autorização.
 *
 * Fluxo:
 * 1. Acessa o AuthContext para obter status de autenticação, loading e dados do usuário.
 * 2. Se estiver carregando, exibe um componente de loading.
 * 3. Se não estiver autenticado, redireciona para /login.
 * 4. Se um `requiredRole` for especificado, valida se o papel do usuário é o correto.
 * 5. Se o papel for incorreto, redireciona para o dashboard apropriado ao papel do usuário.
 * 6. Se tudo estiver correto, renderiza o componente filho.
 *
 * @param children - Componente a renderizar se autenticado e autorizado.
 * @param requiredRole - Papel requerido para acessar a rota (opcional).
 * @returns Componente filho ou redirecionamento
 */
export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const location = useLocation();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('PrivateRoute deve ser usado dentro de um AuthProvider');
  }

  const { isAuthenticated, loading, user, hasEnrollmentPending } = authContext;

  // 1. Exibir loading enquanto o contexto de autenticação está inicializando
  if (loading) {
    return <LoadingFallback />;
  }

  // 2. Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    console.warn('[PrivateRoute] Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se estudante com rematrícula pendente, redirecionar para aceite
  // (Exceto se ele já estiver tentando acessar a página de aceite)
  if (
    user.role === 'student' &&
    hasEnrollmentPending &&
    location.pathname !== '/student/reenrollment-acceptance'
  ) {
    console.log(
      '[PrivateRoute] Estudante com rematrícula pendente, redirecionando para aceite.'
    );
    return <Navigate to="/student/reenrollment-acceptance" replace />;
  }

  // 4. Se um papel for requerido, validar o papel do usuário
  if (requiredRole && user.role !== requiredRole) {
    console.warn(
      `[PrivateRoute] Acesso negado. Rota requer ${requiredRole}, mas usuário é ${user.role}.`
    );

    const dashboardMap: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };

    const redirectPath = dashboardMap[user.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  // 5. Se tudo OK, renderizar componente
  return <>{children}</>;
}
