"use client";

import { StakingValidator } from "../types";
import ValidatorTable from "../components/ValidatorTable";
import { getTrustScoreBadge } from "../utils/stakingConstants";
import { formatKRW } from "../utils/stakingCalculations";

interface ValidatorSelectionStepProps {
  validators: StakingValidator[];
  selectedValidator: StakingValidator | null;
  onSelectValidator: (validator: StakingValidator) => void;
}

export default function ValidatorSelectionStep({
  validators,
  selectedValidator,
  onSelectValidator,
}: ValidatorSelectionStepProps) {
  const trustBadge = selectedValidator
    ? getTrustScoreBadge(selectedValidator.trustScore)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          검증인을 선택하세요
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          신뢰할 수 있는 검증인을 선택하여 안전하게 스테이킹하세요
        </p>
      </div>

      <ValidatorTable
        validators={validators}
        selectedValidator={selectedValidator}
        onSelectValidator={onSelectValidator}
      />

      {selectedValidator && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">검증인 상세 정보</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">검증인명</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedValidator.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">총 위임량</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {selectedValidator.totalStaked.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {formatKRW(selectedValidator.totalStakedKrw)}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">신뢰도</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {selectedValidator.trustScore.toFixed(1)}/5.0
                </span>
                {trustBadge && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${trustBadge.color} ${trustBadge.bgColor} ${trustBadge.borderColor}`}
                  >
                    {trustBadge.text}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">슬래싱 이력</span>
              <span
                className={`text-sm font-medium ${
                  selectedValidator.slashingHistory.length === 0
                    ? "text-sky-600"
                    : "text-red-600"
                }`}
              >
                {selectedValidator.slashingHistory.length === 0
                  ? "없음"
                  : `${selectedValidator.slashingHistory.length}건`}
              </span>
            </div>
            {selectedValidator.description && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedValidator.description}
                </p>
              </div>
            )}
            {selectedValidator.website && (
              <div className="pt-2">
                <a
                  href={selectedValidator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  웹사이트 방문
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg
            className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">검증인 선택 시 주의사항</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>가동률이 높은 검증인을 선택하세요 (95% 이상 권장)</li>
              <li>슬래싱 이력이 없는 검증인이 안전합니다</li>
              <li>검증인 수수료율을 확인하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
