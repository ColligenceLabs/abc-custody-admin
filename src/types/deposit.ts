/**
 * 입금 모니터링 시스템 타입 정의
 *
 * 실시간 입금 감지, AML 검증, Travel Rule 준수, 환불 처리 등
 * 모든 입금 관련 타입을 정의합니다.
 */

// ============================================================================
// 기본 타입
// ============================================================================

/**
 * 지원 암호화폐
 * - BTC: Bitcoin (비트코인)
 * - ETH: Ethereum (이더리움 - ERC20)
 * - USDT: Tether USD (ERC20)
 * - USDC: USD Coin (ERC20)
 * - SOL: Solana (솔라나)
 */
export type Currency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL';

// ============================================================================
// 입금 거래 (Deposit Transaction)
// ============================================================================

/**
 * 입금 상태 (백엔드와 일치)
 */
export type DepositStatus =
  | 'detected'     // 입금 감지됨 (블록체인에서 트랜잭션 발견)
  | 'confirming'   // 블록체인 검증중 (컨펌 수 증가 중)
  | 'confirmed'    // 검증 완료 (필요 컨펌 수 도달)
  | 'credited'     // 잔액 반영 완료 (사용자 계정에 입금)
  | 'returned'     // 환불됨
  | 'flagged';     // 플래그됨 (수동 검토 필요)

/**
 * 입금 우선순위
 */
export type DepositPriority =
  | 'low'          // 낮음
  | 'normal'       // 보통
  | 'high'         // 높음
  | 'urgent';      // 긴급

/**
 * 회원 유형
 */
export type MemberType = 'Individual' | 'Corporate';

/**
 * 입금 거래 (백엔드 모델과 일치)
 */
export interface DepositTransaction {
  id: string;
  userId: string;
  organizationId?: string; // 기업회원인 경우 조직 ID
  depositAddressId: string;
  txHash: string;
  asset: string;
  network: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  status: DepositStatus;
  senderVerified: boolean;
  currentConfirmations: number;
  requiredConfirmations: number;
  blockHeight: number;
  detectedAt: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;

  // 사용자 정보 (백엔드 JOIN)
  user?: {
    id: string;
    name: string;
    email: string;
    memberType: string; // 'individual' | 'corporate'
    organizationName?: string; // 기업회원인 경우 조직명
  };

  // 선택적 UI 전용 필드
  memberId?: string;
  memberName?: string;
  memberType?: MemberType;
  amountKRW?: string;
  priority?: DepositPriority;
  timestamp?: string;
  confirmations?: number;

  // 검증 정보
  addressVerification: AddressVerification;
  amlCheck?: AMLCheck;
  travelRuleCheck?: TravelRuleCheck;
  dailyLimitCheck?: DailyLimitCheck;

  // 처리 정보
  processedAt?: string;
  completedAt?: string;
  returnedAt?: string;

  // Hot/Cold 배분 정보 (completed 상태일 때)
  distribution?: {
    hotWalletAmount: string;
    coldWalletAmount: string;
    hotWalletTxHash?: string;
    coldWalletTxHash?: string;
  };

  // 환불 정보 (returned 상태일 때)
  returnInfo?: {
    reason: DepositReturnReason;
    returnTxHash?: string;
    networkFee: string;
    returnedAmount: string;
  };

  // 환불 상태
  returnStatus?: 'none' | 'pending' | 'processing' | 'completed' | 'failed';

  // 플래그 정보 (flagged 상태일 때)
  flagInfo?: {
    reason: string;
    flaggedBy: string;
    flaggedAt: string;
    reviewNotes?: string;
  };
}

// ============================================================================
// 주소 검증 (Address Verification)
// ============================================================================

/**
 * 주소 검증 결과
 */
export interface AddressVerification {
  isRegistered: boolean;             // 회원사 등록 주소 여부
  hasPermission: boolean;            // 입금 권한 여부
  registeredAddressId?: string;      // 등록된 주소 ID
  addressType?: 'personal' | 'vasp'; // 주소 타입
  verificationStatus: 'passed' | 'failed' | 'pending';
  failureReason?: AddressVerificationFailure;
}

