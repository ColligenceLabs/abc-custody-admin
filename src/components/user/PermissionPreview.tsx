"use client";

import React from 'react';
import {
  UserRole,
  ROLE_NAMES
} from '@/types/user';
import {
  getRoleColor
} from '@/utils/permissionUtils';
import {
  LightBulbIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserIcon,
  DocumentTextIcon,
  CogIcon,
  HomeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BanknotesIcon,
  CubeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface PermissionPreviewProps {
  role: UserRole;
  className?: string;
}

// 권한 카테고리 타입 정의
interface PermissionCategory {
  name: string;
  icon: React.ComponentType<any>;
  permissions: string[];
  hasAccess: boolean | "partial";
  restrictions?: string[];
}

// 역할별 권한 데이터 타입
interface RolePermissions {
  description: string;
  categories: PermissionCategory[];
  keyPermissions: string[];
}

// 권한체계 설계서 기반 역할별 권한 정보
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    description: "시스템 관리 및 사용자 관리 전용. 신청/승인 업무에서 분리됨.",
    categories: [
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 생성", "사용자 목록 조회", "사용자 수정", "사용자 비활성화", "권한 관리"],
        hasAccess: true
      },
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 목록 조회", "그룹 수정", "예산 관리"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 신청 불가", "그룹 승인/반려 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입출금 내역 조회"],
        hasAccess: "partial",
        restrictions: ["출금 신청 불가", "출금 승인 불가", "입금 생성 불가", "입금 승인 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "CSV 다운로드", "거래 검색/필터링"],
        hasAccess: true
      },
      {
        name: "시스템 설정",
        icon: SparklesIcon,
        permissions: ["시스템 설정 변경", "구독 관리", "결제 정보 관리", "회사 정보 설정"],
        hasAccess: true
      },
      {
        name: "감사 추적",
        icon: DocumentTextIcon,
        permissions: ["감사 추적 조회", "시스템 로그 조회"],
        hasAccess: true
      }
    ],
    keyPermissions: ["사용자 생성/비활성화", "시스템 설정 변경", "구독 관리", "그룹 예산 관리"]
  },
  manager: {
    description: "승인 전용. 그룹/출금/입금 승인 담당, 생성 불가.",
    categories: [
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 목록 조회", "그룹 승인/반려"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 불가", "그룹 수정 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입출금 내역 조회", "출금 승인/반려", "입금 승인"],
        hasAccess: "partial",
        restrictions: ["출금 신청 불가", "입금 생성 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "CSV 다운로드"],
        hasAccess: true
      },
      {
        name: "사용자 조회",
        icon: UserIcon,
        permissions: ["사용자 목록 조회"],
        hasAccess: "partial",
        restrictions: ["사용자 생성/수정 불가"]
      },
      {
        name: "감사 추적",
        icon: DocumentTextIcon,
        permissions: ["감사 추적 조회"],
        hasAccess: true
      }
    ],
    keyPermissions: ["그룹 승인/반려", "출금 승인/반려", "입금 승인"]
  },
  operator: {
    description: "신청 전용. 그룹/출금/입금 생성 담당, 승인 불가.",
    categories: [
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 목록 조회", "그룹 생성 신청"],
        hasAccess: "partial",
        restrictions: ["그룹 승인/반려 불가", "그룹 수정 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입출금 내역 조회", "출금 신청", "입금 생성"],
        hasAccess: "partial",
        restrictions: ["출금 승인/반려 불가", "입금 승인 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "CSV 다운로드"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: [],
        hasAccess: false,
        restrictions: ["사용자 관리 권한 없음"]
      },
      {
        name: "감사 추적",
        icon: DocumentTextIcon,
        permissions: ["감사 추적 조회"],
        hasAccess: true
      }
    ],
    keyPermissions: ["그룹 생성 신청", "출금 신청", "입금 생성"]
  },
  viewer: {
    description: "조회 전용. 모든 생성/수정/승인 불가.",
    categories: [
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 목록 조회"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 불가", "그룹 승인 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입출금 내역 조회"],
        hasAccess: "partial",
        restrictions: ["출금 신청 불가", "출금 승인 불가", "입금 생성 불가", "입금 승인 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "CSV 다운로드"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: [],
        hasAccess: false,
        restrictions: ["사용자 관리 권한 없음"]
      },
      {
        name: "감사 추적",
        icon: DocumentTextIcon,
        permissions: ["감사 추적 조회"],
        hasAccess: true
      }
    ],
    keyPermissions: ["모든 데이터 조회", "거래 내역 확인", "리포트 다운로드"]
  }
};

export default function PermissionPreview({
  role,
  className = ''
}: PermissionPreviewProps) {
  const roleData = ROLE_PERMISSIONS[role];
  const isAdmin = role === 'admin';

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center mb-3">
        <LightBulbIcon className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-base font-medium text-gray-900">권한 미리보기</h3>
      </div>

      {/* 역할 정보 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role)}`}>
            {ROLE_NAMES[role]}
          </span>
          <span className="text-xs text-gray-500">
            {isAdmin ? '전체 시스템 권한' :
             role === 'manager' ? '관리 및 승인 권한' :
             role === 'operator' ? '실무 작업 권한' :
             '조회 전용 권한'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {roleData.description}
        </p>
      </div>

      {/* 관리자 안내 메시지 */}
      {isAdmin && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-4 h-4 text-indigo-600 mr-2" />
            <p className="text-sm font-medium text-indigo-800">
              모든 시스템 기능 사용 가능
            </p>
          </div>
        </div>
      )}

      {/* 간략한 권한 요약 */}
      <div className="grid grid-cols-2 gap-2">
        {roleData.categories.map((category) => {
          const IconComponent = category.icon;
          const hasFullAccess = category.hasAccess === true;
          const hasPartialAccess = category.hasAccess === "partial";
          const hasNoAccess = category.hasAccess === false;

          return (
            <div key={category.name} className="flex items-center p-2 bg-white border border-gray-200 rounded text-sm">
              <IconComponent className={`w-4 h-4 mr-2 flex-shrink-0 ${
                isAdmin ? 'text-indigo-600' :
                hasFullAccess ? 'text-sky-600' :
                hasPartialAccess ? 'text-yellow-600' :
                'text-gray-400'
              }`} />
              <span className={`text-xs font-medium flex-1 ${
                isAdmin ? 'text-indigo-900' :
                hasFullAccess ? 'text-sky-900' :
                hasPartialAccess ? 'text-yellow-900' :
                'text-gray-500'
              }`}>
                {category.name}
              </span>
              {hasFullAccess || isAdmin ? (
                <CheckIcon className="w-3 h-3 text-sky-600 flex-shrink-0" />
              ) : hasPartialAccess ? (
                <span className="text-yellow-600 text-xs">부분</span>
              ) : (
                <XMarkIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* 주요 권한 */}
      {roleData.keyPermissions.length > 0 && (
        <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
          <h4 className="text-sm font-medium text-sky-900 mb-1">주요 권한</h4>
          <div className="text-xs text-sky-700">
            {roleData.keyPermissions.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}