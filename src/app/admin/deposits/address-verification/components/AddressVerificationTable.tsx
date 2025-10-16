'use client';

/**
 * 주소 검증 테이블 컴포넌트
 *
 * 검증 결과를 테이블 형태로 표시합니다.
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Flag, MoreHorizontal } from 'lucide-react';
import { AddressVerificationListItem } from '@/types/deposit';

interface AddressVerificationTableProps {
  verifications: AddressVerificationListItem[];
  isLoading?: boolean;
  onViewDetails: (verification: AddressVerificationListItem) => void;
  onFlagAddress: (verification: AddressVerificationListItem) => void;
}

export function AddressVerificationTable({
  verifications,
  isLoading,
  onViewDetails,
  onFlagAddress,
}: AddressVerificationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">검증 데이터가 없습니다.</p>
      </div>
    );
  }

  // 검증 상태 배지
  const getVerificationStatusBadge = (status: string) => {
    const configs = {
      passed: { label: '통과', variant: 'secondary' as const },
      failed: { label: '실패', variant: 'destructive' as const },
      pending: { label: '대기', variant: 'outline' as const },
      flagged: { label: '플래그', variant: 'default' as const },
    };
    const config = configs[status as keyof typeof configs];
    return <Badge variant={config?.variant || 'outline'}>{config?.label || status}</Badge>;
  };

  // 등록 여부 배지
  const getRegistrationBadge = (isRegistered: boolean, hasPermission: boolean) => {
    if (!isRegistered) {
      return <Badge variant="destructive">미등록</Badge>;
    }
    if (!hasPermission) {
      return <Badge variant="default">권한 없음</Badge>;
    }
    return <Badge variant="secondary">등록됨</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              시간
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              회원사
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              자산/금액
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              송신 주소
            </th>
            <th className="text-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              검증 상태
            </th>
            <th className="text-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              등록 여부
            </th>
            <th className="text-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              타입
            </th>
            <th className="text-right p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {verifications.map((verification) => (
            <tr
              key={verification.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* 시간 */}
              <td className="p-3">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(verification.timestamp).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </td>

              {/* 회원사 */}
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {verification.memberName}
                </div>
              </td>

              {/* 자산/금액 */}
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {verification.amount} {verification.asset}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ₩{Number(verification.amountKRW).toLocaleString()}
                </div>
              </td>

              {/* 송신 주소 */}
              <td className="p-3">
                <div className="text-xs font-mono text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                  {verification.fromAddress}
                </div>
              </td>

              {/* 검증 상태 */}
              <td className="p-3 text-center">
                {getVerificationStatusBadge(verification.verificationStatus)}
              </td>

              {/* 등록 여부 */}
              <td className="p-3 text-center">
                {getRegistrationBadge(verification.isRegistered, verification.hasPermission)}
              </td>

              {/* 타입 */}
              <td className="p-3 text-center">
                {verification.addressType ? (
                  <Badge variant="outline">
                    {verification.addressType === 'personal' ? '개인' : 'VASP'}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
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
                      <DropdownMenuItem onClick={() => onViewDetails(verification)}>
                        <Eye className="h-4 w-4 mr-2" />
                        상세 보기
                      </DropdownMenuItem>
                      {!verification.isFlagged && verification.verificationStatus === 'failed' && (
                        <DropdownMenuItem
                          onClick={() => onFlagAddress(verification)}
                          className="text-orange-600 focus:text-orange-600"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          플래그
                        </DropdownMenuItem>
                      )}
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
