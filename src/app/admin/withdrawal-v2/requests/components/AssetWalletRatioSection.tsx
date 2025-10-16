/**
 * Asset Wallet Ratio Section Component
 *
 * 5개 자산(BTC, ETH, USDT, USDC, SOL)의 Hot/Cold 지갑 비율을 표시하는 섹션
 */

import { AssetWalletRatioCard } from "./AssetWalletRatioCard";
import { AssetType } from "@/types/withdrawalV2";

export interface AssetWalletInfo {
  asset: AssetType;
  hotBalance: string;
  coldBalance: string;
  totalBalance: string;
  hotRatio: number;
  coldRatio: number;
  targetHotRatio: number;
  targetColdRatio: number;
  deviation: number;
  needsRebalancing: boolean;
}

interface AssetWalletRatioSectionProps {
  assetsData?: AssetWalletInfo[];
}

// Mock 데이터 (개발용) - export하여 다른 컴포넌트에서도 사용 가능
export const DEFAULT_ASSETS_DATA: AssetWalletInfo[] = [
  {
    asset: "BTC",
    hotBalance: "5.20",
    coldBalance: "20.80",
    totalBalance: "26.00",
    hotRatio: 20.0,
    coldRatio: 80.0,
    targetHotRatio: 20,
    targetColdRatio: 80,
    deviation: 0,
    needsRebalancing: false,
  },
  {
    asset: "ETH",
    hotBalance: "45.50",
    coldBalance: "154.50",
    totalBalance: "200.00",
    hotRatio: 22.75,
    coldRatio: 77.25,
    targetHotRatio: 20,
    targetColdRatio: 80,
    deviation: 2.75,
    needsRebalancing: false,
  },
  {
    asset: "USDT",
    hotBalance: "15000.00",
    coldBalance: "60000.00",
    totalBalance: "75000.00",
    hotRatio: 20.0,
    coldRatio: 80.0,
    targetHotRatio: 20,
    targetColdRatio: 80,
    deviation: 0,
    needsRebalancing: false,
  },
  {
    asset: "USDC",
    hotBalance: "8500.00",
    coldBalance: "41500.00",
    totalBalance: "50000.00",
    hotRatio: 17.0,
    coldRatio: 83.0,
    targetHotRatio: 20,
    targetColdRatio: 80,
    deviation: -3.0,
    needsRebalancing: false,
  },
  {
    asset: "SOL",
    hotBalance: "1200.00",
    coldBalance: "3800.00",
    totalBalance: "5000.00",
    hotRatio: 24.0,
    coldRatio: 76.0,
    targetHotRatio: 20,
    targetColdRatio: 80,
    deviation: 4.0,
    needsRebalancing: false,
  },
];

export function AssetWalletRatioSection({
  assetsData = DEFAULT_ASSETS_DATA,
}: AssetWalletRatioSectionProps) {
  return (
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
  );
}
