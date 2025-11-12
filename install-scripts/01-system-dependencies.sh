#!/bin/bash
# ==============================================================================
# SCRIPT DE INSTALAÇÃO DE DEPENDÊNCIAS DO SISTEMA
# ==============================================================================
# Arquivo: 01-system-dependencies.sh
# Descrição: Instala todas as dependências do sistema necessárias
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e  # Exit on error

echo "=========================================="
echo "INSTALANDO DEPENDÊNCIAS DO SISTEMA"
echo "=========================================="
echo ""

# Update system packages
echo "[1/6] Atualizando lista de pacotes..."
sudo apt-get update
sudo apt-get upgrade -y

# Install curl and wget
echo "[2/6] Instalando curl e wget..."
sudo apt-get install -y curl wget gnupg lsb-release ca-certificates

# Install Node.js 20 LTS
echo "[3/6] Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "[3.1/6] Verificando instalação do Node.js..."
node --version
npm --version

# Install Git
echo "[4/6] Instalando Git..."
sudo apt-get install -y git

# Install useful utilities
echo "[5/6] Instalando utilitários (build-essential, libssl-dev, pkg-config)..."
sudo apt-get install -y build-essential libssl-dev pkg-config python3-dev

# Install PM2 globally
echo "[6/6] Instalando PM2 globalmente..."
sudo npm install -g pm2
pm2 update

# Set PM2 to start on boot
echo "Configurando PM2 para iniciar no boot..."
sudo pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

echo ""
echo "=========================================="
echo "✅ DEPENDÊNCIAS INSTALADAS COM SUCESSO!"
echo "=========================================="
echo ""
echo "Versões instaladas:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "PM2: $(pm2 --version)"
echo ""
