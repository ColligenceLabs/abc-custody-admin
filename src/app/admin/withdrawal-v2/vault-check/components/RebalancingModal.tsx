/**
 * RebalancingModal Component
 *
 * 리밸런싱 시작 모달
 * Cold → Hot 또는 Hot → Cold 이동 계획 표시 및 확인
 */

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BlockchainVaultStatus, RebalancingRequest } from "@/types/withdrawalV2";
import {
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface RebalancingModalProps {
  open: boolean;
  onClose: () => void;
  vault: BlockchainVaultStatus | null;
  onConfirm: (request: RebalancingRequest) => void;
}

export function RebalancingModal({
  open,
  onClose,
  vault,
  onConfirm,
}: RebalancingModalProps) {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useRecommended, setUseRecommended] = useState(true);

  if (!vault) return null;

  // 권장 리밸런싱 금액 계산
  // 중요: 네이티브 자산 개수 기준으로 계산!
  const calculateRecommendedAmount = () => {
    // 네이티브 자산 찾기
    const nativeAsset = vault.hotWallet.assets[0];
    const nativeSymbol = nativeAsset.symbol;

    // Hot/Cold 네이티브 자산 개수
    const hotAmount = parseFloat(
      vault.hotWallet.assets.find((a) => a.symbol === nativeSymbol)?.balance ||
        "0"
    );
    const coldAmount = parseFloat(
      vault.coldWallet.assets.find((a) => a.symbol === nativeSymbol)?.balance ||
        "0"
    );
    const totalAmount = hotAmount + coldAmount;

    const targetHotAmount = totalAmount * 0.2;
    const neededAmount = targetHotAmount - hotAmount;

    // 20% 안전 마진 추가
    const withMargin = neededAmount * 1.2;

    // KRW 환산 (참고용)
    const hotTotalKRW = parseFloat(
      vault.hotWallet.totalValueKRW.replace(/,/g, "")
    );
    const coldTotalKRW = parseFloat(
      vault.coldWallet.totalValueKRW.replace(/,/g, "")
    );
    const totalKRW = hotTotalKRW + coldTotalKRW;
    const targetHotKRW = totalKRW * 0.2;
    const neededKRW = targetHotKRW - hotTotalKRW;
    const withMarginKRW = neededKRW * 1.2;

    return {
      nativeSymbol,
      neededAmount,
      withMargin,
      neededKRW,
      withMarginKRW,
      direction: neededAmount > 0 ? ("COLD_TO_HOT" as const) : ("HOT_TO_COLD" as const),
    };
  };

  const recommended = calculateRecommendedAmount();
  const finalAmount = useRecommended
    ? Math.abs(recommended.withMargin)
    : parseFloat(customAmount) || 0;

  const handleConfirm = () => {
    // 네이티브 자산 개수 기준
    const nativeAmount = finalAmount;

    // KRW 환산 (참고용) - 간단한 추정
    const estimatedKRW = Math.abs(recommended.withMarginKRW);

    const request: RebalancingRequest = {
      id: `RB-${Date.now()}`,
      blockchain: vault.blockchain,
      network: vault.network,
      direction: recommended.direction,
      asset: recommended.nativeSymbol,
      amount: nativeAmount.toString(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      currentHotRatio: vault.hotRatio,
      currentColdRatio: vault.coldRatio,
      targetHotRatio: 20,
      targetColdRatio: 80,
    };

    onConfirm(request);
    onClose();
    setCustomAmount("");
    setUseRecommended(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            리밸런싱 시작
          </DialogTitle>
          <DialogDescription>
            {vault.blockchainName} 블록체인의 Hot/Cold 비율을 조정합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 현재 상태 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">현재 상태</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">블록체인</p>
                <Badge variant="outline">{vault.blockchainName}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Hot 비율</p>
                <p className="font-semibold text-orange-600 dark:text-orange-400">
                  {vault.hotRatio.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cold 비율</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {vault.coldRatio.toFixed(1)}%
                </p>
              </div>
              <div className="col-span-3">
                <p className="text-muted-foreground">편차</p>
                <p className="font-bold text-yellow-600 dark:text-yellow-400">
                  {vault.deviation.toFixed(1)}% (임계값: {vault.rebalancingThreshold}%)
                </p>
              </div>
            </div>
          </div>

          {/* 리밸런싱 방향 */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>리밸런싱 방향</AlertTitle>
            <AlertDescription>
              {recommended.direction === "COLD_TO_HOT" ? (
                <>
                  <strong>Cold Wallet → Hot Wallet</strong>로 자산을 이동합니다.
                  <br />
                  Hot 잔고를 늘려 목표 비율 20%에 도달합니다.
                </>
              ) : (
                <>
                  <strong>Hot Wallet → Cold Wallet</strong>로 자산을 이동합니다.
                  <br />
                  Hot 잔고를 줄여 목표 비율 20%에 도달합니다.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* 리밸런싱 금액 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">리밸런싱 금액</h3>

            {/* 권장 수량 */}
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={useRecommended}
                    onChange={() => setUseRecommended(true)}
                    className="w-4 h-4"
                  />
                  권장 수량 (안전 마진 20% 포함)
                </Label>
                <Badge variant="default" className="bg-green-600">
                  권장
                </Badge>
              </div>
              <p className="text-2xl font-bold pl-6">
                {Math.abs(recommended.withMargin).toFixed(4)}{" "}
                {recommended.nativeSymbol}
              </p>
              <p className="text-xs text-muted-foreground pl-6">
                기본 필요 수량:{" "}
                {Math.abs(recommended.neededAmount).toFixed(4)}{" "}
                {recommended.nativeSymbol} + 마진 20%
              </p>
              <p className="text-xs text-muted-foreground pl-6">
                ≈ {Math.abs(recommended.withMarginKRW).toLocaleString("ko-KR")}{" "}
                원
              </p>
            </div>

            {/* 사용자 지정 수량 */}
            <div className="border rounded-lg p-3 space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!useRecommended}
                  onChange={() => setUseRecommended(false)}
                  className="w-4 h-4"
                />
                사용자 지정 수량
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder={`수량 입력 (${recommended.nativeSymbol})`}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setUseRecommended(false);
                  }}
                  disabled={useRecommended}
                  className="pl-6 flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  {recommended.nativeSymbol}
                </span>
              </div>
            </div>
          </div>

          {/* 예상 결과 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              리밸런싱 후 예상 상태
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">예상 Hot 비율</p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {recommended.direction === "COLD_TO_HOT"
                    ? `~${(vault.hotRatio + 5).toFixed(1)}%`
                    : `~${(vault.hotRatio - 5).toFixed(1)}%`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">예상 Cold 비율</p>
                <p className="font-semibold">
                  {recommended.direction === "COLD_TO_HOT"
                    ? `~${(vault.coldRatio - 5).toFixed(1)}%`
                    : `~${(vault.coldRatio + 5).toFixed(1)}%`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>목표 비율(20/80)에 근접합니다</span>
            </div>
          </div>

          {/* 주의사항 */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>주의사항</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>리밸런싱은 Air-gap 서명이 필요합니다</li>
                <li>예상 소요 시간: 약 30-60분</li>
                <li>리밸런싱 중에는 해당 블록체인의 출금이 제한될 수 있습니다</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!useRecommended && (!customAmount || parseFloat(customAmount) <= 0)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            리밸런싱 시작
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
