# 🌐 Configurar VM no Google Cloud Platform (GCP)

Guia passo a passo para criar e configurar a VM Compute Engine no GCP.

## 📋 Pré-requisitos

- ✅ Conta Google Cloud ativa
- ✅ Projeto GCP criado
- ✅ Billing habilitado
- ✅ Permissões necessárias

## 🚀 Passo 1: Criar Projeto GCP (se ainda não tiver)

### Via Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique no menu de projeto (topo esquerdo)
3. Clique em **NOVO PROJETO**
4. Preencha:
   - **Nome**: `secretaria-online`
   - **ID do Projeto**: gerado automaticamente (ou customize)
   - **Organização**: deixe em branco ou selecione sua org
5. Clique **CRIAR**
6. Aguarde a criação (pode levar alguns segundos)
7. Selecione o novo projeto

### Via gcloud CLI

```bash
# Criar projeto
gcloud projects create secretaria-online --name="Secretaria Online"

# Definir como projeto padrão
gcloud config set project secretaria-online
```

---

## 🚀 Passo 2: Habilitar API Compute Engine

### Via Console

1. No menu, vá para **APIs e Serviços** → **Biblioteca**
2. Busque por "Compute Engine API"
3. Clique no resultado
4. Clique em **ATIVAR**
5. Aguarde a ativação

### Via gcloud CLI

```bash
gcloud services enable compute.googleapis.com
```

---

## 🚀 Passo 3: Configurar Billing

### Via Console

1. Vá para **Faturamento** → **Contas de Faturamento**
2. Se não tiver uma conta, clique em **CRIAR CONTA DE FATURAMENTO**
3. Siga o assistente (adicionar método de pagamento)
4. Volte para o projeto
5. Vá para **Faturamento** → **Definir uma conta de faturamento**
6. Selecione a conta criada
7. Clique **DEFINIR CONTA DE FATURAMENTO**

---

## 🚀 Passo 4: Criar Instância VM

### Via Console (Interface Gráfica)

1. No menu lateral, vá para **Compute Engine** → **Instâncias de VM**
2. Clique em **CRIAR INSTÂNCIA**
3. Preencha os dados:

#### Seção: Configurações Básicas

| Campo | Valor |
|-------|-------|
| **Nome** | `secretaria-online-prod` |
| **Região** | `us-central1` (recomendado) |
| **Zona** | `us-central1-a` |

#### Seção: Configuração de Máquina

| Campo | Valor |
|-------|-------|
| **Série de Máquinas** | `General purpose (E2)` |
| **Tipo de Máquina** | `e2-medium` (2 vCPU, 4 GB RAM) |

**Estimativa de custo**: ~$25-30/mês

#### Seção: Disco de Inicialização

1. Clique em **ALTERAR**
2. Defina:
   - **Sistema Operacional**: `Debian`
   - **Versão**: `Debian 11 Bullseye` (versão atual)
   - **Tipo de disco**: `SSD persistente estável`
   - **Tamanho**: `20 GB`
3. Clique em **SELECIONAR**

#### Seção: Firewall

✅ Marque ambas:
- [ ] **Permitir tráfego HTTP**
- [ ] **Permitir tráfego HTTPS**

4. Clique em **CRIAR**

### Via gcloud CLI

```bash
# Criar instância
gcloud compute instances create secretaria-online-prod \
  --machine-type=e2-medium \
  --zone=us-central1-a \
  --image-family=debian-11 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-ssd \
  --tags=http-server,https-server

# Aguarde a criação (1-2 minutos)
```

---

## 🚀 Passo 5: Conectar à VM

### Opção 1: Via Google Cloud Console (Mais Fácil)

1. Vá para **Compute Engine** → **Instâncias de VM**
2. Procure por `secretaria-online-prod`
3. Na coluna **Conexão**, clique no botão **SSH**
4. Aguarde abrir terminal SSH no navegador

### Opção 2: Via gcloud CLI

```bash
gcloud compute ssh secretaria-online-prod --zone=us-central1-a
```

### Opção 3: Via SSH Local

```bash
# Primeiro, obtenha o IP externo
gcloud compute instances describe secretaria-online-prod \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Copie o IP e conecte
ssh usuario@<IP_EXTERNO>

# Nota: Você precisa configurar SSH keys no GCP (Cloud Shell faz isso automaticamente)
```

---

## 🔧 Passo 6: Configurar SSH Keys (Opcional)

Para conectar sem passar pelo Console, configure SSH:

### Via Google Cloud Console

1. Vá para **Compute Engine** → **Metadados**
2. Clique na aba **Chaves SSH**
3. Clique em **ADICIONAR CHAVE SSH**
4. Gere uma chave em sua máquina local:

```bash
# No seu PC/Mac local
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gcp-key

# Copie a chave pública
cat ~/.ssh/gcp-key.pub
```

5. Cole a chave pública no Console GCP
6. Clique em **SALVAR**

Agora você pode conectar diretamente:

