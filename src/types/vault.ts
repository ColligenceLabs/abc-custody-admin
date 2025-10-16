/**
 * Vault Management Types
 * Hot/Cold 지갑 관리 및 모니터링을 위한 타입 정의
 */

export interface VaultStatus {
  totalValue: VaultValue;
  hotWallet: WalletInfo;
  coldWallet: WalletInfo;
  balanceStatus: BalanceStatus;
  lastRebalancing?: RebalancingRecord;
  alerts: VaultAlert[];
  performance: VaultPerformance;
  updatedAt: Date;
}

export interface VaultValue {
  totalInKRW: string;
  totalInUSD: string;
  assetBreakdown: AssetValue[];
}

export interface AssetValue {
  symbol: string;
  name: string;
  balance: string;
  valueInKRW: string;
  valueInUSD: string;
  percentage: number; // % of total portfolio
  priceInKRW: string;
  priceInUSD: string;
  change24h: number; // % change in last 24h
}

export interface WalletInfo {
  type: WalletType;
  totalValue: VaultValue;
  assets: AssetValue[];
  utilizationRate: number; // 0-100%
  status: WalletStatus;
  lastActivity?: Date;
  securityLevel: SecurityLevel;
  address?: string; // For monitoring purposes
  healthScore: number; // 0-100
}

export enum WalletType {
  HOT = "hot",   // Online wallet - 목표 20%
  COLD = "cold"  // Offline wallet - 목표 80%
}

export enum WalletStatus {
  NORMAL = "normal",      // 정상 상태
  LOW = "low",           // 잔액 부족 (하한선 이하)
  HIGH = "high",         // 잔액 과다 (상한선 초과)
  CRITICAL = "critical", // 긴급 조치 필요
  MAINTENANCE = "maintenance" // 유지보수 중
}

export enum SecurityLevel {
  BASIC = "basic",
  STANDARD = "standard",
  HIGH = "high",
  MAXIMUM = "maximum"
}

export interface BalanceStatus {
  hotRatio: number;        // 현재 Hot 지갑 비율 (%)
  coldRatio: number;       // 현재 Cold 지갑 비율 (%)
  targetHotRatio: number;  // 목표 Hot 지갑 비율 (20%)
  targetColdRatio: number; // 목표 Cold 지갑 비율 (80%)
  deviation: number;       // 목표 대비 절대 편차 (%)
  deviationStatus: DeviationStatus;
  needsRebalancing: boolean;
  lastRebalance?: Date;
  nextSuggestedRebalance?: Date;
}

export enum DeviationStatus {
  OPTIMAL = "optimal",     // 목표 비율 유지 (±2% 이내)
  ACCEPTABLE = "acceptable", // 허용 범위 (±5% 이내)
  WARNING = "warning",     // 주의 필요 (±10% 이내)
  CRITICAL = "critical"    // 즉시 조치 필요 (±10% 초과)
}

export interface VaultPerformance {
  uptime: number; // % uptime in last 30 days
  averageTransactionTime: number; // seconds
  totalTransactions24h: number;
  totalVolume24h: string; // KRW
  successRate: number; // % successful transactions
  errorRate: number; // % failed transactions
  securityIncidents: number; // Count in last 30 days
}

// Rebalancing system
export interface RebalancingRecord {
  id: string;
  type: RebalancingType;
  amount: string;
  amountInKRW: string;
  assets: RebalancingAsset[];
  fromWallet: WalletType;
  toWallet: WalletType;
  reason: string;
  priority: RebalancingPriority;
  initiatedBy: string; // Admin user ID
  approvedBy?: string; // Admin user ID
  status: RebalancingStatus;
  createdAt: Date;
  approvedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  txHashes: string[];
  fees: string;
  errorMessage?: string;
  notes?: string;
}

export interface RebalancingAsset {
  symbol: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  txHash?: string;
  status: AssetTransferStatus;
}

