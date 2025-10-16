/**
 * Compliance Types
 * AML, Travel Rule, 컴플라이언스 관련 타입 정의
 */

// AML Check Types for API compatibility
export interface AMLCheck {
  id: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  currency: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  checks: {
    blacklistCheck: boolean;
    sanctionsListCheck: boolean;
    addressType: string;
    geographicRisk: string;
    velocityCheck: boolean;
    patternAnalysis: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'flagged' | 'rejected';
  manualReview: boolean;
  reviewNotes?: string;
  screenedAt: string;
  screenedBy: string;
}

// Additional types for API compatibility
export interface SuspiciousTransaction {
  id: string;
  transactionHash: string;
  type: string;
  amount: string;
  currency: string;
  status: 'pending' | 'under_investigation' | 'reported' | 'dismissed';
  reportStatus: 'draft' | 'pending' | 'submitted' | 'acknowledged';
  flaggedAt: string;
  flaggedBy: string;
  investigatedBy?: string;
  reason: string;
  riskScore: number;
}

export interface BlacklistAddress {
  id: string;
  address: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  source: string;
  addedAt: string;
  addedBy: string;
  isActive: boolean;
}

export interface RiskAssessment {
  id: string;
  entityType: 'member' | 'transaction' | 'address';
  entityId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    factor: string;
    score: number;
    weight: number;
    description: string;
  }>;
  recommendations: string[];
  assessedAt: string;
  assessedBy: string;
  validUntil: string;
  notes: string;
}

export interface STRReport {
  id: string;
  transactionId: string;
  reportType: string;
  reason: string;
  description: string;
  reportedAmount: string;
  reportedCurrency: string;
  involvedAddresses: string[];
  regulatoryBody: string;
  reportStatus: 'draft' | 'pending' | 'submitted' | 'acknowledged';
  submittedAt?: string;
  submittedBy?: string;
  createdAt: string;
  createdBy: string;
  attachments: string[];
}

// API-compatible Travel Rule Check interface
export interface TravelRuleCheckAPI {
  id: string;
  transactionId: string;
  amount: string;
  amountInKRW: string;
  threshold: string;
  isExceeding: boolean;
  fromAddress: string;
  toAddress: string;
  requiresVASPInfo: boolean;
  originatorInfo?: any;
  beneficiaryInfo?: any;
  complianceStatus: string;
  requiresReturn: boolean;
  returnReason?: string;
  checkedAt: string;
  checkedBy: string;
}

// AML (Anti-Money Laundering) 검증
export interface DepositAMLCheck {
  id: string;
  transactionHash: string;
  memberId: string;
  memberName: string;
  fromAddress: string;
  toAddress: string; // 생성된 입금 주소
  amount: string;
  currency: string;
  amountInKRW: string;
  checks: AMLCheckResults;
  travelRuleCheck: TravelRuleCheck;
  addressVerification: AddressVerification;
  decision: ComplianceDecision;
  processedAt: Date;
  completedAt?: Date;
  reviewedBy?: string; // Admin user ID
  reviewedAt?: Date;
  notes?: string;
  escalatedTo?: string; // Senior compliance officer
  escalatedAt?: Date;
}

export interface AMLCheckResults {
  // 기본 스크리닝
  blacklistCheck: {
    isBlacklisted: boolean;
    matchedLists: string[];
    confidence: number; // 0-100
  };
  sanctionsListCheck: {
    isSanctioned: boolean;
    matchedEntities: SanctionEntity[];
    confidence: number; // 0-100
  };
  riskScore: number; // 0-100 전체 위험 점수
  addressRiskAnalysis: AddressRiskAnalysis;
  transactionPatternAnalysis: TransactionPatternAnalysis;
  geoLocationAnalysis: GeoLocationAnalysis;
  overallRisk: RiskLevel;
  recommendations: string[];
  autoProcessable: boolean;
}

export interface SanctionEntity {
  name: string;
  type: EntityType;
  jurisdiction: string;
  sanctionReason: string;
  listName: string;
  addedDate: Date;
}

export enum EntityType {
  INDIVIDUAL = "individual",
  ORGANIZATION = "organization",
  VESSEL = "vessel",
  ADDRESS = "address"
}

export interface AddressRiskAnalysis {
  addressType: AddressClassification;
  previousActivity: {
    transactionCount: number;
    totalVolume: string;
    firstSeen: Date;
    lastSeen: Date;
  };
  associatedEntities: AssociatedEntity[];
  riskFactors: string[];
  trustScore: number; // 0-100
}

