// ============================================================================
// 출금 관리 타입 정의
// ============================================================================
// Task 4.1: 출금 요청 처리 시스템
// 용도: 출금 대기열, 우선순위 관리, 주소 검증, 한도 체크
// ============================================================================

/**
 * 출금 상태
 */
export type WithdrawalStatus =
  | "pending" // 대기 중
  | "aml_review" // AML 검토 중
  | "approval_pending" // 승인 대기 중
  | "processing" // 출금 처리 대기
  | "withdrawal_pending" // 출금 대기 중
  | "approved" // 승인됨 (서명 대기)
  | "signing" // 서명 중 (Air-gap)
  | "broadcasting" // 브로드캐스트 중
  | "confirming" // 컨펌 대기 중
  | "confirmed" // 완료
  | "failed" // 실패
  | "rejected"; // 거부됨

/**
 * 출금 우선순위
 */
export type WithdrawalPriority = "urgent" | "normal" | "low";

/**
 * 주소 검증 상태
 */
export type AddressVerificationStatus =
  | "verified" // 검증됨 (등록 주소 + 출금 권한)
  | "unregistered" // 미등록 주소
  | "blocked" // 차단된 주소
  | "no_permission"; // 출금 권한 없음

/**
 * 출금 거부 사유
 */
export type WithdrawalRejectionReason =
  | "unregistered_address" // 미등록 주소
  | "no_withdrawal_permission" // 출금 권한 없음
  | "blocked_address" // 차단된 주소
  | "daily_limit_exceeded" // 일일 한도 초과
  | "insufficient_balance" // 잔액 부족
  | "aml_flagged" // AML 플래그
  | "compliance_violation" // 컴플라이언스 위반
  | "manual_review" // 수동 검토 필요
  | "other"; // 기타

// ============================================================================
// 출금 핵심 타입
// ============================================================================

/**
 * 주소 검증 결과
 */
export interface AddressVerificationResult {
  /** 검증 상태 */
  status: AddressVerificationStatus;

  /** 검증 메시지 */
  message: string;

  /** 주소 정보 (등록된 경우) */
  addressInfo?: {
    /** 주소 ID */
    addressId: string;

    /** 주소 라벨 */
    label: string;

    /** 주소 타입 */
    addressType: "personal" | "corporate";

    /** 등록 일시 */
    registeredAt: string;

    /** 권한 */
    permissions: {
      canDeposit: boolean;
      canWithdraw: boolean;
    };

    /** 상태 */
    status: "active" | "suspended" | "blocked";

    /** 일일 한도 (개인 지갑만) */
    dailyLimit?: string;
  };

  /** 검증 일시 */
  verifiedAt: string;
}

/**
 * 일일 한도 체크 결과
 */
export interface DailyLimitCheck {
  /** 일일 한도 */
  dailyLimit: string;

  /** 오늘 사용한 금액 (완료된 출금) */
  usedToday: string;

  /** 대기 중인 금액 (승인 대기 출금) */
  pendingAmount: string;

  /** 총 사용 금액 (usedToday + pendingAmount) */
  totalUsed: string;

  /** 남은 한도 */
  remainingLimit: string;

  /** 현재 요청 금액 */
  requestAmount: string;

  /** 한도 내 여부 */
  isWithinLimit: boolean;

  /** 사용률 (0-100) */
  usagePercentage: number;

  /** 한도 타입 */
  limitType: "address" | "member" | "asset";

  /** 한도 리셋 시간 */
  resetAt: string;
}

/**
 * 우선순위 변경 이력
 */
export interface PriorityChangeLog {
  /** 변경 ID */
  id: string;

  /** 변경 전 우선순위 */
  fromPriority: WithdrawalPriority;

  /** 변경 후 우선순위 */
  toPriority: WithdrawalPriority;

  /** 변경 사유 */
  reason: string;

  /** 변경한 관리자 */
  changedBy: {
    adminId: string;
    adminName: string;
  };

  /** 변경 일시 */
  changedAt: string;
}

/**
 * AML 검토 결과
 */
export interface WithdrawalAMLReview {
  /** 검토 상태 */
  status: "pending" | "approved" | "flagged";

  /** 리스크 점수 (0-100) */
  riskScore: number;

  /** 제재 목록 체크 결과 */
  sanctionCheck: {
    isOnSanctionList: boolean;
    matchedLists: string[];
  };

  /** 부정적 미디어 체크 */
  adverseMediaCheck: {
    hasNegativeNews: boolean;
    newsCount: number;
  };