export enum AssetTransferStatus {
  PENDING = "pending",
  SIGNING = "signing",
  BROADCASTING = "broadcasting",
  CONFIRMING = "confirming",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum RebalancingType {
  HOT_TO_COLD = "hot_to_cold",       // Hot → Cold 이체
  COLD_TO_HOT = "cold_to_hot",       // Cold → Hot 이체
  EMERGENCY_DRAIN = "emergency_drain", // 긴급 Hot 지갑 비우기
  MANUAL_ADJUST = "manual_adjust"     // 수동 조정
}

export enum RebalancingPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  EMERGENCY = "emergency"
}

export enum RebalancingStatus {
  PENDING = "pending",               // 승인 대기
  APPROVED = "approved",             // 승인됨
  SIGNATURE_REQUIRED = "signature_required", // Air-gap 서명 필요
  PROCESSING = "processing",         // 처리 중
  COMPLETED = "completed",           // 완료
  FAILED = "failed",                // 실패
  CANCELLED = "cancelled",           // 취소
  PARTIALLY_COMPLETED = "partially_completed" // 부분 완료
}

// Vault alerts system
export interface VaultAlert {
  id: string;
  type: VaultAlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata: VaultAlertMetadata;
  threshold?: number;
  currentValue?: number;
  affectedAssets?: string[];
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string; // Admin user ID
  resolvedAt?: Date;
  resolvedBy?: string; // Admin user ID
  isResolved: boolean;
  autoResolve: boolean; // Whether alert can be auto-resolved
  expiresAt?: Date;
}

export interface VaultAlertMetadata {
  walletType?: WalletType;
  assetSymbol?: string;
  previousValue?: string;
  recommendedAction?: string;
  urgencyLevel?: number; // 1-10
  estimatedImpact?: string;
}

export enum VaultAlertType {
  REBALANCING_NEEDED = "rebalancing_needed",
  HOT_WALLET_LOW = "hot_wallet_low",
  HOT_WALLET_HIGH = "hot_wallet_high",
  COLD_WALLET_LOW = "cold_wallet_low",
  UNUSUAL_ACTIVITY = "unusual_activity",
  SECURITY_BREACH = "security_breach",
  SYSTEM_ERROR = "system_error",
  MAINTENANCE_DUE = "maintenance_due",
  PRICE_VOLATILITY = "price_volatility",
  TRANSACTION_FAILED = "transaction_failed",
  CONNECTIVITY_ISSUE = "connectivity_issue"
}

export enum AlertSeverity {
  INFO = "info",         // 🔵 Blue - 정보성
  WARNING = "warning",   // 🟡 Yellow - 주의
  ERROR = "error",       // 🟠 Orange - 오류
  CRITICAL = "critical"  // 🔴 Red - 긴급
}

// Vault metrics and reporting
export interface VaultMetrics {
  timeRange: TimeRange;
  totalValueHistory: ValuePoint[];
  balanceRatioHistory: BalanceRatioPoint[];
  transactionVolumeHistory: VolumePoint[];
  rebalancingFrequency: RebalancingFrequency;
  alertFrequency: AlertFrequency;
  performanceMetrics: VaultPerformanceMetrics;
}

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month"
}

export interface ValuePoint {
  timestamp: Date;
  hotValue: string;
  coldValue: string;
  totalValue: string;
}

export interface BalanceRatioPoint {
  timestamp: Date;
  hotRatio: number;
  coldRatio: number;
  deviation: number;
}

export interface VolumePoint {
  timestamp: Date;
  depositVolume: string;
  withdrawalVolume: string;
  rebalancingVolume: string;
}

export interface RebalancingFrequency {
  totalCount: number;
  averageInterval: number; // hours
  successRate: number; // %
  averageDuration: number; // minutes
}

export interface AlertFrequency {
  totalCount: number;
  byType: Record<VaultAlertType, number>;
  bySeverity: Record<AlertSeverity, number>;
  averageResolutionTime: number; // minutes
}

