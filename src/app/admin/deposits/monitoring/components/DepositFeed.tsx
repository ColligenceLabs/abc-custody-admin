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
            <th className="text-right p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              금액 (KRW)
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
                  {new Date(deposit.timestamp).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </td>

              {/* 회원유형 */}
              <td className="p-3">
                <MemberTypeBadge type={deposit.memberType} />
              </td>

              {/* 회원명 */}
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {deposit.memberName}
                </div>
                {(deposit.priority === 'high' || deposit.priority === 'urgent') && (
                  <div className="flex items-center space-x-1 text-xs text-red-500 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{deposit.priority === 'urgent' ? '긴급' : '높음'}</span>
                  </div>
                )}
              </td>

              {/* 자산/금액 */}
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {deposit.amount} {deposit.asset}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {deposit.confirmations}/{deposit.requiredConfirmations} 컨펌
                </div>
              </td>

              {/* 금액 (KRW) */}
              <td className="p-3 text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ₩{parseInt(deposit.amountKRW).toLocaleString()}
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
function MemberTypeBadge({ type }: { type: MemberType }) {
  const typeConfig: Record<
    MemberType,
    { label: string; className: string }
  > = {
    Individual: {
      label: '개인',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    Corporate: {
      label: '기업',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
  };

  const config = typeConfig[type];

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
 * 입금 상태 배지
 */
function DepositStatusBadge({ status }: { status: DepositStatus }) {
  const statusConfig: Record<
    DepositStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    pending: {
      label: '대기중',
      variant: 'outline',
    },
    verifying: {
      label: '검증중',
      variant: 'default',
    },
    completed: {
      label: '완료',
      variant: 'secondary',
    },
    returned: {
      label: '환불',
      variant: 'destructive',
    },
    flagged: {
      label: '플래그',
      variant: 'destructive',
    },
  };

  const config = statusConfig[status];

  // status가 유효하지 않은 경우 기본값 사용
  if (!config) {
    return (
      <Badge variant="outline" className="min-w-[60px]">
        {status || '알 수 없음'}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className="min-w-[60px]">
      {config.label}
    </Badge>
  );
}