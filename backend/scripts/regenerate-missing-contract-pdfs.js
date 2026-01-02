/**
 * Script: regenerate-missing-contract-pdfs.js
 * Descrição: Regenera PDFs para contratos que não possuem file_path/file_name
 * Uso: node scripts/regenerate-missing-contract-pdfs.js
 *
 * Este script:
 * - Busca contratos sem PDF (file_path IS NULL)
 * - Para cada contrato, recupera os dados necessários (usuário, template, enrollment, curso)
 * - Gera o PDF usando PDFService
 * - Atualiza os campos file_path e file_name no banco de dados
 * - Gera relatório de sucesso/falha
 */

const path = require('path');
const { Contract, User, ContractTemplate, Enrollment, Course } = require('../src/models');
const PDFService = require('../src/services/pdf.service');
const logger = require('../src/utils/logger');
const { CONTRACTS_PATH } = require('../src/config/pdf');
const { Op } = require('sequelize');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Prepara os dados do placeholder para geração do PDF
 * @param {Object} contract - Contrato
 * @param {Object} user - Usuário (aluno)
 * @param {Object} template - Template do contrato
 * @param {Object} enrollment - Enrollment (matrícula) - opcional
 * @param {Object} course - Curso - opcional
 * @returns {Object} Dados do placeholder
 */
function preparePlaceholderData(contract, user, template, enrollment = null, course = null) {
  const currentDate = new Date();

  // Dados básicos
  const placeholderData = {
    studentId: user.id,
    studentName: user.name,
    semester: contract.semester,
    year: contract.year,
    institutionName: 'Secretaria Online',
    currentDate: currentDate.toLocaleDateString('pt-BR'),
    currentDateTime: currentDate.toLocaleString('pt-BR'),
    generatedAt: currentDate.toLocaleString('pt-BR'),
  };

  // Adicionar dados do curso se disponível
  if (course) {
    placeholderData.courseId = course.id;
    placeholderData.courseName = course.name;
    placeholderData.duration = course.duration_semesters
      ? `${course.duration_semesters} semestres`
      : `${course.duration || 'N/A'} ${course.duration_type || ''}`.trim();
  } else {
    // Se não houver curso, usar valores padrão compatíveis com validação do PDFService
    placeholderData.courseId = user.id; // Usar ID do usuário como fallback
    placeholderData.courseName = 'Curso não especificado';
    placeholderData.duration = 'conforme currículo';
  }

  // Adicionar dados opcionais do aluno se disponíveis
  // CPF - múltiplos placeholders para compatibilidade
  if (user.cpf) {
    const formattedCPF = user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    placeholderData.cpf = formattedCPF;
    placeholderData.studentCPF = formattedCPF;
  } else {
    placeholderData.cpf = 'N/A';
    placeholderData.studentCPF = 'N/A';
  }

  // RG
  if (user.rg) {
    placeholderData.rg = user.rg;
    placeholderData.studentRG = user.rg;
  } else {
    placeholderData.rg = 'N/A';
    placeholderData.studentRG = 'N/A';
  }

  // Data de nascimento
  if (user.birth_date) {
    placeholderData.birthDate = new Date(user.birth_date).toLocaleDateString('pt-BR');
    placeholderData.studentBirthDate = new Date(user.birth_date).toLocaleDateString('pt-BR');
  } else {
    placeholderData.birthDate = 'N/A';
    placeholderData.studentBirthDate = 'N/A';
  }

  // Endereço
  if (user.address) {
    placeholderData.address = user.address;
    placeholderData.studentAddress = user.address;
  } else {
    placeholderData.address = 'N/A';
    placeholderData.studentAddress = 'N/A';
  }

  // Telefone
  if (user.phone) {
    placeholderData.phone = user.phone;
    placeholderData.studentPhone = user.phone;
  } else {
    placeholderData.phone = 'N/A';
    placeholderData.studentPhone = 'N/A';
  }

  // Email
  if (user.email) {
    placeholderData.email = user.email;
    placeholderData.studentEmail = user.email;
  } else {
    placeholderData.email = 'N/A';
    placeholderData.studentEmail = 'N/A';
  }

  // Adicionar dados do enrollment se disponível
  if (enrollment) {
    placeholderData.enrollmentId = enrollment.id;
    placeholderData.enrollmentNumber = enrollment.id; // Número da matrícula
    if (enrollment.start_date) {
      placeholderData.startDate = new Date(enrollment.start_date).toLocaleDateString('pt-BR');
    }
    if (enrollment.current_semester) {
      placeholderData.currentSemester = enrollment.current_semester;
    } else {
      placeholderData.currentSemester = contract.semester;
    }
  } else {
    placeholderData.enrollmentId = 'N/A';
    placeholderData.enrollmentNumber = 'N/A';
    placeholderData.currentSemester = contract.semester;
  }

  // Adicionar placeholders legados para retrocompatibilidade
  placeholderData.date = currentDate.toLocaleDateString('pt-BR');
  placeholderData.contractDate = contract.created_at
    ? new Date(contract.created_at).toLocaleDateString('pt-BR')
    : currentDate.toLocaleDateString('pt-BR');

  return placeholderData;
}