export enum AddressClassification {
  UNKNOWN = "unknown",
  PERSONAL = "personal",
  EXCHANGE = "exchange",
  MIXER = "mixer",
  GAMBLING = "gambling",
  DARKNET = "darknet",
  MINING_POOL = "mining_pool",
  MERCHANT = "merchant",
  DEFI = "defi",
  CUSTODIAL = "custodial"
}

export interface AssociatedEntity {
  name?: string;
  type: EntityType;
  relationship: RelationshipType;
  riskLevel: RiskLevel;
}

export enum RelationshipType {
  DIRECT = "direct",
  INDIRECT = "indirect",
  CLUSTER = "cluster",
  CO_SPENDING = "co_spending"
}

export interface TransactionPatternAnalysis {
  frequency: TransactionFrequency;
  timing: TransactionTiming;
  amounts: AmountAnalysis;
  structuringRisk: StructuringRisk;
  velocityRisk: VelocityRisk;
}

export interface TransactionFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  isUnusual: boolean;
  baseline: number;
  deviationScore: number; // 0-100
}

export interface TransactionTiming {
  timestamp: Date;
  timezone: string;
  isBusinessHours: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  suspiciousTiming: boolean;
}

export interface AmountAnalysis {
  roundAmount: boolean; // Exact round numbers (suspicious)
  justBelowThreshold: boolean; // Just below reporting threshold
  amountPattern: AmountPattern;
  historicalComparison: {
    percentile: number; // Where this amount sits in historical data
    isOutlier: boolean;
  };
}

export enum AmountPattern {
  NORMAL = "normal",
  ROUND_NUMBERS = "round_numbers",
  THRESHOLD_AVOIDANCE = "threshold_avoidance",
  PROGRESSIVE_INCREASE = "progressive_increase",
  SMURFING = "smurfing"
}

export interface StructuringRisk {
  isStructuring: boolean;
  confidence: number; // 0-100
  relatedTransactions: string[]; // Related transaction hashes
  timeWindow: number; // minutes between related transactions
  totalAmount: string;
  averageAmount: string;
}

export interface VelocityRisk {
  isHighVelocity: boolean;
  transactionsIn24h: number;
  volumeIn24h: string;
  velocityScore: number; // 0-100
  normalBaseline: number;
}

export interface GeoLocationAnalysis {
  country?: string;
  region?: string;
  riskLevel: CountryRiskLevel;
  isHighRiskJurisdiction: boolean;
  sanctionedCountry: boolean;
  fatfGrayList: boolean;
  travelRuleCompliant: boolean;
}

export enum CountryRiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  PROHIBITED = "prohibited"
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Travel Rule 검증
export interface TravelRuleCheck {
  id: string;
  transactionId: string;
  isRequired: boolean; // Amount > 1M KRW
  amount: string;
  amountInKRW: string;
  threshold: string; // "1000000"
  thresholdCurrency: string; // "KRW"
  isCompliant: boolean;
  vaspInfo?: VaspTravelRuleInfo;
  originatorInfo?: OriginatorInfo;
  beneficiaryInfo?: BeneficiaryInfo;
  missingInfo: string[];
  exemptionReason?: TravelRuleExemption;
  requiresReturn: boolean;
  returnReason?: TravelRuleViolationType;
  processedAt: Date;
  expiresAt?: Date;
}

export interface VaspTravelRuleInfo {
  name: string;
  jurisdiction: string;
  licenseNumber?: string;
  bic?: string; // Bank Identifier Code
  legalEntityIdentifier?: string;
  address: VaspAddress;
  isRegistered: boolean;
  complianceContact: ContactInfo;
  technologyProvider?: string;
  lastComplianceUpdate: Date;
}

