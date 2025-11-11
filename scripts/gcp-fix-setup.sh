#!/bin/bash

################################################################################
# Script de Correção - GCP Setup
# Descrição: Instala apenas o que está faltando
# Uso: sudo bash gcp-fix-setup.sh
################################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    log_error "Por favor, execute como root (sudo bash gcp-fix-setup.sh)"
    exit 1
fi

log_info "=== Instalando componentes faltantes ==="

# 1. Atualizar sistema
log_info "Atualizando lista de pacotes..."
apt-get update -y

# 2. MySQL 8.0
if ! command -v mysql &> /dev/null; then
    log_info "Instalando MySQL 8.0..."

    # Instalar MySQL Server
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

    # Iniciar e habilitar MySQL
    systemctl start mysql
    systemctl enable mysql

    log_info "MySQL instalado e iniciado"
    mysql --version
else
    log_info "MySQL já está instalado"
fi

# 3. Nginx
if ! command -v nginx &> /dev/null; then
    log_info "Instalando Nginx..."

    apt-get install -y nginx

    # Iniciar e habilitar Nginx
    systemctl start nginx
    systemctl enable nginx

    log_info "Nginx instalado e iniciado"
    nginx -v
else
    log_info "Nginx já está instalado"
fi

# 4. Certbot
if ! command -v certbot &> /dev/null; then
    log_info "Instalando Certbot..."

    apt-get install -y certbot python3-certbot-nginx

    log_info "Certbot instalado"
    certbot --version
else
    log_info "Certbot já está instalado"
fi

# 5. UFW
if ! command -v ufw &> /dev/null; then
    log_info "Instalando UFW..."

    apt-get install -y ufw

    log_info "UFW instalado"
else
    log_info "UFW já está instalado"
fi

# 6. Configurar Firewall
log_info "Configurando firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000/tcp
ufw status

# 7. Criar usuário deploy (se não existir)
DEPLOY_USER="deploy"
if id "$DEPLOY_USER" &>/dev/null; then
    log_info "Usuário $DEPLOY_USER já existe"
else
    log_info "Criando usuário $DEPLOY_USER..."
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    log_info "Usuário $DEPLOY_USER criado"
fi

# 8. Criar estrutura de diretórios
log_info "Criando/verificando estrutura de diretórios..."
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

log_info "Estrutura de diretórios criada/verificada"

# 9. Configurar PM2 para iniciar no boot
log_info "Configurando PM2 para iniciar no boot..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER

# 10. Configurar logrotate
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

# 11. Exibir resumo
echo ""
log_info "=== Instalação concluída! ==="
echo ""
log_info "Resumo dos componentes:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - MySQL: $(mysql --version 2>&1 | head -n1)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - Certbot: $(certbot --version 2>&1 | head -n1)"
echo ""

log_info "Serviços rodando:"
systemctl is-active mysql && echo "  ✓ MySQL" || echo "  ✗ MySQL"
systemctl is-active nginx && echo "  ✓ Nginx" || echo "  ✗ Nginx"
echo ""

log_warn "=== IMPORTANTE: Configuração do MySQL ==="
log_warn "Execute os seguintes comandos para configurar o MySQL:"
echo ""
echo "1. Configurar segurança do MySQL:"
echo "   sudo mysql_secure_installation"
echo ""
echo "2. Criar banco de dados e usuário:"
echo "   sudo mysql"
echo "   CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'secretaria_user'@'localhost' IDENTIFIED BY 'SuaSenhaForteAqui123!';"
echo "   GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""

log_info "Próximos passos:"
echo "  1. Configure o MySQL (comandos acima)"
echo "  2. Configure o Nginx (copie configs/nginx.conf)"
echo "  3. Configure o SSL com certbot"
echo "  4. Faça o deploy da aplicação"
