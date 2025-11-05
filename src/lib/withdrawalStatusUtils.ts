// ============================================================================
// 출금 상태 유틸리티 함수
// ============================================================================
// 용도: 출금 상태 텍스트 및 배지 스타일 관리
// ============================================================================

/**
 * 상태 텍스트 매핑 (12개 상태값)
 */
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    // 기업회원 전용 (3개)
    withdrawal_request: "출금 신청 (결재 대기)",
    withdrawal_rejected: "결재 반려",
    archived: "아카이브",

    // 공통 상태 (9개)
    withdrawal_wait: "출금 대기 (24시간)",
    withdrawal_stopped: "출금 정지",
    aml_review: "AML 검증",
    aml_issue: "AML 이슈",
    processing: "출금 처리 대기",
    transferring: "출금 중",
    success: "출금 완료",
    failed: "출금 실패",
    blockchain_failed: "블록체인 실패 (수동 확인)",
    admin_rejected: "관리자 거부",
  };
  return statusMap[status] || status;
}

/**
 * 상태 배지 색상 (12개 상태값)
 */
function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    // 성공 상태
    case "success":
      return "default";

    // 대기/진행 상태
    case "withdrawal_wait":
    case "aml_review":
    case "withdrawal_request":
      return "secondary";

    case "processing":
    case "transferring":
      return "outline";

    // 실패/거부 상태
    case "failed":
    case "blockchain_failed":
    case "admin_rejected":
    case "withdrawal_rejected":
    case "aml_issue":
      return "destructive";

    // 중립/정지 상태
    case "withdrawal_stopped":
    case "archived":
      return "secondary";

    default:
      return "outline";
  }
}

export { getStatusText, getStatusBadgeVariant };
