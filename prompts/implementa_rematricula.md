Crie um novo arquivo backlog/backlog_rematricula.JSON com uma TO-DO list contendo as etapas e respectivos detalhamentos para implementação de processo de 'Rematrícula do Estudante'. Este arquivo deve contes as etapas necessárias e os respectivos status que devem ser: 'Não implementada', 'Em andamento', 'Implementada'.
Com um máximo de 10 macro-etapas na implementação das mesmas, devem ser observadas as seguintes regras de negócio:

* A implementação deve partir das funcionalidades/tabelas já existentes: estudantes, enrollments , documents, documents_types, courses, classes, contracts e demais relacionadas se necessário.
* No cadastro de Cursos criar botão/funcionalidade: Rematricular Todos.
* O usuário admin deve então informar o respectivo Semestre e Ano.
* Re-digitação de Senha Para confirmar processo.
* Em se confirmando a senha, atualizar na tabela Enrollments todos os estudantes para o status 'pendding'.
* Manter o numero de matrícula existente no cadastro do estudante, e ao mesmo tempo criando um novo contrato para o novo período.
* O usuário do tipo Estudante que tiver com o status 'pendding', ao logar no sistema deve ser levado para tela de confirmação de rematrícula contendo:
* Frame para exibir Contrato com dados preenchidos dinamicamente com informações da instituição e do aluno.
* Botão de confirmação/aceite.
* Ao confirmar, atualizar o status do estudante em enrollments para 'active' e liberar acesso normal a todas as funcionalidades do sistema.
* Salvar dados da rematrícula na tabela de contratos.
* Não é necessário criar respectivos pdfs dos contratos. salvar em contracts: file_path e file_name = null.
* A cada conclusão de macro-etapa atualizar READMEs do backend e frontend com detalhes da implementação.


=====

Fazer os seguintes ajustes nas etapas e ajustar backlog_rematrícula.json. 

Considere a versão corrente do arquivo backlog rematrícula que foi alterada em relação ao que vc acabou de criar.

Com relação a criação de contratos, não criar todos de vez como descrito na etapa 3, e sim criar o contrato somente após aceite do estudante.

Com relação ao item 6, "Criar service para gerar HTML de contrato dinamicamente com dados da instituição e do estudante, a ser exibido no frontend para aceite." verificar o que já foi implementado no sistema relativo a tabela 'contracts_templates'   e adaptar.

Remover etapa de : "Integração, Validações e Testes do Fluxo Completo",

A orientação de atualização dos readmes deve star em cada macro- etapa do backlog

