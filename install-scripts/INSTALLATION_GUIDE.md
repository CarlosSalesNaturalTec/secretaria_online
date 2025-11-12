# GUIA COMPLETO DE INSTALAÇÃO - SECRETARIA ONLINE

## 📋 Visão Geral

Este guia fornece instruções passo a passo para instalar a aplicação **Secretaria Online** em uma VM do Google Cloud Platform (GCP) com as seguintes especificações:

- **VM**: Compute Engine e2-medium
- **SO**: Debian 11 Bullseye
- **Banco de Dados**: MariaDB
- **Node.js**: v20 LTS
- **Repositório**: https://github.com/CarlosSalesNaturalTec/secretaria_online.git

## ⚙️ Pré-requisitos

### 1. Criar VM no GCP

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Navegue até **Compute Engine** → **Instâncias de VM**
3. Clique em **CRIAR INSTÂNCIA**
4. Configure:
   - **Nome**: `secretaria-online-prod`
   - **Região**: `us-central1` (ou sua região preferida)
   - **Série de máquinas**: `General purpose (E2)`
   - **Tipo de máquina**: `e2-medium` (2 vCPU, 4 GB de memória)
   - **Imagem do SO**: `Debian 11 Bullseye` (versão mais recente)
   - **Disco de inicialização**: 20 GB (SSD) - recomendado
   - **Firewall**: Marque ambas as opções (HTTP e HTTPS)

5. Clique em **CRIAR**

### 2. Conectar à VM via SSH

Você pode usar:
- **Google Cloud Console** (botão SSH no painel)
- **Cloud Shell** (terminal integrado)
- **SSH local** (com chaves configuradas)

```bash
# Via gcloud CLI
gcloud compute ssh secretaria-online-prod --zone=us-central1-a
```

### 3. Configurar Firewall (GCP)

No Console do GCP, configure regras de firewall para permitir:
- HTTP (porta 80)
- HTTPS (porta 443)
- Portas customizadas (3000 para API, 5173 para frontend)

## 🚀 Processo de Instalação

### **PASSO 1: Preparar Scripts de Instalação**

1. Na sua máquina local (Windows), copie a pasta `install-scripts` para a VM:

```bash
# Via SCP/SFTP ou manualmente via Cloud Shell
gcloud compute scp install-scripts/* secretaria-online-vm:~/ --zone=us-central1-a --recurse
```

Ou clone o repositório inteiro na VM:

```bash
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria_online
```

### **PASSO 2: Instalar Dependências do Sistema**

Execute o primeiro script para instalar todas as dependências:

```bash
# Conectar à VM
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Tornar script executável
chmod +x ~/secretaria_online/install-scripts/01-system-dependencies.sh

# Executar script
bash ~/secretaria_online/install-scripts/01-system-dependencies.sh
```

**Tempo estimado**: 5-10 minutos

**O que será instalado**:
- Node.js 20 LTS
- npm (package manager)
- Git
- Build tools
- PM2 (process manager)

### **PASSO 3: Instalar e Configurar MariaDB**

```bash
# Tornar script executável
chmod +x ~/secretaria_online/install-scripts/02-mariadb-setup.sh

# Executar script
bash ~/secretaria_online/install-scripts/02-mariadb-setup.sh
```

**Tempo estimado**: 3-5 minutos

**⚠️ IMPORTANTE**: Após a execução, altere a senha root do MariaDB:

```bash
sudo mysql -u root -p
# Digite a senha padrão: root_password_change_me

# No prompt MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'SENHA_NOVA_FORTE';
FLUSH PRIVILEGES;
EXIT;
```

### **PASSO 4: Clonar e Setup da Aplicação**

```bash
# Tornar script executável
chmod +x ~/secretaria_online/install-scripts/03-app-setup.sh

# Executar script
bash ~/secretaria_online/install-scripts/03-app-setup.sh
```

**Tempo estimado**: 5-10 minutos (depende de conexão de internet)

**O que será feito**:
- Clone do repositório Git
- Instalação de dependências npm (backend e frontend)
- Criação de diretórios de upload
- Build do frontend