/**
 * 주소 검증 실패 사유
 */
export type AddressVerificationFailure =
  | 'unregistered_address'           // 미등록 주소
  | 'no_deposit_permission'          // 입금 권한 없음
  | 'suspended_address'              // 정지된 주소
  | 'blocked_address';               // 차단된 주소

// ============================================================================
// AML 검증 (AML Check)
// ============================================================================

/**
 * AML 검증 결과
 */
export interface AMLCheck {
  riskScore: number;                 // 리스크 점수 (0-100)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isClean: boolean;                  // 깨끗한 주소 여부
  checks: {
    blacklistCheck: boolean;         // 블랙리스트 체크
    sanctionsListCheck: boolean;     // 제재 목록 체크
    pep: boolean;                    // 정치적 주요 인물 (Politically Exposed Person)
    adverseMedia: boolean;           // 부정적 미디어 노출
  };
  flaggedReason?: AMLFlagReason;
  checkedAt: string;
  checkedBy?: string;                // 수동 검토자
  reviewNotes?: string;
}

/**
 * AML 플래그 사유
 */
export type AMLFlagReason =
  | 'high_risk_score'                // 높은 리스크 점수
  | 'blacklist_match'                // 블랙리스트 일치
  | 'sanctions_list'                 // 제재 목록
  | 'pep_match'                      // PEP 일치
  | 'adverse_media'                  // 부정적 미디어
  | 'suspicious_pattern';            // 의심스러운 패턴

// ============================================================================
// Travel Rule 검증
// ============================================================================

/**
 * Travel Rule 검증 결과
 */
export interface TravelRuleCheck {
  isExceeding: boolean;              // 한도 초과 여부 (100만원)
  thresholdKRW: string;              // 한도 (1,000,000원)
  requiresReturn: boolean;           // 환불 필요 여부

  // 주소 타입 및 준수 상태
  addressType?: 'personal' | 'vasp'; // 주소 타입
  complianceStatus?: TravelRuleComplianceStatus;
  violationReason?: TravelRuleViolation;

  // VASP 정보 (addressType이 'vasp'일 때)
  vaspInfo?: {
    name: string;
    hasCompleteInfo: boolean;        // VASP 정보 완전성
    travelRuleCompliant: boolean;    // Travel Rule 준수 여부
  };

  // 송신자 정보 (VASP에서 제공)
  originatorInfo?: {
    vasp?: string;                   // VASP 이름 (deprecated, use vaspInfo instead)
    customerName?: string;
    customerAddress?: string;
    nationality?: string;
    identificationNumber?: string;
    travelRuleCompliant?: boolean;   // (deprecated, use vaspInfo.travelRuleCompliant)
  };

  // 검토 정보
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;

  // Deprecated field for backward compatibility
  reason?: TravelRuleViolation;
}

/**
 * Travel Rule 위반 사유
 */
export type TravelRuleViolation =
  | 'exceeds_threshold_no_info'      // 한도 초과 + 정보 없음
  | 'vasp_not_compliant'             // VASP가 Travel Rule 미준수
  | 'insufficient_originator_info';  // 송신자 정보 부족

// ============================================================================
// 일일 한도 검증 (Daily Limit Check)
// ============================================================================

/**
 * 일일 한도 검증 결과
 */
export interface DailyLimitCheck {
  isExceeding: boolean;              // 한도 초과 여부
  todayUsageKRW: string;             // 오늘 사용한 금액
  dailyLimitKRW: string;             // 일일 한도 (개인: 1,000,000원)
  transactionKRW: string;            // 현재 거래 금액
  remainingLimitKRW: string;         // 남은 한도
  addressType: 'personal' | 'vasp';
}

// ============================================================================
// 입금 환불 (Deposit Return)
// ============================================================================

/**
 * 환불 사유
 */
export type DepositReturnReason =
  | 'member_unregistered_address'    // 회원사 미등록 주소
  | 'no_permission'                  // 권한 없음
  | 'daily_limit_exceeded'           // 일일 한도 초과
  | 'travel_rule_violation'          // Travel Rule 위반
  | 'aml_flag'                       // AML 플래그
  | 'sanctions_list'                 // 제재 목록
  | 'manual_review_rejected';        // 수동 검토 거부

