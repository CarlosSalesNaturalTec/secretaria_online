#!/bin/bash

##############################################
# Script: manage-app.sh
# Descrição: Gerenciamento da aplicação Secretaria Online
# Autor: Gerado via AI Workflow
# Data: 2025-11-12
##############################################

set -u  # Exit on undefined variable

# Cores para output
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m' # No Color

# Configurações
APP_NAME="secretaria-online-api"
APP_DIR="/opt/secretaria-online"

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

# Verificar se PM2 está instalado
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 não está instalado!"
        exit 1
    fi
}

# Start
start_app() {
    log_section "INICIANDO APLICAÇÃO"

    if pm2 list | grep -q "$APP_NAME.*online"; then
        log_warn "Aplicação já está rodando!"
        pm2 list
        return
    fi

    log_info "Iniciando aplicação..."
    cd $APP_DIR/backend
    pm2 start ecosystem.config.js --env production
    pm2 save

    log_info "Aplicação iniciada!"
    pm2 list
}

# Stop
stop_app() {
    log_section "PARANDO APLICAÇÃO"

    if ! pm2 list | grep -q "$APP_NAME"; then
        log_warn "Aplicação não está rodando!"
        return
    fi

    log_info "Parando aplicação..."
    pm2 stop $APP_NAME

    log_info "Aplicação parada!"
    pm2 list
}

# Restart
restart_app() {
    log_section "REINICIANDO APLICAÇÃO"

    if ! pm2 list | grep -q "$APP_NAME"; then
        log_warn "Aplicação não está rodando. Iniciando..."
        start_app
        return
    fi

    log_info "Reiniciando aplicação..."
    pm2 restart $APP_NAME

    log_info "Aplicação reiniciada!"
    pm2 list
}

# Reload (zero downtime)
reload_app() {
    log_section "RECARREGANDO APLICAÇÃO (ZERO DOWNTIME)"

    if ! pm2 list | grep -q "$APP_NAME"; then
        log_warn "Aplicação não está rodando. Iniciando..."
        start_app
        return
    fi

    log_info "Recarregando aplicação..."
    pm2 reload $APP_NAME

    log_info "Aplicação recarregada!"
    pm2 list
}

# Status
show_status() {
    log_section "STATUS DA APLICAÇÃO"

    check_pm2

    log_info "Status do PM2:"
    pm2 list

    echo ""
    log_info "Informações detalhadas:"
    pm2 show $APP_NAME 2>/dev/null || log_warn "Aplicação não encontrada no PM2"

    echo ""
    log_info "Uso de recursos:"
    pm2 monit --no-interaction &
    MONIT_PID=$!
    sleep 3
    kill $MONIT_PID 2>/dev/null
}

# Logs
show_logs() {
    log_section "LOGS DA APLICAÇÃO"

    # Verificar argumentos
    LINES=${1:-50}

    if [[ "$LINES" == "follow" ]] || [[ "$LINES" == "-f" ]]; then
        log_info "Exibindo logs em tempo real (Ctrl+C para sair)..."
        pm2 logs $APP_NAME
    else
        log_info "Exibindo últimas $LINES linhas de log..."
        pm2 logs $APP_NAME --lines $LINES --nostream
    fi
}

# Backup do banco de dados
backup_database() {
    log_section "BACKUP DO BANCO DE DADOS"

    # Ler configurações do .env
    if [ ! -f "$APP_DIR/backend/.env" ]; then
        log_error "Arquivo .env não encontrado!"
        exit 1
    fi

    # Carregar variáveis do .env
    source <(grep -v '^#' $APP_DIR/backend/.env | sed 's/\r$//' | sed 's/^/export /')

    # Verificar variáveis obrigatórias
    if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        log_error "Variáveis de banco de dados não configuradas no .env!"
        exit 1
    fi

    # Diretório de backup
    BACKUP_DIR="$APP_DIR/backups/database"
    mkdir -p $BACKUP_DIR

    # Nome do arquivo de backup
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

    log_info "Fazendo backup do banco de dados..."
    log_info "Banco: $DB_NAME"
    log_info "Arquivo: $BACKUP_FILE"

    # Executar backup
    mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

    if [ $? -eq 0 ]; then
        # Comprimir backup
        log_info "Comprimindo backup..."
        gzip $BACKUP_FILE

        BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        log_info "${GREEN}✓${NC} Backup criado com sucesso!"
        log_info "Arquivo: ${BACKUP_FILE}.gz"
        log_info "Tamanho: $BACKUP_SIZE"

        # Limpar backups antigos (manter últimos 7)
        log_info "Limpando backups antigos..."
        cd $BACKUP_DIR
        ls -t backup_*.sql.gz | tail -n +8 | xargs -r rm
        log_info "Backups mantidos: $(ls -1 backup_*.sql.gz | wc -l)"
    else
        log_error "Erro ao criar backup!"
        exit 1
    fi
}