### **PASSO 5: Configurar Variáveis de Ambiente**

```bash
# Tornar script executável
chmod +x ~/secretaria_online/install-scripts/04-configure-env.sh

# Executar script interativo
bash ~/secretaria_online/install-scripts/04-configure-env.sh
```

**Tempo estimado**: 5 minutos

**O script solicitará**:

#### Backend Configuration:
- **Database Host**: `localhost` (padrão)
- **Database Port**: `3306` (padrão)
- **Database Name**: `secretaria_online` (padrão)
- **Database User**: `secretaria_user` (recomendado)
- **Database Password**: Escolha uma senha forte
- **JWT Secret**: Será gerado automaticamente
- **SMTP Host**: `smtp.seuservidor.com` ou `smtp.gmail.com`
- **SMTP Port**: `587` (para TLS)
- **SMTP User**: Seu email
- **SMTP Password**: Senha de app
- **SMTP From**: Email de origem
- **Node Environment**: `production`
- **Backend Port**: `3000`

#### Frontend Configuration:
- **API URL**: Será preenchida automaticamente com o IP da VM

**O que será criado**:
- Arquivo `.env` do backend
- Arquivo `.env` do frontend
- Banco de dados no MariaDB
- Usuário de banco de dados
- Tabelas (via migrations)
- Dados iniciais (via seeders)

### **PASSO 6: Iniciar Aplicação com PM2**

```bash
# Tornar script executável
chmod +x ~/secretaria_online/install-scripts/05-start-app.sh

# Executar script
bash ~/secretaria_online/install-scripts/05-start-app.sh
```

**Tempo estimado**: 2-3 minutos

**O que será feito**:
- Parar processos anteriores
- Instalar `serve` para servir frontend estático
- Iniciar backend em modo production (PM2)
- Iniciar frontend em modo production (PM2)
- Configurar auto-start no reboot

### **PASSO 7: Verificar Saúde da Aplicação**

```bash
# Tornar script executável
chmod +x ~/secretaria_online/install-scripts/06-health-check.sh

# Executar script de verificação
bash ~/secretaria_online/install-scripts/06-health-check.sh
```

**O que será verificado**:
- ✅ PM2 (backend/frontend rodando)
- ✅ API Backend (porta 3000)
- ✅ Frontend (porta 5173)
- ✅ MariaDB (banco de dados)
- ✅ Conexão com banco de dados
- ✅ Espaço em disco

Se tudo passar, a aplicação está pronta para uso!

## 📱 Acessar a Aplicação

Após a instalação bem-sucedida, acesse:

```
Frontend: http://<IP_DA_VM>:5173
Backend API: http://<IP_DA_VM>:3000
API Health: http://<IP_DA_VM>:3000/health
```

### Obter IP Externo da VM

No Google Cloud Console:
1. Acesse **Compute Engine** → **Instâncias de VM**
2. Procure por `secretaria-online-prod`
3. Copie o IP externo

Ou via CLI:
```bash
gcloud compute instances describe secretaria-online-prod --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

## 🔑 Credenciais de Acesso Iniciais

Após a instalação, o seeder cria um usuário admin padrão:

```
Login: admin
Senha: admin123
```

⚠️ **ALTERE A SENHA IMEDIATAMENTE após o primeiro acesso!**

## 📊 Gerenciar Aplicação com PM2

### Ver Status dos Processos

```bash
pm2 status
pm2 list
```

### Ver Logs em Tempo Real

```bash
# Todos os logs
pm2 logs

# Apenas backend
pm2 logs secretaria-api

