#!/bin/bash

##############################################
# Script: setup-vm.sh
# Descrição: Configuração inicial da VM GCP para Secretaria Online
# Autor: Gerado via AI Workflow
# Data: 2025-11-12
##############################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# Validação de pré-requisitos
check_prerequisites() {
    log_section "VALIDANDO PRÉ-REQUISITOS"

    # Verificar se está rodando como root ou com sudo
    if [[ $EUID -eq 0 ]]; then
        log_error "Este script não deve ser executado como root!"
        log_error "Execute como usuário normal (o script usa sudo quando necessário)"
        exit 1
    fi

    # Verificar se sudo está disponível
    if ! command -v sudo &> /dev/null; then
        log_error "sudo não está instalado!"
        exit 1
    fi

    # Verificar se é Debian
    if ! grep -q "debian" /etc/os-release; then
        log_warn "Este script foi projetado para Debian 11. Você está usando outro sistema."
        read -p "Deseja continuar mesmo assim? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    log_info "Pré-requisitos validados!"
}

# Atualizar sistema
update_system() {
    log_section "ATUALIZANDO SISTEMA"

    log_info "Atualizando lista de pacotes..."
    sudo apt-get update -y

    log_info "Atualizando pacotes instalados..."
    sudo apt-get upgrade -y

    log_info "Instalando pacotes essenciais..."
    sudo apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        ufw \
        ca-certificates \
        gnupg

    log_info "Sistema atualizado!"
}

# Instalar Node.js v20 LTS
install_nodejs() {
    log_section "INSTALANDO NODE.JS v20 LTS"

    # Verificar se Node.js já está instalado
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node -v)
        log_warn "Node.js já está instalado (versão: $CURRENT_VERSION)"
        read -p "Deseja reinstalar? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Pulando instalação do Node.js"
            return
        fi
    fi

    log_info "Adicionando repositório NodeSource para Node.js v20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

    log_info "Instalando Node.js..."
    sudo apt-get install -y nodejs

    # Verificar instalação
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    log_info "Node.js instalado: $NODE_VERSION"
    log_info "npm instalado: $NPM_VERSION"
}

# Instalar PM2
install_pm2() {
    log_section "INSTALANDO PM2"

    # Verificar se PM2 já está instalado
    if command -v pm2 &> /dev/null; then
        log_warn "PM2 já está instalado"
        return
    fi

    log_info "Instalando PM2 globalmente..."
    sudo npm install -g pm2

    log_info "Configurando PM2 para iniciar no boot..."
    sudo pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))

    PM2_VERSION=$(pm2 -v)
    log_info "PM2 instalado: v$PM2_VERSION"
}

# Instalar MariaDB
install_mariadb() {
    log_section "INSTALANDO MARIADB"

    # Verificar se MariaDB já está instalado
    if command -v mysql &> /dev/null; then
        log_warn "MariaDB/MySQL já está instalado"
        return
    fi

    log_info "Instalando MariaDB Server..."
    sudo apt-get install -y mariadb-server mariadb-client

    log_info "Iniciando serviço MariaDB..."
    sudo systemctl start mariadb
    sudo systemctl enable mariadb

    log_info "MariaDB instalado e iniciado!"
    log_warn "IMPORTANTE: Execute 'sudo mysql_secure_installation' manualmente para configurar segurança"
}

# Configurar firewall
configure_firewall() {
    log_section "CONFIGURANDO FIREWALL (UFW)"

    log_info "Configurando regras do firewall..."

    # Permitir SSH (IMPORTANTE: fazer isso primeiro!)
    sudo ufw allow 22/tcp
    log_info "Porta 22 (SSH) permitida"

    # Permitir HTTP e HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    log_info "Portas 80 (HTTP) e 443 (HTTPS) permitidas"

    # Permitir porta da aplicação (3000) - apenas localmente
    sudo ufw allow from 127.0.0.1 to any port 3000
    log_info "Porta 3000 (Node.js) permitida apenas localmente"

    # Habilitar firewall
    log_warn "Habilitando firewall..."
    sudo ufw --force enable

    log_info "Status do firewall:"
    sudo ufw status verbose
}

