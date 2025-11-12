#!/bin/bash
# ==============================================================================
# SCRIPT DE CLONE E SETUP DA APLICAÇÃO
# ==============================================================================
# Arquivo: 03-app-setup.sh
# Descrição: Clona o repositório e instala dependências da aplicação
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e

echo "=========================================="
echo "SETUP DA APLICAÇÃO SECRETARIA ONLINE"
echo "=========================================="
echo ""

# Define variables
REPO_URL="https://github.com/CarlosSalesNaturalTec/secretaria_online.git"
APP_DIR="/home/naturalbahia/secretaria-online"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "Usuário: naturalbahia"
echo "VM: secretaria-online-prod"
echo "Diretório de instalação: $APP_DIR"
echo ""

# Clone repository
echo "[1/6] Clonando repositório..."
if [ -d "$APP_DIR" ]; then
    echo "Diretório já existe. Atualizando..."
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

echo "✅ Repositório clonado/atualizado"
echo ""

# Install backend dependencies
echo "[2/6] Instalando dependências do backend..."
cd "$BACKEND_DIR"
npm install --production

echo "✅ Dependências do backend instaladas"
echo ""

# Install frontend dependencies
echo "[3/6] Instalando dependências do frontend..."
cd "$FRONTEND_DIR"
npm install --production

echo "✅ Dependências do frontend instaladas"
echo ""

# Create necessary directories
echo "[4/6] Criando diretórios necessários..."
mkdir -p "$BACKEND_DIR/uploads/documents"
mkdir -p "$BACKEND_DIR/uploads/contracts"
mkdir -p "$BACKEND_DIR/uploads/temp"
mkdir -p "$BACKEND_DIR/logs"

echo "✅ Diretórios criados"
echo ""

# Build frontend
echo "[5/6] Compilando frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "✅ Frontend compilado"
echo ""

# Create symbolic link for frontend build
echo "[6/6] Criando estrutura de diretórios para serve do frontend..."
mkdir -p "$APP_DIR/public"
cp -r "$FRONTEND_DIR/dist/"* "$APP_DIR/public/" || true

echo "✅ Frontend pronto para serve"
echo ""

echo "=========================================="
echo "✅ APLICAÇÃO SETUP CONCLUÍDO!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Configure o arquivo .env do backend:"
echo "   $BACKEND_DIR/.env"
echo ""
echo "2. Configure o arquivo .env do frontend:"
echo "   $FRONTEND_DIR/.env"
echo ""
echo "3. Execute as migrations do banco de dados:"
echo "   cd $BACKEND_DIR"
echo "   npm run db:migrate"
echo "   npm run db:seed"
echo ""
echo "4. Inicie a aplicação com PM2:"
echo "   ./04-start-app.sh"
echo ""
