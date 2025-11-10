/**
 * Admin User API Service
 * 관리자 계정 CRUD API 호출
 */

import {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  AdminUserStatus,
  AdminRole
} from '@/types/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: AdminRole | AdminRole[];
  status?: AdminUserStatus | AdminUserStatus[];
  search?: string;
  sortBy?: 'name' | 'email' | 'role' | 'lastLogin' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUserListResponse {
  success: boolean;
  data: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserDetailResponse {
  success: boolean;
  data: {
    user: AdminUser;
    stats: {
      totalLogins: number;
      lastLoginIp: string;
      accountAge: number;
    };
  };
}

export interface CreateAdminUserResponse {
  success: boolean;
  data: {
    user: AdminUser;
    tempPassword: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  data: {
    tempPassword: string;
    expiresAt: string;
  };
}

/**
 * 관리자 목록 조회
 */
export async function getAdminUsers(
  params?: AdminUserListParams
): Promise<AdminUserListResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }

  const url = `${API_URL}/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '관리자 목록 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 관리자 상세 조회
 */
export async function getAdminUserById(id: string): Promise<AdminUserDetailResponse> {
  const response = await fetch(`${API_URL}/api/admin/users/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '관리자 상세 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 관리자 생성
 */
export async function createAdminUser(
  data: CreateAdminUserRequest
): Promise<CreateAdminUserResponse> {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '관리자 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * 관리자 정보 수정
 */
export async function updateAdminUser(
  id: string,
  data: UpdateAdminUserRequest
): Promise<{ success: boolean; data: AdminUser }> {
  const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '관리자 정보 수정에 실패했습니다.');
  }

  return response.json();
}

/**
 * 관리자 삭제
 */
export async function deleteAdminUser(
  id: string,
  force: boolean = false
): Promise<{ success: boolean; message: string }> {
  const url = `${API_URL}/api/admin/users/${id}${force ? '?force=true' : ''}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '관리자 삭제에 실패했습니다.');
  }

  return response.json();
}

/**
 * 비밀번호 재설정
 */
export async function resetAdminPassword(
  id: string
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '비밀번호 재설정에 실패했습니다.');
  }

  return response.json();
}
