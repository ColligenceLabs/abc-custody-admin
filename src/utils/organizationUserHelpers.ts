/**
 * 조직 사용자 관련 유틸리티 함수
 */

import { OrganizationUser, UserRole, ROLE_NAMES, STATUS_NAMES } from '@/types/organizationUser';
import {
  MOCK_ORGANIZATION_USERS,
  getOrganizationUsersByRole,
  getActiveOrganizationUsers,
  getOrganizationUsersByDepartment,
  getOrganizationUsersByOrganizationId
} from '@/data/organizationUserMockData';

/**
 * 조직 사용자 표시 형식 포맷팅
 */
export const formatOrganizationUserDisplay = (
  user: OrganizationUser,
  format: 'name' | 'namePosition' | 'nameEmail' | 'full' = 'namePosition'
): string => {
  switch (format) {
    case 'name':
      return user.name;
    case 'namePosition':
      return `${user.name} (${user.position || ROLE_NAMES[user.role]})`;
    case 'nameEmail':
      return `${user.name} (${user.email})`;
    case 'full':
      return `${user.name} (${user.position || ROLE_NAMES[user.role]}) - ${user.email}`;
    default:
      return user.name;
  }
};

/**
 * 역할 한국어 이름 가져오기
 */
export const getRoleName = (role: UserRole): string => {
  return ROLE_NAMES[role];
};

/**
 * 상태 한국어 이름 가져오기
 */
export const getStatusName = (status: OrganizationUser['status']): string => {
  return STATUS_NAMES[status];
};

/**
 * 조직 사용자가 특정 권한을 가지고 있는지 확인
 */
export const hasPermission = (user: OrganizationUser, permission: string): boolean => {
  return user.permissions.includes('permission.all') || user.permissions.includes(permission);
};

/**
 * 특정 조직의 승인자로 사용 가능한 사용자들 필터링
 */
export const getAvailableApprovers = (
  organizationId: string,
  excludeUserIds: string[] = []
): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user =>
    user.organizationId === organizationId &&
    ['operator', 'manager', 'admin'].includes(user.role) &&
    user.status === 'active' &&
    !excludeUserIds.includes(user.id)
  );
};

/**
 * 특정 조직의 필수 승인자들 가져오기
 */
export const getRequiredApprovers = (organizationId: string): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user =>
    user.organizationId === organizationId &&
    ['manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );
};

/**
 * 특정 조직의 부서별 매니저 가져오기
 */
export const getDepartmentManagers = (
  organizationId: string,
  department?: string
): OrganizationUser[] => {
  const managers = MOCK_ORGANIZATION_USERS.filter(user =>
    user.organizationId === organizationId &&
    ['manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );

  if (department) {
    return managers.filter(user => user.department === department);
  }

  return managers;
};

/**
 * 조직 사용자 검색 (이름, 이메일, 부서로 검색)
 */
export const searchOrganizationUsers = (
  query: string,
  organizationId?: string
): OrganizationUser[] => {
  let users = organizationId
    ? getOrganizationUsersByOrganizationId(organizationId)
    : MOCK_ORGANIZATION_USERS;

  if (!query.trim()) {
    return users;
  }

  const lowercaseQuery = query.toLowerCase();
  return users.filter(user =>
    user.name.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery) ||
    (user.department && user.department.toLowerCase().includes(lowercaseQuery)) ||
    (user.position && user.position.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * 특정 조직의 역할별 사용자 통계
 */
export const getUserStatsByRole = (organizationId: string): Record<UserRole, number> => {
  const stats = {} as Record<UserRole, number>;

  // 모든 역할을 0으로 초기화
  Object.keys(ROLE_NAMES).forEach(role => {
    stats[role as UserRole] = 0;
  });

  // 해당 조직의 활성 사용자만 카운트
  const orgUsers = getOrganizationUsersByOrganizationId(organizationId).filter(
    user => user.status === 'active'
  );

  orgUsers.forEach(user => {
    stats[user.role]++;
  });

  return stats;
};

/**
 * 특정 조직의 부서별 사용자 통계
 */
export const getUserStatsByDepartment = (organizationId: string): Record<string, number> => {
  const stats: Record<string, number> = {};

  const orgUsers = getOrganizationUsersByOrganizationId(organizationId).filter(
    user => user.status === 'active'
  );

  orgUsers.forEach(user => {
    if (user.department) {
      stats[user.department] = (stats[user.department] || 0) + 1;
    }
  });

  return stats;
};

/**
 * 특정 조직의 최근 로그인한 사용자들 가져오기
 */
export const getRecentlyActiveUsers = (
  organizationId: string,
  days: number = 7
): OrganizationUser[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return MOCK_ORGANIZATION_USERS.filter(user => {
    if (user.organizationId !== organizationId) return false;
    if (!user.lastLogin) return false;
    const lastLoginDate = new Date(user.lastLogin);
    return lastLoginDate >= cutoffDate && user.status === 'active';
  }).sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime());
};

/**
 * 조직 사용자 권한 확인 (다중 권한)
 */
export const hasAnyPermission = (user: OrganizationUser, permissions: string[]): boolean => {
  if (user.permissions.includes('permission.all')) {
    return true;
  }
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * 조직 사용자 권한 확인 (모든 권한 필요)
 */
export const hasAllPermissions = (user: OrganizationUser, permissions: string[]): boolean => {
  if (user.permissions.includes('permission.all')) {
    return true;
  }
  return permissions.every(permission => user.permissions.includes(permission));
};

/**
 * 승인 체인을 위한 사용자 순서 정렬
 * CEO > CFO > CTO > 관리자 > 승인자 순
 */
export const sortUsersByApprovalHierarchy = (users: OrganizationUser[]): OrganizationUser[] => {
  const hierarchyOrder: Record<string, number> = {
    'CEO': 1,
    'CFO': 2,
    'CTO': 3,
    '관리자': 4,
    '부관리자': 5,
    '리스크관리자': 6,
    '컴플라이언스': 7,
    'CISO': 8
  };

  return users.sort((a, b) => {
    const aOrder = hierarchyOrder[a.position || ''] || 999;
    const bOrder = hierarchyOrder[b.position || ''] || 999;
    return aOrder - bOrder;
  });
};
