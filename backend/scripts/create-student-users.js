/**
 * Script: create-student-users.js
 * Descrição: Cria usuários de login para estudantes que ainda não possuem
 * Execução: MANUAL - executar apenas uma vez
 * Data: 2025-12-03
 *
 * IMPORTANTE:
 * - Este script deve ser executado MANUALMENTE apenas UMA VEZ
 * - Usa o campo MATRICULA do estudante como login e senha
 * - O hash da senha será gerado usando bcrypt (10 salt rounds)
 * - Apenas cria usuários para estudantes que NÃO possuem user_id
 *
 * Como executar:
 * 1. Certifique-se de que o banco de dados está configurado no .env
 * 2. Execute: node backend/scripts/create-student-users.js
 * 3. Aguarde o relatório de execução
 *
 * Exemplo de saída:
 * ========================================
 * RELATÓRIO DE CRIAÇÃO DE USUÁRIOS
 * ========================================
 * Total de estudantes: 150
 * Estudantes sem usuário: 120
 * Estudantes com usuário: 30
 * Usuários criados: 120
 * Erros: 0
 * ========================================
 */

'use strict';

const path = require('path');
const bcrypt = require('bcryptjs');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Importar models
const db = require('../src/models');
const { Student, User } = db;

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Função principal do script
 */
async function createStudentUsers() {
  console.log('\n========================================');
  console.log('CRIANDO USUÁRIOS PARA ESTUDANTES');
  console.log('========================================\n');

  try {
    // 1. Buscar todos os estudantes ativos
    console.log('[1/5] Buscando estudantes...');
    const students = await Student.findAll({
      where: {
        deleted_at: null,
      },
      include: [
        {
          model: User,
          as: 'user',
          required: false,
        },
      ],
    });

    console.log(`      ✓ Total de estudantes encontrados: ${students.length}\n`);

    // 2. Filtrar estudantes sem usuário e com matrícula
    console.log('[2/5] Filtrando estudantes sem usuário...');
    const studentsWithoutUser = students.filter((student) => {
      return (
        !student.user && // Não tem usuário
        student.matricula !== null && // Tem matrícula
        student.matricula !== undefined &&
        String(student.matricula).trim() !== '' // Matrícula não é vazia
      );
    });

    console.log(`      ✓ Estudantes sem usuário: ${studentsWithoutUser.length}`);
    console.log(
      `      ✓ Estudantes com usuário: ${students.length - studentsWithoutUser.length}\n`
    );

    if (studentsWithoutUser.length === 0) {
      console.log('      ℹ Todos os estudantes já possuem usuário!\n');
      console.log('========================================');
      console.log('SCRIPT CONCLUÍDO');
      console.log('========================================\n');
      process.exit(0);
    }

    // 3. Criar usuários
    console.log('[3/5] Criando usuários...');
    let created = 0;
    let errors = 0;
    const errorDetails = [];

    for (const student of studentsWithoutUser) {
      try {
        const matriculaStr = String(student.matricula);

        // Gerar hash da senha (matrícula)
        const passwordHash = await bcrypt.hash(matriculaStr, BCRYPT_SALT_ROUNDS);

        // Criar usuário
        await User.create({
          role: 'student',
          name: student.nome || `Estudante ${student.id}`,
          email: student.email || null,
          login: matriculaStr,
          password_hash: passwordHash,
          student_id: student.id,
        });

        created++;
        console.log(
          `      ✓ [${created}/${studentsWithoutUser.length}] Usuário criado para: ${student.nome} (Matrícula: ${matriculaStr})`
        );
      } catch (error) {
        errors++;
        const errorMsg = `Erro ao criar usuário para ${student.nome} (ID: ${student.id}): ${error.message}`;
        errorDetails.push(errorMsg);
        console.error(`      ✗ ${errorMsg}`);
      }
    }

    console.log('\n[4/5] Processamento concluído!');
    console.log(`      ✓ Usuários criados: ${created}`);
    console.log(`      ✗ Erros: ${errors}\n`);

    // 4. Exibir detalhes de erros, se houver
    if (errors > 0) {
      console.log('[5/5] Detalhes dos erros:');
      errorDetails.forEach((err, index) => {
        console.log(`      ${index + 1}. ${err}`);
      });
      console.log('');
    } else {
      console.log('[5/5] Nenhum erro encontrado!\n');
    }

    // 5. Relatório final
    console.log('========================================');
    console.log('RELATÓRIO FINAL');
    console.log('========================================');
    console.log(`Total de estudantes: ${students.length}`);
    console.log(`Estudantes sem usuário: ${studentsWithoutUser.length}`);
    console.log(`Estudantes com usuário: ${students.length - studentsWithoutUser.length}`);
    console.log(`Usuários criados: ${created}`);
    console.log(`Erros: ${errors}`);
    console.log('========================================\n');

    // Sair do processo
    process.exit(0);
  } catch (error) {
    console.error('\n✗ ERRO FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Executar script
 */
if (require.main === module) {
  console.log('\n🚀 Iniciando script de criação de usuários para estudantes...\n');

  // Testar conexão com banco antes de executar
  db.sequelize
    .authenticate()
    .then(() => {
      console.log('✓ Conexão com banco de dados estabelecida!\n');
      return createStudentUsers();
    })
    .catch((error) => {
      console.error('✗ Erro ao conectar ao banco de dados:', error.message);
      process.exit(1);
    });
}

module.exports = createStudentUsers;
