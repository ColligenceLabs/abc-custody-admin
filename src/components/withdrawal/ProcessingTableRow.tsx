import { useState, useEffect } from "react";
import { WithdrawalRequest, IndividualWithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "@/utils/withdrawalHelpers";
import { formatAmount } from "@/lib/format";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { getSecurityProgress, isSecurityVerification } from "@/utils/securityProgressHelpers";

interface ProcessingTableRowProps {
  request: WithdrawalRequest | IndividualWithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
  showActions?: boolean; // 작업(상세보기) 컬럼 표시 여부
}

export function ProcessingTableRow({
  request,
  onToggleDetails,
  showActions = true,
}: ProcessingTableRowProps) {
  // 실시간 카운트다운을 위한 state
  const [remainingTime, setRemainingTime] = useState<string>("");

  // 개인회원용 시간 계산 함수
  const calculateRemainingTime = (scheduledAt: string) => {
    const scheduledTime = new Date(scheduledAt);
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();

    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (diffHours >= 24) {
        return "24시간";
      } else if (diffHours > 0) {
        return `${diffHours}시간 ${diffMinutes}분 ${diffSeconds}초`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}분 ${diffSeconds}초`;
      } else {
        return `${diffSeconds}초`;
      }
    }
    return "처리 대기 중...";
  };

  // 실시간 카운트다운 업데이트
  useEffect(() => {
    const individualRequest = request as IndividualWithdrawalRequest;

    // withdrawal_wait 상태일 때 카운트다운 표시
    if (request.status === "withdrawal_wait" && individualRequest.processingScheduledAt) {
      // 초기 시간 설정
      setRemainingTime(calculateRemainingTime(individualRequest.processingScheduledAt));

      // 1초마다 업데이트
      const interval = setInterval(() => {
        const newTime = calculateRemainingTime(individualRequest.processingScheduledAt!);
        setRemainingTime(newTime);

        // 시간이 다 되면 interval 정리
        if (newTime === "처리 대기 중...") {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [request]);

  // Progress 계산 로직
  const getProgressInfo = (request: WithdrawalRequest | IndividualWithdrawalRequest) => {
    if (request.status === "withdrawal_wait") {
      // 개인회원의 경우 실시간 remainingTime 사용
      const eta = remainingTime || "24시간";

      return {
        progress: 0,
        step: "출금 대기",
        eta,
        type: "pending",
      };
    } else if (request.status === "transferring") {
      return {
        progress: 50,
        step: "출금중",
        eta: "",
        type: "transferring",
      };
    } else if (request.status === "processing") {
      // 개인회원의 processingStep 확인
      const individualRequest = request as IndividualWithdrawalRequest;

      if (individualRequest.processingStep === "security_check") {
        return {
          progress: 45,
          step: "보안 검증 중...",
          eta: "",
          type: "processing",
        };
      } else if (individualRequest.processingStep === "blockchain_broadcast") {
        return {
          progress: 70,
          step: "블록체인 전송 중...",
          eta: "",
          type: "processing",
        };
      } else if (individualRequest.processingStep === "confirmation") {
        const confirmations = individualRequest.blockConfirmations || 0;
        return {
          progress: 85,
          step: `컨펌 대기 중 (${confirmations}/12)`,
          eta: "",
          type: "processing",
        };
      }

      // 기본 processing 상태: 보안 검증
      return {
        progress: 45,
        step: "보안 검증",
        eta: "",
        type: "processing",
      };
    } else if (request.status === "success") {
      return {
        progress: 100,
        step: "전송 완료",
        eta: "완료됨",
        type: "completed",
      };
    }
    return {
      progress: 0,
      step: "대기 중",
      eta: "",
      type: "pending",
    };
  };

  const progressInfo = getProgressInfo(request);

  // 개인회원 요청인지 확인
  const isIndividualRequest = (req: WithdrawalRequest | IndividualWithdrawalRequest): req is IndividualWithdrawalRequest => {
    return 'cancellable' in req || 'processingScheduledAt' in req;
  };

  const individualRequest = isIndividualRequest(request) ? request : null;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {request.id}
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {request.title}
          </div>
          <div className="text-sm text-gray-500">
            {request.initiator} | {formatDateTime(request.initiatedAt)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <CryptoIcon
            symbol={request.currency}
            size={24}
            className="flex-shrink-0"
          />
          <div>
            <p className="font-medium text-gray-900">
              {request.currency}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="font-medium text-gray-900">
          {formatAmount(request.amount)}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {(() => {
          // 보안검증 상태인 경우 진행률 바 표시
          if (isSecurityVerification(request.status)) {
            const progress = getSecurityProgress(request.status);
            if (progress) {
              return (
                <div className="w-full min-w-[200px]">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{progress.statusText}</span>
                    <span className="font-semibold">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className={`${progress.color} h-2 rounded-full transition-all`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {progress.currentStep}/{progress.totalSteps} 단계
                  </div>
                </div>
              );
            }
          }

          // 기존 로직 유지
          if (progressInfo.type === "transferring") {
            return (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-sm font-medium text-blue-700">
                  출금중
                </div>
              </div>
            );
          } else if (progressInfo.type === "processing") {
            if (individualRequest?.processingStep) {
              return (
                <div className="text-sm text-gray-700 font-medium">
                  {progressInfo.step}
                </div>
              );
            } else {
              return (
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>처리 진행률</span>
                    <span>{progressInfo.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressInfo.progress}%` }}
                    />
                  </div>
                </div>
              );
            }
          } else if (progressInfo.type === "pending") {
            return (
              <div className="text-sm">
                <p className="font-medium text-yellow-700">
                  대기 중 ({progressInfo.eta})
                </p>
                <p className="text-xs text-gray-500">
                  오출금 방지 기간
                </p>
              </div>
            );
          } else {
            return (
              <div className="text-sm">
                <p className="font-medium text-sky-700">완료</p>
              </div>
            );
          }
        })()}
      </td>
      {showActions && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <button
            onClick={() => {
              console.log('ProcessingTableRow 버튼 클릭:', request.id);
              onToggleDetails(request.id);
            }}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            상세보기
          </button>
        </td>
      )}
    </tr>
  );
}
