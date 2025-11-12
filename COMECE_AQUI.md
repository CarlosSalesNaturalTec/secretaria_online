# 🚀 COMECE AQUI - SECRETARIA ONLINE

## ⚡ 5 Passos Rápidos para Instalar

### 1️⃣ Conectar à VM

```bash
gcloud compute ssh secretaria-online-prod --zone=us-central1-a
```

**Ou via SSH:**
```bash
ssh naturalbahia@<IP_DA_VM>
```

---

### 2️⃣ Clonar Repositório

```bash
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria_online/install-scripts
```

---

### 3️⃣ Executar Instalação

```bash
bash quick-install.sh
```

⏱️ **Tempo**: 30-40 minutos

O script vai:
- ✅ Instalar Node.js 20 LTS
- ✅ Instalar MariaDB 8.0
- ✅ Clonar aplicação
- ✅ Instalar dependências
- ✅ Configurar banco de dados
- ✅ Iniciar com PM2

---

### 4️⃣ Obter IP Externo

```bash
gcloud compute instances describe secretaria-online-prod \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

Copie o IP retornado.

---

### 5️⃣ Acessar Aplicação

Abra no navegador:

```
http://<IP_OBTIDO_NO_PASSO_4>:5173
```

**Login padrão**:
- Usuário: `admin`
- Senha: `admin123`

⚠️ **Altere a senha imediatamente!**

---

## 📚 Documentação Disponível

| Documento | Para |
|-----------|------|
| [install-scripts/CREDENTIALS.md](install-scripts/CREDENTIALS.md) | Credenciais e acesso |
| [install-scripts/QUICKSTART.md](install-scripts/QUICKSTART.md) | Instalação rápida |
| [install-scripts/INSTALLATION_GUIDE.md](install-scripts/INSTALLATION_GUIDE.md) | Guia detalhado |
| [install-scripts/GCP_VM_SETUP.md](install-scripts/GCP_VM_SETUP.md) | Criar VM no GCP |
| [install-scripts/README.md](install-scripts/README.md) | Referência de scripts |
| [install-scripts/TROUBLESHOOTING.md](install-scripts/TROUBLESHOOTING.md) | Solucionar problemas |
| [docs/contextDoc.md](docs/contextDoc.md) | Arquitetura da aplicação |

---

## 🎮 Comandos Importantes Pós-Instalação

### Ver Status

```bash
pm2 status
```

### Ver Logs

```bash
pm2 logs
```

### Parar/Iniciar

```bash
pm2 stop all      # Parar
pm2 start all     # Iniciar
pm2 restart all   # Reiniciar
```

### Menu de Gerenciamento

```bash
bash ~/secretaria-online/install-scripts/manage-app.sh
```

### Verificar Saúde

```bash
bash ~/secretaria-online/install-scripts/06-health-check.sh
```

---

## 🔑 Informações da VM

```
VM:         secretaria-online-prod
Usuário:    naturalbahia
Região:     us-central1-a
Tipo:       e2-medium (2 vCPU, 4GB RAM)
SO:         Debian 11 Bullseye
```

---

## ✅ Checklist Pós-Instalação

- [ ] Aplicação acessível em `http://<IP>:5173`
- [ ] Login funcionando
- [ ] Senha admin alterada
- [ ] Health check passou
- [ ] MariaDB ativo
- [ ] PM2 rodando ambos processos
- [ ] Logs sem erros críticos
- [ ] Firewall GCP configurado

---

## 🆘 Se Algo der Errado

1. **Ver logs do backend**:
   ```bash
   pm2 logs secretaria-api
   ```

2. **Verificar saúde**:
   ```bash
   bash ~/secretaria-online/install-scripts/06-health-check.sh
   ```

3. **Consultar guia de troubleshooting**:
   - [install-scripts/TROUBLESHOOTING.md](install-scripts/TROUBLESHOOTING.md)

4. **Reportar issue**:
   - https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

---

## 📊 Arquivos Criados

### Scripts de Instalação (8 arquivos)
- `quick-install.sh` - Instalação automática completa
- `01-system-dependencies.sh` - Dependências do sistema
- `02-mariadb-setup.sh` - MariaDB
- `03-app-setup.sh` - Clone e npm install
- `04-configure-env.sh` - Variáveis de ambiente
- `05-start-app.sh` - Inicia com PM2
- `06-health-check.sh` - Verifica saúde
- `manage-app.sh` - Menu de gerenciamento

### Documentação (7 arquivos)
- `CREDENTIALS.md` - Guia de acesso
- `QUICKSTART.md` - Início rápido
- `INSTALLATION_GUIDE.md` - Guia completo
- `GCP_VM_SETUP.md` - Setup da VM
- `README.md` - Referência
- `TROUBLESHOOTING.md` - Solução de problemas
- `CHECKLIST.md` - Checklist

### Índices
- `INSTALLATION_INDEX.md` - Índice principal
- `DEPLOYMENT_SUMMARY.md` - Resumo
- `AJUSTES_REALIZADOS.md` - Alterações efetuadas
- `COMECE_AQUI.md` - Este arquivo

---

## 💡 Dicas

### Para Desenvolvimento Local

Se estiver desenvolvendo localmente (não em produção):

```bash
# Backend
cd backend && npm run dev      # http://localhost:3000

# Frontend (outro terminal)
cd frontend && npm run dev     # http://localhost:5173
```

### Atualizar Aplicação

```bash
cd ~/secretaria-online
git pull origin main
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build
pm2 restart all
```

### Fazer Backup

```bash
# Banco de dados
mysqldump -u secretaria_user -p secretaria_online > ~/backup_$(date +%Y%m%d).sql

# Uploads
tar -czf ~/uploads_$(date +%Y%m%d).tar.gz ~/secretaria-online/backend/uploads/
```

---

## 🎯 Próximas Etapas

1. ✅ Instalar usando `quick-install.sh`
2. ✅ Acessar e fazer login
3. ✅ Alterar senha admin
4. ✅ Explorar aplicação
5. ✅ Ler documentação técnica
6. ✅ Configurar SMTP se necessário
7. ✅ Configurar SSL/TLS
8. ✅ Fazer backups regulares
9. ✅ Monitorar logs
10. ✅ Usar em produção!

---

## 📞 Contato e Suporte

- **Repositório**: https://github.com/CarlosSalesNaturalTec/secretaria_online
- **Issues**: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues
- **Documentação**: `~/secretaria-online/install-scripts/`

---

## ⏱️ Tempo Total

```
Criar VM:        ~10 minutos
Instalar app:    ~30-40 minutos
Primeiro acesso: ~5 minutos
─────────────────────────────
Total:           ~45-55 minutos
```

---

**Bem-vindo ao Secretaria Online! 🎉**

**Próximo**: Execute `bash quick-install.sh` na VM
