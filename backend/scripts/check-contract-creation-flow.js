/**
 * Script: check-contract-creation-flow.js
 * Descrição: Verifica o fluxo de criação de contratos e identifica onde os PDFs não estão sendo gerados
 * Uso: node scripts/check-contract-creation-flow.js
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

(async () => {
  try {
    log('\n=== Análise do Fluxo de Criação de Contratos ===\n', 'blue');

    const { Contract, User, ContractTemplate } = require('../src/models');

    // 1. Verificar todos os contratos
    log('1. ANÁLISE DOS CONTRATOS EXISTENTES', 'magenta');
    const allContracts = await Contract.findAll({
      include: [
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'role'],
        },
        {
          association: 'template',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    log(`   Total de contratos: ${allContracts.length}`, 'blue');

    if (allContracts.length > 0) {
      log('\n   Detalhes dos contratos:', 'yellow');

      allContracts.forEach((contract, index) => {
        const hasPDF = contract.file_path !== null && contract.file_name !== null;
        const status = hasPDF ? '✓ COM PDF' : '✗ SEM PDF';
        const color = hasPDF ? 'green' : 'red';

        log(`\n   [${index + 1}] Contrato ID: ${contract.id}`, 'blue');
        log(`       Status: ${status}`, color);
        log(`       Usuário: ${contract.user ? contract.user.name : 'N/A'} (ID: ${contract.user_id})`);
        log(`       Template: ${contract.template ? contract.template.name : 'N/A'} (ID: ${contract.template_id})`);
        log(`       Criado em: ${contract.created_at}`);
        log(`       Aceito em: ${contract.accepted_at || 'Não aceito'}`);
        log(`       Semestre/Ano: ${contract.semester}/${contract.year}`);

        if (hasPDF) {
          log(`       file_path: ${contract.file_path}`, 'green');
          log(`       file_name: ${contract.file_name}`, 'green');
        } else {
          log(`       file_path: NULL`, 'red');
          log(`       file_name: NULL`, 'red');
        }

        // Verificar se tem enrollment_id (contratos de rematrícula)
        if (contract.enrollment_id) {
          log(`       enrollment_id: ${contract.enrollment_id} (Contrato de Rematrícula)`, 'yellow');
        }
      });
    }

    // 2. Verificar templates disponíveis
    log('\n\n2. TEMPLATES DISPONÍVEIS', 'magenta');
    const templates = await ContractTemplate.findAll({
      where: { is_active: true },
    });

    log(`   Total de templates ativos: ${templates.length}`, 'blue');

    if (templates.length === 0) {
      log('   ⚠️  ATENÇÃO: Nenhum template ativo encontrado!', 'red');
      log('   Isso pode impedir a geração de PDFs de contratos', 'red');
    } else {
      templates.forEach((template) => {
        log(`   - Template ID ${template.id}: ${template.name}`, 'green');
        log(`     Tipo: ${template.type}`, 'blue');
        log(`     Ativo: ${template.is_active ? 'Sim' : 'Não'}`, template.is_active ? 'green' : 'red');
      });
    }

    // 3. Verificar se há enrollment_id nos contratos (indicativo de rematrícula)
    log('\n\n3. VERIFICAR ORIGEM DOS CONTRATOS', 'magenta');
    const contractsWithEnrollment = await Contract.count({
      where: {
        enrollment_id: { [require('sequelize').Op.ne]: null },
      },
    });
    const contractsWithoutEnrollment = allContracts.length - contractsWithEnrollment;

    log(`   Contratos com enrollment_id (rematrícula): ${contractsWithEnrollment}`, 'blue');
    log(`   Contratos sem enrollment_id (matrícula inicial): ${contractsWithoutEnrollment}`, 'blue');

    if (contractsWithEnrollment > 0) {
      log('\n   ⚠️  POSSÍVEL CAUSA IDENTIFICADA:', 'yellow');
      log('   Contratos de rematrícula podem ser criados sem PDF (apenas aceite digital)', 'yellow');
      log('   Verifique se TODOS os contratos são de rematrícula', 'yellow');
    }

    // 4. Tentar gerar um contrato de teste para um usuário real
    log('\n\n4. TESTE DE GERAÇÃO DE CONTRATO REAL', 'magenta');

    // Buscar um usuário para teste (primeiro aluno encontrado)
    const testUser = await User.findOne({
      where: { role: 'student' },
      limit: 1,
    });

    if (!testUser) {
      log('   ⚠️  Nenhum usuário estudante encontrado para teste', 'yellow');
    } else {
      log(`   Usuário de teste: ${testUser.name} (ID: ${testUser.id})`, 'blue');
      log('   Tentando gerar contrato de teste...', 'yellow');

      try {
        const ContractService = require('../src/services/contract.service');

        const testContract = await ContractService.generateContract(
          testUser.id,
          'student',
          {
            semester: 1,
            year: 2026,
          }
        );

        log('   ✓ Contrato de teste gerado com sucesso!', 'green');
        log(`   Contract ID: ${testContract.id}`, 'blue');
        log(`   file_path: ${testContract.file_path || 'NULL'}`, testContract.file_path ? 'green' : 'red');
        log(`   file_name: ${testContract.file_name || 'NULL'}`, testContract.file_name ? 'green' : 'red');

        // Limpar contrato de teste
        const { Contract } = require('../src/models');
        await Contract.destroy({ where: { id: testContract.id } });
        log('   ✓ Contrato de teste removido', 'blue');

      } catch (error) {
        log(`   ✗ Erro ao gerar contrato de teste: ${error.message}`, 'red');
        log(`   Stack: ${error.stack}`, 'red');

        log('\n   🔍 CAUSA RAIZ IDENTIFICADA:', 'yellow');
        log('   O erro acima mostra o problema exato que impede a geração de PDFs', 'yellow');
      }
    }

    // 5. Resumo e recomendações
    log('\n\n=== RESUMO E RECOMENDAÇÕES ===\n', 'blue');

    const contractsWithPDF = allContracts.filter(c => c.file_path !== null).length;
    const contractsWithoutPDF = allContracts.length - contractsWithPDF;

    if (contractsWithoutPDF === allContracts.length && allContracts.length > 0) {
      log('❌ TODOS os contratos estão sem PDF', 'red');
      log('\nPossíveis causas:', 'yellow');
      log('1. Contratos criados como "aceite digital" sem geração de PDF (rematrícula)', 'blue');
      log('2. Erro durante geração de PDF que não está sendo propagado', 'blue');
      log('3. Template não disponível no momento da geração', 'blue');
      log('4. Erro no PDFService que está sendo silenciosamente capturado', 'blue');

      log('\nRecomendações:', 'yellow');
      log('1. Verifique os logs em backend/logs/ para erros durante geração', 'green');
      log('2. Se forem contratos de rematrícula, isso pode ser esperado', 'green');
      log('3. Execute o teste acima e verifique se há erro', 'green');
      log('4. Adicione logging no ContractService.generateContract', 'green');

    } else if (contractsWithPDF === 0 && allContracts.length > 0) {
      log('⚠️  Nenhum contrato tem PDF, mas sistema de geração funciona', 'yellow');
      log('   Provavelmente são contratos de rematrícula (aceite digital)', 'yellow');

    } else {
      log('✓ Sistema funcionando parcialmente', 'green');
      log(`   ${contractsWithPDF} contrato(s) com PDF`, 'green');
      log(`   ${contractsWithoutPDF} contrato(s) sem PDF`, 'yellow');
    }

  } catch (error) {
    log(`\n✗ Erro fatal: ${error.message}`, 'red');
    log(`Stack: ${error.stack}`, 'red');
    process.exit(1);
  }
})();
