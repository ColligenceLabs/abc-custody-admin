/**
 * 환불 대기열 테이블 컴포넌트
 */

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReturnTransaction, Currency } from '@/types/deposit';
import { AlertCircle } from 'lucide-react';
import { formatCryptoAmount } from '@/lib/format';
import { ReturnDetailModal } from './ReturnDetailModal';

interface ReturnQueueTableProps {
  returns: ReturnTransaction[];
  onReturnClick?: (returnId: string) => void;
  onRefresh?: () => void;
}

export function ReturnQueueTable({ returns, onReturnClick, onRefresh }: ReturnQueueTableProps) {
  const [selectedReturn, setSelectedReturn] = useState<ReturnTransaction | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            대기
          </Badge>
        );
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            처리 중
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-700 border-sky-200"
          >
            완료
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            실패
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            거부됨
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      member_unregistered_address: '미등록 주소',
      no_permission: '권한 없음',
      daily_limit_exceeded: '한도 초과',
      travel_rule_violation: 'Travel Rule 위반',
      aml_flag: 'AML 플래그',
      sanctions_list: '제재 목록',
      manual_review_rejected: '수동 검토 거부',
    };

    return reasonMap[reason] || reason;
  };

  const getReasonColor = (reason: string): string => {
    switch (reason) {
      case 'member_unregistered_address':
        return 'text-orange-600';
      case 'no_permission':
        return 'text-red-600';
      case 'daily_limit_exceeded':
        return 'text-yellow-600';
      case 'travel_rule_violation':
        return 'text-purple-600';
      case 'aml_flag':
      case 'sanctions_list':
        return 'text-red-700 font-semibold';
      case 'manual_review_rejected':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (returns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">환불 내역이 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          검증 실패로 환불이 필요한 입금이 발생하면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>상태</TableHead>
            <TableHead>회원</TableHead>
            <TableHead>환불 사유</TableHead>
            <TableHead>자산</TableHead>
            <TableHead className="text-right">원금</TableHead>
            <TableHead className="text-right">수수료</TableHead>
            <TableHead className="text-right">환불금액</TableHead>
            <TableHead>반환 주소</TableHead>
            <TableHead>생성 시간</TableHead>
            <TableHead className="text-center">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((returnTx) => {
            const user = returnTx.deposit?.user;
            const memberType = user?.memberType;
            const isCorporate = memberType === 'corporate';

            return (
              <TableRow key={returnTx.id} className="hover:bg-muted/50">
                <TableCell>{getStatusBadge(returnTx.status)}</TableCell>

                <TableCell>
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {isCorporate ? '기업' : '개인'}
                      </Badge>
                      <span className="font-medium text-sm">
                        {isCorporate && user.organizationName
                          ? user.organizationName
                          : user.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <span className={`text-sm ${getReasonColor(returnTx.reason)}`}>
                    {getReasonLabel(returnTx.reason)}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{returnTx.asset}</Badge>
                </TableCell>

                <TableCell className="text-right font-mono text-sm">
                  {formatCryptoAmount(returnTx.originalAmount, returnTx.asset)}
                </TableCell>

                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {returnTx.returnFee ? formatCryptoAmount(returnTx.returnFee, returnTx.asset) : '0'}
                </TableCell>

                <TableCell className="text-right font-mono font-semibold text-sm">
                  {formatCryptoAmount(returnTx.returnAmount, returnTx.asset)}
                </TableCell>

                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {returnTx.returnAddress.slice(0, 8)}...
                    {returnTx.returnAddress.slice(-6)}
                  </code>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {returnTx.requestedAt ? formatDate(returnTx.requestedAt) : '-'}
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReturn(returnTx)}
                    className="h-8 px-3 text-xs"
                  >
                    상세보기
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 상세 정보 모달 */}
      <ReturnDetailModal
        open={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        returnTx={selectedReturn}
        onRefresh={onRefresh}
      />
    </div>
  );
}