export interface VaultPerformanceMetrics {
  availability: number; // %
  responseTime: number; // ms
  throughput: number; // transactions per minute
  errorRate: number; // %
  securityScore: number; // 0-100
}

// Asset distribution
export interface AssetDistribution {
  symbol: string;
  name: string;
  hotAmount: string;
  coldAmount: string;
  hotPercentage: number;
  coldPercentage: number;
  totalValue: string;
  optimalHotAmount: string; // Based on 20% target
  optimalColdAmount: string; // Based on 80% target
  rebalanceNeeded: boolean;
  rebalanceAmount?: string;
  rebalanceDirection?: RebalancingType;
}

// Rebalancing requests
export interface RebalancingRequest {
  type: RebalancingType;
  assets: RebalancingAssetRequest[];
  reason: string;
  priority: RebalancingPriority;
  scheduledAt?: Date;
  notes?: string;
}

export interface RebalancingAssetRequest {
  symbol: string;
  amount: string;
  fromWallet: WalletType;
  toWallet: WalletType;
}

// Alert management
export interface AlertSettings {
  hotWalletLowThreshold: number; // % - default 15%
  hotWalletHighThreshold: number; // % - default 25%
  deviationWarningThreshold: number; // % - default 5%
  deviationCriticalThreshold: number; // % - default 10%
  unusualActivityThreshold: number; // % change - default 50%
  autoAcknowledgeInfo: boolean;
  autoResolveResolved: boolean;
  notificationChannels: NotificationChannel[];
}

export interface NotificationChannel {
  type: NotificationChannelType;
  endpoint: string;
  severityFilter: AlertSeverity[];
  enabled: boolean;
}

export enum NotificationChannelType {
  EMAIL = "email",
  SMS = "sms",
  SLACK = "slack",
  WEBHOOK = "webhook",
  TELEGRAM = "telegram"
}

// Air-gap signing system types
export interface AirGapSigningRequest {
  id: string;
  type: SigningRequestType;
  rebalancingId?: string;
  transactions: UnsignedTransaction[];
  requiredSignatures: number;
  obtainedSignatures: number;
  signers: SignerInfo[];
  status: SigningStatus;
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  qrCode?: string; // Base64 encoded QR code
  metadata: Record<string, any>;
}

export interface UnsignedTransaction {
  id: string;
  assetSymbol: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  rawTransaction: string;
  estimatedFee: string;
}

export interface SignedTransaction {
  id: string;
  unsignedTransaction: UnsignedTransaction;
  signature: string;
  signedRawTransaction: string;
  signedBy: string;
  signedAt: string;
}

export interface SignerInfo {
  id: string;
  name: string;
  publicKey: string;
  hasSignedAt?: Date;
  signature?: string;
}

export enum SigningRequestType {
  REBALANCING = "rebalancing",
  EMERGENCY_WITHDRAWAL = "emergency_withdrawal",
  MAINTENANCE = "maintenance"
}

export enum SigningStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETED = "completed",
  EXPIRED = "expired",
  CANCELLED = "cancelled"
}

// Rebalancing management
export interface RebalancingStats {
  currentHotRatio: number;
  currentColdRatio: number;
  deviation: number;
  lastRebalancingDate: Date | null;
  totalRebalancingCount: number;
  pendingCount: number;
  approvedCount: number;
  completedTodayCount: number;
  failedCount: number;
  averageDuration: number; // minutes
}

export interface RebalancingCalculation {
  currentHotValue: string;
  currentColdValue: string;
  currentTotalValue: string;
  targetHotValue: string;
  targetColdValue: string;
  requiredTransferAmount: string;
  direction: RebalancingType;
  estimatedFee: string;
  afterHotRatio: number;
  afterColdRatio: number;
  afterDeviation: number;
}

export interface RebalancingFilter {
  status?: RebalancingStatus[];
  type?: RebalancingType[];
  priority?: RebalancingPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}