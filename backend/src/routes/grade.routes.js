/**
 * Arquivo: backend/src/routes/grade.routes.js
 * Descrição: Rotas para lançamento e gerenciamento de notas
 * Feature: feat-053 - Criar GradeController e rotas
 * Criado em: 2025-11-01
 *
 * Endpoints:
 * - POST /api/grades - Lançar nota
 * - PUT /api/grades/:id - Editar nota
 * - GET /api/evaluations/:evaluationId/grades - Listar notas de avaliação
 * - GET /api/evaluations/:evaluationId/grades/stats - Estatísticas de lançamento
 * - GET /api/evaluations/:evaluationId/grades/pending - Notas pendentes
 */

const express = require('express');
const router = express.Router();
const GradeController = require('../controllers/grade.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * POST /api/grades
 * Lança uma nota para um aluno em uma avaliação
 *
 * Requer: Autenticado (Professor ou Admin)
 *
 * Body:
 * {
 *   evaluation_id: number (obrigatório),
 *   student_id: number (obrigatório),
 *   grade?: number (0-10) - para avaliações numéricas,
 *   concept?: string (satisfactory|unsatisfactory) - para avaliações conceituais
 * }
 *
 * Respostas:
 * - 201: Nota lançada com sucesso
 * - 400: Dados inválidos
 * - 403: Sem permissão (não leciona a disciplina)
 * - 422: Validação de negócio falhou (aluno não está na turma, valor inválido)
 * - 500: Erro servidor
 */
router.post(
  '/',
  GradeController.create
);

/**
 * PUT /api/grades/:id
 * Atualiza uma nota existente
 *
 * Requer: Autenticado (Professor que criou ou Admin)
 *
 * Parâmetros:
 * - id (number): ID da nota
 *
 * Body:
 * {
 *   grade?: number (0-10),
 *   concept?: string (satisfactory|unsatisfactory)
 * }
 *
 * Respostas:
 * - 200: Nota atualizada com sucesso
 * - 400: Dados inválidos
 * - 403: Sem permissão
 * - 404: Nota não encontrada
 * - 422: Validação falhou
 * - 500: Erro servidor
 */
router.put(
  '/:id',
  GradeController.update
);

/**
 * GET /api/evaluations/:evaluationId/grades
 * Lista todas as notas de uma avaliação
 *
 * Requer: Autenticado (Professor que leciona ou Admin)
 *
 * Parâmetros:
 * - evaluationId (number): ID da avaliação
 *
 * Query params:
 * - includePending=true (opcional): Incluir alunos sem nota lançada
 *
 * Respostas:
 * - 200: Lista de notas
 * - 400: Parâmetros inválidos
 * - 403: Sem permissão
 * - 404: Avaliação não encontrada
 * - 500: Erro servidor
 */
router.get(
  '/evaluations/:id/grades',
  GradeController.getByEvaluation
);

/**
 * GET /api/evaluations/:evaluationId/grades/stats
 * Obtém estatísticas de lançamento de notas para uma avaliação
 *
 * Requer: Autenticado (Professor que leciona ou Admin)
 *
 * Parâmetros:
 * - evaluationId (number): ID da avaliação
 *
 * Respostas (200):
 * {
 *   success: true,
 *   data: {
 *     total: number (total de alunos da turma),
 *     launched: number (notas já lançadas),
 *     pending: number (notas ainda não lançadas)
 *   }
 * }
 */
router.get(
  '/evaluations/:id/grades/stats',
  GradeController.getStats
);

/**
 * GET /api/evaluations/:evaluationId/grades/pending
 * Lista alunos que ainda não tiveram nota lançada em uma avaliação
 *
 * Requer: Autenticado (Professor que leciona ou Admin)
 *
 * Parâmetros:
 * - evaluationId (number): ID da avaliação
 *
 * Respostas (200):
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       email: string
 *     }
 *   ],
 *   count: number
 * }
 */
router.get(
  '/evaluations/:id/grades/pending',
  GradeController.getPending
);

/**
 * GET /api/my-grades
 * Obtém todas as notas do aluno autenticado
 *
 * Requer: Autenticado (Estudante)
 *
 * Query params (opcionais):
 * - semester=number - Filtrar por número do semestre
 * - discipline_id=number - Filtrar por ID da disciplina
 *
 * Respostas (200):
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: number,
 *       evaluation: {
 *         id: number,
 *         name: string,
 *         date: string (YYYY-MM-DD),
 *         type: string (grade|concept)
 *       },
 *       class: {
 *         id: number,
 *         semester: number,
 *         year: number
 *       },
 *       discipline: {
 *         id: number,
 *         name: string,
 *         code: string
 *       },
 *       grade: number|null (0-10),
 *       concept: string|null (satisfactory|unsatisfactory),
 *       created_at: string (ISO 8601),
 *       updated_at: string (ISO 8601)
 *     }
 *   ],
 *   count: number,
 *   filters: object|null
 * }
 *
 * Respostas de erro:
 * - 400: Parâmetros de query inválidos
 * - 403: Usuário não é aluno
 * - 404: Aluno não encontrado (via service)
 * - 500: Erro servidor
 */
router.get(
  '/my-grades',
  GradeController.getMyGrades
);

module.exports = router;
