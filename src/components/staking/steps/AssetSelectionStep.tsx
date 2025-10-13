"use client";

import { StakingAsset } from "../types";
import AssetCard from "../components/AssetCard";

interface AssetSelectionStepProps {
  assets: StakingAsset[];
  selectedAsset: StakingAsset | null;
  onSelectAsset: (asset: StakingAsset) => void;
}

export default function AssetSelectionStep({
  assets,
  selectedAsset,
  onSelectAsset,
}: AssetSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          스테이킹할 자산을 선택하세요
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          보유하고 있는 자산 중 스테이킹 가능한 자산을 선택해주세요
        </p>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => {
          const isDisabled = asset.balance < asset.minStakingAmount;
          const isSelected = selectedAsset?.symbol === asset.symbol;

          return (
            <AssetCard
              key={asset.symbol}
              asset={asset}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onSelect={onSelectAsset}
            />
          );
        })}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">스테이킹 가능한 자산이 없습니다</p>
        </div>
      )}
    </div>
  );
}
