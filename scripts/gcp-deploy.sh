#!/bin/bash

################################################################################
# Script de Deploy - GCP Compute Engine (Debian)
# Secretaria Online
#
# Descrição: Deploy automatizado da aplicação no servidor GCP
# Uso: bash gcp-deploy.sh [frontend|backend|all]
################################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURAÇÕES - EDITE AQUI
# ============================================================================

# Conexão SSH
SSH_USER="deploy"
SSH_HOST="YOUR_GCP_EXTERNAL_IP"  # Ex: 34.123.45.67
SSH_PORT="22"

# Caminhos no servidor
REMOTE_BASE_DIR="/var/www/secretaria-online"
REMOTE_FRONTEND_DIR="$REMOTE_BASE_DIR/frontend"
REMOTE_BACKEND_DIR="$REMOTE_BASE_DIR/backend"

# Nome da aplicação no PM2
PM2_APP_NAME="secretaria-api"

# ============================================================================
# FUNÇÕES
# ============================================================================

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

# Verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar requisitos
check_requirements() {
    log_step "Verificando requisitos..."

    local missing_requirements=0

    if ! command_exists node; then
        log_error "Node.js não encontrado. Instale Node.js v20 LTS"
        missing_requirements=1
    fi

    if ! command_exists npm; then
        log_error "npm não encontrado. Instale npm"
        missing_requirements=1
    fi

    if ! command_exists ssh; then
        log_error "ssh não encontrado. Instale OpenSSH"
        missing_requirements=1
    fi

    if ! command_exists rsync; then
        log_warn "rsync não encontrado. Usando scp como alternativa (mais lento)"
    fi

    if [ $missing_requirements -eq 1 ]; then
        exit 1
    fi

    log_info "Todos os requisitos atendidos"
}

# Verificar conexão SSH
check_ssh_connection() {
    log_step "Verificando conexão SSH..."

    if ssh -p "$SSH_PORT" -o ConnectTimeout=5 "$SSH_USER@$SSH_HOST" "echo 'Conexão OK'" > /dev/null 2>&1; then
        log_info "Conexão SSH estabelecida com sucesso"
    else
        log_error "Falha ao conectar via SSH. Verifique as credenciais e configuração"
        log_error "Host: $SSH_USER@$SSH_HOST:$SSH_PORT"
        exit 1
    fi
}

# Criar backup remoto
create_remote_backup() {
    log_step "Criando backup no servidor..."

    local timestamp=$(date +%Y%m%d_%H%M%S)

    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" << EOF
        cd $REMOTE_BASE_DIR

        # Criar diretório de backups se não existir
        mkdir -p backups

        # Backup do frontend
        if [ -d "$REMOTE_FRONTEND_DIR" ] && [ "\$(ls -A $REMOTE_FRONTEND_DIR)" ]; then
            echo "Criando backup do frontend..."
            tar -czf backups/frontend_${timestamp}.tar.gz -C $REMOTE_FRONTEND_DIR . 2>/dev/null || true
        fi

        # Backup do backend
        if [ -d "$REMOTE_BACKEND_DIR" ] && [ "\$(ls -A $REMOTE_BACKEND_DIR)" ]; then
            echo "Criando backup do backend..."
            tar -czf backups/backend_${timestamp}.tar.gz -C $REMOTE_BACKEND_DIR . 2>/dev/null || true
        fi

        # Manter apenas os últimos 5 backups
        cd backups
        ls -t frontend_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
        ls -t backend_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm

        echo "Backup criado com sucesso"
EOF

    log_info "Backup criado: frontend_${timestamp}.tar.gz e backend_${timestamp}.tar.gz"
}

