export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  permissions: string[];
  department: string;
  position: string;
  hasGASetup: boolean;          // GA 설정 완료 여부
  gaSetupDate?: string;         // GA 설정 완료 일시
  isFirstLogin: boolean;        // 최초 로그인 여부
}

// 5개 권한 카테고리별 권한 정의
export interface UserPermissions {
  // 전체 권한
  'permission.all': boolean;

  // 자산 관리 (Assets)
  'permission.assets.view': boolean;
  'permission.assets.view_transactions': boolean;
  'permission.assets.create_transactions': boolean;

  // 사용자 관리 (Users)
  'permission.users.view': boolean;
  'permission.users.create': boolean;
  'permission.users.edit': boolean;
  'permission.users.manage_permissions': boolean;

  // 정책 관리 (Policies)
  'permission.policies.view': boolean;
  'permission.policies.create': boolean;
  'permission.policies.edit': boolean;

  // 시스템 관리 (System)
  'permission.system.view_audit': boolean;
  'permission.system.notifications': boolean;
  'permission.system.security_settings': boolean;
  'permission.system.admin': boolean;
}

// 역할별 기본 권한 매핑
export const DEFAULT_PERMISSIONS_BY_ROLE: Record<UserRole, string[]> = {
  admin: [
    'permission.all'
  ],
  manager: [
    'permission.assets.view',
    'permission.assets.view_transactions',
    'permission.assets.create_transactions',
    'permission.users.view',
    'permission.users.create',
    'permission.users.edit',
    'permission.users.manage_permissions',
    'permission.policies.view',
    'permission.system.view_audit'
  ],
  operator: [
    'permission.assets.view',
    'permission.assets.view_transactions',
    'permission.assets.create_transactions',
    'permission.system.view_audit'
  ],
  viewer: [
    'permission.assets.view',
    'permission.assets.view_transactions',
    'permission.system.view_audit'
  ]
};

// 역할별 한국어 이름
export const ROLE_NAMES: Record<UserRole, string> = {
  admin: '관리자',
  manager: '매니저',
  operator: '운영자',
  viewer: '조회자'
};

// 상태별 한국어 이름
export const STATUS_NAMES: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기중'
};

// 권한 카테고리 정의
export const PERMISSION_CATEGORIES = {
  ASSETS: 'assets',
  USERS: 'users',
  POLICIES: 'policies',
  SYSTEM: 'system'
} as const;

// 권한 카테고리별 한국어 이름
export const PERMISSION_CATEGORY_NAMES = {
  [PERMISSION_CATEGORIES.ASSETS]: '자산 관리',
  [PERMISSION_CATEGORIES.USERS]: '사용자 관리',
  [PERMISSION_CATEGORIES.POLICIES]: '정책 관리',
  [PERMISSION_CATEGORIES.SYSTEM]: '시스템 관리'
} as const;

