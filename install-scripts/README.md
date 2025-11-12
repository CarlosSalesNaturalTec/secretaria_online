# 🚀 Scripts de Instalação - Secretaria Online

Este diretório contém scripts automatizados para instalar a aplicação **Secretaria Online** em uma VM do Google Cloud Platform (GCP).

## 📋 Conteúdo

### Scripts de Instalação

| Script | Descrição | Tempo |
|--------|-----------|-------|
| **`quick-install.sh`** | ⭐ Instalação rápida (tudo em um script) | 30-45 min |
| **`01-system-dependencies.sh`** | Instala Node.js, npm, PM2, Git | 5-10 min |
| **`02-mariadb-setup.sh`** | Instala e configura MariaDB | 3-5 min |
| **`03-app-setup.sh`** | Clone do repositório e dependências | 5-10 min |
| **`04-configure-env.sh`** | Configuração de variáveis de ambiente | 5 min |
| **`05-start-app.sh`** | Inicia aplicação com PM2 | 2-3 min |
| **`06-health-check.sh`** | Verifica saúde da aplicação | 1 min |
| **`manage-app.sh`** | Menu interativo de gerenciamento | - |

### Documentação

| Arquivo | Descrição |
|---------|-----------|
| **`INSTALLATION_GUIDE.md`** | Guia passo a passo completo |
| **`README.md`** | Este arquivo |

## 🚀 Instalação Rápida (Recomendado)

Para instalar tudo em um único script:

### 1️⃣ Conectar à VM

```bash
gcloud compute ssh secretaria-online-vm --zone=us-central1-a
```

### 2️⃣ Clonar repositório

```bash
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria_online/install-scripts
```

### 3️⃣ Executar instalação rápida

```bash
bash quick-install.sh
```

**Pronto!** A aplicação estará instalada e rodando em ~30 minutos.

## 📝 Instalação Passo a Passo

Se preferir instalar manualmente ou entender cada etapa:

### 1️⃣ Instalar Dependências do Sistema

```bash
bash 01-system-dependencies.sh
```

**Instala**:
- Node.js 20 LTS
- npm
- Git
- PM2 (gerenciador de processos)
- Build tools

### 2️⃣ Instalar MariaDB

```bash
bash 02-mariadb-setup.sh
```

**Instala**:
- MariaDB Server
- MariaDB Client
- Configurações de segurança

⚠️ Altere a senha root após a instalação:
```bash
sudo mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'SENHA_NOVA_FORTE';
FLUSH PRIVILEGES;
EXIT;
```

### 3️⃣ Setup da Aplicação

```bash
bash 03-app-setup.sh
```

**Faz**:
- Clone do repositório Git
- Instalação de dependências npm
- Build do frontend
- Criação de diretórios

### 4️⃣ Configurar Variáveis de Ambiente

```bash
bash 04-configure-env.sh
```

**Configura**:
- Banco de dados (MariaDB)
- Autenticação (JWT)
- Email (SMTP)
- URLs e portas
- Executa migrations e seeders

### 5️⃣ Iniciar Aplicação

```bash
bash 05-start-app.sh
```

**Inicia**:
- Backend (PM2)
- Frontend (PM2)
- Configura auto-start no reboot

### 6️⃣ Verificar Saúde

```bash
bash 06-health-check.sh
```

Verifica se tudo está funcionando:
- ✅ PM2
- ✅ API Backend
- ✅ Frontend
- ✅ MariaDB
- ✅ Conexão com BD
- ✅ Espaço em disco

## 🎮 Gerenciar Aplicação

Use o script interativo para operações comuns:

```bash
bash manage-app.sh
```

### Menu de Opções

**APLICAÇÃO:**
- 1) Ver status (PM2)
- 2) Ver logs em tempo real
- 3) Iniciar aplicação
- 4) Parar aplicação
- 5) Reiniciar aplicação
- 6) Reload (zero downtime)

**BANCO DE DADOS:**
- 7) Ver status MariaDB
- 8) Executar migrations
- 9) Desfazer última migration
- 10) Executar seeders
- 11) Resetar banco
- 12) Acessar MySQL shell

**ATUALIZAÇÃO:**
- 13) Atualizar aplicação (git pull)
- 14) Rebuild frontend

**VERIFICAÇÃO:**
- 15) Health check completo
- 16) Ver disk space
- 17) Ver detalhes dos processos

**UTILITÁRIOS:**
- 18) Visualizar .env backend
- 19) Visualizar .env frontend
- 20) Editar .env backend
- 21) Editar .env frontend

## 🔍 Verificações e Troubleshooting

### Ver Status da Aplicação

```bash
pm2 status
pm2 list
```

### Ver Logs

```bash
# Todos os logs
pm2 logs

# Apenas backend
pm2 logs secretaria-api

# Apenas frontend
pm2 logs secretaria-frontend

# Últimas 100 linhas
pm2 logs --lines 100
```

### Monitorar em Tempo Real

```bash
pm2 monit
```

### Acessar Aplicação

Após a instalação:

