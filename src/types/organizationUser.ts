// 조직 사용자 타입 정의 (기존 User 타입 확장)

import { UserRole, UserStatus } from './user';

export interface OrganizationUser {
  // 기존 User 필드
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
  hasGASetup: boolean;
  gaSetupDate?: string;
  isFirstLogin: boolean;

  // 새로 추가된 필드
  organizationUserId: string;
  organizationId: string;
  memberId: string;
}

// user.ts에서 재사용
export type { UserRole, UserStatus };
export { DEFAULT_PERMISSIONS_BY_ROLE, ROLE_NAMES, STATUS_NAMES } from './user';
