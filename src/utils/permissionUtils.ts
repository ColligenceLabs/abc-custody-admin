import {
  User,
  UserRole,
  DEFAULT_PERMISSIONS_BY_ROLE,
  PERMISSION_CATEGORIES,
  PERMISSION_CATEGORY_NAMES
} from '@/types/user';
import {
  PermissionCheckResult,
  UserApprovalPermission,
  PermissionChangeLog,
  PolicyApprovalMapping,
  MenuPermission,
  ActionPermission,
  DashboardWidgetPermission
} from '@/types/permission';

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasPermission(user: User, permission: string): boolean {
  // 개인회원은 모든 권한 허용
  if (user.memberType === 'individual') {
    return true;
  }

  // 기업회원: 관리자는 모든 권한 보유
  if (user.role === 'admin' || user.permissions.includes('permission.all')) {
    return true;
  }

  // 기업회원: 권한 배열에서 확인
  return user.permissions.includes(permission);
}

/**
 * 사용자가 여러 권한을 모두 가지고 있는지 확인
 */
export function hasAllPermissions(user: User, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
 */
export function hasAnyPermission(user: User, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * 사용자가 특정 역할 이상의 권한을 가지고 있는지 확인
 */
export function hasMinimumRole(user: User, minRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    operator: 2,
    manager: 3,
    admin: 4
  };

  return roleHierarchy[user.role] >= roleHierarchy[minRole];
}



/**
 * 권한 확인 결과를 반환하는 포괄적인 함수
 */
export function checkPermission(
  user: User,
  requiredPermissions: string[],
  minRole?: UserRole
): PermissionCheckResult {
  // 최소 역할 확인
  if (minRole && !hasMinimumRole(user, minRole)) {
    return {
      allowed: false,
      reason: `${minRole} 이상의 권한이 필요합니다.`,
      requiredRole: minRole
    };
  }

  // 권한 확인
  if (!hasAllPermissions(user, requiredPermissions)) {
    return {
      allowed: false,
      reason: '필요한 권한이 부족합니다.',
      requiredPermissions
    };
  }

  return { allowed: true };
}

/**
 * 시스템의 모든 권한 목록을 가져오기
 */
export function getAllPermissions(): string[] {
  return [
    // Groups
    'groups.view',
    'groups.create',
    'groups.approve',
    'groups.edit',
    'groups.manage_budget',

    // Withdrawals
    'withdrawals.view',
    'withdrawals.create',
    'withdrawals.approve',

    // Deposits
    'deposits.view',
    'deposits.create',
    'deposits.approve',

    // Transactions
    'transactions.view',

    // Users
    'users.view',
    'users.create',
    'users.edit',
    'users.deactivate',
    'users.manage_permissions',

    // System
    'system.view_audit',
    'system.view_settings',
    'system.manage',
    'system.subscription'
  ];
}

/**
 * 역할별 기본 권한을 가져오기
 */
export function getDefaultPermissionsForRole(role: UserRole): string[] {
  // 관리자는 모든 권한을 개별적으로 보유
  if (role === 'admin') {
    return getAllPermissions();
  }

  return [...DEFAULT_PERMISSIONS_BY_ROLE[role]];
}


/**
 * 권한을 카테고리별로 그룹화
 */
export function groupPermissionsByCategory(permissions: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  permissions.forEach(permission => {
    const parts = permission.split('.');
    if (parts.length >= 2) {
      const category = parts[1]; // permission.assets.view -> assets
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    }
  });

  return grouped;
}

/**
 * 권한 카테고리 이름 가져오기
 */
export function getPermissionCategoryName(category: string): string {
  return PERMISSION_CATEGORY_NAMES[category as keyof typeof PERMISSION_CATEGORY_NAMES] || category;
}

/**
 * 메뉴 항목 필터링 (권한 기반)
 */
export function filterMenusByPermission(user: User, menus: MenuPermission[]): MenuPermission[] {
  return menus.filter(menu => {
    const permissionCheck = checkPermission(user, menu.requiredPermissions, menu.minRole);
    return permissionCheck.allowed;
  });
}

/**
 * 액션 버튼 필터링 (권한 기반)
 */
export function filterActionsByPermission(user: User, actions: ActionPermission[]): ActionPermission[] {
  return actions.filter(action => {
    const permissionCheck = checkPermission(user, action.requiredPermissions, action.minRole);
    return permissionCheck.allowed;
  });
}

/**
 * 대시보드 위젯 필터링 (권한 기반)
 */
export function filterDashboardWidgets(user: User, widgets: DashboardWidgetPermission[]): DashboardWidgetPermission[] {
  return widgets.filter(widget => {
    const hasRole = widget.roles.includes(user.role);
    const hasPermissions = hasAllPermissions(user, widget.requiredPermissions);
    return hasRole && hasPermissions;
  });
}

/**
 * 권한 변경 이력 생성
 */
export function createPermissionChangeLog(
  userId: string,
  changedBy: string,
  changeType: PermissionChangeLog['changeType'],
  oldValue?: string,
  newValue?: string,
  reason?: string
): PermissionChangeLog {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    changedBy,
    changeType,
    oldValue,
    newValue,
    reason,
    timestamp: new Date().toISOString()
  };
}

/**
 * 사용자 권한 요약 정보 생성
 */
export function getUserPermissionSummary(user: User): {
  role: string;
  permissions: Record<string, string[]>;
} {
  return {
    role: user.role,
    permissions: groupPermissionsByCategory(user.permissions)
  };
}

/**
 * 권한 미리보기 텍스트 생성
 */
export function generatePermissionPreview(
  role: UserRole,
  customPermissions?: string[]
): string[] {
  const rolePermissions = customPermissions || getDefaultPermissionsForRole(role);

  const preview: string[] = [];
  const grouped = groupPermissionsByCategory(rolePermissions);

  // 권한별 설명 추가
  Object.entries(grouped).forEach(([category, perms]) => {
    const categoryName = getPermissionCategoryName(category);
    preview.push(`${categoryName}: ${perms.length}개 권한`);
  });

  return preview;
}

/**
 * 역할 색상 반환 (색상 정책에 따라)
 */
export function getRoleColor(role: UserRole): string {
  const colors = {
    admin: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    manager: 'text-blue-600 bg-blue-50 border-blue-200',
    operator: 'text-purple-600 bg-purple-50 border-purple-200',
    viewer: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  return colors[role] || colors.viewer;
}

/**
 * 권한 상태 아이콘 반환
 */
export function getPermissionStatusIcon(hasPermission: boolean): string {
  return hasPermission ? '✓' : '✗';
}

/**
 * 권한 상태 색상 반환
 */
export function getPermissionStatusColor(hasPermission: boolean): string {
  return hasPermission ? 'text-sky-600' : 'text-gray-400';
}