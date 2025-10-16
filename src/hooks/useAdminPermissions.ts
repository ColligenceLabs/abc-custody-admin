/**
 * Admin Permissions Hook
 * 관리자 권한 확인을 위한 커스텀 훅
 */

import { useMemo } from 'react';
import { AdminUser, AdminResource, AdminAction, AdminRole } from '@/types/admin';
import { PermissionChecker } from '@/lib/adminAuth';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface UseAdminPermissionsReturn {
  // 기본 권한 확인
  hasPermission: (resource: AdminResource, action: AdminAction) => boolean;
  hasAllPermissions: (permissions: Array<{ resource: AdminResource; action: AdminAction }>) => boolean;
  hasAnyPermission: (permissions: Array<{ resource: AdminResource; action: AdminAction }>) => boolean;

  // 특정 리소스의 허용된 액션들
  getAllowedActions: (resource: AdminResource) => AdminAction[];

  // 편의 메서드들
  canRead: (resource: AdminResource) => boolean;
  canCreate: (resource: AdminResource) => boolean;
  canUpdate: (resource: AdminResource) => boolean;
  canDelete: (resource: AdminResource) => boolean;
  canApprove: (resource: AdminResource) => boolean;
  canReject: (resource: AdminResource) => boolean;

  // 역할 확인
  isSuperAdmin: boolean;
  isOperationsStaff: boolean;
  isComplianceStaff: boolean;
  isSupportStaff: boolean;
  isViewer: boolean;

  // 고수준 권한 확인
  canManageMembers: boolean;
  canManageVault: boolean;
  canProcessWithdrawals: boolean;
  canReviewCompliance: boolean;
  canViewReports: boolean;
  canManageAdminUsers: boolean;

  // 권한 정보
  userRole: AdminRole | null;
  userPermissions: string[]; // 읽기 쉬운 권한 목록
}

export function useAdminPermissions(): UseAdminPermissionsReturn {
  const { user, isAuthenticated } = useAdminAuth();

  return useMemo(() => {
    if (!isAuthenticated || !user) {
      // 로그인하지 않은 상태에서는 모든 권한 없음
      return {
        hasPermission: () => false,
        hasAllPermissions: () => false,
        hasAnyPermission: () => false,
        getAllowedActions: () => [],
        canRead: () => false,
        canCreate: () => false,
        canUpdate: () => false,
        canDelete: () => false,
        canApprove: () => false,
        canReject: () => false,
        isSuperAdmin: false,
        isOperationsStaff: false,
        isComplianceStaff: false,
        isSupportStaff: false,
        isViewer: false,
        canManageMembers: false,
        canManageVault: false,
        canProcessWithdrawals: false,
        canReviewCompliance: false,
        canViewReports: false,
        canManageAdminUsers: false,
        userRole: null,
        userPermissions: [],
      };
    }

    // 기본 권한 확인 함수들
    const hasPermission = (resource: AdminResource, action: AdminAction): boolean => {
      return PermissionChecker.hasPermission(user, resource, action);
    };

    const hasAllPermissions = (permissions: Array<{ resource: AdminResource; action: AdminAction }>): boolean => {
      return PermissionChecker.hasAllPermissions(user, permissions);
    };

    const hasAnyPermission = (permissions: Array<{ resource: AdminResource; action: AdminAction }>): boolean => {
      return PermissionChecker.hasAnyPermission(user, permissions);
    };

    const getAllowedActions = (resource: AdminResource): AdminAction[] => {
      return PermissionChecker.getAllowedActions(user, resource);
    };

    // 편의 메서드들
    const canRead = (resource: AdminResource): boolean => hasPermission(resource, AdminAction.READ);
    const canCreate = (resource: AdminResource): boolean => hasPermission(resource, AdminAction.CREATE);
    const canUpdate = (resource: AdminResource): boolean => hasPermission(resource, AdminAction.UPDATE);
    const canDelete = (resource: AdminResource): boolean => hasPermission(resource, AdminAction.DELETE);
    const canApprove = (resource: AdminResource): boolean => hasPermission(resource, AdminAction.APPROVE);
    const canReject = (resource: AdminResource): boolean => hasPermission(resource, AdminAction.REJECT);

    // 역할 확인
    const isSuperAdmin = user.role === AdminRole.SUPER_ADMIN;
    const isOperationsStaff = user.role === AdminRole.OPERATIONS;
    const isComplianceStaff = user.role === AdminRole.COMPLIANCE;
    const isSupportStaff = user.role === AdminRole.SUPPORT;
    const isViewer = user.role === AdminRole.VIEWER;

    // 고수준 권한 확인
    const canManageMembers = hasAnyPermission([
      { resource: AdminResource.MEMBERS, action: AdminAction.CREATE },
      { resource: AdminResource.MEMBERS, action: AdminAction.UPDATE },
      { resource: AdminResource.MEMBERS, action: AdminAction.APPROVE }
    ]);

    const canManageVault = hasAnyPermission([
      { resource: AdminResource.VAULT, action: AdminAction.UPDATE },
      { resource: AdminResource.VAULT, action: AdminAction.CREATE }
    ]);

    const canProcessWithdrawals = hasAnyPermission([
      { resource: AdminResource.WITHDRAWALS, action: AdminAction.APPROVE },
      { resource: AdminResource.WITHDRAWALS, action: AdminAction.UPDATE }
    ]);

    const canReviewCompliance = hasAnyPermission([
      { resource: AdminResource.COMPLIANCE, action: AdminAction.CREATE },
      { resource: AdminResource.COMPLIANCE, action: AdminAction.UPDATE },
      { resource: AdminResource.COMPLIANCE, action: AdminAction.APPROVE }
    ]);

    const canViewReports = canRead(AdminResource.REPORTS);

    const canManageAdminUsers = hasAnyPermission([
      { resource: AdminResource.ADMIN_USERS, action: AdminAction.CREATE },
      { resource: AdminResource.ADMIN_USERS, action: AdminAction.UPDATE },
      { resource: AdminResource.ADMIN_USERS, action: AdminAction.DELETE }
    ]);

    // 사용자 권한을 읽기 쉬운 형태로 변환
    const userPermissions = generateUserPermissionsList(user);

    return {
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      getAllowedActions,
      canRead,
      canCreate,
      canUpdate,
      canDelete,
      canApprove,
      canReject,
      isSuperAdmin,
      isOperationsStaff,
      isComplianceStaff,
      isSupportStaff,
      isViewer,
      canManageMembers,
      canManageVault,
      canProcessWithdrawals,
      canReviewCompliance,
      canViewReports,
      canManageAdminUsers,
      userRole: user.role,
      userPermissions,
    };
  }, [user, isAuthenticated]);
}

