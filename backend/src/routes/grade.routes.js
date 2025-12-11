/**
 * Arquivo: backend/src/routes/grade.routes.js
 * Descrição: Rotas para lançamento e gerenciamento de notas
 * Feature: feat-053 - Criar GradeController e rotas
 * Criado em: 2025-11-01
 * Atualizado em: 2025-12-11
 *
 * Endpoints:
 * - POST /api/grades - Lançar nota individual
 * - PUT /api/grades/:id - Editar nota
 * - GET /api/grades/my-grades - Obter minhas notas (aluno)
 *
 * Nota: Rotas relacionadas a avaliações estão em evaluation.routes.js:
 * - GET /api/evaluations/:id/grades - Listar notas de avaliação
 * - GET /api/evaluations/:id/grades/stats - Estatísticas de lançamento
 * - GET /api/evaluations/:id/grades/pending - Notas pendentes
 * - POST /api/evaluations/:id/grades/batch - Lançamento em lote
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
 * GET /api/grades/my-grades
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
