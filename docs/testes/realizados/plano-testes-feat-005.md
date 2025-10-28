# PLANO DE TESTES - feat-005: Configurar ESLint e Prettier

**Feature:** feat-005 - Configurar ESLint e Prettier
**Grupo:** Setup e Infraestrutura
**Data de criação:** 2025-10-25
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Verificar se o Node.js e npm estão instalados
node --version
npm --version

# Navegar para a pasta do projeto
cd secretaria_online
```

**Esperado:** Node.js v20+ e npm v10+ instalados

### Dependências Instaladas

- [ ] ESLint instalado no backend
- [ ] Prettier instalado no backend
- [ ] ESLint instalado no frontend
- [ ] Prettier instalado no frontend

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Verificar Instalação do ESLint no Backend

**Objetivo:** Verificar se o ESLint foi instalado corretamente no backend

**Passos:**
1. Navegar para a pasta do backend
   ```bash
   cd backend
   ```
2. Verificar se o ESLint está listado nas devDependencies
   ```bash
   npm list eslint
   ```
3. Verificar se os plugins do Prettier estão instalados
   ```bash
   npm list prettier eslint-config-prettier eslint-plugin-prettier
   ```

**Resultado Esperado:**
- ✓ ESLint aparece nas dependências de desenvolvimento
- ✓ Prettier e plugins do ESLint instalados
- ✓ Versões corretas exibidas

**Como verificar:**
- Comando `npm list` mostra todas as dependências instaladas
- Verificar no arquivo `package.json` a presença dos pacotes

**Resultado Indesejado:**
- ✗ Pacotes não instalados
- ✗ Versões incompatíveis
- ✗ Erros de dependências

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Verificar Instalação do ESLint no Frontend

**Objetivo:** Verificar se o ESLint foi instalado corretamente no frontend

**Passos:**
1. Navegar para a pasta do frontend
   ```bash
   cd ../frontend
   ```
2. Verificar se o ESLint está listado nas devDependencies
   ```bash
   npm list eslint
   ```
3. Verificar se os plugins do Prettier e TypeScript estão instalados
   ```bash
   npm list prettier eslint-config-prettier eslint-plugin-prettier typescript-eslint
   ```

**Resultado Esperado:**
- ✓ ESLint aparece nas dependências de desenvolvimento
- ✓ Prettier, plugins do ESLint e TypeScript ESLint instalados
- ✓ Versões corretas exibidas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Executar Lint no Backend

**Objetivo:** Verificar se o comando de lint funciona corretamente no backend

**Passos:**
1. Navegar para a pasta do backend
   ```bash
   cd backend
   ```
2. Executar o comando de lint
   ```bash
   npm run lint
   ```

**Resultado Esperado:**
- ✓ Comando executa sem erros de configuração
- ✓ Se houver problemas no código, eles são exibidos de forma clara
- ✓ Exit code 0 se não houver problemas, ou código de erro se houver

**Como verificar:**
- Observar a saída do comando no terminal
- Verificar se mensagens de erro são claras e específicas

**Resultado Indesejado:**
- ✗ Erro de configuração do ESLint
- ✗ Arquivo .eslintrc.json não encontrado
- ✗ Comandos do ESLint não funcionam

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Executar Lint no Frontend

**Objetivo:** Verificar se o comando de lint funciona corretamente no frontend

**Passos:**
1. Navegar para a pasta do frontend
   ```bash
   cd ../frontend
   ```
2. Executar o comando de lint
   ```bash
   npm run lint
   ```

**Resultado Esperado:**
- ✓ Comando executa sem erros de configuração
- ✓ Regras TypeScript e React Hooks são aplicadas
- ✓ Mensagens de erro/warning são claras

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Executar Formatação no Backend

**Objetivo:** Verificar se o Prettier formata arquivos corretamente no backend

**Passos:**
1. Navegar para a pasta do backend
   ```bash
   cd backend
   ```
2. Verificar formatação sem modificar arquivos
   ```bash
   npm run format:check
   ```
3. Se houver arquivos não formatados, formatar
   ```bash
   npm run format
   ```

**Resultado Esperado:**
- ✓ Comando format:check identifica arquivos não formatados
- ✓ Comando format formata arquivos corretamente
- ✓ Formatação respeita configurações do .prettierrc

**Como verificar:**
- Observar quais arquivos foram modificados
- Verificar se a formatação segue as regras (single quotes, semicolons, etc.)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Executar Formatação no Frontend

**Objetivo:** Verificar se o Prettier formata arquivos corretamente no frontend

**Passos:**
1. Navegar para a pasta do frontend
   ```bash
   cd ../frontend
   ```
2. Verificar formatação sem modificar arquivos
   ```bash
   npm run format:check
   ```
3. Se houver arquivos não formatados, formatar
   ```bash
   npm run format
   ```

**Resultado Esperado:**
- ✓ Comando format:check funciona corretamente
- ✓ Comando format formata arquivos TypeScript/TSX
- ✓ Formatação consistente com .prettierrc

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Correção Automática de Problemas (Backend)

**Objetivo:** Verificar se o ESLint consegue corrigir problemas automaticamente

**Passos:**
1. Navegar para a pasta do backend
   ```bash
   cd backend
   ```
2. Executar correção automática
   ```bash
   npm run lint:fix
   ```

**Resultado Esperado:**
- ✓ Comando executa sem erros
- ✓ Problemas que podem ser corrigidos automaticamente são resolvidos
- ✓ Lista de problemas corrigidos é exibida

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Correção Automática de Problemas (Frontend)

**Objetivo:** Verificar se o ESLint consegue corrigir problemas automaticamente no frontend

**Passos:**
1. Navegar para a pasta do frontend
   ```bash
   cd ../frontend
   ```
2. Executar correção automática
   ```bash
   npm run lint:fix
   ```

**Resultado Esperado:**
- ✓ Comando executa sem erros
- ✓ Problemas corrigíveis são resolvidos
- ✓ Código TypeScript/React formatado corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO DE REGRAS

### Teste 9: Validar Regras do ESLint - Backend

**Objetivo:** Verificar se as regras do ESLint estão sendo aplicadas corretamente

**Método:** Criar arquivo de teste com código que viola regras

**Passos:**
1. Criar arquivo `backend/src/test-eslint-rules.js` com o seguinte conteúdo:
   ```javascript
   // Arquivo de teste para validar regras do ESLint

   var teste = "usando var ao invés de const/let";  // Deve dar erro: no-var
   const semUso = 'variável não utilizada';  // Deve dar warning
   console.log(teste == "teste");  // Deve dar erro: eqeqeq (usar ===)

   function semEspacos(a,b){return a+b}  // Deve dar erro de formatação
   ```
2. Executar lint
   ```bash
   cd backend
   npm run lint
   ```

**Resultado Esperado:**
- ✓ Erro ao usar `var` (regra no-var)
- ✓ Warning para variável não utilizada
- ✓ Erro ao usar `==` ao invés de `===` (regra eqeqeq)
- ✓ Erros de formatação (espaços, chaves)

**Limpeza:**
```bash
# Remover arquivo de teste após validação
rm backend/src/test-eslint-rules.js
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Validar Regras do ESLint - Frontend (TypeScript)

