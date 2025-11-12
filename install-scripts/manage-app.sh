#!/bin/bash
# ==============================================================================
# SCRIPT DE GERENCIAMENTO DA APLICAÇÃO
# ==============================================================================
# Arquivo: manage-app.sh
# Descrição: Menu interativo para gerenciar a aplicação
# ==============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/home/naturalbahia/secretaria-online"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Functions
show_menu() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   GERENCIAMENTO - SECRETARIA ONLINE        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}APLICAÇÃO:${NC}"
    echo "  1) Ver status (PM2)"
    echo "  2) Ver logs em tempo real"
    echo "  3) Iniciar aplicação"
    echo "  4) Parar aplicação"
    echo "  5) Reiniciar aplicação"
    echo "  6) Reload (zero downtime)"
    echo ""
    echo -e "${YELLOW}BANCO DE DADOS:${NC}"
    echo "  7) Ver status MariaDB"
    echo "  8) Executar migrations"
    echo "  9) Desfazer última migration"
    echo "  10) Executar seeders"
    echo "  11) Resetar banco completamente"
    echo "  12) Acessar MySQL shell"
    echo ""
    echo -e "${YELLOW}ATUALIZAÇÃO:${NC}"
    echo "  13) Atualizar aplicação (git pull)"
    echo "  14) Rebuild frontend"
    echo ""
    echo -e "${YELLOW}VERIFICAÇÃO:${NC}"
    echo "  15) Health check completo"
    echo "  16) Ver disk space"
    echo "  17) Ver processo em detalhe"
    echo ""
    echo -e "${YELLOW}UTILITÁRIOS:${NC}"
    echo "  18) Visualizar .env do backend"
    echo "  19) Visualizar .env do frontend"
    echo "  20) Abrir editor .env backend"
    echo "  21) Abrir editor .env frontend"
    echo ""
    echo -e "${RED}  0) Sair${NC}"
    echo ""
    read -p "Escolha uma opção: " choice
}

# Application functions
status_app() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}STATUS DA APLICAÇÃO${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    pm2 status
    echo ""
    read -p "Pressione ENTER para continuar..."
}

logs_app() {
    echo -e "${YELLOW}Mostrando logs (Ctrl+C para sair)...${NC}"
    echo ""
    pm2 logs
}

start_app() {
    echo -e "${YELLOW}Iniciando aplicação...${NC}"
    pm2 delete all 2>/dev/null || true
    sleep 2
    cd "$BACKEND_DIR"
    pm2 start src/server.js --name "secretaria-api" --env production
    sleep 3
    pm2 start "serve -s dist -l 5173" --cwd "$FRONTEND_DIR" --name "secretaria-frontend" --env production
    pm2 save
    echo -e "${GREEN}✅ Aplicação iniciada${NC}"
    sleep 2
}

stop_app() {
    echo -e "${YELLOW}Parando aplicação...${NC}"
    pm2 stop all
    echo -e "${GREEN}✅ Aplicação parada${NC}"
    sleep 2
}

restart_app() {
    echo -e "${YELLOW}Reiniciando aplicação...${NC}"
    pm2 restart all
    echo -e "${GREEN}✅ Aplicação reiniciada${NC}"
    sleep 2
}

reload_app() {
    echo -e "${YELLOW}Fazendo reload (zero downtime)...${NC}"
    pm2 reload all
    echo -e "${GREEN}✅ Reload concluído${NC}"
    sleep 2
}

# Database functions
status_db() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}STATUS MARIADB${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    sudo systemctl status mariadb
    echo ""
}

migrate_db() {
    echo -e "${YELLOW}Executando migrations...${NC}"
    cd "$BACKEND_DIR"
    npm run db:migrate
    echo -e "${GREEN}✅ Migrations executadas${NC}"
    sleep 2
}

migrate_undo_db() {
    echo -e "${YELLOW}Desfazendo última migration...${NC}"
    cd "$BACKEND_DIR"
    npm run db:migrate:undo
    echo -e "${GREEN}✅ Migration desfeita${NC}"
    sleep 2
}

seed_db() {
    echo -e "${YELLOW}Executando seeders...${NC}"
    cd "$BACKEND_DIR"
    npm run db:seed
    echo -e "${GREEN}✅ Seeders executados${NC}"
    sleep 2
}

