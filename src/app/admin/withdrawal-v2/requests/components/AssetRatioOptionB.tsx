/**
 * Asset Ratio Display - Option B: Vertical Stacked Bar Chart
 *
 * 세로 누적 바 차트 - 시각적 임팩트 강조
 * 5개 자산을 세로 막대로 표시, Hot/Cold 비율 누적
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AssetWalletInfo } from "./AssetWalletRatioSection";

interface AssetRatioOptionBProps {
  assetsData: AssetWalletInfo[];
}

export function AssetRatioOptionB({ assetsData }: AssetRatioOptionBProps) {
  const maxHeight = 300; // 차트 최대 높이 (px)

  return (
    <Card>
      <CardHeader>
        <CardTitle>옵션 B: 세로 누적 바 차트</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 차트 영역 */}
        <div className="relative">
          {/* Y축 레이블 (%) */}
          <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            <span>100%</span>
            <span className="text-red-500 font-medium">20%</span>
            <span>0%</span>
          </div>

          {/* 차트 컨테이너 */}
          <div className="pl-2">
            {/* 목표선 (20%) - 가로 점선 */}
            <div
              className="absolute w-full border-t-2 border-dashed border-red-500 opacity-50 z-10"
              style={{ top: `${maxHeight * 0.8}px` }}
            >
              <span className="absolute -top-3 right-0 text-xs text-red-500 font-medium bg-white px-1">
                목표: Hot 20%
              </span>
            </div>

            {/* 막대 그래프 그리드 */}
            <div
              className="flex items-end justify-around gap-4 border-b-2 border-slate-300 pb-4"
              style={{ height: `${maxHeight}px` }}
            >
              {assetsData.map((asset) => {
                const coldHeight = (asset.coldRatio / 100) * maxHeight;
                const hotHeight = (asset.hotRatio / 100) * maxHeight;

                return (
                  <div key={asset.asset} className="flex-1 flex flex-col items-center gap-2">
                    {/* 세로 막대 */}
                    <div className="relative w-full max-w-[80px] flex flex-col items-center">
                      {/* Cold 영역 (상단) */}
                      <div
                        className="w-full bg-gradient-to-t from-slate-400 to-slate-500 rounded-t-lg transition-all duration-500 flex items-center justify-center relative group"
                        style={{ height: `${coldHeight}px` }}
                      >
                        <span className="text-white text-sm font-medium transform -rotate-90 whitespace-nowrap">
                          {asset.coldRatio.toFixed(1)}%
                        </span>
                        {/* 호버 툴팁 */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          Cold: {asset.coldBalance} {asset.asset}
                        </div>
                      </div>

                      {/* Hot 영역 (하단) */}
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-b-lg transition-all duration-500 flex items-center justify-center relative group"
                        style={{ height: `${hotHeight}px` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {asset.hotRatio.toFixed(1)}%
                        </span>
                        {/* 호버 툴팁 */}
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          Hot: {asset.hotBalance} {asset.asset}
                        </div>
                      </div>

                      {/* 편차 표시 */}
                      {Math.abs(asset.deviation) > 5 && (
                        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-700 border-orange-300 text-xs whitespace-nowrap"
                          >
                            {asset.deviation > 0 ? "+" : ""}
                            {asset.deviation.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* X축 레이블 (자산명) */}
                    <div className="flex flex-col items-center gap-1 pt-2">
                      <CryptoIcon symbol={asset.asset} size={24} />
                      <span className="font-bold text-sm">{asset.asset}</span>
                      {asset.needsRebalancing ? (
                        <Badge
                          variant="outline"
                          className="bg-orange-100 text-orange-700 border-orange-300 text-xs"
                        >
                          재조정
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
                );
              })}
            </div>

            {/* 범례 */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-500 rounded" />
                <span className="text-muted-foreground">Hot Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gradient-to-t from-slate-400 to-slate-500 rounded" />
                <span className="text-muted-foreground">Cold Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 border-t-2 border-dashed border-red-500" />
                <span className="text-muted-foreground">목표 비율 (20/80)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="mt-6 pt-4 border-t bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">평균 Hot 비율</div>
              <div className="text-2xl font-bold text-blue-600">
                {(
                  assetsData.reduce((sum, a) => sum + a.hotRatio, 0) /
                  assetsData.length
                ).toFixed(1)}
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">목표 대비 평균 편차</div>
              <div className="text-2xl font-bold text-orange-600">
                {(
                  assetsData.reduce((sum, a) => sum + Math.abs(a.deviation), 0) /
                  assetsData.length
                ).toFixed(1)}
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">리밸런싱 필요</div>
              <div className="text-2xl font-bold text-red-600">
                {assetsData.filter((a) => a.needsRebalancing).length} / {assetsData.length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
