# 📦 RESUMO DE DEPLOYMENT - SECRETARIA ONLINE

## ⚡ Instalação em 5 Comandos (Para o Apressado)

```bash
# 1. Conectar à VM GCP (secretaria-online-prod, usuário: naturalbahia)
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# 2. Clonar repositório
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git

# 3. Entrar em diretório
cd secretaria_online/install-scripts

# 4. Executar instalação automática (30-40 minutos)
bash quick-install.sh

# 5. Pronto! Acessar em: http://<IP_VM>:5173
```

---

## 📋 O que foi criado/instalado?

### 🎯 Scripts de Instalação (8 scripts totais)

```
install-scripts/
├── quick-install.sh               ⭐ Instalação rápida (TUDO-EM-UM)
├── 01-system-dependencies.sh      Node.js, npm, PM2, Git
├── 02-mariadb-setup.sh            MariaDB Server
├── 03-app-setup.sh                Clone + npm install
├── 04-configure-env.sh            Variáveis de ambiente + BD
├── 05-start-app.sh                PM2 inicia app
├── 06-health-check.sh             Verifica saúde
└── manage-app.sh                  Menu de gerenciamento
```

### 📚 Documentação (6 arquivos)

```
install-scripts/
├── QUICKSTART.md                  ⭐ Comece aqui! (3 passos)
├── GCP_VM_SETUP.md                Como criar VM no GCP
├── INSTALLATION_GUIDE.md          Guia detalhado completo
├── README.md                      Referência rápida
├── TROUBLESHOOTING.md             Solução de problemas
└── DEPLOYMENT_SUMMARY.md          Este arquivo
```

### 🏠 Documentação Principal

```
docs/
├── contextDoc.md                  Arquitetura completa
├── requirements.md                Requisitos
└── api-documentation.md           Endpoints API
```

---

## 📊 O que foi instalado na VM?

| Componente | Versão | Função |
|-----------|--------|--------|
| **Debian** | 11 Bullseye | Sistema Operacional |
| **Node.js** | 20 LTS | Runtime JavaScript |
| **npm** | 10.x | Package Manager |
| **MariaDB** | 8.0 | Banco de Dados |
| **PM2** | 6.x | Process Manager |
| **Express** | 5.x | Backend Framework |
| **React** | 19.x | Frontend Framework |
| **Vite** | 7.x | Build Tool Frontend |

---

## 🔑 Informações Importantes

### Credenciais Padrão (⚠️ ALTERE!)

```
Admin User:
  Login: admin
  Senha: admin123

MariaDB Root:
  Usuário: root
  Senha: root_password_change_me (configurada no script)

Database User:
  Usuário: secretaria_user
  Senha: secretaria_password_XXXXX (gerada aleatoriamente)
```

### URLs de Acesso

```
Frontend:  http://<IP_DA_VM>:5173
Backend:   http://<IP_DA_VM>:3000
API Health: http://<IP_DA_VM>:3000/health
```

### Obtém o IP da VM

```bash
gcloud compute instances describe secretaria-online-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Ou no GCP Console:
# Compute Engine > Instâncias de VM > coluna "IP externo"
```

---

## 📁 Estrutura de Diretórios na VM

```
/home/usuario/
└── secretaria-online/
    ├── backend/                   Node.js + Express
    │   ├── src/
    │   ├── uploads/               Documentos + Contratos
    │   ├── logs/                  Logs da aplicação
    │   ├── .env                   Variáveis de ambiente
    │   └── package.json
    │
    ├── frontend/                  React + Vite
    │   ├── src/
    │   ├── dist/                  Build compilado
    │   ├── .env                   Variáveis de ambiente
    │   └── package.json
    │
    ├── install-scripts/           ⭐ Scripts de instalação
    │   ├── quick-install.sh
    │   ├── manage-app.sh
    │   └── *.md
    │
    └── docs/                      Documentação
        ├── contextDoc.md
        ├── requirements.md
        └── api-documentation.md
```

---

## 🎮 Operações Comuns (via PM2)

### Ver Status

```bash
pm2 status
pm2 list
pm2 monit
```

### Parar/Iniciar/Reiniciar

```bash
pm2 stop all              # Parar todos
pm2 start all             # Iniciar todos
pm2 restart all           # Reiniciar todos
pm2 reload all            # Reload (zero downtime)
```

### Ver Logs

```bash
pm2 logs                  # Todos
pm2 logs secretaria-api   # Apenas backend
pm2 logs --lines 100      # Últimas 100 linhas
```

### Menu Interativo

```bash
bash ~/secretaria-online/install-scripts/manage-app.sh
```

---

## 🗄️ Operações de Banco de Dados

### Executar Migrations

```bash
cd ~/secretaria-online/backend
npm run db:migrate        # Executar
npm run db:migrate:undo   # Desfazer última
```

### Dados Iniciais

