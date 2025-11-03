import { OrganizationUser } from '@/types/organizationUser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreateOrganizationUserRequest {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department?: string;
  position?: string;
  organizationId: string;
  organizationName?: string;
  memberId?: string;
  permissions?: string[];
}

export interface UpdateOrganizationUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'manager' | 'operator' | 'viewer';
  department?: string;
  position?: string;
  permissions?: string[];
  status?: 'active' | 'inactive' | 'pending';
  changedBy?: string;
  reason?: string;
}

export interface PermissionLog {
  id: string;
  userId: string;
  organizationId: string;
  previousRole: string | null;
  newRole: string | null;
  previousPermissions: string[] | null;
  newPermissions: string[] | null;
  changedBy: string;
  changedAt: string;
  reason: string | null;
  changedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * 조직 사용자 목록 조회
 */
export async function getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/api/users?organizationId=${organizationId}&memberType=corporate&_limit=1000`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    throw new Error('조직 사용자 목록 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 조직 사용자 생성
 */
export async function createOrganizationUser(data: CreateOrganizationUserRequest): Promise<OrganizationUser> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({
      ...data,
      memberType: 'corporate',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '사용자 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * 조직 사용자 정보 수정
 */
export async function updateOrganizationUser(
  id: string,
  data: UpdateOrganizationUserRequest
): Promise<OrganizationUser> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '사용자 수정에 실패했습니다.');
  }

  return response.json();
}

/**
 * 조직 사용자 삭제
 */
export async function deleteOrganizationUser(id: string): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '사용자 삭제에 실패했습니다.');
  }
}

/**
 * 사용자 권한 변경 이력 조회
 */
export async function getPermissionLogs(
  userId: string,
  page: number = 1,
  limit: number = 100
): Promise<PermissionLog[]> {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/api/users/${userId}/permission-logs?_page=${page}&_limit=${limit}&_sort=changedAt&_order=desc`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    throw new Error('권한 변경 이력 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 이메일 인증 재발송
 */
export async function resendVerificationEmail(userId: string): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/api/users/${userId}/send-verification-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '이메일 재발송에 실패했습니다.');
  }

  return response.json();
}
