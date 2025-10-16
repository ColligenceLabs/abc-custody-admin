/**
 * VaultSummaryCard Component
 *
 * 전체 볼트 요약 카드
 * 모든 블록체인의 총 자산 및 Hot/Cold 비율 요약
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { VaultV2Summary } from "@/types/withdrawalV2";
import { Badge } from "@/components/ui/badge";

interface VaultSummaryCardProps {
  summary?: VaultV2Summary;
}

export function VaultSummaryCard({ summary }: VaultSummaryCardProps) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>전체 볼트 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          전체 볼트 요약
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {summary.network === "mainnet" ? "Mainnet" : "Testnet"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 총 자산 가치 */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">총 자산 가치</p>
          <p className="text-3xl font-bold">{summary.totalValueKRW} 원</p>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Hot Wallet</p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {summary.hotTotalKRW} 원
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cold Wallet</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {summary.coldTotalKRW} 원
              </p>
            </div>
          </div>
        </div>

        {/* 전체 평균 비율 */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">전체 평균 비율</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Hot</span>
                <span className="text-sm font-semibold">
                  {summary.overallHotRatio.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${summary.overallHotRatio}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Cold</span>
                <span className="text-sm font-semibold">
                  {summary.overallColdRatio.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${summary.overallColdRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 리밸런싱 필요 블록체인 */}
        {summary.blockchainsNeedingRebalancing.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-semibold">리밸런싱 필요</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.blockchainsNeedingRebalancing.map((blockchain) => (
                <Badge key={blockchain} variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20">
                  {blockchain === "BITCOIN" && "Bitcoin"}
                  {blockchain === "ETHEREUM" && "Ethereum"}
                  {blockchain === "SOLANA" && "Solana"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 정상 상태 */}
        {summary.blockchainsNeedingRebalancing.length === 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                모든 블록체인 정상 범위
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
