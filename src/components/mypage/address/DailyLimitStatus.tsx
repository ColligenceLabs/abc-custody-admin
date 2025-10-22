"use client";

import { WhitelistedAddress } from "@/types/address";
import {
  getDailyLimitStatus,
  formatKRW,
  getProgressPercentage,
  getRemainingTime
} from "@/utils/addressHelpers";

interface DailyLimitStatusProps {
  address: WhitelistedAddress;
}

export default function DailyLimitStatus({ address }: DailyLimitStatusProps) {
  const limitStatus = getDailyLimitStatus(address);

  if (!limitStatus || address.type !== "personal") {
    return null;
  }

  const depositProgress = getProgressPercentage(limitStatus.depositUsed, limitStatus.depositLimit);
  const withdrawalProgress = getProgressPercentage(limitStatus.withdrawalUsed, limitStatus.withdrawalLimit);
  const remainingTime = getRemainingTime(limitStatus.nextResetAt);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-blue-500";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-100";
    if (percentage >= 70) return "bg-amber-100";
    return "bg-blue-100";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{address.label}</h4>
          <p className="text-xs text-gray-500">
            {address.coin} • {remainingTime}
          </p>
        </div>
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          개인지갑
        </span>
      </div>

      <div className="space-y-3">
        {/* 입금 한도 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">입금 한도</span>
            <span className="text-xs text-gray-600">
              {Math.round(depositProgress)}%
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${getProgressBgColor(depositProgress)}`}>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(depositProgress)}`}
              style={{ width: `${Math.min(depositProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-600">
              {formatKRW(limitStatus.depositUsed)}
            </span>
            <span className="text-xs text-gray-600">
              {formatKRW(limitStatus.depositLimit)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            잔여: {formatKRW(limitStatus.depositLimit - limitStatus.depositUsed)}
          </div>
        </div>

        {/* 출금 한도 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">출금 한도</span>
            <span className="text-xs text-gray-600">
              {Math.round(withdrawalProgress)}%
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${getProgressBgColor(withdrawalProgress)}`}>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(withdrawalProgress)}`}
              style={{ width: `${Math.min(withdrawalProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-600">
              {formatKRW(limitStatus.withdrawalUsed)}
            </span>
            <span className="text-xs text-gray-600">
              {formatKRW(limitStatus.withdrawalLimit)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            잔여: {formatKRW(limitStatus.withdrawalLimit - limitStatus.withdrawalUsed)}
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      {(depositProgress >= 90 || withdrawalProgress >= 90) && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          일일 한도가 거의 소진되었습니다. {remainingTime}
        </div>
      )}
      {(depositProgress >= 70 || withdrawalProgress >= 70) && (depositProgress < 90 && withdrawalProgress < 90) && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          일일 한도의 70% 이상 사용되었습니다.
        </div>
      )}
    </div>
  );
}