# Restore do banco de dados
restore_database() {
    log_section "RESTORE DO BANCO DE DADOS"

    # Listar backups disponíveis
    BACKUP_DIR="$APP_DIR/backups/database"

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR)" ]; then
        log_error "Nenhum backup encontrado em $BACKUP_DIR"
        exit 1
    fi

    log_info "Backups disponíveis:"
    echo ""
    ls -lh $BACKUP_DIR/backup_*.sql.gz | awk '{print $9, "("$5")"}'
    echo ""

    read -p "Digite o nome do arquivo de backup para restaurar: " BACKUP_FILE

    if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log_error "Arquivo de backup não encontrado!"
        exit 1
    fi

    log_warn "ATENÇÃO: Esta operação irá substituir o banco de dados atual!"
    read -p "Tem certeza que deseja continuar? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        log_info "Restore cancelado."
        exit 0
    fi

    # Carregar variáveis do .env
    if [ ! -f "$APP_DIR/backend/.env" ]; then
        log_error "Arquivo .env não encontrado!"
        exit 1
    fi

    source <(grep -v '^#' $APP_DIR/backend/.env | sed 's/\r$//' | sed 's/^/export /')

    log_info "Descomprimindo backup..."
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > /tmp/restore_temp.sql

    log_info "Restaurando banco de dados..."
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < /tmp/restore_temp.sql

    if [ $? -eq 0 ]; then
        log_info "${GREEN}✓${NC} Restore concluído com sucesso!"
        rm /tmp/restore_temp.sql
    else
        log_error "Erro ao restaurar banco de dados!"
        rm /tmp/restore_temp.sql
        exit 1
    fi
}

# Health check
health_check() {
    log_section "HEALTH CHECK DA APLICAÇÃO"

    log_info "Verificando API..."

    # Verificar se está rodando no PM2
    if ! pm2 list | grep -q "$APP_NAME.*online"; then
        log_error "Aplicação não está rodando no PM2!"
        return
    fi

    # Verificar endpoint de health
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health)

    if [ "$HTTP_CODE" == "200" ]; then
        log_info "${GREEN}✓${NC} API está saudável (HTTP $HTTP_CODE)"
    else
        log_error "API não está respondendo corretamente (HTTP $HTTP_CODE)"
    fi

    # Verificar banco de dados
    log_info "Verificando conexão com banco de dados..."

    if [ -f "$APP_DIR/backend/.env" ]; then
        source <(grep -v '^#' $APP_DIR/backend/.env | sed 's/\r$//' | sed 's/^/export /')

        if mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME;" 2>/dev/null; then
            log_info "${GREEN}✓${NC} Conexão com banco de dados OK"
        else
            log_error "Erro ao conectar no banco de dados"
        fi
    fi

    # Verificar uso de disco
    log_info "Verificando uso de disco..."
    df -h $APP_DIR | tail -1

    # Verificar uso de memória
    log_info "Verificando uso de memória..."
    free -h | grep -E "Mem:|Swap:"
}

# Limpar uploads temporários
clean_temp_uploads() {
    log_section "LIMPANDO ARQUIVOS TEMPORÁRIOS"

    TEMP_DIR="$APP_DIR/backend/uploads/temp"

    if [ ! -d "$TEMP_DIR" ]; then
        log_warn "Diretório temporário não existe: $TEMP_DIR"
        return
    fi

    log_info "Buscando arquivos com mais de 7 dias..."

    FILES_COUNT=$(find $TEMP_DIR -type f -mtime +7 | wc -l)

    if [ $FILES_COUNT -eq 0 ]; then
        log_info "Nenhum arquivo temporário antigo encontrado"
        return
    fi

    log_info "Encontrados $FILES_COUNT arquivos para limpar"

    read -p "Deseja continuar? (y/N) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Limpeza cancelada"
        return
    fi

    find $TEMP_DIR -type f -mtime +7 -delete

    log_info "${GREEN}✓${NC} Arquivos temporários limpos!"
}

# Menu interativo
show_menu() {
    clear
    log_section "GERENCIAMENTO - SECRETARIA ONLINE"

    echo "Escolha uma opção:"
    echo ""
    echo "  ${GREEN}1)${NC} Iniciar aplicação"
    echo "  ${GREEN}2)${NC} Parar aplicação"
    echo "  ${GREEN}3)${NC} Reiniciar aplicação"
    echo "  ${GREEN}4)${NC} Recarregar aplicação (zero downtime)"
    echo "  ${GREEN}5)${NC} Status da aplicação"
    echo "  ${GREEN}6)${NC} Ver logs (últimas 50 linhas)"
    echo "  ${GREEN}7)${NC} Ver logs em tempo real"
    echo "  ${GREEN}8)${NC} Health check"
    echo "  ${GREEN}9)${NC} Backup do banco de dados"
    echo "  ${GREEN}10)${NC} Restore do banco de dados"
    echo "  ${GREEN}11)${NC} Limpar arquivos temporários"
    echo "  ${RED}0)${NC} Sair"
    echo ""
}

# Função principal
main() {
    check_pm2

    # Se recebeu argumento, executar diretamente
    if [ $# -gt 0 ]; then
        case "$1" in
            start)
                start_app
                ;;
            stop)
                stop_app
                ;;
            restart)
                restart_app
                ;;
            reload)
                reload_app
                ;;
            status)
                show_status
                ;;
            logs)
                show_logs "${2:-50}"
                ;;
            backup)
                backup_database
                ;;
            restore)
                restore_database
                ;;
            health)
                health_check
                ;;
            clean)
                clean_temp_uploads
                ;;
            *)
                echo "Uso: $0 {start|stop|restart|reload|status|logs [linhas|follow]|backup|restore|health|clean}"
                exit 1
                ;;
        esac
        exit 0
    fi

    # Menu interativo
    while true; do
        show_menu
        read -p "Opção: " choice

        case $choice in
            1)
                start_app
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            2)
                stop_app
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            3)
                restart_app
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            4)
                reload_app
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            5)
                show_status
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            6)
                show_logs 50
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            7)
                show_logs follow
                ;;
            8)
                health_check
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            9)
                backup_database
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            10)
                restore_database
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            11)
                clean_temp_uploads
                read -p "Pressione qualquer tecla para continuar..." -n 1 -s
                ;;
            0)
                log_info "Saindo..."
                exit 0
                ;;
            *)
                log_error "Opção inválida!"
                sleep 1
                ;;
        esac
    done
}

# Executar
main "$@"
