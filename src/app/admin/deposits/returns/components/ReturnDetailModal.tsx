/**
 * 환불 상세 정보 모달 컴포넌트
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReturnTransaction } from '@/types/deposit';
import { formatCryptoAmount } from '@/lib/format';
import { approveReturn, cancelReturn } from '@/services/depositReturnApiService';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  X,
  ExternalLink,
  Copy,
  Clock,
  AlertTriangle,
  CheckCheck,
  Ban,
  FileText,
} from 'lucide-react';

interface ReturnDetailModalProps {
  open: boolean;
  onClose: () => void;
  returnTx: ReturnTransaction | null;
  onRefresh?: () => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: '대기', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    processing: { label: '처리 중', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    completed: { label: '완료', className: 'bg-sky-50 text-sky-700 border-sky-200' },
    failed: { label: '실패', className: 'bg-red-50 text-red-700 border-red-200' },
    cancelled: { label: '거부됨', className: 'bg-gray-50 text-gray-700 border-gray-200' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  const icons = {
    pending: Clock,
    processing: Clock,
    completed: CheckCheck,
    failed: AlertTriangle,
    cancelled: Ban,
  };
  const Icon = icons[status as keyof typeof icons] || FileText;
  return <Icon className="w-5 h-5" />;
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

export function ReturnDetailModal({
  open,
  onClose,
  returnTx,
  onRefresh,
}: ReturnDetailModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!returnTx) return;

    setIsLoading(true);
    try {
      await approveReturn(returnTx.id, { approvedBy: 'admin' });

      toast({
        description: '환불이 승인되어 블록체인 트랜잭션이 전송되었습니다.',
      });

      if (onRefresh) {
        onRefresh();
      }
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '환불 승인 실패',
        description: error.response?.data?.error || '환불 승인 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!returnTx || !rejectReason.trim()) return;

    setIsLoading(true);
    try {
      await cancelReturn(returnTx.id, { reason: rejectReason.trim() });

      toast({
        description: '환불이 거부되었습니다.',
      });

      if (onRefresh) {
        onRefresh();
      }
      setShowRejectDialog(false);
      setRejectReason('');
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '환불 거부 실패',
        description: error.response?.data?.error || '환불 거부 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReject = () => {
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      description: '주소가 복사되었습니다.',
    });
  };

  const handleCopyTxHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast({
      description: '트랜잭션 해시가 복사되었습니다.',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  if (!returnTx) return null;

  const user = returnTx.deposit?.user;
  const memberType = user?.memberType;
  const isCorporate = memberType === 'corporate';

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon(returnTx.status)}
              환불 상세
            </DialogTitle>
            <DialogDescription>
              환불 정보 및 처리 상태를 확인합니다
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="space-y-4">
              {/* 환불 기본 정보 */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">환불 정보</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID</p>
                    <p className="font-mono text-xs">{returnTx.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">상태</p>
                    {getStatusBadge(returnTx.status)}
                  </div>
                  <div>
                    <p className="text-muted-foreground">회원 유형</p>
                    <Badge variant="outline">{isCorporate ? '기업' : '개인'}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">회원명</p>
                    <p className="font-medium">
                      {user && (isCorporate && user.organizationName
                        ? user.organizationName
                        : user.name)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">입금 거부 사유</p>
                    <p className="font-medium text-orange-600">
                      {getReasonLabel(returnTx.reason)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 금액 정보 */}
              <div className="col-span-2">
                <p className="text-muted-foreground mb-2 text-sm font-medium">환불 금액 상세</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  {/* 원금 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">원금</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-semibold text-gray-900">
                        {formatCryptoAmount(returnTx.originalAmount, returnTx.asset)}
                      </span>
                      <span className="text-sm font-medium text-gray-600">{returnTx.asset}</span>
                    </div>
                  </div>

                  {/* 환불 수수료 */}
                  {returnTx.returnFee && parseFloat(returnTx.returnFee.toString()) > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                      <span className="text-sm text-gray-600">환불 수수료</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-700">
                          {formatCryptoAmount(returnTx.returnFee, returnTx.asset)}
                        </span>
                        <span className="text-xs text-gray-600">{returnTx.asset}</span>
                      </div>
                    </div>
                  )}

                  {/* 실환불액 */}
                  <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                    <span className="text-sm font-semibold text-blue-700">실환불액</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-blue-700">
                        {formatCryptoAmount(returnTx.returnAmount, returnTx.asset)}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">{returnTx.asset}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 트랜잭션 정보 */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">트랜잭션 정보</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-muted-foreground">원본 트랜잭션 해시</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyTxHash(returnTx.originalTxHash)}
                        className="h-7 px-2"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">복사</span>
                      </Button>
                    </div>
                    <div className="bg-background rounded border p-3">
                      <p className="font-mono text-xs break-all">{returnTx.originalTxHash}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-muted-foreground">반환 주소</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyAddress(returnTx.returnAddress)}
                        className="h-7 px-2"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">복사</span>
                      </Button>
                    </div>
                    <div className="bg-background rounded border p-3">
                      <p className="font-mono text-xs break-all">{returnTx.returnAddress}</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">네트워크</span>
                    <span className="font-medium">{returnTx.network}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">생성 시간</span>
                    <span className="font-medium">{formatDate(returnTx.requestedAt)}</span>
                  </div>

                  {returnTx.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">완료 시간</span>
                      <span className="font-medium">{formatDate(returnTx.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 환불 트랜잭션 해시 (완료 시) */}
              {returnTx.returnTxHash && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm">환불 트랜잭션 정보</h3>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">트랜잭션 해시</p>
                    <div className="bg-background rounded border p-3">
                      <p className="font-mono text-xs break-all">{returnTx.returnTxHash}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTxHash(returnTx.returnTxHash!)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`https://etherscan.io/tx/${returnTx.returnTxHash}`, '_blank')
                        }
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        익스플로러에서 보기
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 상태별 메시지 */}
              {returnTx.status === 'pending' && (
                <Alert>
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertTitle>승인 대기 중</AlertTitle>
                  <AlertDescription>
                    이 환불 요청은 관리자 승인을 대기하고 있습니다.
                  </AlertDescription>
                </Alert>
              )}

              {returnTx.status === 'processing' && (
                <Alert>
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertTitle>블록체인 전송 중</AlertTitle>
                  <AlertDescription>
                    환불 트랜잭션이 블록체인 네트워크로 전송되고 있습니다.
                  </AlertDescription>
                </Alert>
              )}

              {returnTx.status === 'completed' && (
                <Alert>
                  <CheckCheck className="h-4 w-4 text-sky-600" />
                  <AlertTitle>환불 완료</AlertTitle>
                  <AlertDescription>
                    환불이 성공적으로 완료되었습니다.
                  </AlertDescription>
                </Alert>
              )}

              {returnTx.status === 'failed' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>환불 실패</AlertTitle>
                  <AlertDescription>
                    환불 처리 중 오류가 발생했습니다.
                  </AlertDescription>
                </Alert>
              )}

              {returnTx.status === 'cancelled' && (
                <Alert>
                  <Ban className="h-4 w-4 text-gray-600" />
                  <AlertTitle>환불 거부됨</AlertTitle>
                  <AlertDescription>
                    이 환불 요청은 거부되었습니다.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* 액션 버튼 (pending 상태만) */}
          {returnTx.status === 'pending' && (
            <DialogFooter className="px-6 py-4 border-t">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100"
                  onClick={handleApprove}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  승인
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  거부
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* 거부 확인 다이얼로그 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              환불 요청 거부
            </DialogTitle>
            <DialogDescription>
              정말 이 환불 요청을 거부하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-800">거부 확인</p>
              <p className="text-yellow-700 mt-1">
                자산: <span className="font-mono">{returnTx.asset}</span>
              </p>
              <p className="text-yellow-700">
                금액: <span className="font-mono">{formatCryptoAmount(returnTx.returnAmount, returnTx.asset)} {returnTx.asset}</span>
              </p>
              <p className="text-yellow-700">
                사유: {getReasonLabel(returnTx.reason)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reject-reason">거부 사유 (필수)</Label>
              <Textarea
                id="reject-reason"
                placeholder="환불 요청을 거부하는 사유를 입력해주세요..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                거부 사유는 감사 로그에 기록되며, 추후 검토 시 참고됩니다.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelReject}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isLoading || !rejectReason.trim()}
            >
              <X className="w-4 h-4 mr-2" />
              거부 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
