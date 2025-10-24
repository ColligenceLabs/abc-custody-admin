import { Transaction } from "@/types/transaction";
import { CheckCircleIcon, ClockIcon, XCircleIcon, EyeIcon } from "@heroicons/react/24/solid";

interface TransactionTimelineProps {
  transaction: Transaction;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: "completed" | "current" | "pending" | "failed";
  icon: React.ReactNode;
}

export default function TransactionTimeline({ transaction }: TransactionTimelineProps) {
  const getTimelineSteps = (): TimelineStep[] => {
    if (transaction.type === "deposit") {
      return getDepositSteps();
    } else {
      return getWithdrawalSteps();
    }
  };

  const getDepositSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: "detected",
        title: "트랜잭션 감지",
        description: "블록체인에서 입금 트랜잭션을 감지했습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <EyeIcon className="h-4 w-4" />
      }
    ];

    // 컨펌 단계
    if (transaction.status !== "failed") {
      steps.push({
        id: "confirming",
        title: "블록 컨펌 진행",
        description: transaction.confirmations
          ? `${transaction.confirmations}/12 컨펌 완료`
          : "블록 컨펌을 진행 중입니다",
        timestamp: transaction.timestamp,
        status: transaction.status === "pending" ? "current" : "completed",
        icon: <ClockIcon className="h-4 w-4" />
      });
    }

    // 컨펌 완료 단계
    if (transaction.status === "completed") {
      steps.push({
        id: "confirmed",
        title: "컨펌 완료",
        description: "필요한 블록 컨펌이 완료되었습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    } else if (transaction.status !== "failed") {
      steps.push({
        id: "confirmed",
        title: "컨펌 완료",
        description: "필요한 블록 컨펌이 완료되기를 기다리는 중입니다",
        status: "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    }

    // 입금 완료 단계
    if (transaction.status === "completed") {
      steps.push({
        id: "credited",
        title: "입금 완료",
        description: "계정에 입금이 반영되었습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    } else if (transaction.status !== "failed") {
      steps.push({
        id: "credited",
        title: "입금 완료",
        description: "계정에 입금이 반영될 예정입니다",
        status: "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    }

    // 실패 단계
    if (transaction.status === "failed") {
      steps.push({
        id: "failed",
        title: "처리 실패",
        description: "트랜잭션 처리에 실패했습니다",
        timestamp: transaction.timestamp,
        status: "failed",
        icon: <XCircleIcon className="h-4 w-4" />
      });
    }

    return steps;
  };

  const getWithdrawalSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: "requested",
        title: "출금 요청",
        description: "출금 요청이 접수되었습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <EyeIcon className="h-4 w-4" />
      }
    ];

    // 보안 검증 단계
    if (transaction.status !== "failed") {
      steps.push({
        id: "verification",
        title: "보안 검증",
        description: "AML 및 보안 검증을 진행 중입니다",
        timestamp: transaction.timestamp,
        status: transaction.status === "pending" ? "current" : "completed",
        icon: <ClockIcon className="h-4 w-4" />
      });
    }

    // 승인 완료 단계
    if (transaction.status === "completed") {
      steps.push({
        id: "approved",
        title: "승인 완료",
        description: "출금이 승인되었습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    } else if (transaction.status !== "failed") {
      steps.push({
        id: "approved",
        title: "승인 대기",
        description: "출금 승인을 기다리는 중입니다",
        status: "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    }

    // 블록체인 전송 단계
    if (transaction.status === "completed") {
      steps.push({
        id: "broadcasting",
        title: "블록체인 전송",
        description: "블록체인에 트랜잭션을 전송했습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <ClockIcon className="h-4 w-4" />
      });
    } else if (transaction.status !== "failed") {
      steps.push({
        id: "broadcasting",
        title: "블록체인 전송",
        description: "블록체인 전송 대기 중입니다",
        status: "pending",
        icon: <ClockIcon className="h-4 w-4" />
      });
    }

    // 출금 완료 단계
    if (transaction.status === "completed") {
      steps.push({
        id: "completed",
        title: "출금 완료",
        description: "출금이 성공적으로 완료되었습니다",
        timestamp: transaction.timestamp,
        status: "completed",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    } else if (transaction.status !== "failed") {
      steps.push({
        id: "completed",
        title: "출금 완료",
        description: "출금 완료를 기다리는 중입니다",
        status: "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />
      });
    }

    // 실패 단계
    if (transaction.status === "failed") {
      steps.push({
        id: "failed",
        title: "처리 실패",
        description: "출금 처리에 실패했습니다",
        timestamp: transaction.timestamp,
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

  const formatDateTime = (timestamp: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const steps = getTimelineSteps();

  return (
    <div className="bg-white rounded-lg p-6">
      <h5 className="text-sm font-semibold text-gray-900 mb-6">처리 진행 상황</h5>

      <div className="relative">
        {steps.map((step, index) => {
          const colors = getStepColor(step.status);
          const isLast = index === steps.length - 1;
          const isAnimated = step.status === "current";

          return (
            <div key={step.id} className="relative">
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-12 ${colors.line} ${
                    isAnimated ? "animate-pulse" : ""
                  }`}
                />
              )}

              <div className="flex items-start space-x-4 pb-8">
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h6 className="text-sm font-semibold text-gray-900">
                      {step.title}
                    </h6>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">
                        {formatDateTime(step.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
