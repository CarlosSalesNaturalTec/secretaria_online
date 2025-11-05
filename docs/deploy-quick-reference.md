# Quick Reference - Deploy Commands

**Arquivo:** docs/deploy-quick-reference.md
**Descrição:** Referência rápida de comandos para deploy
**Feature:** feat-107 - Criar scripts de build e deploy
**Criado em:** 2025-11-05

---

## 🚀 Deploy Automatizado

```bash
# Deploy completo (frontend + backend)
./deploy.sh

# Deploy apenas frontend
./deploy.sh frontend

# Deploy apenas backend
./deploy.sh backend
```

---

## 📦 Build Local

### Frontend

```bash
cd frontend
npm run build              # Build de produção
npm run preview            # Preview do build
```

### Backend

```bash
cd backend
npm run start:prod         # Rodar em modo produção localmente
```

---

## 🔄 PM2 (Gerenciamento de Processos)

```bash
# Status
pm2 status
pm2 show secretaria-api

# Logs
pm2 logs secretaria-api
pm2 logs secretaria-api --lines 100

# Restart/Stop/Delete
pm2 restart secretaria-api
pm2 stop secretaria-api
pm2 delete secretaria-api

# Salvar configuração atual
pm2 save

# Listar processos salvos
pm2 list

# Monitoramento em tempo real
pm2 monit
```

---

## 🗄️ Database (Migrations e Seeds)

```bash
# No servidor
ssh user@servidor.com
cd ~/api

# Executar migrations
npm run db:migrate

# Reverter última migration
npm run db:migrate:undo

# Executar seeders
npm run db:seed

# Limpar seeders
npm run db:seed:undo

# Reset completo (CUIDADO: apaga tudo)
npm run db:reset
```

---

## 📤 Upload Manual via SCP/SFTP

### Frontend

```bash
# Build local
cd frontend && npm run build

# Upload
scp -r dist/* user@servidor.com:/home/user/public_html/
```

### Backend

```bash
# Upload com rsync (recomendado)
rsync -avz --delete --progress \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'logs' \
  backend/ user@servidor.com:~/api/

# Upload com scp (alternativa)
cd backend
scp -r src package.json user@servidor.com:~/api/
```

---

## 🔍 Verificações Pós-Deploy

```bash
# Health check da API
curl https://seu-dominio.com/api/health

# Verificar logs
ssh user@servidor.com
tail -f ~/api/logs/combined.log

# Status do PM2
pm2 status

# Processos Node rodando
ps aux | grep node
```

---

## 💾 Backup e Restore

### Criar Backup Manual

```bash
ssh user@servidor.com

# Backup do banco de dados
mysqldump -u user -p secretaria_db > ~/backups/db_$(date +%Y%m%d).sql

# Backup do backend
tar -czf ~/backups/backend_$(date +%Y%m%d).tar.gz ~/api

# Backup do frontend
tar -czf ~/backups/frontend_$(date +%Y%m%d).tar.gz ~/public_html
```

### Restaurar Backup

```bash
ssh user@servidor.com

# Restaurar banco de dados
mysql -u user -p secretaria_db < ~/backups/db_20250105.sql

# Restaurar backend
cd ~
tar -xzf ~/backups/backend_20250105.tar.gz

# Restaurar frontend
cd ~
tar -xzf ~/backups/frontend_20250105.tar.gz
```

---

## 🔧 Troubleshooting Rápido

### PM2 não está rodando

```bash
pm2 delete secretaria-api
pm2 start ~/api/src/server.js --name secretaria-api
pm2 save
```

### Erro de dependências

```bash
cd ~/api
rm -rf node_modules package-lock.json
npm install --production
pm2 restart secretaria-api
```

### Permissões de upload

```bash
chmod -R 755 ~/api/uploads
chown -R user:user ~/api/uploads
```

### Frontend tela branca

```bash
# Limpar cache do navegador
# Verificar DevTools (F12) > Console

# Reenviar frontend
cd frontend
npm run build
scp -r dist/* user@servidor.com:~/public_html/
```

---

## 🔐 Configurar SSH sem Senha (Opcional)

```bash
# No seu computador local
ssh-keygen -t rsa -b 4096

# Copiar chave pública para servidor
ssh-copy-id user@servidor.com

# Testar conexão
ssh user@servidor.com
```

---

## 📊 Monitoramento

```bash
# CPU e Memória do Node
pm2 monit

# Logs em tempo real
pm2 logs secretaria-api --lines 50 --raw

# Erros apenas
pm2 logs secretaria-api --err

# Espaço em disco
ssh user@servidor.com df -h

# Conexões MySQL ativas
ssh user@servidor.com
mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## ⚡ Comandos Úteis

```bash
# Ver versão do Node no servidor
ssh user@servidor.com node --version

# Ver variáveis de ambiente (sanitizado)
ssh user@servidor.com
cat ~/api/.env | grep -v PASS | grep -v SECRET

# Testar conectividade MySQL
mysql -h localhost -u user -p -e "SELECT 1;"

# Ver processos PM2 em JSON
pm2 jlist

# Restart automático em crash
pm2 startup
```

---

**Dica:** Salve este arquivo nos seus favoritos para acesso rápido durante deploys! 🎯
