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
import { ExternalLink, AlertCircle, Check, X } from 'lucide-react';
import { formatCryptoAmount } from '@/lib/format';
import { approveReturn, cancelReturn } from '@/services/depositReturnApiService';
import { useToast } from '@/hooks/use-toast';

interface ReturnQueueTableProps {
  returns: ReturnTransaction[];
  onReturnClick?: (returnId: string) => void;
  onRefresh?: () => void;
}

export function ReturnQueueTable({ returns, onReturnClick, onRefresh }: ReturnQueueTableProps) {
  const { toast } = useToast();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleApprove = async (returnTx: ReturnTransaction) => {
    if (processingIds.has(returnTx.id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(returnTx.id));

      // 관리자 ID는 임시로 'admin'으로 설정 (추후 실제 관리자 정보 사용)
      await approveReturn(returnTx.id, { approvedBy: 'admin' });

      toast({
        description: '환불이 승인되어 블록체인 트랜잭션이 전송되었습니다.',
      });

      // 목록 새로고침
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '환불 승인 실패',
        description: error.response?.data?.error || '환불 승인 중 오류가 발생했습니다.',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(returnTx.id);
        return next;
      });
    }
  };

  const handleReject = async (returnTx: ReturnTransaction) => {
    if (processingIds.has(returnTx.id)) return;

    if (!confirm(`정말 이 환불을 거부하시겠습니까?\n\n자산: ${returnTx.asset}\n금액: ${formatCryptoAmount(returnTx.returnAmount, returnTx.asset)}\n사유: ${getReasonLabel(returnTx.reason)}`)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(returnTx.id));

      await cancelReturn(returnTx.id);

      toast({
        description: '환불이 거부되었습니다.',
      });

      // 목록 새로고침
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '환불 거부 실패',
        description: error.response?.data?.error || '환불 거부 중 오류가 발생했습니다.',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(returnTx.id);
        return next;
      });
    }
  };

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
            <TableHead>회원</TableHead>
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
          {returns.map((returnTx) => {
            const user = returnTx.deposit?.user;
            const memberType = user?.memberType;
            const isCorporate = memberType === 'corporate';

            return (
            <TableRow key={returnTx.id} className="hover:bg-muted/50">
              <TableCell>{getStatusBadge(returnTx.status)}</TableCell>

              <TableCell>
                {user ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {isCorporate ? '기업' : '개인'}
                      </Badge>
                      <span className="font-medium">
                        {isCorporate && user.organizationName
                          ? user.organizationName
                          : user.name}
                      </span>
                    </div>
                    {isCorporate && returnTx.deposit?.organizationId && (
                      <code className="text-xs text-muted-foreground">
                        {returnTx.deposit.organizationId}
                      </code>
                    )}
                    {!isCorporate && returnTx.deposit?.userId && (
                      <code className="text-xs text-muted-foreground">
                        {returnTx.deposit.userId}
                      </code>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

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
                <Badge variant="outline">{returnTx.asset}</Badge>
              </TableCell>

              <TableCell className="text-right font-mono">
                {formatCryptoAmount(returnTx.originalAmount, returnTx.asset)}
              </TableCell>

              <TableCell className="text-right font-mono text-muted-foreground">
                {returnTx.returnFee ? formatCryptoAmount(returnTx.returnFee, returnTx.asset) : '0'}
              </TableCell>

              <TableCell className="text-right font-mono font-semibold">
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

              <TableCell className="text-sm text-muted-foreground">
                {returnTx.completedAt ? formatDate(returnTx.completedAt) : '-'}
              </TableCell>

              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {/* pending 상태: 승인/거부 버튼 */}
                  {returnTx.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100"
                        onClick={() => handleApprove(returnTx)}
                        disabled={processingIds.has(returnTx.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        onClick={() => handleReject(returnTx)}
                        disabled={processingIds.has(returnTx.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        거부
                      </Button>
                    </>
                  )}

                  {/* processing 상태: 블록체인 전송 중 */}
                  {returnTx.status === 'processing' && (
                    <span className="text-xs text-yellow-600 font-medium">블록체인 전송 중...</span>
                  )}

                  {/* completed 상태: Etherscan 링크 */}
                  {returnTx.status === 'completed' && returnTx.returnTxHash && (
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

                  {/* failed 상태 */}
                  {returnTx.status === 'failed' && (
                    <span className="text-xs text-red-600 font-medium">실패</span>
                  )}

                  {/* cancelled 상태 */}
                  {returnTx.status === 'cancelled' && (
                    <span className="text-xs text-gray-600 font-medium">취소됨</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
