# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Secretaria Online** is an academic management system for an educational institution with ~200 students and ~10 teachers. The system centralizes and digitizes management of students, teachers, courses, disciplines, enrollments, classes, contracts, and academic documents.

## Technology Stack

**Backend:**
- Node.js v20 LTS with Express.js
- MySQL 8.0 with Sequelize ORM
- JWT authentication with bcryptjs
- Winston for logging
- Multer for file uploads
- PDFKit for PDF generation
- Nodemailer for email
- PM2 for process management
- Node-cron for scheduled jobs

**Frontend:**
- React 19 with TypeScript
- Vite as build tool
- React Router DOM v7
- TanStack Query for server state
- Tailwind CSS v4
- React Hook Form + Zod for form validation
- Axios for HTTP requests

## Development Commands

### Backend (from `backend/` directory)

**Development:**
```bash
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production server
```

**Database Management:**
```bash
npm run db:migrate              # Run pending migrations
npm run db:migrate:undo         # Undo last migration
npm run db:seed                 # Run all seeders
npm run db:seed:undo            # Undo all seeders
npm run db:reset                # Drop, create, migrate, seed database
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run format:check # Check Prettier formatting
```

**PM2 Process Management:**
```bash
npm run pm2:start        # Start with PM2 (production)
npm run pm2:start:dev    # Start with PM2 (development)
npm run pm2:restart      # Restart PM2 process
npm run pm2:reload       # Reload PM2 process (zero downtime)
npm run pm2:stop         # Stop PM2 process
npm run pm2:logs         # View PM2 logs
npm run pm2:status       # View PM2 status
```

### Frontend (from `frontend/` directory)

**Development:**
```bash
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build
```

**Testing:**
```bash
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run format:check # Check Prettier formatting
```

## Architecture Overview

### Backend Architecture

**Layered Architecture Pattern:**
- **Routes** (`src/routes/`): Define API endpoints and mount to Express router
- **Controllers** (`src/controllers/`): Handle HTTP requests/responses, orchestrate services
- **Services** (`src/services/`): Business logic layer, interact with models
- **Models** (`src/models/`): Sequelize models with associations
- **Middlewares** (`src/middlewares/`): Authentication, authorization (RBAC), validation, error handling
- **Utils** (`src/utils/`): Reusable utilities (logger, validators, formatters, generators, constants)
- **Jobs** (`src/jobs/`): Scheduled cron jobs (cleanup, renewals)

**Database Structure:**
- All models are dynamically loaded via `src/models/index.js`
- Associations are defined in each model's `associate()` method
- Migrations in `backend/database/migrations/`
- Seeders in `backend/database/seeders/`
- Sequelize config in `src/config/database.js`

**Key Models & Relationships:**
- `User`: Admin users (role: 'admin')
- `User` (students/teachers): Students have `role: 'student'`, teachers have `role: 'teacher'`
- `Course`: Academic courses
- `Discipline`: Subjects/disciplines
- `CourseDiscipline`: Many-to-many relationship between courses and disciplines
- `Class`: Classes/turmas
- `ClassTeacher`: Many-to-many (classes ↔ teachers)
- `ClassStudent`: Many-to-many (classes ↔ students)
- `Enrollment`: Student enrollments in courses
- `Document`: Uploaded documents with approval workflow
- `DocumentType`: Types of required documents
- `Contract`: Contracts with acceptance workflow
- `ContractTemplate`: Contract templates for generation
- `Evaluation`: Evaluations/assessments created by teachers
- `Grade`: Student grades for evaluations
- `Request`: Student requests (documents, certificates, etc.)
- `RequestType`: Types of student requests

**Authentication & Authorization:**
- JWT-based authentication via `src/middlewares/auth.middleware.js`
- RBAC (Role-Based Access Control) via `src/middlewares/rbac.middleware.js`
- Three user roles: `admin`, `teacher`, `student`
- Rate limiting on login endpoint to prevent brute force attacks

**API Structure:**
- Base URL: `/api/v1`
- All routes aggregated in `src/routes/index.js`
- Standard response format with `success`, `data`, and `error` properties
- Centralized error handling via `src/middlewares/error.middleware.js`

**File Uploads:**
- Handled by Multer middleware (`src/middlewares/upload.middleware.js`)
- Configuration in `src/config/upload.js`
- Files stored in `backend/uploads/` directory
- Supported types: PDF, JPEG, JPG, PNG

**Logging:**
- Winston logger configured in `src/utils/logger.js`
- Logs to console and file system
- Log files in `backend/logs/`
- Different log levels: error, warn, info, debug

**Scheduled Jobs:**
- Managed by node-cron in `src/jobs/index.js`
- Jobs defined in individual files (e.g., `cleanupTemp.job.js`)
- Started automatically when server starts

### Frontend Architecture

**Component Structure:**
- **Pages** (`src/pages/`): Full page components organized by role (admin, teacher, student)
- **Components** (`src/components/`): Reusable UI components
  - `ui/`: Base UI components (Button, Input, Modal, Table, FileUpload)
  - `forms/`: Form components (StudentForm, TeacherForm, CourseForm, ClassForm)
  - `layout/`: Layout components (Header, Sidebar, DashboardLayout)
