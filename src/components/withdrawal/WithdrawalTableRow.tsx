import { WithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { ApprovalStatus } from "./ApprovalStatus";
import { formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface WithdrawalTableRowProps {
  request: WithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
  showApprovalProgress?: boolean;
  showApprovalActions?: boolean;
  onApproval?: (requestId: string, action: "approve" | "reject" | "cancel-approve" | "cancel-reject") => void;
  currentUserId?: string;
}

export function WithdrawalTableRow({
  request,
  onToggleDetails,
  showApprovalProgress = true,
  showApprovalActions = false,
  onApproval,
  currentUserId
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
        <StatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {showApprovalProgress && (request.status === "withdrawal_request" || request.status === "processing" || (request.approvals.length === request.requiredApprovals.length && request.rejections.length === 0)) && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {request.approvals.length}/{request.requiredApprovals.length}
              </span>
              {(request.approvals.length === request.requiredApprovals.length && request.rejections.length === 0) && (
                <span className="text-sky-600 font-medium">완료</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  (request.approvals.length === request.requiredApprovals.length && request.rejections.length === 0) ? "bg-sky-500" : "bg-blue-500"
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
          {showApprovalActions && onApproval && (() => {
            const hasAlreadyApproved = !!(currentUserId && request.approvals.some(
              (approval) => approval.userId === currentUserId
            ));
            const hasAlreadyRejected = !!(currentUserId && request.rejections?.some(
              (rejection) => rejection.userId === currentUserId
            ));

            return (
              <>
                <div className="h-4 w-px bg-gray-300"></div>
                {!hasAlreadyApproved && (
                  <button
                    onClick={() => onApproval(request.id, "approve")}
                    className="px-3 py-1 text-xs rounded transition-colors bg-sky-600 text-white hover:bg-sky-700"
                  >
                    승인
                  </button>
                )}
                {hasAlreadyApproved && (
                  <div className="inline-flex items-center text-xs font-medium text-sky-600">
                    <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                    결재 완료
                  </div>
                )}
                {!hasAlreadyApproved && !hasAlreadyRejected && (
                  <button
                    onClick={() => onApproval(request.id, "reject")}
                    className="px-3 py-1 text-xs rounded transition-colors bg-gray-600 text-white hover:bg-gray-700"
                  >
                    반려
                  </button>
                )}
                {hasAlreadyRejected && (
                  <div className="inline-flex items-center text-xs font-medium text-red-600">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    반려 완료
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </td>
    </tr>
  );
}