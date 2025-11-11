# Fluxo Correto de Deploy - Secretaria Online

**Data:** 2025-11-11
**Versão:** 2.0

---

## 🎯 Fluxo Correto de Deploy

### Opção A: Deploy via Git (Recomendado para Produção)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Desenvolvimento Local                                     │
│    - Fazer mudanças no código                               │
│    - Testar localmente                                      │
│    - Commit e push para GitHub                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Servidor GCP                                             │
│    a) Clonar repositório (primeira vez)                     │
│       git clone https://github.com/user/repo.git            │
│                                                              │
│    b) Atualizações subsequentes                             │
│       cd /var/www/secretaria-online/backend                 │
│       git pull origin main                                  │
│       npm ci --production                                   │
│       npm run db:migrate                                    │
│       pm2 reload secretaria-api                             │
└─────────────────────────────────────────────────────────────┘
```

### Opção B: Deploy via Build + Upload (Desenvolvimento/Staging)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Build Local                                              │
│    Frontend:                                                │
│    - cd frontend                                            │
│    - npm run build                                          │
│    - Gera pasta dist/                                       │
│                                                              │
│    Backend:                                                 │
│    - Não precisa build (Node.js roda código direto)        │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Upload para Servidor                                     │
│    - scp/rsync do frontend/dist/ para servidor             │
│    - scp/rsync do backend/ para servidor                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Configurar no Servidor                                   │
│    - npm ci --production (backend)                          │
│    - npm run db:migrate                                     │
│    - pm2 reload secretaria-api                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Passo a Passo Completo

### FASE 1: Setup Inicial do Servidor (Uma vez)

#### 1.1 Provisionar Servidor

```bash
# Transferir script
gcloud compute scp scripts/gcp-setup.sh secretaria-online-prod:~/ --zone=us-central1-a

# Executar
ssh secretaria-online-prod
chmod +x gcp-setup.sh
sudo bash gcp-setup.sh
```

#### 1.2 Instalar MariaDB

```bash
sudo bash gcp-install-mariadb.sh
sudo mysql_secure_installation
```

#### 1.3 Criar Banco de Dados

```bash
sudo mysql
```

```sql
CREATE DATABASE secretaria_online
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER 'secretaria_user'@'localhost'
    IDENTIFIED BY 'SenhaForte123!';

GRANT ALL PRIVILEGES ON secretaria_online.*
    TO 'secretaria_user'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

#### 1.4 Finalizar Setup

```bash
sudo bash gcp-complete-setup.sh
```

---

### FASE 2: Primeira Implantação

#### Opção A: Via Clonagem do Repositório (Recomendado)

```bash
# 1. Editar script com URL do seu repositório
nano scripts/gcp-clone-repository.sh
# Alterar: GIT_REPO_URL="https://github.com/seu-usuario/secretaria-online.git"

# 2. Transferir para servidor
gcloud compute scp scripts/gcp-clone-repository.sh secretaria-online-prod:~/ --zone=us-central1-a

# 3. No servidor, executar
chmod +x gcp-clone-repository.sh
bash gcp-clone-repository.sh
```

**Estrutura após clonagem:**
```
/var/www/secretaria-online/
├── .git/                    # Controle de versão
├── frontend/                # Código do React
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/                 # Código do Node.js
│   ├── src/
│   ├── database/
│   ├── package.json
│   ├── .env.example
│   ├── uploads/            # Criado automaticamente
│   └── logs/               # Criado automaticamente
├── configs/
├── scripts/
├── docs/
└── README.md
```

#### 2.1 Configurar .env do Backend

```bash
cd /var/www/secretaria-online/backend
cp .env.example .env
nano .env
```

**Configurar:**
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://seu-dominio.com

DB_HOST=localhost
DB_PORT=3306
DB_NAME=secretaria_online
DB_USER=secretaria_user
DB_PASS=SenhaForte123!

JWT_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@seu-dominio.com
SMTP_PASS=senha_app

UPLOAD_PATH=/var/www/secretaria-online/backend/uploads
LOG_LEVEL=info
```

#### 2.2 Executar Migrations

```bash
cd /var/www/secretaria-online/backend
npm run db:migrate
npm run db:seed  # Se tiver seeders (usuário admin, etc.)
```

#### 2.3 Build e Deploy do Frontend

**No seu computador local:**

```bash
cd frontend
npm ci
npm run build