```
Frontend:  http://<IP_DA_VM>:5173
Backend:   http://<IP_DA_VM>:3000
Health:    http://<IP_DA_VM>:3000/health
```

### Obter IP da VM

```bash
# Via gcloud CLI
gcloud compute instances describe secretaria-online-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Via Google Cloud Console
# Compute Engine > Instâncias de VM > coluna IP externo
```

## 🗄️ Operações de Banco de Dados

### Executar Migrations

```bash
cd ~/secretaria-online/backend
npm run db:migrate
```

### Desfazer Última Migration

```bash
cd ~/secretaria-online/backend
npm run db:migrate:undo
```

### Executar Seeders

```bash
cd ~/secretaria-online/backend
npm run db:seed
```

### Resetar Banco Completamente

```bash
cd ~/secretaria-online/backend
npm run db:reset
```

### Acessar MySQL Diretamente

```bash
mysql -u secretaria_user -p secretaria_online
# Digite a senha configurada
```

## 🔄 Gerenciar Processos

### Parar Todos os Processos

```bash
pm2 stop all
```

### Reiniciar

```bash
pm2 restart all
```

### Reload (zero downtime)

```bash
pm2 reload all
```

### Deletar Processo

```bash
pm2 delete secretaria-api
pm2 delete secretaria-frontend
```

## 📦 Atualizar Aplicação

```bash
cd ~/secretaria-online
git pull origin main

# Backend
cd backend
npm install --production
npm run db:migrate
pm2 restart secretaria-api

# Frontend
cd ../frontend
npm install --production
npm run build
pm2 restart secretaria-frontend
```

## 🛡️ Segurança

### Alterar Senhas

1. **Admin da Aplicação** (alterar após primeiro acesso)
2. **Root do MariaDB**:
   ```bash
   sudo mysql -u root -p
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'NOVA_SENHA';
   ```

3. **SMTP** (editar .env):
   ```bash
   nano ~/secretaria-online/backend/.env
   # Alterar SMTP_PASS
   pm2 restart secretaria-api
   ```

### SSL/TLS (HTTPS)

Para produção, instale um certificado SSL:

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d seu.dominio.com
```

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 💾 Backup

### Backup do Banco

```bash
# Manual
mysqldump -u secretaria_user -p secretaria_online > ~/backup_$(date +%Y%m%d).sql

# Com cron (automático - adicione ao crontab):
# 0 2 * * * mysqldump -u secretaria_user -p'senha' secretaria_online > ~/backups/db_$(date +\%Y\%m\%d).sql
```

### Backup de Uploads

```bash
tar -czf ~/uploads_backup_$(date +%Y%m%d).tar.gz ~/secretaria-online/backend/uploads/
```

## 🐛 Troubleshooting

### Erro: "Port already in use"

```bash
# Encontrar processo
sudo lsof -i :3000
sudo lsof -i :5173

# Matar processo
sudo kill -9 <PID>
```

### Erro: "Connection refused" (MariaDB)

```bash
# Iniciar MariaDB
sudo systemctl start mariadb

# Verificar status
sudo systemctl status mariadb
```

### Erro: "npm ERR! code EACCES"

```bash
# Executar com permissões apropriadas
sudo npm install -g pm2
sudo npm install -g serve
```

### Logs de Erro

```bash
# Ver últimas linhas dos logs
pm2 logs secretaria-api | tail -50
pm2 logs secretaria-frontend | tail -50

# Ver logs de sistema
sudo journalctl -u mariadb -n 50
```

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **[INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)** - Guia passo a passo completo
- **[../docs/contextDoc.md](../docs/contextDoc.md)** - Documentação de contexto
- **[../backend/README.md](../backend/README.md)** - Backend específico
- **[../frontend/README.md](../frontend/README.md)** - Frontend específico

## ⚙️ Variáveis de Ambiente

Os scripts criam automaticamente:

### `.env` Backend

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_NAME=secretaria_online
JWT_SECRET=<gerado automaticamente>
SMTP_HOST=<seu servidor SMTP>
```

### `.env` Frontend

```
VITE_API_BASE_URL=http://<IP_VM>:3000/api/v1
```

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs`
2. Execute health check: `bash 06-health-check.sh`
3. Consulte o guia: `cat INSTALLATION_GUIDE.md`
4. Abra issue no GitHub: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

## 📋 Checklist Pós-Instalação

- [ ] Aplicação rodando (pm2 status)
- [ ] Frontend acessível (http://<IP>:5173)
- [ ] Backend respondendo (http://<IP>:3000/health)
- [ ] MariaDB ativo
- [ ] Senha root alterada
- [ ] Senha admin alterada
- [ ] SMTP configurado (se necessário)
- [ ] Backup automático configurado
- [ ] Firewall GCP configurado

## 📞 Informações Úteis

- **Repositório**: https://github.com/CarlosSalesNaturalTec/secretaria_online
- **PM2 Docs**: https://pm2.keymetrics.io/
- **Node.js**: https://nodejs.org/
- **MariaDB**: https://mariadb.org/
- **Express**: https://expressjs.com/
- **React**: https://react.dev/

---

**Última atualização**: 2025-11-11
**Versão**: 1.0.0
