import { WithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";

interface ApprovalStatusProps {
  request: WithdrawalRequest;
  showDetailedStatus?: boolean;
  showProgressSummary?: boolean;
  compact?: boolean;
}

interface ApprovalState {
  status: "approved" | "rejected" | "blocked" | "waiting" | "ready";
  statusText: string;
  statusTime: string | null;
  iconColor: string;
  textColor: string;
}

export function ApprovalStatus({ 
  request, 
  showDetailedStatus = true,
  showProgressSummary = true,
  compact = false
}: ApprovalStatusProps) {
  
  const getApprovalState = (approver: string, index: number): ApprovalState => {
    const approval = request.approvals.find(a => a.userName === approver);
    const rejection = request.rejections.find(r => r.userName === approver);
    
    // 순차적 결재 로직: 이전 결재자들이 모두 승인했는지 확인
    const previousApprovers = request.requiredApprovals.slice(0, index);
    const allPreviousApproved = previousApprovers.every(prevApprover => 
      request.approvals.some(a => a.userName === prevApprover)
    );
    
    // 이전 결재자가 반려했는지 확인
    const anyPreviousRejected = previousApprovers.some(prevApprover =>
      request.rejections.some(r => r.userName === prevApprover)
    );
    
    // 상태 결정
    if (approval) {
      return {
        status: "approved",
        statusText: "승인 완료",
        statusTime: formatDateTime(approval.approvedAt),
        iconColor: "text-sky-500",
        textColor: "text-sky-700"
      };
    } else if (rejection) {
      return {
        status: "rejected",
        statusText: "반려",
        statusTime: formatDateTime(rejection.rejectedAt),
        iconColor: "text-red-500",
        textColor: "text-red-700"
      };
    } else if (anyPreviousRejected) {
      return {
        status: "blocked",
        statusText: "승인 대기 (반려로 인해 미진행)",
        statusTime: null,
        iconColor: "text-gray-400",
        textColor: "text-gray-500"
      };
    } else if (!allPreviousApproved) {
      return {
        status: "waiting",
        statusText: "승인 대기 (순서 대기)",
        statusTime: null,
        iconColor: "text-gray-400",
        textColor: "text-gray-500"
      };
    } else {
      return {
        status: "ready",
        statusText: "승인 대기 (검토 가능)",
        statusTime: null,
        iconColor: "text-yellow-500",
        textColor: "text-yellow-700"
      };
    }
  };

  const getStatusIcon = (status: string, iconColor: string) => {
    const iconProps = `h-5 w-5 ${iconColor} ${compact ? 'mr-2' : 'mr-3'}`;
    
    switch (status) {
      case "approved":
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case "rejected":
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "ready":
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
          </svg>
        );
    }
  };

  // 컴팩트 모드: 간단한 진행률 표시
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {request.requiredApprovals.map((approver, index) => {
          const state = getApprovalState(approver, index);
          return (
            <div key={approver} className="flex items-center" title={`${approver}: ${state.statusText}`}>
              {getStatusIcon(state.status, state.iconColor)}
              <span className="text-xs ml-1 text-gray-700">{approver}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // 상세 모드: 전체 결재 현황 표시
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h6 className="text-sm font-medium text-gray-700 mb-3">
        필수 결재자 승인 현황
      </h6>
      
      {showDetailedStatus && (
        <div className="space-y-3 mb-4">
          {request.requiredApprovals.map((approver, index) => {
            const state = getApprovalState(approver, index);
            
            return (
              <div
                key={approver}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div className="flex items-center">
                  <div className="flex items-center">
                    {getStatusIcon(state.status, state.iconColor)}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
                      <span className="text-sm text-gray-900 font-medium">{approver}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${state.textColor}`}>
                    {state.statusText}
                  </span>
                  {state.statusTime && (
                    <div className="text-xs text-gray-500">
                      {state.statusTime}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {showProgressSummary && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              승인 진행률: {request.approvals.length}/{request.requiredApprovals.length}
              {request.rejections.length > 0 && ` (반려 ${request.rejections.length}건)`}
            </span>
            <span className={`font-medium ${
              request.status === "rejected" || request.status === "archived" 
                ? "text-red-600" 
                : request.status === "approved" 
                ? "text-sky-600"
                : "text-blue-600"
            }`}>
              {request.status === "rejected" ? "반려됨" 
                : request.status === "archived" ? "아카이브됨"
                : request.status === "approved" ? "승인 완료"
                : "진행 중"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}