/**
 * AdminStatusBadge 컴포넌트
 * 관리자 계정 상태를 시각적으로 표시하는 배지
 */

import { AdminUserStatus } from '@/types/admin';

interface AdminStatusBadgeProps {
  status: AdminUserStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  [AdminUserStatus.ACTIVE]: {
    label: '활성',
    className: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  [AdminUserStatus.PENDING]: {
    label: '대기',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  [AdminUserStatus.SUSPENDED]: {
    label: '정지',
    className: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  [AdminUserStatus.INACTIVE]: {
    label: '비활성',
    className: 'bg-gray-50 text-gray-700 border-gray-200'
  }
};

export default function AdminStatusBadge({ status, size = 'md' }: AdminStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full border bg-gray-50 text-gray-600 border-gray-200">
        Unknown
      </span>
    );
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`${sizeClass} font-semibold rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}
