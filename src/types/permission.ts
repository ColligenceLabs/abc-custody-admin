import { UserRole } from './user';

// 권한 액션 타입 정의
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'manage';

// 권한 리소스 타입 정의
export type PermissionResource = 'assets' | 'transactions' | 'users' | 'policies' | 'system' | 'audit';

// 세부 권한 정의
export interface DetailedPermission {
  id: string;
  category: string;
  resource: PermissionResource;
  action: PermissionAction;
  name: string;
  description: string;
  requiredRole?: UserRole;
}

// 권한 그룹 정의
export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  category: string;
}

// 사용자별 승인 권한 정의
export interface UserApprovalPermission {
  userId: string;
  approvedPolicies: string[]; // 승인 가능한 정책 ID 목록
  maxApprovalAmount?: number; // 최대 승인 금액 (선택적)
  effectiveDate: string; // 권한 적용 일자
  expiryDate?: string; // 권한 만료 일자 (선택적)
}

// 권한 변경 이력 정의
export interface PermissionChangeLog {
  id: string;
  userId: string;
  changedBy: string; // 변경자 ID
  changeType: 'role_change' | 'permission_add' | 'permission_remove' | 'policy_approval_add' | 'policy_approval_remove';
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

// 정책 승인 권한 매핑
export interface PolicyApprovalMapping {
  policyId: string;
  policyName: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  requiredApprovers: string[]; // 필수 승인자 역할 목록
  optionalApprovers: string[]; // 선택적 승인자 역할 목록
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// 권한 체크 결과
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPermissions?: string[];
}

// 메뉴 아이템 권한 정의
export interface MenuPermission {
  path: string;
  label: string;
  requiredPermissions: string[];
  minRole?: UserRole;
  category?: string;
}

// 액션 버튼 권한 정의
export interface ActionPermission {
  actionId: string;
  label: string;
  requiredPermissions: string[];
  minRole?: UserRole;
  context?: 'global' | 'item-specific';
}

// 대시보드 위젯 권한 정의
export interface DashboardWidgetPermission {
  widgetId: string;
  name: string;
  requiredPermissions: string[];
  roles: UserRole[];
  category: string;
}

// 권한 설정 템플릿
export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  role: UserRole;
  permissions: string[];
  approvalPolicies: string[];
  isDefault: boolean;
}