#!/bin/bash

################################################################################
# Script de Clonagem do Repositório - Secretaria Online
# Descrição: Clona repositório do GitHub e configura ambiente
# Uso: bash gcp-clone-repository.sh
################################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# ============================================================================
# CONFIGURAÇÕES - EDITE AQUI
# ============================================================================

# Repositório Git
GIT_REPO_URL="https://github.com/CarlosSalesNaturalTec/secretaria_online"  # EDITE AQUI
GIT_BRANCH="main"  # ou "develop" conforme seu caso

# Diretórios
BASE_DIR="/var/www/secretaria-online"
BACKUP_DIR="/var/www/secretaria-online-backup-$(date +%Y%m%d_%H%M%S)"

# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  CLONAGEM DO REPOSITÓRIO - SECRETARIA ONLINE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    log_error "Git não está instalado. Execute: sudo apt-get install -y git"
    exit 1
fi

# Verificar URL do repositório
if [[ "$GIT_REPO_URL" == *"seu-usuario"* ]]; then
    log_error "Você precisa editar a URL do repositório no script!"
    log_error "Abra o script e altere a variável GIT_REPO_URL"
    echo ""
    echo "Exemplo:"
    echo "  GIT_REPO_URL=\"https://github.com/seu-usuario/secretaria-online.git\""
    echo ""
    echo "Ou use repositório privado com SSH:"
    echo "  GIT_REPO_URL=\"git@github.com:seu-usuario/secretaria-online.git\""
    exit 1
fi

log_info "Configurações:"
echo "  Repositório: $GIT_REPO_URL"
echo "  Branch: $GIT_BRANCH"
echo "  Destino: $BASE_DIR"
echo ""

# Perguntar confirmação
read -p "Continuar com a clonagem? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_warn "Operação cancelada pelo usuário"
    exit 0
fi

# 1. Fazer backup se diretório já existir
if [ -d "$BASE_DIR" ]; then
    log_warn "Diretório $BASE_DIR já existe"
    log_step "Criando backup em $BACKUP_DIR..."

    sudo mv "$BASE_DIR" "$BACKUP_DIR"
    log_info "Backup criado com sucesso"
fi

# 2. Criar diretório base
log_step "Criando diretório base..."
sudo mkdir -p "$(dirname "$BASE_DIR")"

# 3. Clonar repositório
log_step "Clonando repositório..."
log_info "Isso pode levar alguns minutos..."

if git clone -b "$GIT_BRANCH" "$GIT_REPO_URL" "$BASE_DIR"; then
    log_info "Repositório clonado com sucesso!"
else
    log_error "Falha ao clonar repositório"

    # Restaurar backup se existir
    if [ -d "$BACKUP_DIR" ]; then
        log_warn "Restaurando backup..."
        sudo mv "$BACKUP_DIR" "$BASE_DIR"
    fi

    exit 1
fi

# 4. Verificar estrutura
log_step "Verificando estrutura do repositório..."

if [ -d "$BASE_DIR/frontend" ] && [ -d "$BASE_DIR/backend" ]; then
    log_info "✓ Estrutura correta encontrada (frontend/ e backend/)"
else
    log_error "Estrutura do repositório incorreta!"
    log_error "Esperado: frontend/ e backend/ na raiz"
    exit 1
fi

# 5. Criar diretórios adicionais (não versionados)
log_step "Criando diretórios adicionais..."

sudo mkdir -p "$BASE_DIR/backend/uploads/documents"
sudo mkdir -p "$BASE_DIR/backend/uploads/contracts"
sudo mkdir -p "$BASE_DIR/backend/uploads/temp"
sudo mkdir -p "$BASE_DIR/backend/logs"
sudo mkdir -p "$BASE_DIR/backups/database"
sudo mkdir -p "$BASE_DIR/backups/uploads"

log_info "Diretórios criados"

# 6. Ajustar permissões
log_step "Ajustando permissões..."