```bash
ssh -i ~/.ssh/gcp-key seu_usuario@IP_EXTERNO
```

---

## 🔒 Passo 7: Configurar Regras de Firewall

### Via Console

1. Vá para **VPC network** → **Firewalls e regras de proteção contra DDoS** → **Firewalls**
2. Clique em **CRIAR REGRA DE FIREWALL**
3. Preencha:

#### Para API Backend (Porta 3000)

| Campo | Valor |
|-------|-------|
| **Nome** | `allow-backend-api` |
| **Direção do tráfego** | `Entrada` |
| **Ação se corresponder** | `Permitir` |
| **Protocolos** | TCP |
| **Portas** | `3000` |
| **IPs de origem** | `0.0.0.0/0` (qualquer um) |

#### Para Frontend (Porta 5173)

| Campo | Valor |
|-------|-------|
| **Nome** | `allow-frontend` |
| **Direção do tráfego** | `Entrada` |
| **Ação se corresponder** | `Permitir` |
| **Protocolos** | TCP |
| **Portas** | `5173` |
| **IPs de origem** | `0.0.0.0/0` |

### Via gcloud CLI

```bash
# Permitir Backend (3000)
gcloud compute firewall-rules create allow-backend-api \
  --allow=tcp:3000 \
  --target-tags=backend

# Permitir Frontend (5173)
gcloud compute firewall-rules create allow-frontend \
  --allow=tcp:5173 \
  --target-tags=frontend
```

---

## 📊 Passo 8: Obter IP Externo

### Via Console

1. Vá para **Compute Engine** → **Instâncias de VM**
2. Procure por `secretaria-online-vm`
3. Na coluna **IP externo**, copie o IP

### Via CLI

```bash
gcloud compute instances describe secretaria-online-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Exemplo de saída:
# 35.184.213.146
```

---

## ✅ Verificação Pós-Criação

Após criar a VM, verifique:

```bash
# Conectar à VM
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Verificar SO
cat /etc/os-release

# Verificar CPU e RAM
nproc
free -h

# Verificar Disco
df -h

# Sair
exit
```

---

## 💡 Próximos Passos

1. ✅ VM criada e acessível
2. ⏭️ Ir para [QUICKSTART.md](QUICKSTART.md)
3. ⏭️ Executar `quick-install.sh`

---

## 🛠️ Gerenciar VM

### Parar VM (Economizar Custos)

```bash
gcloud compute instances stop secretaria-online-prod --zone=us-central1-a
```

### Iniciar VM

```bash
gcloud compute instances start secretaria-online-prod --zone=us-central1-a
```

### Deletar VM (Desligar Permanentemente)

```bash
gcloud compute instances delete secretaria-online-prod --zone=us-central1-a
```

### Ver Detalhes da VM

```bash
gcloud compute instances describe secretaria-online-prod --zone=us-central1-a
```

---

## 📈 Monitorar Custos

### Via Console

1. Vá para **Faturamento**
2. Veja relatórios de uso
3. Configure alertas (opcional)

### Estimativas

| Recurso | Custo Mensal |
|---------|--------------|
| Compute Engine e2-medium | ~$20-25 |
| Disco SSD 20GB | ~$3-4 |
| Egresso (downloads) | Variável |
| **Total Estimado** | **~$25-30/mês** |

Para economizar:
- Parar VM quando não usar
- Usar `f1-micro` (menor custo, mas mais lento)
- Monitorar egresso de dados

---

## 🔐 Segurança

### Recomendações

1. **SSH Keys**: Use ao invés de senhas
2. **Firewall**: Restrinja acesso apenas às portas necessárias
3. **Atualizações**: Mantenha SO atualizado
4. **Backups**: Configure snapshots regulares

### Snapshot de Disco

```bash
# Criar snapshot
gcloud compute disks snapshot secretaria-online-prod \
  --snapshot-names=secretaria-backup-$(date +%Y%m%d)

# Listar snapshots
gcloud compute snapshots list

# Criar VM de snapshot (para restore)
gcloud compute instances create vm-restore \
  --source-snapshot=secretaria-backup-YYYYMMDD
```

---

## 📚 Documentação Oficial

- [Google Cloud Compute Engine Docs](https://cloud.google.com/compute/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Pricing Calculator](https://cloud.google.com/pricing/calculator)

---

## 🆘 Troubleshooting

### Erro: "Quota exceeded"

Significa você atingiu limite de recursos. Solicite aumento em **Quotas**.

### Erro: "Permission denied"

Verifique permissões de IAM:
1. Vá para **IAM & Admin** → **IAM**
2. Certifique-se que tem role `Compute Admin` ou similar

### Não consegue conectar via SSH

1. Verifique SSH keys estão configuradas
2. Verifique firewall permite SSH (porta 22)
3. Tente conectar via Console (mais fácil)

---

**Próximo**: [QUICKSTART.md](QUICKSTART.md) - Instalar a aplicação
