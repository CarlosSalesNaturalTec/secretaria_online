#!/bin/bash
# ==============================================================================
# SCRIPT DE CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
# ==============================================================================
# Arquivo: 04-configure-env.sh
# Descrição: Configura arquivos .env para backend e frontend
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e

echo "=========================================="
echo "CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE"
echo "=========================================="
echo ""

APP_DIR="/home/naturalbahia/secretaria-online"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Get VM external IP
echo "Detectando IP externo da VM..."
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || echo "localhost")
echo "IP Externo: $VM_IP"
echo ""

# Function to read user input with default
read_input() {
    local prompt="$1"
    local default="$2"
    read -p "$prompt (padrão: $default): " input
    echo "${input:-$default}"
}

# ============== BACKEND CONFIGURATION ==============
echo "========== CONFIGURAÇÃO DO BACKEND =========="
echo ""

# Database configuration
echo "--- Configuração do Banco de Dados ---"
DB_HOST=$(read_input "Host do banco de dados" "localhost")
DB_PORT=$(read_input "Porta do banco de dados" "3306")
DB_NAME=$(read_input "Nome do banco de dados" "secretaria_online")
DB_USER=$(read_input "Usuário do banco de dados" "secretaria_user")
DB_PASSWORD=$(read_input "Senha do banco de dados" "senha_secreta_123")
echo ""

# JWT configuration
echo "--- Configuração de Autenticação JWT ---"
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET gerado (salve em local seguro): $JWT_SECRET"
JWT_ACCESS_EXPIRATION=$(read_input "JWT Access Token Expiration" "15m")
JWT_REFRESH_EXPIRATION=$(read_input "JWT Refresh Token Expiration" "7d")
echo ""

# Email configuration
echo "--- Configuração de Email (SMTP) ---"
SMTP_HOST=$(read_input "Host SMTP" "smtp.gmail.com")
SMTP_PORT=$(read_input "Porta SMTP" "587")
SMTP_USER=$(read_input "Usuário SMTP (email)" "seu_email@gmail.com")
SMTP_PASS=$(read_input "Senha SMTP" "sua_senha_app")
SMTP_FROM=$(read_input "Email From" "noreply@secretariaonline.com")
echo ""

# Node environment
NODE_ENV=$(read_input "Node Environment (development/production)" "production")
PORT=$(read_input "Porta do Backend" "3000")
BASE_URL="http://$VM_IP"

# Create .env file for backend
echo "[Backend] Criando arquivo .env..."
cat > "$BACKEND_DIR/.env" << EOF
# Server Configuration
NODE_ENV=$NODE_ENV
PORT=$PORT
BASE_URL=$BASE_URL

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_ACCESS_EXPIRATION=$JWT_ACCESS_EXPIRATION
JWT_REFRESH_EXPIRATION=$JWT_REFRESH_EXPIRATION

# Email Configuration (SMTP)
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=$BACKEND_DIR/uploads

# PDF Configuration
PDF_LIBRARY=pdfkit

# Logging
LOG_LEVEL=info
EOF

echo "✅ Arquivo .env do backend criado: $BACKEND_DIR/.env"
echo ""

# ============== FRONTEND CONFIGURATION ==============
echo "========== CONFIGURAÇÃO DO FRONTEND =========="
echo ""

FRONTEND_API_URL=$(read_input "URL da API para o frontend" "http://$VM_IP:3000/api/v1")

# Create .env file for frontend
echo "[Frontend] Criando arquivo .env..."
cat > "$FRONTEND_DIR/.env" << EOF
# API Configuration
VITE_API_BASE_URL=$FRONTEND_API_URL

# App Configuration
VITE_APP_NAME=Secretaria Online
VITE_APP_ENV=$NODE_ENV
EOF

echo "✅ Arquivo .env do frontend criado: $FRONTEND_DIR/.env"
echo ""

# ============== DATABASE CREATION ==============
echo "========== CRIAÇÃO DO BANCO DE DADOS =========="
echo ""

echo "Criando banco de dados e usuário..."
echo "Insira a senha root do MariaDB quando solicitado:"
echo ""

sudo mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ Banco de dados e usuário criados"
echo ""

# ============== RUN MIGRATIONS ==============
echo "========== EXECUTANDO MIGRATIONS =========="
echo ""

cd "$BACKEND_DIR"
echo "Executando migrations..."
npm run db:migrate || echo "⚠️  Atenção: Verifique se as migrations foram executadas corretamente"

echo ""
echo "Executando seeders..."
npm run db:seed || echo "⚠️  Atenção: Verifique se os seeders foram executados corretamente"

echo ""
echo "=========================================="
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "=========================================="
echo ""
echo "Resumo da Configuração:"
echo "========================"
echo "Backend URL: $BASE_URL:$PORT"
echo "Frontend API URL: $FRONTEND_API_URL"
echo "Banco de Dados: $DB_NAME"
echo "Database User: $DB_USER"
echo ""
echo "Próximos passos:"
echo "1. Inicie a aplicação com PM2:"
echo "   bash $APP_DIR/install-scripts/05-start-app.sh"
echo ""
echo "2. Verifique o status:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
