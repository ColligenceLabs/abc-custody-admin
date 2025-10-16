/**
 * Withdrawal Manager v2 - Type System
 *
 * 출금 관리2 타입 시스템
 * 블록체인별 볼트 관리 및 출금 처리를 위한 타입 정의
 */

// ============================================================================
// 기본 타입 정의
// ============================================================================

/**
 * 네트워크 환경 타입
 * Mainnet: 실 운영 환경
 * Testnet: 테스트 환경 (Ethereum의 경우 Sepolia)
 */
export type NetworkEnvironment = "mainnet" | "testnet";

/**
 * 블록체인 타입
 * 자산으로 자동 판별됨
 */
export type BlockchainType = "BITCOIN" | "ETHEREUM" | "SOLANA";

/**
 * 자산 타입
 */
export type AssetType = "BTC" | "ETH" | "USDT" | "USDC" | "SOL" | "CUSTOM_ERC20";

/**
 * 출금 소스 지갑 (Hot/Cold 선택)
 */
export type WalletSource = "hot" | "cold";

/**
 * 출금 요청 상태 (개선된 7-상태 모델)
 */
export type WithdrawalStatus =
  | "pending"          // 대기 중 (AML 자동 검토 진행 중)
  | "approval_waiting" // 승인 대기 (AML 통과, Hot/Cold 선택 가능)
  | "aml_flagged"      // AML 문제 감지 (수동 검토 필요)
  | "processing"       // 처리 중 (Hot/Cold 외부 시스템 처리)
  | "completed"        // 완료
  | "rejected"         // 거부됨
  | "failed";          // 실패

/**
 * 출금 요청 우선순위
 */
export type WithdrawalPriority = "urgent" | "normal" | "low";

/**
 * 회원 구분 (개인/기업)
 */
export type MemberType = "individual" | "corporate";

/**
 * 리밸런싱 상태
 */
export type RebalancingStatus =
  | "pending" // 대기 중
  | "cold_signing" // Cold → Hot 서명 중
  | "executing" // 실행 중
  | "completed" // 완료
  | "failed"; // 실패

/**
 * Air-gap 서명 상태
 */
export type SigningStatus =
  | "pending" // 대기 중
  | "qr_generated" // QR 코드 생성됨
  | "offline_signed" // 오프라인 서명 완료
  | "online_ready" // 온라인 전송 준비
  | "completed" // 완료
  | "failed"; // 실패

// ============================================================================
// 상수 매핑
// ============================================================================

/**
 * 자산 → 블록체인 매핑 상수
 */
export const ASSET_TO_BLOCKCHAIN: Record<AssetType, BlockchainType> = {
  BTC: "BITCOIN",
  ETH: "ETHEREUM",
  USDT: "ETHEREUM",
  USDC: "ETHEREUM",
  SOL: "SOLANA",
  CUSTOM_ERC20: "ETHEREUM",
} as const;

/**
 * 블록체인 → 네이티브 자산 매핑
 */
export const BLOCKCHAIN_NATIVE_ASSET: Record<BlockchainType, AssetType> = {
  BITCOIN: "BTC",
  ETHEREUM: "ETH",
  SOLANA: "SOL",
} as const;

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 자산별 블록체인 매핑 헬퍼 함수
 * @param asset 자산 타입
 * @returns 해당 자산의 블록체인 타입
 */
export function getBlockchainByAsset(asset: AssetType): BlockchainType {
  return ASSET_TO_BLOCKCHAIN[asset];
}

/**
 * 블록체인별 표시 이름 반환
 * @param blockchain 블록체인 타입
 * @returns 한글 표시 이름
 */
export function getBlockchainDisplayName(blockchain: BlockchainType): string {
  switch (blockchain) {
    case "BITCOIN":
      return "Bitcoin";
    case "ETHEREUM":
      return "Ethereum & ERC20";
    case "SOLANA":
      return "Solana";
  }
}

/**
 * 자산별 표시 이름 반환
 * @param asset 자산 타입
 * @returns 표시 이름
 */
export function getAssetDisplayName(asset: AssetType): string {
  switch (asset) {
    case "BTC":
      return "Bitcoin";
    case "ETH":
      return "Ethereum";
    case "USDT":
      return "Tether USD";
    case "USDC":
      return "USD Coin";
    case "SOL":
      return "Solana";
    case "CUSTOM_ERC20":
      return "Custom ERC20";
  }
}

