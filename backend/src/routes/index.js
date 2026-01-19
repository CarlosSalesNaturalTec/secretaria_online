/**
 * Arquivo: backend/src/routes/index.js
 * Descrição: Agregador central de todas as rotas da API. Importa e monta todos os módulos de rotas
 *            com seus respectivos prefixos. Este arquivo é montado no Express com prefixo /api/v1
 *            no server.js.
 * Feature: feat-064 - Criar agregador de rotas routes/index.js
 * Atualizado em: 2025-11-03
 * Criado em: 2025-10-27
 *
 * Estrutura de Rotas:
 * - Base URL em produção: https://dominio.com/api/v1
 * - Base URL em desenvolvimento: http://localhost:3000/api/v1
 *
 * Responsabilidades:
 * - Importar todos os módulos de rotas
 * - Registrar rotas com seus respectivos prefixos
 * - Manter organização e documentação centralizada
 * - Facilitar manutenção e adição de novas rotas
 */

const express = require('express');

// ============================================================================
// IMPORTAÇÃO DE MÓDULOS DE ROTAS
// ============================================================================

// Autenticação e Autorização (feat-019)
const authRoutes = require('./auth.routes');

// Gerenciamento de Usuários (feat-020, feat-021)
const userRoutes = require('./user.routes');

// Gerenciamento de Estudantes (feat-029)
const studentRoutes = require('./student.routes');

// Gerenciamento de Professores (feat-030)
const teacherRoutes = require('./teacher.routes');

// Gerenciamento de Cursos (feat-032)
const courseRoutes = require('./course.routes');

// Gerenciamento de Disciplinas (feat-033)
const disciplineRoutes = require('./discipline.routes');

// Gerenciamento de Turmas (feat-035)
const classRoutes = require('./class.routes');

// Gerenciamento de Matrículas (feat-039)
const enrollmentRoutes = require('./enrollment.routes');

// Gerenciamento de Documentos (feat-043)
const documentRoutes = require('./document.routes');

// Gerenciamento de Contratos (feat-049)
const contractRoutes = require('./contract.routes');

// Gerenciamento de Avaliações (feat-051)
const evaluationRoutes = require('./evaluation.routes');

// Gerenciamento de Notas (feat-053)
const gradeRoutes = require('./grade.routes');

// Gerenciamento de Solicitações (feat-056)
const requestRoutes = require('./request.routes');

// Funcionalidades Administrativas (feat-081)
const adminRoutes = require('./admin.routes');

// Rematrícula Global de Estudantes (feat-reenrollment-etapa-4)
const reenrollmentRoutes = require('./reenrollment.routes');

// Grade de Horários das Turmas (feat-001)
const classScheduleRoutes = require('./classSchedule.routes');

// Disciplinas Extras de Alunos (feat-002)
const studentExtraDisciplineRoutes = require('./studentExtraDiscipline.routes');

// ============================================================================
// INICIALIZAÇÃO DO ROUTER
// ============================================================================

const router = express.Router();

// ============================================================================
// REGISTRO DE ROTAS
// ============================================================================

/**
 * Rotas de Autenticação
 * Base: /api/v1/auth
 *
 * Endpoints:
 * - POST /auth/login - Login de usuários (público)
 * - POST /auth/logout - Logout de usuários (autenticado)
 * - POST /auth/refresh-token - Renovação de token (autenticado)
 * - POST /auth/change-password - Alteração de senha (autenticado)
 * - GET /auth/me - Dados do usuário autenticado (autenticado)
 *
 * Permissões: Público (login) e Autenticado (demais)
 */
router.use('/auth', authRoutes);

/**
 * Rotas de Gerenciamento de Usuários Administrativos
 * Base: /api/v1/users
 *
 * Endpoints:
 * - GET /users - Listar todos os usuários
 * - GET /users/:id - Buscar usuário por ID
 * - POST /users - Criar novo usuário administrativo
 * - PUT /users/:id - Atualizar usuário
 * - DELETE /users/:id - Deletar usuário (soft delete)
 *
 * Permissões: Admin only
 */
router.use('/users', userRoutes);

/**
 * Rotas de Gerenciamento de Estudantes
 * Base: /api/v1/students
 *
 * Endpoints:
 * - GET /students - Listar todos os estudantes
 * - GET /students/:id - Buscar estudante por ID
 * - POST /students - Criar novo estudante
 * - PUT /students/:id - Atualizar estudante
 * - DELETE /students/:id - Deletar estudante (soft delete)
 * - POST /students/:id/reset-password - Regenerar senha provisória
 *
 * Permissões: Admin only
 */
router.use('/students', studentRoutes);

/**
 * Rotas de Gerenciamento de Professores
 * Base: /api/v1/teachers
 *
 * Endpoints:
 * - GET /teachers - Listar todos os professores
 * - GET /teachers/:id - Buscar professor por ID
 * - POST /teachers - Criar novo professor
 * - PUT /teachers/:id - Atualizar professor
 * - DELETE /teachers/:id - Deletar professor (soft delete)
 *
 * Permissões: Admin only
 */