# Enviar para servidor
gcloud compute scp --recurse dist/* secretaria-online-prod:/var/www/secretaria-online/frontend/ --zone=us-central1-a
```

**Ou via script de deploy:**

```bash
# Editar gcp-deploy.sh com seu IP
nano scripts/gcp-deploy.sh

# Executar deploy do frontend
bash scripts/gcp-deploy.sh frontend
```

#### 2.4 Configurar PM2

```bash
cd /var/www/secretaria-online/backend

# Opção 1: Start simples
pm2 start src/server.js --name secretaria-api
pm2 save

# Opção 2: Com ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
```

#### 2.5 Configurar Nginx

```bash
# Copiar configuração
sudo cp /var/www/secretaria-online/configs/nginx.conf /etc/nginx/sites-available/secretaria-online

# Editar domínio
sudo nano /etc/nginx/sites-available/secretaria-online
# Substituir: seu-dominio.com pelo seu domínio real

# Ativar site
sudo ln -s /etc/nginx/sites-available/secretaria-online /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remover site padrão

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

#### 2.6 Configurar SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

---

### FASE 3: Atualizações Futuras

#### Via Git Pull (Backend)

```bash
# No servidor
cd /var/www/secretaria-online/backend
git pull origin main
npm ci --production
npm run db:migrate
pm2 reload secretaria-api
```

**Ou use o script atualizado:**

```bash
# No seu computador
bash scripts/gcp-deploy.sh backend
```

#### Frontend (Build local + Upload)

```bash
# No seu computador local
cd frontend
npm run build
gcloud compute scp --recurse dist/* secretaria-online-prod:/var/www/secretaria-online/frontend/ --zone=us-central1-a

# Ou
bash scripts/gcp-deploy.sh frontend
```

---

## 🔄 Comparação das Abordagens

### Abordagem 1: Git Clone + Pull (Recomendada)

**Vantagens:**
- ✅ Histórico completo no servidor
- ✅ Fácil rollback (`git checkout <commit>`)
- ✅ Rastreabilidade de versões
- ✅ Menos chance de erro (pull atômico)
- ✅ Melhor para equipes

**Desvantagens:**
- ❌ Precisa configurar chave SSH/token do GitHub
- ❌ Requer Git no servidor

**Quando usar:**
- Produção
- Múltiplos desenvolvedores
- Repositórios privados

---

### Abordagem 2: Build + Upload (SCP/Rsync)

**Vantagens:**
- ✅ Não precisa Git no servidor
- ✅ Menor footprint (sem .git)
- ✅ Mais controle sobre o que vai para produção

**Desvantagens:**
- ❌ Sem histórico no servidor
- ❌ Rollback mais difícil
- ❌ Sincronização manual

**Quando usar:**
- Desenvolvimento/staging
- Servidor compartilhado sem Git
- Deploys rápidos de teste

---

## 🚨 Problemas Comuns

### "Diretórios vazios no servidor"

**Causa:** Executou scripts de criação de diretórios antes de clonar repositório

**Solução:**
```bash
# Remover diretórios vazios
sudo rm -rf /var/www/secretaria-online

# Clonar repositório
bash gcp-clone-repository.sh
```

### "Frontend não aparece"

**Causa:** Build não foi enviado para o servidor

**Solução:**
```bash
cd frontend
npm run build
gcloud compute scp --recurse dist/* secretaria-online-prod:/var/www/secretaria-online/frontend/ --zone=us-central1-a
```

### "Backend não inicia (PM2)"

**Causa:** `.env` não configurado ou migrations não executadas

**Solução:**
```bash
cd /var/www/secretaria-online/backend
nano .env  # Configurar
npm run db:migrate
pm2 restart secretaria-api
pm2 logs secretaria-api
```

---

## 📊 Checklist de Deploy

- [ ] Servidor provisionado (Node, MariaDB, Nginx, PM2)
- [ ] MariaDB configurado e banco criado
- [ ] Repositório clonado OU código enviado via SCP
- [ ] `.env` configurado no backend
- [ ] Migrations executadas
- [ ] Frontend buildado e enviado
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado com domínio
- [ ] SSL configurado com Certbot
- [ ] DNS apontando para o servidor
- [ ] Testes realizados (login, CRUD, uploads)

---

**Última atualização:** 2025-11-11