/**
 * 블록체인의 네이티브 자산 조회
 * @param blockchain 블록체인 타입
 * @returns 네이티브 자산
 */
export function getNativeAsset(blockchain: BlockchainType): AssetType {
  return BLOCKCHAIN_NATIVE_ASSET[blockchain];
}

/**
 * ERC20 토큰 여부 확인
 * @param asset 자산 타입
 * @returns ERC20 토큰 여부
 */
export function isERC20Token(asset: AssetType): boolean {
  return ["USDT", "USDC", "CUSTOM_ERC20"].includes(asset);
}

// ============================================================================
// 볼트 관련 인터페이스
// ============================================================================

/**
 * 자산별 잔고 정보
 */
export interface AssetBalance {
  symbol: AssetType;
  balance: string; // 자산 수량
  valueKRW: string; // 원화 환산 가치
  percentage: number; // 전체 대비 비율 (%)
  contractAddress?: string; // ERC20의 경우 컨트랙트 주소
}

/**
 * 지갑 정보 (Hot 또는 Cold)
 */
export interface WalletInfo {
  totalValueKRW: string; // 총 원화 환산 가치
  assets: AssetBalance[]; // 자산별 잔고 목록
}

/**
 * 블록체인별 볼트 상태
 */
export interface BlockchainVaultStatus {
  blockchain: BlockchainType; // 블록체인 타입
  blockchainName: string; // 표시 이름 (예: "Bitcoin", "Ethereum & ERC20", "Solana")
  network: NetworkEnvironment; // 네트워크 환경 (mainnet | testnet)

  // Hot 지갑 정보
  hotWallet: WalletInfo;

  // Cold 지갑 정보
  coldWallet: WalletInfo;

  // 전체 정보
  totalValueKRW: string; // 전체 원화 환산 가치
  hotRatio: number; // 실제 Hot 비율 (%)
  coldRatio: number; // 실제 Cold 비율 (%)

  // 목표 비율
  targetHotRatio: 20; // 목표 Hot 비율 (%)
  targetColdRatio: 80; // 목표 Cold 비율 (%)

  // 리밸런싱 관련
  deviation: number; // 목표 대비 편차 (%)
  needsRebalancing: boolean; // 리밸런싱 필요 여부
  rebalancingThreshold: number; // 리밸런싱 임계값 (기본: 5%)

  // 마지막 업데이트
  lastUpdated: Date;
}

/**
 * 통합 볼트 상태 (전체 블록체인)
 */
export interface AllVaultsStatus {
  bitcoin: BlockchainVaultStatus;
  ethereum: BlockchainVaultStatus;
  solana: BlockchainVaultStatus;
  totalValueKRW: string; // 전체 볼트 총액
  lastUpdated: Date;
}

// ============================================================================
// 출금 요청 관련 인터페이스
// ============================================================================

/**
 * 볼트 확인 결과
 */
export interface VaultCheckResult {
  blockchain: BlockchainType; // 확인 대상 블록체인
  network: NetworkEnvironment; // 네트워크 환경
  hotSufficient: boolean; // Hot 지갑 잔고 충분 여부
  hotBalance: string; // Hot 지갑 현재 잔고
  requestedAmount: string; // 요청 금액
  rebalancingRequired: boolean; // 리밸런싱 필요 여부
  rebalancingAmount?: string; // 필요한 리밸런싱 금액
  rebalancingAsset?: AssetType; // 리밸런싱 대상 자산
  checkedAt?: Date; // 확인 시각
}

/**
 * Hot 지갑 잔고 확인 결과
 */
export interface HotWalletBalanceCheck {
  asset: AssetType;
  currentBalance: string;
  requestedAmount: string;
  afterBalance: string;
  isSufficient: boolean;
  shortfall?: string;
  currentHotRatio: number;
  afterHotRatio: number;
  needsRebalancing: boolean;
  deviation: number;
}

/**
 * Cold 지갑 잔고 정보
 */
export interface ColdWalletBalanceInfo {
  asset: AssetType;
  currentBalance: string;
  isSufficient: boolean;
}

/**
 * AML 검토 정보 (개선된 버전)
 */
export interface AMLReview {
  reviewId: string;
  status: "passed" | "flagged";
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  flaggedReasons?: string[];
  reviewedAt: Date;
  notes?: string;
}

/**
 * 거부 정보
 */
