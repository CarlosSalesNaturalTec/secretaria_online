/**
 * Arquivo: backend/database/migrations/20251216205107-update-contract-template-ift.js
 * Descrição: Migration para atualizar template de contrato para o formato IFT
 * Feature: feat-050 - Atualizar template de contrato IFT
 * Criado em: 2025-12-16
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Novo template HTML com formato IFT
    const newContractHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Prestação de Serviços para Formação e Construção de Competências</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
            background-color: #fff;
            padding: 15mm;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header h1 {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 9pt;
            margin: 2px 0;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
            text-decoration: underline;
        }

        .field-group {
            margin-bottom: 10px;
        }

        .field-label {
            font-weight: bold;
            display: inline;
        }

        .field-value {
            display: inline;
        }

        .clause {
            margin-bottom: 12px;
            text-align: justify;
        }

        .clause-title {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .paragraph {
            margin-left: 20px;
            margin-top: 8px;
            text-align: justify;
        }

        .signature-area {
            margin-top: 40px;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #000;
            width: 300px;
            margin: 50px auto 5px auto;
        }

        .signature-name {
            font-weight: bold;
            margin-bottom: 3px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .table th,
        .table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
        }

        .table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        .page-break {
            page-break-after: always;
        }

        ol {
            margin-left: 25px;
        }

        ol li {
            margin-bottom: 5px;
        }

        @media print {
            body {
                padding: 10mm;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>IFT</h1>
        <p>Instagram: @ifterraba | Facebook: Ifterra | Telefones: 71 9 2003 7114 / 71 9 9915 - 7754</p>
        <h1 style="margin-top: 10px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS PARA FORMAÇÃO E CONSTRUÇÃO DE COMPETÊNCIAS</h1>
    </div>

    <div class="section-title">DADOS DO CONTRATANTE</div>
    <div class="field-group">
        <span class="field-label">NOME COMPLETO:</span>
        <span class="field-value">{{studentName}}</span>
    </div>
    <div class="field-group">
        <span class="field-label">RG:</span>
        <span class="field-value">{{studentRG}}</span>
    </div>
    <div class="field-group">
        <span class="field-label">CPF:</span>
        <span class="field-value">{{studentCPF}}</span>
    </div>
    <div class="field-group">
        <span class="field-label">DATA DE NASCIMENTO:</span>
        <span class="field-value">{{studentBirthDate}}</span>
    </div>
    <div class="field-group">
        <span class="field-label">ENDEREÇO COMPLETO:</span>
        <span class="field-value">{{studentAddress}}</span>
    </div>

    <div class="section-title">DADOS DA MATRÍCULA</div>
    <div class="field-group">
        <span class="field-label">NÚMERO DA MATRÍCULA:</span>
        <span class="field-value">{{enrollmentNumber}}</span>
    </div>
    <div class="field-group">
        <span class="field-label">CURSO:</span>
        <span class="field-value">{{courseName}}</span>
    </div>
    <div class="field-group">
        <span class="field-label">SEMESTRE:</span>
        <span class="field-value">{{currentSemester}}</span>
    </div>

    <div class="section-title">DADOS DA CONTRATADA</div>
    <div class="clause">
        <p>O INSTITUTO DE RESPONSABILIDADE SOCIAL - FILHOS DA TERRA, pessoa jurídica de direito privado, com finalidade educacional, inscrita no CNPJ sob o nº 56.194.857/0001-44, com sede na Rua Irênio Marques da Silva, nº 280, Alto da Jacobina, Bahia, CEP 48.860-000, neste ato representado por seu Diretor-Presidente, Sr. Diego de Sousa Portela, portador do RG nº 09993967-30, SSP-BA, doravante denominado CONTRATADA, estabelece as condições para a prestação de serviços para formação e construção de competências, conforme as cláusulas e condições a seguir detalhadas:</p>
    </div>

    <div class="clause">
        <div class="clause-title">CLÁUSULA PRIMEIRA</div>
        <p>Este contrato tem como objeto a prestação de serviços voltados ao desenvolvimento de competências e habilidades profissionais, por meio de atividades formativas, cursos livres e projetos pedagógicos. A certificação e diplomação dos cursos de nível superior será de responsabilidade de instituição de ensino superior parceira, regularmente credenciada pelo MEC.</p>
    </div>

    <div class="page-break"></div>

    <div class="clause">
        <div class="clause-title">CLÁUSULA SEGUNDA</div>
        <p>O presente contrato é celebrado em conformidade com os preceitos estabelecidos nos artigos 1º, inciso IV, 5º, inciso II, 173, parágrafos 1º a 5º, 205, 206, incisos II e III, e 209, da Constituição Federal, na Lei nº 10.406/2002 (Código Civil Brasileiro), nas disposições da Lei nº 8.069/90 (Estatuto da Criança e do Adolescente), na Lei nº 9.870/99, na Lei nº 8.078/90 (Código de Defesa do Consumidor), na Lei nº 9.492/97, na Lei nº 9.394/96 (Lei de Diretrizes e Bases da Educação Nacional), na Portaria MEC nº 2.117, de 6 de dezembro de 2019, e em outras disposições legais aplicáveis, bem como no Regimento Geral do IFT, no Manual do Aluno e nas normas internas da instituição.</p>
    </div>

    <div class="signature-area">
        <p>Queimadas/BA, {{contractDate}}</p>
        <div class="signature-line"></div>
        <div class="signature-name">CONTRATANTE/ADERENTE</div>
        <div>{{studentName}}</div>

        <div class="signature-line" style="margin-top: 70px;"></div>
        <div class="signature-name">DIEGO DE SOUSA PORTELA</div>
        <div>Diretor(a)</div>
    </div>

    <div class="page-break"></div>

    <div class="section-title">ANEXO I - VALORES MÓDULO FORMATIVO 2026.1</div>
    <p style="margin-bottom: 10px;"><strong>DE ACORDO COM O DISPOSTO NA LEI 9870/99 E MEDIDAS PROVISÓRIAS APLICADAS</strong></p>

    <p style="margin-bottom: 8px; font-weight: bold;">SUPERIOR</p>
    <table class="table">
        <thead>
            <tr>
                <th>Cursos</th>
                <th>Módulo Formativo 2026.1</th>
                <th>Nº Parcelas</th>
                <th>Valor das Parcelas</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Administração de Empresas</td><td>R$ 720,00</td><td>6</td><td>R$ 120,00</td></tr>
            <tr><td>Psicologia</td><td>R$ 1.559,40</td><td>6</td><td>R$ 259,90</td></tr>
            <tr><td>Serviço Social</td><td>R$ 719,94</td><td>6</td><td>R$ 119,99</td></tr>
            <tr><td>Complementação Pedagógica</td><td>R$ 539,94</td><td>6</td><td>R$ 89,99</td></tr>
            <tr><td>Ciências Contábeis</td><td>R$ 959,40</td><td>6</td><td>R$ 159,90</td></tr>
            <tr><td>Licenc. Educação Física</td><td>R$ 701,94</td><td>6</td><td>R$ 116,99</td></tr>
            <tr><td>Licenc. História</td><td>R$ 719,94</td><td>6</td><td>R$ 119,99</td></tr>
            <tr><td>Pedagogia</td><td>R$ 659,40</td><td>6</td><td>R$ 109,90</td></tr>
            <tr><td>Direito</td><td>R$ 2.159,40</td><td>6</td><td>R$ 359,90</td></tr>
            <tr><td>Bioenergia</td><td>R$ 4.199,94</td><td>6</td><td>R$ 699,99</td></tr>
            <tr><td>Engenharia de Produção</td><td>R$ 1.499,94</td><td>6</td><td>R$ 249,99</td></tr>
            <tr><td>Engenharia de Florestal</td><td>R$ 3.959,94</td><td>6</td><td>R$ 659,99</td></tr>
            <tr><td>Agronegócio</td><td>R$ 485,94</td><td>6</td><td>R$ 80,99</td></tr>
            <tr><td>Recursos Humanos</td><td>R$ 485,94</td><td>6</td><td>R$ 80,99</td></tr>
        </tbody>
    </table>

    <p style="margin-top: 20px; margin-bottom: 8px; font-weight: bold;">TÉCNICO</p>
    <table class="table">
        <thead>
            <tr>
                <th>Cursos</th>
                <th>Módulo Formativo 2026.1</th>
                <th>Nº Parcelas</th>
                <th>Valor das Parcelas</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Enfermagem</td><td>R$ 799,94</td><td>6</td><td>R$ 129,99</td></tr>
            <tr><td>Segurança do Trabalho</td><td>R$ 713,40</td><td>6</td><td>R$ 118,90</td></tr>
            <tr><td>Serviços Jurídicos</td><td>R$ 485,40</td><td>6</td><td>R$ 80,90</td></tr>
            <tr><td>Administração de Empresas</td><td>R$ 539,40</td><td>6</td><td>R$ 89,90</td></tr>
            <tr><td>Nutrição</td><td>R$ 899,94</td><td>6</td><td>R$ 149,99</td></tr>
            <tr><td>Saúde Bucal</td><td>R$ 899,94</td><td>6</td><td>R$ 149,99</td></tr>
        </tbody>
    </table>

    <p style="margin-top: 20px; margin-bottom: 8px; font-weight: bold;">ESPECIALIZAÇÃO</p>
    <table class="table">
        <thead>
            <tr>
                <th>Cursos</th>
                <th>Módulo Formativo 2025.2</th>
                <th>Nº Parcelas</th>
                <th>Valor das Parcelas</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Docência no Ensino Superior</td><td>R$ 109,99</td><td>******</td><td>******</td></tr>
            <tr><td>Psicopedagogia Inst. e Clínica</td><td>R$ 109,99</td><td>******</td><td>******</td></tr>
            <tr><td>Neuropsicopedagogia</td><td>R$ 109,99</td><td>******</td><td>******</td></tr>
            <tr><td>Coordenação Pedagógica</td><td>R$ 139,99</td><td>******</td><td>******</td></tr>
            <tr><td>Educação Especial e Inclusiva</td><td>R$ 129,50</td><td>******</td><td>******</td></tr>
        </tbody>
    </table>

    <p style="margin-top: 15px; text-align: center; font-size: 9pt;">O PRESENTE EDITAL ESTÁ PUBLICADO NO ÂMBITO INTERNO DA INSTITUIÇÃO.</p>
</body>
</html>`;

    // Atualizar o template existente
    await queryInterface.sequelize.query(
      `UPDATE contract_templates
       SET name = 'Contrato de Prestação de Serviços IFT',
           content = :content,
           updated_at = NOW()
       WHERE name = 'Contrato de Matrícula Padrão' OR name = 'Contrato de Prestação de Serviços IFT'`,
      {
        replacements: { content: newContractHTML },
        type: queryInterface.sequelize.QueryTypes.UPDATE,
      }
    );

    console.log('✅ Template de contrato atualizado para formato IFT');
  },

  async down(queryInterface, Sequelize) {
    // Reverter para template anterior não é necessário pois o template antigo
    // não reflete mais as necessidades do sistema
    console.log('⚠️  Rollback desta migration não restaura o template anterior.');
    console.log('   Execute o seeder novamente se necessário: npm run db:seed');
  },
};
