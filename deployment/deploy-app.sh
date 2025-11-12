#!/bin/bash

##############################################
# Script: deploy-app.sh
# Descrição: Deploy/atualização da aplicação Secretaria Online
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

# Configurações
APP_DIR="/opt/secretaria-online"
REPO_URL="https://github.com/CarlosSalesNaturalTec/secretaria_online.git"
BRANCH="main"

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

    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js não está instalado! Execute setup-vm.sh primeiro"
        exit 1
    fi

    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm não está instalado! Execute setup-vm.sh primeiro"
        exit 1
    fi

    # Verificar PM2
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 não está instalado! Execute setup-vm.sh primeiro"
        exit 1
    fi

    # Verificar MariaDB
    if ! command -v mysql &> /dev/null; then
        log_error "MariaDB não está instalado! Execute setup-vm.sh primeiro"
        exit 1
    fi

    # Verificar Git
    if ! command -v git &> /dev/null; then
        log_error "Git não está instalado!"
        exit 1
    fi

    log_info "Pré-requisitos validados!"
    log_info "Node.js: $(node -v)"
    log_info "npm: $(npm -v)"
    log_info "PM2: $(pm2 -v)"
}

# Clone ou pull do repositório
clone_or_pull_repo() {
    log_section "OBTENDO CÓDIGO DA APLICAÇÃO"

    # Verificar se diretório existe e criar se necessário
    if [ ! -d "$APP_DIR" ]; then
        log_info "Criando diretório $APP_DIR..."
        sudo mkdir -p $APP_DIR
        sudo chown -R $(whoami):$(whoami) $APP_DIR
    fi

    # Garantir que temos permissão no diretório
    if [ ! -w "$APP_DIR" ]; then
        log_warn "Ajustando permissões do diretório..."
        sudo chown -R $(whoami):$(whoami) $APP_DIR
    fi

    if [ -d "$APP_DIR/.git" ]; then
        log_info "Repositório já existe. Atualizando..."
        cd $APP_DIR

        # Fazer backup de .env antes de pull
        if [ -f "$APP_DIR/backend/.env" ]; then
            log_info "Fazendo backup do .env..."
            cp $APP_DIR/backend/.env $APP_DIR/backend/.env.backup
        fi

        git fetch origin
        git checkout $BRANCH
        git pull origin $BRANCH

        # Restaurar .env se foi removido
        if [ -f "$APP_DIR/backend/.env.backup" ] && [ ! -f "$APP_DIR/backend/.env" ]; then
            log_info "Restaurando .env..."
            mv $APP_DIR/backend/.env.backup $APP_DIR/backend/.env
        fi

        log_info "Repositório atualizado!"
    else
        log_info "Clonando repositório..."
        git clone $REPO_URL $APP_DIR
        cd $APP_DIR
        git checkout $BRANCH

        # Garantir permissões corretas após clone
        sudo chown -R $(whoami):$(whoami) $APP_DIR

        log_info "Repositório clonado!"
    fi
}

# Configurar variáveis de ambiente
setup_environment() {
    log_section "CONFIGURANDO VARIÁVEIS DE AMBIENTE"

    # Backend .env
    if [ ! -f "$APP_DIR/backend/.env" ]; then
        log_warn "Arquivo backend/.env não encontrado!"

        if [ -f "$APP_DIR/backend/.env.example" ]; then
            log_info "Copiando .env.example para .env..."
            cp $APP_DIR/backend/.env.example $APP_DIR/backend/.env
            log_error "IMPORTANTE: Edite $APP_DIR/backend/.env com suas credenciais reais!"
            log_error "Pressione qualquer tecla após editar o arquivo..."
            read -n 1 -s
        else
            log_error "Arquivo .env.example não encontrado!"
            exit 1
        fi
    else
        log_info "Arquivo backend/.env já existe"
    fi

    # Frontend .env
    if [ ! -f "$APP_DIR/frontend/.env" ]; then
        log_warn "Arquivo frontend/.env não encontrado!"

        if [ -f "$APP_DIR/frontend/.env.example" ]; then
            log_info "Copiando .env.example para .env..."
            cp $APP_DIR/frontend/.env.example $APP_DIR/frontend/.env
            log_warn "Lembre-se de configurar VITE_API_BASE_URL no frontend/.env"
        fi
    else
        log_info "Arquivo frontend/.env já existe"
    fi
}

