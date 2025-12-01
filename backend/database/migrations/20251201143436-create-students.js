/**
 * Arquivo: database/migrations/20251201143436-create-students.js
 * Descrição: Migration para criação da tabela students (alunos)
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-12-01
 *
 * Esta migration cria a tabela students que armazena dados completos dos alunos.
 * Os alunos terão registros tanto em students quanto em users (via student_id).
 *
 * Implementa soft delete através do campo deleted_at (paranoid)
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Método executado ao rodar a migration (npm run db:migrate)
   * Cria a tabela students com todos os campos, índices e constraints
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize com tipos de dados
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      // Chave primária
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do estudante (auto-incremento)',
      },

      // Dados pessoais
      nome: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Nome completo do estudante',
      },

      cpf: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
        comment: 'CPF do estudante',
      },

      data_nascimento: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Data de nascimento',
      },

      telefone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Telefone fixo',
      },

      email: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Email do estudante',
      },

      // Endereço
      endereco_rua: {
        type: Sequelize.STRING(300),
        allowNull: true,
        comment: 'Rua/Logradouro',
      },

      endereco_numero: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Número do endereço',
      },

      endereco_complemento: {
        type: Sequelize.STRING(2000),
        allowNull: true,
        comment: 'Complemento do endereço',
      },

      endereco_bairro: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Bairro',
      },

      endereco_cidade: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Cidade',
      },

      endereco_uf: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: 'UF (Estado)',
      },

      cep: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'CEP',
      },

      // Dados adicionais
      sexo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Sexo: 1 = masculino, 2 = feminino',
      },

      celular: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Celular',
      },

      categoria: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Categoria do estudante',
      },

      sub_categoria: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Sub-categoria do estudante',
      },

      matricula: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Número de matrícula',
      },

      ano_matricula: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Ano da matrícula',
      },

      profissao: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Profissão do estudante',
      },

      responsavel: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Responsável legal (se menor de idade)',
      },

      contrato: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Referência ao contrato',
      },

      foto: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Caminho da foto do estudante',
      },

      senha: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Senha (deprecated - usar tabela users)',
      },

      // Filiação
      mae: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nome da mãe',
      },

      pai: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nome do pai',
      },

      // Documentos
      titulo_eleitor: {
        type: Sequelize.STRING(25),
        allowNull: true,
        comment: 'Título de eleitor',
      },

      rg: {
        type: Sequelize.STRING(15),
        allowNull: true,
        comment: 'RG',
      },

      rg_data: {
        type: Sequelize.STRING(15),
        allowNull: true,
        comment: 'Data de emissão do RG',
      },

      // Dados acadêmicos
      serie: {
        type: Sequelize.STRING(35),
        allowNull: true,
        comment: 'Série/Período',
      },

      curso: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Curso',
      },

      semestre: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Semestre atual',
      },

      // Contrato
      contrato_aceito: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: 'Contrato aceito: S/N',
      },

      contrato_dia: {
        type: Sequelize.STRING(5),
        allowNull: true,
        comment: 'Dia de aceite do contrato',
      },

      contrato_mes: {
        type: Sequelize.STRING(5),
        allowNull: true,
        comment: 'Mês de aceite do contrato',
      },

      contrato_ano: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Ano de aceite do contrato',
      },

      // Outros
      chave_eletronica: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Chave eletrônica de acesso',
      },

      data_geral: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Data geral de cadastro',
      },

      // Timestamps padrão do Sequelize
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora de criação do registro',
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora da última atualização do registro',
      },

      // Soft delete (paranoid)
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment:
          'Data e hora de exclusão lógica (soft delete). Null = ativo, Data = excluído',
      },
    });

    // Índices para otimização de queries

    // Índice único para CPF
    await queryInterface.addIndex('students', ['cpf'], {
      name: 'idx_students_cpf',
      unique: true,
      comment: 'Índice único para garantir CPFs únicos e acelerar buscas por CPF',
    });

    // Índice para email
    await queryInterface.addIndex('students', ['email'], {
      name: 'idx_students_email',
      comment: 'Índice para acelerar buscas por email',
    });

    // Índice para matrícula
    await queryInterface.addIndex('students', ['matricula'], {
      name: 'idx_students_matricula',
      comment: 'Índice para acelerar buscas por matrícula',
    });

    // Índice para deleted_at (paranoid queries)
    await queryInterface.addIndex('students', ['deleted_at'], {
      name: 'idx_students_deleted_at',
      comment: 'Índice para acelerar queries de soft delete (apenas registros ativos)',
    });

    console.log('✓ Tabela students criada com sucesso');
  },

  /**
   * Método executado ao reverter a migration (npm run db:migrate:undo)
   * Remove a tabela students e todos os dados
   *
   * @param {import('sequelize').QueryInterface} queryInterface - Interface para manipular o banco
   * @param {import('sequelize').Sequelize} Sequelize - Classe Sequelize
   */
  async down(queryInterface, Sequelize) {
    // Remover índices primeiro
    await queryInterface.removeIndex('students', 'idx_students_cpf');
    await queryInterface.removeIndex('students', 'idx_students_email');
    await queryInterface.removeIndex('students', 'idx_students_matricula');
    await queryInterface.removeIndex('students', 'idx_students_deleted_at');

    // Remover tabela
    await queryInterface.dropTable('students');

    console.log('✓ Tabela students removida com sucesso');
  },
};