**Objetivo:** Verificar se as regras do TypeScript ESLint estão sendo aplicadas

**Método:** Criar componente de teste com código que viola regras

**Passos:**
1. Criar arquivo `frontend/src/test-eslint-rules.tsx` com:
   ```tsx
   import React from 'react';

   // Teste de regras TypeScript ESLint
   const TestComponent = () => {
     const unusedVar = 'não usado';  // Warning
     const anyType: any = 'evitar any';  // Warning: no-explicit-any

     // useEffect sem dependências declaradas
     React.useEffect(() => {
       console.log(anyType);
     }, []);  // Warning: exhaustive-deps

     return <div>Test</div>
   };

   export default TestComponent;
   ```
2. Executar lint
   ```bash
   cd frontend
   npm run lint
   ```

**Resultado Esperado:**
- ✓ Warning para variável não utilizada
- ✓ Warning para uso de `any`
- ✓ Warning para dependências do useEffect

**Limpeza:**
```bash
# Remover arquivo de teste
rm frontend/src/test-eslint-rules.tsx
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 11: Verificar Arquivos de Configuração

**Objetivo:** Validar que todos os arquivos de configuração existem e estão corretos

**Verificar:**
- ✓ Arquivo `backend/eslint.config.js` existe (Flat Config - ESLint v9+)
- ✓ Arquivo `frontend/eslint.config.js` existe (Flat Config - ESLint v9+)
- ✓ Arquivo `.prettierrc` na raiz existe e é válido JSON
- ✓ Arquivo `.prettierignore` na raiz existe

**Como verificar:**
```bash
# Verificar se arquivos existem
ls backend/eslint.config.js
ls frontend/eslint.config.js
ls .prettierrc
ls .prettierignore

