/**
 * RoleBadge 컴포넌트
 * 관리자 역할을 시각적으로 표시하는 배지
 */

import { AdminRole } from '@/types/admin';

interface RoleBadgeProps {
  role: AdminRole;
  size?: 'sm' | 'md';
}

const roleConfig = {
  [AdminRole.SUPER_ADMIN]: {
    label: '슈퍼 관리자',
    className: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400'
  },
  [AdminRole.OPERATIONS]: {
    label: '운영팀',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  [AdminRole.COMPLIANCE]: {
    label: '컴플라이언스',
    className: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  [AdminRole.SUPPORT]: {
    label: '고객지원',
    className: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  [AdminRole.VIEWER]: {
    label: '조회자',
    className: 'bg-gray-50 text-gray-700 border-gray-200'
  }
};

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const config = roleConfig[role];

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
