/**
 * Arquivo: backend/database/seeders/20251027211322-document-types.js
 * Descrição: Seeder para criar tipos de documentos padrão para alunos e professores
 * Feature: feat-016 - Criar seeders de dados iniciais
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Cria tipos de documentos obrigatórios para alunos e professores
     *
     * user_type: 'student' | 'teacher' | 'both'
     * is_required: true | false
     */

    // Verificar se já existem tipos de documentos
    const [existingTypes] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM document_types;`
    );

    if (existingTypes[0].count > 0) {
      console.log('⚠️  Tipos de documentos já existem. Seeder ignorado.');
      return;
    }

    const documentTypes = [
      // Documentos para ALUNOS
      {
        name: 'RG (Frente e Verso)',
        description: 'Cópia do RG (Registro Geral) - frente e verso',
        user_type: 'student',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'CPF',
        description: 'Cópia do CPF (Cadastro de Pessoa Física)',
        user_type: 'student',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Comprovante de Residência',
        description: 'Comprovante de residência atualizado (máximo 3 meses)',
        user_type: 'student',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Foto 3x4',
        description: 'Foto 3x4 recente',
        user_type: 'student',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Certificado de Conclusão do Ensino Médio',
        description: 'Certificado de conclusão do ensino médio ou equivalente',
        user_type: 'student',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Histórico Escolar do Ensino Médio',
        description: 'Histórico escolar completo do ensino médio',
        user_type: 'student',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Certidão de Nascimento ou Casamento',
        description: 'Certidão de nascimento ou casamento (cópia autenticada)',
        user_type: 'student',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Título de Eleitor',
        description: 'Cópia do título de eleitor',
        user_type: 'student',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Reservista (Masculino)',
        description: 'Certificado de reservista ou documento de dispensa (obrigatório para homens)',
        user_type: 'student',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },

      // Documentos para PROFESSORES
      {
        name: 'RG (Frente e Verso)',
        description: 'Cópia do RG (Registro Geral) - frente e verso',
        user_type: 'teacher',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'CPF',
        description: 'Cópia do CPF (Cadastro de Pessoa Física)',
        user_type: 'teacher',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Comprovante de Residência',
        description: 'Comprovante de residência atualizado (máximo 3 meses)',
        user_type: 'teacher',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Foto 3x4',
        description: 'Foto 3x4 recente',
        user_type: 'teacher',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Diploma de Graduação',
        description: 'Diploma de graduação (cópia autenticada)',
        user_type: 'teacher',
        is_required: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Título de Pós-Graduação',
        description: 'Título de especialização, mestrado ou doutorado (se aplicável)',
        user_type: 'teacher',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Currículo Lattes',
        description: 'Currículo Lattes atualizado (PDF)',
        user_type: 'teacher',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Certificado de Reservista (Masculino)',
        description: 'Certificado de reservista ou documento de dispensa (obrigatório para homens)',
        user_type: 'teacher',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },

      // Documentos para AMBOS (alunos e professores)
      {
        name: 'Atestado Médico',
        description: 'Atestado médico de aptidão física',
        user_type: 'both',
        is_required: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    await queryInterface.bulkInsert('document_types', documentTypes, {});

    console.log(`✅ ${documentTypes.length} tipos de documentos criados com sucesso!`);
    console.log(`   - ${documentTypes.filter(d => d.user_type === 'student').length} para alunos`);
    console.log(`   - ${documentTypes.filter(d => d.user_type === 'teacher').length} para professores`);
    console.log(`   - ${documentTypes.filter(d => d.user_type === 'both').length} para ambos`);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove todos os tipos de documentos criados
     */
    await queryInterface.bulkDelete('document_types', null, {});
    console.log('✅ Tipos de documentos removidos.');
  }
};
