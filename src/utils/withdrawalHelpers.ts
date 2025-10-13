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
    processing: {
      name: "보안 검증",
      color: badgeColors.medium,
      icon: CpuChipIcon,
    },
    completed: {
      name: "전송 완료",
      color: badgeColors.positive,
      icon: CheckCircleIcon,
    },
    rejected: {
      name: "반려",
      color: badgeColors.danger,
      icon: XCircleIcon,
    },
    archived: {
      name: "처리 완료",
      color: badgeColors.neutral,
      icon: ArchiveBoxIcon,
    },
    cancelled: {
      name: "취소",
      color: badgeColors.neutral,
      icon: XCircleIcon,
    },
    stopped: {
      name: "출금 정지",
      color: badgeColors.danger,
      icon: StopIcon,
    },
  };
  return statusConfig[status] || statusConfig.draft;
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