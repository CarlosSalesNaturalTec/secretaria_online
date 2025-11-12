# ⭐ LEIA ISTO PRIMEIRO

## 🎯 Você está aqui!

Se recebeu estes scripts, você já tem:
- ✅ VM GCP criada (`secretaria-online-prod`)
- ✅ Acesso SSH como usuário `naturalbahia`
- ✅ Tudo pronto para instalar

---

## 🚀 3 Passos Únicos

### Passo 1: Conectar à VM
```bash
gcloud compute ssh secretaria-online-prod --zone=us-central1-a
```

### Passo 2: Executar Script
```bash
cd secretaria_online/install-scripts
bash quick-install.sh
```

### Passo 3: Acessar
```
http://<IP_DA_VM>:5173
Usuário: admin
Senha: admin123 (ALTERE!)
```

---

## 📚 Qual Arquivo Ler?

**Se é a primeira vez:**
→ Leia [COMECE_AQUI.md](COMECE_AQUI.md)

**Se precisa de credenciais:**
→ Leia [CREDENTIALS.md](CREDENTIALS.md)

**Se quer entender tudo:**
→ Leia [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

**Se está com problema:**
→ Leia [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Se quer criar VM:**
→ Leia [GCP_VM_SETUP.md](GCP_VM_SETUP.md)

---

## 📁 Estrutura

```
install-scripts/
├── 00-LEIA-PRIMEIRO.md              ← Você está aqui!
├── COMECE_AQUI.md                   ← Leia depois
├── CREDENTIALS.md                   ← Credenciais
├── quick-install.sh                 ← Execute isto
├── manage-app.sh                    ← Gerenciador
└── [outros arquivos...]
```

---

## ⚡ Começar AGORA

```bash
# Conectar
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Instalar
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria_online/install-scripts
bash quick-install.sh
```

⏱️ **30-40 minutos depois:** Aplicação pronta!

---

## 📱 Informações Rápidas

| Info | Valor |
|------|-------|
| **VM** | secretaria-online-prod |
| **Usuário** | naturalbahia |
| **Zona** | us-central1-a |
| **Login Admin** | admin / admin123 |
| **URL Frontend** | http://\<IP\>:5173 |
| **URL Backend** | http://\<IP\>:3000 |

---

**Próximo**: [COMECE_AQUI.md](COMECE_AQUI.md)
