#!/bin/bash

################################################################################
# Script de Diagnóstico - GCP Setup
# Descrição: Verifica o que foi instalado e o que falta
################################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Diagnóstico do Setup ===${NC}\n"

# Função para verificar comando
check_command() {
    local cmd=$1
    local name=$2

    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name instalado: $(command -v $cmd)"
        if [ "$cmd" != "nginx" ] && [ "$cmd" != "mysql" ]; then
            $cmd --version 2>&1 | head -n 1
        else
            $cmd --version 2>&1 | head -n 1 || $cmd -v 2>&1 | head -n 1
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $name NÃO instalado"
        return 1
    fi
}

# Verificar cada componente
echo "1. Sistema:"
echo "   OS: $(lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo ""

echo "2. Ferramentas básicas:"
check_command "curl" "curl"
check_command "wget" "wget"
check_command "git" "git"
echo ""

echo "3. Node.js e npm:"
check_command "node" "Node.js"
check_command "npm" "npm"
echo ""

echo "4. PM2:"
check_command "pm2" "PM2"
echo ""

echo "5. MySQL:"
check_command "mysql" "MySQL Client"
check_command "mysqld" "MySQL Server"
if systemctl is-active --quiet mysql 2>/dev/null; then
    echo -e "   ${GREEN}✓${NC} MySQL service está RODANDO"
else
    echo -e "   ${RED}✗${NC} MySQL service NÃO está rodando"
fi
echo ""

echo "6. Nginx:"
check_command "nginx" "Nginx"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "   ${GREEN}✓${NC} Nginx service está RODANDO"
else
    echo -e "   ${RED}✗${NC} Nginx service NÃO está rodando"
fi
echo ""

echo "7. Certbot:"
check_command "certbot" "Certbot"
echo ""

echo "8. Firewall (UFW):"
check_command "ufw" "UFW"
if command -v ufw &> /dev/null; then
    sudo ufw status | head -n 1
fi
echo ""

echo "9. Estrutura de diretórios:"
if [ -d "/var/www/secretaria-online" ]; then
    echo -e "${GREEN}✓${NC} /var/www/secretaria-online existe"
    ls -la /var/www/secretaria-online 2>/dev/null
else
    echo -e "${RED}✗${NC} /var/www/secretaria-online NÃO existe"
fi
echo ""

echo "10. Usuário deploy:"
if id "deploy" &>/dev/null; then
    echo -e "${GREEN}✓${NC} Usuário 'deploy' existe"
else
    echo -e "${RED}✗${NC} Usuário 'deploy' NÃO existe"
fi
echo ""

echo -e "${BLUE}=== Fim do diagnóstico ===${NC}"
