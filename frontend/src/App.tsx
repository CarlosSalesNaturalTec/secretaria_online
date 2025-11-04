/**
 * Arquivo: frontend/src/App.tsx
 * Descrição: Componente raiz da aplicação com configuração de rotas
 * Feature: feat-074 - Configurar React Router com rotas protegidas
 * Atualizado em: 2025-11-03
 */

import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import router from './router';

/**
 * App - Componente raiz da aplicação
 *
 * Responsabilidades:
 * - Fornecedor de contexto de autenticação para toda a aplicação
 * - Fornecedor de rotas para toda a aplicação
 * - Ponto de entrada para o RouterProvider
 *
 * @returns Aplicação com roteamento configurado
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
