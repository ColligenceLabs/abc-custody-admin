/**
 * AdminUserTable 컴포넌트
 * 관리자 목록 테이블
 */

'use client';

import { useState } from 'react';
import { AdminUser, AdminRole, AdminUserStatus } from '@/types/admin';
import RoleBadge from './RoleBadge';
import AdminStatusBadge from './AdminStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PencilIcon, TrashIcon, KeyIcon, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminUserTableProps {
  users: AdminUser[];
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  isLoading?: boolean;
}

export default function AdminUserTable({
  users,
  onEdit,
  onDelete,
  onResetPassword,
  isLoading = false
}: AdminUserTableProps) {
  const formatLastLogin = (lastLogin?: Date) => {
    if (!lastLogin) return '-';

    try {
      return formatDistanceToNow(new Date(lastLogin), {
        addSuffix: true,
        locale: ko
      });
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">관리자 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">관리자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              이름
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              이메일
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              역할
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              2FA
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              마지막 로그인
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <RoleBadge role={user.role} size="sm" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <AdminStatusBadge status={user.status} size="sm" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.twoFactorEnabled ? (
                  <span className="text-sky-600 font-medium text-sm">활성</span>
                ) : (
                  <span className="text-gray-400 text-sm">비활성</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {formatLastLogin(user.lastLogin)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user.id)}
                    className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResetPassword(user.id)}
                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                  >
                    <KeyIcon className="h-4 w-4 mr-1" />
                    비밀번호
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
