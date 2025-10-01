import { WithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface ProcessingTableRowProps {
  request: WithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
}

export function ProcessingTableRow({
  request,
  onToggleDetails,
}: ProcessingTableRowProps) {
  // Progress 계산 로직 (원본에서 가져온 것)
  const getProgressInfo = (request: any) => {
    if (request.status === "pending") {
      // 각각 다른 현실적인 대기 시간 표시 (24시간 이내)
      const etaMap: { [key: string]: string } = {
        "2025-09-0005": "17분",
        "2025-09-0006": "12시간 35분",
        "2025-09-0007": "24시간",
      };
      return {
        progress: 0,
        step: "출금 대기",
        eta: etaMap[request.id] || "24시간",
        type: "pending",
      };
    } else if (request.status === "processing") {
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

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">#{request.id}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{request.title}</p>
          <p className="text-sm text-gray-500">
            기안자: {request.initiator} | {formatDateTime(request.initiatedAt)}
          </p>
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
        <StatusBadge status={request.status} text={progressInfo.step} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {progressInfo.type === "processing" ? (
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
        ) : progressInfo.type === "pending" ? (
          <div className="text-sm">
            <p className="font-medium text-yellow-700">
              대기 중 ({progressInfo.eta})
            </p>
            <p className="text-xs text-gray-500">오출금 방지 기간</p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="font-medium text-sky-700">완료</p>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
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
