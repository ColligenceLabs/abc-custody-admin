/**
 * RebalancingCard Component
 *
 * 리밸런싱이 필요한 블록체인 카드
 * Cold → Hot 리밸런싱 시작 버튼 포함
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BlockchainVaultStatus } from "@/types/withdrawalV2";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Bitcoin,
  Coins,
} from "lucide-react";

interface RebalancingCardProps {
  vault: BlockchainVaultStatus;
  onStartRebalancing: (vault: BlockchainVaultStatus) => void;
}

export function RebalancingCard({
  vault,
  onStartRebalancing,
}: RebalancingCardProps) {
  const getBlockchainIcon = () => {
    switch (vault.blockchain) {
      case "BITCOIN":
        return <Bitcoin className="w-5 h-5 text-orange-500" />;
      case "ETHEREUM":
        return <Coins className="w-5 h-5 text-blue-500" />;
      case "SOLANA":
        return <Coins className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusColor = () => {
    if (vault.deviation > 10) {
      return {
        bg: "bg-red-100 dark:bg-red-900/20",
        border: "border-red-500",
        text: "text-red-800 dark:text-red-200",
      };
    } else if (vault.deviation > 5) {
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        border: "border-yellow-500",
        text: "text-yellow-800 dark:text-yellow-200",
      };
    }
    return {
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-500",
      text: "text-green-800 dark:text-green-200",
    };
  };

  const statusColor = getStatusColor();

  // 리밸런싱 필요 수량 계산
  // 중요: 네이티브 자산 개수 기준으로 계산!
  const calculateRebalancingAmount = () => {
    // 네이티브 자산 찾기 (BTC, ETH, SOL)
    const nativeAsset = vault.hotWallet.assets[0]; // 첫 번째가 네이티브 자산
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

    // 목표: Hot 20%
    const targetHotAmount = totalAmount * 0.2;
    const neededAmount = targetHotAmount - hotAmount;

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

    return {
      neededAmount,
      neededAmountFormatted: `${Math.abs(neededAmount).toFixed(4)} ${nativeSymbol}`,
      neededKRW,
      neededKRWFormatted: Math.abs(neededKRW).toLocaleString("ko-KR"),
      direction: neededAmount > 0 ? "cold-to-hot" : "hot-to-cold",
    };
  };

  const rebalancing = calculateRebalancingAmount();

  return (
    <Card
      className={`${statusColor.bg} border-2 ${statusColor.border} hover:shadow-lg transition-shadow`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getBlockchainIcon()}
            <span>{vault.blockchainName}</span>
          </div>
          {vault.needsRebalancing && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              리밸런싱 필요
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 현재 비율 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">현재 비율</span>
            <span className={`font-semibold ${statusColor.text}`}>
              편차 {vault.deviation.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hot Wallet</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {vault.hotRatio.toFixed(1)}%
              </p>
              <p className="text-sm font-medium">
                {vault.hotWallet.assets[0]?.balance} {vault.hotWallet.assets[0]?.symbol}
              </p>
              <p className="text-xs text-muted-foreground">
                {vault.hotWallet.totalValueKRW} 원
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cold Wallet</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {vault.coldRatio.toFixed(1)}%
              </p>
              <p className="text-sm font-medium">
                {vault.coldWallet.assets[0]?.balance} {vault.coldWallet.assets[0]?.symbol}
              </p>
              <p className="text-xs text-muted-foreground">
                {vault.coldWallet.totalValueKRW} 원
              </p>
            </div>
          </div>

          <Progress value={vault.hotRatio} className="h-3" />
        </div>

        {/* 목표 비율 */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">목표 비율</span>
            <span className="font-medium">Hot 20% / Cold 80%</span>
          </div>
          <Progress value={20} className="h-2 opacity-50" />
        </div>

        {/* 리밸런싱 필요 정보 */}
        {vault.needsRebalancing && (
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {rebalancing.direction === "cold-to-hot" ? (
                <>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Cold → Hot 이동 필요</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                  <span>Hot → Cold 이동 필요</span>
                </>
              )}
            </div>

            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">필요 수량</p>
              <p className="text-lg font-bold">
                {rebalancing.neededAmountFormatted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {rebalancing.neededKRWFormatted} 원
              </p>
            </div>

            <Button
              variant="default"
              className="w-full"
              onClick={() => onStartRebalancing(vault)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              리밸런싱 시작
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* 정상 상태 */}
        {!vault.needsRebalancing && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">정상 범위 내 유지</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              리밸런싱이 필요하지 않습니다
            </p>
          </div>
        )}

        {/* 마지막 업데이트 */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          마지막 업데이트: {vault.lastUpdated.toLocaleTimeString("ko-KR")}
        </div>
      </CardContent>
    </Card>
  );
}
