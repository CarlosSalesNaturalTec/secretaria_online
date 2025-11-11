/**
 * Arquivo: backend/src/middlewares/rbac.middleware.js
 * Descrição: Middleware de autorização baseado em roles (RBAC - Role-Based Access Control)
 * Feature: feat-021 - Criar middleware RBAC (autorização por role)
 * Criado em: 2025-10-27
 */

/**
 * Middleware de autorização baseado em roles (RBAC)
 *
 * Verifica se o usuário autenticado possui uma das roles permitidas para acessar o recurso.
 * Este middleware deve ser usado APÓS o middleware de autenticação (auth.middleware.js)
 * que injeta o objeto user em req.user.
 *
 * @param {...string} allowedRoles - Lista de roles permitidas (ex: 'admin', 'teacher', 'student')
 * @returns {Function} Middleware Express que valida a autorização do usuário
 *
 * @example
 * // Permitir apenas administradores
 * router.get('/users', authenticate, authorize('admin'), UserController.list);
 *
 * @example
 * // Permitir administradores e professores
 * router.get('/classes', authenticate, authorize('admin', 'teacher'), ClassController.list);
 *
 * @example
 * // Permitir todos os tipos de usuários autenticados
 * router.get('/profile', authenticate, authorize('admin', 'teacher', 'student'), UserController.getProfile);
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      // Verifica se o usuário está autenticado
      // O middleware auth.middleware.js deve injetar req.user antes deste middleware
      if (!req.user) {
        console.warn('[RBAC] Tentativa de acesso sem autenticação');
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Autenticação necessária para acessar este recurso'
          }
        });
      }

      // Verifica se o usuário possui role
      if (!req.user.role) {
        console.error('[RBAC] Usuário autenticado sem role definida', {
          userId: req.user.id,
          login: req.user.login
        });
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Usuário sem permissão de acesso definida'
          }
        });
      }

      // Verifica se a role do usuário está na lista de roles permitidas
      if (!allowedRoles.includes(req.user.role)) {
        console.warn('[RBAC] Acesso negado - role não autorizada', {
          userId: req.user.id,
          userRole: req.user.role,
          allowedRoles,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não tem permissão para acessar este recurso'
          }
        });
      }

      // Usuário autorizado, prosseguir para o próximo middleware/controller
      console.info('[RBAC] Acesso autorizado', {
        userId: req.user.id,
        userRole: req.user.role,
        path: req.path,
        method: req.method
      });

      next();
    } catch (error) {
      // Captura erros inesperados no middleware
      console.error('[RBAC] Erro ao verificar autorização:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        path: req.path
      });

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao verificar permissões de acesso',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  };
}

/**
 * Constantes com as roles disponíveis no sistema
 *
 * Usar estas constantes ao invés de strings hardcoded para evitar typos
 * e facilitar refatoração futura.
 */
const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

/**
 * Middlewares pré-configurados para casos de uso comuns
 *
 * Estes middlewares facilitam o uso em rotas sem precisar passar
 * as roles manualmente toda vez.
 */
const authorizeAdmin = authorize(ROLES.ADMIN);
const authorizeTeacher = authorize(ROLES.ADMIN, ROLES.TEACHER);
const authorizeStudent = authorize(ROLES.STUDENT);
const authorizeAny = authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT);

module.exports = {
  authorize,
  ROLES,
  authorizeAdmin,
  authorizeTeacher,
  authorizeStudent,
  authorizeAny
};