/**
 * 환불 유형
 */
export type ReturnType = 'refund' | 'seizure' | 'transfer';

/**
 * 환불 상태 (백엔드와 일치)
 */
export type ReturnStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * 환불 거래 (백엔드 모델과 일치)
 */
export interface ReturnTransaction {
  id: string;
  depositId: string;
  originalTxHash: string;
  returnType: ReturnType;
  returnAddress: string;
  originalAmount: string;
  networkFee: string | null;
  returnAmount: string;
  returnFee: string | null; // 환불 수수료 (Treasury Vault로 전송되는 금액)
  returnFeeTxHash?: string | null; // 환불 수수료 트랜잭션 해시
  asset: string;
  network: string;
  status: ReturnStatus;
  reason: string;
  returnTxHash?: string | null;
  requestedBy: string;
  approvedBy?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  executedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // 연관 정보 (백엔드 JOIN)
  deposit?: DepositTransaction;

  // UI 전용 필드
  amountKRW?: string;
  returnAmountKRW?: string;
  failureReason?: string;
  errorMessage?: string;
}

// ============================================================================
// 입금 통계 (Deposit Statistics)
// ============================================================================

/**
 * 입금 통계 (백엔드 응답과 일치)
 */
/**
 * 통계 항목
 */
export interface DepositStatItem {
  count: number;
  totalKRW: string;
  trend?: 'up' | 'down' | 'stable';  // 트렌드
  changePercent?: number;             // 변화율
}

/**
 * 입금 통계 (4단계 상태별)
 */
export interface DepositStats {
  detected: DepositStatItem;
  confirming: DepositStatItem;
  confirmed: DepositStatItem;
  credited: DepositStatItem;
}

// ============================================================================
// 입금 필터 (Deposit Filters)
// ============================================================================

/**
 * 입금 필터
 */
export interface DepositFilter {
  status?: DepositStatus[];
  userId?: string;                   // 백엔드와 일치
  memberId?: string;
  memberType?: MemberType[];         // 회원 유형 필터
  asset?: string;                    // 백엔드와 일치 (단일 값)
  priority?: DepositPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: string;
    max: string;
  };
  searchQuery?: string;              // 주소, TxHash 검색
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  hasAMLFlag?: boolean;
  hasTravelRuleIssue?: boolean;
}

// ============================================================================
// 입금 모니터링 대시보드
// ============================================================================

/**
 * 입금 모니터링 대시보드 데이터
 */
export interface DepositMonitoringDashboard {
  stats: DepositStats;
  recentDeposits: DepositTransaction[];
  flaggedDeposits: DepositTransaction[];
  pendingReturns: ReturnTransaction[];

  // 실시간 정보
  lastUpdateTime: string;
  autoRefreshInterval: number;       // 초 단위
}

// ============================================================================
// 입금 상세 정보 (Deposit Details)
// ============================================================================

/**
 * 입금 상세 정보 (모달용)
 */
export interface DepositDetails extends DepositTransaction {
  // 블록체인 정보
  blockNumber?: number;
  blockTime?: string;
  networkFee?: string;

  // 회원사 정보
  memberInfo: {
    id: string;
    companyName: string;
    contactEmail: string;
    riskScore: number;
  };

  // 검증 타임라인
  verificationTimeline: VerificationTimelineItem[];

  // 관련 거래
  relatedTransactions?: {
    previousDeposits: number;
    suspiciousActivity: boolean;
  };
}

/**
 * 검증 타임라인 항목
 */
export type TimelineStatus = 'success' | 'warning' | 'error' | 'info';

export interface VerificationTimelineItem {
  timestamp: string;
  action: string;
  status: TimelineStatus;
  description: string;
  performedBy?: string;
}

// ============================================================================
// API 요청/응답 타입
// ============================================================================

/**
 * 입금 목록 조회 요청
 */
