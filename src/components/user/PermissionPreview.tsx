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
    description: "시스템 관리자. 사용자 생성/비활성화, 시스템 설정, 구독 관리 담당.",
    categories: [
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 생성", "사용자 수정", "사용자 비활성화", "이메일 재발송"],
        hasAccess: true
      },
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 수정", "예산 관리"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 불가", "승인/반려 불가"]
      },
      {
        name: "입금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 주소 조회", "입금 히스토리", "자산 추가"],
        hasAccess: "partial",
        restrictions: ["입금 생성 불가", "입금 승인 불가"]
      },
      {
        name: "출금 관리",
        icon: BanknotesIcon,
        permissions: ["출금 내역 조회"],
        hasAccess: "partial",
        restrictions: ["출금 신청 불가", "승인/반려 불가"]
      },
      {
        name: "부가서비스",
        icon: SparklesIcon,
        permissions: ["스테이킹", "대출 신청", "교환", "가상자산 판매/구매"],
        hasAccess: true
      },
      {
        name: "마이페이지",
        icon: CogIcon,
        permissions: ["보안 설정", "주소 관리", "계좌 연동"],
        hasAccess: true
      },
      {
        name: "시스템 관리",
        icon: ShieldCheckIcon,
        permissions: ["시스템 설정", "구독 관리"],
        hasAccess: true
      }
    ],
    keyPermissions: ["사용자 생성/비활성화", "시스템 설정", "구독 관리", "그룹 수정/예산 관리"]
  },
  manager: {
    description: "매니저. 그룹/출금/입금 승인/반려 담당, 생성 불가.",
    categories: [
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 승인", "그룹 반려"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 불가", "그룹 수정 불가"]
      },
      {
        name: "출금 관리",
        icon: BanknotesIcon,
        permissions: ["출금 승인", "출금 반려"],
        hasAccess: "partial",
        restrictions: ["출금 신청 불가", "출금 정지 불가"]
      },
      {
        name: "입금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 내역 조회"],
        hasAccess: "partial",
        restrictions: ["입금 생성 불가", "자산 추가 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "다운로드"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 목록 조회"],
        hasAccess: "partial",
        restrictions: ["사용자 생성/수정/비활성화 불가"]
      },
      {
        name: "부가서비스",
        icon: SparklesIcon,
        permissions: ["조회만 가능"],
        hasAccess: "partial",
        restrictions: ["생성/실행 불가"]
      }
    ],
    keyPermissions: ["그룹 승인/반려", "출금 승인/반려"]
  },
  operator: {
    description: "운영자. 그룹 생성/중지, 출금 신청/정지 담당.",
    categories: [
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 생성", "그룹 수정", "그룹 중지", "처리 완료"],
        hasAccess: "partial",
        restrictions: ["승인/반려 불가"]
      },
      {
        name: "출금 관리",
        icon: BanknotesIcon,
        permissions: ["출금 신청", "출금 정지"],
        hasAccess: "partial",
        restrictions: ["승인/반려 불가"]
      },
      {
        name: "입금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 내역 조회"],
        hasAccess: "partial",
        restrictions: ["입금 생성 불가", "자산 추가 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "다운로드"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 목록 조회"],
        hasAccess: "partial",
        restrictions: ["사용자 생성/수정/비활성화 불가"]
      },
      {
        name: "부가서비스",
        icon: SparklesIcon,
        permissions: ["조회만 가능"],
        hasAccess: "partial",
        restrictions: ["생성/실행 불가"]
      }
    ],
    keyPermissions: ["그룹 생성/중지", "출금 신청/정지"]
  },
  viewer: {
    description: "조회자. 조회 전용, 모든 생성/수정/승인 불가.",
    categories: [
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 목록 조회", "감사 추적", "CSV 내보내기"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 불가", "승인/반려 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입출금 내역 조회"],
        hasAccess: "partial",
        restrictions: ["출금 신청 불가", "승인/반려 불가", "입금 생성 불가"]
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "다운로드"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 목록 조회"],
        hasAccess: "partial",
        restrictions: ["사용자 생성/수정/비활성화 불가"]
      },
      {
        name: "부가서비스",
        icon: SparklesIcon,
        permissions: ["조회만 가능"],
        hasAccess: "partial",
        restrictions: ["생성/실행 불가"]
      },
      {
        name: "마이페이지",
        icon: CogIcon,
        permissions: ["개인정보", "본인인증", "eKYC", "AML 재이행"],
        hasAccess: true
      }
    ],
    keyPermissions: ["모든 조회만 가능", "생성/수정/승인 모두 불가"]
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
        <div className="flex items-center mb-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role)}`}>
            {ROLE_NAMES[role]}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          {roleData.description}
        </p>

        {/* 주요 권한 */}
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
          <h4 className="text-sm font-medium text-sky-900 mb-2">주요 권한</h4>
          <ul className="space-y-1">
            {roleData.keyPermissions.map((permission, index) => (
              <li key={index} className="flex items-start text-xs text-sky-700">
                <CheckIcon className="w-3 h-3 text-sky-600 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}