/**
 * Regenera o PDF de um contrato específico
 * @param {Object} contract - Contrato a regenerar
 * @returns {Promise<Object>} Resultado da regeneração
 */
async function regenerateContractPDF(contract) {
  const logPrefix = `[Contract ID: ${contract.id}]`;

  try {
    log(`${logPrefix} Iniciando regeneração...`, 'cyan');

    // 1. Buscar usuário do contrato
    const user = await User.findByPk(contract.user_id);
    if (!user) {
      throw new Error(`Usuário não encontrado - User ID: ${contract.user_id}`);
    }
    log(`${logPrefix} Usuário encontrado: ${user.name}`, 'blue');

    // 2. Buscar template do contrato
    const template = await ContractTemplate.findByPk(contract.template_id);
    if (!template) {
      throw new Error(`Template não encontrado - Template ID: ${contract.template_id}`);
    }
    log(`${logPrefix} Template encontrado: ${template.name}`, 'blue');

    // 3. Buscar enrollment e curso (se houver enrollment_id)
    let enrollment = null;
    let course = null;

    if (contract.enrollment_id) {
      enrollment = await Enrollment.findByPk(contract.enrollment_id, {
        include: [{ model: Course, as: 'course' }],
      });

      if (enrollment) {
        course = enrollment.course;
        log(`${logPrefix} Enrollment encontrado - ID: ${enrollment.id}`, 'blue');
        if (course) {
          log(`${logPrefix} Curso encontrado: ${course.name}`, 'blue');
        }
      }
    }

    // Se não tiver enrollment_id ou enrollment não encontrado, tentar buscar enrollment ativo do aluno
    if (!enrollment) {
      enrollment = await Enrollment.findOne({
        where: {
          student_id: user.id,
          status: { [Op.in]: ['pending', 'active', 'reenrolled'] },
        },
        include: [{ model: Course, as: 'course' }],
        order: [['created_at', 'DESC']],
      });

      if (enrollment) {
        course = enrollment.course;
        log(`${logPrefix} Enrollment ativo encontrado - ID: ${enrollment.id}`, 'blue');
        if (course) {
          log(`${logPrefix} Curso do enrollment: ${course.name}`, 'blue');
        }
      } else {
        log(`${logPrefix} ⚠ Nenhum enrollment encontrado - usando dados básicos`, 'yellow');
      }
    }

    // 4. Preparar dados do placeholder
    const placeholderData = preparePlaceholderData(contract, user, template, enrollment, course);

    // 5. Processar template com placeholders
    const processedContent = template.replacePlaceholders(placeholderData);

    // 6. Gerar PDF usando PDFService
    log(`${logPrefix} Gerando PDF...`, 'cyan');
    const pdfResult = await PDFService.generateContractPDF(
      placeholderData,
      processedContent,
      CONTRACTS_PATH
    );

    // 7. Atualizar contrato no banco de dados
    contract.file_path = pdfResult.relativePath;
    contract.file_name = pdfResult.fileName;
    await contract.save();

    log(`${logPrefix} ✓ PDF regenerado com sucesso!`, 'green');
    log(`${logPrefix}   Arquivo: ${pdfResult.fileName}`, 'green');
    log(`${logPrefix}   Caminho: ${pdfResult.filePath}`, 'green');
    log(`${logPrefix}   Tamanho: ${pdfResult.fileSize} bytes`, 'green');

    return {
      success: true,
      contractId: contract.id,
      userId: user.id,
      userName: user.name,
      fileName: pdfResult.fileName,
      filePath: pdfResult.filePath,
      fileSize: pdfResult.fileSize,
    };
  } catch (error) {
    log(`${logPrefix} ✗ Erro ao regenerar PDF: ${error.message}`, 'red');
    logger.error(`[regenerate-missing-contract-pdfs] Erro ao regenerar contrato ${contract.id}`, {
      contractId: contract.id,
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      contractId: contract.id,
      userId: contract.user_id,
      error: error.message,
    };
  }
}

/**
 * Script principal
 */
async function main() {
  log('\n=== Regeneração de PDFs de Contratos ===\n', 'magenta');

  try {
    // 1. Buscar contratos sem PDF
    log('1. Buscando contratos sem PDF...', 'cyan');
    const contractsWithoutPDF = await Contract.findAll({
      where: {
        [Op.or]: [
          { file_path: null },
          { file_name: null },
        ],
        deleted_at: null,
      },
      order: [['created_at', 'ASC']],
    });

    if (contractsWithoutPDF.length === 0) {
      log('✓ Não há contratos sem PDF!', 'green');
      log('\nFinalizado com sucesso.\n', 'green');
      return;
    }

    log(`Encontrados ${contractsWithoutPDF.length} contrato(s) sem PDF:\n`, 'yellow');
    contractsWithoutPDF.forEach((contract, index) => {
      log(
        `  ${index + 1}. ID: ${contract.id}, User: ${contract.user_id}, Semester: ${contract.semester}/${contract.year}, Created: ${contract.created_at.toLocaleDateString('pt-BR')}`,
        'blue'
      );
    });
    log('');

    // 2. Confirmar com o usuário
    log('Deseja regenerar os PDFs para esses contratos?', 'yellow');
    log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...', 'yellow');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    log('');

    // 3. Regenerar PDFs
    log('2. Regenerando PDFs...\n', 'cyan');
    const results = [];

    for (let i = 0; i < contractsWithoutPDF.length; i++) {
      const contract = contractsWithoutPDF[i];
      log(`[${i + 1}/${contractsWithoutPDF.length}] Processando contrato ID ${contract.id}...`, 'cyan');
      const result = await regenerateContractPDF(contract);
      results.push(result);
      log('');
    }

    // 4. Exibir relatório
    log('\n=== RELATÓRIO DE REGENERAÇÃO ===\n', 'magenta');

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    log(`Total de contratos processados: ${results.length}`, 'blue');
    log(`✓ Sucessos: ${successes.length}`, 'green');
    log(`✗ Falhas: ${failures.length}`, 'red');
    log('');

    if (successes.length > 0) {
      log('Contratos regenerados com sucesso:', 'green');
      successes.forEach((result, index) => {
        log(
          `  ${index + 1}. Contract ID: ${result.contractId}, User: ${result.userName}, File: ${result.fileName}`,
          'green'
        );
      });
      log('');
    }

    if (failures.length > 0) {
      log('Contratos com erro:', 'red');
      failures.forEach((result, index) => {
        log(`  ${index + 1}. Contract ID: ${result.contractId}, Erro: ${result.error}`, 'red');
      });
      log('');
      log('⚠ Verifique os logs em backend/logs/error.log para mais detalhes', 'yellow');
    }

    log('\n=== Finalizado ===\n', 'magenta');

    if (failures.length === 0) {
      log('✓ Todos os PDFs foram regenerados com sucesso!', 'green');
    } else {
      log(`⚠ ${failures.length} contrato(s) falharam. Revise os erros acima.`, 'yellow');
    }
  } catch (error) {
    log(`\n✗ Erro fatal durante execução: ${error.message}`, 'red');
    log(`Stack: ${error.stack}`, 'red');
    logger.error('[regenerate-missing-contract-pdfs] Erro fatal', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Executar script
main()
  .then(() => {
    log('\nScript finalizado.\n', 'green');
    process.exit(0);
  })
  .catch((error) => {
    log(`\n✗ Erro não tratado: ${error.message}`, 'red');
    logger.error('[regenerate-missing-contract-pdfs] Erro não tratado', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
