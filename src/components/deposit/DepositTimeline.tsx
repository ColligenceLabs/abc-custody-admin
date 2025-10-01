import { DepositTransaction } from "@/types/deposit";
import { formatDateTime } from "@/utils/depositHelpers";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { EyeIcon } from "@heroicons/react/24/outline";

interface DepositTimelineProps {
  deposit: DepositTransaction;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: "completed" | "current" | "pending" | "failed";
  icon: React.ReactNode;
}

export default function DepositTimeline({ deposit }: DepositTimelineProps) {
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: "detected",
        title: "트랜잭션 감지",
        description: "블록체인에서 트랜잭션을 감지했습니다",
        timestamp: deposit.detectedAt,
        status: "completed",
        icon: <EyeIcon className="h-4 w-4" />
      }
    ];

    // 컨펌 단계
    if (deposit.status !== "failed") {
      steps.push({
        id: "confirming",
        title: "블록 컨펌 진행",
        description: `${deposit.currentConfirmations}/${deposit.requiredConfirmations} 컨펌 완료`,
        timestamp: deposit.currentConfirmations > 0 ? deposit.detectedAt : undefined,
        status: deposit.status === "detected" ? "current" : 
                deposit.currentConfirmations >= deposit.requiredConfirmations ? "completed" : "current",
        icon: <ClockIcon className="h-4 w-4" />
      });
    }

    // 컨펌 완료 단계
    if (deposit.status !== "failed") {
      steps.push({
        id: "confirmed",
        title: "컨펌 완료",
        description: "필요한 컨펌 수를 충족했습니다",
        timestamp: deposit.confirmedAt,
        status: deposit.status === "confirmed" ? "current" :
                deposit.status === "credited" ? "completed" : "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    }

    // 입금 완료 단계
    if (deposit.status !== "failed") {
      steps.push({
        id: "credited",
        title: "입금 완료",
        description: "계정에 입금이 반영되었습니다",
        timestamp: deposit.creditedAt,
        status: deposit.status === "credited" ? "completed" : "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    }

    // 실패 단계 (필요시)
    if (deposit.status === "failed") {
      steps.push({
        id: "failed",
        title: "처리 실패",
        description: deposit.failedReason || "트랜잭션 처리에 실패했습니다",
        timestamp: deposit.detectedAt,
        status: "failed",
        icon: <XCircleIcon className="h-4 w-4" />
      });
    }

    return steps;
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-sky-100",
          border: "border-sky-200",
          icon: "text-sky-600",
          line: "bg-sky-300"
        };
      case "current":
        return {
          bg: "bg-blue-100",
          border: "border-blue-200",
          icon: "text-blue-600",
          line: "bg-blue-300"
        };
      case "failed":
        return {
          bg: "bg-red-100",
          border: "border-red-200",
          icon: "text-red-600",
          line: "bg-red-300"
        };
      default: // pending
        return {
          bg: "bg-gray-100",
          border: "border-gray-200",
          icon: "text-gray-400",
          line: "bg-gray-200"
        };
    }
  };

  const steps = getTimelineSteps();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">처리 진행 상황</h4>
      
      <div className="relative">
        {steps.map((step, index) => {
          const colors = getStepColor(step.status);
          const isLast = index === steps.length - 1;
          const isAnimated = step.status === "current";

          return (
            <div key={step.id} className="relative">
              {/* 연결선 */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-12 ${colors.line} ${
                    isAnimated ? "animate-pulse" : ""
                  }`}
                />
              )}
              
              {/* 스텝 */}
              <div className="flex items-start space-x-4 pb-8">
                {/* 아이콘 */}
                <div
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center
                    ${colors.bg} ${colors.border}
                    ${isAnimated ? "animate-pulse" : ""}
                  `}
                >
                  <div className={colors.icon}>
                    {step.icon}
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-gray-900">
                      {step.title}
                    </h5>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">
                        {formatDateTime(step.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>

                  {/* 현재 단계 추가 정보 */}
                  {step.status === "current" && step.id === "confirming" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>진행도</span>
                        <span>
                          {Math.round((deposit.currentConfirmations / deposit.requiredConfirmations) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((deposit.currentConfirmations / deposit.requiredConfirmations) * 100, 100)}%`
                          }}
                        />
                      </div>
                      {deposit.estimatedTime && deposit.estimatedTime > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          예상 완료: 약 {Math.ceil(deposit.estimatedTime)}분 후
                        </p>
                      )}
                    </div>
                  )}

                  {/* 실패 사유 */}
                  {step.status === "failed" && deposit.failedReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                      <strong>실패 사유:</strong> {deposit.failedReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 트랜잭션 정보 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h5 className="text-sm font-semibold text-gray-900 mb-3">트랜잭션 정보</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">트랜잭션 해시:</span>
            <div className="font-mono text-gray-700 break-all mt-1">
              {deposit.txHash}
            </div>
          </div>
          <div>
            <span className="text-gray-500">네트워크:</span>
            <div className="text-gray-700 mt-1">{deposit.network}</div>
          </div>
          {deposit.blockHeight && (
            <div>
              <span className="text-gray-500">블록 높이:</span>
              <div className="font-mono text-gray-700 mt-1">
                {deposit.blockHeight.toLocaleString()}
              </div>
            </div>
          )}
          {deposit.fee && (
            <div>
              <span className="text-gray-500">네트워크 수수료:</span>
              <div className="font-mono text-gray-700 mt-1">
                {deposit.fee} {deposit.asset}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}