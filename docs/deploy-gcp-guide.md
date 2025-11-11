# Guia de Deploy - GCP Compute Engine (Debian)

**Arquivo:** docs/deploy-gcp-guide.md
**Descrição:** Guia completo de deploy da aplicação Secretaria Online no Google Cloud Platform
**Sistema Operacional:** Debian 6.1.153-1 (2025-09-20) x86_64
**Criado em:** 2025-11-11

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Criação da VM no GCP](#criação-da-vm-no-gcp)
4. [Provisionamento do Servidor](#provisionamento-do-servidor)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Configuração do Nginx](#configuração-do-nginx)
7. [Configuração do SSL/TLS](#configuração-do-ssltls)
8. [Deploy da Aplicação](#deploy-da-aplicação)
9. [Configuração de Backups Automáticos](#configuração-de-backups-automáticos)
10. [Monitoramento e Logs](#monitoramento-e-logs)
11. [Troubleshooting](#troubleshooting)
12. [Manutenção e Atualizações](#manutenção-e-atualizações)

---

## 🌐 Visão Geral

Este guia detalha o processo completo de deploy da aplicação **Secretaria Online** em uma instância Compute Engine do Google Cloud Platform, utilizando:

- **SO:** Debian 11 (Bullseye) x86_64
- **Web Server:** Nginx (reverse proxy)
- **Runtime:** Node.js v20 LTS
- **Process Manager:** PM2
- **Database:** MySQL 8.0
- **SSL:** Let's Encrypt (Certbot)

### Arquitetura do Deploy

```
                    Internet
                       │
                       ▼
               [Load Balancer] (opcional)
                       │
                       ▼
                  [Firewall]
                       │
                       ▼
                 ┌────────────┐
                 │   Nginx    │ :80, :443
                 │ (Reverse   │
                 │  Proxy)    │
                 └────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    [Frontend]               [Backend API]
    /var/www/.../frontend    Node.js + PM2
    (Arquivos estáticos)     :3000
                                   │
                                   ▼
                             [MySQL 8.0]
                             :3306
```

---

## 🔧 Pré-requisitos

### No seu computador local:

- **Conta GCP** com projeto ativo
- **gcloud CLI** instalado ([Instruções](https://cloud.google.com/sdk/docs/install))
- **Git** instalado
- **Node.js** v20 LTS
- **SSH Key** gerada (para acesso à VM)

### Custos estimados (GCP):

- **VM e2-medium** (2 vCPUs, 4 GB RAM): ~$24/mês
- **Disco SSD de 20GB**: ~$3/mês
- **IP externo estático**: ~$3/mês
- **Total estimado**: ~$30/mês

---

## 🚀 Criação da VM no GCP

### Passo 1: Criar projeto no GCP (se ainda não tiver)

```bash
# Via gcloud CLI
gcloud projects create secretaria-online-prod --name="Secretaria Online"
gcloud config set project secretaria-online-prod
```

### Passo 2: Ativar APIs necessárias

```bash
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### Passo 3: Criar instância Compute Engine

**Via Console GCP:**

1. Acesse: **Compute Engine** > **VM instances** > **Create Instance**
2. Configure:
   - **Name:** `secretaria-online-prod`
   - **Region:** `us-central1` (ou escolha a região mais próxima)
   - **Zone:** `us-central1-a`
   - **Machine type:** `e2-medium` (2 vCPU, 4 GB RAM)
   - **Boot disk:**
     - **OS:** Debian GNU/Linux 11 (bullseye)
     - **Boot disk type:** SSD persistent disk
     - **Size:** 20 GB
   - **Firewall:**
     - ✓ Allow HTTP traffic
     - ✓ Allow HTTPS traffic
3. Clique em **Create**

**Via gcloud CLI:**

```bash
gcloud compute instances create secretaria-online-prod \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-ssd \
  --image-family=debian-11 \
  --image-project=debian-cloud \
  --tags=http-server,https-server \
  --metadata=startup-script='#!/bin/bash
    apt-get update
    apt-get install -y git curl wget
  '
```

### Passo 4: Reservar IP externo estático

```bash
# Criar IP estático
gcloud compute addresses create secretaria-online-ip --region=us-central1

# Obter o IP reservado
gcloud compute addresses describe secretaria-online-ip --region=us-central1 --format="value(address)"

# Associar à VM
gcloud compute instances add-access-config secretaria-online-prod \
  --zone=us-central1-a \
  --access-config-name="External NAT" \
  --address=RESERVED_IP
```

### Passo 5: Configurar regras de firewall

```bash
# Permitir tráfego HTTP (porta 80)
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server

# Permitir tráfego HTTPS (porta 443)
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=https-server

# Permitir API backend (porta 3000) - temporário para testes
gcloud compute firewall-rules create allow-api \
  --allow=tcp:3000 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=api-server
```

### Passo 6: Conectar via SSH

```bash
# Via gcloud
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Ou via SSH tradicional (após configurar chave)
ssh deploy@YOUR_EXTERNAL_IP
```

---

## ⚙️ Provisionamento do Servidor

### Passo 1: Transferir script de provisionamento

No seu **computador local**:

```bash
# Transferir script para o servidor
gcloud compute scp scripts/gcp-setup.sh secretaria-online-prod:~/ --zone=us-central1-a
```

### Passo 2: Executar script de provisionamento

No **servidor**:

```bash
# Tornar script executável
chmod +x ~/gcp-setup.sh

# Executar como root
sudo bash ~/gcp-setup.sh
```

**O que o script faz:**
- ✓ Atualiza o sistema Debian
- ✓ Instala Node.js v20 LTS
- ✓ Instala PM2 globalmente
- ✓ Instala MySQL 8.0
- ✓ Instala Nginx
- ✓ Instala Certbot (Let's Encrypt)
- ✓ Configura firewall (UFW)
- ✓ Cria usuário `deploy`
- ✓ Cria estrutura de diretórios em `/var/www/secretaria-online/`
- ✓ Configura PM2 para iniciar no boot
- ✓ Configura logrotate

**Tempo estimado:** 5-10 minutos

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Executar mysql_secure_installation

```bash
sudo mysql_secure_installation
```

**Responda:**
- Set root password? **Y** → Digite uma senha forte
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

### Passo 2: Criar banco de dados e usuário

```bash
sudo mysql
```

No prompt do MySQL:

```sql
-- Criar banco de dados
CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'secretaria_user'@'localhost' IDENTIFIED BY 'SenhaForte123!@#';

-- Conceder permissões
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT User, Host FROM mysql.user;

-- Sair
EXIT;
```

### Passo 3: Testar conexão

```bash
mysql -u secretaria_user -p secretaria_online
```

---

## 🌐 Configuração do Nginx

### Passo 1: Criar arquivo de configuração

```bash
sudo nano /etc/nginx/sites-available/secretaria-online
```

**Adicione:**

```nginx
# Upstream para backend API
upstream backend_api {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirecionar para HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (serão gerados pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (arquivos estáticos)
    root /var/www/secretaria-online/frontend;
    index index.html;

    # Logs
    access_log /var/log/nginx/secretaria-online-access.log;
    error_log /var/log/nginx/secretaria-online-error.log;

    # Compressão Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # API Backend (proxy reverso)
    location /api/ {
        proxy_pass http://backend_api/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend SPA (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploads (documentos)
    location /uploads/ {
        alias /var/www/secretaria-online/uploads/;
        autoindex off;
        # Permitir apenas usuários autenticados (implementar auth_request se necessário)
    }

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Passo 2: Ativar site e testar configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/secretaria-online /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Configuração do SSL/TLS

### Passo 1: Apontar domínio para o IP da VM

No seu **provedor de DNS** (Registro.br, Cloudflare, etc.):

Crie os seguintes registros:

```
Tipo    Nome                    Valor
A       seu-dominio.com         YOUR_EXTERNAL_IP
A       www.seu-dominio.com     YOUR_EXTERNAL_IP
```

**Aguarde propagação:** 5-60 minutos

### Passo 2: Gerar certificado SSL com Certbot

```bash
# Criar diretório para ACME challenge
sudo mkdir -p /var/www/certbot

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

**Responda:**
- Enter email address: **seu-email@example.com**
- Agree to terms: **Y**
- Share email with EFF: **N** (opcional)

### Passo 3: Configurar renovação automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# Renovação automática já está configurada via systemd timer
sudo systemctl status certbot.timer
```

O certificado será renovado automaticamente 30 dias antes do vencimento.

### Passo 4: Recarregar Nginx

```bash
sudo systemctl reload nginx
```

---

## 🚀 Deploy da Aplicação

### Passo 1: Configurar variáveis de ambiente no servidor

```bash
sudo su - deploy
cd /var/www/secretaria-online/backend
nano .env
```

**Adicione:**

```env
# Server
NODE_ENV=production
PORT=3000
BASE_URL=https://seu-dominio.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=secretaria_online
DB_USER=secretaria_user
DB_PASS=SenhaForte123!@#

# JWT
JWT_SECRET=chave_secreta_super_complexa_minimo_32_caracteres_aqui
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@seu-dominio.com
SMTP_PASS=senha_app_gmail

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/secretaria-online/uploads

# Logs
LOG_LEVEL=info
```

**Salvar:** Ctrl+O, Enter, Ctrl+X

### Passo 2: Editar script de deploy

No seu **computador local**:

```bash
nano scripts/gcp-deploy.sh
```

**Edite as variáveis:**

```bash
SSH_USER="deploy"
SSH_HOST="YOUR_EXTERNAL_IP"  # Seu IP estático
SSH_PORT="22"
```

### Passo 3: Tornar script executável

```bash
chmod +x scripts/gcp-deploy.sh
```

### Passo 4: Executar deploy

```bash
# Deploy completo (frontend + backend)
bash scripts/gcp-deploy.sh all

# Ou deploy individual
bash scripts/gcp-deploy.sh frontend
bash scripts/gcp-deploy.sh backend
```

**O que o script faz:**
1. ✓ Verifica requisitos (Node.js, npm, ssh)
2. ✓ Testa conexão SSH
3. ✓ Cria backup dos arquivos atuais
4. ✓ Build do frontend (Vite)
5. ✓ Upload do frontend via rsync/scp
6. ✓ Upload do backend (excluindo node_modules, .env, logs)
7. ✓ Instala dependências no servidor
8. ✓ Executa migrations do banco
9. ✓ Reinicia aplicação com PM2
10. ✓ Exibe status e logs

**Tempo estimado:** 5-10 minutos

### Passo 5: Verificar deploy

```bash
# Conectar ao servidor
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Verificar status do PM2
pm2 status

# Ver logs
pm2 logs secretaria-api --lines 50

# Testar API
curl http://localhost:3000/health
```

---

## 💾 Configuração de Backups Automáticos

### Passo 1: Script de backup do banco de dados

```bash
sudo nano /usr/local/bin/backup-db.sh
```

**Adicione:**

```bash
#!/bin/bash

BACKUP_DIR="/var/www/secretaria-online/backups/database"
DB_NAME="secretaria_online"
DB_USER="secretaria_user"
DB_PASS="SenhaForte123!@#"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="secretaria_db_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

# Manter apenas últimos 30 backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup criado: $FILENAME"
```

**Tornar executável:**

```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

### Passo 2: Script de backup de uploads

```bash
sudo nano /usr/local/bin/backup-uploads.sh
```

**Adicione:**

```bash
#!/bin/bash

BACKUP_DIR="/var/www/secretaria-online/backups/uploads"
UPLOADS_DIR="/var/www/secretaria-online/uploads"
DATE=$(date +%Y%m%d)
FILENAME="uploads_${DATE}.tar.gz"

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/$FILENAME -C $UPLOADS_DIR .

# Manter apenas últimos 7 backups semanais
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup criado: $FILENAME"
```

**Tornar executável:**

```bash
sudo chmod +x /usr/local/bin/backup-uploads.sh
```

### Passo 3: Configurar cron jobs

```bash
sudo crontab -e
```

**Adicione:**

```cron
# Backup do banco de dados (todo dia às 2h da manhã)
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1

# Backup de uploads (todo domingo às 3h da manhã)
0 3 * * 0 /usr/local/bin/backup-uploads.sh >> /var/log/backup-uploads.log 2>&1

# Limpeza de arquivos temporários (todo dia às 4h da manhã)
0 4 * * * find /var/www/secretaria-online/uploads/temp -type f -mtime +7 -delete
```

### Passo 4: Sincronizar backups com GCS (opcional)

```bash
# Instalar gsutil (se ainda não tiver)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Criar bucket no GCS
gsutil mb gs://secretaria-online-backups

# Adicionar ao cron para sincronização diária
0 5 * * * gsutil -m rsync -r /var/www/secretaria-online/backups gs://secretaria-online-backups
```

---

## 📊 Monitoramento e Logs

### PM2 Monitoring

```bash
# Status das aplicações
pm2 status

# Logs em tempo real
pm2 logs secretaria-api

# Logs dos últimos 100 linhas
pm2 logs secretaria-api --lines 100

# Monitoramento de recursos (CPU, RAM)
pm2 monit

# Informações detalhadas
pm2 show secretaria-api

# Restart
pm2 restart secretaria-api

# Reload (zero downtime)
pm2 reload secretaria-api

# Stop
pm2 stop secretaria-api
```

### Logs do Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/secretaria-online-access.log

# Error log
sudo tail -f /var/log/nginx/secretaria-online-error.log

# Filtrar por erro 500
sudo grep "500" /var/log/nginx/secretaria-online-access.log
```

### Logs da Aplicação

```bash
# Backend logs
tail -f /var/www/secretaria-online/backend/logs/combined.log
tail -f /var/www/secretaria-online/backend/logs/error.log
```

### Monitoramento de Recursos

```bash
# CPU e memória
htop

# Espaço em disco
df -h

# Uso de disco por diretório
du -sh /var/www/secretaria-online/*

# Conexões MySQL
mysqladmin -u root -p processlist

# Portas escutando
sudo netstat -tuln
```

### Configurar Google Cloud Monitoring (opcional)

```bash
# Instalar Ops Agent
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
```

---

## 🐛 Troubleshooting

### Problema: Aplicação não inicia (PM2)

**Sintomas:**
- `pm2 status` mostra status "errored"
- Logs mostram erro de conexão

**Soluções:**

```bash
# Ver logs detalhados
pm2 logs secretaria-api --err

# Verificar .env
cat /var/www/secretaria-online/backend/.env

# Testar conexão com MySQL
mysql -u secretaria_user -p secretaria_online

# Verificar se porta 3000 está livre
sudo netstat -tuln | grep :3000

# Reiniciar do zero
pm2 delete secretaria-api
cd /var/www/secretaria-online/backend
pm2 start src/server.js --name secretaria-api
pm2 save
```

### Problema: Erro 502 Bad Gateway (Nginx)

**Sintomas:**
- Navegador exibe "502 Bad Gateway"
- Nginx não consegue conectar ao backend

**Soluções:**

```bash
# Verificar se backend está rodando
pm2 status

# Verificar se porta 3000 está respondendo
curl http://localhost:3000/health

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/secretaria-online-error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: Frontend mostra tela branca

**Sintomas:**
- Navegador exibe tela branca
- Console mostra erros de JS

**Soluções:**

```bash
# Verificar se arquivos foram enviados
ls -la /var/www/secretaria-online/frontend/

# Verificar permissões
sudo chmod -R 755 /var/www/secretaria-online/frontend

# Verificar configuração do Nginx
sudo nginx -t

# Reenviar frontend
# (no computador local)
bash scripts/gcp-deploy.sh frontend
```

### Problema: Erro "Cannot find module"

**Sintomas:**
- PM2 logs mostram "Cannot find module 'X'"

**Soluções:**

```bash
cd /var/www/secretaria-online/backend

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install --production

# Reiniciar aplicação
pm2 restart secretaria-api
```

### Problema: Migrations não foram executadas

**Sintomas:**
- Erro "Table doesn't exist" nos logs

**Soluções:**

```bash
cd /var/www/secretaria-online/backend

# Verificar status das migrations
npm run db:migrate:status

# Executar migrations pendentes
npm run db:migrate

# Verificar tabelas criadas
mysql -u secretaria_user -p secretaria_online -e "SHOW TABLES;"
```

### Problema: Upload de arquivos falha

**Sintomas:**
- Erro ao fazer upload de documentos

**Soluções:**

```bash
# Verificar estrutura de diretórios
ls -la /var/www/secretaria-online/uploads/

# Criar diretórios se não existirem
mkdir -p /var/www/secretaria-online/uploads/documents
mkdir -p /var/www/secretaria-online/uploads/contracts
mkdir -p /var/www/secretaria-online/uploads/temp

# Ajustar permissões
sudo chown -R deploy:deploy /var/www/secretaria-online/uploads
sudo chmod -R 775 /var/www/secretaria-online/uploads

# Verificar MAX_FILE_SIZE no .env
grep MAX_FILE_SIZE /var/www/secretaria-online/backend/.env
```

### Problema: SSL não funciona (Certbot)

**Sintomas:**
- Site não carrega via HTTPS
- Erro de certificado

**Soluções:**

```bash
# Verificar status do Certbot
sudo certbot certificates

# Renovar certificado manualmente
sudo certbot renew

# Verificar logs do Certbot
sudo cat /var/log/letsencrypt/letsencrypt.log

# Recriar certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com --force-renewal
```

---

## 🔧 Manutenção e Atualizações

### Atualizar Aplicação

```bash
# No computador local
# 1. Fazer commit das mudanças
git add .
git commit -m "feat: novas funcionalidades"
git push origin main

# 2. Deploy
bash scripts/gcp-deploy.sh all
```

### Atualizar Dependências

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix

# Testar localmente antes de fazer deploy
npm run dev  # frontend
npm run dev  # backend
```

### Atualizar Node.js

```bash
# No servidor
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Verificar versão
node --version

# Reiniciar aplicação
pm2 restart secretaria-api
```

### Atualizar Sistema Operacional

```bash
# Atualizar pacotes
sudo apt-get update
sudo apt-get upgrade -y

# Atualizar kernel (se necessário)
sudo apt-get dist-upgrade -y

# Reiniciar servidor (se necessário)
sudo reboot
```

### Limpar Espaço em Disco

```bash
# Limpar pacotes não utilizados
sudo apt-get autoremove -y
sudo apt-get clean

# Limpar logs antigos
sudo journalctl --vacuum-time=7d

# Limpar backups antigos manualmente
find /var/www/secretaria-online/backups -mtime +60 -delete
```

---

## 📈 Escalabilidade (Futuro)

### Load Balancer (múltiplas VMs)

```bash
# Criar grupo de instâncias gerenciadas
gcloud compute instance-templates create secretaria-template \
  --machine-type=e2-medium \
  --image-family=debian-11 \
  --image-project=debian-cloud

gcloud compute instance-groups managed create secretaria-group \
  --base-instance-name=secretaria \
  --size=2 \
  --template=secretaria-template \
  --zone=us-central1-a

# Criar Load Balancer HTTP(S)
gcloud compute backend-services create secretaria-backend \
  --protocol=HTTP \
  --health-checks=secretaria-health-check \
  --global

# Adicionar grupo ao backend
gcloud compute backend-services add-backend secretaria-backend \
  --instance-group=secretaria-group \
  --instance-group-zone=us-central1-a \
  --global
```

### Cloud SQL (banco gerenciado)

```bash
# Criar instância Cloud SQL
gcloud sql instances create secretaria-db \
  --database-version=MYSQL_8_0 \
  --tier=db-n1-standard-1 \
  --region=us-central1

# Criar banco de dados
gcloud sql databases create secretaria_online --instance=secretaria-db

# Criar usuário
gcloud sql users create secretaria_user \
  --instance=secretaria-db \
  --password=SENHA_FORTE
```

---

## 📝 Checklist de Deploy

- [ ] VM criada no GCP
- [ ] IP estático reservado e associado
- [ ] Domínio apontando para o IP
- [ ] Firewall configurado
- [ ] Script de provisionamento executado
- [ ] MySQL configurado e seguro
- [ ] Banco de dados criado
- [ ] Nginx configurado
- [ ] SSL instalado (Let's Encrypt)
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] Deploy da aplicação executado
- [ ] Migrations do banco executadas
- [ ] PM2 configurado e rodando
- [ ] Backups automáticos configurados
- [ ] Monitoramento configurado
- [ ] Testes realizados (frontend + backend)
- [ ] DNS propagado e funcionando
- [ ] HTTPS funcionando corretamente

---

## 📞 Suporte

**Documentação:**
- [GCP Compute Engine](https://cloud.google.com/compute/docs)
- [Node.js](https://nodejs.org/docs/)
- [PM2](https://pm2.keymetrics.io/docs/)
- [Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

**Logs importantes:**
- `/var/log/nginx/secretaria-online-error.log`
- `/var/www/secretaria-online/backend/logs/error.log`
- `pm2 logs secretaria-api`

---

**Última atualização:** 2025-11-11
**Versão:** 1.0
