/**
 * Asset Wallet Ratio Card Component
 *
 * 자산별 Hot/Cold 지갑 비율을 표시하는 카드 컴포넌트
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetType } from "@/types/withdrawalV2";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface AssetWalletRatioCardProps {
  asset: AssetType;
  hotBalance: string;
  coldBalance: string;
  hotRatio: number;
  coldRatio: number;
  targetHotRatio: number;
  targetColdRatio: number;
  deviation: number;
  needsRebalancing: boolean;
}

export function AssetWalletRatioCard({
  asset,
  hotBalance,
  coldBalance,
  hotRatio,
  coldRatio,
  targetHotRatio,
  targetColdRatio,
  deviation,
  needsRebalancing,
}: AssetWalletRatioCardProps) {
  // 3단계 상태 분류
  // 1. Hot ≤ 19%: 균형 유지 (녹색)
  // 2. 19% < Hot ≤ 20%: 주의 (주황색)
  // 3. Hot > 20%: 리밸런싱 필요 (빨간색)
  const getStatus = () => {
    if (hotRatio <= 19) {
      return {
        label: "균형 유지",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-300",
      };
    } else if (hotRatio > 19 && hotRatio <= 20) {
      return {
        label: "주의",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-300",
      };
    } else {
      return {
        label: "리밸런싱 필요",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-300",
      };
    }
  };

  const status = getStatus();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* 헤더: 자산 심볼 + 아이콘 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CryptoIcon symbol={asset} size={20} />
            <span className="font-bold text-lg">{asset}</span>
          </div>
          <Badge
            variant="outline"
            className={`${status.bgColor} ${status.textColor} ${status.borderColor}`}
          >
            {status.label}
          </Badge>
        </div>

        {/* 진행 바: Hot/Cold 비율 시각화 */}
        <div className="space-y-1">
          <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            {/* Hot 영역 (파란색) */}
            <div
              className="absolute h-full bg-blue-500 transition-all"
              style={{ width: `${hotRatio}%` }}
            />
            {/* Cold 영역 (회색) */}
            <div
              className="absolute h-full bg-slate-400 right-0 transition-all"
              style={{ width: `${coldRatio}%` }}
            />
            {/* 목표 비율 마커 (20% 지점) */}
            <div
              className="absolute h-full w-0.5 bg-red-500 opacity-70"
              style={{ left: `${targetHotRatio}%` }}
              title={`목표: ${targetHotRatio}%`}
            />
          </div>
          {/* 비율 표시 */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Hot: {hotRatio.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full" />
              Cold: {coldRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 잔고 표시 */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hot:</span>
            <span className="font-medium">{hotBalance} {asset}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cold:</span>
            <span className="font-medium">{coldBalance} {asset}</span>
          </div>
        </div>

        {/* 편차 표시 */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">목표 대비 편차:</span>
            <span className={`font-medium ${status.textColor}`}>
              {deviation > 0 ? "+" : ""}
              {deviation.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
