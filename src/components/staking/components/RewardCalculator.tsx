"use client";

import { StakingCalculation } from "../types";
import { formatCryptoAmount, formatKRW } from "../utils/stakingCalculations";

interface RewardCalculatorProps {
  calculation: StakingCalculation;
  assetSymbol: string;
}

export default function RewardCalculator({
  calculation,
  assetSymbol,
}: RewardCalculatorProps) {
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">예상 보상</h4>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">일일 보상</dt>
          <dd className="font-medium text-gray-900">
            {formatCryptoAmount(calculation.dailyReward)} {assetSymbol}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">월간 보상</dt>
          <dd className="font-medium text-gray-900">
            {formatCryptoAmount(calculation.monthlyReward)} {assetSymbol}
          </dd>
        </div>
        <div className="flex justify-between border-t pt-2">
          <dt className="text-gray-600">연간 예상 보상</dt>
          <dd className="font-semibold text-sky-600">
            {formatCryptoAmount(calculation.yearlyReward)} {assetSymbol}
          </dd>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <dt>KRW 환산</dt>
          <dd>{formatKRW(calculation.yearlyRewardKrw)}</dd>
        </div>
      </dl>
    </div>
  );
}