  /** 검토자 */
  reviewer?: {
    adminId: string;
    adminName: string;
  };

  /** 검토 일시 */
  reviewedAt?: string;

  /** 검토 메모 */
  notes?: string;
}

/**
 * 출금 요청
 */
export interface Withdrawal {
  /** 출금 ID */
  id: string;

  /** 회원사 ID */
  memberId: string;

  /** 회원사 정보 */
  memberInfo: {
    companyName: string;
    businessNumber: string;
    planType: "basic" | "standard" | "premium" | "enterprise";
  };

  /** 자산 심볼 */
  assetSymbol: string;

  /** 자산 네트워크 */
  network: string;

  /** 출금 금액 */
  amount: string;

  /** 수신 주소 */
  toAddress: string;

  /** 네트워크 수수료 */
  networkFee: string;

  /** 실제 수신 금액 (amount - networkFee) */
  netAmount: string;

  /** 우선순위 */
  priority: WithdrawalPriority;

  /** 우선순위 변경 이력 */
  priorityHistory: PriorityChangeLog[];

  /** 상태 */
  status: WithdrawalStatus;

  /** 주소 검증 결과 */
  addressVerification: AddressVerificationResult;

  /** 일일 한도 체크 결과 */
  limitCheck: DailyLimitCheck;

  /** AML 검토 */
  amlReview: WithdrawalAMLReview;

  /** 요청 일시 */
  requestedAt: string;

  /** 승인 일시 */
  approvedAt?: string;

  /** 승인한 관리자 */
  approvedBy?: {
    adminId: string;
    adminName: string;
  };

  /** 서명 시작 일시 */
  signingStartedAt?: string;

  /** 브로드캐스트 일시 */
  broadcastedAt?: string;

  /** 트랜잭션 해시 */
  txHash?: string;

  /** 완료 일시 */
  confirmedAt?: string;

  /** 거부 일시 */
  rejectedAt?: string;

  /** 거부 사유 */
  rejectionReason?: WithdrawalRejectionReason;

  /** 거부 메모 */
  rejectionNote?: string;

  /** 거부한 관리자 */
  rejectedBy?: {
    adminId: string;
    adminName: string;
  };

  /** 실패 일시 */
  failedAt?: string;

  /** 실패 사유 */
  failureReason?: string;

  /** 대기 시간 (분) */
  waitingTimeMinutes: number;

  /** 메모 */
  notes?: string;
}

// ============================================================================
// 출금 대기열 관련
// ============================================================================

/**
 * 출금 대기열 필터
 */
export interface WithdrawalQueueFilter {
  /** 상태 필터 */
  status?: WithdrawalStatus[];

  /** 우선순위 필터 */
  priority?: WithdrawalPriority[];

  /** 회원사 ID */
  memberId?: string;

  /** 자산 심볼 */
  assetSymbol?: string;

  /** 날짜 범위 */
  dateRange?: {
    from: string;
    to: string;
  };

  /** 검색어 (회원사명, 주소) */
  searchTerm?: string;
}

/**
 * 출금 대기열 정렬
 */
export interface WithdrawalQueueSort {
  /** 정렬 필드 */
  field:
    | "requestedAt"
    | "amount"
    | "priority"
    | "waitingTime"
    | "riskScore"
    | "memberName";

  /** 정렬 방향 */
  direction: "asc" | "desc";
}

/**
 * 출금 통계
 */
export interface WithdrawalStatistics {
  /** 대기 중 */
  pending: {
    count: number;
    totalAmount: string;
  };

  /** AML 검토 중 */
  amlReview: {
    count: number;
    totalAmount: string;
  };

  /** 서명 대기 */
  approved: {
    count: number;
    totalAmount: string;
  };

  /** 오늘 완료 */
  completedToday: {
    count: number;
    totalAmount: string;
  };

  /** 오늘 거부 */
  rejectedToday: {
    count: number;
    totalAmount: string;
  };

  /** 우선순위별 */
  byPriority: {
    urgent: number;
    normal: number;
    low: number;
  };

  /** 평균 처리 시간 (분) */
  averageProcessingTime: number;
}

// ============================================================================
// API 요청/응답 타입
// ============================================================================

/**
 * 출금 승인 요청
 */
export interface ApproveWithdrawalRequest {
  /** 출금 ID */
  withdrawalId: string;

  /** 승인 메모 */
  notes?: string;
}

/**
 * 출금 거부 요청
 */
export interface RejectWithdrawalRequest {
  /** 출금 ID */
  withdrawalId: string;

  /** 거부 사유 */
  reason: WithdrawalRejectionReason;

