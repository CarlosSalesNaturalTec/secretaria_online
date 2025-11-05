/**
 * Arquivo: frontend/src/setupTests.ts
 * Descrição: Configuração inicial para testes com Jest e React Testing Library
 * Feature: feat-105 - Configurar Jest e React Testing Library
 * Criado em: 2025-11-04
 *
 * Este arquivo é executado automaticamente antes de cada suite de testes.
 * Configura matchers customizados, mocks globais e limpeza entre testes.
 */

import '@testing-library/jest-dom';

/**
 * Limpar todos os mocks após cada teste
 * Garante que mocks não vazem entre testes
 */
afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Suppressão de logs de aviso/erro durante testes
 * Útil para reduzir ruído em output dos testes
 */
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

/**
 * Mock de IntersectionObserver para testes
 * Necessário para componentes que usam lazy loading ou visibilidade
 */
class MockIntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }

  takeRecords() {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

/**
 * Mock de ResizeObserver para testes
 * Necessário para componentes responsivos
 */
class MockResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

/**
 * Mock de localStorage
 * Proporciona um localStorage em memória para testes
 */
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * Mock de sessionStorage
 */
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

/**
 * Mock de matchMedia
 * Necessário para media queries em testes
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Definir variáveis de ambiente de teste
 */
process.env.NODE_ENV = 'test';

/**
 * Mock do Axios para requisições HTTP
 * Deve ser importado em testes específicos que precisam
 */
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));