export interface VaspAddress {
  streetAddress: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface OriginatorInfo {
  name?: string;
  address?: CustomerAddress;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  nationality?: string;
  identificationNumber?: string;
  identificationType?: IdentificationType;
  accountNumber?: string;
}

export interface BeneficiaryInfo {
  name?: string;
  address?: CustomerAddress;
  dateOfBirth?: Date;
  accountNumber?: string;
}

export interface CustomerAddress {
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export enum IdentificationType {
  NATIONAL_ID = "national_id",
  PASSPORT = "passport",
  DRIVERS_LICENSE = "drivers_license",
  OTHER = "other"
}

export enum TravelRuleExemption {
  INTRA_VASP = "intra_vasp", // Same VASP transaction
  UNHOSTED_WALLET = "unhosted_wallet", // Personal wallet
  BELOW_THRESHOLD = "below_threshold",
  TECHNICAL_LIMITATION = "technical_limitation"
}

export enum TravelRuleViolationType {
  AMOUNT_EXCEEDS_LIMIT = "amount_exceeds_limit",
  INSUFFICIENT_VASP_INFO = "insufficient_vasp_info",
  NO_TRAVEL_RULE_CONNECTION = "no_travel_rule_connection",
  MISSING_ORIGINATOR_INFO = "missing_originator_info",
  MISSING_BENEFICIARY_INFO = "missing_beneficiary_info",
  INVALID_VASP_CREDENTIALS = "invalid_vasp_credentials"
}

// 주소 검증
export interface AddressVerification {
  isRegisteredByMember: boolean;
  registeredAddressId?: string;
  hasDepositPermission: boolean;
  hasWithdrawalPermission: boolean;
  dailyLimitCheck: DailyLimitCheck;
  addressStatus: AddressStatus;
  flaggedReason?: string;
  flaggedAt?: Date;
  flaggedBy?: string; // Admin user ID
  lastVerificationAt: Date;
}

export interface DailyLimitCheck {
  addressType: AddressType;
  dailyLimit: number; // KRW
  todayUsage: number; // KRW
  transactionAmount: number; // KRW
  remainingLimit: number; // KRW
  isExceeding: boolean;
  resetTime: Date; // When daily limit resets
}

export enum AddressType {
  PERSONAL = "personal",  // 개인 지갑 (1M KRW 한도)
  VASP = "vasp"          // 거래소/금융기관 (Travel Rule 적용)
}

export enum AddressStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BLOCKED = "blocked",
  FLAGGED = "flagged",
  PENDING_REVIEW = "pending_review"
}

// 컴플라이언스 결정
export interface ComplianceDecision {
  decision: ComplianceDecisionType;
  reason: string;
  autoProcessed: boolean;
  requiresManualReview: boolean;
  processingAction: ProcessingAction;
  confidence: number; // 0-100
  reviewLevel: ReviewLevel;
  escalationRequired: boolean;
  estimatedProcessingTime?: number; // minutes
}

export enum ComplianceDecisionType {
  APPROVE = "approve",        // 정상 처리
  FLAG = "flag",             // 수동 검토 필요
  REJECT = "reject",         // 거래 차단
  RETURN = "return",         // 자동 환불
  FREEZE = "freeze"          // 동결 및 신고
}

export enum ProcessingAction {
  ALLOCATE_TO_VAULT = "allocate_to_vault",  // Hot/Cold 배분
  HOLD_FOR_REVIEW = "hold_for_review",      // 수동 검토 대기
  AUTO_RETURN = "auto_return",              // 자동 환불
  FREEZE_AND_REPORT = "freeze_and_report",  // 동결 및 당국 신고
  REJECT_AND_LOG = "reject_and_log"         // 거절 및 로깅
}

export enum ReviewLevel {
  AUTO = "auto",           // 자동 처리
  L1_ANALYST = "l1_analyst", // 1차 분석가
  L2_SENIOR = "l2_senior",   // 2차 시니어
  L3_MANAGER = "l3_manager", // 매니저 검토
  EXTERNAL = "external"     // 외부 전문가
}

// 환불 처리
export interface ReturnTransaction {
  id: string;
  originalAmlCheckId: string;
  originalTxHash: string;
  returnTxHash?: string;
  amount: string;
  currency: string;
  returnAddress: string;
  reason: ReturnReason;
  status: ReturnStatus;
  networkFee: string;
  returnAmount: string; // Original amount - network fee
  processedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  notes?: string;
}

export enum ReturnReason {
  MEMBER_UNREGISTERED_ADDRESS = "member_unregistered_address",
  NO_PERMISSION = "no_permission",
  DAILY_LIMIT_EXCEEDED = "daily_limit_exceeded",
  TRAVEL_RULE_VIOLATION = "travel_rule_violation",
  AML_FLAG = "aml_flag",
  SANCTIONS_MATCH = "sanctions_match",
  HIGH_RISK_TRANSACTION = "high_risk_transaction",
  TECHNICAL_ERROR = "technical_error"
}

export enum ReturnStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

// 컴플라이언스 보고서
export interface ComplianceReport {
  id: string;
  type: ReportType;
  period: ReportPeriod;
  generatedAt: Date;
  generatedBy: string; // Admin user ID
  data: ComplianceReportData;
  fileUrl?: string;
  status: ReportStatus;
}

export enum ReportType {
  DAILY_SUMMARY = "daily_summary",
  WEEKLY_SUMMARY = "weekly_summary",
  MONTHLY_SUMMARY = "monthly_summary",
  AML_SCREENING = "aml_screening",
  TRAVEL_RULE_COMPLIANCE = "travel_rule_compliance",
  SUSPICIOUS_TRANSACTION = "suspicious_transaction", // STR
  SANCTIONS_SCREENING = "sanctions_screening",
  RETURN_TRANSACTIONS = "return_transactions",
  AUDIT_TRAIL = "audit_trail"
}

export interface ReportPeriod {
  start: Date;
  end: Date;
  timezone: string;
}

export interface ComplianceReportData {
  summary: ComplianceSummary;
  transactions: ComplianceTransaction[];
  alerts: ComplianceAlert[];
  returns: ReturnSummary;
  recommendations: string[];
}

export interface ComplianceSummary {
  totalTransactions: number;
  totalVolume: string;
  amlChecks: {
    total: number;
    approved: number;
    flagged: number;
    rejected: number;
    autoProcessed: number;
  };
  travelRuleChecks: {
    total: number;
    compliant: number;
    violations: number;
    exempted: number;
  };
  riskDistribution: Record<RiskLevel, number>;
}

export interface ComplianceTransaction {
  id: string;
  timestamp: Date;
  amount: string;
  currency: string;
  riskScore: number;
  decision: ComplianceDecisionType;
  processingTime: number; // seconds
}

export interface ComplianceAlert {
  type: ComplianceAlertType;
  count: number;
  severity: AlertSeverity;
  averageResolutionTime: number; // minutes
}

export enum ComplianceAlertType {
  HIGH_RISK_TRANSACTION = "high_risk_transaction",
  SANCTIONS_MATCH = "sanctions_match",
  TRAVEL_RULE_VIOLATION = "travel_rule_violation",
  UNUSUAL_PATTERN = "unusual_pattern",
  THRESHOLD_AVOIDANCE = "threshold_avoidance"
}

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface ReturnSummary {
  totalReturns: number;
  totalReturnAmount: string;
  returnReasons: Record<ReturnReason, number>;
  averageProcessingTime: number; // minutes
  successRate: number; // %
}

export enum ReportStatus {
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed"
}

// 컴플라이언스 메트릭
export interface ComplianceMetrics {
  period: ReportPeriod;
  amlMetrics: AMLMetrics;
  travelRuleMetrics: TravelRuleMetrics;
  operationalMetrics: OperationalMetrics;
  riskMetrics: RiskMetrics;
}

export interface AMLMetrics {
  screeningRate: number; // % of transactions screened
  falsePositiveRate: number; // %
  averageScreeningTime: number; // seconds
  escalationRate: number; // %
  autoDecisionRate: number; // %
}

export interface TravelRuleMetrics {
  applicableTransactions: number;
  complianceRate: number; // %
  violationRate: number; // %
  averageResolutionTime: number; // minutes
  exemptionRate: number; // %
}

export interface OperationalMetrics {
  throughput: number; // transactions per hour
  availability: number; // % uptime
  errorRate: number; // %
  averageLatency: number; // ms
}

export interface RiskMetrics {
  riskDistribution: Record<RiskLevel, number>;
  averageRiskScore: number;
  highRiskRate: number; // %
  riskTrends: RiskTrendPoint[];
}

export interface RiskTrendPoint {
  timestamp: Date;
  averageRiskScore: number;
  transactionCount: number;
}

// API 요청/응답 타입
export interface AMLCheckFilters {
  memberId?: string;
  riskLevel?: RiskLevel[];
  decision?: ComplianceDecisionType[];
  dateFrom?: Date;
  dateTo?: Date;
  requiresReview?: boolean;
  limit?: number;
  offset?: number;
}

export interface ComplianceReviewDecision {
  decision: ComplianceDecisionType;
  reason: string;
  notes?: string;
  escalate?: boolean;
  escalationReason?: string;
}