import { WithdrawalRequest, IndividualWithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface ProcessingTableRowProps {
  request: WithdrawalRequest | IndividualWithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
}

export function ProcessingTableRow({
  request,
  onToggleDetails,
}: ProcessingTableRowProps) {
  // 개인회원용 시간 계산 함수
  const calculateRemainingTime = (scheduledAt: string) => {
    const scheduledTime = new Date(scheduledAt);
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

  // Progress 계산 로직
  const getProgressInfo = (request: WithdrawalRequest | IndividualWithdrawalRequest) => {
    if (request.status === "pending") {
      // 개인회원의 경우 processingScheduledAt 사용
      const individualRequest = request as IndividualWithdrawalRequest;
      const eta = individualRequest.processingScheduledAt
        ? calculateRemainingTime(individualRequest.processingScheduledAt)
        : "24시간";

      return {
        progress: 0,
        step: "출금 대기",
        eta,
        type: "pending",
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

      // 기업회원의 경우 기존 로직
      if (request.id === "2" || request.id === "9") {
        return {
          progress: 75,
          step: "보안 검증",
          eta: "약 30분",
          type: "processing",
        };
      }
      return {
        progress: 45,
        step: "보안 검증",
        eta: "약 30분",
        type: "processing",
      };
    } else if (request.status === "completed") {
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
            기안자: {request.initiator} | {formatDateTime(request.initiatedAt)}
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
              {formatAmount(request.amount, request.currency)}{" "}
              {request.currency}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {progressInfo.type === "processing" ? (
          individualRequest?.processingStep ? (
            <div className="text-sm text-gray-700 font-medium">
              {progressInfo.step}
            </div>
          ) : (
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
          )
        ) : progressInfo.type === "pending" ? (
          <div className="text-sm">
            <p className="font-medium text-yellow-700">
              대기 중 ({progressInfo.eta})
            </p>
            <p className="text-xs text-gray-500">
              오출금 방지 기간
            </p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="font-medium text-sky-700">완료</p>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <button
          onClick={() => onToggleDetails(request.id)}
          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
        >
          상세보기
        </button>
      </td>
    </tr>
  );
}
