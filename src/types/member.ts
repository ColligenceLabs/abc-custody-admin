/**
 * Member Management Types
 * 회원사 관리를 위한 타입 정의 (관리자 모니터링 중심)
 */

export interface Member {
  id: string;
  type: 'individual' | 'corporate'; // 회원 유형: 개인 또는 기업
  companyName: string;
  businessNumber: string;
  status: MemberStatus;
  onboardingStatus: OnboardingStatus;
  contractInfo: MemberContract;
  generatedDepositAddresses: MemberAsset[]; // 자산 추가 시 자동 생성된 입금 주소
  registeredAddresses: RegisteredAddress[];  // 회원사가 직접 관리하는 입출금 주소
  contacts: MemberContact[];
  approvalSettings: MemberApprovalSettings;
  notificationSettings: MemberNotificationSettings;
  complianceProfile: MemberComplianceProfile;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string; // Admin user ID
  suspendedAt?: Date;
  suspendedBy?: string;
  suspensionReason?: string;
}

export enum MemberStatus {
  PENDING = "pending",        // 승인 대기
  ACTIVE = "active",          // 활성
  SUSPENDED = "suspended",    // 정지
  TERMINATED = "terminated"   // 해지
}

export enum OnboardingStatus {
  SUBMITTED = "submitted",
  DOCUMENT_REVIEW = "document_review",
  COMPLIANCE_REVIEW = "compliance_review",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface MemberContract {
  plan: ContractPlan;
  feeRate: number; // %
  monthlyLimit: number; // KRW
  dailyLimit: number; // KRW
  startDate: Date;
  endDate?: Date;
  autoRenewal: boolean;
}

export enum ContractPlan {
  BASIC = "basic",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise"
}

// 회원사가 자산 추가 시 자동 생성되는 입금 주소
export interface MemberAsset {
  id: string;
  memberId: string;
  assetSymbol: string; // "BTC", "ETH", "USDT"
  assetName: string;   // "Bitcoin", "Ethereum", "Tether USD"
  depositAddress: string; // 자동 생성된 입금 주소
  balance: string;
  balanceInKRW: string;
  isActive: boolean;
  createdAt: Date;
  lastActivityAt?: Date;
  totalDeposited: string; // 총 입금액
  totalWithdrawn: string; // 총 출금액
  transactionCount: number;
}

// 회원사가 직접 등록/관리하는 입출금 주소
export interface RegisteredAddress {
  id: string;
  memberId: string;
  label: string;
  address: string;
  coin: string;
  type: AddressType;
  permissions: AddressPermissions;
  dailyLimits?: AddressLimits;
  dailyUsage: DailyUsage;
  vaspInfo?: VaspInfo;
  status: AddressStatus;
  addedAt: Date;
  addedBy: string; // Member user who added this address
  lastUsedAt?: Date;
  flaggedAt?: Date;
  flaggedBy?: string; // Admin user ID
  flagReason?: string;
  notes?: string;
}

export enum AddressType {
  PERSONAL = "personal",  // 개인 지갑
  VASP = "vasp"          // 거래소/금융기관
}

export interface AddressPermissions {
  canDeposit: boolean;
  canWithdraw: boolean;
}

export interface AddressLimits {
  deposit: number; // KRW 기준 일일 한도
  withdrawal: number; // KRW 기준 일일 한도
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  depositAmount: number; // 당일 사용한 입금액 (KRW)
  withdrawalAmount: number; // 당일 사용한 출금액 (KRW)
}

export interface VaspInfo {
  businessName: string;
  travelRuleConnected: boolean;
  complianceScore: number; // 0-100
  licenseNumber?: string;
  jurisdiction: string;
  lastComplianceCheck?: Date;
}

export enum AddressStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BLOCKED = "blocked",
  FLAGGED = "flagged",
  PENDING_REVIEW = "pending_review"
}

export interface MemberContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ContactRole;
  status: ContactStatus;
  isPrimary: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
}

export enum ContactRole {
  ADMIN = "admin",        // 최고 관리자
  APPROVER = "approver",  // 출금 승인자
  VIEWER = "viewer",      // 조회만 가능
  OPERATOR = "operator"   // 운영자
}

export enum ContactStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

export interface MemberApprovalSettings {
  requiredApprovers: number;
  approvalThreshold: string; // KRW 기준
  emergencyContacts: string[];
  weekendApprovalAllowed: boolean;
  nightTimeApprovalAllowed: boolean;
}

export interface MemberNotificationSettings {
  email: boolean;
  sms: boolean;
  slack?: string;
  webhook?: string;
  notifyOnDeposit: boolean;
  notifyOnWithdrawal: boolean;
  notifyOnSuspension: boolean;
}