# Validar sintaxe dos arquivos de configuração ESLint (JavaScript)
node -e "require('./backend/eslint.config.js'); console.log('✓ backend/eslint.config.js válido')"
node -e "import('./frontend/eslint.config.js').then(() => console.log('✓ frontend/eslint.config.js válido'))"

# Validar JSON do Prettier
node -e "console.log(JSON.parse(require('fs').readFileSync('.prettierrc')))"
```

**Observação:** O projeto usa o formato **Flat Config** do ESLint v9+ (`eslint.config.js`) em vez do formato legado (`.eslintrc.json`). Este é o formato recomendado e futuro do ESLint.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Verificar Compatibilidade ESLint + Prettier

**Objetivo:** Garantir que ESLint e Prettier não entram em conflito

**Passos:**
1. Formatar um arquivo com Prettier
2. Executar lint no mesmo arquivo
3. Verificar se não há conflitos

**Resultado Esperado:**
- ✓ Prettier formata o arquivo
- ✓ ESLint não reporta erros de formatação após formatação com Prettier
- ✓ Regras do ESLint e Prettier estão alinhadas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📖 TESTES DE DOCUMENTAÇÃO

### Teste 13: Verificar Documentação no README.md

**Objetivo:** Validar que a documentação está completa e correta

**Checklist de Verificação:**

- [ ] Seção "Qualidade de Código" existe no README.md
- [ ] Comandos do backend estão documentados (lint, lint:fix, format, format:check)
- [ ] Comandos do frontend estão documentados
- [ ] Instruções de integração com VS Code estão claras
- [ ] Regras principais estão listadas
- [ ] Exemplo de configuração de pre-commit hooks está presente

**Como verificar:**
- Ler o arquivo README.md
- Seguir as instruções passo a passo
- Verificar se comandos funcionam conforme descrito

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Verificar Atualização do backlog.json

**Objetivo:** Confirmar que o backlog foi atualizado corretamente

**Verificar:**
- ✓ Feature feat-005 tem status "Em Andamento"
- ✓ Campo `dataInicio` está preenchido
- ✓ Campo `observacoes` contém resumo da implementação
- ✓ Artefatos listados incluem todos os arquivos criados

**Como verificar:**
```bash
# Ler o backlog e buscar pela feature
cat docs/backlog.json | grep -A 20 "feat-005"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 15: Ignorar Arquivos Listados no .prettierignore

**Objetivo:** Verificar se arquivos ignorados não são formatados

**Cenário:** Arquivos em node_modules, dist, logs não devem ser formatados

**Passos:**
1. Verificar conteúdo do .prettierignore
2. Executar format em toda a base de código
3. Confirmar que arquivos ignorados não foram modificados