export interface GetDepositsRequest {
  filter?: DepositFilter;
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'amount' | 'status' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 입금 목록 조회 응답
 */
export interface GetDepositsResponse {
  deposits: DepositTransaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 입금 상태 업데이트 요청
 */
export interface UpdateDepositStatusRequest {
  depositId: string;
  newStatus: DepositStatus;
  reason?: string;
  notes?: string;
  performedBy: string;
}

/**
 * 환불 처리 요청
 */
export interface ProcessReturnRequest {
  depositId: string;
  reason: DepositReturnReason;
  notes?: string;
  performedBy: string;
}

// ============================================================================
// 주소 검증 페이지 (Address Verification Page)
// ============================================================================

/**
 * 주소 검증 목록 항목 (테이블용)
 */
export interface AddressVerificationListItem {
  id: string;
  depositId: string;
  txHash: string;
  memberId: string;
  memberName: string;
  asset: Currency;
  amount: string;
  amountKRW: string;
  fromAddress: string;                   // 송신 주소 (검증 대상)
  toAddress: string;                     // 수신 주소 (자동 생성된 입금 주소)
  timestamp: string;

  // 검증 결과
  verificationStatus: 'passed' | 'failed' | 'pending' | 'flagged';
  isRegistered: boolean;                 // 회원사 등록 주소 여부
  hasPermission: boolean;                // 입금 권한 여부
  registeredAddressId?: string;          // 등록된 주소 ID
  addressType?: 'personal' | 'vasp';     // 주소 타입
  failureReason?: AddressVerificationFailure;

  // 플래그 정보
  isFlagged: boolean;
  flaggedAt?: string;
  flaggedBy?: string;
  flagReason?: string;

  // 상태
  depositStatus: DepositStatus;
  priority: DepositPriority;
}

/**
 * 주소 검증 통계
 */
export interface AddressVerificationStats {
  total: {
    count: number;
    volumeKRW: string;
  };
  passed: {
    count: number;
    volumeKRW: string;
    percentage: number;
  };
  unregistered: {
    count: number;
    volumeKRW: string;
    percentage: number;
  };
  noPermission: {
    count: number;
    volumeKRW: string;
    percentage: number;
  };
  flagged: {
    count: number;
    volumeKRW: string;
    percentage: number;
  };

  // 시간대별 통계
  hourly: {
    passed: number;
    failed: number;
  };
}

/**
 * 주소 검증 필터
 */
export interface AddressVerificationFilter {
  verificationStatus?: ('passed' | 'failed' | 'pending' | 'flagged')[];
  isRegistered?: boolean;
  hasPermission?: boolean;
  addressType?: ('personal' | 'vasp')[];
  failureReason?: AddressVerificationFailure[];
  memberId?: string;
  asset?: Currency[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;                  // 주소, TxHash 검색
  isFlagged?: boolean;
}

/**
 * 주소 검증 목록 조회 요청
 */
export interface GetAddressVerificationsRequest {
  filter?: AddressVerificationFilter;
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'amount' | 'verificationStatus';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 주소 검증 목록 조회 응답
 */
export interface GetAddressVerificationsResponse {
  verifications: AddressVerificationListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 주소 플래그 요청
 */
export interface FlagAddressRequest {
  depositId: string;
  address: string;
  reason: string;
  notes?: string;
  performedBy: string;
}

/**
 * 주소 검증 상세 정보
 */
export interface AddressVerificationDetail extends AddressVerificationListItem {
  // 회원사 등록 주소 목록
  memberRegisteredAddresses: {
    id: string;
    label: string;
    address: string;
    type: 'personal' | 'vasp';
    permissions: {
      canDeposit: boolean;
      canWithdraw: boolean;
    };
    status: 'active' | 'suspended' | 'blocked';
    addedAt: string;
  }[];

  // 검증 히스토리
  verificationHistory: {
    timestamp: string;
    action: string;
    status: 'success' | 'warning' | 'error' | 'info';
    description: string;
    performedBy?: string;
  }[];

