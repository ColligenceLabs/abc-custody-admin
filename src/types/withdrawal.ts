export type WithdrawalStatus =
  | "draft" // 임시저장
  | "submitted" // 출금 신청
  | "approved" // 결재 완료
  | "pending" // 출금 대기
  | "processing" // 출금 진행 (Air-gap)
  | "completed" // 출금 완료
  | "rejected" // 반료
  | "archived" // 처리 완료 (반료 후 아카이브)
  | "cancelled" // 취소
  | "stopped"; // 출금 정지

export type UserRole =
  | "initiator"
  | "approver"
  | "required_approver"
  | "operator"
  | "admin";

export type Currency = "BTC" | "ETH" | "USDT" | "USDC" | "KRW";

export interface WithdrawalRequest {
  id: string;
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: Currency;
  groupId: string;
  initiator: string;
  initiatedAt: string;
  status: WithdrawalStatus;
  priority: "low" | "medium" | "high" | "critical";
  description: string;

  // 첨부 파일
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;

  // 결재 관련
  requiredApprovals: string[];
  approvals: Array<{
    userId: string;
    userName: string;
    role: UserRole;
    approvedAt: string;
    signature?: string;
  }>;
  rejections: Array<{
    userId: string;
    userName: string;
    rejectedAt: string;
    reason: string;
  }>;

  // Air-gap 관련
  airGapSessionId?: string;
  securityReviewBy?: string;
  securityReviewAt?: string;
  signatureCompleted?: boolean;
  txHash?: string;
  blockConfirmations?: number;

  // 완료 시간
  completedAt?: string;

  // 재신청 관련
  originalRequestId?: string; // 원본 신청 ID (재신청인 경우)
  reapplicationCount?: number; // 재신청 횟수
  archivedAt?: string; // 아카이브 처리 시간
  archivedBy?: string; // 아카이브 처리자

  // 감사 추적
  auditTrail: Array<{
    timestamp: string;
    action: string;
    userId: string;
    userName?: string;
    details?: string;
    ipAddress?: string;
  }>;
}

export type ServicePlan = "free" | "basic" | "pro" | "premium" | "enterprise" | "individual" | null;

export interface WithdrawalManagementProps {
  plan: ServicePlan;
  initialTab?: "approval" | "airgap" | "audit" | "rejected" | "requests" | "history";
}

// 승인 인증 관련 타입
export type AuthenticationStep = "otp" | "sms" | "complete";

export type AuthenticationStatus = "pending" | "verified" | "failed" | "expired";

export interface ApprovalAuthStep {
  step: AuthenticationStep;
  status: AuthenticationStatus;
  attempts: number;
  maxAttempts: number;
  expiresAt?: string;
  verifiedAt?: string;
}

export interface ApprovalAuthSession {
  requestId: string;
  sessionId: string;
  initiatedAt: string;
  otpAuth: ApprovalAuthStep;
  smsAuth: ApprovalAuthStep;
  isCompleted: boolean;
  completedAt?: string;
  failureReason?: string;
}

export interface UserAuthInfo {
  userId: string;
  userName: string;
  phoneNumber: string;
  hasOtpEnabled: boolean;
  hasSmsEnabled: boolean;
}

// 개인회원 전용 출금 요청 (결재 과정 없음)
export interface IndividualWithdrawalRequest {
  id: string;
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: Currency;
  initiator: string;
  initiatedAt: string;
  status: "pending" | "processing" | "completed" | "rejected" | "cancelled";
  description: string;

  // 진행 상태 세부 정보
  queuePosition?: number; // 대기 순서 (pending 상태일 때)
  processingStep?: "security_check" | "blockchain_broadcast" | "confirmation"; // 처리 단계

  // 24시간 대기 관련 (오출금 방지)
  waitingPeriodHours?: number; // 대기 시간 (시간 단위, 기본 24)
  processingScheduledAt?: string; // 처리 예정 시간 (initiatedAt + 24시간)
  cancellable?: boolean; // 취소 가능 여부

  // 완료/거부/취소 정보
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;

  // 블록체인 정보
  txHash?: string;
  blockConfirmations?: number;
}

// 개인회원 출금 신청 폼 데이터 (priority, attachments 제외)
export interface IndividualWithdrawalFormData {
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  currency: string;
  description: string;
}

// 기업회원 출금 신청 폼 데이터 (priority, attachments 포함)
export interface EnterpriseWithdrawalFormData {
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  currency: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  attachments?: File[];
}