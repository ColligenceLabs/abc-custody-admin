/**
 * BlockchainVaultCard Component
 *
 * 블록체인별 볼트 상태 카드
 * Bitcoin, Ethereum & ERC20, Solana 각각 독립적으로 표시
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Coins } from "lucide-react";
import { BlockchainVaultStatus } from "@/types/withdrawalV2";

interface BlockchainVaultCardProps {
  vault?: BlockchainVaultStatus;
}

export function BlockchainVaultCard({ vault }: BlockchainVaultCardProps) {
  if (!vault) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>로딩 중...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">데이터를 불러오는 중입니다.</p>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {getBlockchainIcon()}
          {vault.blockchainName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {vault.network === "mainnet" ? "Mainnet" : "Testnet"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hot/Cold 비율 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Hot Wallet</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {vault.hotRatio.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {vault.hotWallet.totalValueKRW} 원
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cold Wallet</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {vault.coldRatio.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {vault.coldWallet.totalValueKRW} 원
            </p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="space-y-2">
          <Progress
            value={vault.hotRatio}
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hot {vault.hotRatio.toFixed(1)}%</span>
            <span>Cold {vault.coldRatio.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            목표: Hot 20% / Cold 80%
          </p>
        </div>

        {/* 리밸런싱 필요 알림 */}
        {vault.needsRebalancing && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-500/50">
            <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-200">
              리밸런싱 필요
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
              편차: {vault.deviation.toFixed(1)}% (임계값: {vault.rebalancingThreshold}%)
            </p>
          </div>
        )}

        {/* 정상 상태 */}
        {!vault.needsRebalancing && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-500/50">
            <p className="text-xs font-semibold text-green-900 dark:text-green-200">
              정상 범위
            </p>
            <p className="text-xs text-green-800 dark:text-green-300 mt-1">
              편차: {vault.deviation.toFixed(1)}%
            </p>
          </div>
        )}

        {/* 자산 목록 */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-semibold">보유 자산</p>
          <div className="space-y-1">
            {vault.hotWallet.assets.slice(0, 3).map((asset) => (
              <div key={asset.symbol} className="flex justify-between items-center text-xs">
                <span className="font-medium">{asset.symbol}</span>
                <div className="text-right">
                  <p className="font-mono">{asset.balance}</p>
                  <p className="text-muted-foreground">{asset.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {vault.hotWallet.assets.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                외 {vault.hotWallet.assets.length - 3}개 자산
              </p>
            )}
          </div>
        </div>

        {/* 총 가치 */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">총 자산 가치</p>
          <p className="text-lg font-bold">{vault.totalValueKRW} 원</p>
        </div>

        {/* 마지막 업데이트 */}
        <div className="text-xs text-muted-foreground text-center">
          마지막 업데이트: {vault.lastUpdated.toLocaleTimeString('ko-KR')}
        </div>
      </CardContent>
    </Card>
  );
}