# Apenas frontend
pm2 logs secretaria-frontend
```

### Monitorar Recursos

```bash
pm2 monit
```

### Parar Aplicação

```bash
pm2 stop all
```

### Reiniciar Aplicação

```bash
pm2 restart all
```

### Reload com Zero Downtime

```bash
pm2 reload all
```

## 🗄️ Gerenciar Banco de Dados

### Executar Migrations

```bash
cd ~/secretaria_online/backend
npm run db:migrate
```

### Desfazer Última Migration

```bash
cd ~/secretaria_online/backend
npm run db:migrate:undo
```

### Executar Seeders

```bash
cd ~/secretaria_online/backend
npm run db:seed
```

### Resetar Banco de Dados Completamente

```bash
cd ~/secretaria_online/backend
npm run db:reset
```

### Acessar MariaDB Diretamente

```bash
mysql -u secretaria_user -p secretaria_online
# Digite a senha configurada

# Comandos úteis:
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
```

## 🔧 Troubleshooting

### Problema: Backend não está respondendo

1. Verificar status PM2:
```bash
pm2 status
pm2 logs secretaria-api
```

2. Verificar porta 3000:
```bash
netstat -tlnp | grep 3000
```

3. Reiniciar:
```bash
pm2 restart secretaria-api
```

### Problema: Conexão com banco de dados recusada

1. Verificar se MariaDB está rodando:
```bash
sudo systemctl status mariadb
sudo systemctl start mariadb
```

2. Testar conexão:
```bash
mysql -h localhost -u secretaria_user -p secretaria_online
```

3. Verificar credenciais no `.env`:
```bash
cat ~/secretaria_online/backend/.env | grep DB_
```

### Problema: Frontend não carrega

1. Verificar se PM2 está servindo:
```bash
pm2 status
pm2 logs secretaria-frontend
```

2. Testar acesso direto:
```bash
curl http://localhost:5173
```

3. Verificar arquivo .env:
```bash
cat ~/secretaria_online/frontend/.env
```

### Problema: Porta já em uso

1. Encontrar processo usando a porta:
```bash
sudo lsof -i :3000
sudo lsof -i :5173
```

2. Parar o processo:
```bash
sudo kill -9 <PID>
```

Ou alterar porta no `.env` e reiniciar.

## 📈 Monitoramento em Produção

### Configurar Logs Persistentes

Os logs PM2 são salvos em:
```bash
~/.pm2/logs/
```

### Visualizar Logs Históricos

```bash
pm2 logs secretaria-api --lines 100
pm2 logs secretaria-frontend --lines 100
```

### Configurar Rotação de Logs

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 save
```

## 🔒 Segurança

### 1. Alterar Senhas Padrão

- Root do MariaDB
- Admin da aplicação

### 2. Configurar SSL/TLS

Para usar HTTPS, instale um certificado (Let's Encrypt recomendado):

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d seu.dominio.com
```

Depois configure um reverse proxy (nginx) para HTTPS.

### 3. Firewall do SO

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. SSH sem Senha (chaves)

Configure autenticação por chave SSH no GCP para segurança aprimorada.

## 🔄 Atualizar Aplicação

Para atualizar para a versão mais recente:

```bash
cd ~/secretaria_online
git pull origin main

# Backend
cd backend
npm install
npm run db:migrate
pm2 restart secretaria-api

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart secretaria-frontend
```

## 💾 Backup

### Backup do Banco de Dados

```bash
# Manual
mysqldump -u secretaria_user -p secretaria_online > ~/backup_$(date +%Y%m%d_%H%M%S).sql

# Com cron (automático diariamente às 2h)
0 2 * * * mysqldump -u secretaria_user -p'senha' secretaria_online > ~/backups/db_$(date +\%Y\%m\%d).sql
```

### Backup de Uploads

```bash
# Manual
tar -czf ~/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz ~/secretaria_online/backend/uploads/

# Com cron (semanal)
0 3 * * 0 tar -czf ~/backups/uploads_$(date +\%Y\%m\%d).tar.gz ~/secretaria_online/backend/uploads/
```

## 📚 Documentação Adicional

- [Context Documentation](../docs/contextDoc.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [Requirements](../docs/requirements.md)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs`
2. Verifique o status: `pm2 status`
3. Execute health check: `bash ~/secretaria_online/install-scripts/06-health-check.sh`
4. Consulte o GitHub: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

---

**Instalação criada em**: 2025-11-11
**Versão**: 1.0.0
**Última atualização**: 2025-11-11
