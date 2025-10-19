// ============================================================================
// 출금 상태 유틸리티 함수
// ============================================================================
// 용도: 출금 상태 텍스트 및 배지 스타일 관리
// ============================================================================

/**
 * 상태 텍스트 매핑
 */
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    withdrawal_wait: "출금 대기 (24시간)",
    aml_review: "AML 검토",
    approval_pending: "처리중",
    processing: "출금처리대기",
    withdrawal_pending: "출금대기중",
    transferring: "블록체인 전송 중",
    pending: "대기 중",
    approved: "승인됨",
    signing: "서명 중",
    broadcasting: "브로드캐스트 중",
    confirming: "컨펌 대기 중",
    confirmed: "완료",
    success: "출금 완료",
    failed: "실패",
    rejected: "거부됨",
    admin_rejected: "관리자 거부",
    withdrawal_stopped: "출금 중지",
    aml_issue: "AML 문제 감지",
    withdrawal_request: "출금 신청",
    withdrawal_reapply: "재신청",
    archived: "아카이브",
  };
  return statusMap[status] || status;
}

/**
 * 상태 배지 색상
 */
function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
    case "success":
      return "default";
    case "aml_review":
    case "approval_pending":
      return "secondary";
    case "approved":
    case "signing":
    case "processing":
    case "withdrawal_pending":
    case "pending":
    case "transferring":
    case "broadcasting":
    case "confirming":
      return "outline";
    case "failed":
    case "rejected":
    case "admin_rejected":
      return "destructive";
    case "withdrawal_stopped":
      return "secondary";
    default:
      return "outline";
  }
}

export { getStatusText, getStatusBadgeVariant };
