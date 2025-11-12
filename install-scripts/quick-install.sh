#!/bin/bash
# ==============================================================================
# SCRIPT DE INSTALAÇÃO RÁPIDA - SECRETARIA ONLINE (TUDO-EM-UM)
# ==============================================================================
# Arquivo: quick-install.sh
# Descrição: Instala tudo em um único script (requer inputs minimais)
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
clear
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   SECRETARIA ONLINE - INSTALAÇÃO RÁPIDA                     ║"
echo "║   GCP VM (e2-medium, Debian 11, MariaDB)                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if running as non-root
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}❌ Não execute este script como root!${NC}"
   echo "Execute como usuário regular:"
   echo "  bash quick-install.sh"
   exit 1
fi

# Define variables
REPO_URL="https://github.com/CarlosSalesNaturalTec/secretaria_online.git"
APP_DIR="/home/naturalbahia/secretaria-online"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo -e "${BLUE}Configuration Summary:${NC}"
echo "  Usuário: naturalbahia"
echo "  VM: secretaria-online-prod"
echo "  App Directory: $APP_DIR"
echo "  Repository: $REPO_URL"
echo ""

# Get VM IP
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || echo "localhost")

echo -e "${YELLOW}Detectado IP da VM: $VM_IP${NC}"
echo ""

# Confirmation
read -p "Deseja continuar com a instalação? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Instalação cancelada."
    exit 0
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}INICIANDO INSTALAÇÃO - Tempo estimado: 30-45 minutos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# PASSO 1: SYSTEM DEPENDENCIES
# ============================================================================
echo -e "${YELLOW}[PASSO 1/7] Instalando dependências do sistema...${NC}"
echo "Isto pode levar 5-10 minutos..."
echo ""

# Update system
sudo apt-get update
sudo apt-get upgrade -y > /dev/null

# Install curl, wget
sudo apt-get install -y curl wget gnupg lsb-release ca-certificates > /dev/null

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null
sudo apt-get install -y nodejs > /dev/null

# Install Git
sudo apt-get install -y git > /dev/null

# Install build tools
sudo apt-get install -y build-essential libssl-dev pkg-config python3-dev > /dev/null

# Install PM2 globally
sudo npm install -g pm2 > /dev/null
pm2 update > /dev/null 2>&1 || true

# Set PM2 startup
sudo pm2 startup systemd -u $USER --hp /home/$USER > /dev/null 2>&1 || true

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo ""

# ============================================================================
# PASSO 2: MARIADB
# ============================================================================
echo -e "${YELLOW}[PASSO 2/7] Instalando MariaDB...${NC}"
echo ""

sudo apt-get install -y mariadb-server mariadb-client > /dev/null

sudo systemctl start mariadb
sudo systemctl enable mariadb > /dev/null

# Secure installation
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root_temp_123';" > /dev/null 2>&1 || true
sudo mysql -e "DELETE FROM mysql.user WHERE User='';" > /dev/null 2>&1 || true
sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" > /dev/null 2>&1 || true
sudo mysql -e "DROP DATABASE IF EXISTS test;" > /dev/null 2>&1 || true
sudo mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test_%';" > /dev/null 2>&1 || true
sudo mysql -e "FLUSH PRIVILEGES;" > /dev/null 2>&1 || true

echo -e "${GREEN}✅ MariaDB instalado${NC}"
echo "   Versão: $(mysql --version)"
echo "   Status: $(sudo systemctl is-active mariadb)"
echo ""

# ============================================================================
# PASSO 3: CLONE APPLICATION
# ============================================================================
echo -e "${YELLOW}[PASSO 3/7] Clonando repositório...${NC}"
echo ""

if [ -d "$APP_DIR" ]; then
    echo "Diretório existe, atualizando..."
    cd "$APP_DIR"
    git pull origin main > /dev/null
else
    git clone "$REPO_URL" "$APP_DIR"
fi

echo -e "${GREEN}✅ Repositório clonado${NC}"
echo ""

# ============================================================================
# PASSO 4: INSTALL DEPENDENCIES
# ============================================================================
echo -e "${YELLOW}[PASSO 4/7] Instalando dependências da aplicação...${NC}"
echo "Isto pode levar 10-15 minutos (npm install)..."
echo ""

cd "$BACKEND_DIR"
npm install --production > /dev/null

cd "$FRONTEND_DIR"
npm install --production > /dev/null

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# ============================================================================
# PASSO 5: CREATE DIRECTORIES & BUILD
# ============================================================================
echo -e "${YELLOW}[PASSO 5/7] Preparando aplicação...${NC}"
echo ""

mkdir -p "$BACKEND_DIR/uploads/documents"
mkdir -p "$BACKEND_DIR/uploads/contracts"
mkdir -p "$BACKEND_DIR/uploads/temp"
mkdir -p "$BACKEND_DIR/logs"

# Build frontend
cd "$FRONTEND_DIR"
npm run build > /dev/null

mkdir -p "$APP_DIR/public"
cp -r "$FRONTEND_DIR/dist/"* "$APP_DIR/public/" 2>/dev/null || true

echo -e "${GREEN}✅ Aplicação preparada${NC}"
echo ""

