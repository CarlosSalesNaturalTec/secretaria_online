#!/bin/bash
# ==============================================================================
# SCRIPT DE INSTALAÇÃO E CONFIGURAÇÃO DO MARIADB
# ==============================================================================
# Arquivo: 02-mariadb-setup.sh
# Descrição: Instala e configura MariaDB para a aplicação
# VM: GCP Compute Engine e2-medium, Debian 11 Bullseye
# ==============================================================================

set -e

echo "=========================================="
echo "INSTALANDO E CONFIGURANDO MARIADB"
echo "=========================================="
echo ""

# Install MariaDB Server
echo "[1/4] Instalando MariaDB Server..."
sudo apt-get install -y mariadb-server mariadb-client

# Start MariaDB service
echo "[2/4] Iniciando serviço MariaDB..."
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure MariaDB installation
echo "[3/4] Executando mysql_secure_installation (automático)..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root_password_change_me';"
sudo mysql -e "DELETE FROM mysql.user WHERE User='';"
sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
sudo mysql -e "DROP DATABASE IF EXISTS test;"
sudo mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Verify MariaDB installation
echo "[4/4] Verificando instalação do MariaDB..."
mysql --version

echo ""
echo "=========================================="
echo "✅ MARIADB INSTALADO COM SUCESSO!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANTE:"
echo "A senha root foi definida como: 'root_password_change_me'"
echo "ALTERE A SENHA IMEDIATAMENTE após a primeira conexão:"
echo ""
echo "  sudo mysql -u root -p"
echo "  ALTER USER 'root'@'localhost' IDENTIFIED BY 'NOVA_SENHA_FORTE';"
echo "  FLUSH PRIVILEGES;"
echo "  EXIT;"
echo ""
echo "Próximos passos:"
echo "1. Altere a senha root"
echo "2. Execute o script 03-app-setup.sh"
echo "3. Forneça as credenciais do banco de dados quando solicitado"
echo ""
