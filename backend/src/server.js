/**
 * Arquivo: src/server.js
 * Descrição: Servidor principal da aplicação backend
 * Feature: feat-002 - Setup do backend Node.js
 * Criado em: 2025-10-24
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet());

// CORS - Configuração para permitir requisições do frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Secretaria Online API is running',
    timestamp: new Date().toISOString(),
  });
});

// Rota base da API
const apiRoutes = require('./routes');
app.use('/api/v1', apiRoutes);

app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Welcome to Secretaria Online API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

// Rota 404 - Não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Middleware de tratamento de erros global
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

// Configuração da porta
const PORT = process.env.PORT || 3000;

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
