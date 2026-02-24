/**
 * Arquivo: backend/src/services/atestadoMatricula.service.js
 * Descrição: Serviço responsável pela geração de Atestado de Matrícula em PDF
 *            com assinatura eletrônica (hash) para validação pública.
 * Feature: Atestado de Matrícula com Assinatura Eletrônica
 * Criado em: 2026-02-24
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { Request } = require('../models');

/**
 * AtestadoMatriculaService
 *
 * Responsabilidades:
 * - Gerar PDF de Atestado de Matrícula com PDFKit
 * - Incluir logos da instituição no cabeçalho
 * - Inserir dados do aluno, curso e matrícula
 * - Gerar e garantir unicidade do hash de assinatura eletrônica (16 chars)
 * - Salvar PDF em diretório estruturado (uploads/atestados/)
 */
class AtestadoMatriculaService {
  /**
   * Caminhos das logos e assets
   */
  static LOGO_01_PATH = path.resolve(__dirname, '../../../docs/cliente/logo_01.png');
  static LOGO_02_PATH = path.resolve(__dirname, '../../../docs/cliente/logo_02.png');
  static OUTPUT_DIR = path.resolve(process.cwd(), 'uploads/atestados');

  /**
   * Gera o Atestado de Matrícula em PDF e retorna os dados do arquivo.
   *
   * @param {Object} data - Dados para o atestado
   * @param {number}  data.requestId    - ID da solicitação
   * @param {string}  data.studentName  - Nome completo do aluno
   * @param {string}  data.studentCpf   - CPF do aluno (formatado)
   * @param {string}  data.studentMatricula - Número de matrícula
   * @param {string}  data.courseName   - Nome do curso
   * @param {string}  data.enrollmentDate - Data de matrícula (YYYY-MM-DD)
   * @param {number}  data.currentSemester - Semestre atual
   * @param {string}  data.signatureHash - Hash de 16 chars já gerado
   *
   * @returns {Promise<Object>} Objeto com filePath, fileName e relativePath
   * @throws {Error} Se falhar a geração do arquivo PDF
   */
  static async generateAtestadoPDF(data) {
    try {
      this._validateData(data);

      await this._ensureDirectoryExists(this.OUTPUT_DIR);

      const fileName = `atestado_${data.requestId}_${Date.now()}.pdf`;
      const filePath = path.join(this.OUTPUT_DIR, fileName);
      const relativePath = `uploads/atestados/${fileName}`;

      await this._buildPDF(filePath, data);

      const stats = await fsPromises.stat(filePath);

      logger.info('[AtestadoMatriculaService] Atestado gerado com sucesso', {
        requestId: data.requestId,
        fileName,
        fileSize: stats.size,
      });

      return { filePath, fileName, relativePath, fileSize: stats.size };
    } catch (error) {
      logger.error('[AtestadoMatriculaService] Erro ao gerar atestado PDF', {
        requestId: data?.requestId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Gera um hash hexadecimal único de 16 caracteres para assinatura eletrônica.
   * Verifica unicidade na tabela requests antes de retornar.
   *
   * @returns {Promise<string>} Hash único de 16 chars
   */
  static async generateUniqueHash() {
    let hash;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      hash = crypto.randomBytes(8).toString('hex'); // 16 chars hexadecimais

      const existing = await Request.findOne({
        where: { signature_hash: hash },
        paranoid: false,
      });

      if (!existing) {
        isUnique = true;
      }

      attempts++;
    }

    if (!isUnique) {
      throw new Error('Não foi possível gerar um hash único para o atestado após múltiplas tentativas.');
    }

    return hash;
  }

  /**
   * Valida os dados obrigatórios para geração do atestado.
   *
   * @param {Object} data - Dados a validar
   * @throws {Error} Se dados obrigatórios estiverem ausentes
   * @private
   */
  static _validateData(data) {
    const required = ['requestId', 'studentName', 'courseName'];
    const missing = required.filter((f) => !data[f]);

    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios ausentes para o atestado: ${missing.join(', ')}`);
    }
  }

  /**
   * Garante que o diretório de saída existe, criando-o recursivamente se necessário.
   *
   * @param {string} dirPath - Caminho do diretório
   * @private
   */
  static async _ensureDirectoryExists(dirPath) {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }

  /**
   * Formata data para exibição em português (ex: 24 de fevereiro de 2026).
   *
   * @param {string|Date} dateValue - Data a formatar
   * @returns {string} Data formatada por extenso
   * @private
   */
  static _formatDateExtensive(dateValue) {
    const date = dateValue ? new Date(dateValue) : new Date();
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Formata CPF para exibição (000.000.000-00).
   *
   * @param {string} cpf - CPF sem formatação
   * @returns {string} CPF formatado
   * @private
   */
  static _formatCPF(cpf) {
    if (!cpf) return 'Não informado';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  /**
   * Constrói o documento PDF do atestado usando PDFKit.
   *
   * @param {string} filePath - Caminho completo para salvar o arquivo
   * @param {Object} data     - Dados do atestado
   * @returns {Promise<void>}
   * @private
   */
  static _buildPDF(filePath, data) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      try {
        this._addContent(doc, data);
      } catch (contentError) {
        doc.end();
        reject(contentError);
        return;
      }

      doc.end();

      writeStream.on('finish', resolve);
      writeStream.on('error', (err) => reject(new Error(`Erro ao escrever PDF: ${err.message}`)));
      doc.on('error', (err) => reject(new Error(`Erro no documento PDF: ${err.message}`)));
    });
  }

  /**
   * Adiciona todo o conteúdo ao documento PDF (cabeçalho, corpo, rodapé).
   *
   * @param {PDFDocument} doc  - Instância do documento PDFKit
   * @param {Object}      data - Dados do atestado
   * @private
   */
  static _addContent(doc, data) {
    const pageWidth = doc.page.width;
    const marginLeft = 50;
    const marginRight = 50;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // ── CABEÇALHO COM LOGOS ────────────────────────────────────────────────
    const logoHeight = 60;
    const logoWidth = 120;

    // Logo 01 (esquerda)
    if (fs.existsSync(this.LOGO_01_PATH)) {
      doc.image(this.LOGO_01_PATH, marginLeft, 40, {
        height: logoHeight,
        fit: [logoWidth, logoHeight],
      });
    }

    // Logo 02 (direita) — x já calculado explicitamente, align não é suportado em doc.image()
    if (fs.existsSync(this.LOGO_02_PATH)) {
      doc.image(this.LOGO_02_PATH, pageWidth - marginRight - logoWidth, 40, {
        height: logoHeight,
        fit: [logoWidth, logoHeight],
      });
    }

    // ── DADOS INSTITUCIONAIS (centralizados abaixo das logos) ─────────────
    const institutionTop = 40 + logoHeight + 8;

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#003580')
      .text(
        'INSTITUTO DE RESPONSABILIDADE SOCIAL - FILHOS DA TERRA',
        marginLeft,
        institutionTop,
        { align: 'center', width: contentWidth }
      );

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#444444');

    doc.text('Rua Irênio Marques da Silva 280 Alto da Jacobina Queimadas-Bahia – Cep 48860-000', { align: 'center', width: contentWidth });
    doc.text('Contato: 71 92003 7114 / 71 99915 7754', { align: 'center', width: contentWidth });
    doc.text('E-mail.: atendimento@ifterra.org.br', { align: 'center', width: contentWidth });
    doc.text('Cnpj: 56.194.857/0001-44', { align: 'center', width: contentWidth });
    doc.text('Site.: www.ifterra.org.br', { align: 'center', width: contentWidth });

    // Linha separadora abaixo dos dados institucionais
    const headerBottom = doc.y + 8;
    doc
      .moveTo(marginLeft, headerBottom)
      .lineTo(pageWidth - marginRight, headerBottom)
      .lineWidth(1.5)
      .strokeColor('#003580')
      .stroke();

    // ── TÍTULO ────────────────────────────────────────────────────────────
    doc.moveDown(1);
    doc.y = headerBottom + 30;

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#003580')
      .text('ATESTADO DE MATRÍCULA', marginLeft, doc.y, {
        align: 'center',
        width: contentWidth,
      });

    doc.moveDown(0.4);

    // Linha decorativa abaixo do título
    doc
      .moveTo(marginLeft + contentWidth * 0.25, doc.y)
      .lineTo(marginLeft + contentWidth * 0.75, doc.y)
      .lineWidth(0.8)
      .strokeColor('#003580')
      .stroke();

    doc.moveDown(1.5);

    // ── CORPO DO DOCUMENTO ────────────────────────────────────────────────
    const semesterLabel = data.currentSemester
      ? `${data.currentSemester}º (${this._semesterOrdinal(data.currentSemester)}) semestre`
      : 'semestre em andamento';

    const enrollmentDateFormatted = data.enrollmentDate
      ? new Date(data.enrollmentDate).toLocaleDateString('pt-BR')
      : 'data não informada';

    const cpfFormatted = this._formatCPF(data.studentCpf);
    const matriculaLabel = data.studentMatricula
      ? `matrícula nº ${data.studentMatricula}`
      : '';

    const bodyText =
      `Declaramos para os devidos fins que ${data.studentName}, ` +
      `portador(a) do CPF nº ${cpfFormatted}` +
      (matriculaLabel ? `, ${matriculaLabel},` : ',') +
      ` encontra-se regularmente matriculado(a) no Curso de ` +
      `${data.courseName}, ` +
      `com matrícula realizada em ${enrollmentDateFormatted}, ` +
      `cursando atualmente o ${semesterLabel}.`;

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#000000')
      .text(bodyText, marginLeft, doc.y, {
        align: 'justify',
        width: contentWidth,
        lineGap: 4,
      });

    doc.moveDown(1.2);

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#000000')
      .text(
        'Esta declaração é expedida a pedido do(a) interessado(a), ' +
          'para os fins que se fizer necessário.',
        marginLeft,
        doc.y,
        { align: 'justify', width: contentWidth, lineGap: 4 }
      );

    // ── GRADE DE HORÁRIOS ─────────────────────────────────────────────────
    this._addScheduleSection(doc, data.schedules || [], marginLeft, contentWidth);

    doc.moveDown(2.5);

    // ── LOCAL E DATA ──────────────────────────────────────────────────────
    const dateExtensive = this._formatDateExtensive(new Date());

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#000000')
      .text(`São Paulo, ${dateExtensive}.`, marginLeft, doc.y, {
        align: 'center',
        width: contentWidth,
      });

    doc.moveDown(3);

    // ── ÁREA DE ASSINATURA ────────────────────────────────────────────────
    const sigLineX = marginLeft + contentWidth * 0.2;
    const sigLineEnd = pageWidth - marginRight - contentWidth * 0.2;
    const sigLineY = doc.y;

    doc
      .moveTo(sigLineX, sigLineY)
      .lineTo(sigLineEnd, sigLineY)
      .lineWidth(0.8)
      .strokeColor('#000000')
      .stroke();

    doc.moveDown(0.4);

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#000000')
      .text('Secretaria Acadêmica', marginLeft, doc.y, {
        align: 'center',
        width: contentWidth,
      });

    // ── RODAPÉ COM HASH ───────────────────────────────────────────────────
    const footerY = doc.page.height - 70;

    doc
      .moveTo(marginLeft, footerY)
      .lineTo(pageWidth - marginRight, footerY)
      .lineWidth(0.5)
      .strokeColor('#cccccc')
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'Documento gerado eletronicamente pelo Sistema de Secretaria Online.',
        marginLeft,
        footerY + 8,
        { align: 'center', width: contentWidth }
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#333333')
      .text(
        `Assinatura Eletrônica: ${data.signatureHash}`,
        marginLeft,
        footerY + 20,
        { align: 'center', width: contentWidth }
      );

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#888888')
      .text(
        'Para verificar a autenticidade deste documento acesse: /verificar-atestado',
        marginLeft,
        footerY + 32,
        { align: 'center', width: contentWidth }
      );
  }

  /**
   * Adiciona a grade de horários da turma ao documento PDF.
   * Desenha uma tabela com colunas: Dia | Horário | Disciplina | Professor.
   * Não renderiza nada se schedules estiver vazio.
   *
   * @param {PDFDocument} doc          - Instância do documento PDFKit
   * @param {Array}       schedules    - Lista de ClassSchedule (com discipline e teacher incluídos)
   * @param {number}      marginLeft   - Margem esquerda em pontos
   * @param {number}      contentWidth - Largura disponível para conteúdo
   * @private
   */
  static _addScheduleSection(doc, schedules, marginLeft, contentWidth) {
    if (!schedules || schedules.length === 0) return;

    const DAY_NAMES = {
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      7: 'Domingo',
    };

    doc.moveDown(1.5);

    // Título da seção
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#003580')
      .text('GRADE DE HORÁRIOS', marginLeft, doc.y, {
        align: 'center',
        width: contentWidth,
      });

    doc.moveDown(0.5);

    // Definição das colunas: Dia | Horário | Disciplina | Professor
    const colWidths = [120, 90, 185, 100];
    const headers = ['Dia', 'Horário', 'Disciplina', 'Professor'];
    const headerHeight = 20;
    const rowHeight = 18;
    const padX = 4;
    const padY = 4;

    let tableY = doc.y;
    const tableStartY = tableY;

    // ── Cabeçalho da tabela ────────────────────────────────────────────────
    doc.rect(marginLeft, tableY, contentWidth, headerHeight).fill('#003580');

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
    let colX = marginLeft;
    headers.forEach((h, i) => {
      doc.text(h, colX + padX, tableY + padY, {
        width: colWidths[i] - padX * 2,
        lineBreak: false,
      });
      colX += colWidths[i];
    });

    tableY += headerHeight;

    // ── Linhas de dados ────────────────────────────────────────────────────
    schedules.forEach((schedule, index) => {
      const rowBg = index % 2 === 0 ? '#eef2ff' : '#ffffff';

      doc.rect(marginLeft, tableY, contentWidth, rowHeight).fill(rowBg);

      colX = marginLeft;
      doc.font('Helvetica').fontSize(8).fillColor('#111111');

      // Dia da semana
      doc.text(DAY_NAMES[schedule.day_of_week] || '', colX + padX, tableY + padY, {
        width: colWidths[0] - padX * 2,
        lineBreak: false,
      });
      colX += colWidths[0];

      // Horário (HH:MM – HH:MM)
      const start = (schedule.start_time || '').substring(0, 5);
      const end = (schedule.end_time || '').substring(0, 5);
      doc.text(`${start} – ${end}`, colX + padX, tableY + padY, {
        width: colWidths[1] - padX * 2,
        lineBreak: false,
      });
      colX += colWidths[1];

      // Disciplina
      doc.text(schedule.discipline?.name || '', colX + padX, tableY + padY, {
        width: colWidths[2] - padX * 2,
        lineBreak: false,
      });
      colX += colWidths[2];

      // Professor
      doc.text(schedule.teacher?.nome || '–', colX + padX, tableY + padY, {
        width: colWidths[3] - padX * 2,
        lineBreak: false,
      });

      tableY += rowHeight;
    });

    // ── Borda externa da tabela ────────────────────────────────────────────
    doc
      .rect(marginLeft, tableStartY, contentWidth, tableY - tableStartY)
      .lineWidth(0.5)
      .strokeColor('#003580')
      .stroke();

    // ── Divisórias verticais entre colunas ────────────────────────────────
    colX = marginLeft;
    [colWidths[0], colWidths[1], colWidths[2]].forEach((w) => {
      colX += w;
      doc
        .moveTo(colX, tableStartY)
        .lineTo(colX, tableY)
        .lineWidth(0.3)
        .strokeColor('#aaaaaa')
        .stroke();
    });

    // Avança o cursor para abaixo da tabela
    doc.y = tableY;
  }

  /**
   * Retorna o ordinal por extenso do semestre.
   *
   * @param {number} n - Número do semestre
   * @returns {string} Ex: "primeiro", "segundo", etc.
   * @private
   */
  static _semesterOrdinal(n) {
    const ordinals = [
      '', 'primeiro', 'segundo', 'terceiro', 'quarto',
      'quinto', 'sexto', 'sétimo', 'oitavo', 'nono',
      'décimo', 'décimo primeiro', 'décimo segundo',
    ];
    return ordinals[n] || `${n}º`;
  }
}

module.exports = AtestadoMatriculaService;
