#!/bin/bash
# ==============================================================================
# SCRIPT DE VERIFICAÇÃO DE SAÚDE DA APLICAÇÃO
# ==============================================================================
# Arquivo: 06-health-check.sh
# Descrição: Verifica se a aplicação está funcionando corretamente
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e

echo "=========================================="
echo "VERIFICAÇÃO DE SAÚDE DA APLICAÇÃO"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get VM IP
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || echo "localhost")

# Check functions
check_pm2() {
    echo "[1/6] Verificando PM2..."
    if pm2 list | grep -q "secretaria-api"; then
        echo -e "${GREEN}✅ Backend (PM2) está rodando${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend (PM2) NÃO está rodando${NC}"
        return 1
    fi
}

check_backend_api() {
    echo "[2/6] Verificando API Backend..."
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health" | grep -q "200"; then
        echo -e "${GREEN}✅ API Backend (3000) está respondendo${NC}"
        return 0
    else
        echo -e "${RED}❌ API Backend (3000) NÃO está respondendo${NC}"
        return 1
    fi
}

check_frontend() {
    echo "[3/6] Verificando Frontend..."
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173" | grep -q "200"; then
        echo -e "${GREEN}✅ Frontend (5173) está respondendo${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend (5173) NÃO está respondendo${NC}"
        return 1
    fi
}

check_mariadb() {
    echo "[4/6] Verificando MariaDB..."
    if sudo systemctl is-active --quiet mariadb; then
        echo -e "${GREEN}✅ MariaDB está rodando${NC}"
        return 0
    else
        echo -e "${RED}❌ MariaDB NÃO está rodando${NC}"
        return 1
    fi
}

check_database_connection() {
    echo "[5/6] Verificando conexão com banco de dados..."

    # Read DB credentials from .env
    BACKEND_DIR="/home/naturalbahia/secretaria-online/backend"
    if [ -f "$BACKEND_DIR/.env" ]; then
        source "$BACKEND_DIR/.env"

        if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Conexão com banco de dados está funcionando${NC}"
            return 0
        else
            echo -e "${RED}❌ Falha ao conectar no banco de dados${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Arquivo .env não encontrado, ignorando verificação${NC}"
        return 0
    fi
}

check_disk_space() {
    echo "[6/6] Verificando espaço em disco..."
    available=$(df / | awk 'NR==2 {print $4}')
    if [ "$available" -gt 1048576 ]; then  # > 1GB
        echo -e "${GREEN}✅ Espaço em disco suficiente ($(numfmt --to=iec $((available * 1024))) disponível)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Espaço em disco baixo ($(numfmt --to=iec $((available * 1024))) disponível)${NC}"
        return 1
    fi
}

# Run all checks
echo ""
check_pm2 && backend_ok=1 || backend_ok=0
echo ""
check_backend_api && api_ok=1 || api_ok=0
echo ""
check_frontend && frontend_ok=1 || frontend_ok=0
echo ""
check_mariadb && db_ok=1 || db_ok=0
echo ""
check_database_connection && db_conn_ok=1 || db_conn_ok=0
echo ""
check_disk_space && disk_ok=1 || disk_ok=0

# Summary
echo ""
echo "=========================================="
echo "RESUMO DA VERIFICAÇÃO"
echo "=========================================="
echo ""

total_checks=$((backend_ok + api_ok + frontend_ok + db_ok + db_conn_ok + disk_ok))

if [ $total_checks -eq 6 ]; then
    echo -e "${GREEN}✅ TODAS AS VERIFICAÇÕES PASSARAM!${NC}"
    echo ""
    echo "Aplicação está pronta para uso:"
    echo "================================"
    echo "Frontend: http://$VM_IP:5173"
    echo "Backend API: http://$VM_IP:3000"
    echo "API Health: http://$VM_IP:3000/health"
    exit 0
else
    echo -e "${YELLOW}⚠️  ALGUMAS VERIFICAÇÕES FALHARAM ($total_checks/6)${NC}"
    echo ""
    echo "Verifique os logs:"
    echo "=================="
    echo "Backend logs: pm2 logs secretaria-api"
    echo "Frontend logs: pm2 logs secretaria-frontend"
    echo "MariaDB logs: sudo journalctl -u mariadb -n 50"
    exit 1
fi