export interface RejectionInfo {
  rejectedBy: string;
  rejectedAt: Date;
  reason: string;
  relatedAMLIssue?: boolean;
}

/**
 * MPC 지갑 실행 정보
 */
export interface MPCWalletExecution {
  mpcRequestId: string;
  initiatedAt: Date;
  callbackReceivedAt?: Date;
  status: "pending" | "success" | "failed";
  txHash?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Air-gap 서명 정보
 */
export interface AirGapSigningInfo {
  signingId: string; // 서명 작업 ID
  status: SigningStatus; // 서명 상태
  qrCodeData?: string; // QR 코드 데이터 (오프라인 전송용)
  signedData?: string; // 서명된 데이터 (온라인 전송용)
  createdAt: Date; // 생성 시각
  completedAt?: Date; // 완료 시각
}

/**
 * 출금 실행 정보
 */
export interface WithdrawalExecution {
  txHash?: string; // 트랜잭션 해시
  executedAt?: Date; // 실행 시각
  confirmedAt?: Date; // 컨펌 시각
  confirmations?: number; // 컨펌 횟수
  gasUsed?: string; // 사용된 가스 (Ethereum, Solana)
  gasFee?: string; // 가스 비용
  finalAmount?: string; // 최종 출금 금액 (수수료 차감 후)
}

/**
 * 출금 요청 (Withdrawal Manager v2 - 개선된 버전)
 */
export interface WithdrawalV2Request {
  // 기본 정보
  id: string;
  memberId: string;
  memberName: string;
  memberType: MemberType;
  amount: string;
  asset: AssetType;
  blockchain: BlockchainType;
  network: NetworkEnvironment;
  toAddress: string;
  createdAt: Date;
  updatedAt: Date;

  // 상태
  status: WithdrawalStatus;

  // 우선순위
  priority: WithdrawalPriority;

  // 출금 소스 (Hot/Cold) - approval_waiting 이후 설정됨
  walletSource?: WalletSource;

  // AML 검토 (자동 검토 결과)
  amlReview?: AMLReview;

  // Hot/Cold 지갑 잔고 확인 (approval_waiting 상태에서 표시)
  hotWalletCheck?: HotWalletBalanceCheck;
  coldWalletInfo?: ColdWalletBalanceInfo;

  // MPC 지갑 실행 정보 (Hot/Cold 외부 API 처리)
  mpcExecution?: MPCWalletExecution;

  // 거부 정보
  rejection?: RejectionInfo;

  // 에러 정보
  error?: {
    code: string;
    message: string;
    occurredAt: Date;
  };

  // 완료 정보
  completedAt?: Date;
  txHash?: string;
}

// ============================================================================
// 리밸런싱 관련 인터페이스
// ============================================================================

/**
 * 리밸런싱 요청
 */
export interface RebalancingRequest {
  // 기본 정보
  id: string; // 리밸런싱 작업 ID
  blockchain: BlockchainType; // 대상 블록체인
  network: NetworkEnvironment; // 네트워크 환경
  createdAt: Date; // 생성 시각
  updatedAt: Date; // 업데이트 시각

  // 리밸런싱 정보
  asset: AssetType; // 이동할 자산
  amount: string; // 이동 금액
  direction: "COLD_TO_HOT" | "HOT_TO_COLD"; // 이동 방향

  // 현재 상태
  currentHotRatio: number; // 현재 Hot 비율
  currentColdRatio: number; // 현재 Cold 비율
  targetHotRatio: 20; // 목표 Hot 비율
  targetColdRatio: 80; // 목표 Cold 비율

  // 상태
  status: RebalancingStatus;

  // Air-gap 서명 (Cold → Hot인 경우)
  signing?: AirGapSigningInfo;

  // 실행 정보
  execution?: {
    txHash?: string;
    executedAt?: Date;
    confirmedAt?: Date;
    confirmations?: number;
  };

  // 연결된 출금 요청 (출금으로 인한 리밸런싱인 경우)
  relatedWithdrawalId?: string;

