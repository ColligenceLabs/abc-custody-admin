"use client";

import { StakingAsset } from "../types";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface AssetCardProps {
  asset: StakingAsset;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (asset: StakingAsset) => void;
}

export default function AssetCard({
  asset,
  isSelected,
  isDisabled,
  onSelect,
}: AssetCardProps) {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(asset);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`border rounded-lg p-4 transition-all cursor-pointer ${
        isDisabled
          ? "opacity-50 cursor-not-allowed bg-gray-50"
          : isSelected
          ? "border-primary-500 bg-primary-50"
          : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CryptoIcon symbol={asset.symbol} size={32} className="flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">{asset.name}</h4>
            <p className="text-sm text-gray-600">
              보유: {asset.balance.toFixed(4)} {asset.symbol}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-sky-600">
            APY {asset.avgApy.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500">
            최소 {asset.minStakingAmount} {asset.symbol}
          </p>
        </div>
      </div>

      {isDisabled && (
        <div className="mt-2 text-xs text-red-600">보유 수량 부족</div>
      )}
    </div>
  );
}