  // 관련 정보
  relatedInfo: {
    previousDepositsFromAddress: number;
    totalVolumeFromAddress: string;
    lastDepositFromAddress?: string;
  };
}

// ============================================================================
// AML 스크리닝 페이지 (AML Screening Page)
// ============================================================================

/**
 * AML 검토 대기열 항목 (테이블용)
 */
export interface AMLScreeningItem {
  id: string;
  depositId: string;
  txHash: string;
  memberId: string;
  memberName: string;
  asset: Currency;
  amount: string;
  amountKRW: string;
  fromAddress: string;
  timestamp: string;

  // AML 체크 결과
  riskScore: number;                    // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isClean: boolean;
  blacklistMatch: boolean;
  sanctionsMatch: boolean;
  pepMatch: boolean;
  adverseMediaMatch: boolean;

  // 검토 상태
  reviewStatus: 'pending' | 'approved' | 'flagged';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;

  // 입금 상태
  depositStatus: DepositStatus;
  priority: DepositPriority;
}

/**
 * AML 스크리닝 통계
 */
export interface AMLScreeningStats {
  pending: {
    count: number;
    volumeKRW: string;
  };
  highRisk: {
    count: number;
    volumeKRW: string;
    percentage: number;
  };
  flagged: {
    count: number;
    volumeKRW: string;
  };
  reviewedToday: {
    count: number;
    volumeKRW: string;
  };

  // 리스크 분포
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

/**
 * AML 스크리닝 필터
 */
export interface AMLScreeningFilter {
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  reviewStatus?: ('pending' | 'approved' | 'flagged')[];
  hasBlacklistMatch?: boolean;
  hasSanctionsMatch?: boolean;
  hasPEPMatch?: boolean;
  hasAdverseMedia?: boolean;
  memberId?: string;
  asset?: Currency[];
  dateRange?: {
    start: string;
    end: string;
  };
  minRiskScore?: number;
  searchQuery?: string;              // 주소, TxHash 검색
}

/**
 * AML 스크리닝 목록 조회 요청
 */
export interface GetAMLScreeningRequest {
  filter?: AMLScreeningFilter;
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'riskScore' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * AML 스크리닝 목록 조회 응답
 */
export interface GetAMLScreeningResponse {
  items: AMLScreeningItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * AML 검토 액션 요청
 */
export interface AMLReviewActionRequest {
  depositId: string;
  action: 'approve' | 'flag';
  notes?: string;
  performedBy: string;
}

/**
 * AML 스크리닝 상세 정보
 */
export interface AMLScreeningDetail extends AMLScreeningItem {
  // 상세 AML 체크 정보
  amlCheckDetails: {
    blacklistCheck: {
      matched: boolean;
      sources?: string[];
      matchDetails?: string;
    };
    sanctionsListCheck: {
      matched: boolean;
      lists?: string[];        // OFAC, UN, EU 등
      matchDetails?: string;
    };
    pepCheck: {
      matched: boolean;
      position?: string;
      country?: string;
      matchDetails?: string;
    };
    adverseMediaCheck: {
      matched: boolean;
      sources?: string[];
      summary?: string;
    };
  };

  // 검토 히스토리
  reviewHistory: {
    timestamp: string;
    action: string;
    status: 'success' | 'warning' | 'error' | 'info';
    description: string;
    performedBy?: string;
  }[];

  // 관련 정보
  relatedInfo: {
    previousDepositsFromAddress: number;
    totalVolumeFromAddress: string;
    averageRiskScore: number;
    flaggedCount: number;
  };
}

// ============================================================================
// Travel Rule 검증 페이지 (Travel Rule Verification Page)
// ============================================================================

/**
 * Travel Rule 준수 상태
 */
export type TravelRuleComplianceStatus =
  | 'compliant'       // 준수 (VASP 정보 완전)
  | 'non_compliant'   // 위반 (Personal 주소 + 한도 초과 OR VASP 정보 불완전)
  | 'pending'         // 검토 대기
  | 'exempted';       // 면제 (100만원 이하)

/**
 * Travel Rule 검증 목록 항목 (테이블용)
 */
export interface TravelRuleQueueItem {
  id: string;
  depositId: string;
  txHash: string;
  memberId: string;
  memberName: string;
  asset: Currency;
  amount: string;
  amountKRW: string;
  fromAddress: string;
  timestamp: string;