  /** 거부 메모 */
  note: string;
}

/**
 * 우선순위 변경 요청
 */
export interface UpdatePriorityRequest {
  /** 출금 ID */
  withdrawalId: string;

  /** 새 우선순위 */
  priority: WithdrawalPriority;

  /** 변경 사유 */
  reason: string;
}

/**
 * 주소 검증 요청
 */
export interface VerifyAddressRequest {
  /** 회원사 ID */
  memberId: string;

  /** 주소 */
  address: string;

  /** 네트워크 */
  network: string;
}

/**
 * 한도 체크 요청
 */
export interface CheckLimitRequest {
  /** 회원사 ID */
  memberId: string;

  /** 자산 심볼 */
  assetSymbol: string;

  /** 출금 금액 */
  amount: string;

  /** 주소 (개인 지갑 한도 체크용) */
  address?: string;
}

/**
 * 출금 대기열 응답
 */
export interface WithdrawalQueueResponse {
  /** 출금 목록 */
  withdrawals: Withdrawal[];

  /** 통계 */
  statistics: WithdrawalStatistics;

  /** 총 개수 */
  totalCount: number;

  /** 페이지 정보 */
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================================================
// Task 4.2: 출금 AML 검증 시스템
// ============================================================================

/**
 * AML 검토 상태
 */
export type AMLReviewStatus = "pending" | "approved" | "flagged" | "rejected";

/**
 * 리스크 수준
 */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/**
 * AML 거부 사유
 */
export type AMLRejectionReason =
  | "blacklist" // 블랙리스트 주소
  | "sanctions" // 제재 목록
  | "high_risk" // 높은 리스크 점수
  | "compliance_violation" // 컴플라이언스 위반
  | "manual_decision" // 수동 검토 결정
  | "other"; // 기타

/**
 * 출금 AML 체크
 */
export interface WithdrawalAMLCheck {
  /** 체크 ID */
  id: string;

  /** 출금 ID */
  withdrawalId: string;

  /** 회원사 ID */
  memberId: string;

  /** 회원사 정보 */
  memberInfo: {
    companyName: string;
    businessNumber: string;
  };

  /** 출금 정보 */
  withdrawal: {
    asset: string;
    amount: string;
    amountInKRW: string;
    toAddress: string;
    network: string;
  };

  /** AML 검증 결과 */
  checks: {
    /** 블랙리스트 체크 */
    blacklistCheck: {
      isListed: boolean;
      source?: string;
      details?: string;
    };

    /** 제재 목록 체크 */
    sanctionsCheck: {
      isListed: boolean;
      sanctionType?: string; // OFAC, UN, EU 등
      listName?: string;
    };

    /** 리스크 점수 (0-100) */
    riskScore: number;

    /** 리스크 수준 */
    riskLevel: RiskLevel;

    /** Travel Rule 준수 여부 */
    travelRuleCompliant: boolean;

    /** 주소 타입 */
    addressType: "personal" | "vasp" | "exchange" | "unknown";

    /** PEP (정치적 주요 인물) 체크 */
    pepCheck?: {
      isPEP: boolean;
      pepCategory?: string;
    };

    /** 부정적 미디어 체크 */
    adverseMediaCheck?: {
      hasNegativeNews: boolean;
      newsCount: number;
      severity?: "low" | "medium" | "high";
    };
  };

  /** 추가 플래그 */
  flags: {
    /** 대량 출금 (1억원 이상) */
    isLargeAmount: boolean;

    /** 회원사 등록 주소 확인 */
    registeredAddressVerified: boolean;

    /** 새로운 주소 (첫 출금) */
    isNewAddress: boolean;

    /** 비정상 패턴 감지 */
    unusualPattern: boolean;
  };

  /** 수동 검토 필요 여부 */
  requiresManualReview: boolean;

  /** 검토 상태 */
  status: AMLReviewStatus;

  /** 검토자 정보 */
  reviewer?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
  };

  /** 검토 일시 */
  reviewedAt?: string;

  /** 검토 노트 */
  reviewNotes?: string;

  /** 거부 사유 (거부된 경우) */
  rejectionReason?: AMLRejectionReason;

  /** 거부 상세 설명 */
  rejectionDetails?: string;

  /** 생성 일시 */
  createdAt: string;

  /** 업데이트 일시 */
  updatedAt: string;
}

/**
 * 출금 AML 통계
 */
export interface WithdrawalAMLStats {
  /** 대기 중 */
  pending: {
    count: number;
    totalAmount: string;
  };

