import { WithdrawalStatus } from "@/types/withdrawal";

export interface SecurityProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  statusText: string;
  statusValue: string;
  flowType: "normal" | "exception" | "completed";
  color: string;
}

/**
 * 보안검증 상태인지 확인
 */
export function isSecurityVerification(status: WithdrawalStatus): boolean {
  const securityStatuses = [
    "aml_review",
    "approval_pending",
    "processing",
    "withdrawal_pending",
    "transferring",
    "aml_issue",
  ];
  return securityStatuses.includes(status);
}

/**
 * 보안검증 진행률 정보 반환
 */
export function getSecurityProgress(
  status: WithdrawalStatus
): SecurityProgress | null {
  // 보안검증 상태가 아니면 null 반환
  if (!isSecurityVerification(status)) {
    return null;
  }

  // 정상 플로우 (5단계)
  const normalFlow: Record<
    string,
    { step: number; text: string; percentage: number }
  > = {
    aml_review: { step: 1, text: "AML 검토", percentage: 20 },
    approval_pending: { step: 2, text: "승인 대기", percentage: 40 },
    processing: { step: 3, text: "처리 중", percentage: 60 },
    withdrawal_pending: { step: 4, text: "출금 처리 대기", percentage: 80 },
    transferring: { step: 5, text: "전송 중", percentage: 100 },
  };

  // 예외 플로우 (2단계)
  const exceptionFlow: Record<
    string,
    { step: number; text: string; percentage: number }
  > = {
    aml_review: { step: 1, text: "AML 검토", percentage: 50 },
    aml_issue: { step: 2, text: "AML 문제", percentage: 100 },
  };

  // 정상 플로우 체크
  if (normalFlow[status]) {
    const info = normalFlow[status];
    return {
      currentStep: info.step,
      totalSteps: 5,
      percentage: info.percentage,
      statusText: info.text,
      statusValue: status,
      flowType: "normal",
      color: "bg-blue-500",
    };
  }

  // 예외 플로우 체크 (aml_issue)
  if (status === "aml_issue") {
    const info = exceptionFlow[status];
    return {
      currentStep: info.step,
      totalSteps: 2,
      percentage: info.percentage,
      statusText: info.text,
      statusValue: status,
      flowType: "exception",
      color: "bg-orange-500",
    };
  }

  return null;
}

/**
 * 진행률 바 색상 반환 (Tailwind CSS 클래스)
 */
export function getProgressBarColor(flowType: "normal" | "exception"): string {
  return flowType === "normal"
    ? "bg-blue-500" // 정상 플로우: 파란색
    : "bg-orange-500"; // 예외 플로우: 주황색
}
