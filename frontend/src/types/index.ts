/**
 * Arquivo: frontend/src/types/index.ts
 * Descrição: Arquivo de índice para exportação centralizada de tipos
 * Feature: feat-101 - Criar types TypeScript
 * Criado em: 2025-11-04
 */

// User types
export type { UserRole, IUser, IAuthUser, ILoginCredentials, IChangePassword, ILoginResponse, IAuthContext, IUserCreateRequest, IUserUpdateRequest } from './user.types';

// Student types
export type { IStudent, IEnrollmentBasic, IStudentDocument, IStudentGrade, IStudentCreateRequest, IStudentUpdateRequest, IStudentListResponse, IStudentResponse, IStudentFilters, IStudentDashboard, IStudentStats } from './student.types';

// Teacher types
export type { ITeacher, ITeacherCreateRequest, ITeacherUpdateRequest, ITeacherListResponse, ITeacherResponse, ITeacherFilters, ITeacherStats, ICreateUserForTeacherRequest, ICreateUserForTeacherResponse, ITeacherResetPasswordResponse } from './teacher.types';

// Course types
export type { IDiscipline, ICourseDiscipline, ICourse, IDisciplineCreateRequest, IDisciplineUpdateRequest, ICourseCreateRequest, ICourseUpdateRequest, IAssociateDisciplineRequest, ICourseListResponse, ICourseResponse, ICourseFilters } from './course.types';

// Class types
export type { IClassTeacher, IClassStudent, IClass, IClassCreateRequest, IClassUpdateRequest, IAddTeacherToClassRequest, IAddStudentToClassRequest, IClassListResponse, IClassResponse, IClassFilters } from './class.types';

// Enrollment types
export type { EnrollmentStatus, IEnrollment, IEnrollmentCreateRequest, IEnrollmentUpdateRequest, IEnrollmentStatusUpdateRequest, IEnrollmentListResponse, IEnrollmentResponse, IEnrollmentFilters, IEnrollmentDetails, IEnrollmentDuplicateCheck, IStudentEnrollmentStats, ICourseEnrollmentStats, IBatchEnrollmentResponse, IEnrollmentCancellationRequest } from './enrollment.types';

// Document types
export type { DocumentStatus, DocumentUserType, IDocumentType, IDocumentUser, IDocument, IDocumentFilters, IDocumentListResponse, IDocumentResponse, IApproveDocumentRequest, IRejectDocumentRequest, IUploadDocumentRequest, IDocumentStats } from './document.types';

// Grade types
export type { EvaluationType, GradeConcept, IDiscipline as IGradeDiscipline, IEvaluation, IGrade, IGradeWithEvaluation, IDisciplineAverage, IGradeSummary, IGradeListResponse, IGradeResponse, IGradeSummaryResponse, IGradeFilters, ICreateEvaluationRequest, IUpdateEvaluationRequest, ICreateGradeRequest, IUpdateGradeRequest, ISetFinalAverageRequest } from './grade.types';

// Request types
export type { RequestStatus, RequestType, IRequest, IRequestListResponse, IRequestResponse, IRequestFilters, IApproveRequestRequest, IRejectRequestRequest, IRequestStats, ICreateRequestRequest, IRequestType, ICreateRequestTypeRequest, IUpdateRequestTypeRequest, IStudentCreateRequestRequest, ICreateRequestResponse } from './request.types';

// API types
export type { } from './api.types';
