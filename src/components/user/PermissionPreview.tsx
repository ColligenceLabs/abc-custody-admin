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
    description: "모든 시스템 기능에 대한 전체 권한을 보유합니다.",
    categories: [
      {
        name: "대시보드",
        icon: HomeIcon,
        permissions: ["대시보드 조회", "자산 현황 조회", "통계 데이터 조회", "차트/그래프 조회"],
        hasAccess: true
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "상세 거래 정보 조회", "CSV 다운로드", "거래 검색/필터링"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 생성(권한설정)", "사용자 목록 조회", "사용자 상세정보 조회", "사용자 정보 수정", "사용자 정지"],
        hasAccess: true
      },
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 생성(예산설정, 승인자 지정)", "그룹 목록 조회", "그룹 상세정보 조회", "그룹 생성 승인/반려", "그룹 지출 신청", "그룹 삭제/비활성화"],
        hasAccess: true
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 현황 확인", "입금 내역 조회", "출금 요청 생성", "출금 요청 조회", "출금 승인/반려", "긴급 출금 중단"],
        hasAccess: true
      },
      {
        name: "부가 서비스",
        icon: CubeIcon,
        permissions: ["스테이킹 참여/해제", "스테이킹 목록조회", "대출 실행/상환", "대출 목록조회", "토큰 교환 실행/조회", "구매 대행"],
        hasAccess: true
      },
      {
        name: "보안 설정",
        icon: ShieldCheckIcon,
        permissions: ["관리자 보안 정책 설정/확인", "Google Authenticator 설정", "관리자 접근 IP 관리", "주소 관리", "계좌 연동", "정책 관리", "알림 설정"],
        hasAccess: true
      },
      {
        name: "설정 및 구독",
        icon: SparklesIcon,
        permissions: ["회사 정보 설정", "구독 플랜 관리", "결제 정보 관리", "시스템 설정"],
        hasAccess: true
      }
    ],
    keyPermissions: ["전체 시스템 관리", "모든 기능 사용 가능", "최고 수준 보안 접근"]
  },
  manager: {
    description: "관리 업무와 승인 업무를 담당하며, 일부 시스템 설정은 제한됩니다.",
    categories: [
      {
        name: "대시보드",
        icon: HomeIcon,
        permissions: ["대시보드 조회", "자산 현황 조회", "통계 데이터 조회", "차트/그래프 조회"],
        hasAccess: true
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "상세 거래 정보 조회", "CSV 다운로드", "거래 검색/필터링"],
        hasAccess: true
      },
      {
        name: "사용자 관리",
        icon: UserIcon,
        permissions: ["사용자 생성(권한설정)", "사용자 목록 조회", "사용자 상세정보 조회", "사용자 정보 수정", "사용자 정지"],
        hasAccess: true
      },
      {
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 생성(예산설정, 승인자 지정)", "그룹 목록 조회", "그룹 상세정보 조회", "그룹 생성 승인/반려", "그룹 지출 신청"],
        hasAccess: true
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 현황 확인", "입금 내역 조회", "출금 요청 생성", "출금 요청 조회", "출금 승인/반려", "긴급 출금 중단"],
        hasAccess: true
      },
      {
        name: "부가 서비스",
        icon: CubeIcon,
        permissions: ["스테이킹 참여/해제", "스테이킹 목록조회", "대출 실행/상환", "대출 목록조회", "토큰 교환 실행/조회", "구매 대행"],
        hasAccess: true
      },
      {
        name: "보안 설정",
        icon: ShieldCheckIcon,
        permissions: ["Google Authenticator 설정", "주소 관리", "계좌 연동", "정책 관리"],
        hasAccess: "partial",
        restrictions: ["관리자 보안 정책 설정 불가", "관리자 접근 IP 관리 불가", "알림 템플릿 관리 불가"]
      },
      {
        name: "설정 및 구독",
        icon: SparklesIcon,
        permissions: ["회사 정보 설정", "구독 플랜 관리", "결제 정보 관리", "시스템 설정"],
        hasAccess: true
      }
    ],
    keyPermissions: ["사용자 관리 및 생성", "출금 승인 및 반려", "정책 관리 및 수정", "그룹 관리 및 승인"]
  },
  operator: {
    description: "실무 작업을 담당하며, 관리 기능은 제한됩니다.",
    categories: [
      {
        name: "대시보드",
        icon: HomeIcon,
        permissions: ["대시보드 조회", "자산 현황 조회", "통계 데이터 조회", "차트/그래프 조회"],
        hasAccess: true
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "상세 거래 정보 조회", "CSV 다운로드", "거래 검색/필터링"],
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
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 생성(예산설정, 승인자 지정)", "그룹 목록 조회", "그룹 상세정보 조회", "그룹 지출 신청"],
        hasAccess: "partial",
        restrictions: ["그룹 생성 승인/반려 불가", "그룹 삭제/비활성화 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 현황 확인", "입금 내역 조회", "출금 요청 생성", "출금 요청 조회", "긴급 출금 중단"],
        hasAccess: "partial",
        restrictions: ["출금 승인/반려 불가"]
      },
      {
        name: "부가 서비스",
        icon: CubeIcon,
        permissions: ["스테이킹 참여/해제", "스테이킹 목록조회", "대출 실행/상환", "대출 목록조회", "토큰 교환 실행/조회", "구매 대행"],
        hasAccess: true
      },
      {
        name: "보안 설정",
        icon: ShieldCheckIcon,
        permissions: ["Google Authenticator 설정", "주소 조회", "계좌 조회", "정책 조회", "알림 템플릿 생성/수정", "승인자 이메일 정책 설정", "알림 내역 조회"],
        hasAccess: "partial",
        restrictions: ["주소 추가/삭제 불가", "계좌 등록/삭제 불가", "정책 생성/수정/정지 불가"]
      },
      {
        name: "설정 및 구독",
        icon: SparklesIcon,
        permissions: ["회사 정보 설정", "구독 플랜 관리", "결제 정보 관리", "시스템 설정"],
        hasAccess: true
      }
    ],
    keyPermissions: ["출금 요청 생성", "그룹 생성 및 관리", "부가 서비스 이용", "긴급 출금 중단", "알림 템플릿 관리"]
  },
  viewer: {
    description: "조회 권한만 보유하며, 데이터 수정 및 거래는 불가합니다.",
    categories: [
      {
        name: "대시보드",
        icon: HomeIcon,
        permissions: ["대시보드 조회", "자산 현황 조회", "통계 데이터 조회", "차트/그래프 조회"],
        hasAccess: true
      },
      {
        name: "거래내역",
        icon: ChartBarIcon,
        permissions: ["거래내역 조회", "상세 거래 정보 조회", "CSV 다운로드", "거래 검색/필터링"],
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
        name: "그룹 관리",
        icon: UserGroupIcon,
        permissions: ["그룹 목록 조회", "그룹 상세정보 조회"],
        hasAccess: "partial",
        restrictions: ["그룹 생성/수정/삭제 불가", "그룹 지출 신청 불가"]
      },
      {
        name: "입출금 관리",
        icon: BanknotesIcon,
        permissions: ["입금 현황 확인", "입금 내역 조회", "출금 요청 조회"],
        hasAccess: "partial",
        restrictions: ["출금 요청 생성 불가", "출금 승인/반려 불가", "긴급 출금 중단 불가"]
      },
      {
        name: "부가 서비스",
        icon: CubeIcon,
        permissions: ["스테이킹 목록조회", "대출 목록조회", "토큰 교환 조회", "구매 대행 내역 조회"],
        hasAccess: "partial",
        restrictions: ["모든 실행 기능 불가"]
      },
      {
        name: "보안 설정",
        icon: ShieldCheckIcon,
        permissions: ["Google Authenticator 설정", "주소 조회", "계좌 조회", "정책 조회"],
        hasAccess: "partial",
        restrictions: ["모든 관리 기능 불가"]
      },
      {
        name: "설정 및 구독",
        icon: SparklesIcon,
        permissions: ["회사 정보 조회", "구독 플랜 조회"],
        hasAccess: "partial",
        restrictions: ["설정 변경 불가", "결제 정보 관리 불가"]
      }
    ],
    keyPermissions: ["모든 데이터 조회", "거래 내역 확인", "리포트 다운로드", "그룹 정보 조회", "입금 현황 확인"]
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