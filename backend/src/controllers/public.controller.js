/**
 * Arquivo: backend/src/controllers/public.controller.js
 * Descrição: Controller para endpoints públicos (sem autenticação)
 *            incluindo a verificação de autenticidade de atestados de matrícula.
 * Feature: Atestado de Matrícula com Assinatura Eletrônica
 * Criado em: 2026-02-24
 */

const { Request, RequestType, Student, Enrollment, Course } = require('../models');

/**
 * PublicController
 *
 * Responsabilidades:
 * - Fornecer endpoint público para verificar autenticidade de atestados
 * - Retornar dados do atestado sem expor informações sensíveis
 * - Acessível sem autenticação (JWT não exigido)
 */
class PublicController {
  /**
   * Verifica a autenticidade de um atestado de matrícula pelo hash.
   *
   * Retorna dados básicos do atestado se o hash for válido, ou
   * informa que o documento não foi encontrado.
   *
   * @route  GET /api/v1/public/verify-atestado/:hash
   * @access Público (sem autenticação)
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Dados do atestado ou mensagem de erro
   *
   * @example
   * // Resposta válida:
   * {
   *   "success": true,
   *   "valid": true,
   *   "data": {
   *     "studentName": "João Silva",
   *     "courseName": "Administração",
   *     "issuedAt": "2026-02-24T10:00:00.000Z",
   *     "signatureHash": "a1b2c3d4e5f67890"
   *   }
   * }
   */
  async verifyAtestado(req, res) {
    try {
      const { hash } = req.params;

      // Validar formato do hash (16 chars hexadecimais)
      if (!hash || !/^[0-9a-f]{16}$/i.test(hash)) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: {
            code: 'INVALID_HASH',
            message: 'Hash de assinatura inválido. O hash deve ter 16 caracteres hexadecimais.',
          },
        });
      }

      // Buscar solicitação pelo hash
      const request = await Request.findOne({
        where: {
          signature_hash: hash,
          status: 'approved',
          deleted_at: null,
        },
        include: [
          {
            association: 'requestType',
            attributes: ['id', 'name'],
          },
          {
            association: 'student',
            attributes: ['id', 'nome', 'matricula'],
          },
        ],
      });

      if (!request) {
        return res.status(200).json({
          success: true,
          valid: false,
          message: 'Documento não encontrado. O código informado não corresponde a nenhum atestado válido emitido por este sistema.',
        });
      }

      // Buscar dados da matrícula para retornar o curso
      const enrollment = await Enrollment.findOne({
        where: {
          student_id: request.student_id,
          deleted_at: null,
        },
        include: [
          {
            association: 'course',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      const courseName = enrollment && enrollment.course
        ? enrollment.course.name
        : 'Informação não disponível';

      console.log(`[PublicController] Verificação de atestado - Hash: ${hash} - Válido: true`);

      return res.json({
        success: true,
        valid: true,
        message: 'Documento válido. Este atestado foi emitido e é autêntico.',
        data: {
          studentName: request.student ? request.student.nome : 'Não informado',
          studentMatricula: request.student ? request.student.matricula : null,
          courseName,
          issuedAt: request.reviewed_at,
          signatureHash: request.signature_hash,
          requestId: request.id,
        },
      });
    } catch (error) {
      console.error('[PublicController] Erro ao verificar atestado:', error);

      return res.status(500).json({
        success: false,
        valid: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao verificar o documento. Tente novamente.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      });
    }
  }
}

module.exports = new PublicController();
