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
} from "lucide-react";

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
    pending: { label: "AML 검토 중", variant: "default" as const, className: "bg-yellow-600" },
    approval_waiting: { label: "승인 대기", variant: "default" as const, className: "bg-blue-600" },
    aml_flagged: { label: "AML 문제", variant: "destructive" as const, className: "" },
    processing: { label: "처리 중", variant: "default" as const, className: "bg-purple-600" },
    completed: { label: "완료", variant: "default" as const, className: "bg-green-600" },
    rejected: { label: "거부됨", variant: "destructive" as const, className: "" },
    failed: { label: "실패", variant: "destructive" as const, className: "" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  const icons = {
    pending: Clock,
    approval_waiting: FileText,
    aml_flagged: AlertTriangle,
    processing: RefreshCw,
    completed: CheckCheck,
    rejected: Ban,
    failed: XCircle,
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

  // approval_waiting 상태일 때만 지갑 잔고 확인
  useEffect(() => {
    if (open && request && request.status === "approval_waiting") {
      performWalletBalanceCheck();
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

  const getBlockchainExplorerUrl = (blockchain: string, txHash: string) => {
    const explorers: Record<string, string> = {
      BITCOIN: `https://blockstream.info/tx/${txHash}`,
      ETHEREUM: `https://etherscan.io/tx/${txHash}`,
      SOLANA: `https://solscan.io/tx/${txHash}`,
    };
    return explorers[blockchain] || "#";
  };

  if (!request) return null;

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
                <p className="text-muted-foreground">회원사</p>
                <p className="font-medium">{request.memberName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">자산</p>
                <p className="font-semibold">{request.asset}</p>
              </div>
              <div>
                <p className="text-muted-foreground">수량</p>
                <p className="font-mono text-lg font-bold">{request.amount}</p>
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

          {/* pending: AML 검토 중 */}
          {request.status === "pending" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>AML 자동 검토 진행 중</AlertTitle>
              <AlertDescription>
                자동 AML 검토가 진행 중입니다. 완료되면 승인 대기 상태로 전환됩니다.
              </AlertDescription>
            </Alert>
          )}

          {/* approval_waiting: 승인 대기 */}
          {request.status === "approval_waiting" && (
            <>
              {/* AML 검토 통과 정보 */}
              {request.amlReview && request.amlReview.status === "passed" && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>AML 검토 완료</AlertTitle>
                  <AlertDescription>
                    자동 AML 검토를 통과했습니다. (리스크 레벨: {request.amlReview.riskLevel}, 점수: {request.amlReview.riskScore})
                  </AlertDescription>
                </Alert>
              )}

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

          {/* aml_flagged: AML 문제 */}
          {request.status === "aml_flagged" && (
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

          {/* processing: 처리 중 */}
          {request.status === "processing" && (
            <>
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>출금 처리 중</AlertTitle>
                <AlertDescription>
                  {request.walletSource === "hot" ? "Hot 지갑" : "Cold 지갑"}에서 출금이 진행 중입니다.
                </AlertDescription>
              </Alert>

              {request.mpcExecution && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-semibold">MPC 실행 정보</h4>
                  <p>MPC 요청 ID: <span className="font-mono">{request.mpcExecution.mpcRequestId}</span></p>
                  <p>시작 시간: {request.mpcExecution.initiatedAt.toLocaleString("ko-KR")}</p>
                  <p>상태: <Badge variant="outline">{request.mpcExecution.status}</Badge></p>
                </div>
              )}
            </>
          )}

          {/* completed: 완료 */}
          {request.status === "completed" && (
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
                <p>지갑 소스: <Badge variant="outline">{request.walletSource === "hot" ? "Hot 지갑" : "Cold 지갑"}</Badge></p>
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

          {/* rejected: 거부됨 */}
          {request.status === "rejected" && request.rejection && (
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
                  <p>지갑 소스: <Badge variant="outline">{request.walletSource === "hot" ? "Hot 지갑" : "Cold 지갑"}</Badge></p>
                )}
              </div>
            </>
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
