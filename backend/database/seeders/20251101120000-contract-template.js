/**
 * Arquivo: backend/database/seeders/20251101120000-contract-template.js
 * Descrição: Seeder para criar template HTML padrão de contrato de matrícula
 * Feature: feat-050 - Criar template HTML de contrato padrão
 * Criado em: 2025-11-01
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Cria o template padrão de contrato de matrícula
     * Este template contém placeholders que serão substituídos com dados reais
     * ao gerar PDFs de contratos para alunos.
     */

    // Verificar se já existe um template de contrato padrão
    const [existingTemplate] = await queryInterface.sequelize.query(
      `SELECT id FROM contract_templates WHERE name = 'Contrato de Matrícula Padrão' LIMIT 1;`
    );

    if (existingTemplate.length > 0) {
      console.log('⚠️  Template de contrato padrão já existe. Seeder ignorado.');
      return;
    }

    // HTML do template com placeholders para dados dinâmicos
    const contractHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Matrícula</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 24px;
            color: #0066cc;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 12px;
            color: #666;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
            text-transform: uppercase;
            border-left: 4px solid #0066cc;
            padding-left: 10px;
        }

        .content {
            font-size: 12px;
            line-height: 1.8;
            text-align: justify;
        }

        .field-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }

        .field-group.full {
            grid-template-columns: 1fr;
        }

        .field {
            display: flex;
            flex-direction: column;
        }

        .field-label {
            font-weight: bold;
            font-size: 11px;
            color: #0066cc;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .field-value {
            font-size: 12px;
            color: #333;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
            min-height: 20px;
        }

        .signature-area {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 50px;
            text-align: center;
        }

        .signature-block {
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 11px;
        }

        .signature-block .name {
            margin-top: 5px;
            font-weight: bold;
        }

        .date-signature {
            text-align: center;
            margin-top: 50px;
            font-size: 12px;
        }

        .terms-conditions {
            font-size: 11px;
            line-height: 1.6;
            text-align: justify;
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 3px solid #0066cc;
        }

        .terms-conditions h3 {
            font-size: 12px;
            color: #0066cc;
            margin-bottom: 10px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }

        .page-break {
            page-break-after: always;
        }

        @media print {
            body {
                background-color: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>CONTRATO DE MATRÍCULA</h1>
            <p>Secretaria Online - Sistema de Gestão Acadêmica</p>
        </div>

        <!-- Dados do Aluno -->
        <div class="section">
            <div class="section-title">Dados do Aluno</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Nome Completo</span>
                    <span class="field-value">{{studentName}}</span>
                </div>
                <div class="field">
                    <span class="field-label">CPF</span>
                    <span class="field-value">{{studentCPF}}</span>
                </div>
            </div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Email</span>
                    <span class="field-value">{{studentEmail}}</span>
                </div>
                <div class="field">
                    <span class="field-label">Telefone</span>
                    <span class="field-value">{{studentPhone}}</span>
                </div>
            </div>
            <div class="field-group full">
                <div class="field">
                    <span class="field-label">Endereço</span>
                    <span class="field-value">{{studentAddress}}</span>
                </div>
            </div>
        </div>

        <!-- Dados da Matrícula -->
        <div class="section">
            <div class="section-title">Dados da Matrícula</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Curso</span>
                    <span class="field-value">{{courseName}}</span>
                </div>
                <div class="field">
                    <span class="field-label">Semestre Inicial</span>
                    <span class="field-value">{{currentSemester}}</span>
                </div>
            </div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Data da Matrícula</span>
                    <span class="field-value">{{enrollmentDate}}</span>
                </div>
                <div class="field">
                    <span class="field-label">Duração Total do Curso</span>
                    <span class="field-value">{{courseDuration}} semestres</span>
                </div>
            </div>
            <div class="field-group full">
                <div class="field">
                    <span class="field-label">Número da Matrícula</span>
                    <span class="field-value">{{enrollmentNumber}}</span>
                </div>
            </div>
        </div>

        <!-- Termos e Condições -->
        <div class="terms-conditions">
            <h3>TERMOS E CONDIÇÕES</h3>
            <p>
                O aluno <strong>{{studentName}}</strong>, doravante designado ALUNO,
                através deste instrumento particular, formaliza sua matrícula no curso
                <strong>{{courseName}}</strong> desta instituição de ensino, iniciando suas atividades
                acadêmicas a partir do semestre <strong>{{currentSemester}}</strong>.
            </p>
            <p style="margin-top: 10px;">
                <strong>Cláusula 1 - Obrigações do Aluno:</strong>
            </p>
            <ol style="margin-left: 20px; margin-top: 5px;">
                <li>Cumprir com os horários de aula estabelecidos pela instituição;</li>
                <li>Apresentar documentação exigida conforme cronograma estabelecido;</li>
                <li>Manter conduta apropriada e ética durante todo o curso;</li>
                <li>Participar das avaliações e atividades acadêmicas conforme normas institucionais;</li>
                <li>Cumprir com as políticas de disciplina e regulamento da instituição;</li>
                <li>Manter dados pessoais e de contato atualizados junto à secretaria.</li>
            </ol>
            <p style="margin-top: 10px;">
                <strong>Cláusula 2 - Obrigações da Instituição:</strong>
            </p>
            <ol style="margin-left: 20px; margin-top: 5px;">
                <li>Fornecer instrução acadêmica de qualidade conforme currículo aprovado;</li>
                <li>Manter registros acadêmicos seguros e confidenciais;</li>
                <li>Emitir documentos e certificados conforme solicitações do aluno;</li>
                <li>Aplicar avaliações e registrar notas em tempo hábil;</li>
                <li>Respeitar os direitos e a privacidade do aluno conforme Lei LGPD.</li>
            </ol>
            <p style="margin-top: 10px;">
                <strong>Cláusula 3 - Renovação do Contrato:</strong>
            </p>
            <p style="margin-top: 5px;">
                Este contrato será automaticamente renovado ao final de cada semestre,
                conforme a progressão do aluno no curso, até a conclusão de todos os semestres
                exigidos para a formação ({{courseDuration}} semestres).
            </p>
            <p style="margin-top: 10px;">
                <strong>Cláusula 4 - Cancelamento:</strong>
            </p>
            <p style="margin-top: 5px;">
                O aluno poderá solicitar cancelamento de matrícula a qualquer momento,
                devendo protocolar o pedido junto à secretaria acadêmica. A instituição
                se reserva o direito de cancelar matrícula em caso de descumprimento de suas normas.
            </p>
            <p style="margin-top: 10px;">
                <strong>Cláusula 5 - Declaração de Conformidade:</strong>
            </p>
            <p style="margin-top: 5px;">
                O aluno declara ter lido, compreendido e concorda integralmente com os termos
                e condições deste contrato, bem como com o regulamento acadêmico da instituição.
                Ao aceitar este contrato, confirma sua participação voluntária no curso.
            </p>
        </div>

        <!-- Assinaturas -->
        <div class="signature-area">
            <div class="signature-block">
                ___________________________
                <div class="name">{{studentName}}</div>
                <div>Assinatura do Aluno</div>
            </div>
            <div class="signature-block">
                ___________________________
                <div class="name">Representante da Instituição</div>
                <div>Assinatura Autorizada</div>
            </div>
        </div>

        <!-- Data -->
        <div class="date-signature">
            <p>Data: {{contractDate}}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Este contrato foi gerado automaticamente pelo sistema Secretaria Online</p>
            <p>Documento ID: {{contractId}} | Gerado em: {{generatedAt}}</p>
        </div>
    </div>
</body>
</html>`;

    // Inserir template de contrato
    await queryInterface.bulkInsert(
      'contract_templates',
      [
        {
          name: 'Contrato de Matrícula Padrão',
          content: contractHTML,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    console.log('✅ Template de contrato padrão criado com sucesso!');
    console.log('   Nome: Contrato de Matrícula Padrão');
    console.log('   Status: Ativo');
    console.log('   Placeholders disponíveis:');
    console.log('   - {{studentName}}: Nome do aluno');
    console.log('   - {{studentCPF}}: CPF do aluno');
    console.log('   - {{studentEmail}}: Email do aluno');
    console.log('   - {{studentPhone}}: Telefone do aluno');
    console.log('   - {{studentAddress}}: Endereço do aluno');
    console.log('   - {{courseName}}: Nome do curso');
    console.log('   - {{currentSemester}}: Semestre atual');
    console.log('   - {{enrollmentDate}}: Data da matrícula');
    console.log('   - {{courseDuration}}: Duração total do curso');
    console.log('   - {{enrollmentNumber}}: Número da matrícula');
    console.log('   - {{contractDate}}: Data do contrato');
    console.log('   - {{contractId}}: ID do contrato');
    console.log('   - {{generatedAt}}: Data/hora de geração');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove o template de contrato padrão criado
     */
    await queryInterface.bulkDelete(
      'contract_templates',
      {
        name: 'Contrato de Matrícula Padrão',
      },
      {}
    );

    console.log('✅ Template de contrato padrão removido.');
  },
};
