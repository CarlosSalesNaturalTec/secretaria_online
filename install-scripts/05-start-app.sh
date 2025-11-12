#!/bin/bash
# ==============================================================================
# SCRIPT DE INICIALIZAÇÃO DA APLICAÇÃO COM PM2
# ==============================================================================
# Arquivo: 05-start-app.sh
# Descrição: Inicia a aplicação com PM2 (backend, frontend via static serve)
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e

echo "=========================================="
echo "INICIANDO APLICAÇÃO SECRETARIA ONLINE"
echo "=========================================="
echo ""

APP_DIR="/home/naturalbahia/secretaria-online"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Stop existing processes
echo "[1/4] Parando processos existentes..."
pm2 delete all 2>/dev/null || true
sleep 2

# Install serve globally for frontend static hosting
echo "[2/4] Instalando serve para frontend..."
sudo npm install -g serve

# Start backend with PM2
echo "[3/4] Iniciando backend com PM2..."
cd "$BACKEND_DIR"
pm2 start src/server.js --name "secretaria-api" --env production || {
    echo "❌ Erro ao iniciar backend"
    exit 1
}

sleep 3

# Start frontend with PM2 (serve static files)
echo "[4/4] Iniciando frontend com PM2..."
pm2 start "serve -s dist -l 5173" --cwd "$FRONTEND_DIR" --name "secretaria-frontend" --env production || {
    echo "❌ Erro ao iniciar frontend"
    exit 1
}

# Save PM2 config to restore after reboot
pm2 save

echo ""
echo "=========================================="
echo "✅ APLICAÇÃO INICIADA COM SUCESSO!"
echo "=========================================="
echo ""

# Show status
echo "Status dos Processos:"
echo "===================="
pm2 status

echo ""
echo "Logs em Tempo Real (pressione Ctrl+C para sair):"
echo "================================================"
pm2 monit