// 사용자 권한을 읽기 쉬운 텍스트로 변환
function generateUserPermissionsList(user: AdminUser): string[] {
  const permissions: string[] = [];

  Object.values(AdminResource).forEach(resource => {
    const actions = PermissionChecker.getAllowedActions(user, resource);

    if (actions.length > 0) {
      const resourceName = getResourceDisplayName(resource);
      const actionNames = actions.map(action => getActionDisplayName(action)).join(', ');
      permissions.push(`${resourceName}: ${actionNames}`);
    }
  });

  return permissions;
}

// 리소스 이름을 한국어로 변환
function getResourceDisplayName(resource: AdminResource): string {
  const resourceNames: Record<AdminResource, string> = {
    [AdminResource.MEMBERS]: '회원사 관리',
    [AdminResource.VAULT]: '볼트 관리',
    [AdminResource.WITHDRAWALS]: '출금 관리',
    [AdminResource.DEPOSITS]: '입금 관리',
    [AdminResource.COMPLIANCE]: '컴플라이언스',
    [AdminResource.REPORTS]: '보고서',
    [AdminResource.SETTINGS]: '설정',
    [AdminResource.ADMIN_USERS]: '관리자 계정',
  };

  return resourceNames[resource] || resource;
}

// 액션 이름을 한국어로 변환
function getActionDisplayName(action: AdminAction): string {
  const actionNames: Record<AdminAction, string> = {
    [AdminAction.READ]: '조회',
    [AdminAction.CREATE]: '생성',
    [AdminAction.UPDATE]: '수정',
    [AdminAction.DELETE]: '삭제',
    [AdminAction.APPROVE]: '승인',
    [AdminAction.REJECT]: '거부',
    [AdminAction.SUSPEND]: '정지',
    [AdminAction.ACTIVATE]: '활성화',
  };

  return actionNames[action] || action;
}

// 특정 권한 조합에 대한 편의 훅들
export function useCanManageMembers(): boolean {
  const { canManageMembers } = useAdminPermissions();
  return canManageMembers;
}

export function useCanProcessWithdrawals(): boolean {
  const { canProcessWithdrawals } = useAdminPermissions();
  return canProcessWithdrawals;
}

export function useCanReviewCompliance(): boolean {
  const { canReviewCompliance } = useAdminPermissions();
  return canReviewCompliance;
}

export function useCanManageVault(): boolean {
  const { canManageVault } = useAdminPermissions();
  return canManageVault;
}

export function useIsSuperAdmin(): boolean {
  const { isSuperAdmin } = useAdminPermissions();
  return isSuperAdmin;
}