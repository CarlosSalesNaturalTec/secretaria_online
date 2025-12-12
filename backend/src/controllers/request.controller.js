/**
 * Arquivo: backend/src/controllers/request.controller.js
 * Descrição: Controller para gerenciar solicitações de alunos
 * Feature: feat-056 - Criar RequestController e rotas
 * Modificado: feat-057 - Adicionar filtros e paginação para solicitações
 * Criado em: 2025-11-03
 * Atualizado em: 2025-11-03
 */

const { Request, RequestType, User } = require('../models');

/**
 * Controller de Solicitações
 *
 * Responsabilidades:
 * - Permitir que alunos criem solicitações
 * - Permitir que alunos visualizem suas próprias solicitações
 * - Permitir que admins visualizem todas as solicitações
 * - Permitir que admins aprovem ou rejeitem solicitações
 *
 * @example
 * // Aluno cria solicitação
 * POST /api/requests
 * Body: { request_type_id: 1, description: "Preciso do histórico escolar" }
 *
 * @example
 * // Admin aprova solicitação
 * PUT /api/requests/5/approve
 * Body: { observations: "Aprovado conforme documentação" }
 */
class RequestController {
  /**
   * Cria uma nova solicitação
   *
   * Permite que alunos criem solicitações. Admins podem criar para qualquer aluno.
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Solicitação criada
   * @throws {Error} Se dados inválidos ou tipo de solicitação inexistente
   */
  async create(req, res) {
    try {
      const { request_type_id, description, student_id } = req.body;
      const { user } = req;

      // Validação de campos obrigatórios
      if (!request_type_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tipo de solicitação é obrigatório',
            details: [
              {
                field: 'request_type_id',
                message: 'Campo obrigatório'
              }
            ]
          }
        });
      }

      // Verificar se o tipo de solicitação existe
      const requestType = await RequestType.findByPk(request_type_id);
      if (!requestType) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'REQUEST_TYPE_NOT_FOUND',
            message: 'Tipo de solicitação não encontrado'
          }
        });
      }

      // Determinar o student_id baseado no role do usuário
      let finalStudentId;

      if (user.role === 'student') {
        // Alunos só podem criar solicitações para si mesmos
        finalStudentId = user.id;

        // Se tentou especificar outro aluno, retornar erro
        if (student_id && student_id !== user.id) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você só pode criar solicitações para si mesmo'
            }
          });
        }
      } else if (user.role === 'admin') {
        // Admins devem especificar o aluno
        if (!student_id) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'ID do aluno é obrigatório para administradores',
              details: [
                {
                  field: 'student_id',
                  message: 'Campo obrigatório'
                }
              ]
            }
          });
        }

        // Verificar se o aluno existe
        const student = await User.findOne({
          where: { id: student_id, role: 'student' }
        });

        if (!student) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'STUDENT_NOT_FOUND',
              message: 'Aluno não encontrado'
            }
          });
        }

        finalStudentId = student_id;
      } else {
        // Professores não podem criar solicitações
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Apenas alunos e administradores podem criar solicitações'
          }
        });
      }

      // Criar a solicitação
      const request = await Request.create({
        student_id: finalStudentId,
        request_type_id,
        description: description || null,
        status: 'pending'
      });

      // Buscar a solicitação criada com relações
      const requestWithRelations = await Request.scope('withRelations').findByPk(request.id);

      console.log(`[RequestController] Solicitação criada (ID: ${request.id}, Aluno: ${finalStudentId}, Tipo: ${request_type_id})`);

      return res.status(201).json({
        success: true,
        message: 'Solicitação criada com sucesso',
        data: requestWithRelations
      });
    } catch (error) {
      console.error('[RequestController] Erro ao criar solicitação:', error);

      // Tratar erros de validação do Sequelize
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: error.errors.map(err => ({
              field: err.path,
              message: err.message
            }))
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar solicitação',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Lista solicitações
   *
   * - Admins veem todas as solicitações
   * - Alunos veem apenas suas próprias solicitações
   * - Suporta paginação e filtros
   *
   * Query params:
   * - status: pending|approved|rejected
   * - student_id: ID do aluno (apenas para admins)
   * - page: Número da página (padrão: 1)
   * - limit: Itens por página (padrão: 20, máx: 100)
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Lista de solicitações com metadados de paginação
   */
  async list(req, res) {
    try {
      const { user } = req;
      const { status, student_id, page, limit } = req.query;

      let whereConditions = {
        deleted_at: null
      };

      // Se for aluno, só pode ver suas próprias solicitações
      if (user.role === 'student') {
        whereConditions.student_id = user.id;

        // Aluno não pode filtrar por student_id diferente do seu
        if (student_id && parseInt(student_id) !== user.id) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você só pode visualizar suas próprias solicitações'
            }
          });
        }
      } else if (user.role === 'admin') {
        // Admin pode filtrar por aluno específico se desejado
        if (student_id) {
          whereConditions.student_id = student_id;
        }
      } else {
        // Professores não podem listar solicitações
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para visualizar solicitações'
          }
        });
      }

      // Filtro por status se fornecido
      if (status) {
        if (!['pending', 'approved', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Status inválido. Use: pending, approved ou rejected'
            }
          });
        }
        whereConditions.status = status;
      }

      // Configurar paginação
      const pageNumber = parseInt(page) || 1;
      let limitNumber = parseInt(limit) || 20;

      // Validar valores de paginação
      if (pageNumber < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Número da página deve ser maior ou igual a 1'
          }
        });
      }

      if (limitNumber < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limite deve ser maior ou igual a 1'
          }
        });
      }

      // Limitar o máximo de itens por página
      if (limitNumber > 100) {
        limitNumber = 100;
      }

      const offset = (pageNumber - 1) * limitNumber;

      // Buscar solicitações com paginação
      const { count, rows: requests } = await Request.scope('withRelations').findAndCountAll({
        where: whereConditions,
        order: [['created_at', 'DESC']],
        limit: limitNumber,
        offset: offset
      });

      // Calcular metadados de paginação
      const totalPages = Math.ceil(count / limitNumber);
      const hasNextPage = pageNumber < totalPages;
      const hasPreviousPage = pageNumber > 1;

      console.log(`[RequestController] Listando ${requests.length} de ${count} solicitações (página ${pageNumber}/${totalPages}) para usuário ${user.id} (${user.role})`);

      return res.json({
        success: true,
        data: requests,
        pagination: {
          total: count,
          page: pageNumber,
          limit: limitNumber,
          totalPages: totalPages,
          hasNextPage: hasNextPage,
          hasPreviousPage: hasPreviousPage
        }
      });
    } catch (error) {
      console.error('[RequestController] Erro ao listar solicitações:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao listar solicitações',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Busca uma solicitação por ID
   *
   * - Admins podem ver qualquer solicitação
   * - Alunos só podem ver suas próprias solicitações
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Solicitação encontrada
   * @throws {Error} Se solicitação não encontrada ou sem permissão
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      // Buscar solicitação
      const request = await Request.scope('withRelations').findOne({
        where: {
          id,
          deleted_at: null
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: 'Solicitação não encontrada'
          }
        });
      }

      // Verificar permissão
      if (user.role === 'student' && request.student_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para visualizar esta solicitação'
          }
        });
      }

      console.log(`[RequestController] Solicitação ${id} visualizada por usuário ${user.id} (${user.role})`);

      return res.json({
        success: true,
        data: request
      });
    } catch (error) {
      console.error('[RequestController] Erro ao buscar solicitação:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar solicitação',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Aprova uma solicitação
   *
   * Apenas administradores podem aprovar solicitações.
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Solicitação aprovada
   * @throws {Error} Se solicitação não encontrada ou já processada
   */
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { observations } = req.body;
      const { user } = req;

      // Buscar solicitação
      const request = await Request.findOne({
        where: {
          id,
          deleted_at: null
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: 'Solicitação não encontrada'
          }
        });
      }

      // Verificar se já foi processada
      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REQUEST_ALREADY_PROCESSED',
            message: `Esta solicitação já foi ${request.getStatusLabel().toLowerCase()}`
          }
        });
      }

      // Aprovar usando método do model
      await request.approve(user.id, observations);

      // Recarregar com relações
      const updatedRequest = await Request.scope('withRelations').findByPk(request.id);

      console.log(`[RequestController] Solicitação ${id} aprovada por usuário ${user.id}`);

      return res.json({
        success: true,
        message: 'Solicitação aprovada com sucesso',
        data: updatedRequest
      });
    } catch (error) {
      console.error('[RequestController] Erro ao aprovar solicitação:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao aprovar solicitação',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Rejeita uma solicitação
   *
   * Apenas administradores podem rejeitar solicitações.
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Solicitação rejeitada
   * @throws {Error} Se solicitação não encontrada ou já processada
   */
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { observations } = req.body;
      const { user } = req;

      // Buscar solicitação
      const request = await Request.findOne({
        where: {
          id,
          deleted_at: null
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: 'Solicitação não encontrada'
          }
        });
      }

      // Verificar se já foi processada
      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REQUEST_ALREADY_PROCESSED',
            message: `Esta solicitação já foi ${request.getStatusLabel().toLowerCase()}`
          }
        });
      }

      // Rejeitar usando método do model
      await request.reject(user.id, observations);

      // Recarregar com relações
      const updatedRequest = await Request.scope('withRelations').findByPk(request.id);

      console.log(`[RequestController] Solicitação ${id} rejeitada por usuário ${user.id}`);

      return res.json({
        success: true,
        message: 'Solicitação rejeitada com sucesso',
        data: updatedRequest
      });
    } catch (error) {
      console.error('[RequestController] Erro ao rejeitar solicitação:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao rejeitar solicitação',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Obter estatísticas de solicitações
   *
   * Retorna contagem total e por status de todas as solicitações.
   * Apenas administradores podem acessar.
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Estatísticas de solicitações
   * @throws {Error} Se ocorrer erro ao buscar estatísticas
   *
   * @example
   * GET /api/requests/stats
   * Response: {
   *   "success": true,
   *   "data": {
   *     "total": 45,
   *     "pending": 12,
   *     "approved": 28,
   *     "rejected": 5
   *   }
   * }
   */
  async getStats(req, res) {
    try {
      // Contar total de solicitações
      const total = await Request.count({
        where: { deleted_at: null }
      });

      // Contar por status
      const pending = await Request.count({
        where: {
          status: 'pending',
          deleted_at: null
        }
      });

      const approved = await Request.count({
        where: {
          status: 'approved',
          deleted_at: null
        }
      });

      const rejected = await Request.count({
        where: {
          status: 'rejected',
          deleted_at: null
        }
      });

      console.log(`[RequestController] Estatísticas obtidas por usuário ${req.user.id}`);

      return res.json({
        success: true,
        data: {
          total,
          pending,
          approved,
          rejected
        }
      });
    } catch (error) {
      console.error('[RequestController] Erro ao buscar estatísticas:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar estatísticas de solicitações',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Listar todos os tipos de solicitação
   *
   * Retorna lista de todos os tipos de solicitação disponíveis no sistema.
   * Acessível por alunos e administradores.
   *
   * @param {object} req - Objeto de requisição do Express
   * @param {object} res - Objeto de resposta do Express
   * @returns {Promise<object>} Lista de tipos de solicitação
   * @throws {Error} Se ocorrer erro ao buscar tipos
   *
   * @example
   * GET /api/requests/types
   * Response: {
   *   "success": true,
   *   "data": {
   *     "requestTypes": [
   *       {
   *         "id": 1,
   *         "name": "Histórico Escolar",
   *         "description": "Solicitação de histórico escolar completo",
   *         "expected_days": 5
   *       }
   *     ]
   *   }
   * }
   */
  async listRequestTypes(req, res) {
    try {
      const requestTypes = await RequestType.findAll({
        where: { deleted_at: null, is_active: true },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'description', 'response_deadline_days', 'created_at', 'updated_at']
      });

      // Converter snake_case para camelCase para compatibilidade com frontend
      const formattedRequestTypes = requestTypes.map(type => ({
        id: type.id,
        name: type.name,
        description: type.description,
        expectedDays: type.response_deadline_days,
        createdAt: type.created_at,
        updatedAt: type.updated_at
      }));

      console.log(`[RequestController] ${formattedRequestTypes.length} tipos de solicitação listados por usuário ${req.user.id} (${req.user.role})`);

      return res.json({
        success: true,
        data: {
          requestTypes: formattedRequestTypes
        }
      });
    } catch (error) {
      console.error('[RequestController] Erro ao listar tipos de solicitação:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao listar tipos de solicitação',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }
}

module.exports = new RequestController();
