/**
 * Asset Ratio Display - Option C: Compact Card Grid with Circular Gauge
 *
 * 콤팩트 카드 그리드 - 원형 게이지로 Hot 비율 강조
 * 2줄 그리드 (3개 + 2개), 시각적으로 세련됨
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AssetWalletInfo } from "./AssetWalletRatioSection";

interface AssetRatioOptionCProps {
  assetsData: AssetWalletInfo[];
}

export function AssetRatioOptionC({ assetsData }: AssetRatioOptionCProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>옵션 C: 콤팩트 카드 그리드 (원형 게이지)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 카드 그리드 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {assetsData.slice(0, 3).map((asset) => (
            <AssetCircularCard key={asset.asset} asset={asset} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {assetsData.slice(3, 5).map((asset) => (
            <AssetCircularCard key={asset.asset} asset={asset} />
          ))}
        </div>

        {/* 요약 통계 */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground">Hot Wallet</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-300 rounded-full" />
                <span className="text-muted-foreground">Cold Wallet</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">정상</div>
                <div className="text-lg font-bold text-green-600">
                  {assetsData.filter((a) => !a.needsRebalancing).length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">주의</div>
                <div className="text-lg font-bold text-orange-600">
                  {assetsData.filter((a) => a.needsRebalancing).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 개별 자산 원형 카드 컴포넌트
 */
function AssetCircularCard({ asset }: { asset: AssetWalletInfo }) {
  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const hotOffset = circumference - (asset.hotRatio / 100) * circumference;
  const targetOffset = circumference - (asset.targetHotRatio / 100) * circumference;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex flex-col items-center space-y-4">
        {/* 헤더 */}
        <div className="flex items-center gap-2">
          <CryptoIcon symbol={asset.asset} size={24} />
          <span className="font-bold text-xl">{asset.asset}</span>
        </div>

        {/* 원형 게이지 */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* 배경 원 (Cold - 전체) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={strokeWidth}
            />
            {/* Hot 비율 원 */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#blueGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={hotOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            {/* 목표선 (20%) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray={circumference}
              strokeDashoffset={targetOffset}
              opacity={0.6}
            />
            {/* 그라디언트 정의 */}
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>

          {/* 중앙 비율 표시 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-blue-600">
              {asset.hotRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Hot Wallet</div>
          </div>
        </div>

        {/* 상태 배지 */}
        <div>
          {asset.needsRebalancing ? (
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-700 border-orange-300"
            >
              리밸런싱 필요 ({asset.deviation > 0 ? "+" : ""}
              {asset.deviation.toFixed(1)}%)
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-700 border-green-300"
            >
              정상 ({asset.deviation > 0 ? "+" : ""}
              {asset.deviation.toFixed(1)}%)
            </Badge>
          )}
        </div>

        {/* 잔고 정보 */}
        <div className="w-full space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hot:</span>
            <span className="font-medium">
              {asset.hotBalance} {asset.asset}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cold:</span>
            <span className="font-medium">
              {asset.coldBalance} {asset.asset}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
