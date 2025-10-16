/**
 * ApprovalModal Component
 *
 * 출금 승인 모달
 * 자동 볼트 체크 및 리밸런싱 필요 시 알림 포함
 */

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  WithdrawalV2Request,
  VaultCheckResult,
} from "@/types/withdrawalV2";
import { withdrawalV2Api } from "@/services/withdrawalV2Api";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  Wallet,
} from "lucide-react";

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  request: WithdrawalV2Request | null;
  onConfirm: (request: WithdrawalV2Request, vaultCheck: VaultCheckResult) => void;
}

export function ApprovalModal({
  open,
  onClose,
  request,
  onConfirm,
}: ApprovalModalProps) {
  const [vaultCheck, setVaultCheck] = useState<VaultCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 볼트 체크 자동 실행
  useEffect(() => {
    if (open && request) {
      performVaultCheck();
    } else {
      setVaultCheck(null);
      setError(null);
    }
  }, [open, request]);

  const performVaultCheck = async () => {
    if (!request) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await withdrawalV2Api.checkVaultBeforeWithdrawal(
        request.id
      );
      setVaultCheck(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "볼트 체크 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (request && vaultCheck) {
      onConfirm(request, vaultCheck);
      onClose();
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            출금 요청 승인
          </DialogTitle>
          <DialogDescription>
            출금 요청을 검토하고 볼트 상태를 확인합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 출금 요청 정보 */}
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
                <p className="text-muted-foreground">우선순위</p>
                <Badge
                  variant={
                    request.priority === "urgent" ? "destructive" : "secondary"
                  }
                >
                  {request.priority === "urgent" && "긴급"}
                  {request.priority === "normal" && "보통"}
                  {request.priority === "low" && "낮음"}
                </Badge>
              </div>
            </div>
          </div>

          {/* 볼트 체크 결과 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-muted-foreground">
                볼트 상태 확인 중...
              </span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>볼트 체크 실패</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={performVaultCheck}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            </Alert>
          )}

          {vaultCheck && !isLoading && (
            <div className="space-y-4">
              {/* Hot 잔고 상태 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Hot Wallet 잔고
                  </h3>
                  {vaultCheck.hotSufficient ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      충분
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      부족
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">현재 잔고</p>
                    <p className="font-mono font-semibold">
                      {vaultCheck.hotBalance} {request.asset}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">요청 수량</p>
                    <p className="font-mono font-semibold">
                      {vaultCheck.requestedAmount} {request.asset}
                    </p>
                  </div>
                </div>
              </div>

              {/* 리밸런싱 필요 알림 */}
              {vaultCheck.rebalancingRequired && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>리밸런싱 필요</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>
                      Hot 잔고가 부족하여 리밸런싱이 필요합니다.
                      {vaultCheck.rebalancingAmount && vaultCheck.rebalancingAsset && (
                        <>
                          {" "}Cold에서 Hot으로{" "}
                          <strong>
                            {vaultCheck.rebalancingAmount}{" "}
                            {vaultCheck.rebalancingAsset}
                          </strong>
                          를 이동해야 합니다.
                        </>
                      )}
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={
              !vaultCheck ||
              isLoading ||
              (vaultCheck && vaultCheck.rebalancingRequired)
            }
          >
            {vaultCheck?.rebalancingRequired ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                리밸런싱 필요
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                승인
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
