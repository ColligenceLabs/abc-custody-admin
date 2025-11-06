/**
 * OrganizationUsersList Component
 * 법인 소속 사용자 리스트
 *
 * 같은 organizationId를 가진 모든 사용자 표시
 */

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { OrganizationUser, OrganizationUsersResponse } from "@/types/onboardingAml";
import { fetchOrganizationUsers } from "@/services/onboardingAmlApi";

interface OrganizationUsersListProps {
  organizationId: string;
}

export function OrganizationUsersList({ organizationId }: OrganizationUsersListProps) {
  const [data, setData] = useState<OrganizationUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [organizationId]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrganizationUsers(organizationId);
      setData(response);
    } catch (err) {
      console.error('Failed to load organization users:', err);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
        사용자 목록을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!data || data.users.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        등록된 사용자가 없습니다.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/10">
      <div className="mb-3 px-2">
        <span className="text-sm font-semibold text-muted-foreground">
          조직 사용자 ({data.totalUsers}명)
        </span>
        {data.organizationName && (
          <span className="ml-2 text-sm text-muted-foreground">
            - {data.organizationName}
          </span>
        )}
      </div>

      <div className="bg-background rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/30">
            <tr className="text-xs text-muted-foreground">
              <th className="p-3 text-left font-medium">이름</th>
              <th className="p-3 text-left font-medium">이메일</th>
              <th className="p-3 text-left font-medium">역할</th>
              <th className="p-3 text-left font-medium">상태</th>
              <th className="p-3 text-left font-medium">부서</th>
              <th className="p-3 text-left font-medium">마지막 로그인</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors text-sm">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {user.isOrganizationOwner && (
                      <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200">
                        대표
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="p-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="p-3 text-muted-foreground">{user.department || '-'}</td>
                <td className="p-3 text-muted-foreground">
                  {user.lastLogin ? formatRelativeTime(user.lastLogin) : '로그인 기록 없음'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 헬퍼 컴포넌트: 역할 배지
function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { label: string; className: string }> = {
    admin: {
      label: '관리자',
      className: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    manager: {
      label: '매니저',
      className: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    operator: {
      label: '운영자',
      className: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    viewer: {
      label: '조회자',
      className: 'bg-gray-50 text-gray-600 border-gray-200'
    },
  };

  const config = roleConfig[role] || roleConfig.viewer;

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
}

// 헬퍼 컴포넌트: 상태 배지
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: {
      label: '활성',
      className: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    pending: {
      label: '대기',
      className: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    },
    inactive: {
      label: '비활성',
      className: 'bg-gray-50 text-gray-600 border-gray-200'
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
}

// 헬퍼 함수: 상대 시간 포맷팅
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`;
  if (diffMins < 43200) return `${Math.floor(diffMins / 1440)}일 전`;

  // 한 달 이상이면 날짜로 표시
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
