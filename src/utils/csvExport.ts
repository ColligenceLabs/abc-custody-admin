import { WithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime, getStatusInfo, getPriorityInfo } from "./withdrawalHelpers";

/**
 * CSV에서 특수문자를 이스케이프 처리
 */
const escapeCsvValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);

  // 쉼표, 따옴표, 개행문자가 포함된 경우 따옴표로 감싸고 내부 따옴표는 두 개로 처리
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * 감사 추적 히스토리를 문자열로 변환
 */
const formatAuditTrail = (auditTrail: WithdrawalRequest["auditTrail"]): string => {
  return auditTrail
    .map((entry) => {
      const timestamp = formatDateTime(entry.timestamp);
      const userName = entry.userName || "시스템";
      const details = entry.details ? ` (${entry.details})` : "";
      return `${timestamp}: ${entry.action} - ${userName}${details}`;
    })
    .join("; ");
};

/**
 * 결재자 목록을 문자열로 변환
 */
const formatApprovers = (approvals: WithdrawalRequest["approvals"]): string => {
  return approvals
    .map((approval) => {
      const approvedAt = formatDateTime(approval.approvedAt);
      return `${approval.userName} (${approvedAt})`;
    })
    .join("; ");
};

/**
 * 필수 결재자 목록을 문자열로 변환
 */
const formatRequiredApprovers = (requiredApprovals: string[]): string => {
  return requiredApprovals.join("; ");
};

/**
 * 반려자 목록을 문자열로 변환
 */
const formatRejections = (rejections: WithdrawalRequest["rejections"]): string => {
  return rejections
    .map((rejection) => {
      const rejectedAt = formatDateTime(rejection.rejectedAt);
      return `${rejection.userName} (${rejectedAt}): ${rejection.reason}`;
    })
    .join("; ");
};

/**
 * 출금 감사 데이터를 CSV 형식으로 내보내기
 */
export const exportWithdrawalAuditToCsv = (
  withdrawalRequests: WithdrawalRequest[],
  filename?: string
) => {
  // CSV 헤더 정의
  const headers = [
    "신청 ID",
    "제목",
    "상태",
    "우선순위",
    "출금 금액",
    "통화",
    "출금 주소",
    "입금 주소",
    "기안자",
    "신청 시간",
    "필수 결재자",
    "완료된 결재자",
    "반려자",
    "그룹 ID",
    "설명",
    "Air-gap 세션 ID",
    "보안 검토자",
    "보안 검토 시간",
    "서명 완료 여부",
    "트랜잭션 해시",
    "블록 확인 수",
    "원본 신청 ID",
    "재신청 횟수",
    "아카이브 처리 시간",
    "아카이브 처리자",
    "감사 추적 히스토리"
  ];

  // CSV 데이터 생성
  const csvData = withdrawalRequests.map((request) => [
    escapeCsvValue(request.id),
    escapeCsvValue(request.title),
    escapeCsvValue(getStatusInfo(request.status).name),
    escapeCsvValue(getPriorityInfo(request.priority).name),
    escapeCsvValue(request.amount.toLocaleString()),
    escapeCsvValue(request.currency),
    escapeCsvValue(request.fromAddress),
    escapeCsvValue(request.toAddress),
    escapeCsvValue(request.initiator),
    escapeCsvValue(formatDateTime(request.initiatedAt)),
    escapeCsvValue(formatRequiredApprovers(request.requiredApprovals)),
    escapeCsvValue(formatApprovers(request.approvals)),
    escapeCsvValue(formatRejections(request.rejections)),
    escapeCsvValue(request.groupId),
    escapeCsvValue(request.description),
    escapeCsvValue(request.airGapSessionId || ""),
    escapeCsvValue(request.securityReviewBy || ""),
    escapeCsvValue(request.securityReviewAt ? formatDateTime(request.securityReviewAt) : ""),
    escapeCsvValue(request.signatureCompleted ? "완료" : "미완료"),
    escapeCsvValue(request.txHash || ""),
    escapeCsvValue(request.blockConfirmations || ""),
    escapeCsvValue(request.originalRequestId || ""),
    escapeCsvValue(request.reapplicationCount || ""),
    escapeCsvValue(request.archivedAt ? formatDateTime(request.archivedAt) : ""),
    escapeCsvValue(request.archivedBy || ""),
    escapeCsvValue(formatAuditTrail(request.auditTrail))
  ]);

  // UTF-8 BOM + 헤더 + 데이터 조합
  const csvContent = [
    headers.join(","),
    ...csvData.map(row => row.join(","))
  ].join("\n");

  // UTF-8 BOM 추가 (한글 깨짐 방지)
  const BOM = "\uFEFF";
  const csvWithBom = BOM + csvContent;

  // 파일명 생성
  const now = new Date();
  const defaultFilename = `출금감사_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.csv`;

  // Blob 생성 및 다운로드
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename || defaultFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};