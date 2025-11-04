// ============================================================================
// 출금 상세 모달 컴포넌트
// ============================================================================
// 용도: 출금 요청 상세 정보 표시 및 테스트용 AML 검증 처리
// ============================================================================

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle, Wallet } from "lucide-react";
import { Withdrawal } from "@/types/withdrawal";
import { getStatusText, getStatusBadgeVariant } from "@/lib/withdrawalStatusUtils";

// ============================================================================
// Props 인터페이스
// ============================================================================

interface WithdrawalDetailModalProps {
  withdrawal: Withdrawal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 금액 포맷팅
 */
function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}


// ============================================================================
// 메인 컴포넌트
// ============================================================================

export default function WithdrawalDetailModal({
  withdrawal,
  isOpen,
  onClose,
  onSuccess,
}: WithdrawalDetailModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // withdrawal이 없으면 렌더링 안 함
  if (!withdrawal) return null;

  const isAMLReview = withdrawal.status === "aml_review";
  const isProcessingStatus = withdrawal.status === "processing";

  // AML 검증 완료 처리
  const handleCompleteAML = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/withdrawals/${withdrawal.id}/aml/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "AML 검증 처리 실패");
      }

      const data = await response.json();

      toast({
        description: "AML 검증이 완료되었습니다. 승인 대기 상태로 전환되었습니다.",
      });

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("AML 검증 처리 실패:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "AML 검증 처리에 실패했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hot Wallet 전송 처리
  const handleHotWalletTransfer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/withdrawals/${withdrawal.id}/approve/hot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hot Wallet 전송 실패");
      }

      const data = await response.json();

      toast({
        description: "Hot Wallet 전송이 시작되었습니다.",
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Hot Wallet 전송 실패:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Hot Wallet 전송에 실패했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cold Wallet 전송 처리
  const handleColdWalletTransfer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/withdrawals/${withdrawal.id}/approve/cold`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cold Wallet 전송 실패");
      }

      const data = await response.json();

      toast({
        description: "Cold Wallet 전송이 시작되었습니다.",
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Cold Wallet 전송 실패:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Cold Wallet 전송에 실패했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>출금 상세 정보</DialogTitle>
          <DialogDescription>
            {withdrawal.memberInfo.companyName} - {withdrawal.assetSymbol}{" "}
            {formatAmount(withdrawal.amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">기본 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  출금 ID
                </div>
                <div className="text-sm font-mono">{withdrawal.id}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">상태</div>
                <Badge variant={getStatusBadgeVariant(withdrawal.status)}>
                  {getStatusText(withdrawal.status)}
                </Badge>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  회원사
                </div>
                <div className="text-sm font-medium">
                  {withdrawal.memberInfo.companyName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {withdrawal.memberInfo.businessNumber}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  플랜 타입
                </div>
                <div className="text-sm capitalize">
                  {withdrawal.memberInfo.planType}
                </div>
              </div>
            </div>
          </div>

          {/* 자산 정보 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">자산 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">자산</div>
                <div className="flex items-center gap-2">
                  <CryptoIcon
                    symbol={withdrawal.assetSymbol}
                    size={20}
                    className="flex-shrink-0"
                  />
                  <span className="text-sm font-medium">
                    {withdrawal.assetSymbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({withdrawal.network})
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">금액</div>
                <div className="text-sm font-medium">
                  {formatAmount(withdrawal.amount)} {withdrawal.assetSymbol}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  네트워크 수수료
                </div>
                <div className="text-sm">
                  {formatAmount(withdrawal.networkFee)} {withdrawal.assetSymbol}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  실제 수신 금액
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {formatAmount(withdrawal.netAmount)} {withdrawal.assetSymbol}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-xs text-muted-foreground mb-1">
                  수신 주소
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {withdrawal.toAddress}
                </code>
              </div>
            </div>
          </div>

          {/* 우선순위 정보 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">우선순위</h3>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  withdrawal.priority === "urgent"
                    ? "destructive"
                    : withdrawal.priority === "normal"
                    ? "default"
                    : "secondary"
                }
              >
                {withdrawal.priority === "urgent"
                  ? "긴급"
                  : withdrawal.priority === "normal"
                  ? "보통"
                  : "낮음"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                대기 시간: {withdrawal.waitingTimeMinutes}분
              </span>
            </div>
          </div>

          {/* 요청 일시 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">일시 정보</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  요청 일시
                </div>
                <div>{formatDate(withdrawal.requestedAt)}</div>
              </div>

              {withdrawal.approvedAt && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    승인 일시
                  </div>
                  <div>{formatDate(withdrawal.approvedAt)}</div>
                </div>
              )}

              {withdrawal.confirmedAt && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    완료 일시
                  </div>
                  <div>{formatDate(withdrawal.confirmedAt)}</div>
                </div>
              )}

              {withdrawal.rejectedAt && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    거부 일시
                  </div>
                  <div>{formatDate(withdrawal.rejectedAt)}</div>
                </div>
              )}
            </div>
          </div>

          {/* 트랜잭션 정보 (txHash가 있으면) */}
          {withdrawal.txHash && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">트랜잭션 정보</h3>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  트랜잭션 해시
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {withdrawal.txHash}
                </code>
              </div>
            </div>
          )}

          {/* 메모 (있으면) */}
          {withdrawal.notes && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">메모</h3>
              <div className="text-sm text-muted-foreground">
                {withdrawal.notes}
              </div>
            </div>
          )}

          {/* 거부 정보 (거부된 경우) */}
          {withdrawal.status === "admin_rejected" &&
            withdrawal.rejectionReason &&
            withdrawal.rejectionNote && (
              <div className="border rounded-lg p-4 space-y-3 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-lg text-red-900 dark:text-red-100">
                  거부 정보
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-red-700 dark:text-red-300 mb-1">
                      거부 사유
                    </div>
                    <div className="text-sm text-red-900 dark:text-red-100">
                      {withdrawal.rejectionReason}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-red-700 dark:text-red-300 mb-1">
                      거부 메모
                    </div>
                    <div className="text-sm text-red-900 dark:text-red-100">
                      {withdrawal.rejectionNote}
                    </div>
                  </div>
                  {withdrawal.rejectedBy && (
                    <div>
                      <div className="text-xs text-red-700 dark:text-red-300 mb-1">
                        거부한 관리자
                      </div>
                      <div className="text-sm text-red-900 dark:text-red-100">
                        {withdrawal.rejectedBy.adminName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 출금 중지 정보 (중지된 경우) */}
          {withdrawal.status === "withdrawal_stopped" &&
            withdrawal.withdrawalStoppedReason && (
              <div className="border rounded-lg p-4 space-y-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-lg text-yellow-900 dark:text-yellow-100">
                  출금 중지 정보
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
                      중지 사유
                    </div>
                    <div className="text-sm text-yellow-900 dark:text-yellow-100">
                      {withdrawal.withdrawalStoppedReason}
                    </div>
                  </div>
                  {withdrawal.withdrawalStoppedAt && (
                    <div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
                        중지 일시
                      </div>
                      <div className="text-sm text-yellow-900 dark:text-yellow-100">
                        {formatDate(withdrawal.withdrawalStoppedAt)}
                      </div>
                    </div>
                  )}
                  {withdrawal.stoppedBy && (
                    <div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
                        중지한 사용자
                      </div>
                      <div className="text-sm text-yellow-900 dark:text-yellow-100">
                        {withdrawal.stoppedBy.userName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            닫기
          </Button>

          {/* AML 검증 처리 버튼 (aml_review 상태일 때만 표시) */}
          {isAMLReview && (
            <Button
              onClick={handleCompleteAML}
              disabled={isLoading}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isLoading ? "처리 중..." : "테스트용 AML 검증 처리"}
            </Button>
          )}

          {/* Hot/Cold Wallet 전송 버튼 (processing 상태일 때만 표시) */}
          {isProcessingStatus && (
            <>
              <Button
                onClick={handleHotWalletTransfer}
                disabled={isLoading}
                className="gap-2"
                variant="default"
              >
                <Wallet className="h-4 w-4" />
                {isLoading ? "처리 중..." : "Hot Wallet 전송"}
              </Button>
              <Button
                onClick={handleColdWalletTransfer}
                disabled={isLoading}
                className="gap-2"
                variant="secondary"
              >
                <Wallet className="h-4 w-4" />
                {isLoading ? "처리 중..." : "Cold Wallet 전송"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
