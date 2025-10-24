/**
 * Arquivo: frontend/vite.config.ts
 * Descrição: Configuração do Vite
 * Feature: feat-003 - Setup do frontend React com Vite
 * Criado em: 2025-10-24
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
