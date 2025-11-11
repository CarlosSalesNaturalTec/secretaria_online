# Requisitos do Projeto

## 1. Nome do Projeto
Secretaria Online

## 2. Descrição Geral
O Secretaria Online é um sistema web de gestão acadêmica que visa digitalizar e automatizar os processos administrativos de instituições de ensino. A plataforma oferece funcionalidades completas para cadastro e gerenciamento de professores, alunos, cursos, disciplinas e turmas, além de permitir o controle de matrículas e a gestão documental.

O sistema atende três perfis principais de usuários: administradores, professores e alunos. Cada perfil possui acesso a funcionalidades específicas, desde o cadastro inicial de dados até o lançamento de notas, solicitação de documentos e acompanhamento acadêmico. A solução inclui gestão de contratos digitais, armazenamento de documentos obrigatórios e um fluxo completo de solicitações administrativas.

Com foco na eficiência e redução de processos burocráticos presenciais, o Secretaria Online centraliza todas as operações acadêmicas em uma única plataforma acessível via web, proporcionando maior agilidade e transparência na comunicação entre alunos, professores e a administração da instituição.

## 3. Funcionalidades Principais

### Módulo Administrativo
1. **Cadastro de Professores** - Registro completo com dados pessoais (nome, RG, CPF, filiação, endereço, título acadêmico, reservista) e criação de credenciais de acesso (login e senha provisória)
2. **Cadastro de Alunos** - Registro completo com dados pessoais (nome, RG, CPF, filiação, endereço, título eleitoral, reservista) e criação de credenciais de acesso (login e senha provisória)
3. **Cadastro de Disciplinas** - Criação e gerenciamento do catálogo de disciplinas oferecidas pela instituição
4. **Cadastro de Cursos** - Criação de cursos e vinculação das disciplinas que compõem a grade curricular de cada curso
5. **Cadastro de Matrículas** - Vinculação de alunos aos cursos, gerando matrículas ativas
6. **Cadastro de Turmas** - Criação de turmas vinculando curso, professor responsável e alunos matriculados

### Módulo do Aluno
7. **Primeiro Acesso e Contrato** - Apresentação e aceite digital do contrato de matrícula (renovado a cada nova matrícula)
8. **Gestão de Documentos** - Upload e armazenamento de documentos obrigatórios para a matrícula
9. **Consulta de Notas** - Visualização do desempenho acadêmico em disciplinas e turmas
10. **Sistema de Solicitações** - Requisição de atestados de matrícula, históricos escolares, certificados, validação de atividades complementares, transferências e cancelamento de matrícula

### Módulo do Professor
11. **Primeiro Acesso e Contrato** - Apresentação e aceite digital do contrato de trabalho (renovado semestralmente)
12. **Gestão de Documentos** - Upload e armazenamento de documentos obrigatórios
13. **Visualização de Turmas** - Acesso às turmas em que está cadastrado como responsável
14. **Consulta de Alunos** - Visualização da lista de alunos matriculados em suas turmas
15. **Lançamento de Notas** - Registro de notas e avaliações dos alunos de suas turmas

## 4. Usuários/Personas

### Administrador
**Perfil:** Funcionário da secretaria acadêmica responsável pela gestão operacional da instituição.

**Necessidades:**
- Cadastrar e gerenciar dados de professores, alunos, cursos, disciplinas e turmas
- Controlar matrículas e vínculos acadêmicos
- Processar solicitações administrativas dos alunos
- Manter a estrutura acadêmica atualizada

### Professor
**Perfil:** Docente responsável por lecionar disciplinas e avaliar alunos.

**Necessidades:**
- Aceitar contrato de trabalho no início de cada semestre
- Enviar documentação obrigatória
- Visualizar suas turmas e a lista de alunos
- Lançar notas e registrar avaliações dos alunos
- Acompanhar o desempenho das turmas

### Aluno
**Perfil:** Estudante matriculado em um ou mais cursos da instituição.

**Necessidades:**
- Aceitar contrato de matrícula ao ingressar ou renovar matrícula
- Enviar documentação obrigatória para validação da matrícula
- Consultar suas notas e desempenho acadêmico
- Solicitar documentos (atestados, históricos, certificados)
- Registrar atividades complementares
- Solicitar transferências ou cancelamento de matrícula quando necessário

## 5. Restrições/Requisitos Técnicos
- Plataforma: Web
- Armazenamento de documentos em storage

## 6. Fora do Escopo
- Financeiro, controle de presenças