import { WithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";
import { ApproverRoleBadge } from "./ApproverRoleBadge";

interface ApprovalTimelineProps {
  request: WithdrawalRequest;
  showAuditTrail?: boolean;
  compact?: boolean;
}

interface TimelineEvent {
  timestamp: string;
  type: "submitted" | "approved" | "rejected" | "archived" | "completed";
  actor: string;
  action: string;
  details?: string;
}

export function ApprovalTimeline({ 
  request, 
  showAuditTrail = true,
  compact = false
}: ApprovalTimelineProps) {
  
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // 신청 시작
    events.push({
      timestamp: request.initiatedAt,
      type: "submitted",
      actor: request.initiator,
      action: "결재 승인 대기",
      details: request.description
    });
    
    // 승인 이벤트들 (시간순 정렬)
    const sortedApprovals = [...request.approvals].sort((a, b) => 
      new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime()
    );
    
    sortedApprovals.forEach(approval => {
      events.push({
        timestamp: approval.approvedAt,
        type: "approved",
        actor: approval.userName,
        action: "결재 승인"
      });
    });
    
    // 반료 이벤트들 (시간순 정렬)
    const sortedRejections = [...request.rejections].sort((a, b) => 
      new Date(a.rejectedAt).getTime() - new Date(b.rejectedAt).getTime()
    );
    
    sortedRejections.forEach(rejection => {
      events.push({
        timestamp: rejection.rejectedAt,
        type: "rejected",
        actor: rejection.userName,
        action: "결재 반려",
        details: rejection.reason
      });
    });
    
    // 아카이브 이벤트
    if (request.archivedAt && request.archivedBy) {
      events.push({
        timestamp: request.archivedAt,
        type: "archived",
        actor: request.archivedBy,
        action: "처리 완료"
      });
    }
    
    // Audit trail 이벤트 추가 (선택적)
    if (showAuditTrail && request.auditTrail) {
      request.auditTrail.forEach(audit => {
        // 중복 방지: 이미 추가된 승인/반료 이벤트는 제외
        const isDuplicate = events.some(event => 
          event.timestamp === audit.timestamp && 
          event.actor === (audit.userName || '') &&
          (event.action.includes('승인') || event.action.includes('반료'))
        );
        
        if (!isDuplicate) {
          events.push({
            timestamp: audit.timestamp,
            type: audit.action.includes('완료') ? "completed" : 
                  audit.action.includes('승인') ? "approved" :
                  audit.action.includes('반료') ? "rejected" : "submitted",
            actor: audit.userName || 'System',
            action: audit.action,
            details: audit.details
          });
        }
      });
    }
    
    // 시간순 정렬
    return events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };
  
  const getEventIcon = (type: string) => {
    const iconProps = "h-4 w-4";
    
    switch (type) {
      case "submitted":
        return (
          <svg className={`${iconProps} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case "approved":
        return (
          <svg className={`${iconProps} text-sky-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        );
      case "rejected":
        return (
          <svg className={`${iconProps} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "archived":
        return (
          <svg className={`${iconProps} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case "completed":
        return (
          <svg className={`${iconProps} text-sky-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconProps} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  const getEventTextColor = (type: string) => {
    switch (type) {
      case "submitted":
        return "text-blue-700";
      case "approved":
        return "text-sky-700";
      case "rejected":
        return "text-red-700";
      case "archived":
        return "text-gray-700";
      case "completed":
        return "text-sky-700";
      default:
        return "text-gray-700";
    }
  };
  
  const events = generateTimelineEvents();
  
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs">
        {events.slice(0, 3).map((event, index) => (
          <div key={index} className="flex items-center space-x-1" title={`${event.actor}: ${event.action} (${formatDateTime(event.timestamp)})`}>
            {getEventIcon(event.type)}
            <div className={`${getEventTextColor(event.type)} truncate max-w-20`}>
              <ApproverRoleBadge approverName={event.actor} size="sm" />
            </div>
          </div>
        ))}
        {events.length > 3 && (
          <span className="text-gray-400">+{events.length - 3}</span>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h6 className="text-sm font-medium text-gray-700 mb-4">
        결재 진행 타임라인
      </h6>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, eventIdx) => (
            <li key={eventIdx}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      {getEventIcon(event.type)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className={`font-medium ${getEventTextColor(event.type)}`}>
                          {event.actor}
                        </span>
                        <span className="text-gray-500 ml-1">
                          {event.action}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDateTime(event.timestamp)}
                      </p>
                    </div>
                    {event.details && (
                      <div className="mt-2 text-sm text-gray-700">
                        <p className="bg-white p-2 rounded border text-xs">
                          {event.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}