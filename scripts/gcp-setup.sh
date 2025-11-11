#!/bin/bash

################################################################################
# Script de Provisionamento - GCP Compute Engine (Debian)
# Secretaria Online
#
# Descrição: Instala todas as dependências necessárias no servidor Debian
# Uso: sudo bash gcp-setup.sh
################################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    log_error "Por favor, execute como root (sudo bash gcp-setup.sh)"
    exit 1
fi

log_info "=== Iniciando provisionamento do servidor ==="

# 1. Atualizar sistema
log_info "Atualizando sistema..."
apt-get update -y
apt-get upgrade -y

# 2. Instalar dependências básicas
log_info "Instalando dependências básicas..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    vim \
    unzip

# 3. Instalar Node.js v20 LTS
log_info "Instalando Node.js v20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_info "Node.js instalado: $NODE_VERSION"
log_info "npm instalado: $NPM_VERSION"

# 4. Instalar PM2 globalmente
log_info "Instalando PM2..."
npm install -g pm2
pm2 completion install
log_info "PM2 instalado: $(pm2 --version)"

# 5. Instalar MySQL 8.0
log_info "Instalando MySQL 8.0..."
apt-get install -y mysql-server

# Iniciar MySQL
systemctl start mysql
systemctl enable mysql

log_info "MySQL instalado e iniciado"

# 6. Configurar Firewall (UFW)
log_info "Configurando firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000/tcp  # API Backend (temporário para testes)
ufw allow 3306/tcp  # MySQL (apenas se necessário acesso externo)

log_info "Firewall configurado"

# 7. Criar usuário para deploy (se não existir)
DEPLOY_USER="deploy"
if id "$DEPLOY_USER" &>/dev/null; then
    log_warn "Usuário $DEPLOY_USER já existe"
else
    log_info "Criando usuário $DEPLOY_USER..."
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    log_info "Usuário $DEPLOY_USER criado"
fi

# 8. Criar estrutura de diretórios
log_info "Criando estrutura de diretórios..."
mkdir -p /var/www/secretaria-online/frontend
mkdir -p /var/www/secretaria-online/backend
mkdir -p /var/www/secretaria-online/uploads/documents
mkdir -p /var/www/secretaria-online/uploads/contracts
mkdir -p /var/www/secretaria-online/uploads/temp
mkdir -p /var/www/secretaria-online/logs
mkdir -p /var/www/secretaria-online/backups

# Ajustar permissões
chown -R $DEPLOY_USER:$DEPLOY_USER /var/www/secretaria-online
chmod -R 755 /var/www/secretaria-online
chmod -R 775 /var/www/secretaria-online/uploads
chmod -R 775 /var/www/secretaria-online/logs

log_info "Estrutura de diretórios criada"

# 9. Configurar PM2 para iniciar no boot
log_info "Configurando PM2 para iniciar no boot..."
sudo -u $DEPLOY_USER pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER | tail -n 1 | bash

# 10. Configurar logrotate para logs da aplicação
log_info "Configurando logrotate..."
cat > /etc/logrotate.d/secretaria-online << EOF
/var/www/secretaria-online/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 $DEPLOY_USER $DEPLOY_USER
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# 11. Configurar MySQL para aceitar conexões externas (opcional)
log_info "Configurando MySQL..."
# Backup do arquivo de configuração
cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.bak

# Comentar bind-address para permitir conexões externas (se necessário)
# sed -i 's/^bind-address/#bind-address/' /etc/mysql/mysql.conf.d/mysqld.cnf

systemctl restart mysql

# 12. Exibir informações de segurança do MySQL
log_warn "=== IMPORTANTE: Segurança do MySQL ==="
log_warn "Execute o seguinte comando para configurar a segurança do MySQL:"
log_warn "  sudo mysql_secure_installation"
log_warn ""
log_warn "Crie o banco de dados e usuário:"
log_warn "  sudo mysql"
log_warn "  CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
log_warn "  CREATE USER 'secretaria_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';"
log_warn "  GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';"
log_warn "  FLUSH PRIVILEGES;"
log_warn "  EXIT;"

# 13. Informações finais
log_info "=== Provisionamento concluído com sucesso! ==="
echo ""
log_info "Versões instaladas:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - MySQL: $(mysql --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo ""
log_info "Próximos passos:"
echo "  1. Configure a segurança do MySQL (mysql_secure_installation)"
echo "  2. Crie o banco de dados e usuário"
echo "  3. Configure o Nginx (use o arquivo gcp-nginx.conf)"
echo "  4. Configure o SSL com Let's Encrypt"
echo "  5. Faça o deploy da aplicação (use o script gcp-deploy.sh)"
echo ""
log_info "Estrutura criada em: /var/www/secretaria-online"
log_info "Usuário de deploy: $DEPLOY_USER"