# Deploy do frontend
deploy_frontend() {
    log_step "=== Iniciando deploy do FRONTEND ==="

    # 1. Build local
    log_info "Building frontend..."
    cd frontend

    if [ ! -f "package.json" ]; then
        log_error "package.json não encontrado em frontend/"
        exit 1
    fi

    npm ci
    npm run build

    if [ ! -d "dist" ]; then
        log_error "Build falhou. Diretório dist/ não foi criado"
        exit 1
    fi

    log_info "Build concluído com sucesso"

    # 2. Upload para servidor
    log_info "Enviando arquivos para o servidor..."

    # Limpar diretório remoto
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "rm -rf $REMOTE_FRONTEND_DIR/*"

    # Upload usando rsync ou scp
    if command_exists rsync; then
        rsync -avz --progress -e "ssh -p $SSH_PORT" dist/ "$SSH_USER@$SSH_HOST:$REMOTE_FRONTEND_DIR/"
    else
        scp -P "$SSH_PORT" -r dist/* "$SSH_USER@$SSH_HOST:$REMOTE_FRONTEND_DIR/"
    fi

    log_info "Frontend enviado com sucesso"

    # 3. Ajustar permissões
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "chmod -R 755 $REMOTE_FRONTEND_DIR"

    cd ..

    log_info "=== Deploy do FRONTEND concluído ==="
}

# Deploy do backend (via Git pull)
deploy_backend() {
    log_step "=== Iniciando deploy do BACKEND ==="

    log_info "Atualizando código no servidor via Git..."

    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" << EOF
        cd $REMOTE_BACKEND_DIR

        # Git pull
        echo "Fazendo pull do repositório..."
        git pull origin main || git pull origin develop

        # Instalar dependências de produção
        echo "Instalando dependências..."
        npm ci --production

        # Executar migrations
        echo "Executando migrations..."
        npm run db:migrate || true

        # Ajustar permissões
        chmod -R 755 .

        # Criar estrutura de uploads se não existir
        mkdir -p uploads/documents uploads/contracts uploads/temp
        chmod -R 775 uploads/

        # Criar diretório de logs
        mkdir -p logs
        chmod -R 775 logs/

        echo "Configuração do backend concluída"
EOF

    log_info "Backend atualizado com sucesso"

    # Reiniciar aplicação com PM2
    log_info "Reiniciando aplicação com PM2..."

    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" << EOF
        cd $REMOTE_BACKEND_DIR

        # Verificar se app já existe no PM2
        if pm2 list | grep -q "$PM2_APP_NAME"; then
            echo "Reiniciando aplicação existente..."
            pm2 reload $PM2_APP_NAME
        else
            echo "Iniciando nova aplicação..."
            pm2 start src/server.js --name $PM2_APP_NAME
            pm2 save
        fi

        # Exibir status
        pm2 status
EOF

    log_info "Aplicação reiniciada com sucesso"

    log_info "=== Deploy do BACKEND concluído ==="
}

# Exibir logs
show_logs() {
    log_step "Exibindo últimos logs..."

    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "pm2 logs $PM2_APP_NAME --lines 30 --nostream"
}

# Verificar saúde da aplicação
health_check() {
    log_step "Verificando saúde da aplicação..."

    sleep 3  # Aguardar inicialização

    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" << EOF
        # Verificar status do PM2
        echo "=== Status do PM2 ==="
        pm2 status

        # Verificar se porta 3000 está escutando
        echo ""
        echo "=== Portas escutando ==="
        netstat -tuln | grep :3000 || echo "Porta 3000 não está escutando"

        # Testar endpoint de saúde (se existir)
        echo ""
        echo "=== Teste de API (health check) ==="
        curl -s http://localhost:3000/health || echo "Endpoint /health não respondeu"
EOF
}

# Menu de ajuda
show_help() {
    echo "Uso: bash gcp-deploy.sh [frontend|backend|all]"
    echo ""
    echo "Opções:"
    echo "  frontend    Deploy apenas do frontend"
    echo "  backend     Deploy apenas do backend"
    echo "  all         Deploy completo (frontend + backend)"
    echo ""
    echo "Exemplos:"
    echo "  bash gcp-deploy.sh all"
    echo "  bash gcp-deploy.sh frontend"
    echo "  bash gcp-deploy.sh backend"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    local deploy_target="${1:-all}"

    if [ "$deploy_target" == "help" ] || [ "$deploy_target" == "-h" ] || [ "$deploy_target" == "--help" ]; then
        show_help
        exit 0
    fi

    log_info "=== Deploy Secretaria Online - GCP Compute Engine ==="
    log_info "Target: $deploy_target"
    echo ""

    # Verificações iniciais
    check_requirements
    check_ssh_connection

    # Criar backup
    create_remote_backup

    # Deploy baseado no target
    case "$deploy_target" in
        frontend)
            deploy_frontend
            ;;
        backend)
            deploy_backend
            health_check
            ;;
        all)
            deploy_frontend
            deploy_backend
            health_check
            ;;
        *)
            log_error "Opção inválida: $deploy_target"
            show_help
            exit 1
            ;;
    esac

    # Mensagem final
    echo ""
    log_info "=== Deploy concluído com sucesso! ==="
    echo ""
    log_info "Próximos passos:"
    echo "  - Acesse o frontend: http://$SSH_HOST"
    echo "  - Teste a API: http://$SSH_HOST:3000/health"
    echo "  - Verifique logs: ssh $SSH_USER@$SSH_HOST 'pm2 logs $PM2_APP_NAME'"
    echo ""
    log_warn "IMPORTANTE: Configure o SSL com certbot para produção!"
}

# Executar main
main "$@"
