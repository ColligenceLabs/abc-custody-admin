'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, checkPermission } from '@/utils/permissionUtils';
import { UserRole } from '@/types/user';

interface UsePermissionOptions {
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  customMessage?: string;
}

export function usePermission() {
  const { user } = useAuth();
  const [isPermissionDeniedModalOpen, setIsPermissionDeniedModalOpen] = useState(false);
  const [deniedPermissions, setDeniedPermissions] = useState<string[]>([]);
  const [deniedRole, setDeniedRole] = useState<UserRole | undefined>();
  const [deniedMessage, setDeniedMessage] = useState<string | undefined>();

  // 권한 체크 함수
  const checkUserPermission = useCallback((permissions: string[]) => {
    if (!user) return false;
    return permissions.every(permission => hasPermission(user, permission));
  }, [user]);

  // 역할 체크 함수
  const checkUserRole = useCallback((minRole: UserRole) => {
    if (!user) return false;
    const roleHierarchy: Record<UserRole, number> = {
      viewer: 1,
      operator: 2,
      manager: 3,
      admin: 4
    };
    return roleHierarchy[user.role] >= roleHierarchy[minRole];
  }, [user]);

  // 포괄적인 권한 체크 함수
  const hasRequiredPermission = useCallback((options: UsePermissionOptions = {}) => {
    if (!user) return false;

    const { requiredPermissions = [], requiredRole } = options;

    const result = checkPermission(user, requiredPermissions, requiredRole);
    return result.allowed;
  }, [user]);

  // 권한 없음 모달 표시
  const showPermissionDeniedModal = useCallback((options: UsePermissionOptions = {}) => {
    const { requiredPermissions = [], requiredRole, customMessage } = options;

    setDeniedPermissions(requiredPermissions);
    setDeniedRole(requiredRole);
    setDeniedMessage(customMessage);
    setIsPermissionDeniedModalOpen(true);
  }, []);

  // 권한 없음 모달 닫기
  const closePermissionDeniedModal = useCallback(() => {
    setIsPermissionDeniedModalOpen(false);
    setDeniedPermissions([]);
    setDeniedRole(undefined);
    setDeniedMessage(undefined);
  }, []);

  // 권한 체크 후 실행하는 고차 함수
  const handleWithPermission = useCallback(<T extends any[]>(
    callback: (...args: T) => void,
    options: UsePermissionOptions = {}
  ) => {
    return (...args: T) => {
      if (hasRequiredPermission(options)) {
        callback(...args);
      } else {
        showPermissionDeniedModal(options);
      }
    };
  }, [hasRequiredPermission, showPermissionDeniedModal]);

  return {
    // 사용자 정보
    user,

    // 권한 체크 함수들
    hasPermission: checkUserPermission,
    hasRole: checkUserRole,
    hasRequiredPermission,

    // 권한 체크 후 실행
    handleWithPermission,

    // 모달 관련
    isPermissionDeniedModalOpen,
    deniedPermissions,
    deniedRole,
    deniedMessage,
    showPermissionDeniedModal,
    closePermissionDeniedModal,
  };
}

export default usePermission;