reset_db() {
    echo -e "${RED}AVISO: Esta ação vai RESETAR o banco de dados completamente!${NC}"
    read -p "Digite 'CONFIRMAR' para continuar: " confirm
    if [ "$confirm" = "CONFIRMAR" ]; then
        echo -e "${YELLOW}Resetando banco de dados...${NC}"
        cd "$BACKEND_DIR"
        npm run db:reset
        echo -e "${GREEN}✅ Banco de dados resetado${NC}"
    else
        echo "Operação cancelada"
    fi
    sleep 2
}

mysql_shell() {
    echo -e "${YELLOW}Abrindo MySQL shell...${NC}"
    source "$BACKEND_DIR/.env"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
}

# Update functions
update_app() {
    echo -e "${YELLOW}Atualizando aplicação...${NC}"
    cd "$APP_DIR"
    git pull origin main
    echo ""
    read -p "Instalar novas dependências? (s/n): " install_deps
    if [ "$install_deps" = "s" ] || [ "$install_deps" = "S" ]; then
        cd "$BACKEND_DIR"
        npm install --production
        cd "$FRONTEND_DIR"
        npm install --production
    fi
    pm2 restart all
    echo -e "${GREEN}✅ Aplicação atualizada${NC}"
    sleep 2
}

rebuild_frontend() {
    echo -e "${YELLOW}Rebuild do frontend...${NC}"
    cd "$FRONTEND_DIR"
    npm run build
    pm2 restart secretaria-frontend
    echo -e "${GREEN}✅ Frontend rebuild concluído${NC}"
    sleep 2
}

# Check functions
health_check() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}HEALTH CHECK${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    bash "$APP_DIR/install-scripts/06-health-check.sh"
    echo ""
    read -p "Pressione ENTER para continuar..."
}

disk_space() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}ESPAÇO EM DISCO${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    df -h
    echo ""
    echo "Diretório da aplicação:"
    du -sh "$APP_DIR"
    echo ""
    read -p "Pressione ENTER para continuar..."
}

detail_process() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}DETALHES DOS PROCESSOS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    pm2 show secretaria-api
    echo ""
    echo "─────────────────────────────────────────────"
    echo ""
    pm2 show secretaria-frontend
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Env functions
view_env_backend() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}.env BACKEND${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    cat "$BACKEND_DIR/.env"
    echo ""
    read -p "Pressione ENTER para continuar..."
}

view_env_frontend() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}.env FRONTEND${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    cat "$FRONTEND_DIR/.env"
    echo ""
    read -p "Pressione ENTER para continuar..."
}

edit_env_backend() {
    echo -e "${YELLOW}Abrindo editor para .env backend...${NC}"
    nano "$BACKEND_DIR/.env"
    read -p "Reiniciar backend para aplicar mudanças? (s/n): " restart
    if [ "$restart" = "s" ] || [ "$restart" = "S" ]; then
        pm2 restart secretaria-api
    fi
}

edit_env_frontend() {
    echo -e "${YELLOW}Abrindo editor para .env frontend...${NC}"
    nano "$FRONTEND_DIR/.env"
    read -p "Rebuild frontend para aplicar mudanças? (s/n): " rebuild
    if [ "$rebuild" = "s" ] || [ "$rebuild" = "S" ]; then
        cd "$FRONTEND_DIR"
        npm run build
        pm2 restart secretaria-frontend
    fi
}

# Main loop
while true; do
    show_menu

    case $choice in
        # Application
        1) status_app ;;
        2) logs_app ;;
        3) start_app ;;
        4) stop_app ;;
        5) restart_app ;;
        6) reload_app ;;

        # Database
        7) status_db ;;
        8) migrate_db ;;
        9) migrate_undo_db ;;
        10) seed_db ;;
        11) reset_db ;;
        12) mysql_shell ;;

        # Update
        13) update_app ;;
        14) rebuild_frontend ;;

        # Check
        15) health_check ;;
        16) disk_space ;;
        17) detail_process ;;

        # Env
        18) view_env_backend ;;
        19) view_env_frontend ;;
        20) edit_env_backend ;;
        21) edit_env_frontend ;;

        # Exit
        0)
            echo "Saindo..."
            exit 0
            ;;

        *)
            echo -e "${RED}Opção inválida${NC}"
            sleep 2
            ;;
    esac
done
