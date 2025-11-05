/**
 * Arquivo: frontend/jest.config.js
 * Descrição: Configuração do Jest para testes do frontend React com TypeScript
 * Feature: feat-105 - Configurar Jest e React Testing Library
 * Criado em: 2025-11-04
 */

export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/jest.d.ts',
    '!src/setupTests.ts',
    '!src/types/**',
    '!src/hooks/index.ts',
    '!src/components/index.ts',
    '!src/components/layout/index.ts',
    '!src/components/ui/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: 'esnext',
          target: 'es2020',
          types: ['jest', '@testing-library/jest-dom', 'node'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
        },
        isolatedModules: false,
      },
    ],
  },
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
