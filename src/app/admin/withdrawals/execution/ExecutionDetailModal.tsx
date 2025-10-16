"use client";

// ============================================================================
// 출금 실행 상세 모달 컴포넌트 (Task 4.4)
// ============================================================================

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WithdrawalExecution } from "@/types/withdrawal";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useConfirmationStatus, useRetryBroadcast } from "@/hooks/useExecution";
import { useToast } from "@/hooks/use-toast";

interface ExecutionDetailModalProps {
  execution: WithdrawalExecution | null;
  open: boolean;
  onClose: () => void;
}

export function ExecutionDetailModal({
  execution,
  open,
  onClose,
}: ExecutionDetailModalProps) {
  const { toast } = useToast();
  const retryMutation = useRetryBroadcast();
  const [isRetrying, setIsRetrying] = useState(false);

  // 실시간 컨펌 상태 조회
  const { data: confirmationStatus } = useConfirmationStatus(
    execution?.txHash
  );

  if (!execution) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: `${label}이(가) 클립보드에 복사되었습니다.`,
    });
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryMutation.mutateAsync({
        executionId: execution.id,
        increaseFee: true,
        feeMultiplier: 1.5,
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const canRetry =
    (execution.status === "broadcast_failed" || execution.status === "failed") &&
    execution.retryInfo &&
    execution.retryInfo.attempt < execution.retryInfo.maxAttempts;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>출금 실행 상세</DialogTitle>
          <DialogDescription>
            실행 ID: {execution.id}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="confirmation">컨펌 상태</TabsTrigger>
            <TabsTrigger value="retry">재시도 이력</TabsTrigger>
          </TabsList>

          {/* 기본 정보 탭 */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <InfoRow label="회원사" value={execution.memberName} />
              <InfoRow
                label="자산"
                value={
                  <Badge variant="outline">{execution.asset}</Badge>
                }
              />
              <InfoRow label="네트워크" value={execution.network} />
              <InfoRow
                label="출금 금액"
                value={`${parseFloat(execution.amount).toFixed(4)} ${
                  execution.asset
                }`}
              />
              <InfoRow
                label="수신 주소"
                value={
                  <div className="flex items-center gap-2">
                    <code className="text-xs">{execution.toAddress}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(execution.toAddress, "주소")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                }
              />
              {execution.txHash && (
                <InfoRow
                  label="TxHash"
                  value={
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{execution.txHash}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(execution.txHash!, "TxHash")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://etherscan.io/tx/${execution.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  }
                />
              )}
              <InfoRow
                label="네트워크 수수료"
                value={`${execution.networkFee} ${execution.asset}`}
              />
              <InfoRow
                label="상태"
                value={<StatusBadge status={execution.status} />}
              />
              <InfoRow
                label="시작 시간"
                value={new Date(execution.broadcastStartedAt).toLocaleString(
                  "ko-KR"
                )}
              />
              {execution.confirmedAt && (
                <InfoRow
                  label="완료 시간"
                  value={new Date(execution.confirmedAt).toLocaleString(
                    "ko-KR"
                  )}
                />
              )}
              {execution.failedAt && (
                <InfoRow
                  label="실패 시간"
                  value={new Date(execution.failedAt).toLocaleString("ko-KR")}
                />
              )}
              {execution.failureReason && (
                <InfoRow
                  label="실패 사유"
                  value={
                    <span className="text-destructive">
                      {execution.failureReason}
                    </span>
                  }
                />
              )}
            </div>
          </TabsContent>

          {/* 컨펌 상태 탭 */}
          <TabsContent value="confirmation" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">컨펌 진행률</h4>
                  <Badge>
                    {confirmationStatus?.confirmations ||
                      execution.confirmations.current}
                    /{execution.confirmations.required}
                  </Badge>
                </div>
                <Progress
                  value={
                    confirmationStatus?.progress ||
                    execution.confirmations.progress
                  }
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {confirmationStatus?.progress ||
                    execution.confirmations.progress}
                  % 완료
                </p>
              </div>

              {confirmationStatus && (
                <div className="space-y-2">
                  <InfoRow
                    label="완료 여부"
                    value={
                      confirmationStatus.isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>완료</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="h-4 w-4" />
                          <span>대기 중</span>
                        </div>
                      )
                    }
                  />
                  {confirmationStatus.estimatedTimeRemaining && (
                    <InfoRow
                      label="예상 남은 시간"
                      value={`약 ${confirmationStatus.estimatedTimeRemaining}분`}
                    />
                  )}
                  {confirmationStatus.blockInfo && (
                    <>
                      <InfoRow
                        label="블록 번호"
                        value={confirmationStatus.blockInfo.blockNumber}
                      />
                      <InfoRow
                        label="블록 시간"
                        value={new Date(
                          confirmationStatus.blockInfo.blockTime
                        ).toLocaleString("ko-KR")}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* 재시도 이력 탭 */}
          <TabsContent value="retry" className="space-y-4">
            {execution.retryInfo ? (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="grid gap-3">
                    <InfoRow
                      label="시도 횟수"
                      value={`${execution.retryInfo.attempt}/${execution.retryInfo.maxAttempts}`}
                    />
                    <InfoRow
                      label="마지막 시도"
                      value={new Date(
                        execution.retryInfo.lastAttemptAt
                      ).toLocaleString("ko-KR")}
                    />
                    {execution.retryInfo.failureType && (
                      <InfoRow
                        label="실패 유형"
                        value={
                          <Badge variant="destructive">
                            {execution.retryInfo.failureType}
                          </Badge>
                        }
                      />
                    )}
                    {execution.retryInfo.nextAttemptAt && (
                      <InfoRow
                        label="다음 시도 예정"
                        value={new Date(
                          execution.retryInfo.nextAttemptAt
                        ).toLocaleString("ko-KR")}
                      />
                    )}
                  </div>
                </div>

                {execution.rbfInfo && (
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-3">
                      RBF (Replace-By-Fee) 정보
                    </h4>
                    <div className="grid gap-3">
                      <InfoRow
                        label="원본 수수료"
                        value={`${execution.rbfInfo.originalFee} ${execution.asset}`}
                      />
                      <InfoRow
                        label="현재 수수료"
                        value={`${execution.rbfInfo.currentFee} ${execution.asset}`}
                      />
                      <InfoRow
                        label="수수료 증가 횟수"
                        value={execution.rbfInfo.feeIncreaseCount}
                      />
                      <InfoRow
                        label="최종 업데이트"
                        value={new Date(
                          execution.rbfInfo.lastUpdatedAt
                        ).toLocaleString("ko-KR")}
                      />
                    </div>
                  </div>
                )}

                {canRetry && (
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="w-full"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        재시도 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        브로드캐스트 재시도
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  재시도 이력이 없습니다.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// 헬퍼 컴포넌트
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: React.ReactNode }> = {
    preparing: {
      label: "준비 중",
      icon: <Clock className="h-3 w-3" />,
    },
    broadcasting: {
      label: "브로드캐스트 중",
      icon: <Clock className="h-3 w-3" />,
    },
    broadcast_failed: {
      label: "브로드캐스트 실패",
      icon: <XCircle className="h-3 w-3" />,
    },
    confirming: {
      label: "컨펌 대기 중",
      icon: <Clock className="h-3 w-3" />,
    },
    confirmed: {
      label: "완료",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    failed: {
      label: "실패",
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const { label, icon } = config[status] || {
    label: status,
    icon: null,
  };

  return (
    <Badge className="flex items-center gap-1">
      {icon}
      {label}
    </Badge>
  );
}
