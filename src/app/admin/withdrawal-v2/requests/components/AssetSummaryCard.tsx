/**
 * AssetSummaryCard Component
 *
 * 승인 대기 중인 자산별 출금 요청 요약 카드
 * - 자산 아이콘 및 이름
 * - 총 수량
 * - 요청 건수
 * - 긴급 요청 수 (있는 경우)
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AssetType } from "@/types/withdrawalV2";
import { FileText, AlertTriangle } from "lucide-react";

export interface AssetPendingSummary {
  asset: AssetType;
  totalAmount: string;
  totalValueKRW: string;
  requestCount: number;
  urgentCount: number;
  memberIds: string[];
}

interface AssetSummaryCardProps {
  summary: AssetPendingSummary;
}

export function AssetSummaryCard({ summary }: AssetSummaryCardProps) {
  const { asset, totalAmount, requestCount, urgentCount } = summary;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* 자산 아이콘 및 이름 */}
        <div className="flex items-center gap-2">
          <CryptoIcon symbol={asset} size={32} />
          <span className="text-sm font-medium text-muted-foreground">
            {asset}
          </span>
        </div>

        {/* 총 수량 */}
        <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>

        {/* 요청 건수 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>{requestCount}건 요청</span>
        </div>

        {/* 긴급 요청 (조건부 표시) */}
        {urgentCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {urgentCount}건 긴급
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 금액 포맷팅 (천 단위 콤마)
 */
function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;

  // 소수점 처리 (BTC: 4자리, ETH/SOL: 2자리, USDT/USDC: 0자리)
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}
