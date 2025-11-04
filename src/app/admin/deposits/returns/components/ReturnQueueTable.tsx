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
import { ExternalLink, AlertCircle } from 'lucide-react';

interface ReturnQueueTableProps {
  returns: ReturnTransaction[];
  onReturnClick?: (returnId: string) => void;
}

export function ReturnQueueTable({ returns, onReturnClick }: ReturnQueueTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800"
          >
            대기
          </Badge>
        );
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800"
          >
            처리 중
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800"
          >
            완료
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800"
          >
            실패
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
        return 'text-orange-600 dark:text-orange-400';
      case 'no_permission':
        return 'text-red-600 dark:text-red-400';
      case 'daily_limit_exceeded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'travel_rule_violation':
        return 'text-purple-600 dark:text-purple-400';
      case 'aml_flag':
      case 'sanctions_list':
        return 'text-red-700 dark:text-red-500 font-semibold';
      case 'manual_review_rejected':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
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
            <TableHead>원본 TxHash</TableHead>
            <TableHead>환불 사유</TableHead>
            <TableHead>자산</TableHead>
            <TableHead className="text-right">원금</TableHead>
            <TableHead className="text-right">수수료</TableHead>
            <TableHead className="text-right">환불 금액</TableHead>
            <TableHead>반환 주소</TableHead>
            <TableHead>생성 시간</TableHead>
            <TableHead>완료 시간</TableHead>
            <TableHead className="text-center">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((returnTx) => (
            <TableRow key={returnTx.id} className="hover:bg-muted/50">
              <TableCell>{getStatusBadge(returnTx.status)}</TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {returnTx.originalTxHash.slice(0, 10)}...
                    {returnTx.originalTxHash.slice(-8)}
                  </code>
                </div>
              </TableCell>

              <TableCell>
                <span className={getReasonColor(returnTx.reason)}>
                  {getReasonLabel(returnTx.reason)}
                </span>
              </TableCell>

              <TableCell>
                <Badge variant="outline">{returnTx.currency}</Badge>
              </TableCell>

              <TableCell className="text-right font-mono">
                {parseFloat(returnTx.returnAmount).toFixed(8)}
              </TableCell>

              <TableCell className="text-right font-mono text-muted-foreground">
                {returnTx.networkFee ? parseFloat(returnTx.networkFee).toFixed(8) : '-'}
              </TableCell>

              <TableCell className="text-right font-mono font-semibold">
                {parseFloat(returnTx.returnAmount).toFixed(8)}
              </TableCell>

              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {returnTx.returnAddress.slice(0, 8)}...
                  {returnTx.returnAddress.slice(-6)}
                </code>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {returnTx.processedAt ? formatDate(returnTx.processedAt) : '-'}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {returnTx.completedAt ? formatDate(returnTx.completedAt) : '-'}
              </TableCell>

              <TableCell className="text-center">
                {returnTx.returnTxHash && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://etherscan.io/tx/${returnTx.returnTxHash}`,
                        '_blank'
                      );
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
