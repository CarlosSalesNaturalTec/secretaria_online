/**
 * Arquivo: frontend/src/App.tsx
 * Descrição: Componente raiz da aplicação com configuração de rotas e estado global
 * Features: feat-074 - Configurar React Router com rotas protegidas
 *          feat-103 - Configurar TanStack Query
 * Atualizado em: 2025-11-04
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './config/queryClient';
import router from './router';

/**
 * App - Componente raiz da aplicação
 *
 * Responsabilidades:
 * - Fornecedor de contexto de autenticação para toda a aplicação
 * - Fornecedor do QueryClient para gerenciamento de cache e estado servidor
 * - Fornecedor de rotas para toda a aplicação
 * - Ponto de entrada para o RouterProvider
 *
 * Estrutura de Providers (ordem importa):
 * 1. QueryClientProvider - Gerencia cache e estado de dados do servidor
 * 2. AuthProvider - Gerencia contexto de autenticação
 * 3. RouterProvider - Gerencia roteamento da aplicação
 *
 * @returns Aplicação com QueryClient, autenticação e roteamento configurados
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      {/* DevTools para debugging em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