# Criar estrutura de diretórios
create_directories() {
    log_section "CRIANDO ESTRUTURA DE DIRETÓRIOS"

    # Diretório principal da aplicação
    APP_DIR="/opt/secretaria-online"

    log_info "Criando diretório da aplicação: $APP_DIR"
    sudo mkdir -p $APP_DIR
    sudo chown -R $(whoami):$(whoami) $APP_DIR

    # Diretórios para uploads e logs
    log_info "Criando diretórios de uploads e logs..."
    mkdir -p $APP_DIR/backend/uploads/{documents,contracts,temp}
    mkdir -p $APP_DIR/backend/logs/{pm2,app}

    log_info "Estrutura de diretórios criada:"
    tree -L 3 $APP_DIR 2>/dev/null || ls -la $APP_DIR
}

# Configurar Nginx (opcional, mas recomendado)
install_nginx() {
    log_section "INSTALANDO NGINX (PROXY REVERSO)"

    read -p "Deseja instalar Nginx como proxy reverso? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
        log_info "Pulando instalação do Nginx"
        return
    fi

    log_info "Instalando Nginx..."
    sudo apt-get install -y nginx

    log_info "Iniciando Nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx

    log_info "Nginx instalado e iniciado!"
    log_warn "Configure o Nginx manualmente após o deploy da aplicação"
}

# Instalar Certbot para SSL (opcional)
install_certbot() {
    log_section "INSTALANDO CERTBOT (Let's Encrypt SSL)"

    read -p "Deseja instalar Certbot para SSL gratuito? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
        log_info "Pulando instalação do Certbot"
        return
    fi

    log_info "Instalando Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx

    log_info "Certbot instalado!"
    log_warn "Execute 'sudo certbot --nginx' após configurar o Nginx e o DNS"
}

# Resumo final
show_summary() {
    log_section "RESUMO DA INSTALAÇÃO"

    echo -e "${GREEN}✓${NC} Sistema atualizado"
    echo -e "${GREEN}✓${NC} Node.js $(node -v) instalado"
    echo -e "${GREEN}✓${NC} npm $(npm -v) instalado"
    echo -e "${GREEN}✓${NC} PM2 instalado"
    echo -e "${GREEN}✓${NC} MariaDB instalado"
    echo -e "${GREEN}✓${NC} Firewall configurado"
    echo -e "${GREEN}✓${NC} Diretórios criados"

    if command -v nginx &> /dev/null; then
        echo -e "${GREEN}✓${NC} Nginx instalado"
    fi

    if command -v certbot &> /dev/null; then
        echo -e "${GREEN}✓${NC} Certbot instalado"
    fi

    log_section "PRÓXIMOS PASSOS"

    echo "1. Configure o MariaDB:"
    echo "   ${YELLOW}sudo mysql_secure_installation${NC}"
    echo ""
    echo "2. Crie o banco de dados e usuário:"
    echo "   ${YELLOW}sudo mysql -u root -p${NC}"
    echo "   ${YELLOW}CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;${NC}"
    echo "   ${YELLOW}CREATE USER 'secretaria_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';${NC}"
    echo "   ${YELLOW}GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';${NC}"
    echo "   ${YELLOW}FLUSH PRIVILEGES;${NC}"
    echo "   ${YELLOW}EXIT;${NC}"
    echo ""
    echo "3. Execute o script de deploy:"
    echo "   ${YELLOW}bash deploy-app.sh${NC}"
    echo ""
}

# Função principal
main() {
    log_section "SETUP DA VM - SECRETARIA ONLINE"
    log_info "Iniciando configuração da VM..."

    check_prerequisites
    update_system
    install_nodejs
    install_pm2
    install_mariadb
    configure_firewall
    create_directories
    install_nginx
    install_certbot
    show_summary

    log_info "${GREEN}Setup da VM concluído com sucesso!${NC}"
}

# Executar
main "$@"