# Instalar dependências do backend
install_backend_dependencies() {
    log_section "INSTALANDO DEPENDÊNCIAS DO BACKEND"

    cd $APP_DIR/backend

    log_info "Instalando dependências com npm..."

    # Verificar se existe package-lock.json
    if [ -f "package-lock.json" ]; then
        log_info "Usando npm ci (clean install)..."
        npm ci --production=false
    else
        log_warn "package-lock.json não encontrado. Usando npm install..."
        npm install
    fi

    log_info "Dependências do backend instaladas!"
}

# Executar migrations do banco de dados
run_migrations() {
    log_section "EXECUTANDO MIGRATIONS DO BANCO DE DADOS"

    cd $APP_DIR/backend

    # Verificar se arquivo .env existe
    if [ ! -f ".env" ]; then
        log_error "Arquivo .env não encontrado!"
        exit 1
    fi

    # Carregar variáveis do .env de forma segura
    # Filtra apenas linhas que começam com letras (variáveis válidas)
    set -a
    while IFS='=' read -r key value; do
        # Remover espaços e verificar se é uma variável válida
        key=$(echo "$key" | xargs)
        if [[ $key =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
            export "$key=$value"
        fi
    done < <(grep -E "^[A-Za-z_]" .env | grep -v '^#' | sed 's/\r$//')
    set +a

    log_info "Testando conexão com banco de dados..."
    log_info "Host: $DB_HOST"
    log_info "Database: $DB_NAME"
    log_info "User: $DB_USER"

    # Verificar se variáveis foram carregadas
    if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        log_error "Variáveis de banco de dados não configuradas corretamente no .env"
        log_error "Verifique se DB_HOST, DB_NAME, DB_USER e DB_PASSWORD estão definidos"
        exit 1
    fi

    # Testar conexão
    MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -u "$DB_USER" -e "USE $DB_NAME;" 2>/dev/null

    if [ $? -ne 0 ]; then
        log_error "Não foi possível conectar ao banco de dados!"
        log_error "Verifique as credenciais no arquivo .env"

        # Mostrar ajuda
        echo ""
        log_warn "Para testar manualmente:"
        echo "  mysql -h $DB_HOST -u $DB_USER -p"
        echo ""

        exit 1
    fi

    log_info "Conexão com banco de dados OK!"

    # Executar migrations
    log_info "Executando migrations..."
    npm run db:migrate

    # Perguntar se deseja executar seeders
    read -p "Deseja executar seeders (dados iniciais)? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Executando seeders..."
        npm run db:seed
    fi

    log_info "Migrations concluídas!"
}

# Build do frontend
build_frontend() {
    log_section "BUILD DO FRONTEND"

    cd $APP_DIR/frontend

    log_info "Instalando dependências do frontend..."

    # Verificar se existe package-lock.json
    if [ -f "package-lock.json" ]; then
        log_info "Usando npm ci (clean install)..."
        npm ci --include=dev
    else
        log_warn "package-lock.json não encontrado. Usando npm install..."
        # IMPORTANTE: Frontend precisa de devDependencies para build (TypeScript, Vite, etc)
        npm install --include=dev
    fi

    # Verificar se TypeScript foi instalado
    if ! npx tsc --version &> /dev/null; then
        log_error "TypeScript não foi instalado corretamente!"
        log_error "Tentando instalar manualmente..."
        npm install --save-dev typescript
    fi

    log_info "Executando build do frontend..."
    npm run build

    if [ ! -d "dist" ]; then
        log_error "Build falhou! Diretório dist não foi criado."
        exit 1
    fi

    log_info "Build do frontend concluído!"
    log_info "Arquivos estáticos gerados em: $APP_DIR/frontend/dist"
}

# Configurar Nginx (se instalado)
configure_nginx() {
    log_section "CONFIGURANDO NGINX"

    if ! command -v nginx &> /dev/null; then
        log_warn "Nginx não está instalado. Pulando configuração."
        return
    fi

    read -p "Deseja configurar Nginx automaticamente? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Pulando configuração do Nginx"
        return
    fi

    # Solicitar domínio
    read -p "Digite o domínio da aplicação (ex: secretaria.example.com): " DOMAIN

    if [ -z "$DOMAIN" ]; then
        log_error "Domínio não pode estar vazio!"
        return
    fi

    NGINX_CONF="/etc/nginx/sites-available/secretaria-online"

    log_info "Criando configuração do Nginx..."

    sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Frontend (arquivos estáticos)
    root $APP_DIR/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/secretaria-online-access.log;
    error_log /var/log/nginx/secretaria-online-error.log;

    # API Backend (proxy reverso)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Frontend (SPA fallback)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

    # Habilitar site
    sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

    # Testar configuração
    log_info "Testando configuração do Nginx..."
    sudo nginx -t

    # Recarregar Nginx
    log_info "Recarregando Nginx..."
    sudo systemctl reload nginx

    log_info "Nginx configurado!"
    log_warn "Para habilitar SSL, execute: sudo certbot --nginx -d $DOMAIN"
}

# Iniciar/reiniciar aplicação com PM2
start_application() {
    log_section "INICIANDO APLICAÇÃO COM PM2"

    cd $APP_DIR/backend

    # Verificar se aplicação já está rodando
    if pm2 list | grep -q "secretaria-online-api"; then
        log_info "Aplicação já está rodando. Reiniciando..."
        pm2 reload ecosystem.config.js --env production
    else
        log_info "Iniciando aplicação pela primeira vez..."
        pm2 start ecosystem.config.js --env production
    fi

    # Salvar configuração do PM2
    pm2 save

    log_info "Aplicação iniciada com PM2!"
}

# Verificar status da aplicação
check_application_status() {
    log_section "VERIFICANDO STATUS DA APLICAÇÃO"

    log_info "Status do PM2:"
    pm2 list

    echo ""
    log_info "Logs recentes:"
    pm2 logs secretaria-online-api --lines 20 --nostream

    echo ""
    log_info "Testando endpoint da API..."
    sleep 2

    if curl -f http://localhost:3000/health 2>/dev/null; then
        log_info "${GREEN}✓${NC} API está respondendo!"
    else
        log_warn "API não está respondendo. Verifique os logs com: pm2 logs secretaria-online-api"
    fi
}

# Resumo final
show_summary() {
    log_section "DEPLOY CONCLUÍDO!"

    echo -e "${GREEN}✓${NC} Código atualizado do repositório"
    echo -e "${GREEN}✓${NC} Dependências instaladas"
    echo -e "${GREEN}✓${NC} Migrations executadas"
    echo -e "${GREEN}✓${NC} Frontend buildado"
    echo -e "${GREEN}✓${NC} Aplicação iniciada com PM2"

    if command -v nginx &> /dev/null; then
        echo -e "${GREEN}✓${NC} Nginx configurado"
    fi

    log_section "COMANDOS ÚTEIS"

    echo "Visualizar logs:"
    echo "  ${YELLOW}pm2 logs secretaria-online-api${NC}"
    echo ""
    echo "Reiniciar aplicação:"
    echo "  ${YELLOW}pm2 restart secretaria-online-api${NC}"
    echo ""
    echo "Status da aplicação:"
    echo "  ${YELLOW}pm2 status${NC}"
    echo ""
    echo "Parar aplicação:"
    echo "  ${YELLOW}pm2 stop secretaria-online-api${NC}"
    echo ""
}

# Função principal
main() {
    log_section "DEPLOY - SECRETARIA ONLINE"
    log_info "Iniciando processo de deploy..."

    check_prerequisites
    clone_or_pull_repo
    setup_environment
    install_backend_dependencies
    run_migrations
    build_frontend
    configure_nginx
    start_application
    check_application_status
    show_summary

    log_info "${GREEN}Deploy concluído com sucesso!${NC}"
}

# Executar
main "$@"