router.use('/teachers', teacherRoutes);

/**
 * Rotas de Gerenciamento de Cursos
 * Base: /api/v1/courses
 *
 * Endpoints:
 * - GET /courses - Listar todos os cursos
 * - GET /courses/:id - Buscar curso por ID
 * - POST /courses - Criar novo curso
 * - PUT /courses/:id - Atualizar curso
 * - DELETE /courses/:id - Deletar curso (soft delete)
 *
 * Permissões: Admin only
 */
router.use('/courses', courseRoutes);

/**
 * Rotas de Gerenciamento de Disciplinas
 * Base: /api/v1/disciplines
 *
 * Endpoints:
 * - GET /disciplines - Listar todas as disciplinas
 * - GET /disciplines/:id - Buscar disciplina por ID
 * - POST /disciplines - Criar nova disciplina
 * - PUT /disciplines/:id - Atualizar disciplina
 * - DELETE /disciplines/:id - Deletar disciplina (soft delete)
 *
 * Permissões: Admin only
 */
router.use('/disciplines', disciplineRoutes);

/**
 * Rotas de Gerenciamento de Turmas
 * Base: /api/v1/classes
 *
 * Endpoints:
 * - GET /classes - Listar todas as turmas
 * - GET /classes/:id - Buscar turma por ID
 * - POST /classes - Criar nova turma
 * - PUT /classes/:id - Atualizar turma
 * - DELETE /classes/:id - Deletar turma (soft delete)
 * - GET /classes/:id/students - Listar alunos da turma
 * - POST /classes/:id/students - Vincular alunos à turma
 * - GET /classes/:id/teachers - Listar professores da turma
 * - POST /classes/:id/teachers - Vincular professores à turma
 *
 * Permissões: Admin (CRUD), Professor (visualização de suas turmas)
 */
router.use('/classes', classRoutes);

/**
 * Rotas de Gerenciamento de Matrículas
 * Base: /api/v1/enrollments
 *
 * Endpoints:
 * - GET /enrollments - Listar todas as matrículas
 * - GET /enrollments/:id - Buscar matrícula por ID
 * - POST /enrollments - Criar nova matrícula
 * - PUT /enrollments/:id - Atualizar matrícula
 * - PUT /enrollments/:id/status - Atualizar status da matrícula
 * - DELETE /enrollments/:id - Deletar matrícula (soft delete)
 * - GET /enrollments/student/:studentId - Matrículas de um aluno
 *
 * Permissões: Admin (full access), Student (visualização própria)
 */
router.use('/enrollments', enrollmentRoutes);

/**
 * Rotas de Gerenciamento de Documentos
 * Base: /api/v1/documents
 *
 * Endpoints:
 * - GET /documents - Listar documentos (admin vê todos, user vê próprios)
 * - GET /documents/:id - Buscar documento por ID
 * - POST /documents - Upload de documento (aluno/professor)
 * - PUT /documents/:id/approve - Aprovar documento (admin only)
 * - PUT /documents/:id/reject - Rejeitar documento (admin only)
 * - DELETE /documents/:id - Deletar documento
 * - GET /documents/:id/download - Download do arquivo
 * - GET /documents/types - Listar tipos de documentos obrigatórios
 * - POST /documents/types - Criar tipo de documento (admin only)
 * - GET /documents/pending - Documentos pendentes de aprovação (admin)
 *
 * Permissões: Admin (full access), Student/Teacher (próprios documentos)
 */
router.use('/documents', documentRoutes);

/**
 * Rotas de Gerenciamento de Contratos
 * Base: /api/v1/contracts
 *
 * Endpoints:
 * - GET /contracts - Listar contratos (admin vê todos, user vê próprios)
 * - GET /contracts/:id - Buscar contrato por ID
 * - POST /contracts/:id/accept - Aceitar contrato (student/teacher)
 * - GET /contracts/:id/pdf - Visualizar PDF do contrato
 * - GET /contracts/pending - Contratos pendentes de aceite (próprio user)
 * - GET /contracts/templates - Listar templates (admin only)
 * - POST /contracts/templates - Criar template (admin only)
 * - PUT /contracts/templates/:id - Editar template (admin only)
 *
 * Permissões: Admin (full access + templates), Student/Teacher (próprios contratos)
 */
router.use('/contracts', contractRoutes);

/**
 * Rotas de Gerenciamento de Avaliações
 * Base: /api/v1/evaluations
 *
 * Endpoints:
 * - GET /evaluations - Listar avaliações
 * - GET /evaluations/:id - Buscar avaliação por ID
 * - POST /evaluations - Criar avaliação (professor)
 * - PUT /evaluations/:id - Atualizar avaliação (professor)
 * - DELETE /evaluations/:id - Deletar avaliação (professor)
 * - GET /evaluations/class/:classId - Avaliações de uma turma
 *
 * Permissões: Admin (full access), Teacher (próprias turmas), Student (visualização)
 */