  /** 승인됨 */
  approved: {
    count: number;
    totalAmount: string;
  };

  /** 플래그됨 */
  flagged: {
    count: number;
    totalAmount: string;
  };

  /** 거부됨 */
  rejected: {
    count: number;
    totalAmount: string;
  };

  /** 평균 리스크 점수 */
  averageRiskScore: number;

  /** 고위험 건수 (리스크 60 이상) */
  highRiskCount: number;

  /** 대량 출금 건수 (1억원 이상) */
  largeAmountCount: number;
}

/**
 * 출금 AML 필터
 */
export interface WithdrawalAMLFilter {
  /** 상태 필터 */
  status?: AMLReviewStatus[];

  /** 리스크 수준 필터 */
  riskLevel?: RiskLevel[];

  /** 회원사 ID */
  memberId?: string;

  /** 검색어 (회원사명, 주소, TxHash) */
  searchTerm?: string;

  /** 대량 출금만 보기 */
  largeAmountOnly?: boolean;

  /** 수동 검토 필요만 보기 */
  manualReviewOnly?: boolean;
}

/**
 * AML 승인 요청
 */
export interface ApproveAMLRequest {
  /** AML 체크 ID */
  checkId: string;

  /** 검토 노트 */
  reviewNotes: string;
}

/**
 * AML 거부 요청
 */
export interface RejectAMLRequest {
  /** AML 체크 ID */
  checkId: string;

  /** 거부 사유 */
  reason: AMLRejectionReason;

  /** 거부 상세 설명 */
  details: string;

  /** 검토 노트 */
  reviewNotes: string;
}

/**
 * AML 플래그 요청
 */
export interface FlagAMLRequest {
  /** AML 체크 ID */
  checkId: string;

  /** 플래그 사유 */
  reason: string;

  /** 검토 노트 */
  reviewNotes: string;
}

// ============================================================================
// Task 4.4: 출금 실행 모니터링 시스템
// ============================================================================

/**
 * 출금 실행 상태
 */
export type WithdrawalExecutionStatus =
  | "preparing" // 브로드캐스트 준비 중
  | "broadcasting" // 브로드캐스트 중
  | "broadcast_failed" // 브로드캐스트 실패
  | "confirming" // 컨펌 대기 중
  | "confirmed" // 완료
  | "failed"; // 실패

/**
 * 브로드캐스트 실패 유형
 */
export type BroadcastFailureType =
  | "broadcast_failed" // 일반 브로드캐스트 실패
  | "insufficient_fee" // 수수료 부족
  | "network_timeout" // 네트워크 타임아웃
  | "double_spend" // 이중 지불 감지
  | "invalid_transaction"; // 잘못된 트랜잭션

/**
 * 네트워크 혼잡도
 */
export type NetworkCongestion = "low" | "medium" | "high" | "critical";

/**
 * 출금 실행 (브로드캐스트 ~ 컨펌 완료)
 */
export interface WithdrawalExecution {
  /** 실행 ID */
  id: string;

  /** 출금 ID */
  withdrawalId: string;

  /** 회원사 ID */
  memberId: string;

  /** 회원사명 */
  memberName: string;

  /** 자산 심볼 */
  asset: string;

  /** 네트워크 */
  network: string;

  /** 출금 금액 */
  amount: string;

  /** 수신 주소 */
  toAddress: string;

  /** 트랜잭션 해시 */
  txHash?: string;

  /** 네트워크 수수료 */
  networkFee: string;

  /** 실행 상태 */
  status: WithdrawalExecutionStatus;

  /** 컨펌 정보 */
  confirmations: {
    /** 현재 컨펌 수 */
    current: number;

    /** 필요 컨펌 수 */
    required: number;

    /** 진행률 (0-100) */
    progress: number;
  };

  /** 재시도 정보 */
  retryInfo?: {
    /** 현재 시도 횟수 */
    attempt: number;

    /** 최대 시도 횟수 */
    maxAttempts: number;

    /** 마지막 시도 시간 */
    lastAttemptAt: Date;

    /** 실패 유형 */
    failureType?: BroadcastFailureType;

    /** 다음 시도 예정 시간 */
    nextAttemptAt?: Date;
  };

  /** RBF 정보 (BTC 전용) */
  rbfInfo?: {
    /** 원본 수수료 */
    originalFee: string;

    /** 현재 수수료 */
    currentFee: string;

    /** 수수료 증가 횟수 */
    feeIncreaseCount: number;

    /** 최종 업데이트 시간 */
    lastUpdatedAt: Date;
  };

  /** 브로드캐스트 시작 시간 */
  broadcastStartedAt: Date;

