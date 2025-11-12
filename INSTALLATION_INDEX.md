# 📚 ÍNDICE COMPLETO - GUIA DE INSTALAÇÃO SECRETARIA ONLINE

## 🎯 Comece Aqui!

Se está vindo do zero e não sabe por onde começar:

### Para Iniciantes Absolutos:

1. **Passo 0**: [Criar VM no GCP](install-scripts/GCP_VM_SETUP.md) - VM: `secretaria-online-prod` - 10 minutos
2. **Passo 1**: [Quick Start](install-scripts/QUICKSTART.md) - Usuário: `naturalbahia` - 30-40 minutos
3. **Passo 2**: Acessar aplicação em `http://<IP>:5173`

### Se já tem VM pronta:

1. Conectar com: `gcloud compute ssh secretaria-online-prod --zone=us-central1-a`
2. Ir direto para [Quick Start](install-scripts/QUICKSTART.md)
3. Ou seguir [Instalação Detalhada](install-scripts/INSTALLATION_GUIDE.md)

---

## 📖 Documentação Completa

### 🚀 Guias de Instalação

| Documento | Descrição | Tempo | Para Quem |
|-----------|-----------|-------|----------|
| **[GCP_VM_SETUP.md](install-scripts/GCP_VM_SETUP.md)** | Como criar VM no GCP | 15 min | Iniciantes no GCP |
| **[QUICKSTART.md](install-scripts/QUICKSTART.md)** | ⭐ Instalação rápida (recomendado) | 30 min | Todos (começa aqui!) |
| **[INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md)** | Guia detalhado passo a passo | 1-2h | Quem quer entender tudo |
| **[README.md](install-scripts/README.md)** | Documentação dos scripts | 15 min | Referência rápida |

### 🎮 Scripts de Automação

| Script | Função | Quando Usar |
|--------|--------|------------|
| **[quick-install.sh](install-scripts/quick-install.sh)** | Instalação automática completa | Primeira instalação (recomendado) |
| **[01-system-dependencies.sh](install-scripts/01-system-dependencies.sh)** | Instala sistema operacional | Manual/passo a passo |
| **[02-mariadb-setup.sh](install-scripts/02-mariadb-setup.sh)** | Instala MariaDB | Manual/passo a passo |
| **[03-app-setup.sh](install-scripts/03-app-setup.sh)** | Clone e setup app | Manual/passo a passo |
| **[04-configure-env.sh](install-scripts/04-configure-env.sh)** | Configura variáveis de ambiente | Manual/passo a passo |
| **[05-start-app.sh](install-scripts/05-start-app.sh)** | Inicia app com PM2 | Manual/passo a passo |
| **[06-health-check.sh](install-scripts/06-health-check.sh)** | Verifica saúde da app | Após instalação |
| **[manage-app.sh](install-scripts/manage-app.sh)** | Menu de gerenciamento | Operações do dia-a-dia |

### 📋 Documentação da Aplicação

| Documento | Descrição |
|-----------|-----------|
| **[docs/contextDoc.md](docs/contextDoc.md)** | Arquitetura, stack tecnológica, estrutura |
| **[backend/README.md](backend/README.md)** | Documentação específica do backend |
| **[frontend/README.md](frontend/README.md)** | Documentação específica do frontend |
| **[docs/requirements.md](docs/requirements.md)** | Requisitos do projeto |

---

## 🔥 Fluxo de Instalação Recomendado

### OPÇÃO 1: INSTALAÇÃO RÁPIDA (⭐ Recomendado)

Tempo total: **30-40 minutos**

```
1. Criar VM no GCP
   └─> [GCP_VM_SETUP.md](install-scripts/GCP_VM_SETUP.md)

2. Executar quick-install.sh
   └─> [QUICKSTART.md](install-scripts/QUICKSTART.md)

3. Acessar aplicação
   └─> http://<IP>:5173
```

**Comando único:**
```bash
gcloud compute ssh secretaria-online-vm --zone=us-central1-a
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria_online/install-scripts
bash quick-install.sh
```

---

### OPÇÃO 2: INSTALAÇÃO PASSO A PASSO

Tempo total: **1-2 horas**

```
1. Criar VM
   └─> [GCP_VM_SETUP.md](install-scripts/GCP_VM_SETUP.md)

2. Instalar dependências do sistema
   └─> bash 01-system-dependencies.sh

3. Instalar MariaDB
   └─> bash 02-mariadb-setup.sh

4. Clonar e setup app
   └─> bash 03-app-setup.sh

5. Configurar variáveis de ambiente
   └─> bash 04-configure-env.sh

6. Iniciar app
   └─> bash 05-start-app.sh

7. Verificar saúde
   └─> bash 06-health-check.sh
```

