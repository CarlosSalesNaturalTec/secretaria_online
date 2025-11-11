#!/bin/bash

################################################################################
# Script de Configuração do PM2 - Secretaria Online
# Descrição: Configura PM2 com ecosystem.config.js no servidor
# Uso: bash setup-pm2.sh
################################################################################

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Diretórios
BACKEND_DIR="/var/www/secretaria-online/backend"
CONFIG_FILE="$BACKEND_DIR/ecosystem.config.js"
PM2_APP_NAME="secretaria-api"

log_info "=== Configurando PM2 para Secretaria Online ==="

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 não está instalado. Execute: npm install -g pm2"
    exit 1
fi

log_info "PM2 versão: $(pm2 --version)"

# Verificar se ecosystem.config.js existe
if [ ! -f "$CONFIG_FILE" ]; then
    log_error "Arquivo ecosystem.config.js não encontrado em $CONFIG_FILE"
    log_error "Copie o arquivo configs/ecosystem.config.js para $BACKEND_DIR/"
    exit 1
fi

# Parar processos antigos (se existirem)
if pm2 list | grep -q "$PM2_APP_NAME"; then
    log_warn "Parando processo PM2 existente..."
    pm2 delete "$PM2_APP_NAME" || true
fi

# Iniciar aplicação com ecosystem.config.js
log_info "Iniciando aplicação com PM2..."
cd "$BACKEND_DIR"
pm2 start ecosystem.config.js --env production

# Salvar lista de processos
log_info "Salvando configuração do PM2..."
pm2 save

# Configurar PM2 para iniciar no boot
log_info "Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))

# Exibir status
log_info "Status do PM2:"
pm2 status

log_info "=== Configuração do PM2 concluída! ==="
echo ""
log_info "Comandos úteis:"
echo "  pm2 status              # Ver status"
echo "  pm2 logs $PM2_APP_NAME  # Ver logs"
echo "  pm2 monit               # Monitorar recursos"
echo "  pm2 restart $PM2_APP_NAME  # Reiniciar"
echo "  pm2 reload $PM2_APP_NAME   # Reload zero-downtime"
echo "  pm2 stop $PM2_APP_NAME     # Parar"
