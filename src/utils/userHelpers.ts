import { User, UserRole, ROLE_NAMES, STATUS_NAMES } from '@/types/user';
import { MOCK_USERS, getUsersByRole, getActiveUsers, getUsersByDepartment } from '@/data/userMockData';

/**
 * 사용자 표시 형식 포맷팅
 */
export const formatUserDisplay = (user: User, format: 'name' | 'namePosition' | 'nameEmail' | 'full' = 'namePosition'): string => {
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
export const getStatusName = (status: User['status']): string => {
  return STATUS_NAMES[status];
};

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export const hasPermission = (user: User, permission: string): boolean => {
  return user.permissions.includes('permission.all') || user.permissions.includes(permission);
};

/**
 * 승인자로 사용 가능한 사용자들 필터링
 */
export const getAvailableApprovers = (excludeUserIds: string[] = []): User[] => {
  return MOCK_USERS.filter(user =>
    ['operator', 'manager', 'admin'].includes(user.role) &&
    user.status === 'active' &&
    !excludeUserIds.includes(user.id)
  );
};

/**
 * 필수 승인자들 가져오기
 */
export const getRequiredApprovers = (): User[] => {
  return MOCK_USERS.filter(user =>
    ['manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );
};

/**
 * 부서별 매니저 가져오기
 */
export const getDepartmentManagers = (department?: string): User[] => {
  const managers = MOCK_USERS.filter(user =>
    ['manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );

  if (department) {
    return managers.filter(user => user.department === department);
  }

  return managers;
};

/**
 * 사용자 검색 (이름, 이메일, 부서로 검색)
 */
export const searchUsers = (query: string, users: User[] = MOCK_USERS): User[] => {
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
 * 역할별 사용자 통계
 */
export const getUserStatsByRole = (): Record<UserRole, number> => {
  const stats = {} as Record<UserRole, number>;

  // 모든 역할을 0으로 초기화
  Object.keys(ROLE_NAMES).forEach(role => {
    stats[role as UserRole] = 0;
  });

  // 활성 사용자만 카운트
  getActiveUsers().forEach(user => {
    stats[user.role]++;
  });

  return stats;
};

/**
 * 부서별 사용자 통계
 */
export const getUserStatsByDepartment = (): Record<string, number> => {
  const stats: Record<string, number> = {};

  getActiveUsers().forEach(user => {
    if (user.department) {
      stats[user.department] = (stats[user.department] || 0) + 1;
    }
  });

  return stats;
};

/**
 * 최근 로그인한 사용자들 가져오기
 */
export const getRecentlyActiveUsers = (days: number = 7): User[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return MOCK_USERS.filter(user => {
    if (!user.lastLogin) return false;
    const lastLoginDate = new Date(user.lastLogin);
    return lastLoginDate >= cutoffDate && user.status === 'active';
  }).sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime());
};

/**
 * 사용자 권한 확인 (다중 권한)
 */
export const hasAnyPermission = (user: User, permissions: string[]): boolean => {
  if (user.permissions.includes('permission.all')) {
    return true;
  }
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * 사용자 권한 확인 (모든 권한 필요)
 */
export const hasAllPermissions = (user: User, permissions: string[]): boolean => {
  if (user.permissions.includes('permission.all')) {
    return true;
  }
  return permissions.every(permission => user.permissions.includes(permission));
};

/**
 * 승인 체인을 위한 사용자 순서 정렬
 * CEO > CFO > CTO > 관리자 > 승인자 순
 */
export const sortUsersByApprovalHierarchy = (users: User[]): User[] => {
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