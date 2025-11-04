"use client";

import { IndividualWithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";
import {
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

interface WithdrawalTimelineProps {
  withdrawal: IndividualWithdrawalRequest;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: "completed" | "current" | "pending" | "failed";
  icon: React.ReactNode;
}

export default function WithdrawalTimeline({
  withdrawal,
}: WithdrawalTimelineProps) {
  // 남은 대기 시간 계산
  const calculateRemainingTime = () => {
    if (!withdrawal.processingScheduledAt) return "24시간";

    const scheduledTime = new Date(withdrawal.processingScheduledAt);
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();

    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours >= 24) {
        return "24시간";
      } else if (diffHours > 0) {
        return `${diffHours}시간 ${diffMinutes}분`;
      } else {
        return `${diffMinutes}분`;
      }
    }
    return "처리 대기 중...";
  };

  // 보안 검증 단계 설명
  const getSecurityDescription = () => {
    if (withdrawal.status === "aml_review") {
      return "AML 검토 중...";
    } else if (
      withdrawal.status === "processing"
    ) {
      return "출금 처리 대기 중...";
    } else if (
      ["processing", "transferring", "success", "admin_rejected"].includes(
        withdrawal.status
      )
    ) {
      return "검증 완료";
    }
    return "대기 중";
  };

  // 타임라인 단계 생성
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      // 1단계: 24시간 대기
      {
        id: "wait",
        title: "오출금 방지 대기",
        description:
          withdrawal.status === "withdrawal_wait"
            ? `남은 시간: ${calculateRemainingTime()}`
            : "대기 완료",
        timestamp: withdrawal.initiatedAt,
        status:
          withdrawal.status === "withdrawal_wait" ? "current" : "completed",
        icon: <ClockIcon className="h-4 w-4" />,
      },

      // 2단계: 보안 검증 (AML + 승인)
      {
        id: "security",
        title: "보안 검증",
        description: getSecurityDescription(),
        timestamp: undefined, // 개인회원은 별도 타임스탬프 없음
        status: [
          "aml_review"
        ].includes(withdrawal.status)
          ? "current"
          : ["processing", "transferring", "success"].includes(
              withdrawal.status
            )
          ? "completed"
          : "pending",
        icon: <ShieldCheckIcon className="h-4 w-4" />,
      },

      // 3단계: 출금 처리
      {
        id: "processing",
        title: "출금 처리",
        description: ["processing"].includes(
          withdrawal.status
        )
          ? "관리자 승인 대기 중"
          : "처리 완료",
        timestamp: undefined, // 개인회원은 별도 타임스탬프 없음
        status: ["processing"].includes(withdrawal.status)
          ? "current"
          : ["transferring", "success"].includes(withdrawal.status)
          ? "completed"
          : "pending",
        icon: <CogIcon className="h-4 w-4" />,
      },

      // 4단계: 전송 완료
      {
        id: "complete",
        title: "전송 완료",
        description:
          withdrawal.status === "success"
            ? "블록체인 전송 완료"
            : withdrawal.status === "transferring"
            ? "전송 중..."
            : "대기 중",
        timestamp: withdrawal.completedAt,
        status:
          withdrawal.status === "success"
            ? "completed"
            : withdrawal.status === "transferring"
            ? "current"
            : "pending",
        icon: <CheckCircleIcon className="h-4 w-4" />,
      },
    ];

    // 실패 상태인 경우 마지막 단계를 실패로 표시
    if (
      withdrawal.status === "failed" ||
      withdrawal.status === "admin_rejected"
    ) {
      const isAdminRejected = withdrawal.status === "admin_rejected";
      const failedStep: TimelineStep = {
        id: "failed",
        title: isAdminRejected ? "관리자 거부" : "처리 실패",
        description:
          withdrawal.withdrawalStoppedReason ||
          withdrawal.rejectionReason ||
          (isAdminRejected
            ? "관리자에 의해 거부되었습니다"
            : "출금 처리에 실패했습니다"),
        timestamp: withdrawal.rejectedAt || withdrawal.withdrawalStoppedAt,
        status: "failed",
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
      };
      return [...steps.slice(0, -1), failedStep];
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
          line: "bg-sky-300",
        };
      case "current":
        return {
          bg: "bg-blue-100",
          border: "border-blue-200",
          icon: "text-blue-600",
          line: "bg-blue-300",
        };
      case "failed":
        return {
          bg: "bg-red-100",
          border: "border-red-200",
          icon: "text-red-600",
          line: "bg-red-300",
        };
      default:
        // pending
        return {
          bg: "bg-gray-100",
          border: "border-gray-200",
          icon: "text-gray-400",
          line: "bg-gray-200",
        };
    }
  };

  const steps = getTimelineSteps();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">
        처리 진행 상황
      </h4>

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
                  className={`absolute left-6 top-12 w-0.5 h-12 ${
                    colors.line
                  } ${isAnimated ? "animate-pulse" : ""}`}
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
                  <div className={colors.icon}>{step.icon}</div>
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
                  {step.status === "current" && step.id === "wait" && (
                    <div className="mt-2 text-xs text-gray-500">
                      오출금 방지를 위한 대기 기간
                    </div>
                  )}

                  {/* 실패 사유 / 관리자 거부 사유 */}
                  {step.status === "failed" &&
                    (withdrawal.withdrawalStoppedReason ||
                      withdrawal.rejectionReason) && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                        <strong>
                          {withdrawal.status === "admin_rejected"
                            ? "관리자 거부 사유:"
                            : "실패 사유:"}
                        </strong>{" "}
                        {withdrawal.withdrawalStoppedReason ||
                          withdrawal.rejectionReason}
                      </div>
                    )}

                  {/* 대기 순서 */}
                  {step.status === "current" &&
                    step.id === "wait" &&
                    withdrawal.queuePosition && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        대기 순서: {withdrawal.queuePosition}번째
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
