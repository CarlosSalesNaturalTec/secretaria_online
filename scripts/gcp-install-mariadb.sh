#!/bin/bash

################################################################################
# Script de Instalação do MariaDB - Secretaria Online
# Descrição: Instala e configura MariaDB 10.5+ no Debian 11
# Uso: sudo bash gcp-install-mariadb.sh
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
    log_error "Por favor, execute como root (sudo bash gcp-install-mariadb.sh)"
    exit 1
fi

log_info "=== Instalando MariaDB no Debian 11 ==="
echo ""

# 1. Atualizar sistema
log_step "Atualizando lista de pacotes..."
apt-get update -y

# 2. Instalar MariaDB
log_step "Instalando MariaDB Server..."
DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client

# 3. Iniciar e habilitar MariaDB
log_step "Iniciando serviço MariaDB..."
systemctl start mariadb
systemctl enable mariadb

# Aguardar serviço estar pronto
sleep 3

# 4. Verificar instalação
log_info "Verificando instalação..."
if systemctl is-active --quiet mariadb; then
    echo -e "${GREEN}✓${NC} MariaDB está RODANDO"
else
    log_error "MariaDB não está rodando"
    exit 1
fi

# Exibir versão
MARIADB_VERSION=$(mysql --version 2>&1 | head -n1)
log_info "Versão instalada: $MARIADB_VERSION"

echo ""
log_info "=== MariaDB instalado com sucesso! ==="
echo ""

# 5. Instruções de segurança
log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_warn "  PRÓXIMOS PASSOS - CONFIGURAÇÃO DE SEGURANÇA"
log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  CONFIGURAR SEGURANÇA DO MARIADB:"
echo "    Execute: sudo mysql_secure_installation"
echo ""
echo "    Responda:"
echo "    - Enter current password for root: [ENTER] (vazio)"
echo "    - Switch to unix_socket authentication: N"
echo "    - Change the root password: Y → Digite senha forte"
echo "    - Remove anonymous users: Y"
echo "    - Disallow root login remotely: Y"
echo "    - Remove test database: Y"
echo "    - Reload privilege tables: Y"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣  CRIAR BANCO DE DADOS E USUÁRIO:"
echo "    Execute: sudo mysql"
echo ""
echo "    No prompt do MariaDB, execute:"
echo ""
echo "    CREATE DATABASE secretaria_online"
echo "        CHARACTER SET utf8mb4"
echo "        COLLATE utf8mb4_unicode_ci;"
echo ""
echo "    CREATE USER 'secretaria_user'@'localhost'"
echo "        IDENTIFIED BY 'SuaSenhaForteAqui123!';"
echo ""
echo "    GRANT ALL PRIVILEGES ON secretaria_online.*"
echo "        TO 'secretaria_user'@'localhost';"
echo ""
echo "    FLUSH PRIVILEGES;"
echo ""
echo "    SHOW DATABASES;"
echo ""
echo "    EXIT;"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3️⃣  TESTAR CONEXÃO:"
echo "    mysql -u secretaria_user -p secretaria_online"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Status do serviço:"
systemctl status mariadb --no-pager | head -n 10
