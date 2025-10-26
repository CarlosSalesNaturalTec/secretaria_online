# Nome do Sistema: 
Secretaria Online

# Objetivo: 
Aplicação destinada a automação dos processos administrativos e acadêmicos de instituições de ensino. O sistema permitirá o gerenciamento integrado de alunos, professores, cursos, disciplinas, matrículas, contratos e documentos.

# Servidor de Produção: 
Hostgator com banco de dados MySQL

# Ambiente de desenvolvimento: 
Windows

# Módulos 

## administrativo
* Cadastro de Professores
    * Campos: nome, rg, cpf, mae, pai, end, titulo, reservista, login e senha provisório
* Cadastro de Alunos: 
    * Campos: nome, rg, cpf, mae, pai, end, titulo, reservista, login e senha provisório
* Cadastro de Disciplinas
* Cadastro de Cursos
    * Cadastro de disciplinas do curso
* Cadastro de Matrículas
    * aluno, curso
* Cadastro de Turmas
    * Curso
    * Professor
    * Alunos

## aluno
* primeiro acesso: contrato (renovado a cada nova matricula) aceite do aluno
* anexar documentos obrigatórios
* checar notas
* Solicitações: 
    * pedido de atestado
    * históricos escolares
    * certificados
    * atividades complementares
    * transferencia, 
    * cancelamento de matricula

## professor
* primeiro acesso: contrato (renovado a cada semestre) aceite do professor
* anexar documentos obrigatórios
* turmas em que esta cadastrado
* alunos das turmas
* lançar notas

