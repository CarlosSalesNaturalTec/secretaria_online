#!/bin/bash

################################################################################
# Script de Finalização do Setup - GCP
# Descrição: Completa configuração do ambiente
# Uso: sudo bash gcp-complete-setup.sh
################################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    log_error "Por favor, execute como root (sudo bash gcp-complete-setup.sh)"
    exit 1
fi

log_info "=== Finalizando configuração do servidor ==="
echo ""

# 1. Instalar UFW (se não estiver instalado)
if ! command -v ufw &> /dev/null; then
    log_step "Instalando UFW..."
    apt-get update -y
    apt-get install -y ufw
    log_info "UFW instalado"
fi

# 2. Configurar Firewall
log_step "Configurando firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # API backend (temporário para testes)

log_info "Firewall configurado"
ufw status verbose

echo ""

# 3. Criar usuário deploy (se não existir)
DEPLOY_USER="deploy"
if id "$DEPLOY_USER" &>/dev/null; then
    log_info "Usuário $DEPLOY_USER já existe"
else
    log_step "Criando usuário $DEPLOY_USER..."
    useradd -m -s /bin/bash $DEPLOY_USER

    # Adicionar ao grupo sudo
    usermod -aG sudo $DEPLOY_USER

    log_info "Usuário $DEPLOY_USER criado"

    # Configurar senha (opcional)
    log_warn "Configure uma senha para o usuário deploy:"
    passwd $DEPLOY_USER || log_warn "Senha não configurada"
fi

echo ""

# 4. Criar estrutura de diretórios
log_step "Criando estrutura de diretórios..."

mkdir -p /var/www/secretaria-online/frontend
mkdir -p /var/www/secretaria-online/backend
mkdir -p /var/www/secretaria-online/uploads/documents
mkdir -p /var/www/secretaria-online/uploads/contracts
mkdir -p /var/www/secretaria-online/uploads/temp
mkdir -p /var/www/secretaria-online/logs
mkdir -p /var/www/secretaria-online/backups/database
mkdir -p /var/www/secretaria-online/backups/uploads

log_info "Estrutura de diretórios criada"

# 5. Ajustar permissões
log_step "Ajustando permissões..."

chown -R $DEPLOY_USER:$DEPLOY_USER /var/www/secretaria-online
chmod -R 755 /var/www/secretaria-online
chmod -R 775 /var/www/secretaria-online/uploads
chmod -R 775 /var/www/secretaria-online/logs
chmod -R 775 /var/www/secretaria-online/backups

log_info "Permissões ajustadas"

# 6. Adicionar nginx ao PATH do usuário
log_step "Configurando PATH do Nginx..."

# Criar link simbólico se não existir
if [ ! -f /usr/bin/nginx ] && [ -f /usr/sbin/nginx ]; then
    ln -sf /usr/sbin/nginx /usr/bin/nginx
    log_info "Link simbólico para nginx criado"
fi

# 7. Configurar PM2 para usuário deploy
log_step "Configurando PM2 para usuário deploy..."

# Executar como usuário deploy
sudo -u $DEPLOY_USER bash << 'EOFSU'
    # Configurar PM2 startup
    pm2 startup systemd -u deploy --hp /home/deploy 2>&1 | grep "sudo" | bash

    # Criar diretório de logs do PM2
    mkdir -p /home/deploy/.pm2/logs
EOFSU

log_info "PM2 configurado para iniciar no boot"

# 8. Configurar logrotate
log_step "Configurando logrotate..."

cat > /etc/logrotate.d/secretaria-online << 'EOF'
/var/www/secretaria-online/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 deploy deploy
    sharedscripts
    postrotate
        sudo -u deploy pm2 reloadLogs 2>/dev/null || true
    endscript
}
EOF

log_info "Logrotate configurado"

# 9. Configurar SSH para usuário deploy (chave pública)
log_step "Preparando SSH para usuário deploy..."

sudo -u $DEPLOY_USER bash << 'EOFSU'
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
EOFSU

log_info "Diretório SSH preparado para deploy"
log_warn "Adicione sua chave SSH pública em: /home/deploy/.ssh/authorized_keys"

# 10. Criar diretório para certbot
log_step "Preparando diretório para Certbot..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

log_info "Diretório certbot criado"

# 11. Criar scripts de backup
log_step "Criando scripts de backup..."