**Esperado:**
- ✓ Arquivos em node_modules não são formatados
- ✓ Arquivos em dist/ não são formatados
- ✓ Arquivos .log não são formatados
- ✓ Arquivo .env não é formatado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Arquivos com Sintaxe Inválida

**Objetivo:** Verificar comportamento do ESLint ao analisar arquivo com erro de sintaxe

**Cenário:** Criar arquivo JavaScript com erro de sintaxe

**Passos:**
1. Criar arquivo `backend/src/invalid-syntax.js`:
   ```javascript
   function teste() {
     const x =
   }  // Sintaxe inválida
   ```
2. Executar lint
   ```bash
   cd backend
   npm run lint
   ```

**Esperado:**
- ✓ ESLint reporta erro de parsing
- ✓ Mensagem de erro é clara e indica a linha do problema
- ✓ Comando não trava ou causa crash

**Limpeza:**
```bash
rm backend/src/invalid-syntax.js
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Todos os comandos de lint funcionam (backend e frontend)
- [ ] Todos os comandos de format funcionam (backend e frontend)
- [ ] Regras do ESLint estão sendo aplicadas corretamente
- [ ] Prettier formata código consistentemente
- [ ] ESLint e Prettier não entram em conflito

### Arquivos de Configuração
- [ ] backend/eslint.config.js existe e é válido (Flat Config)
- [ ] frontend/eslint.config.js existe e é válido (Flat Config)
- [ ] .prettierrc existe e é válido
- [ ] .prettierignore existe e funciona corretamente

### Scripts package.json
- [ ] backend/package.json tem scripts: lint, lint:fix, format, format:check
- [ ] frontend/package.json tem scripts: lint, lint:fix, format, format:check
- [ ] Todos os scripts executam sem erros

### Código
- [ ] Código existente passa no lint (ou erros são esperados/documentados)
- [ ] Código está formatado de acordo com as regras do Prettier
- [ ] Nenhuma dependência quebrada

### Documentação
- [ ] README.md atualizado com seção completa
- [ ] Comandos documentados funcionam
- [ ] Instruções de integração com VS Code estão claras
- [ ] backlog.json atualizado corretamente

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Editor de Código
- **VS Code** com extensões:
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)

### Linha de Comando
- Terminal com suporte a cores (para melhor visualização dos erros)
- Git Bash (Windows) ou Terminal nativo (Mac/Linux)

### Específicos para esta feature
- **Verificar sintaxe JSON:**
  ```bash
  node -e "console.log(JSON.parse(require('fs').readFileSync('arquivo.json')))"
  ```
- **Visualizar diferenças após formatação:**
  ```bash
  git diff
  ```

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 16
- **Testes aprovados:** _[Preencher]_
- **Testes reprovados:** _[Preencher]_
- **Testes não executados:** _[Preencher]_

### Decisão
- [ ] **APROVADO** - Feature pronta para versionamento
- [ ] **REPROVADO** - Necessita ajustes (detalhar abaixo)

### Problemas Encontrados
_[Descrever problemas encontrados durante os testes]_

### Próximas Ações
_[Descrever ações necessárias]_

---

## 📝 NOTAS ADICIONAIS

### Observações Gerais
- ESLint e Prettier ajudam a manter código consistente e com menos bugs
- Recomenda-se executar `npm run lint` antes de cada commit
- Configurar VS Code para formatar automaticamente ao salvar melhora a experiência

### Sugestões de Melhorias Futuras
- Considerar configurar Husky + lint-staged para validação automática em commits
- Adicionar testes unitários para validar configurações do ESLint
- Criar CI/CD pipeline que executa lint automaticamente em PRs

### Dificuldades Esperadas
- Possível conflito entre regras do ESLint e Prettier (resolvido com eslint-config-prettier)
- Arquivos de configuração podem precisar ajustes específicos para o projeto
- Desenvolvedores podem precisar de tempo para se adaptar às regras

---

**Plano de testes gerado em:** 2025-10-25
**Feature:** feat-005 - Configurar ESLint e Prettier
**Status:** Pronto para execução