router.use('/evaluations', evaluationRoutes);

/**
 * Rotas de Gerenciamento de Notas
 * Base: /api/v1/grades
 *
 * Endpoints:
 * - GET /grades - Listar notas
 * - GET /grades/:id - Buscar nota por ID
 * - POST /grades - Lançar nota (professor)
 * - PUT /grades/:id - Atualizar nota (professor)
 * - DELETE /grades/:id - Deletar nota (professor)
 * - POST /grades/batch - Lançamento em lote (professor)
 * - GET /grades/student/:studentId - Notas de um aluno
 * - GET /grades/evaluation/:evaluationId - Notas de uma avaliação
 * - GET /grades/my-grades - Minhas notas (aluno autenticado)
 *
 * Permissões: Admin (full access), Teacher (lançamento), Student (próprias notas)
 */
router.use('/grades', gradeRoutes);

/**
 * Rotas de Gerenciamento de Solicitações
 * Base: /api/v1/requests
 *
 * Endpoints:
 * - GET /requests - Listar solicitações (admin vê todas, student vê próprias)
 * - GET /requests/:id - Buscar solicitação por ID
 * - POST /requests - Criar solicitação (student)
 * - PUT /requests/:id/approve - Aprovar solicitação (admin)
 * - PUT /requests/:id/reject - Rejeitar solicitação (admin)
 * - GET /requests/pending - Solicitações pendentes (admin)
 * - GET /requests/my-requests - Minhas solicitações (student)
 * - GET /requests/types - Listar tipos de solicitações
 * - POST /requests/types - Criar tipo de solicitação (admin)
 *
 * Permissões: Admin (full access + gestão de tipos), Student (criar e visualizar próprias)
 */
router.use('/requests', requestRoutes);

/**
 * Rotas de Funcionalidades Administrativas
 * Base: /api/v1/admin
 *
 * Endpoints:
 * - GET /admin/dashboard/stats - Estatísticas do dashboard
 *
 * Permissões: Admin only
 */
router.use('/admin', adminRoutes);

/**
 * Rotas de Rematrícula Global de Estudantes
 * Base: /api/v1/reenrollments
 *
 * Endpoints:
 * - POST /reenrollments/process-all - Processar rematrícula global de TODOS os estudantes
 *
 * Permissões: Admin only
 *
 * IMPORTANTE:
 * - Processa TODOS os enrollments ativos do sistema (não por curso individual)
 * - Atualiza status de 'active' para 'pending'
 * - Requer validação de senha do administrador
 * - Usa transação do Sequelize (rollback automático em caso de erro)
 * - NÃO cria contratos (criados após aceite do estudante)
 */
router.use('/reenrollments', reenrollmentRoutes);

/**
 * Rotas de Grade de Horários das Turmas
 * Base: /api/v1 (rotas já incluem prefixos /classes, /schedules)
 *
 * Endpoints:
 * - GET /classes/:classId/schedules - Listar horários de uma turma
 * - GET /classes/:classId/schedules/week - Obter grade completa da semana
 * - POST /classes/:classId/schedules - Criar novo horário
 * - POST /classes/:classId/schedules/bulk - Criar múltiplos horários em lote
 * - GET /schedules/:id - Obter horário por ID
 * - PUT /schedules/:id - Atualizar horário
 * - DELETE /schedules/:id - Deletar horário (soft delete)
 *
 * Permissões: Admin (CRUD), Teacher/Student (visualização)
 */
router.use('/', classScheduleRoutes);

/**
 * Rotas de Disciplinas Extras de Alunos
 * Base: /api/v1 (rotas já incluem prefixos /students, /extra-disciplines)
 *
 * Endpoints:
 * - GET /students/:studentId/extra-disciplines - Listar disciplinas extras de um aluno
 * - POST /students/:studentId/extra-disciplines - Vincular disciplina extra a um aluno
 * - GET /students/:studentId/full-schedule - Obter grade completa do aluno
 * - GET /extra-disciplines/:id - Obter disciplina extra por ID
 * - PUT /extra-disciplines/:id - Atualizar disciplina extra
 * - DELETE /extra-disciplines/:id - Remover disciplina extra (soft delete)
 * - GET /disciplines/:disciplineId/extra-students - Listar alunos com disciplina extra
 *
 * Permissões: Admin (CRUD), Student (própria grade e disciplinas extras)
 */
router.use('/', studentExtraDisciplineRoutes);

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta o router agregado para ser montado no Express
 *
 * Este router é montado no server.js com o prefixo /api/v1
 * Exemplo: app.use('/api/v1', router)
 *
 * Resultado: Todas as rotas acima ficam disponíveis em:
 * - http://localhost:3000/api/v1/auth/login
 * - http://localhost:3000/api/v1/students
 * - http://localhost:3000/api/v1/grades/my-grades
 * - etc.
 */
module.exports = router;
