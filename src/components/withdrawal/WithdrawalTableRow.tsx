import { WithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { ApprovalStatus } from "./ApprovalStatus";
import { formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface WithdrawalTableRowProps {
  request: WithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
  showApprovalProgress?: boolean;
  showApprovalActions?: boolean;
  onApproval?: (requestId: string, action: "approve" | "reject") => void;
}

export function WithdrawalTableRow({ 
  request, 
  onToggleDetails,
  showApprovalProgress = true,
  showApprovalActions = false,
  onApproval
}: WithdrawalTableRowProps) {
  const approvalProgress = request.requiredApprovals.length > 0 
    ? (request.approvals.length / request.requiredApprovals.length) * 100 
    : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          #{request.id}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {request.title}
          </p>
          <p className="text-sm text-gray-500">
            {request.description}
          </p>
          <p className="text-xs text-gray-400">
            {formatDateTime(request.initiatedAt)}
          </p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <CryptoIcon
            symbol={request.currency}
            size={32}
            className="mr-3 flex-shrink-0"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">
              {formatAmount(request.amount, request.currency)}
            </p>
            <p className="text-gray-500">
              {request.currency}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {request.initiator}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <PriorityBadge priority={request.priority} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {showApprovalProgress && (request.status === "submitted" || request.status === "approved") && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {request.approvals.length}/{request.requiredApprovals.length}
              </span>
              {request.status === "approved" && (
                <span className="text-sky-600 font-medium">완료</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  request.status === "approved" ? "bg-sky-500" : "bg-blue-500"
                }`}
                style={{ width: `${approvalProgress}%` }}
              />
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleDetails(request.id)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            상세보기
          </button>
          {showApprovalActions && onApproval && (
            <>
              <div className="h-4 w-px bg-gray-300"></div>
              <button
                onClick={() => onApproval(request.id, "approve")}
                className="px-3 py-1 bg-sky-600 text-white text-xs rounded hover:bg-sky-700 transition-colors"
              >
                승인
              </button>
              <button
                onClick={() => onApproval(request.id, "reject")}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                반려
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}