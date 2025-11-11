#!/bin/bash

###############################################################################
# Arquivo: deploy.sh
# Descrição: Script de deploy automatizado para Secretaria Online
# Feature: feat-107 - Criar scripts de build e deploy
# Criado em: 2025-11-05
#
# Uso:
#   ./deploy.sh                    # Deploy completo (frontend + backend)
#   ./deploy.sh frontend           # Deploy apenas frontend
#   ./deploy.sh backend            # Deploy apenas backend
#
# Configuração:
#   Edite as variáveis abaixo conforme seu ambiente de produção
###############################################################################

# ==============================
# CONFIGURAÇÕES DO SERVIDOR
# ==============================

# Conexão SSH
SSH_USER="your_ssh_user"
SSH_HOST="your_server.com"
SSH_PORT="22"

# Caminhos no servidor
REMOTE_PUBLIC_HTML="/home/${SSH_USER}/public_html"
REMOTE_API_PATH="/home/${SSH_USER}/api"

# Nome da aplicação no PM2
PM2_APP_NAME="secretaria-api"

# ==============================
# CORES PARA OUTPUT
# ==============================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==============================
# FUNÇÕES AUXILIARES
# ==============================

print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar se comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# ==============================
# VALIDAÇÕES INICIAIS
# ==============================

validate_requirements() {
  print_header "Validando requisitos"

  # Verificar Node.js
  if ! command_exists node; then
    print_error "Node.js não está instalado"
    exit 1
  fi
  print_success "Node.js: $(node --version)"

  # Verificar npm
  if ! command_exists npm; then
    print_error "npm não está instalado"
    exit 1
  fi
  print_success "npm: $(npm --version)"

  # Verificar SSH
  if ! command_exists ssh; then
    print_error "SSH não está instalado"
    exit 1
  fi
  print_success "SSH disponível"

  # Verificar SCP
  if ! command_exists scp; then
    print_error "SCP não está instalado"
    exit 1
  fi
  print_success "SCP disponível"

  # Verificar configuração
  if [ "$SSH_USER" = "your_ssh_user" ] || [ "$SSH_HOST" = "your_server.com" ]; then
    print_error "Configure as variáveis SSH_USER e SSH_HOST no início do script"
    exit 1
  fi

  print_success "Todas as validações passaram!"
}

# ==============================
# DEPLOY DO FRONTEND
# ==============================

