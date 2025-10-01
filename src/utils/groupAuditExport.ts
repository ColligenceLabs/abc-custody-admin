import { GroupAuditEntry } from "@/types/groups";
import { auditActionConfig } from "@/data/groupAuditMockData";

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
 * 변경 내용을 문자열로 변환
 */
const formatChanges = (changes?: { field: string; oldValue: any; newValue: any }[]): string => {
  if (!changes || changes.length === 0) return "";

  return changes
    .map((change) => {
      const fieldName = getFieldDisplayName(change.field);
      const oldValue = formatChangeValue(change.oldValue);
      const newValue = formatChangeValue(change.newValue);

      if (change.oldValue === null || change.oldValue === undefined) {
        return `${fieldName}: ${newValue} (신규)`;
      }

      return `${fieldName}: ${oldValue} → ${newValue}`;
    })
    .join("; ");
};

/**
 * 필드명을 한글로 변환
 */
const getFieldDisplayName = (field: string): string => {
  const fieldMap: { [key: string]: string } = {
    groupName: "그룹명",
    groupType: "그룹유형",
    monthlyBudget: "월예산",
    quarterlyBudget: "분기예산",
    yearlyBudget: "연예산",
    manager: "관리자",
    description: "설명",
    members: "구성원",
    status: "상태"
  };
  return fieldMap[field] || field;
};

/**
 * 변경 값을 문자열로 포맷팅
 */
const formatChangeValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "없음";
  }

  if (typeof value === "object") {
    if (value.amount !== undefined && value.currency !== undefined) {
      return `${value.amount.toLocaleString()} ${value.currency}`;
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return String(value);
};

/**
 * 메타데이터를 문자열로 변환
 */
const formatMetadata = (metadata?: {
  reason?: string;
  ipAddress?: string;
  approvers?: string[];
}): string => {
  if (!metadata) return "";

  const parts: string[] = [];

  if (metadata.reason) {
    parts.push(`사유: ${metadata.reason}`);
  }

  if (metadata.approvers && metadata.approvers.length > 0) {
    parts.push(`승인자: ${metadata.approvers.join(", ")}`);
  }

  if (metadata.ipAddress) {
    parts.push(`IP: ${metadata.ipAddress}`);
  }

  return parts.join("; ");
};

/**
 * 날짜 시간 포맷팅
 */
const formatDateTime = (timestamp: string): string => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
};

/**
 * 그룹 감사 데이터를 CSV 형식으로 내보내기
 */
export const exportGroupAuditToCsv = (
  auditEntries: GroupAuditEntry[],
  filename?: string
) => {
  // CSV 헤더 정의
  const headers = [
    "감사 ID",
    "그룹 ID",
    "그룹명",
    "액션",
    "담당자 ID",
    "담당자명",
    "처리 시간",
    "세부 내용",
    "변경 사항",
    "메타데이터"
  ];

  // CSV 데이터 생성
  const csvData = auditEntries.map((entry) => [
    escapeCsvValue(entry.id),
    escapeCsvValue(entry.groupId),
    escapeCsvValue(entry.groupName),
    escapeCsvValue(auditActionConfig[entry.action]?.name || entry.action),
    escapeCsvValue(entry.userId),
    escapeCsvValue(entry.userName),
    escapeCsvValue(formatDateTime(entry.timestamp)),
    escapeCsvValue(entry.details || ""),
    escapeCsvValue(formatChanges(entry.changes)),
    escapeCsvValue(formatMetadata(entry.metadata))
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
  const defaultFilename = `그룹감사_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.csv`;

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