  /** 브로드캐스트 완료 시간 */
  broadcastCompletedAt?: Date;

  /** 완료 시간 */
  confirmedAt?: Date;

  /** 실패 시간 */
  failedAt?: Date;

  /** 실패 사유 */
  failureReason?: string;

  /** 생성 시간 */
  createdAt: Date;

  /** 업데이트 시간 */
  updatedAt: Date;
}

/**
 * 출금 실행 통계
 */
export interface ExecutionStatistics {
  /** 브로드캐스트 중 */
  broadcasting: {
    count: number;
    totalAmount: string;
  };

  /** 컨펌 대기 중 */
  confirming: {
    count: number;
    totalAmount: string;
  };

  /** 오늘 완료 */
  completedToday: {
    count: number;
    totalAmount: string;
  };

  /** 실패 (재시도 필요) */
  failed: {
    count: number;
    totalAmount: string;
  };

  /** 평균 컨펌 시간 (분) */
  averageConfirmationTime: number;

  /** 성공률 (%) */
  successRate: number;
}

/**
 * 네트워크 상태
 */
export interface NetworkStatus {
  /** 네트워크 (BTC/ETH/USDT) */
  network: string;

  /** 혼잡도 */
  congestion: NetworkCongestion;

  /** 현재 가스비/수수료 */
  currentFee: string;

  /** 평균 컨펌 시간 (분) */
  avgConfirmationTime: number;

  /** 대기 중인 트랜잭션 수 */
  pendingTxCount: number;

  /** 블록 높이 */
  blockHeight: number;

  /** 마지막 업데이트 시간 */
  lastUpdatedAt: Date;
}

/**
 * 출금 실행 필터
 */
export interface ExecutionFilter {
  /** 상태 필터 */
  status?: WithdrawalExecutionStatus[];

  /** 자산 필터 */
  asset?: string[];

  /** 회원사 ID */
  memberId?: string;

  /** 날짜 범위 */
  dateRange?: {
    from: string;
    to: string;
  };

  /** 검색어 (TxHash, 주소, 회원사명) */
  searchTerm?: string;

  /** 실패만 보기 */
  failedOnly?: boolean;

  /** 재시도 필요만 보기 */
  retryNeededOnly?: boolean;
}

/**
 * 출금 실행 정렬
 */
export interface ExecutionSort {
  /** 정렬 필드 */
  field:
    | "broadcastStartedAt"
    | "confirmations"
    | "amount"
    | "networkFee"
    | "asset";

  /** 정렬 방향 */
  direction: "asc" | "desc";
}

/**
 * 브로드캐스트 요청
 */
export interface BroadcastTransactionRequest {
  /** 출금 ID */
  withdrawalId: string;

  /** 서명된 트랜잭션 (Air-gap에서 생성) */
  signedTransaction: string;

  /** 네트워크 수수료 */
  networkFee: string;
}

/**
 * 브로드캐스트 응답
 */
export interface BroadcastTransactionResponse {
  /** 성공 여부 */
  success: boolean;

  /** 트랜잭션 해시 */
  txHash?: string;

  /** 출금 실행 정보 */
  execution?: WithdrawalExecution;

  /** 오류 메시지 */
  error?: string;

  /** 실패 유형 */
  failureType?: BroadcastFailureType;
}

/**
 * 컨펌 상태 응답
 */
export interface ConfirmationStatusResponse {
  /** 트랜잭션 해시 */
  txHash: string;

  /** 현재 컨펌 수 */
  confirmations: number;

  /** 필요 컨펌 수 */
  requiredConfirmations: number;

  /** 진행률 (0-100) */
  progress: number;

  /** 완료 여부 */
  isCompleted: boolean;

  /** 예상 남은 시간 (분) */
  estimatedTimeRemaining?: number;

  /** 블록 정보 */
  blockInfo?: {
    blockNumber: number;
    blockTime: Date;
  };
}

/**
 * 재시도 요청
 */
export interface RetryBroadcastRequest {
  /** 실행 ID */
  executionId: string;

  /** 수수료 증가 (RBF용) */
  increaseFee?: boolean;

  /** 수수료 승수 (기본 1.5배) */
  feeMultiplier?: number;
}

/**
 * 출금 실행 목록 응답
 */
export interface ExecutionListResponse {
  /** 출금 실행 목록 */
  executions: WithdrawalExecution[];

  /** 통계 */
  statistics: ExecutionStatistics;

  /** 총 개수 */
  totalCount: number;

  /** 페이지 정보 */
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
