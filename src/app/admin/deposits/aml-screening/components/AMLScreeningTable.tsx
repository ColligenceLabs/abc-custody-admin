'use client';

/**
 * AML 스크리닝 테이블 컴포넌트
 *
 * AML 검토 대기열을 표시하는 테이블입니다.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, CheckCircle2, Flag, MoreHorizontal, Check, X } from 'lucide-react';
import type { AMLScreeningItem } from '@/types/deposit';

interface AMLScreeningTableProps {
  items: AMLScreeningItem[];
  isLoading?: boolean;
  onViewDetails: (item: AMLScreeningItem) => void;
  onApprove: (item: AMLScreeningItem) => void;
  onFlag: (item: AMLScreeningItem) => void;
}

export function AMLScreeningTable({
  items,
  isLoading,
  onViewDetails,
  onApprove,
  onFlag,
}: AMLScreeningTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">검토 대기 중인 거래가 없습니다.</p>
      </div>
    );
  }

  const getRiskScoreColor = (score: number) => {
    if (score < 25) return 'text-green-500';
    if (score < 50) return 'text-yellow-500';
    if (score < 75) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskLevelBadge = (level: string) => {
    const configs = {
      low: { label: '낮음', variant: 'secondary' as const },
      medium: { label: '보통', variant: 'outline' as const },
      high: { label: '높음', variant: 'default' as const },
      critical: { label: '심각', variant: 'destructive' as const },
    };
    const config = configs[level as keyof typeof configs];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getReviewStatusBadge = (status: string) => {
    const configs = {
      pending: { label: '대기중', variant: 'outline' as const },
      approved: { label: '승인됨', variant: 'secondary' as const },
      flagged: { label: '플래그됨', variant: 'destructive' as const },
    };
    const config = configs[status as keyof typeof configs];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
              리스크 점수
            </th>
            <th className="text-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              리스크 레벨
            </th>
            <th className="text-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              AML 체크
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
          {items.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="p-3">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(item.timestamp).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.memberName}
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.amount} {item.asset}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ₩{Number(item.amountKRW).toLocaleString()}
                </div>
              </td>
              <td className="p-3">
                <div className="text-xs font-mono text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                  {item.fromAddress}
                </div>
              </td>
              <td className="p-3 text-center">
                <div className={`text-2xl font-bold ${getRiskScoreColor(item.riskScore)}`}>
                  {item.riskScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/100</div>
              </td>
              <td className="p-3 text-center">{getRiskLevelBadge(item.riskLevel)}</td>
              <td className="p-3">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1 text-xs">
                    {item.blacklistMatch ? (
                      <X className="h-3 w-3 text-red-500" />
                    ) : (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">블랙리스트</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    {item.sanctionsMatch ? (
                      <X className="h-3 w-3 text-red-500" />
                    ) : (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">제재목록</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    {item.pepMatch ? (
                      <X className="h-3 w-3 text-red-500" />
                    ) : (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">PEP</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    {item.adverseMediaMatch ? (
                      <X className="h-3 w-3 text-red-500" />
                    ) : (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">미디어</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-center">{getReviewStatusBadge(item.reviewStatus)}</td>
              <td className="p-3">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        상세 보기
                      </DropdownMenuItem>
                      {item.reviewStatus === 'pending' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onApprove(item)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            승인
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onFlag(item)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            플래그
                          </DropdownMenuItem>
                        </>
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
