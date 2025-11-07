/**
 * Arquivo: frontend/src/services/api.ts
 * Descrição: Configuração do cliente Axios para comunicação com API
 * Feature: feat-075 - Configurar Axios e interceptors
 * Atualizado em: 2025-11-04
 *
 * Responsabilidades:
 * - Criar instância Axios configurada com baseURL e timeout
 * - Interceptar requisições para adicionar token JWT no header Authorization
 * - Interceptar respostas para tratar erros de autenticação (401) e outros erros HTTP
 * - Fornecer logs detalhados para debugging em ambiente de desenvolvimento
 */

import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

/**
 * Interface para padronizar respostas de erro da API
 */
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Instância configurada do Axios
 *
 * @property {string} baseURL - URL base da API (variável de ambiente ou fallback para localhost)
 * @property {number} timeout - Timeout de 30 segundos para requisições
 * @property {object} headers - Headers padrão incluindo Content-Type
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição
 *
 * Adiciona automaticamente o token JWT ao header Authorization se disponível no localStorage.
 * Também adiciona logs em ambiente de desenvolvimento para facilitar debugging.
 *
 * @param {InternalAxiosRequestConfig} config - Configuração da requisição Axios
 * @returns {InternalAxiosRequestConfig} Configuração modificada com token JWT
 * @throws {AxiosError} Rejeita a promise em caso de erro na configuração
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    // Adiciona token JWT no header se disponível
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log detalhado em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error: AxiosError) => {
    // Log de erro em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }

    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta
 *
 * Trata erros HTTP de forma centralizada:
 * - 401 (Unauthorized): Remove token e redireciona para login
 * - 403 (Forbidden): Acesso negado
 * - 404 (Not Found): Recurso não encontrado
 * - 500+ (Server Error): Erro interno do servidor
 * - Timeout: Requisição excedeu o tempo limite
 * - Network Error: Falha de conexão com a API
 *
 * @param {AxiosResponse} response - Resposta bem-sucedida da API
 * @returns {AxiosResponse} Retorna a resposta sem modificações
 * @throws {AxiosError} Rejeita a promise com erro tratado
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de sucesso em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Tratamento de timeout
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Timeout: A requisição excedeu o tempo limite de 30s');
    }

    // Tratamento de erro de rede (sem resposta do servidor)
    if (!error.response) {
      console.error(
        '[API] Network Error: Não foi possível conectar à API',
        error.message
      );
      return Promise.reject({
        ...error,
        message:
          'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      });
    }

    const status = error.response.status;
    const errorMessage =
      error.response.data?.error?.message || 'Erro desconhecido';

    // Tratamento específico por status code
    switch (status) {
      case 401: {
        // Unauthorized - Token inválido ou expirado
        console.warn('[API] 401 Unauthorized: Redirecionando para login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
      }

      case 403: {
        // Forbidden - Sem permissão para acessar recurso
        console.error('[API] 403 Forbidden:', errorMessage);
        break;
      }

      case 404: {
        // Not Found - Recurso não encontrado
        console.error('[API] 404 Not Found:', errorMessage);
        break;
      }

      case 409: {
        // Conflict - Conflito (ex: CPF ou email já cadastrado)
        console.error('[API] 409 Conflict:', errorMessage);
        break;
      }

      case 422: {
        // Unprocessable Entity - Validação de negócio falhou
        console.error('[API] 422 Validation Error:', errorMessage);
        break;
      }

      case 500:
      case 502:
      case 503:
      case 504: {
        // Server Error - Erro interno do servidor
        console.error(`[API] ${status} Server Error:`, errorMessage);
        break;
      }

      default: {
        // Outros erros
        console.error(`[API] ${status} Error:`, errorMessage);
      }
    }

    // Log detalhado em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('[API Error Details]', {
        status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