# Script de backup do banco de dados
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/secretaria-online/backups/database"
DB_NAME="secretaria_online"
DB_USER="secretaria_user"
DB_PASS="${DB_PASSWORD:-}"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="secretaria_db_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

if [ -z "$DB_PASS" ]; then
    # Tentar ler do .env
    if [ -f "/var/www/secretaria-online/backend/.env" ]; then
        DB_PASS=$(grep DB_PASS /var/www/secretaria-online/backend/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    fi
fi

if [ -n "$DB_PASS" ]; then
    mysqldump -u $DB_USER -p"$DB_PASS" $DB_NAME | gzip > $BACKUP_DIR/$FILENAME
    echo "Backup criado: $FILENAME"

    # Manter apenas últimos 30 backups
    find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
else
    echo "Erro: Senha do banco de dados não encontrada"
    exit 1
fi
EOF

chmod +x /usr/local/bin/backup-db.sh

# Script de backup de uploads
cat > /usr/local/bin/backup-uploads.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/secretaria-online/backups/uploads"
UPLOADS_DIR="/var/www/secretaria-online/uploads"
DATE=$(date +%Y%m%d)
FILENAME="uploads_${DATE}.tar.gz"

mkdir -p $BACKUP_DIR

if [ -d "$UPLOADS_DIR" ] && [ "$(ls -A $UPLOADS_DIR)" ]; then
    tar -czf $BACKUP_DIR/$FILENAME -C $UPLOADS_DIR .
    echo "Backup criado: $FILENAME"

    # Manter apenas últimos 7 backups semanais
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
else
    echo "Diretório de uploads vazio ou não existe"
fi
EOF

chmod +x /usr/local/bin/backup-uploads.sh

log_info "Scripts de backup criados"

# 12. Configurar cron jobs para backups (comentado - usuário deve ativar manualmente)
log_step "Preparando cron jobs..."

cat > /tmp/cron_secretaria << 'EOF'
# Backup do banco de dados (todo dia às 2h da manhã)
# 0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1

# Backup de uploads (todo domingo às 3h da manhã)
# 0 3 * * 0 /usr/local/bin/backup-uploads.sh >> /var/log/backup-uploads.log 2>&1

# Limpeza de arquivos temporários (todo dia às 4h da manhã)
# 0 4 * * * find /var/www/secretaria-online/uploads/temp -type f -mtime +7 -delete
EOF

log_warn "Cron jobs preparados em /tmp/cron_secretaria"
log_warn "Execute: sudo crontab -e  e adicione as linhas descomentando-as"

# 13. Verificar instalação do Nginx
if ! command -v nginx &> /dev/null && ! [ -f /usr/sbin/nginx ]; then
    log_warn "Nginx não encontrado no PATH. Criando link simbólico..."

    # Procurar nginx
    NGINX_PATH=$(which nginx 2>/dev/null || find /usr -name nginx -type f 2>/dev/null | head -n1)

    if [ -n "$NGINX_PATH" ]; then
        ln -sf "$NGINX_PATH" /usr/bin/nginx
        log_info "Link criado: /usr/bin/nginx -> $NGINX_PATH"
    fi
fi

echo ""
log_info "=== Configuração finalizada! ==="
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RESUMO DA CONFIGURAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✓ Firewall UFW ativado"
echo "✓ Usuário 'deploy' criado"
echo "✓ Estrutura de diretórios criada em /var/www/secretaria-online"
echo "✓ Permissões ajustadas"
echo "✓ PM2 configurado para iniciar no boot"
echo "✓ Logrotate configurado"
echo "✓ Scripts de backup criados"
echo ""
echo "PRÓXIMOS PASSOS:"
echo ""
echo "1. Adicionar sua chave SSH pública ao usuário deploy:"
echo "   echo 'sua-chave-publica' | sudo tee -a /home/deploy/.ssh/authorized_keys"
echo ""
echo "2. Verificar instalação completa:"
echo "   bash gcp-verify-installation.sh"
echo ""
echo "3. Configurar Nginx:"
echo "   sudo cp configs/nginx.conf /etc/nginx/sites-available/secretaria-online"
echo "   # Editar o domínio no arquivo"
echo "   sudo ln -s /etc/nginx/sites-available/secretaria-online /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. Configurar SSL com Certbot:"
echo "   sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com"
echo ""
echo "5. Fazer deploy da aplicação:"
echo "   bash scripts/gcp-deploy.sh all"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