# ============================================================================
# PASSO 6: ENVIRONMENT CONFIGURATION
# ============================================================================
echo -e "${YELLOW}[PASSO 6/7] Configurando variáveis de ambiente...${NC}"
echo ""

# Database config
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="secretaria_online"
DB_USER="secretaria_user"
DB_PASSWORD="secretaria_password_$(openssl rand -hex 8)"

# JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Determine SMTP config
read -p "  Usar Gmail (g) ou outro SMTP (o)? [padrão: g]: " smtp_choice
smtp_choice=${smtp_choice:-g}

if [ "$smtp_choice" = "g" ] || [ "$smtp_choice" = "G" ]; then
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT="587"
    SMTP_USER="seu_email@gmail.com"
    SMTP_PASS="sua_senha_app"
else
    SMTP_HOST="smtp.seu_servidor.com"
    SMTP_PORT="587"
    SMTP_USER="seu_usuario@seu_servidor.com"
    SMTP_PASS="sua_senha"
fi

# Create backend .env
cat > "$BACKEND_DIR/.env" << EOF
# Server Configuration
NODE_ENV=production
PORT=3000
BASE_URL=http://$VM_IP

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email Configuration
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=noreply@secretariaonline.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=$BACKEND_DIR/uploads

# PDF Configuration
PDF_LIBRARY=pdfkit

# Logging
LOG_LEVEL=info
EOF

# Create frontend .env
cat > "$FRONTEND_DIR/.env" << EOF
VITE_API_BASE_URL=http://$VM_IP:3000/api/v1
VITE_APP_NAME=Secretaria Online
VITE_APP_ENV=production
EOF

echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"
echo ""

# ============================================================================
# PASSO 7: DATABASE & MIGRATIONS
# ============================================================================
echo -e "${YELLOW}[PASSO 7/7] Configurando banco de dados...${NC}"
echo ""

# Create database and user
echo "  Criando banco de dados..."
sudo mysql -u root -p'root_temp_123' << EOFDB > /dev/null 2>&1 || true
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOFDB

echo "  Executando migrations..."
cd "$BACKEND_DIR"
npm run db:migrate > /dev/null 2>&1 || echo "⚠️  Verifique as migrations"

echo "  Executando seeders..."
npm run db:seed > /dev/null 2>&1 || echo "⚠️  Verifique os seeders"

echo -e "${GREEN}✅ Banco de dados configurado${NC}"
echo ""

# ============================================================================
# START APPLICATION
# ============================================================================
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Iniciando aplicação...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

pm2 delete all 2>/dev/null || true
sleep 2

# Install serve
echo "  Instalando serve para frontend..."
sudo npm install -g serve > /dev/null

echo "  Iniciando backend..."
cd "$BACKEND_DIR"
pm2 start src/server.js --name "secretaria-api" --env production > /dev/null

sleep 3

echo "  Iniciando frontend..."
pm2 start "serve -s dist -l 5173" --cwd "$FRONTEND_DIR" --name "secretaria-frontend" --env production > /dev/null

# Save PM2
pm2 save > /dev/null

sleep 2

# ============================================================================
# INSTALLATION COMPLETE
# ============================================================================
clear
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}Informações de Acesso:${NC}"
echo "  ${GREEN}Frontend${NC}:      http://$VM_IP:5173"
echo "  ${GREEN}Backend API${NC}:   http://$VM_IP:3000"
echo "  ${GREEN}Health Check${NC}:  http://$VM_IP:3000/health"
echo ""

echo -e "${BLUE}Credenciais Padrão:${NC}"
echo "  ${GREEN}Usuário${NC}: admin"
echo "  ${GREEN}Senha${NC}:   admin123"
echo "  ${YELLOW}⚠️  ALTERE IMEDIATAMENTE após o primeiro acesso!${NC}"
echo ""

echo -e "${BLUE}Configuração do Banco de Dados:${NC}"
echo "  ${GREEN}Host${NC}:         $DB_HOST"
echo "  ${GREEN}Banco${NC}:        $DB_NAME"
echo "  ${GREEN}Usuário${NC}:      $DB_USER"
echo "  ${GREEN}Senha${NC}:        $DB_PASSWORD"
echo ""

echo -e "${BLUE}Status da Aplicação:${NC}"
pm2 status

echo ""
echo -e "${BLUE}Próximos Passos:${NC}"
echo "  1. Verificar saúde da aplicação:"
echo "     ${YELLOW}bash $APP_DIR/install-scripts/06-health-check.sh${NC}"
echo ""
echo "  2. Verificar logs:"
echo "     ${YELLOW}pm2 logs${NC}"
echo ""
echo "  3. Monitorar recursos:"
echo "     ${YELLOW}pm2 monit${NC}"
echo ""
echo "  4. Alterar senha SMTP no .env:"
echo "     ${YELLOW}nano $BACKEND_DIR/.env${NC}"
echo ""

echo -e "${BLUE}Documentação:${NC}"
echo "  - Guia completo: $APP_DIR/install-scripts/INSTALLATION_GUIDE.md"
echo "  - Backend: $BACKEND_DIR/README.md"
echo "  - Frontend: $FRONTEND_DIR/README.md"
echo ""

echo -e "${GREEN}Obrigado por usar Secretaria Online!${NC}"
echo ""