  // 에러 정보
  error?: {
    code: string;
    message: string;
    occurredAt: Date;
  };
}

// ============================================================================
// 대시보드 통계 인터페이스
// ============================================================================

/**
 * 출금 통계
 */
export interface WithdrawalStatistics {
  totalRequests: number; // 전체 요청 수
  pending: number; // 대기 중
  inProgress: number; // 진행 중 (aml_review, vault_check, rebalancing, signing, executing)
  completed: number; // 완료
  failed: number; // 실패
  cancelled: number; // 취소
  totalAmountKRW: string; // 전체 출금 금액 (원화)
}

/**
 * 블록체인별 출금 통계
 */
export interface BlockchainWithdrawalStats {
  blockchain: BlockchainType;
  statistics: WithdrawalStatistics;
  assetBreakdown: {
    asset: AssetType;
    count: number;
    totalAmountKRW: string;
  }[];
}

/**
 * 대시보드 데이터
 */
export interface DashboardData {
  // 볼트 상태
  vaults: AllVaultsStatus;

  // 출금 통계
  withdrawalStats: {
    overall: WithdrawalStatistics;
    byBlockchain: BlockchainWithdrawalStats[];
  };

  // 리밸런싱 알림
  rebalancingAlerts: {
    blockchain: BlockchainType;
    currentDeviation: number;
    needsRebalancing: boolean;
    recommendedAction: string;
  }[];

  // 최근 활동
  recentActivities: {
    id: string;
    type: "withdrawal" | "rebalancing";
    blockchain: BlockchainType;
    asset: AssetType;
    amount: string;
    status: WithdrawalStatus | RebalancingStatus;
    timestamp: Date;
  }[];
}

// ============================================================================
// API 요청/응답 인터페이스
// ============================================================================

/**
 * 출금 요청 생성 요청
 */
export interface CreateWithdrawalRequest {
  memberId: string;
  amount: string;
  asset: AssetType;
  network: NetworkEnvironment;
  toAddress: string;
  memo?: string;
}

/**
 * 리밸런싱 요청 생성 요청
 */
export interface CreateRebalancingRequest {
  blockchain: BlockchainType;
  network: NetworkEnvironment;
  asset: AssetType;
  amount: string;
  direction: "COLD_TO_HOT" | "HOT_TO_COLD";
}

/**
 * 볼트 조회 필터
 */
export interface VaultQueryFilter {
  blockchain?: BlockchainType;
  network?: NetworkEnvironment;
}

/**
 * 출금 요청 조회 필터
 */
export interface WithdrawalQueryFilter {
  blockchain?: BlockchainType;
  network?: NetworkEnvironment;
  status?: WithdrawalStatus;
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 리밸런싱 조회 필터
 */
export interface RebalancingQueryFilter {
  blockchain?: BlockchainType;
  network?: NetworkEnvironment;
  status?: RebalancingStatus;
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// V2 대시보드 통합 통계 (설계 문서 Layer 4)
// ============================================================================

/**
 * V2 출금 통계 (개선된 7-상태 모델)
 */
export interface WithdrawalV2Stats {
  pending: number;
  approvalWaiting: number;
  amlFlagged: number;
  processing: number;
  completed: number;
  rejected: number;
  failed: number;
  completedToday: number;
  totalValueTodayKRW: string;
}

/**
 * V2 리밸런싱 통계
 */
export interface RebalancingV2Stats {
  required: number;
  inProgress: number;
  completedToday: number;
  byBlockchain: {
    bitcoin: number;
    ethereum: number;
    solana: number;
  };
}

/**
 * V2 알림 통계
 */
export interface AlertV2Stats {
  urgentWithdrawals: number;
  hotBalanceLow: {
    bitcoin: boolean;
    ethereum: boolean;
    solana: boolean;
  };
  expiringSignatures: number;
}

/**
 * V2 볼트 요약 정보
 */
export interface VaultV2Summary {
  network: NetworkEnvironment;
  totalValueKRW: string;
  hotTotalKRW: string;
  coldTotalKRW: string;
  overallHotRatio: number;
  overallColdRatio: number;
  blockchainsNeedingRebalancing: BlockchainType[];
}

/**
 * V2 통합 대시보드 통계
 * (모든 블록체인 + 출금 + 리밸런싱 + 알림)
 */
export interface WithdrawalV2DashboardStats {
  withdrawals: WithdrawalV2Stats;

  vaults: {
    bitcoin: BlockchainVaultStatus;
    ethereum: BlockchainVaultStatus;
    solana: BlockchainVaultStatus;
  };

  vaultSummary: VaultV2Summary;
  rebalancing: RebalancingV2Stats;
  alerts: AlertV2Stats;

  lastUpdated: Date;
}
