# ⚡ Quick Start - Instalação em 3 Passos

## Instalação Rápida em uma VM GCP (Debian 11)

### 📦 Pré-requisitos

- ✅ VM GCP Compute Engine e2-medium criada
- ✅ SO: Debian 11 Bullseye
- ✅ Acesso SSH à VM
- ✅ ~30 minutos de tempo

---

## 🚀 Passo 1: Conectar à VM (1 minuto)

```bash
# Via Google Cloud Console ou Cloud Shell
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Ou direto SSH se tiver chaves configuradas
ssh naturalbahia@IP_DA_VM
```

---

## 🚀 Passo 2: Clonar Repositório (2 minutos)

```bash
# Clone o repositório
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git

# Entre no diretório de scripts
cd secretaria_online/install-scripts

# Verifique os scripts
ls -la *.sh
```

---

## 🚀 Passo 3: Executar Instalação Automática (30-40 minutos)

```bash
# Torne executável
chmod +x quick-install.sh

# Execute
bash quick-install.sh
```

### ⏳ O que vai acontecer:

1. **Sistema** (5-10 min)
   - Node.js 20 LTS
   - npm, Git, PM2

2. **Banco de Dados** (3-5 min)
   - MariaDB Server
   - Configurações de segurança

3. **Aplicação** (10-15 min)
   - Clone do repositório
   - npm install (backend + frontend)
   - Build do frontend

4. **Configuração** (5 min)
   - Variáveis de ambiente
   - Banco de dados
   - Migrations

5. **Inicialização** (2 min)
   - PM2 inicia backend
   - PM2 inicia frontend

### 📊 Progresso esperado:

```
[PASSO 1/7] Instalando dependências do sistema... ✅
[PASSO 2/7] Instalando MariaDB... ✅
[PASSO 3/7] Clonando repositório... ✅
[PASSO 4/7] Instalando dependências da aplicação... ✅
[PASSO 5/7] Preparando aplicação... ✅
[PASSO 6/7] Configurando variáveis de ambiente... ✅
[PASSO 7/7] Configurando banco de dados... ✅

✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
```

---

## ✨ Após a Instalação

### 1️⃣ Obter IP Externo da VM

```bash
# No Google Cloud Console:
# Compute Engine > Instâncias de VM > coluna "IP externo"

# Ou via CLI:
gcloud compute instances describe secretaria-online-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### 2️⃣ Acessar Aplicação

```
Substitua <IP_DA_VM> pelo IP obtido acima:

📱 Frontend:  http://<IP_DA_VM>:5173
🔌 API:      http://<IP_DA_VM>:3000
💚 Health:   http://<IP_DA_VM>:3000/health
```

### 3️⃣ Fazer Login

```
Usuário: admin
Senha:   admin123

⚠️ ALTERE A SENHA IMEDIATAMENTE!
```

---

## 🎮 Comandos Úteis Pós-Instalação

### Ver Status

```bash
# Status PM2
pm2 status

# Ou menu interativo
bash ~/secretaria-online/install-scripts/manage-app.sh
```

### Ver Logs

```bash
pm2 logs
```

### Health Check

```bash
bash ~/secretaria-online/install-scripts/06-health-check.sh
```

### Parar/Iniciar

```bash
pm2 stop all      # Parar
pm2 start all     # Iniciar
pm2 restart all   # Reiniciar
```

---

## 🔧 Se Algo der Errado

### Script falhando?

1. Leia a mensagem de erro com atenção
2. Verifique logs: `pm2 logs`
3. Execute novamente: `bash quick-install.sh`
4. Se persistir, rode passo a passo:

```bash
bash 01-system-dependencies.sh
bash 02-mariadb-setup.sh
bash 03-app-setup.sh
bash 04-configure-env.sh
bash 05-start-app.sh
bash 06-health-check.sh
```

### Banco de dados não responde?

```bash
# Iniciar MariaDB
sudo systemctl start mariadb

# Verificar status
sudo systemctl status mariadb
```

### Porta em uso?

```bash
# Matar processo
sudo lsof -i :3000
sudo kill -9 <PID>

# Ou alterar porta em .env
nano ~/secretaria-online/backend/.env
```

---

## 📚 Próximos Passos

Após tudo funcionando:

### ✅ Segurança

- [ ] Alterar senha do admin
- [ ] Alterar senha root MariaDB
- [ ] Configurar SMTP para produção
- [ ] Instalar certificado SSL
- [ ] Configurar firewall GCP

### ✅ Backup

- [ ] Configurar backup automático BD
- [ ] Configurar backup de uploads
- [ ] Testar restore

### ✅ Monitoramento

- [ ] Monitorar logs
- [ ] Configurar alertas
- [ ] Verificar disk space
- [ ] Configurar rotação de logs

### 📖 Leitura

- [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - Guia completo
- [README.md](README.md) - Documentação dos scripts
- [../docs/contextDoc.md](../docs/contextDoc.md) - Arquitetura
- [../backend/README.md](../backend/README.md) - Backend
- [../frontend/README.md](../frontend/README.md) - Frontend

---

## 💡 Dicas

### Para Desenvolvimento

Se estiver desenvolvendo (não em produção):

```bash
# Backend em modo dev
cd ~/secretaria-online/backend
npm run dev

# Frontend em modo dev
cd ~/secretaria-online/frontend
npm run dev
```

### Atualizar Aplicação

```bash
cd ~/secretaria-online
git pull origin main

# Reinstalar deps
cd backend && npm install --production
cd ../frontend && npm install --production

# Rebuild frontend
npm run build

# Restart
pm2 restart all
```

### Gerenciar Banco

```bash
# Menu interativo
bash ~/secretaria-online/install-scripts/manage-app.sh
# Opção 12: Acessar MySQL shell
```

---

## 🎉 Sucesso!

Você instalou com sucesso a **Secretaria Online** em uma VM do GCP!

### Resumo do que foi feito:

✅ Sistema operacional atualizado
✅ Node.js 20 LTS instalado
✅ MariaDB instalado e configurado
✅ Aplicação clonada do GitHub
✅ Dependências npm instaladas
✅ Frontend compilado
✅ Banco de dados criado
✅ Migrations executadas
✅ Seeders executados
✅ PM2 configurado
✅ Auto-start no reboot habilitado

### Agora você pode:

- 🌐 Acessar frontend no navegador
- 📱 Fazer login com admin/admin123
- 🔧 Gerenciar aplicação via PM2
- 📊 Monitorar logs em tempo real
- 🗄️ Gerenciar banco de dados
- 🔄 Atualizar aplicação facilmente

---

**Documentação**: Ver [README.md](README.md) para mais detalhes
**Problemas**: Ver [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) seção Troubleshooting
**Suporte**: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

---

**Bem-vindo ao Secretaria Online! 🎉**
