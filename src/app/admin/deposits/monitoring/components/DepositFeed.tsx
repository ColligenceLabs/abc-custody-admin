'use client';

/**
 * 입금 실시간 피드 테이블
 *
 * 입금 거래 목록을 테이블 형태로 표시하고, 상세 모달 연동을 지원합니다.
 */

import { DepositTransaction, DepositStatus, MemberType } from '@/types/deposit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { formatCryptoAmount } from '@/lib/format';

interface DepositFeedProps {
  deposits: DepositTransaction[];
  isLoading?: boolean;
  onViewDetails: (deposit: DepositTransaction) => void;
}

export function DepositFeed({
  deposits,
  isLoading,
  onViewDetails,
}: DepositFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">입금 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              시간
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              회원유형
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              회원명
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              자산/금액
            </th>
            <th className="text-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              상태
            </th>
            <th className="text-right p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {deposits.map((deposit) => (
            <tr
              key={deposit.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* 시간 */}
              <td className="p-3">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(deposit.detectedAt).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </td>

              {/* 회원유형 */}
              <td className="p-3">
                {deposit.user?.memberType ? (
                  <MemberTypeBadge type={deposit.user.memberType} />
                ) : (
                  <span className="text-xs text-gray-500">-</span>
                )}
              </td>

              {/* 회원명 */}
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {deposit.user?.name || deposit.userId || '알 수 없음'}
                </div>
                {deposit.senderVerified ? (
                  <div className="flex items-center space-x-1 text-xs text-sky-600 mt-1">
                    <span>검증됨</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-yellow-600 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>미검증</span>
                  </div>
                )}
              </td>

              {/* 자산/금액 */}
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCryptoAmount(deposit.amount, deposit.asset)} {deposit.asset}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {deposit.currentConfirmations}/{deposit.requiredConfirmations} 컨펌
                </div>
              </td>

              {/* 상태 */}
              <td className="p-3 text-center">
                <DepositStatusBadge status={deposit.status} />
              </td>

              {/* 액션 */}
              <td className="p-3">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(deposit)}>
                        <Eye className="h-4 w-4 mr-2" />
                        상세 보기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 회원 유형 배지
 */
function MemberTypeBadge({ type }: { type: string }) {
  // 백엔드에서 소문자로 반환하므로 대소문자 무관하게 처리
  const normalizedType = type?.toLowerCase();

  const typeConfig: Record<string, { label: string; className: string }> = {
    individual: {
      label: '개인',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    corporate: {
      label: '기업',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
  };

  const config = typeConfig[normalizedType];

  // type이 유효하지 않은 경우 기본값 사용
  if (!config) {
    return (
      <Badge className="min-w-[50px] bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        {type || '알 수 없음'}
      </Badge>
    );
  }

  return (
    <Badge className={`min-w-[50px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}

/**
 * 입금 상태 배지 (백엔드 4단계 상태)
 */
function DepositStatusBadge({ status }: { status: DepositStatus }) {
  const statusConfig: Record<
    DepositStatus,
    { label: string; className: string }
  > = {
    detected: {
      label: '입금 감지',
      className: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    confirming: {
      label: '검증중',
      className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    },
    confirmed: {
      label: '검증 완료',
      className: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    credited: {
      label: '반영 완료',
      className: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
  };

  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge className="min-w-[80px] text-gray-600 bg-gray-50 border-gray-200">
        {status || '알 수 없음'}
      </Badge>
    );
  }

  return (
    <Badge className={`min-w-[80px] border ${config.className}`}>
      {config.label}
    </Badge>
  );
}