# Verificar se usuário deploy existe
if id "deploy" &>/dev/null; then
    OWNER="deploy:deploy"
else
    OWNER="$USER:$USER"
    log_warn "Usuário 'deploy' não existe. Usando $USER"
fi

sudo chown -R $OWNER "$BASE_DIR"
sudo chmod -R 755 "$BASE_DIR"
sudo chmod -R 775 "$BASE_DIR/backend/uploads"
sudo chmod -R 775 "$BASE_DIR/backend/logs"

log_info "Permissões ajustadas"

# 7. Instalar dependências do backend
log_step "Instalando dependências do backend..."
cd "$BASE_DIR/backend"

if [ -f "package.json" ]; then
    npm ci --production
    log_info "Dependências do backend instaladas"
else
    log_error "package.json não encontrado em backend/"
fi

# 8. Verificar .env.example
log_step "Verificando arquivo .env..."

if [ -f ".env.example" ]; then
    if [ ! -f ".env" ]; then
        log_warn "Arquivo .env não existe"
        log_info "Criando .env a partir do .env.example..."
        cp .env.example .env

        echo ""
        log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_warn "  IMPORTANTE: Configure o arquivo .env"
        log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Execute:"
        echo "  cd $BASE_DIR/backend"
        echo "  nano .env"
        echo ""
        echo "Configure especialmente:"
        echo "  - NODE_ENV=production"
        echo "  - DB_HOST, DB_NAME, DB_USER, DB_PASS"
        echo "  - JWT_SECRET (gere com: openssl rand -base64 32)"
        echo "  - SMTP_* (configurações de email)"
        echo ""
    else
        log_info "Arquivo .env já existe"
    fi
else
    log_warn ".env.example não encontrado"
fi

# 9. Executar migrations
log_step "Verificando migrations..."

if [ -f ".env" ]; then
    # Verificar se credenciais do banco estão configuradas
    if grep -q "DB_PASS=" .env && ! grep -q "DB_PASS=$" .env; then
        log_info "Executando migrations..."
        npm run db:migrate || log_warn "Migrations falharam (configure .env primeiro)"
    else
        log_warn "Configure .env antes de executar migrations"
    fi
else
    log_warn "Configure .env antes de executar migrations"
fi

# 10. Frontend (não instalar dependências em produção, apenas verificar)
log_step "Verificando frontend..."
cd "$BASE_DIR/frontend"

if [ -f "package.json" ]; then
    log_info "✓ Frontend encontrado (package.json existe)"
    log_warn "Build do frontend deve ser feito localmente e enviado para produção"
else
    log_error "package.json não encontrado em frontend/"
fi

# 11. Remover backup antigo se tudo deu certo
if [ -d "$BACKUP_DIR" ]; then
    log_step "Removendo backup antigo..."
    read -p "Deseja remover o backup em $BACKUP_DIR? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sudo rm -rf "$BACKUP_DIR"
        log_info "Backup removido"
    else
        log_info "Backup mantido em $BACKUP_DIR"
    fi
fi

echo ""
log_info "=== Clonagem concluída com sucesso! ==="
echo ""

# Resumo
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  RESUMO${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✓ Repositório clonado: $BASE_DIR"
echo "✓ Branch: $GIT_BRANCH"
echo "✓ Dependências do backend instaladas"
echo "✓ Diretórios adicionais criados"
echo "✓ Permissões ajustadas"
echo ""
echo "PRÓXIMOS PASSOS:"
echo ""
echo "1. Configurar .env do backend:"
echo "   cd $BASE_DIR/backend"
echo "   nano .env"
echo ""
echo "2. Executar migrations:"
echo "   npm run db:migrate"
echo ""
echo "3. Build do frontend (no computador local):"
echo "   cd frontend"
echo "   npm run build"
echo "   # Enviar dist/ para servidor"
echo ""
echo "4. Configurar PM2:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "5. Configurar Nginx e SSL"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
