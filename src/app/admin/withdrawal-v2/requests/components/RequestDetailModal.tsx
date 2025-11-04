/**
 * RequestDetailModal Component
 *
 * 출금 요청 상세 정보 모달 - 모든 상태 지원
 * 상태별 특화 정보 및 액션 버튼 제공
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  WithdrawalV2Request,
  HotWalletBalanceCheck,
  ColdWalletBalanceInfo,
} from "@/types/withdrawalV2";
import { withdrawalV2Api } from "@/services/withdrawalV2Api";
import { WalletBalanceCheckComponent } from "./WalletBalanceCheck";
import { ApprovalButtonsComponent } from "./ApprovalButtons";
import { apiClient } from "@/services/api";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Clock,
  CheckCheck,
  Ban,
  Copy,
  ExternalLink,
  Settings,
} from "lucide-react";
import { formatCryptoAmount } from "@/lib/format";

interface RequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  request: WithdrawalV2Request | null;
  onApproveHot: (requestId: string, hotCheck: HotWalletBalanceCheck) => void;
  onApproveCold: (requestId: string, coldInfo: ColdWalletBalanceInfo) => void;
  onReject: (requestId: string, reason: string) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    withdrawal_wait: { label: "출금 대기", variant: "default" as const, className: "bg-slate-600" },
    aml_review: { label: "AML 검토 중", variant: "default" as const, className: "bg-yellow-600" },
    aml_issue: { label: "AML 문제", variant: "destructive" as const, className: "" },
    processing: { label: "출금처리대기", variant: "default" as const, className: "bg-purple-600" },
    transferring: { label: "출금중", variant: "default" as const, className: "bg-indigo-600" },
    success: { label: "완료", variant: "default" as const, className: "bg-green-600" },
    admin_rejected: { label: "관리자거부", variant: "destructive" as const, className: "" },
    failed: { label: "실패", variant: "destructive" as const, className: "" },
    withdrawal_stopped: { label: "출금 중지", variant: "default" as const, className: "bg-yellow-600" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.withdrawal_wait;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  const icons = {
    withdrawal_wait: Clock,
    aml_review: Clock,
    aml_issue: AlertTriangle,
    processing: RefreshCw,
    transferring: RefreshCw,
    success: CheckCheck,
    admin_rejected: Ban,
    failed: XCircle,
    withdrawal_stopped: Ban,
  };
  const Icon = icons[status as keyof typeof icons] || FileText;
  return <Icon className="w-5 h-5" />;
};

export function RequestDetailModal({
  open,
  onClose,
  request,
  onApproveHot,
  onApproveCold,
  onReject,
}: RequestDetailModalProps) {
  const { toast } = useToast();
  const [hotWalletCheck, setHotWalletCheck] =
    useState<HotWalletBalanceCheck | null>(null);
  const [coldWalletInfo, setColdWalletInfo] =
    useState<ColdWalletBalanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // processing 상태일 때 지갑 잔고 확인
  useEffect(() => {
    if (open && request) {
      if (request.status === "processing") {
        performWalletBalanceCheck();
      }
    } else {
      setHotWalletCheck(null);
      setColdWalletInfo(null);
      setError(null);
    }
  }, [open, request]);

  const performWalletBalanceCheck = async () => {
    if (!request) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await withdrawalV2Api.checkWalletBalances(request);
      setHotWalletCheck(result.hot);
      setColdWalletInfo(result.cold);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "지갑 잔고 확인 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveHot = async () => {
    if (!request || !hotWalletCheck) return;
    setIsLoading(true);
    try {
      await onApproveHot(request.id, hotWalletCheck);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "승인 처리 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCold = async () => {
    if (!request || !coldWalletInfo) return;
    setIsLoading(true);
    try {
      await onApproveCold(request.id, coldWalletInfo);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "승인 처리 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmReject = () => {
    if (!request || !rejectReason.trim()) {
      toast({
        variant: "destructive",
        description: "거부 사유를 입력해주세요.",
      });
      return;
    }
    onReject(request.id, rejectReason);
    setShowRejectDialog(false);
    setRejectReason("");
    onClose();
  };

  const handleCancelReject = () => {
    setShowRejectDialog(false);
    setRejectReason("");
  };

  const handleCopyTxHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast({
      description: "트랜잭션 해시가 복사되었습니다.",
    });
  };

  const handleSetWaitTime = async (minutes: number) => {
    if (!request) return;

    setIsLoading(true);
    try {
      // 현재 시각 기준으로 미래 시간 계산
      const newScheduledAt = new Date();
      newScheduledAt.setMinutes(newScheduledAt.getMinutes() + minutes);

      await apiClient.patch(`/withdrawals/${request.id}`, {
        processingScheduledAt: newScheduledAt.toISOString(),
      });

      toast({
        description: `대기 시간이 ${minutes}분으로 설정되었습니다.`,
      });

      window.location.reload();
    } catch (err) {
      toast({
        variant: "destructive",
        description: "대기 시간 설정 실패",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAMLApprove = async () => {
    if (!request) return;

    setIsLoading(true);
    try {
      await apiClient.patch(`/withdrawals/${request.id}`, {
        status: 'processing',
      });

      toast({
        description: "AML 승인 처리되었습니다.",
      });

      window.location.reload();
    } catch (err) {
      toast({
        variant: "destructive",
        description: "AML 승인 처리 실패",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAMLIssue = async () => {
    if (!request) return;

    setIsLoading(true);
    try {
      await apiClient.patch(`/withdrawals/${request.id}`, {
        status: 'aml_issue',
      });

      toast({
        description: "AML 문제 처리되었습니다.",
      });

      window.location.reload();
    } catch (err) {
      toast({
        variant: "destructive",
        description: "AML 문제 처리 실패",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBlockchainExplorerUrl = (blockchain: string, txHash: string) => {
    const explorers: Record<string, string> = {
      BITCOIN: `https://blockstream.info/tx/${txHash}`,
      ETHEREUM: `https://etherscan.io/tx/${txHash}`,
      SOLANA: `https://solscan.io/tx/${txHash}`,
    };
    return explorers[blockchain] || "#";
  };

  if (!request) return null;

  // 디버깅: request 객체 확인
  console.log('[RequestDetailModal] 전체 request 객체:', {
    id: request.id,
    withdrawalFee: request.withdrawalFee,
    withdrawalFeeType: request.withdrawalFeeType,
    netAmount: request.netAmount,
    feeTxid: request.feeTxid,
    feeTxHash: request.feeTxHash
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            출금 요청 상세
          </DialogTitle>
          <DialogDescription>
            출금 요청 정보 및 처리 상태를 확인합니다
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="space-y-4">
          {/* 출금 요청 기본 정보 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">출금 요청 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">요청 ID</p>
                <p className="font-mono">{request.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">회원명</p>
                <p className="font-medium">{request.memberName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground mb-2">출금 수량 상세</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  {/* 신청 금액 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신청 금액</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-semibold text-gray-900">
                        {formatCryptoAmount(request.amount, request.asset)}
                      </span>
                      <span className="text-sm font-medium text-gray-600">{request.asset}</span>
                    </div>
                  </div>

                  {/* 수수료 (있는 경우만) */}
                  {(() => {
                    const feeValue = typeof request.withdrawalFee === 'string'
                      ? parseFloat(request.withdrawalFee)
                      : request.withdrawalFee;

                    console.log('[RequestDetailModal] 수수료 체크:', {
                      withdrawalFee: request.withdrawalFee,
                      feeValue,
                      hasFee: feeValue && feeValue > 0
                    });

                    return feeValue && feeValue > 0 ? (
                      <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                        <span className="text-sm text-gray-600">
                          출금 수수료 ({request.withdrawalFeeType === 'fixed' ? '고정' : '퍼센트'})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-700">
                            {formatCryptoAmount(request.withdrawalFee, request.asset)}
                          </span>
                          <span className="text-xs text-gray-600">{request.asset}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* 실수령액 */}
                  <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                    <span className="text-sm font-semibold text-blue-700">실수령액</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-blue-700">
                        {formatCryptoAmount(request.netAmount || request.amount, request.asset)}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">{request.asset}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">블록체인</p>
                <Badge variant="outline">{request.blockchain}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">상태</p>
                {getStatusBadge(request.status)}
              </div>
              <div>
                <p className="text-muted-foreground">생성일시</p>
                <p className="text-xs">{request.createdAt.toLocaleString("ko-KR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">수정일시</p>
                <p className="text-xs">{request.updatedAt.toLocaleString("ko-KR")}</p>
              </div>
            </div>
          </div>

          {/* 상태별 특화 섹션 */}

          {/* withdrawal_wait: 출금 대기 (테스트용 대기 시간 설정) */}
          {request.status === "withdrawal_wait" &&
           request.processingScheduledAt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-sm text-yellow-800">테스트용 대기 시간 설정</h4>
              </div>
              <p className="text-xs text-yellow-700">
                개인 회원의 출금 대기 시간을 테스트용으로 조정할 수 있습니다. (24시간 기본값)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetWaitTime(1)}
                  disabled={isLoading}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  1분
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetWaitTime(5)}
                  disabled={isLoading}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  5분
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetWaitTime(10)}
                  disabled={isLoading}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  10분
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetWaitTime(24 * 60)}
                  disabled={isLoading}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  24시간 (기본값)
                </Button>
              </div>
              <p className="text-xs text-yellow-600">
                현재 대기 종료 시각: {new Date(request.processingScheduledAt).toLocaleString("ko-KR")}
              </p>
            </div>
          )}

          {/* aml_review: AML 검토 중 */}
          {request.status === "aml_review" && (
            <>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>AML 자동 검토 진행 중</AlertTitle>
                <AlertDescription>
                  자동 AML 검토가 진행 중입니다. 테스트를 위해 수동으로 처리할 수 있습니다.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-sm text-blue-800">테스트용 AML 처리</h4>
                </div>
                <p className="text-xs text-blue-700">
                  AML 검토 결과를 테스트용으로 설정할 수 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAMLApprove}
                    disabled={isLoading}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    AML승인처리
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAMLIssue}
                    disabled={isLoading}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    AML문제처리
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* aml_issue: AML 문제 */}
          {request.status === "aml_issue" && (
            <>
              {request.amlReview && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>AML 리스크 감지</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      <p>리스크 레벨: <span className="font-bold">{request.amlReview.riskLevel}</span></p>
                      <p>리스크 점수: <span className="font-bold">{request.amlReview.riskScore}</span></p>
                      {request.amlReview.flaggedReasons && (
                        <div>
                          <p className="font-medium">문제 사유:</p>
                          <ul className="list-disc list-inside ml-2">
                            {request.amlReview.flaggedReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {request.amlReview.notes && (
                        <p className="text-xs mt-2">{request.amlReview.notes}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                  onClick={handleReject}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  거부
                </Button>
              </div>
            </>
          )}

          {/* transferring: 출금 중 */}
          {request.status === "transferring" && (
            <>
              <Alert>
                <Clock className="h-4 w-4 text-indigo-600" />
                <AlertTitle>블록체인 전송 중</AlertTitle>
                <AlertDescription>
                  BlockDaemon을 통해 블록체인 전송이 진행 중입니다.
                </AlertDescription>
              </Alert>

              {/* BlockDaemon 트랜잭션 ID 표시 */}
              {request.blockdaemonTransactionId && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-semibold">BlockDaemon 트랜잭션</h4>
                  <p>트랜잭션 ID: <span className="font-mono">{request.blockdaemonTransactionId}</span></p>
                  <p className="text-xs text-muted-foreground">
                    트랜잭션 해시(txHash)는 블록체인 전송 후 자동으로 업데이트됩니다.
                  </p>
                </div>
              )}
            </>
          )}

          {/* transferring: 출금중 */}
          {request.status === "transferring" && (
            <>
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>출금중</AlertTitle>
                <AlertDescription>
                  블록체인 네트워크로 트랜잭션이 전송되고 있습니다.
                </AlertDescription>
              </Alert>

              {/* 트랜잭션 해시가 있으면 표시 */}
              {request.txHash && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm">트랜잭션 정보</h4>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">트랜잭션 해시</p>
                    <div className="bg-background rounded border p-3">
                      <p
                        className="font-mono text-xs whitespace-normal"
                        style={{
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {request.txHash}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTxHash(request.txHash!)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getBlockchainExplorerUrl(request.blockchain, request.txHash!), "_blank")}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        익스플로러에서 보기
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* BlockDaemon 트랜잭션 ID 표시 */}
              {request.blockdaemonTransactionId && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-semibold">BlockDaemon 트랜잭션</h4>
                  <p>트랜잭션 ID: <span className="font-mono">{request.blockdaemonTransactionId}</span></p>
                </div>
              )}

            </>
          )}

          {/* processing: 처리 중 */}
          {request.status === "processing" && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>AML 검토 완료</AlertTitle>
                <AlertDescription>
                  AML 검토를 통과했습니다. Hot 또는 Cold 지갑을 선택하여 출금을 승인해주세요.
                </AlertDescription>
              </Alert>

              {/* 지갑 잔고 확인 */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    지갑 잔고 확인 중...
                  </span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>오류 발생</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {hotWalletCheck && coldWalletInfo && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* 지갑 잔고 확인 (좌측 2/3) */}
                  <div className="lg:col-span-2">
                    <WalletBalanceCheckComponent
                      asset={request.asset}
                      hotWalletCheck={hotWalletCheck}
                      coldWalletInfo={coldWalletInfo}
                    />
                  </div>

                  {/* 승인 버튼 (우측 1/3) */}
                  <div>
                    <ApprovalButtonsComponent
                      hotWalletCheck={hotWalletCheck}
                      onApproveHot={handleApproveHot}
                      onApproveCold={handleApproveCold}
                      onReject={handleReject}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* success: 완료 */}
          {request.status === "success" && (
            <>
              <Alert>
                <CheckCheck className="h-4 w-4 text-green-600" />
                <AlertTitle>출금 완료</AlertTitle>
                <AlertDescription>
                  출금이 성공적으로 완료되었습니다.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <h4 className="font-semibold">완료 정보</h4>
                <div className="flex items-center gap-2">
                  <span>지갑 소스:</span>
                  <Badge variant="outline">{request.walletSource === "hot" ? "Hot 지갑" : "Cold 지갑"}</Badge>
                </div>
                {request.completedAt && (
                  <p>완료 시간: {request.completedAt.toLocaleString("ko-KR")}</p>
                )}
              </div>

              {/* 트랜잭션 해시 섹션 */}
              {request.txHash && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm">트랜잭션 정보</h4>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">트랜잭션 해시</p>
                    <div className="bg-background rounded border p-3">
                      <p
                        className="font-mono text-xs whitespace-normal"
                        style={{
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {request.txHash}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTxHash(request.txHash!)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getBlockchainExplorerUrl(request.blockchain, request.txHash!), "_blank")}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        익스플로러에서 보기
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* admin_rejected: 거부됨 */}
          {request.status === "admin_rejected" && request.rejection && (
            <>
              <Alert variant="destructive">
                <Ban className="h-4 w-4" />
                <AlertTitle>출금 거부됨</AlertTitle>
                <AlertDescription>
                  이 출금 요청은 거부되었습니다.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">거부 정보</h4>

                {/* 거부 사유 - 강조 표시 */}
                <div className="bg-background rounded-lg border border-red-200 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">거부 사유</span>
                  </div>
                  <p className="text-sm leading-relaxed pl-6">
                    {request.rejection.reason}
                  </p>
                </div>

                {/* 거부 세부 정보 */}
                <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                  <div>
                    <p className="text-muted-foreground">거부 시간</p>
                    <p className="font-medium">{request.rejection.rejectedAt.toLocaleString("ko-KR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">거부 처리자</p>
                    <p className="font-medium">{request.rejection.rejectedBy}</p>
                  </div>
                </div>

                {request.rejection.relatedAMLIssue && (
                  <div className="pt-2">
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                      AML 관련 거부
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}

          {/* withdrawal_stopped: 출금 중지 */}
          {request.status === "withdrawal_stopped" &&
           request.withdrawalStoppedReason && (
            <>
              <Alert>
                <Ban className="h-4 w-4 text-yellow-600" />
                <AlertTitle>출금 중지됨</AlertTitle>
                <AlertDescription>
                  이 출금 요청은 사용자에 의해 중지되었습니다.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">출금 중지 정보</h4>

                {/* 중지 사유 - 강조 표시 */}
                <div className="bg-background rounded-lg border border-yellow-200 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">중지 사유</span>
                  </div>
                  <p className="text-sm leading-relaxed pl-6">
                    {request.withdrawalStoppedReason}
                  </p>
                </div>

                {/* 중지 세부 정보 */}
                <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                  {request.withdrawalStoppedAt && (
                    <div>
                      <p className="text-muted-foreground">중지 시간</p>
                      <p className="font-medium">{new Date(request.withdrawalStoppedAt).toLocaleString("ko-KR")}</p>
                    </div>
                  )}
                  {request.stoppedBy && (
                    <div>
                      <p className="text-muted-foreground">중지 처리자</p>
                      <p className="font-medium">{request.stoppedBy.userName}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* failed: 실패 */}
          {request.status === "failed" && request.error && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>출금 실패</AlertTitle>
                <AlertDescription>
                  출금 처리 중 오류가 발생했습니다.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-semibold">오류 정보</h4>
                <p>오류 코드: <span className="font-mono">{request.error.code}</span></p>
                <p>오류 메시지: <span className="font-medium">{request.error.message}</span></p>
                <p>발생 시간: {request.error.occurredAt.toLocaleString("ko-KR")}</p>
                {request.walletSource && (
                  <div className="flex items-center gap-2">
                  <span>지갑 소스:</span>
                  <Badge variant="outline">{request.walletSource === "hot" ? "Hot 지갑" : "Cold 지갑"}</Badge>
                </div>
                )}
              </div>
            </>
          )}

          {/* 수수료 트랜잭션 정보 (관리자 전용) - 모든 상태에서 표시 */}
          {request.feeTxid && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-indigo-900">수수료 트랜잭션 (관리자 전용)</h4>
              <div className="space-y-2 text-sm">
                {/* 수수료 BlockDaemon ID */}
                <div>
                  <p className="text-xs text-indigo-700 mb-1">수수료 BlockDaemon ID</p>
                  <div className="bg-white rounded border border-indigo-200 p-2">
                    <p className="font-mono text-xs break-all text-indigo-900">
                      {request.feeTxid}
                    </p>
                  </div>
                </div>

                {/* 수수료 블록체인 해시 */}
                {request.feeTxHash && (
                  <div>
                    <p className="text-xs text-indigo-700 mb-1">수수료 블록체인 해시</p>
                    <div className="bg-white rounded border border-indigo-200 p-2">
                      <p className="font-mono text-xs break-all text-indigo-900">
                        {request.feeTxHash}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTxHash(request.feeTxHash!)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        수수료 해시 복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getBlockchainExplorerUrl(request.blockchain, request.feeTxHash!), "_blank")}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        익스플로러
                      </Button>
                    </div>
                  </div>
                )}

                {/* 수수료 정보 요약 */}
                <div className="pt-2 border-t border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-700">수수료 금액</span>
                    <span className="font-mono text-sm font-semibold text-indigo-900">
                      {formatCryptoAmount(request.withdrawalFee, request.asset)} {request.asset}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-indigo-700">전송 대상</span>
                    <span className="text-sm font-medium text-indigo-900">
                      Fee Wallet (Vault ID: 5)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* 거부 확인 다이얼로그 */}
    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            출금 요청 거부
          </DialogTitle>
          <DialogDescription>
            거부 사유를 입력해주세요. 이 정보는 기록되며 회원사에 전달됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              거부 사유 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="거부 사유를 상세히 입력해주세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              최소 10자 이상 입력해주세요.
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
            disabled={!rejectReason.trim() || rejectReason.trim().length < 10}
          >
            <XCircle className="w-4 h-4 mr-2" />
            거부 확정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
