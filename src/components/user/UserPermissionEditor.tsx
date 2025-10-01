"use client";

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  ROLE_NAMES,
  PERMISSION_CATEGORIES,
  PERMISSION_CATEGORY_NAMES,
  DEFAULT_PERMISSIONS_BY_ROLE
} from '@/types/user';
import {
  getDefaultPermissionsForRole,
  groupPermissionsByCategory,
  getPermissionCategoryName,
  getRoleColor
} from '@/utils/permissionUtils';
import {
  UserIcon,
  ShieldCheckIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface UserPermissionEditorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  customPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  className?: string;
}

// 권한별 세부 정보 정의
const PERMISSION_DETAILS: Record<string, { name: string; description: string }> = {
  'permission.assets.view': { name: '자산 조회', description: '자산 현황 및 잔액 조회' },
  'permission.assets.view_transactions': { name: '거래 내역 조회', description: '입출금 거래 내역 확인' },
  'permission.assets.create_transactions': { name: '거래 신청', description: '신규 거래 신청 및 실행' },
  'permission.users.view': { name: '사용자 조회', description: '사용자 목록 및 정보 조회' },
  'permission.users.create': { name: '사용자 추가', description: '신규 사용자 등록' },
  'permission.users.edit': { name: '사용자 수정', description: '사용자 정보 수정' },
  'permission.users.manage_permissions': { name: '권한 설정', description: '사용자 권한 및 역할 관리' },
  'permission.policies.view': { name: '정책 조회', description: '보안 정책 확인' },
  'permission.policies.create': { name: '정책 생성', description: '신규 정책 작성' },
  'permission.policies.edit': { name: '정책 수정', description: '기존 정책 편집' },
  'permission.system.view_audit': { name: '감사 로그', description: '시스템 감사 로그 조회' },
  'permission.system.notifications': { name: '알림 설정', description: '시스템 알림 관리' },
  'permission.system.security_settings': { name: '보안 설정', description: '보안 구성 관리' },
  'permission.system.admin': { name: '시스템 관리', description: '전체 시스템 관리자 권한' }
};


// 카테고리별 아이콘
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  assets: ChartBarIcon,
  users: UserIcon,
  policies: DocumentTextIcon,
  system: CogIcon
};

export default function UserPermissionEditor({
  selectedRole,
  onRoleChange,
  customPermissions,
  onPermissionsChange,
  className = ''
}: UserPermissionEditorProps) {
  const [localPermissions, setLocalPermissions] = useState<string[]>(customPermissions);

  // 역할 변경 시 기본 권한으로 초기화
  useEffect(() => {
    const defaultPermissions = getDefaultPermissionsForRole(selectedRole);
    setLocalPermissions(defaultPermissions);
    onPermissionsChange(defaultPermissions);
  }, [selectedRole, onPermissionsChange]);

  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
  };

  const handlePermissionToggle = (permission: string) => {
    const updated = localPermissions.includes(permission)
      ? localPermissions.filter(p => p !== permission)
      : [...localPermissions, permission];

    setLocalPermissions(updated);
    onPermissionsChange(updated);
  };


  const groupedPermissions = groupPermissionsByCategory(
    Object.keys(PERMISSION_DETAILS).filter(p => p !== 'permission.all')
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 역할 선택 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">역할 선택</h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(ROLE_NAMES) as UserRole[]).map((role) => (
            <label
              key={role}
              className={`
                relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                ${selectedRole === role
                  ? `${getRoleColor(role)} border-current`
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="role"
                value={role}
                checked={selectedRole === role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-medium">{ROLE_NAMES[role]}</div>
                <div className="text-sm opacity-75 mt-1">
                  {role === 'admin' && '시스템 전체 관리'}
                  {role === 'manager' && '정책 설정, 사용자 관리'}
                  {role === 'operator' && '일반 거래 처리, 승인'}
                  {role === 'viewer' && '데이터 조회, 리포트 확인'}
                </div>
              </div>
              {selectedRole === role && (
                <CheckIcon className="w-5 h-5 text-current flex-shrink-0" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* 권한 커스터마이징 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">권한 커스터마이징</h3>

        {selectedRole === 'admin' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-600 mr-2" />
              <p className="text-sm font-medium text-indigo-800">
                관리자는 아래 모든 권한을 자동으로 보유합니다
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, permissions]) => {
            const IconComponent = CATEGORY_ICONS[category] || CogIcon;
            const categoryName = getPermissionCategoryName(category);

            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <IconComponent className="w-5 h-5 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">{categoryName}</h4>
                </div>

                <div className="space-y-2">
                  {permissions.map((permission) => {
                    const detail = PERMISSION_DETAILS[permission];
                    const isChecked = localPermissions.includes(permission);
                    const isAdmin = selectedRole === 'admin';

                    return (
                      <label
                        key={permission}
                        className={`flex items-start space-x-3 p-2 rounded ${
                          isAdmin ? 'cursor-default bg-indigo-25' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={isAdmin}
                          className={`mt-1 w-4 h-4 ${
                            isAdmin
                              ? 'text-indigo-400 border-indigo-200 bg-indigo-50 cursor-not-allowed'
                              : 'text-sky-600 border-gray-300'
                          } rounded focus:ring-sky-500`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${
                            isAdmin ? 'text-indigo-700' : 'text-gray-900'
                          }`}>
                            {detail.name}
                          </div>
                          <div className={`text-xs ${
                            isAdmin ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            {detail.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}