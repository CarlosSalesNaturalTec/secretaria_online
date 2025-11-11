# Guia de Deploy - Secretaria Online

**Arquivo:** docs/deploy-guide.md
**Descrição:** Guia completo de deploy da aplicação Secretaria Online
**Feature:** feat-107 - Criar scripts de build e deploy
**Criado em:** 2025-11-05

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Scripts Disponíveis](#scripts-disponíveis)
4. [Deploy Manual](#deploy-manual)
5. [Deploy Automatizado](#deploy-automatizado)
6. [Verificação Pós-Deploy](#verificação-pós-deploy)
7. [Troubleshooting](#troubleshooting)
8. [Rollback](#rollback)

---

## 🔧 Pré-requisitos

### No seu ambiente local:

- **Node.js** v20 LTS ou superior
- **npm** v10 ou superior
- **Git** instalado e configurado
- **SSH** configurado com acesso ao servidor
- **Permissões** de escrita no servidor de destino

### No servidor (Hostgator ou VPS):

- **Node.js** v20 LTS instalado
- **PM2** instalado globalmente (`npm install -g pm2`)
- **MySQL** 8.0 configurado
- **Certificado SSL** ativo
- **Acesso SSH** habilitado
- **Permissões** de escrita nas pastas de deploy

---

## ⚙️ Configuração Inicial

### 1. Configurar Variáveis de Ambiente no Servidor

Crie o arquivo `.env` no diretório do backend no servidor:

```bash
ssh user@servidor.com
cd ~/api
nano .env
```

Adicione as seguintes variáveis:

```env
# Server
NODE_ENV=production
PORT=3000
BASE_URL=https://seu-dominio.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=secretaria_db
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql

# JWT
JWT_SECRET=chave_secreta_super_segura_aqui_minimo_32_caracteres
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
SMTP_HOST=smtp.hostgator.com
SMTP_PORT=587
SMTP_USER=noreply@seu-dominio.com
SMTP_PASS=sua_senha_email
SMTP_FROM="Secretaria Online <noreply@seu-dominio.com>"

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/usuario/api/uploads

# Logs
LOG_LEVEL=info
```

### 2. Configurar Script de Deploy

Edite o arquivo `deploy.sh` na raiz do projeto e atualize as variáveis:

```bash
# Conexão SSH
SSH_USER="seu_usuario_ssh"
SSH_HOST="seu-dominio.com"
SSH_PORT="22"

# Caminhos no servidor
REMOTE_PUBLIC_HTML="/home/seu_usuario/public_html"
REMOTE_API_PATH="/home/seu_usuario/api"

# Nome da aplicação no PM2
PM2_APP_NAME="secretaria-api"
```

### 3. Configurar PM2 no Servidor

Faça login no servidor e configure o PM2:

```bash
ssh user@servidor.com
cd ~/api
pm2 start src/server.js --name secretaria-api
pm2 save
pm2 startup
```

Siga as instruções do comando `pm2 startup` para configurar o PM2 para iniciar automaticamente no boot.

---

## 📜 Scripts Disponíveis

### Frontend

```json
{
  "scripts": {
    "dev": "vite",                          // Desenvolvimento local
    "build": "tsc -b && vite build",        // Build de produção
    "preview": "vite preview"               // Preview do build
  }
}
```

### Backend

```json
{
  "scripts": {
    "start": "node src/server.js",           // Iniciar servidor
    "start:prod": "NODE_ENV=production node src/server.js",  // Produção
    "dev": "nodemon src/server.js",          // Desenvolvimento com hot-reload
    "db:migrate": "sequelize-cli db:migrate", // Executar migrations
    "db:seed": "sequelize-cli db:seed:all"   // Executar seeders
  }
}
```

---

## 🚀 Deploy Manual

### Deploy do Frontend

```bash
# 1. Navegar para pasta do frontend
cd frontend

# 2. Instalar dependências
npm ci

# 3. Build de produção
npm run build

# 4. Upload via SCP
scp -r dist/* usuario@servidor.com:/home/usuario/public_html/

# 5. Verificar upload
ssh usuario@servidor.com "ls -la ~/public_html"
```

### Deploy do Backend

```bash
# 1. Navegar para pasta do backend
cd backend

# 2. Upload via rsync (recomendado)
rsync -avz --delete --progress \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'logs' \
  --exclude 'uploads/temp' \
  -e "ssh" \
  ./ usuario@servidor.com:~/api/

# 3. Instalar dependências no servidor
ssh usuario@servidor.com << 'EOF'
  cd ~/api
  npm ci --production
  npm run db:migrate
  pm2 restart secretaria-api
EOF
```

---

## 🤖 Deploy Automatizado

O script `deploy.sh` automatiza todo o processo de deploy.

### Deploy Completo (Frontend + Backend)

```bash
./deploy.sh
```

ou

```bash
./deploy.sh all
```

### Deploy Apenas do Frontend

```bash
./deploy.sh frontend
```

### Deploy Apenas do Backend

```bash
./deploy.sh backend
```

### Fluxo do Script Automatizado

1. ✓ Valida requisitos (Node.js, npm, ssh, scp)
2. ✓ Cria backup dos arquivos atuais no servidor
3. ✓ Build do frontend (se aplicável)
4. ✓ Upload do frontend via SCP (se aplicável)
5. ✓ Upload do backend via rsync (se aplicável)
6. ✓ Instala dependências no servidor
7. ✓ Executa migrations do banco de dados
8. ✓ Reinicia aplicação com PM2
9. ✓ Exibe mensagem de sucesso

---

## ✅ Verificação Pós-Deploy

### 1. Verificar Status do PM2

```bash
ssh usuario@servidor.com
pm2 status
pm2 logs secretaria-api --lines 50
```

### 2. Verificar Logs

```bash
# Logs do PM2
pm2 logs secretaria-api

# Logs da aplicação
tail -f ~/api/logs/combined.log
tail -f ~/api/logs/error.log
```

### 3. Testar Endpoints da API

```bash
# Health check
curl https://seu-dominio.com/api/health

# Login (teste)
curl -X POST https://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'
```

### 4. Verificar Frontend

Acesse `https://seu-dominio.com` no navegador e verifique:

- ✓ Página carrega sem erros
- ✓ CSS e imagens aparecem corretamente
- ✓ Login funciona
- ✓ Navegação entre páginas funciona

### 5. Verificar Banco de Dados

```bash
ssh usuario@servidor.com
mysql -u usuario_mysql -p secretaria_db

# No MySQL:
SHOW TABLES;
SELECT * FROM users LIMIT 5;
```

---

## 🔧 Troubleshooting

### Problema: "Permission denied" ao fazer upload

**Solução:**

```bash
# Verificar permissões no servidor
ssh usuario@servidor.com
ls -la ~/public_html
ls -la ~/api

# Ajustar permissões se necessário
chmod 755 ~/public_html
chmod 755 ~/api
```

### Problema: PM2 não reinicia a aplicação

**Solução:**

```bash
ssh usuario@servidor.com

# Deletar processo antigo
pm2 delete secretaria-api

# Recriar processo
pm2 start ~/api/src/server.js --name secretaria-api
pm2 save
```

### Problema: Erro "Cannot find module"

**Solução:**

```bash
ssh usuario@servidor.com
cd ~/api

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install --production
pm2 restart secretaria-api
```

### Problema: Frontend exibe tela branca

**Causas comuns:**

1. **Base path incorreto no Vite**
   - Verificar `vite.config.ts` → `base` deve estar correto
2. **Arquivos não foram enviados**
   - Verificar se `dist/` foi enviado corretamente
3. **Erro no console do navegador**
   - Abrir DevTools (F12) e verificar erros

**Solução:**

```bash
# Reenviar frontend
cd frontend
npm run build
scp -r dist/* usuario@servidor.com:/home/usuario/public_html/
```

### Problema: Erro de conexão com banco de dados

**Solução:**

```bash
ssh usuario@servidor.com
cd ~/api

# Verificar variáveis de ambiente
cat .env | grep DB_

# Testar conexão MySQL
mysql -h localhost -u usuario_mysql -p secretaria_db -e "SELECT 1;"
```

### Problema: Upload de arquivos falha

**Causas:**

- Pasta `uploads/` não tem permissões corretas
- Limite de upload muito baixo

**Solução:**

```bash
ssh usuario@servidor.com
cd ~/api

# Criar estrutura de uploads
mkdir -p uploads/documents uploads/contracts uploads/temp

# Ajustar permissões
chmod -R 755 uploads/
chown -R usuario:usuario uploads/
```

---

## ⏮️ Rollback

### Restaurar Backup Anterior

Os backups são criados automaticamente pelo script de deploy em:

- `~/backups/frontend_YYYYMMDD_HHMMSS.tar.gz`
- `~/backups/backend_YYYYMMDD_HHMMSS.tar.gz`

```bash
ssh usuario@servidor.com

# Listar backups disponíveis
ls -lh ~/backups/

# Restaurar frontend
cd ~/public_html
rm -rf *
tar -xzf ~/backups/frontend_20250105_143022.tar.gz

# Restaurar backend
cd ~/api
# Fazer backup do estado atual antes de restaurar
tar -czf ~/api_before_rollback.tar.gz .
rm -rf src/ package.json
tar -xzf ~/backups/backend_20250105_143022.tar.gz
npm ci --production
pm2 restart secretaria-api
```

### Rollback via Git (Backend)

```bash
ssh usuario@servidor.com
cd ~/api

# Ver commits recentes
git log --oneline -5

# Voltar para commit anterior
git checkout <hash-do-commit>
npm ci --production
pm2 restart secretaria-api
```

---

## 📊 Monitoramento

### Configurar Alertas de Erro

```bash
# Monitorar erros em tempo real
ssh usuario@servidor.com
pm2 logs secretaria-api | grep -i error
```

### Status do Sistema

```bash
# Uso de recursos
pm2 monit

# Informações detalhadas
pm2 show secretaria-api
```

---

## 🔒 Segurança

### Checklist de Segurança Pós-Deploy

- [ ] HTTPS habilitado e funcionando
- [ ] Variáveis de ambiente em `.env` (nunca commitadas no Git)
- [ ] JWT_SECRET é forte e único (mínimo 32 caracteres)
- [ ] Senhas de banco de dados são fortes
- [ ] PM2 configurado para rodar como serviço do sistema
- [ ] Firewall configurado (apenas portas 22, 80, 443 abertas)
- [ ] Backups automáticos configurados (cron)
- [ ] Logs sendo rotacionados

---

## 📝 Notas Finais

- **Backups:** Os últimos 5 backups de cada tipo são mantidos automaticamente
- **Logs:** Verifique sempre os logs após deploy (`pm2 logs secretaria-api`)
- **Migrations:** São executadas automaticamente pelo script de deploy
- **Downtime:** O deploy causa ~10-30 segundos de downtime durante o restart do PM2
- **Testes:** Sempre teste em ambiente de staging antes de produção

---

**Última atualização:** 2025-11-05
**Versão:** 1.0
