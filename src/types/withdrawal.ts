// 개인회원 출금 상태 (공통 프로세스)
export type IndividualWithdrawalStatus =
  | "withdrawal_wait"      // 출금 대기 (24시간)
  | "withdrawal_stopped"   // 출금 정지 (사용자가 대기 중 정지)
  | "aml_review"          // AML 검증 중
  | "aml_issue"           // AML 이슈 발생
  | "processing"          // 출금 처리 대기 (관리자 Hot/Cold 선택 대기)
  | "transferring"        // 출금 중 (BlockDaemon 처리 중)
  | "success"             // 출금 성공
  | "failed"              // 출금 실패 (BlockDaemon 실패)
  | "admin_rejected";     // 관리자 거부

// 기업회원 출금 상태 (기업 전용 + 공통)
export type CorporateWithdrawalStatus =
  | IndividualWithdrawalStatus
  | "withdrawal_request"   // 출금 신청 (기업회원 최초 신청)
  | "withdrawal_rejected"  // 결재 반려 (기업회원)
  | "archived";            // 아카이브 처리 (기업회원 종료)

// 통합 출금 상태 (하위 호환성 유지)
export type WithdrawalStatus = IndividualWithdrawalStatus | CorporateWithdrawalStatus;

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

  // 수수료 관련
  withdrawalFee?: number;
  withdrawalFeeType?: 'fixed' | 'percentage';
  netAmount?: number;
  feeTxid?: string;
  feeTxHash?: string;

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
  status: IndividualWithdrawalStatus;
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

  // 출금 중지 정보 (withdrawal_stopped 상태)
  withdrawalStoppedAt?: string;
  withdrawalStoppedReason?: string;
  stoppedBy?: {
    userId: string;
    userName: string;
  };

  // 블록체인 정보
  txHash?: string;
  blockConfirmations?: number;

  // 수수료 관련
  withdrawalFee?: number;
  withdrawalFeeType?: 'fixed' | 'percentage';
  netAmount?: number;
  feeTxid?: string;
  feeTxHash?: string;
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