export interface MemberComplianceProfile {
  riskLevel: RiskLevel;
  amlScore: number; // 0-100
  sanctionsScreening: boolean;
  pepStatus: boolean; // Politically Exposed Person
  lastKycUpdate: Date;
  nextKycReview: Date;
  complianceNotes: string[];
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Onboarding related types
export interface OnboardingApplication {
  id: string;
  companyName: string;
  businessNumber: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  submittedAt: Date;
  status: OnboardingStatus;
  documents: OnboardingDocument[];
  reviewNotes: ReviewNote[];
  assignedReviewer?: string; // Admin user ID
  completedAt?: Date;
}

export interface OnboardingDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string; // Admin user ID
  rejectionReason?: string;
}

export enum DocumentType {
  BUSINESS_REGISTRATION = "business_registration", // 사업자등록증
  CORPORATE_REGISTRY = "corporate_registry",       // 법인등기부등본
  REPRESENTATIVE_ID = "representative_id",         // 대표자 신분증
  BANK_ACCOUNT_CERTIFICATE = "bank_account_certificate", // 통장사본
  AML_POLICY = "aml_policy",                      // AML 정책서
  COMPLIANCE_CERTIFICATE = "compliance_certificate" // 컴플라이언스 인증서
}

export interface ReviewNote {
  id: string;
  reviewerId: string; // Admin user ID
  reviewerName: string;
  note: string;
  createdAt: Date;
  isInternal: boolean; // Internal admin note vs note shared with applicant
}

export interface OnboardingDecision {
  decision: OnboardingDecisionType;
  reason: string;
  conditions?: string[];
  reviewerId: string;
}

export enum OnboardingDecisionType {
  APPROVE = "approve",
  REJECT = "reject",
  REQUEST_ADDITIONAL_INFO = "request_additional_info"
}

// Address audit log
export interface AddressAuditLog {
  id: string;
  memberId: string;
  addressId: string;
  action: AddressAuditAction;
  oldValue?: any;
  newValue?: any;
  performedBy: string; // Member user ID or Admin user ID
  performedByType: "member" | "admin";
  timestamp: Date;
  ipAddress: string;
  reason?: string;
}

export enum AddressAuditAction {
  ADDED = "added",
  REMOVED = "removed",
  UPDATED = "updated",
  FLAGGED = "flagged",
  BLOCKED = "blocked",
  SUSPENDED = "suspended",
  ACTIVATED = "activated"
}

// Asset transaction history
export interface AssetTransaction {
  id: string;
  memberId: string;
  memberAssetId: string;
  type: TransactionType;
  amount: string;
  amountInKRW: string;
  fromAddress?: string;
  toAddress?: string;
  txHash: string;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
  fees: string;
  confirmations: number;
  requiredConfirmations: number;
  blockNumber?: number;
}

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  INTERNAL_TRANSFER = "internal_transfer"
}

export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

// Filter and search types for admin interfaces
export interface MemberFilters {
  status?: MemberStatus[];
  onboardingStatus?: OnboardingStatus[];
  riskLevel?: RiskLevel[];
  contractPlan?: ContractPlan[];
  createdAfter?: Date;
  createdBefore?: Date;
  searchQuery?: string; // Company name or business number
}

export interface AddressFilters {
  memberId?: string;
  status?: AddressStatus[];
  type?: AddressType[];
  coin?: string[];
  flagged?: boolean;
  addedAfter?: Date;
  addedBefore?: Date;
}

// Member management actions
export interface CreateMemberRequest {
  type: 'individual' | 'corporate'; // 회원 유형: 개인 또는 기업
  companyName: string;
  businessNumber: string;
  status: MemberStatus;
  contractInfo: MemberContract;
  contacts: MemberContact[];
  approvalSettings: MemberApprovalSettings;
  notificationSettings: MemberNotificationSettings;
  initialAssets?: Array<{ symbol: string }>;
  generatedDepositAddresses?: Array<{
    asset: string;
    depositAddress: string;
    balance: string;
    isActive: boolean;
  }>;
}

export interface OnboardingApprovalRequest {
  contractInfo: MemberContract;
  initialAssets?: Array<{ symbol: string }>;
  notes?: string;
}

export interface UpdateMemberRequest {
  status?: MemberStatus;
  contractInfo?: Partial<MemberContract>;
  approvalSettings?: Partial<MemberApprovalSettings>;
  notificationSettings?: Partial<MemberNotificationSettings>;
  notes?: string;
}

export interface SuspendMemberRequest {
  reason: string;
  suspensionType: SuspensionType;
  duration?: number; // days, if temporary
  notifyMember: boolean;
}

export enum SuspensionType {
  TEMPORARY = "temporary",
  INDEFINITE = "indefinite"
}