- **Services** (`src/services/`): API communication layer (one service per entity)
- **Hooks** (`src/hooks/`): Custom React hooks for data fetching with TanStack Query
- **Contexts** (`src/contexts/`): React Context API (AuthContext for authentication state)
- **Types** (`src/types/`): TypeScript type definitions
- **Utils** (`src/utils/`): Utility functions (validators, formatters, constants)

**Routing:**
- Configured in `src/router.tsx` using React Router DOM v7
- Three main route groups: `/admin/*`, `/teacher/*`, `/student/*`
- Protected routes using `PrivateRoute` component with role-based authorization
- Lazy loading for performance (pages loaded on-demand)
- Root path `/` redirects to appropriate dashboard based on user role

**State Management:**
- **Server State**: TanStack Query for API data (configured in `src/config/queryClient.ts`)
- **Auth State**: React Context API (`src/contexts/AuthContext.tsx`)
- **Local State**: React hooks (useState, useReducer)

**Authentication Flow:**
1. User logs in via `/login` page
2. API returns JWT token and user data
3. Token stored in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Axios interceptor (in `src/services/api.ts`) handles token injection and refresh
6. AuthContext provides global auth state

**API Communication:**
- Base API client in `src/services/api.ts` with Axios
- Individual service files for each entity (e.g., `student.service.ts`)
- Response type safety with TypeScript interfaces
- Error handling with standardized error responses

## Important Development Notes

### Database Workflow
- **NEVER** use `sequelize.sync()` in production - always use migrations
- Create migrations with: `npx sequelize-cli migration:generate --name migration-name`
- All database schema changes must be done via migrations
- Run migrations before starting the server after pulling changes

### Authentication Implementation
- All protected routes require JWT token in Authorization header
- Token format: `Bearer <token>`
- Backend validates token via `authenticate` middleware
- Frontend uses `PrivateRoute` component for route protection
- User role is embedded in JWT payload

### File Upload Guidelines
- Maximum file size: 10MB (configurable via `MAX_FILE_SIZE` env var)
- Validate file types on both frontend and backend
- Store file metadata in database, actual files in `backend/uploads/`
- Use Multer middleware for handling multipart/form-data

### Error Handling Pattern
- Backend: Use centralized error handler (`src/middlewares/error.middleware.js`)
- Frontend: Display errors via UI feedback (modals, toasts)
- Return structured error responses: `{ success: false, error: { code, message } }`

### RBAC Patterns
- Use `rbac.middleware.js` to protect routes by role
- Example: `router.get('/admin/stats', authenticate, rbac(['admin']), controller)`
- Frontend shows/hides UI elements based on user role from AuthContext

### Code Organization Principles
- Backend: Controller → Service → Model (never skip service layer)
- Frontend: Page → Custom Hook → Service → API
- Keep controllers thin - business logic belongs in services
- Reuse components and services across modules

### Environment Variables
- Backend: `.env` file (not committed to git)
- Frontend: Vite uses `import.meta.env` for env vars (prefix with `VITE_`)
- Always provide `.env.example` files with sample values
- Never commit sensitive credentials

### Git Workflow
- Main branch: `main`
- Development branch: `develop`
- Feature branches: Create from `develop`, merge back via PR
- Current development is on `develop` branch

### Testing Notes
- Frontend has Jest test setup (`src/setupTests.ts`)
- Component tests in `__tests__` directories
- Backend currently has no test runner configured (manual testing)

## Common Patterns

### Creating a New Entity (Full Stack)

**Backend:**
1. Create migration: `npx sequelize-cli migration:generate --name create-entity-name`
2. Define model in `src/models/EntityName.js` with associations
3. Create service in `src/services/entityName.service.js`
4. Create controller in `src/controllers/entityName.controller.js`
5. Create routes in `src/routes/entityName.routes.js`
6. Register routes in `src/routes/index.js`

**Frontend:**
1. Define types in `src/types/entityName.types.ts`
2. Create service in `src/services/entityName.service.ts`
3. Create custom hook in `src/hooks/useEntityName.ts` (with TanStack Query)
4. Create form component in `src/components/forms/EntityNameForm.tsx`
5. Create page component in `src/pages/role/EntityNamePage.tsx`
6. Add route in `src/router.tsx`

### Adding RBAC Protection
```javascript
// Backend route
router.get('/endpoint', authenticate, rbac(['admin', 'teacher']), controller.method);

// Frontend PrivateRoute
<PrivateRoute requiredRole="admin">
  <ComponentOrPage />
</PrivateRoute>
```

### TanStack Query Pattern
```typescript
// Custom hook
export const useEntity = () => {
  return useQuery({
    queryKey: ['entity'],
    queryFn: entityService.getAll,
  });
};

// Mutation
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity'] });
    },
  });
};
```

## Project-Specific Conventions

- **Feature Naming**: Code comments reference feature IDs (e.g., `feat-064`, `feat-110`)
- **File Headers**: Most files include header comments with file path, description, feature ID, and creation date
- **Naming**: Backend uses camelCase, frontend uses PascalCase for components
- **Imports**: Backend uses CommonJS (`require`), frontend uses ES modules (`import`)
- **Route Naming**: Backend uses plural nouns (e.g., `/students`, `/courses`)
- **Response Format**: Backend always returns `{ success: boolean, data?: any, error?: { code, message } }`