**Detalhes**: [INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md)

---

### OPÇÃO 3: INSTALAÇÃO MANUAL (Para Aprender)

Leia [INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md) e execute cada comando manualmente para entender o que está acontecendo.

---

## 🎓 Tutoriais por Tema

### Iniciante no GCP?

1. [Criar conta GCP](https://cloud.google.com/free)
2. [GCP_VM_SETUP.md](install-scripts/GCP_VM_SETUP.md) - Criar VM passo a passo
3. [QUICKSTART.md](install-scripts/QUICKSTART.md) - Instalar aplicação

### Quer entender a arquitetura?

1. [docs/contextDoc.md](docs/contextDoc.md) - Arquitetura completa
2. [backend/README.md](backend/README.md) - Backend em detalhes
3. [frontend/README.md](frontend/README.md) - Frontend em detalhes

### Precisa gerenciar a app em produção?

1. [manage-app.sh](install-scripts/manage-app.sh) - Menu interativo
2. [README.md](install-scripts/README.md) - Referência rápida
3. [INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md) - Troubleshooting

### Quer fazer deployment?

1. [INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md) - Seção Deployment
2. [docs/contextDoc.md](docs/contextDoc.md) - Seção Deployment
3. [backend/README.md](backend/README.md) - Deploy em produção

---

## 📱 Acessar a Aplicação

Após a instalação:

```
Frontend:  http://<IP_DA_VM>:5173
Backend:   http://<IP_DA_VM>:3000
Health:    http://<IP_DA_VM>:3000/health
```

### Credenciais Padrão:

```
Usuário: admin
Senha:   admin123

⚠️ ALTERE IMEDIATAMENTE!
```

### Obter IP da VM:

```bash
gcloud compute instances describe secretaria-online-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

---

## 🛠️ Operações Comuns

### Ver Status

```bash
pm2 status
# ou
bash manage-app.sh  # Opção 1
```

### Ver Logs

```bash
pm2 logs
# ou
bash manage-app.sh  # Opção 2
```

### Parar/Iniciar

```bash
pm2 stop all
pm2 start all
pm2 restart all
```

### Atualizar Aplicação

```bash
cd ~/secretaria-online
git pull origin main
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build
pm2 restart all
```

### Acessar Banco de Dados

```bash
# Menu interativo
bash manage-app.sh  # Opção 12

# Ou direto
mysql -u secretaria_user -p secretaria_online
```

---

## 🔍 Troubleshooting Rápido

### Algo não funciona?

1. **Verifique status**: `pm2 status`
2. **Veja logs**: `pm2 logs`
3. **Health check**: `bash 06-health-check.sh`
4. **Leia seção Troubleshooting**: [INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md#troubleshooting)

### Principais Problemas

| Problema | Solução |
|----------|---------|
| Backend não responde | `pm2 logs secretaria-api` |
| MariaDB não funciona | `sudo systemctl restart mariadb` |
| Porta em uso | `sudo lsof -i :3000` / `sudo kill -9 <PID>` |
| Conexão BD recusada | Verifique `.env` e credenciais |
| Frontend não carrega | `pm2 logs secretaria-frontend` |

**Mais detalhes**: [INSTALLATION_GUIDE.md - Troubleshooting](install-scripts/INSTALLATION_GUIDE.md#troubleshooting)

---

## 💾 Backup

### Backup Manual

```bash
# Banco de dados
mysqldump -u secretaria_user -p secretaria_online > backup_$(date +%Y%m%d).sql

# Uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz ~/secretaria-online/backend/uploads/
```

### Backup Automático (Cron)

Adicione ao crontab:

```bash
# Diário às 2h da manhã
0 2 * * * mysqldump -u secretaria_user -p'senha' secretaria_online > ~/backups/db_$(date +\%Y\%m\%d).sql
```

**Mais detalhes**: [INSTALLATION_GUIDE.md - Backup](install-scripts/INSTALLATION_GUIDE.md#backup)

---

## 🔒 Segurança

### Pós-Instalação Obrigatório

- [ ] Alterar senha do admin
- [ ] Alterar senha root MariaDB
- [ ] Configurar SMTP para produção
- [ ] Instalar certificado SSL

### Recomendado

- [ ] Configurar firewall GCP
- [ ] Configurar backups automáticos
- [ ] Configurar monitoramento
- [ ] Usar SSH keys ao invés de senhas

**Mais detalhes**: [INSTALLATION_GUIDE.md - Segurança](install-scripts/INSTALLATION_GUIDE.md#segurança)

---

## 💡 Dicas Importantes

### Para Desenvolvimento

Use portas locais:
```bash
cd backend && npm run dev      # http://localhost:3000
cd frontend && npm run dev     # http://localhost:5173
```

### Para Produção

Use PM2:
```bash
bash manage-app.sh  # Menu interativo
```

### Salvar Configuração PM2

Após reiniciar:
```bash
pm2 save
pm2 startup  # Configura auto-start no reboot
```

### Logs Persistentes

Verificar `~/.pm2/logs/` para histórico.

---

## 📊 Estrutura de Arquivos

```
secretaria_online/
├── install-scripts/              ⭐ VOCÊ ESTÁ AQUI
│   ├── quick-install.sh          Instalação rápida
│   ├── 01-system-dependencies.sh
│   ├── 02-mariadb-setup.sh
│   ├── 03-app-setup.sh
│   ├── 04-configure-env.sh
│   ├── 05-start-app.sh
│   ├── 06-health-check.sh
│   ├── manage-app.sh             Menu de gerenciamento
│   ├── GCP_VM_SETUP.md           Como criar VM
│   ├── QUICKSTART.md             ⭐ Começar aqui!
│   ├── INSTALLATION_GUIDE.md     Guia detalhado
│   └── README.md                 Referência
│
├── backend/                      Aplicação Node.js
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                     Aplicação React
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── contextDoc.md             ⭐ Leia para arquitetura
│   ├── requirements.md
│   └── api-documentation.md
│
└── INSTALLATION_INDEX.md         ⭐ Este arquivo
```

---

## ⏱️ Tempo Estimado

| Etapa | Tempo |
|-------|-------|
| Criar VM GCP | 10 min |
| Instalação (quick-install.sh) | 30-40 min |
| **Total** | **40-50 min** |

---

## 🆘 Precisa de Ajuda?

### 1️⃣ Troubleshooting

→ [INSTALLATION_GUIDE.md - Troubleshooting](install-scripts/INSTALLATION_GUIDE.md#troubleshooting)

### 2️⃣ Documentação

→ [docs/contextDoc.md](docs/contextDoc.md) - Arquitetura completa

### 3️⃣ Repositório GitHub

→ https://github.com/CarlosSalesNaturalTec/secretaria_online

### 4️⃣ Abrir Issue

→ https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

---

## ✅ Checklist Pós-Instalação

- [ ] Aplicação rodando (`pm2 status`)
- [ ] Frontend acessível (`http://<IP>:5173`)
- [ ] Backend respondendo (`http://<IP>:3000/health`)
- [ ] MariaDB ativo
- [ ] Senha root alterada
- [ ] Senha admin alterada
- [ ] SMTP configurado
- [ ] Firewall GCP configurado
- [ ] Backup automático configurado
- [ ] Monitoramento ativo

---

## 🎉 Próximas Etapas

1. ✅ [Criar VM no GCP](install-scripts/GCP_VM_SETUP.md)
2. ✅ [Quick Start](install-scripts/QUICKSTART.md)
3. ⏭️ Acessar em `http://<IP>:5173`
4. ⏭️ Fazer login com `admin/admin123`
5. ⏭️ Alterar senha
6. ⏭️ Configurar SMTP
7. ⏭️ Fazer backup
8. ⏭️ Configurar SSL
9. ⏭️ Monitorar logs
10. ⏭️ Usar aplicação!

---

## 🔗 Links Úteis

- **GCP Console**: https://console.cloud.google.com
- **Repositório**: https://github.com/CarlosSalesNaturalTec/secretaria_online
- **Node.js Docs**: https://nodejs.org/
- **MariaDB Docs**: https://mariadb.org/
- **PM2 Docs**: https://pm2.keymetrics.io/
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/

---

**Última atualização**: 2025-11-11
**Versão**: 1.0.0
**Status**: ✅ Pronto para uso

---

## 📞 Contato

- 📧 Email: [Seu email]
- 🐙 GitHub: https://github.com/CarlosSalesNaturalTec
- 🌐 Website: [Seu website]

---

**Bem-vindo ao Secretaria Online! 🎉**

Comece por: **[GCP_VM_SETUP.md](install-scripts/GCP_VM_SETUP.md)** ou **[QUICKSTART.md](install-scripts/QUICKSTART.md)**
