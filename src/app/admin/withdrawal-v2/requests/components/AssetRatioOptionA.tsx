/**
 * Asset Ratio Display - Option A: Unified Table View
 *
 * 통합 테이블 뷰 - 5개 자산을 하나의 테이블로 표시
 * 가로 막대 차트로 Hot/Cold 비율 비교 최적화
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AssetWalletInfo } from "./AssetWalletRatioSection";

interface AssetRatioOptionAProps {
  assetsData: AssetWalletInfo[];
}

export function AssetRatioOptionA({ assetsData }: AssetRatioOptionAProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>옵션 A: 통합 테이블 뷰</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-2">자산</div>
            <div className="col-span-6">Hot / Cold 비율</div>
            <div className="col-span-2 text-right">Hot 잔고</div>
            <div className="col-span-2 text-right">편차</div>
          </div>

          {/* 자산별 행 */}
          {assetsData.map((asset) => (
            <div
              key={asset.asset}
              className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-0 hover:bg-slate-50/50 transition-colors"
            >
              {/* 자산 정보 */}
              <div className="col-span-2 flex items-center gap-2">
                <CryptoIcon symbol={asset.asset} size={24} />
                <span className="font-bold text-lg">{asset.asset}</span>
              </div>

              {/* Hot/Cold 비율 막대 */}
              <div className="col-span-6 space-y-1">
                <div className="relative w-full h-8 bg-slate-200 rounded-lg overflow-hidden">
                  {/* Hot 영역 (파란색) */}
                  <div
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-start px-2"
                    style={{ width: `${asset.hotRatio}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {asset.hotRatio.toFixed(1)}%
                    </span>
                  </div>
                  {/* Cold 영역 (회색) */}
                  <div
                    className="absolute h-full bg-gradient-to-r from-slate-400 to-slate-500 right-0 transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${asset.coldRatio}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {asset.coldRatio.toFixed(1)}%
                    </span>
                  </div>
                  {/* 목표선 (20%) */}
                  <div
                    className="absolute h-full w-1 bg-red-500 opacity-80 z-10"
                    style={{ left: `${asset.targetHotRatio}%` }}
                    title={`목표: ${asset.targetHotRatio}%`}
                  />
                </div>
                {/* 범례 */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded" />
                    Hot
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-slate-400 rounded" />
                    Cold
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-red-500" />
                    목표 (20%)
                  </span>
                </div>
              </div>

              {/* Hot 잔고 */}
              <div className="col-span-2 text-right">
                <div className="font-medium">{asset.hotBalance}</div>
                <div className="text-xs text-muted-foreground">{asset.asset}</div>
              </div>

              {/* 편차 + 상태 */}
              <div className="col-span-2 text-right space-y-1">
                <div
                  className={`font-bold ${
                    Math.abs(asset.deviation) > 5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {asset.deviation > 0 ? "+" : ""}
                  {asset.deviation.toFixed(1)}%
                </div>
                {asset.needsRebalancing ? (
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 border-orange-300 text-xs"
                  >
                    리밸런싱
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-300 text-xs"
                  >
                    정상
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 요약 통계 */}
        <div className="mt-6 pt-4 border-t bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {assetsData.filter((a) => !a.needsRebalancing).length}
              </div>
              <div className="text-sm text-muted-foreground">정상 자산</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {assetsData.filter((a) => a.needsRebalancing).length}
              </div>
              <div className="text-sm text-muted-foreground">리밸런싱 필요</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {(
                  assetsData.reduce((sum, a) => sum + Math.abs(a.deviation), 0) /
                  assetsData.length
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-muted-foreground">평균 편차</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
