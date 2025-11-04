/**
 * Arquivo: frontend/src/components/PrivateRoute.tsx
 * Descrição: Componente que verifica autenticação e autorização antes de renderizar rotas protegidas
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Criado em: 2025-11-03
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

/**
 * PrivateRoute - Wrapper para rotas protegidas
 *
 * Verifica se o usuário está autenticado (token JWT em localStorage).
 * Se requiredRole for especificado, valida se o papel do usuário é permitido.
 *
 * Fluxo:
 * 1. Verifica se existe token JWT em localStorage
 * 2. Se não houver token, redireciona para /login
 * 3. Se houver requiredRole, decodifica o token e verifica se o role é permitido
 * 4. Se role não corresponder, redireciona para dashboard apropriado ou login
 * 5. Se tudo OK, renderiza o componente filho
 *
 * @param children - Componente a renderizar se autenticado
 * @param requiredRole - Papel requerido para acessar a rota (opcional)
 * @returns Componente filho ou redirecionamento
 */
export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const location = useLocation();

  // Obter token JWT do localStorage
  const token = localStorage.getItem('authToken');

  // Se não houver token, redirecionar para login
  if (!token) {
    console.warn('[PrivateRoute] Token não encontrado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requiredRole for especificado, validar papel do usuário
  if (requiredRole) {
    try {
      // Decodificar token JWT (sem validar assinatura no frontend)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      // Decodificar payload (segunda parte do JWT)
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      const userRole = payload.role;

      // Se role não corresponder, redirecionar baseado no papel do usuário
      if (userRole !== requiredRole) {
        console.warn(
          `[PrivateRoute] Papel do usuário (${userRole}) não é permitido. Requerido: ${requiredRole}`
        );

        // Redirecionar para dashboard apropriado de acordo com seu papel
        const dashboardMap: Record<string, string> = {
          admin: '/admin/dashboard',
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
        };

        const redirectPath = dashboardMap[userRole] || '/login';
        return <Navigate to={redirectPath} replace />;
      }
    } catch (error) {
      console.error('[PrivateRoute] Erro ao decodificar token:', error);
      localStorage.removeItem('authToken');
      return <Navigate to="/login" replace />;
    }
  }

  // Token é válido e role é permitido (se verificado), renderizar componente
  return <>{children}</>;
}
