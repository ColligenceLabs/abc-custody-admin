/**
 * Admin User Management Types
 * 관리자 사용자 관리를 위한 타입 정의
 */

export enum AdminRole {
  SUPER_ADMIN = "super_admin",    // 전체 권한
  OPERATIONS = "operations",      // 출금 처리
  COMPLIANCE = "compliance",      // AML/KYC
  SUPPORT = "support",           // 고객 지원
  VIEWER = "viewer"              // 읽기 전용
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  status: AdminUserStatus;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  ipWhitelist?: string[];
  sessionTimeout: number; // minutes, default 30
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  notes?: string;
}

export enum AdminUserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  INACTIVE = "inactive",
  PENDING = "pending"
}

export interface AdminSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  isActive: boolean;
  loginMethod: LoginMethod;
}

export enum LoginMethod {
  PASSWORD = "password",
  PASSWORD_2FA = "password_2fa",
  SSO = "sso"
}

export interface AdminPermission {
  resource: AdminResource;
  actions: AdminAction[];
}

export enum AdminResource {
  MEMBERS = "members",
  VAULT = "vault",
  WITHDRAWALS = "withdrawals",
  DEPOSITS = "deposits",
  COMPLIANCE = "compliance",
  REPORTS = "reports",
  SETTINGS = "settings",
  ADMIN_USERS = "admin_users"
}

export enum AdminAction {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  APPROVE = "approve",
  REJECT = "reject",
  SUSPEND = "suspend",
  ACTIVATE = "activate"
}

// Authentication related types
export interface AdminLoginRequest {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
  rememberMe?: boolean;
}

export interface AdminAuthResponse {
  user: AdminUser;
  session: AdminSession;
  requiresTwoFactor?: boolean;
  tempToken?: string; // For 2FA flow
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorVerification {
  email: string;
  code: string;
}

export interface Admin2FARequest {
  tempToken: string;
  code: string;
}

export interface AdminRefreshTokenRequest {
  refreshToken: string;
}

export interface CreateAdminUserRequest {
  email: string;
  name: string;
  role: AdminRole;
  permissions?: AdminPermission[];
  twoFactorRequired?: boolean;
  ipWhitelist?: string[];
  sessionTimeout?: number;
  notes?: string;
}

export interface UpdateAdminUserRequest {
  name?: string;
  role?: AdminRole;
  permissions?: AdminPermission[];
  status?: AdminUserStatus;
  twoFactorEnabled?: boolean;
  ipWhitelist?: string[];
  sessionTimeout?: number;
  notes?: string;
}

// Audit log types
export interface AdminAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: AdminResource;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: AuditResult;
  errorMessage?: string;
}

export enum AuditAction {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  APPROVE = "approve",
  REJECT = "reject",
  SUSPEND = "suspend",
  ACTIVATE = "activate",
  VIEW = "view",
  EXPORT = "export"
}

export enum AuditResult {
  SUCCESS = "success",
  FAILURE = "failure",
  PARTIAL = "partial"
}

// Permission checking utilities
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: [
    // 모든 리소스에 대한 모든 액션
    { resource: AdminResource.MEMBERS, actions: Object.values(AdminAction) },
    { resource: AdminResource.VAULT, actions: Object.values(AdminAction) },
    { resource: AdminResource.WITHDRAWALS, actions: Object.values(AdminAction) },
    { resource: AdminResource.DEPOSITS, actions: Object.values(AdminAction) },
    { resource: AdminResource.COMPLIANCE, actions: Object.values(AdminAction) },
    { resource: AdminResource.REPORTS, actions: Object.values(AdminAction) },
    { resource: AdminResource.SETTINGS, actions: Object.values(AdminAction) },
    { resource: AdminResource.ADMIN_USERS, actions: Object.values(AdminAction) }
  ],

  [AdminRole.OPERATIONS]: [
    { resource: AdminResource.MEMBERS, actions: [AdminAction.READ] },
    { resource: AdminResource.VAULT, actions: [AdminAction.READ, AdminAction.UPDATE] },
    { resource: AdminResource.WITHDRAWALS, actions: Object.values(AdminAction).filter(a => a !== AdminAction.DELETE) },
    { resource: AdminResource.DEPOSITS, actions: [AdminAction.READ, AdminAction.CREATE, AdminAction.UPDATE] },
    { resource: AdminResource.COMPLIANCE, actions: [AdminAction.READ] },
    { resource: AdminResource.REPORTS, actions: [AdminAction.READ] }
  ],

  [AdminRole.COMPLIANCE]: [
    { resource: AdminResource.MEMBERS, actions: [AdminAction.READ, AdminAction.APPROVE, AdminAction.REJECT] },
    { resource: AdminResource.VAULT, actions: [AdminAction.READ] },
    { resource: AdminResource.WITHDRAWALS, actions: [AdminAction.READ, AdminAction.APPROVE, AdminAction.REJECT] },
    { resource: AdminResource.DEPOSITS, actions: Object.values(AdminAction).filter(a => a !== AdminAction.DELETE) },
    { resource: AdminResource.COMPLIANCE, actions: Object.values(AdminAction) },
    { resource: AdminResource.REPORTS, actions: Object.values(AdminAction) }
  ],

  [AdminRole.SUPPORT]: [
    { resource: AdminResource.MEMBERS, actions: [AdminAction.READ] },
    { resource: AdminResource.VAULT, actions: [AdminAction.READ] },
    { resource: AdminResource.WITHDRAWALS, actions: [AdminAction.READ] },
    { resource: AdminResource.DEPOSITS, actions: [AdminAction.READ] },
    { resource: AdminResource.COMPLIANCE, actions: [AdminAction.READ] },
    { resource: AdminResource.REPORTS, actions: [AdminAction.READ] }
  ],

  [AdminRole.VIEWER]: [
    { resource: AdminResource.MEMBERS, actions: [AdminAction.READ] },
    { resource: AdminResource.VAULT, actions: [AdminAction.READ] },
    { resource: AdminResource.WITHDRAWALS, actions: [AdminAction.READ] },
    { resource: AdminResource.DEPOSITS, actions: [AdminAction.READ] },
    { resource: AdminResource.COMPLIANCE, actions: [AdminAction.READ] },
    { resource: AdminResource.REPORTS, actions: [AdminAction.READ] }
  ]
};