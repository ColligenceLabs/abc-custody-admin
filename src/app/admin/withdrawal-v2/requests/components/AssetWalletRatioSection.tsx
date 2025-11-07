/**
 * Asset Wallet Ratio Section Component
 *
 * API에서 반환하는 모든 자산의 Hot/Cold 지갑 비율을 표시하는 섹션
 */

"use client";

import { useState, useEffect } from 'react';
import { AssetWalletRatioCard } from "./AssetWalletRatioCard";
import { getAssetWalletRatios, type AssetWalletInfo } from "@/services/walletApi";

interface AssetWalletRatioSectionProps {
  refreshKey?: number; // 새로고침 트리거용 키
}

export function AssetWalletRatioSection({ refreshKey }: AssetWalletRatioSectionProps) {
  const [assetsData, setAssetsData] = useState<AssetWalletInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetRatios = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAssetWalletRatios();
      setAssetsData(data);
      console.log('지갑 잔고 조회 성공:', data.length, '개 자산');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터 조회 실패';
      setError(errorMessage);
      console.error('지갑 잔고 조회 실패:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 또는 refreshKey 변경 시 데이터 로드
  useEffect(() => {
    fetchAssetRatios();
  }, [refreshKey]);

  // 로딩 중이거나 데이터가 없으면 표시하지 않음
  if (loading && assetsData.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">자산별 Hot/Cold 지갑 밸런스</h2>
        <div className="flex items-center justify-center py-8 text-gray-500">
          <span className="text-sm">지갑 잔고를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 발생 시 표시하지 않음 (조용한 실패)
  if (error || assetsData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 헤더: 제목만 표시 */}
      <div>
        <h2 className="text-lg font-semibold">자산별 Hot/Cold 지갑 밸런스</h2>
      </div>

      {/* 카드 그리드 - 동적 레이아웃 (최대 5열) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {assetsData.map((assetInfo) => (
          <AssetWalletRatioCard
            key={assetInfo.asset}
            asset={assetInfo.asset}
            hotBalance={assetInfo.hotBalance}
            coldBalance={assetInfo.coldBalance}
            hotRatio={assetInfo.hotRatio}
            coldRatio={assetInfo.coldRatio}
            targetHotRatio={assetInfo.targetHotRatio}
            targetColdRatio={assetInfo.targetColdRatio}
            deviation={assetInfo.deviation}
            needsRebalancing={assetInfo.needsRebalancing}
          />
        ))}
      </div>
    </div>
  );
}