deploy_frontend() {
  print_header "DEPLOY DO FRONTEND"

  # Navegar para pasta do frontend
  cd frontend || exit 1
  print_info "Diretório: $(pwd)"

  # Instalar dependências
  print_info "Instalando dependências..."
  npm ci --production=false || {
    print_error "Falha ao instalar dependências do frontend"
    exit 1
  }
  print_success "Dependências instaladas"

  # Build do projeto
  print_info "Executando build do frontend..."
  npm run build || {
    print_error "Falha no build do frontend"
    exit 1
  }
  print_success "Build concluído"

  # Verificar se pasta dist existe
  if [ ! -d "dist" ]; then
    print_error "Pasta dist/ não foi gerada pelo build"
    exit 1
  fi

  # Upload via SCP
  print_info "Fazendo upload do frontend para ${SSH_HOST}..."
  scp -P "${SSH_PORT}" -r dist/* "${SSH_USER}@${SSH_HOST}:${REMOTE_PUBLIC_HTML}/" || {
    print_error "Falha no upload do frontend"
    exit 1
  }
  print_success "Frontend enviado com sucesso!"

  # Voltar para raiz do projeto
  cd ..
}

# ==============================
# DEPLOY DO BACKEND
# ==============================

deploy_backend() {
  print_header "DEPLOY DO BACKEND"

  # Navegar para pasta do backend
  cd backend || exit 1
  print_info "Diretório: $(pwd)"

  # Criar arquivo temporário de exclusões para rsync
  EXCLUDE_FILE=$(mktemp)
  cat >"$EXCLUDE_FILE" <<EOF
node_modules/
.env
logs/
uploads/temp/
.git/
*.log
.DS_Store
EOF

  # Upload via SCP/rsync (excluindo node_modules, logs, etc)
  print_info "Fazendo upload do backend para ${SSH_HOST}..."

  # Se rsync estiver disponível, usar ele (mais eficiente)
  if command_exists rsync; then
    rsync -avz --delete --progress \
      --exclude-from="$EXCLUDE_FILE" \
      -e "ssh -p ${SSH_PORT}" \
      ./ "${SSH_USER}@${SSH_HOST}:${REMOTE_API_PATH}/" || {
      print_error "Falha no upload do backend via rsync"
      rm "$EXCLUDE_FILE"
      exit 1
    }
  else
    # Fallback para SCP (menos eficiente, mas funcional)
    print_warning "rsync não disponível, usando scp (pode ser mais lento)"
    scp -P "${SSH_PORT}" -r \
      src/ package.json package-lock.json \
      "${SSH_USER}@${SSH_HOST}:${REMOTE_API_PATH}/" || {
      print_error "Falha no upload do backend via scp"
      rm "$EXCLUDE_FILE"
      exit 1
    }
  fi

  rm "$EXCLUDE_FILE"
  print_success "Backend enviado com sucesso!"

  # Instalar dependências no servidor e reiniciar PM2
  print_info "Instalando dependências no servidor e reiniciando aplicação..."
  ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" <<EOF
    cd ${REMOTE_API_PATH}

    # Instalar apenas dependências de produção
    npm ci --production

    # Executar migrations (se necessário)
    npm run db:migrate

    # Reiniciar aplicação com PM2
    if command -v pm2 >/dev/null 2>&1; then
      pm2 restart ${PM2_APP_NAME} || pm2 start src/server.js --name ${PM2_APP_NAME}
      pm2 save
    else
      echo "AVISO: PM2 não está instalado no servidor"
    fi
EOF

  if [ $? -eq 0 ]; then
    print_success "Backend instalado e reiniciado com sucesso!"
  else
    print_error "Falha ao reiniciar backend no servidor"
    exit 1
  fi

  # Voltar para raiz do projeto
  cd ..
}

# ==============================
# BACKUP ANTES DO DEPLOY
# ==============================

create_backup() {
  print_header "CRIANDO BACKUP"

  print_info "Criando backup dos arquivos atuais no servidor..."
  ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" <<EOF
    # Criar diretório de backups se não existir
    mkdir -p ~/backups

    # Backup do frontend
    if [ -d ${REMOTE_PUBLIC_HTML} ]; then
      tar -czf ~/backups/frontend_\$(date +%Y%m%d_%H%M%S).tar.gz -C ${REMOTE_PUBLIC_HTML} . 2>/dev/null
      echo "Backup do frontend criado"
    fi

    # Backup do backend
    if [ -d ${REMOTE_API_PATH} ]; then
      tar -czf ~/backups/backend_\$(date +%Y%m%d_%H%M%S).tar.gz -C ${REMOTE_API_PATH} . 2>/dev/null
      echo "Backup do backend criado"
    fi

    # Manter apenas os últimos 5 backups de cada tipo
    ls -t ~/backups/frontend_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
    ls -t ~/backups/backend_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
EOF

  print_success "Backup criado com sucesso!"
}

# ==============================
# FUNÇÃO PRINCIPAL
# ==============================

main() {
  print_header "SECRETARIA ONLINE - DEPLOY SCRIPT"
  print_info "Iniciado em: $(date '+%Y-%m-%d %H:%M:%S')"

  # Validar requisitos
  validate_requirements

  # Determinar o que deployar baseado no argumento
  DEPLOY_TARGET=${1:-all}

  case "$DEPLOY_TARGET" in
  frontend)
    print_info "Modo: Deploy apenas do FRONTEND"
    create_backup
    deploy_frontend
    ;;
  backend)
    print_info "Modo: Deploy apenas do BACKEND"
    create_backup
    deploy_backend
    ;;
  all)
    print_info "Modo: Deploy COMPLETO (frontend + backend)"
    create_backup
    deploy_frontend
    deploy_backend
    ;;
  *)
    print_error "Argumento inválido: $DEPLOY_TARGET"
    print_info "Uso: ./deploy.sh [frontend|backend|all]"
    exit 1
    ;;
  esac

  # Mensagem final
  print_header "DEPLOY CONCLUÍDO COM SUCESSO!"
  print_success "Aplicação deployada em: ${SSH_HOST}"
  print_info "Frontend: https://${SSH_HOST}"
  print_info "Backend: https://${SSH_HOST}/api"
  print_info ""
  print_warning "Lembre-se de:"
  print_warning "  1. Verificar logs no servidor: pm2 logs ${PM2_APP_NAME}"
  print_warning "  2. Testar as funcionalidades principais"
  print_warning "  3. Verificar variáveis de ambiente (.env) no servidor"
}

# ==============================
# EXECUÇÃO
# ==============================

# Executar função principal
main "$@"
