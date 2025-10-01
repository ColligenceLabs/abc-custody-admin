import { useState } from "react";
import { DepositTransaction } from "@/types/deposit";
import { getStatusInfo, formatAmount, formatDateTime, getProgressPercentage } from "@/utils/depositHelpers";
import DepositStatusBadge from "./DepositStatusBadge";
import { ClockIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface DepositProgressCardProps {
  deposit: DepositTransaction;
  onViewDetails?: (depositId: string) => void;
}

export default function DepositProgressCard({
  deposit,
  onViewDetails
}: DepositProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = getStatusInfo(deposit.status);
  const progressPercentage = getProgressPercentage(
    deposit.currentConfirmations,
    deposit.requiredConfirmations
  );

  const getProgressBarColor = () => {
    switch (deposit.status) {
      case "detected":
        return "bg-blue-500";
      case "confirming":
        return "bg-yellow-500";
      case "confirmed":
      case "credited":
        return "bg-sky-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEstimatedTimeText = () => {
    if (!deposit.estimatedTime || deposit.status === "credited" || deposit.status === "failed") {
      return null;
    }

    if (deposit.estimatedTime < 1) {
      return "곧 완료 예정";
    } else if (deposit.estimatedTime < 60) {
      return `약 ${Math.ceil(deposit.estimatedTime)}분 남음`;
    } else {
      const hours = Math.floor(deposit.estimatedTime / 60);
      const minutes = Math.ceil(deposit.estimatedTime % 60);
      return `약 ${hours}시간 ${minutes > 0 ? `${minutes}분` : ''} 남음`;
    }
  };

  const truncateHash = (hash: string, length: number = 12) => {
    if (hash.length <= length) return hash;
    return `${hash.substring(0, length/2)}...${hash.substring(hash.length - length/2)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img
                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${deposit.asset.toLowerCase()}.png`}
                alt={deposit.asset}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                      <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                        ${deposit.asset}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {formatAmount(deposit.amount, deposit.asset)} {deposit.asset}
                </div>
                <div className="text-xs text-gray-500">
                  {deposit.network}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DepositStatusBadge status={deposit.status} size="sm" />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {deposit.status !== "failed" && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>컨펌 진행도</span>
              <span>
                {deposit.currentConfirmations}/{deposit.requiredConfirmations}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {getEstimatedTimeText() && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
            <ClockIcon className="h-3 w-3" />
            <span>{getEstimatedTimeText()}</span>
          </div>
        )}

        {/* Transaction Hash */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">TX:</span>
          <div className="flex items-center space-x-1">
            <code className="font-mono text-gray-700">
              {truncateHash(deposit.txHash)}
            </code>
            <button
              onClick={() => window.open(`#`, '_blank')}
              className="p-0.5 text-gray-400 hover:text-gray-600"
              title="블록체인 익스플로러에서 보기"
            >
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-500 mb-1">발신 주소</div>
                <code className="font-mono text-gray-700 break-all">
                  {truncateHash(deposit.fromAddress, 16)}
                </code>
              </div>
              <div>
                <div className="text-gray-500 mb-1">수신 주소</div>
                <code className="font-mono text-gray-700 break-all">
                  {truncateHash(deposit.toAddress, 16)}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-500 mb-1">감지 시간</div>
                <span className="text-gray-700">
                  {formatDateTime(deposit.detectedAt)}
                </span>
              </div>
              {deposit.blockHeight && (
                <div>
                  <div className="text-gray-500 mb-1">블록 높이</div>
                  <span className="font-mono text-gray-700">
                    {deposit.blockHeight.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {deposit.fee && (
              <div>
                <div className="text-gray-500 mb-1 text-xs">네트워크 수수료</div>
                <span className="text-xs font-mono text-gray-700">
                  {deposit.fee} {deposit.asset}
                </span>
              </div>
            )}

            {deposit.failedReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-700 text-xs font-medium mb-1">실패 사유</div>
                <div className="text-red-600 text-xs">{deposit.failedReason}</div>
              </div>
            )}

            {onViewDetails && (
              <button
                onClick={() => onViewDetails(deposit.id)}
                className="w-full mt-3 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                상세 정보 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}