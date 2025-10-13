"use client";

import { useState, useEffect } from "react";
import { StakingAsset, StakingCalculation } from "../types";
import CryptoIcon from "@/components/ui/CryptoIcon";
import RewardCalculator from "../components/RewardCalculator";
import {
  QUICK_SELECT_RATIOS,
  QUICK_SELECT_LABELS,
} from "../utils/stakingConstants";
import { formatKRW } from "../utils/stakingCalculations";

interface AmountInputStepProps {
  asset: StakingAsset;
  amount: number;
  onAmountChange: (amount: number) => void;
  calculation: StakingCalculation | null;
  error?: string;
}

export default function AmountInputStep({
  asset,
  amount,
  onAmountChange,
  calculation,
  error,
}: AmountInputStepProps) {
  const [inputValue, setInputValue] = useState(amount.toString());

  useEffect(() => {
    setInputValue(amount > 0 ? amount.toString() : "");
  }, [amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onAmountChange(numValue);
    } else if (value === "") {
      onAmountChange(0);
    }
  };

  const handleQuickSelect = (ratio: number) => {
    const quickAmount = asset.availableBalance * ratio;
    onAmountChange(quickAmount);
  };

  const handleMaxSelect = () => {
    onAmountChange(asset.availableBalance);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onAmountChange(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          스테이킹 수량을 입력하세요
        </h3>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm text-gray-600">선택 자산:</span>
          <div className="flex items-center space-x-2">
            <CryptoIcon symbol={asset.symbol} size={20} />
            <span className="text-sm font-medium text-gray-900">
              {asset.name}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            스테이킹 수량
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="0.0"
              step="any"
              min={0}
              max={asset.availableBalance}
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              onClick={handleMaxSelect}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              전체
            </button>
            <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{asset.symbol}</span>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <p className="text-sm text-gray-500 mt-1">
            사용 가능: {asset.availableBalance.toFixed(4)} {asset.symbol}
          </p>
        </div>

        <div>
          <input
            type="range"
            min={0}
            max={asset.availableBalance}
            step={asset.availableBalance / 1000}
            value={amount}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {asset.minStakingAmount} {asset.symbol}
            </span>
            <span>
              {asset.availableBalance.toFixed(4)} {asset.symbol}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {QUICK_SELECT_RATIOS.map((ratio, index) => (
            <button
              key={ratio}
              onClick={() => handleQuickSelect(ratio)}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {QUICK_SELECT_LABELS[index]}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">KRW 환산 금액</span>
            <span className="font-semibold text-gray-900">
              {formatKRW(amount * asset.currentPrice)}
            </span>
          </div>
        </div>
      </div>

      {calculation && amount > 0 && (
        <RewardCalculator calculation={calculation} assetSymbol={asset.symbol} />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">참고사항</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                최소 스테이킹 수량: {asset.minStakingAmount} {asset.symbol}
              </li>
              <li>
                네트워크 수수료: {asset.networkFee.toFixed(6)} {asset.symbol}
              </li>
              <li>
                언스테이킹 대기 기간: {asset.unstakingPeriod.min}-
                {asset.unstakingPeriod.max}일
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
