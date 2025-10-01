import { WithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatAmount, formatDateTime, getStatusInfo, getPriorityInfo } from "@/utils/withdrawalHelpers";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface RejectedTableRowProps {
  request: WithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
  onReapplication?: (requestId: string) => void;
  onArchive?: (requestId: string) => void;
}

export function RejectedTableRow({ 
  request, 
  onToggleDetails,
  onReapplication,
  onArchive
}: RejectedTableRowProps) {
  const latestRejection = request.rejections?.[request.rejections.length - 1];
  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

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
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">
          {request.initiator}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <PriorityBadge priority={request.priority} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <StatusIcon className="h-4 w-4 mr-2" />
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              request.status === "archived"
                ? "bg-red-100 text-red-800"
                : statusInfo.color
            }`}
          >
            {request.status === "archived" ? "반려" : statusInfo.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {(request.status === "submitted" ||
          request.status === "approved" ||
          request.status === "rejected" ||
          request.status === "archived") && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {request.status === "rejected" || request.status === "archived"
                  ? `${request.approvals.length + request.rejections.length}/${request.requiredApprovals.length}`
                  : `${request.approvals.length}/${request.requiredApprovals.length}`}
              </span>
              {request.status === "approved" && (
                <span className="text-sky-600 font-medium">완룼</span>
              )}
              {(request.status === "rejected" || request.status === "archived") && (
                <span className="text-red-600 font-medium">반려</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  request.status === "approved"
                    ? "bg-sky-500"
                    : request.status === "rejected" || request.status === "archived"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width:
                    request.status === "rejected" || request.status === "archived"
                      ? `${((request.approvals.length + request.rejections.length) / request.requiredApprovals.length) * 100}%`
                      : `${(request.approvals.length / request.requiredApprovals.length) * 100}%`,
                }}
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

          {request.status === "rejected" && onReapplication && onArchive && (
            <>
              <div className="h-4 w-px bg-gray-300"></div>
              <button
                onClick={() => onReapplication(request.id)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                재신청
              </button>
              <button
                onClick={() => onArchive(request.id)}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                처리완료
              </button>
            </>
          )}

          {request.status === "archived" && (
            <>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded cursor-not-allowed">
                처리완료
              </span>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}