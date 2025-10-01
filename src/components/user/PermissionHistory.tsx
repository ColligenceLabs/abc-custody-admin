"use client";

import React from 'react';
import { PermissionChangeLog } from '@/types/permission';
import { ROLE_NAMES, UserRole } from '@/types/user';
import { ClockIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PermissionHistoryProps {
  logs: PermissionChangeLog[];
  className?: string;
}

// 변경 유형별 아이콘 및 색상
const CHANGE_TYPE_CONFIG = {
  role_change: {
    icon: UserIcon,
    color: 'text-blue-600 bg-blue-50',
    label: '역할 변경'
  },
  permission_add: {
    icon: ShieldCheckIcon,
    color: 'text-sky-600 bg-sky-50',
    label: '권한 추가'
  },
  permission_remove: {
    icon: ShieldCheckIcon,
    color: 'text-red-600 bg-red-50',
    label: '권한 제거'
  },
  policy_approval_add: {
    icon: ShieldCheckIcon,
    color: 'text-indigo-600 bg-indigo-50',
    label: '승인 정책 추가'
  },
  policy_approval_remove: {
    icon: ShieldCheckIcon,
    color: 'text-orange-600 bg-orange-50',
    label: '승인 정책 제거'
  }
};

function formatChangeDescription(log: PermissionChangeLog): string {
  switch (log.changeType) {
    case 'role_change':
      const oldRole = log.oldValue as UserRole;
      const newRole = log.newValue as UserRole;
      return `${ROLE_NAMES[oldRole] || log.oldValue} → ${ROLE_NAMES[newRole] || log.newValue}`;

    case 'permission_add':
      return `${log.newValue} 권한 추가`;

    case 'permission_remove':
      return `${log.oldValue} 권한 제거`;

    case 'policy_approval_add':
      return `${log.newValue} 정책 승인 권한 추가`;

    case 'policy_approval_remove':
      return `${log.oldValue} 정책 승인 권한 제거`;

    default:
      return '권한 변경';
  }
}

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function PermissionHistory({
  logs,
  className = ''
}: PermissionHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">권한 변경 이력이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">권한 변경 이력</h3>

      <div className="space-y-4">
        {logs.map((log) => {
          const config = CHANGE_TYPE_CONFIG[log.changeType];
          const IconComponent = config.icon;

          return (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-3">
                {/* 아이콘 */}
                <div className={`p-2 rounded-full ${config.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {formatChangeDescription(log)}
                  </p>

                  {log.reason && (
                    <p className="text-xs text-gray-500 mb-2">
                      사유: {log.reason}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500">
                    <UserIcon className="w-3 h-3 mr-1" />
                    <span>변경자: {log.changedBy}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 더 보기 버튼 (필요시) */}
      {logs.length >= 10 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-sky-600 hover:text-sky-700 font-medium">
            더 많은 이력 보기
          </button>
        </div>
      )}
    </div>
  );
}