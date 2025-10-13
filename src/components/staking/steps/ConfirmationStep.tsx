"use client";

import { StakingAsset, StakingValidator, StakingCalculation } from "../types";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { formatCryptoAmount, formatKRW } from "../utils/stakingCalculations";
import { getSlashingRiskBadge } from "../utils/stakingConstants";

interface ConfirmationStepProps {
  asset: StakingAsset;
  amount: number;
  validator: StakingValidator;
  calculation: StakingCalculation;
  termsAgreed: boolean;
  riskAcknowledged: boolean;
  onTermsAgreedChange: (agreed: boolean) => void;
  onRiskAcknowledgedChange: (agreed: boolean) => void;
  errors: {
    termsAgreed?: string;
    riskAcknowledged?: string;
  };
}

export default function ConfirmationStep({
  asset,
  amount,
  validator,
  calculation,
  termsAgreed,
  riskAcknowledged,
  onTermsAgreedChange,
  onRiskAcknowledgedChange,
  errors,
}: ConfirmationStepProps) {
  const slashingRiskBadge = getSlashingRiskBadge(asset.slashingRisk);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          스테이킹 정보를 확인해주세요
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          최종 제출 전 모든 정보를 다시 한번 확인해주세요
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">스테이킹 요약</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">자산</span>
            <div className="flex items-center space-x-2">
              <CryptoIcon symbol={asset.symbol} size={20} />
              <span className="text-sm font-medium text-gray-900">
                {formatCryptoAmount(amount)} {asset.symbol}
              </span>
              <span className="text-xs text-gray-500">
                ({formatKRW(amount * asset.currentPrice)})
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">검증인</span>
            <span className="text-sm font-medium text-gray-900">
              {validator.name}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">예상 APY</span>
            <span className="text-sm font-semibold text-sky-600">
              {calculation.effectiveApy.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">예상 연간 보상</span>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatCryptoAmount(calculation.yearlyReward)} {asset.symbol}
              </div>
              <div className="text-xs text-gray-500">
                {formatKRW(calculation.yearlyRewardKrw)}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">네트워크 수수료</span>
              <span className="text-gray-900">
                {formatCryptoAmount(calculation.networkFee, 6)} {asset.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">검증인 수수료</span>
              <span className="text-gray-900">{validator.commissionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          중요 안내사항
        </h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>언스테이킹 대기 기간:</strong> 스테이킹 해제 시{" "}
              {asset.unstakingPeriod.min}-{asset.unstakingPeriod.max}일이 소요됩니다
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>APY 변동:</strong> 표시된 APY는 예상치이며 네트워크 상황에
              따라 실제 보상이 변동될 수 있습니다
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <div className="flex items-center space-x-2">
              <span>
                <strong>슬래싱 리스크:</strong>
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${slashingRiskBadge.className}`}
              >
                {slashingRiskBadge.text}
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>가격 변동 리스크:</strong> 스테이킹 중에도 자산 가격은
              변동하여 손실이 발생할 수 있습니다
            </span>
          </li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => onTermsAgreedChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              스테이킹 약관 및 서비스 이용 약관에 동의합니다
            </span>
          </label>
          {errors.termsAgreed && (
            <p className="text-sm text-red-600 mt-1 ml-7">
              {errors.termsAgreed}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={riskAcknowledged}
              onChange={(e) => onRiskAcknowledgedChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              스테이킹 관련 리스크(언스테이킹 대기 기간, APY 변동, 슬래싱,
              가격 변동)를 충분히 이해하였으며 이에 동의합니다
            </span>
          </label>
          {errors.riskAcknowledged && (
            <p className="text-sm text-red-600 mt-1 ml-7">
              {errors.riskAcknowledged}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
