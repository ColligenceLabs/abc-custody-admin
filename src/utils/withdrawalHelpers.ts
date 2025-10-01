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

export const getStatusInfo = (status: WithdrawalStatus) => {
  const statusConfig = {
    draft: {
      name: "임시저장",
      color: "bg-gray-50 text-gray-600 border-gray-200",
      icon: DocumentTextIcon,
    },
    submitted: {
      name: "결재 승인 대기",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      icon: ClockIcon,
    },
    approved: {
      name: "결재 승인",
      color: "bg-sky-50 text-sky-600 border-sky-200",
      icon: CheckCircleIcon,
    },
    pending: {
      name: "출금 대기",
      color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      icon: ClockIcon,
    },
    processing: {
      name: "보안 검증",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      icon: CpuChipIcon,
    },
    completed: {
      name: "전송 완료",
      color: "bg-sky-50 text-sky-600 border-sky-200",
      icon: CheckCircleIcon,
    },
    rejected: {
      name: "반려",
      color: "bg-red-50 text-red-600 border-red-200",
      icon: XCircleIcon,
    },
    archived: {
      name: "처리 완료",
      color: "bg-gray-50 text-gray-600 border-gray-200",
      icon: ArchiveBoxIcon,
    },
    cancelled: {
      name: "취소",
      color: "bg-gray-50 text-gray-600 border-gray-200",
      icon: XCircleIcon,
    },
    stopped: {
      name: "출금 정지",
      color: "bg-red-50 text-red-600 border-red-200",
      icon: StopIcon,
    },
  };
  return statusConfig[status] || statusConfig.draft;
};

export const getPriorityInfo = (priority: string) => {
  const priorityConfig = {
    low: { name: "낮음", color: "bg-gray-50 text-gray-600" },
    medium: { name: "보통", color: "bg-purple-50 text-purple-600" },
    high: { name: "높음", color: "bg-blue-50 text-blue-600" },
    critical: { name: "긴급", color: "bg-red-50 text-red-600" },
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