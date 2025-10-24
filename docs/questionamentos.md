 1. Autenticação e Controle de Acesso
  - Quem gerencia os usuários administrativos? Existe um módulo de administração do sistema?
  Sim,, e este módulo Administrativo deve possuir um cadastro de usuários administrativos. A aplicação deve possuir um seeder para cadastrar em banco de dados o primeiro usuário administrativo que será responsável por cadastrar os demais.

  - Como funciona a hierarquia de permissões no módulo administrativo?
  Usuários administrativos tem acesso a todas as rotinas do sistema, inclusive às de uso exclusivo de administradores, como por exemplo cadastro de usuários administrativos. Alunos e professores possuem somente ao descrito em demandas-cliente.md

  - O que acontece se aluno/professor perder a senha provisória?
  Usuário administrativo pode acessar a lista de alunos e gerar nova senha provisória que por sua vez deve ser encaminhada para o email do aluno.

  2. Contratos e Documentos
  - Qual o formato dos contratos (PDF gerado? template editável)?
  PDF gerado baseado em template editável pelos usuários administrativos. Preenchido automaticamente com os dados do aluno, curso, semestre, etc.

  - Como funciona a renovação automática dos contratos?
  Cada curso deve possuir sua respectiva quantidade de semestres. A renovação se derá ao final de cada ciclo até alcançar a quantidade estabelecida de semestres.

  - Quais são os "documentos obrigatórios" para alunos e professores?
  A lista de documentos obrigatórios deve ser cadastrada e gerenciada pelos usuários administrativos. 

  - Existe aprovação/validação desses documentos por alguém?
  Sim, ao enviar os documentos a matrícula do aluno fica com status "aguardando confirmação" até que algum usuário administrativo faça a devida aprovação/validação. Deverá existir uma feature no modulo admistrativo para listar e exibir os documentos pendentes de confirmação permitindo que algum usuário administrativo os aprove ou não.

  3. Solicitações de Alunos
  - As solicitações geram documentos automaticamente ou passam por aprovação?
  As solicitações passam por aprovação dos usuários administrativos 
  - Há prazo de resposta? Notificações?
  Deve existir no módulo administrativo um cadastro de modelos de solicitações com seus respectivos prazos de resposta
  NEsta estapa não serão necessários notificações

  4. Notas e Avaliações
  - Como funciona o sistema de notas (0-10, conceitos, etc.)?
  As avaliações deverão ser cadastradas pelos professores, com suas respectivas datas e turma, podendo ser do tipo 0-10 ou conceito (satisfatório, não satisfatório)
  - Existe período de lançamento de notas?
   Não, fica ao encargo do professoe

  - Alunos podem contestar notas?
    Não

  - Como calcular a média final?
  O professor informa a média final

  5. Volumes e Escalabilidade
  - Quantos alunos, professores e cursos são esperados inicialmente?
  cerca de 200 alunos, 10 professores

  - Quantas turmas simultâneas?
  cerca de 10 turmas

  - Retenção de dados históricos (quantos anos)?
  Retensão de dados históricos por até 5 anos

  6. Integrações e Relatórios
  - É necessário gerar relatórios? Quais?
  Não no momento.

  - Integração com sistemas externos (MEC, pagamentos, etc.)?
  Não

  - Exportação de dados (formatos)?
  Não

  7. Regras de Negócio
  - Um aluno pode estar em múltiplas turmas/cursos simultaneamente?
  Não

  - Um professor pode lecionar múltiplas disciplinas/turmas?
  Sim

  - Existe limite de alunos por turma?
  Não

  - Como tratar transferências e cancelamentos (reembolso, pendências)?
Transferência entre turmas gerenciadas pelos usuários administrativos
Cancelamentos solicitados pelo aluno com necessidade de aprovação pelos usuários administrativos 

  8. Funcionalidades Não Especificadas
  - Sistema de mensagens/comunicação interna?
  Não

  - Calendário acadêmico?
  Não

  - Controle de presença/frequência?
  Não

  - Gestão financeira (mensalidades, pagamentos)?
  Não