import { WithdrawalStatus } from "@/types/withdrawal";
import {
  DocumentTextIcon,
  ArrowUpOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { badgeColors } from "./badgeColors";

export const getStatusInfo = (status: WithdrawalStatus) => {
  const statusConfig = {
    // 신 버전 상태값 (개인 회원용)
    withdrawal_wait: {
      name: "출금 대기",
      color: badgeColors.warning,
      icon: ClockIcon,
    },
    aml_review: {
      name: "보안검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    approval_pending: {
      name: "보안검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    aml_issue: {
      name: "보안검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    transferring: {
      name: "보안검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    processing: {
      name: "보안검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    withdrawal_pending: {
      name: "보안검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    success: {
      name: "출금 완료",
      color: badgeColors.positive,
      icon: CheckCircleIcon,
    },
    failed: {
      name: "실패",
      color: badgeColors.danger,
      icon: XCircleIcon,
    },
    admin_rejected: {
      name: "관리자 거부",
      color: badgeColors.danger,
      icon: XCircleIcon,
    },
    withdrawal_stopped: {
      name: "출금 중지",
      color: badgeColors.danger,
      icon: StopIcon,
    },

    // 기업 회원 전용 상태값
    withdrawal_request: {
      name: "출금 신청",
      color: badgeColors.high,
      icon: DocumentTextIcon,
    },
    withdrawal_reapply: {
      name: "재신청",
      color: badgeColors.high,
      icon: DocumentTextIcon,
    },
    rejected: {
      name: "결재 반려",
      color: badgeColors.danger,
      icon: XCircleIcon,
    },
    archived: {
      name: "아카이브",
      color: badgeColors.neutral,
      icon: ArchiveBoxIcon,
    },

    // 구버전 상태값 (하위 호환성)
    draft: {
      name: "임시저장",
      color: badgeColors.neutral,
      icon: DocumentTextIcon,
    },
    submitted: {
      name: "결재 승인 대기",
      color: badgeColors.high,
      icon: ClockIcon,
    },
    approved: {
      name: "결재 승인",
      color: badgeColors.positive,
      icon: CheckCircleIcon,
    },
    pending: {
      name: "출금 대기",
      color: badgeColors.warning,
      icon: ClockIcon,
    },
    completed: {
      name: "전송 완료",
      color: badgeColors.positive,
      icon: CheckCircleIcon,
    },
    cancelled: {
      name: "취소",
      color: badgeColors.neutral,
      icon: XCircleIcon,
    },
    stopped: {
      name: "출금 중지",
      color: badgeColors.danger,
      icon: StopIcon,
    },
  };
  return statusConfig[status] || statusConfig.withdrawal_wait;
};

export const getPriorityInfo = (priority: string) => {
  const priorityConfig = {
    low: { name: "낮음", color: badgeColors.neutral },
    medium: { name: "보통", color: badgeColors.medium },
    high: { name: "높음", color: badgeColors.high },
    critical: { name: "긴급", color: badgeColors.highest },
  };
  return (
    priorityConfig[priority as keyof typeof priorityConfig] ||
    priorityConfig.medium
  );
};

export const formatCurrency = (amount: number, currency: string) => {
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatAmount = (amount: number, currency: string) => {
  return amount.toLocaleString();
};

export const formatDateTime = (timestamp: string) => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

export const formatDate = (timestamp: string) => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
};

// Transaction 페이지 전용 상태 정보 (색상은 Withdrawal과 동일, 텍스트만 다름)
type TransactionStatus = "completed" | "pending" | "failed";

export const getTransactionStatusInfo = (status: TransactionStatus) => {
  const transactionStatusConfig = {
    completed: {
      name: "완료",
      color: badgeColors.positive,
      icon: CheckCircleIcon,
    },
    pending: {
      name: "대기중",
      color: badgeColors.warning,
      icon: ClockIcon,
    },
    failed: {
      name: "실패",
      color: badgeColors.danger,
      icon: XCircleIcon,
    },
  };
  return transactionStatusConfig[status] || transactionStatusConfig.pending;
};