  // Travel Rule 검증 정보
  isExceeding: boolean;                   // 100만원 초과 여부
  thresholdKRW: string;                   // 한도 (1,000,000원)
  addressType: 'personal' | 'vasp';       // 주소 타입
  complianceStatus: TravelRuleComplianceStatus;
  requiresReturn: boolean;                // 환불 필요 여부
  violationReason?: TravelRuleViolation;

  // VASP 정보 (addressType이 'vasp'일 때)
  vaspInfo?: {
    name: string;
    hasCompleteInfo: boolean;             // VASP 정보 완전성
    travelRuleCompliant: boolean;         // Travel Rule 준수 여부
  };

  // 검토 상태
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;

  // 입금 상태
  depositStatus: DepositStatus;
  priority: DepositPriority;
}

/**
 * Travel Rule 검증 통계
 */
export interface TravelRuleStats {
  exceeding: {
    count: number;                        // 100만원 초과 거래 수
    volumeKRW: string;
  };
  requiresCompliance: {
    count: number;                        // 준수 필요 (VASP 정보 제출 필요)
    volumeKRW: string;
    percentage: number;
  };
  violations: {
    count: number;                        // 위반 건수 (환불 대상)
    volumeKRW: string;
    percentage: number;
  };
  compliant: {
    count: number;                        // 준수 완료
    volumeKRW: string;
  };

  // 주소 타입별 분포
  addressTypeDistribution: {
    personal: number;
    vasp: number;
  };
}

/**
 * Travel Rule 검증 필터
 */
export interface TravelRuleFilter {
  complianceStatus?: TravelRuleComplianceStatus[];
  addressType?: ('personal' | 'vasp')[];
  isExceeding?: boolean;                  // 100만원 초과만 보기
  requiresReturn?: boolean;               // 환불 필요만 보기
  violationReason?: TravelRuleViolation[];
  reviewStatus?: ('pending' | 'approved' | 'rejected')[];
  memberId?: string;
  asset?: Currency[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;                   // 주소, TxHash 검색
}

/**
 * Travel Rule 검증 목록 조회 요청
 */
export interface GetTravelRuleQueueRequest {
  filter?: TravelRuleFilter;
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'amount' | 'complianceStatus';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Travel Rule 검증 목록 조회 응답
 */
export interface GetTravelRuleQueueResponse {
  items: TravelRuleQueueItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Travel Rule 준수 승인 요청
 */
export interface ApproveTravelRuleRequest {
  depositId: string;
  notes?: string;
  performedBy: string;
}

/**
 * Travel Rule 환불 트리거 요청
 */
export interface TriggerTravelRuleReturnRequest {
  depositId: string;
  reason: TravelRuleViolation;
  notes?: string;
  performedBy: string;
}

/**
 * Travel Rule 검증 상세 정보 (모달용)
 */
export interface TravelRuleDetail extends TravelRuleQueueItem {
  // 거래 상세 정보
  blockNumber?: number;
  blockTime?: string;
  networkFee?: string;

  // 회원사 정보
  memberInfo: {
    id: string;
    companyName: string;
    contactEmail: string;
    riskScore: number;
  };

  // 상세 VASP 정보 (addressType이 'vasp'일 때)
  vaspDetailInfo?: {
    name: string;
    jurisdiction: string;
    licenseNumber?: string;
    bic?: string;
    address: {
      streetAddress: string;
      city: string;
      country: string;
    };
    contactEmail: string;
    contactPhone?: string;
    travelRuleCompliant: boolean;
    lastComplianceUpdate: string;
  };

  // 송신자 정보 (VASP에서 제공)
  originatorInfo?: {
    customerName?: string;
    customerAddress?: string;
    nationality?: string;
    identificationNumber?: string;
  };

  // 검증 히스토리
  verificationHistory: {
    timestamp: string;
    action: string;
    status: 'success' | 'warning' | 'error' | 'info';
    description: string;
    performedBy?: string;
  }[];

  // 관련 거래 정보
  relatedInfo: {
    previousDepositsFromAddress: number;
    totalVolumeFromAddress: string;
    previousComplianceIssues: number;
  };
}