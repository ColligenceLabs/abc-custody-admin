import { WithdrawalStatus } from "@/types/withdrawal";
import { getSecurityProgress } from "@/utils/securityProgressHelpers";

interface SecurityProgressBarProps {
  status: WithdrawalStatus;
}

export function SecurityProgressBar({ status }: SecurityProgressBarProps) {
  const progress = getSecurityProgress(status);

  // 보안검증 상태가 아니면 렌더링 안함
  if (!progress) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* 헤더 */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900">보안검증 중</div>
        <div className="text-xs text-gray-500">
          {progress.statusText} ({progress.statusValue})
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${progress.color} transition-all duration-300`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* 진행률 정보 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {progress.currentStep}/{progress.totalSteps} 단계
          </span>
          <span className="font-semibold text-gray-900">
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* 플로우 타입 표시 (선택사항) */}
      {progress.flowType === "exception" && (
        <div className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
          예외 처리 플로우
        </div>
      )}
    </div>
  );
}
