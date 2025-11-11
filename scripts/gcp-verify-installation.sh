#!/bin/bash

################################################################################
# Script de Verificação Final - GCP Setup
# Descrição: Verifica todas as instalações e configurações
################################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  VERIFICAÇÃO COMPLETA DO AMBIENTE - SECRETARIA ONLINE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_ok=0
check_fail=0
check_warn=0

# Função para verificar comando
check_cmd() {
    local cmd=$1
    local name=$2
    local required=$3  # "required" ou "optional"

    echo -n "  Verificando $name... "

    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"

        # Exibir versão
        case "$cmd" in
            node)
                echo "    Versão: $(node --version)"
                ;;
            npm)
                echo "    Versão: $(npm --version)"
                ;;
            pm2)
                echo "    Versão: $(pm2 --version)"
                ;;
            nginx)
                echo "    Versão: $(sudo nginx -v 2>&1)"
                ;;
            mysql|mariadb)
                echo "    Versão: $(mysql --version 2>&1 | head -n1)"
                ;;
            certbot)
                echo "    Versão: $(certbot --version 2>&1 | head -n1)"
                ;;
        esac

        ((check_ok++))
        return 0
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗ FALTANDO${NC}"
            ((check_fail++))
        else
            echo -e "${YELLOW}⚠ OPCIONAL${NC}"
            ((check_warn++))
        fi
        return 1
    fi
}

# Função para verificar serviço
check_service() {
    local service=$1
    local name=$2

    echo -n "  Verificando serviço $name... "

    if sudo systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✓ RODANDO${NC}"
        ((check_ok++))
        return 0
    else
        echo -e "${RED}✗ PARADO${NC}"
        ((check_fail++))
        return 1
    fi
}

# Função para verificar diretório
check_dir() {
    local dir=$1
    local name=$2

    echo -n "  Verificando $name... "

    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ EXISTE${NC}"
        echo "    Caminho: $dir"
        echo "    Permissões: $(ls -ld "$dir" | awk '{print $1, $3, $4}')"
        ((check_ok++))
        return 0
    else
        echo -e "${RED}✗ NÃO EXISTE${NC}"
        ((check_fail++))
        return 1
    fi
}

# Função para verificar usuário
check_user() {
    local user=$1

    echo -n "  Verificando usuário $user... "

    if id "$user" &>/dev/null; then
        echo -e "${GREEN}✓ EXISTE${NC}"
        echo "    Home: $(eval echo ~$user)"
        echo "    Grupos: $(groups $user)"
        ((check_ok++))
        return 0
    else
        echo -e "${RED}✗ NÃO EXISTE${NC}"
        ((check_fail++))
        return 1
    fi
}

# 1. Sistema
echo -e "${BLUE}1. INFORMAÇÕES DO SISTEMA${NC}"
echo "  OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "  Kernel: $(uname -r)"
echo "  Hostname: $(hostname)"
echo "  IP Interno: $(hostname -I | awk '{print $1}')"
echo "  IP Externo: $(curl -s ifconfig.me || echo "N/A")"
echo ""

# 2. Runtime e ferramentas
echo -e "${BLUE}2. RUNTIME E FERRAMENTAS${NC}"
check_cmd "node" "Node.js" "required"
check_cmd "npm" "npm" "required"
check_cmd "pm2" "PM2" "required"
check_cmd "git" "Git" "required"
check_cmd "curl" "curl" "required"
check_cmd "wget" "wget" "optional"
echo ""

# 3. Banco de dados
echo -e "${BLUE}3. BANCO DE DADOS${NC}"
if check_cmd "mysql" "MySQL/MariaDB Client" "required"; then
    check_service "mariadb" "MariaDB Server" || check_service "mysql" "MySQL Server"

    # Verificar se consegue conectar
    echo -n "  Testando conexão root... "
    if sudo mysql -e "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"

        # Verificar se banco existe
        echo -n "  Verificando banco secretaria_online... "
        if sudo mysql -e "USE secretaria_online;" &> /dev/null; then
            echo -e "${GREEN}✓ EXISTE${NC}"
        else
            echo -e "${YELLOW}⚠ NÃO CRIADO${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ SEM SENHA ROOT${NC}"
    fi
fi
echo ""

# 4. Web Server
echo -e "${BLUE}4. WEB SERVER${NC}"
check_cmd "nginx" "Nginx" "required"
check_service "nginx" "Nginx Service"

# Verificar portas
echo "  Portas escutando:"
sudo netstat -tuln 2>/dev/null | grep -E ':(80|443|3000) ' | while read line; do
    echo "    $line"
done || echo "    (netstat não disponível)"
echo ""

# 5. SSL/TLS
echo -e "${BLUE}5. SSL/TLS${NC}"
check_cmd "certbot" "Certbot" "required"

# Verificar certificados instalados
echo -n "  Certificados SSL... "
if [ -d "/etc/letsencrypt/live" ] && [ "$(ls -A /etc/letsencrypt/live 2>/dev/null)" ]; then
    echo -e "${GREEN}✓ ENCONTRADOS${NC}"
    ls -1 /etc/letsencrypt/live/ 2>/dev/null | while read domain; do
        if [ "$domain" != "README" ]; then
            echo "    - $domain"
        fi
    done
else
    echo -e "${YELLOW}⚠ NÃO CONFIGURADO${NC}"
fi
echo ""

# 6. Firewall
echo -e "${BLUE}6. FIREWALL${NC}"
check_cmd "ufw" "UFW" "required"

echo "  Status do UFW:"
sudo ufw status | head -n 15 | sed 's/^/    /'
echo ""

# 7. Estrutura de diretórios
echo -e "${BLUE}7. ESTRUTURA DE DIRETÓRIOS${NC}"
check_dir "/var/www/secretaria-online" "Diretório base"
check_dir "/var/www/secretaria-online/frontend" "Frontend"
check_dir "/var/www/secretaria-online/backend" "Backend"
check_dir "/var/www/secretaria-online/uploads" "Uploads"
check_dir "/var/www/secretaria-online/logs" "Logs"
check_dir "/var/www/secretaria-online/backups" "Backups"
echo ""

# 8. Usuários
echo -e "${BLUE}8. USUÁRIOS${NC}"
check_user "deploy"
echo ""

# 9. PM2
echo -e "${BLUE}9. PM2 PROCESSOS${NC}"
echo "  Processos PM2 (usuário deploy):"
sudo -u deploy pm2 list 2>/dev/null | tail -n +4 | sed 's/^/    /' || echo "    Nenhum processo configurado ainda"
echo ""

# 10. Resumo final
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  RESUMO DA VERIFICAÇÃO${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}✓ OK:${NC} $check_ok"
echo -e "  ${YELLOW}⚠ Avisos:${NC} $check_warn"
echo -e "  ${RED}✗ Falhas:${NC} $check_fail"
echo ""

if [ $check_fail -eq 0 ]; then
    echo -e "${GREEN}✓ AMBIENTE PRONTO PARA DEPLOY!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Configure o banco de dados (se ainda não fez)"
    echo "  2. Configure o Nginx com seu domínio"
    echo "  3. Configure o SSL com certbot"
    echo "  4. Execute o deploy da aplicação"
else
    echo -e "${RED}✗ AMBIENTE INCOMPLETO${NC}"
    echo ""
    echo "Corrija as falhas acima antes de fazer o deploy."
    echo "Execute: sudo bash gcp-install-mariadb.sh (se MariaDB não estiver instalado)"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