```bash
cd ~/secretaria-online/backend
npm run db:seed           # Executar seeders
npm run db:seed:undo      # Desfazer seeders
npm run db:reset          # Resetar tudo
```

### Acessar MySQL

```bash
# Via Menu (recomendado)
bash ~/secretaria-online/install-scripts/manage-app.sh
# Opção: 12) Acessar MySQL shell

# Ou direto
mysql -u secretaria_user -p secretaria_online
```

---

## ✅ Pós-Instalação Obrigatório

- [ ] Alterar senha admin (Login web)
- [ ] Alterar senha root MariaDB (SSH: `sudo mysql -u root -p`)
- [ ] Verificar saúde: `bash ~/secretaria-online/install-scripts/06-health-check.sh`
- [ ] Configurar SMTP (editar `.env`)
- [ ] Testar acesso via navegador

---

## 🔄 Atualizar Aplicação

```bash
cd ~/secretaria-online

# Atualizar código
git pull origin main

# Instalar dependências
cd backend && npm install --production
cd ../frontend && npm install --production

# Build frontend
npm run build

# Reiniciar
cd ..
pm2 restart all
```

---

## 💾 Backup

### Manual

```bash
# Banco de Dados
mysqldump -u secretaria_user -p secretaria_online > ~/backup_$(date +%Y%m%d).sql

# Uploads
tar -czf ~/uploads_$(date +%Y%m%d).tar.gz ~/secretaria-online/backend/uploads/
```

### Automático (Cron)

```bash
# Adicionar ao crontab
crontab -e

# Colocar:
0 2 * * * mysqldump -u secretaria_user -p'senha' secretaria_online > ~/backups/db_$(date +\%Y\%m\%d).sql
0 3 * * 0 tar -czf ~/backups/uploads_$(date +\%Y\%m\%d).tar.gz ~/secretaria-online/backend/uploads/
```

---

## 🔒 Segurança

### Firewall GCP (Permitir portas)

```bash
# Port 3000 (Backend)
gcloud compute firewall-rules create allow-backend \
  --allow=tcp:3000

# Port 5173 (Frontend)
gcloud compute firewall-rules create allow-frontend \
  --allow=tcp:5173
```

### SSL/TLS (HTTPS)

```bash
# Instalar certificado Let's Encrypt
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d seu.dominio.com

# Configurar nginx como reverse proxy com SSL (não coberto aqui)
```

---

## 🚨 Troubleshooting Rápido

| Problema | Comando |
|----------|---------|
| Backend não responde | `pm2 logs secretaria-api` |
| MariaDB não inicia | `sudo systemctl restart mariadb` |
| Porta em uso | `sudo lsof -i :3000` |
| Verificar saúde | `bash ~/secretaria-online/install-scripts/06-health-check.sh` |
| Ver status completo | `pm2 status` |

**Mais problemas?** → Ver [TROUBLESHOOTING.md](install-scripts/TROUBLESHOOTING.md)

---

## 📞 Contato e Suporte

- **Repositório**: https://github.com/CarlosSalesNaturalTec/secretaria_online
- **Issues**: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues
- **Documentação**: Ver [INSTALLATION_INDEX.md](INSTALLATION_INDEX.md)

---

## 📊 Custo Estimado (GCP)

| Recurso | Custo/Mês |
|---------|-----------|
| VM e2-medium | ~$20-25 |
| Disco SSD 20GB | ~$3-4 |
| Egresso de dados | Variável |
| **Total** | **~$25-30** |

**Dica**: Parar VM quando não usar reduz custo à metade.

---

## 🎉 Sucesso!

Você instalou com sucesso:
- ✅ Node.js 20 LTS
- ✅ MariaDB 8.0
- ✅ Express Backend
- ✅ React Frontend
- ✅ PM2 Process Manager
- ✅ Todas as dependências
- ✅ Banco de dados com dados iniciais

**Próximo**: Acessar em `http://<IP>:5173` e fazer login com `admin/admin123`

---

## 📚 Leitura Recomendada

1. **Começar**: [install-scripts/QUICKSTART.md](install-scripts/QUICKSTART.md)
2. **Entender**: [docs/contextDoc.md](docs/contextDoc.md)
3. **Troubleshoot**: [install-scripts/TROUBLESHOOTING.md](install-scripts/TROUBLESHOOTING.md)
4. **Referência**: [install-scripts/README.md](install-scripts/README.md)
5. **Índice**: [INSTALLATION_INDEX.md](INSTALLATION_INDEX.md)

---

## ⏱️ Timeline de Instalação

```
00:00 - Iniciar quick-install.sh
05:10 - Dependências do sistema instaladas
08:15 - MariaDB instalado
18:45 - Aplicação clonada e dependências instaladas
28:50 - Configuração concluída
30:00 - Aplicação rodando
```

**Total: ~30-40 minutos** ⏱️

---

**Bem-vindo ao Secretaria Online! 🎉**

Documento criado: 2025-11-11 | Versão: 1.0.0
