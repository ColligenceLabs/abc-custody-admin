/**
 * Member Management Types
 * 회원사 관리를 위한 타입 정의 (관리자 모니터링 중심)
 */

import {
  MemberType,
  PersonalInfo as OnboardingPersonalInfo,
  AddressInfo as OnboardingAddressInfo
} from '@/data/types/individualOnboarding';

import {
  CompanyInfo as OnboardingCompanyInfo,
  RepresentativeInfo as OnboardingRepresentativeInfo,
  CompanyAddress as OnboardingCompanyAddress
} from '@/data/types/corporateOnboarding';

/**
 * 공통 회원 기본 정보
 */
interface BaseMember {
  id: string;
  memberType: MemberType;
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

/**
 * 개인 회원 정보
 */
export interface PersonalInfo {
  fullName: string;          // 성명
  birthDate: string;         // 생년월일 (YYYY-MM-DD)
  nationality: string;       // 국적
  idNumber: string;          // 주민등록번호 (암호화)
}

/**
 * 주소 정보
 */
export interface AddressInfo {
  street: string;            // 도로명 주소
  city: string;              // 시/군/구
  state: string;             // 시/도
  postalCode: string;        // 우편번호
  country: string;           // 국가
}

/**
 * 기업 정보
 */
export interface CompanyInfo {
  companyName: string;       // 회사명
  businessNumber: string;    // 사업자등록번호
  corporateNumber: string;   // 법인등록번호
  industry: string;          // 업종
  establishedDate: string;   // 설립일 (YYYY-MM-DD)
}

/**
 * 대표자 정보
 */
export interface RepresentativeInfo {
  name: string;              // 대표자명
  position: string;          // 직책
  email: string;             // 이메일
  phone: string;             // 전화번호
}

/**
 * 기업 주소 정보
 */
export interface CompanyAddress {
  street: string;            // 도로명 주소
  city: string;              // 시/군/구
  state: string;             // 시/도
  postalCode: string;        // 우편번호
  country: string;           // 국가
}

/**
 * 개인 회원
 */
export interface IndividualMember extends BaseMember {
  memberType: MemberType.INDIVIDUAL;
  personalInfo: PersonalInfo;
  address: AddressInfo;
}

/**
 * 기업 회원
 */
export interface CorporateMember extends BaseMember {
  memberType: MemberType.CORPORATE;
  companyInfo: CompanyInfo;
  representative: RepresentativeInfo;
  companyAddress: CompanyAddress;
}

/**
 * 통합 회원 타입 (Discriminated Union)
 */
export type Member = IndividualMember | CorporateMember;

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
/**
 * 개인 회원 생성 요청
 */
export interface CreateIndividualMemberRequest {
  memberType: MemberType.INDIVIDUAL;
  personalInfo: PersonalInfo;
  address: AddressInfo;
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

/**
 * 기업 회원 생성 요청
 */
export interface CreateCorporateMemberRequest {
  memberType: MemberType.CORPORATE;
  companyInfo: CompanyInfo;
  representative: RepresentativeInfo;
  companyAddress: CompanyAddress;
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

/**
 * 통합 회원 생성 요청 타입
 */
export type CreateMemberRequest = CreateIndividualMemberRequest | CreateCorporateMemberRequest;

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

// ============================================================================
// Type Guards and Helper Functions
// ============================================================================

/**
 * Type Guard: 개인 회원 여부 확인
 */
export function isIndividualMember(
  member: Member
): member is IndividualMember {
  return member.memberType === MemberType.INDIVIDUAL;
}

/**
 * Type Guard: 기업 회원 여부 확인
 */
export function isCorporateMember(
  member: Member
): member is CorporateMember {
  return member.memberType === MemberType.CORPORATE;
}

/**
 * 회원 이름 추출 (개인/기업 모두 대응)
 */
export function getMemberName(member: Member): string {
  if (isIndividualMember(member)) {
    return member.personalInfo.fullName;
  } else {
    return member.companyInfo.companyName;
  }
}

/**
 * 회원 식별번호 추출 (마스킹 처리)
 */
export function getMemberIdNumber(member: Member): string {
  if (isIndividualMember(member)) {
    // 주민번호 마스킹: 123456-*******
    const idNumber = member.personalInfo.idNumber;
    return idNumber.replace(/(\d{6})-(\d{7})/, '$1-*******');
  } else {
    // 사업자번호: 123-45-67890
    return member.companyInfo.businessNumber;
  }
}

/**
 * 회원 주소 추출
 */
export function getMemberAddress(member: Member): string {
  const address = isIndividualMember(member)
    ? member.address
    : member.companyAddress;

  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
}

/**
 * 회원 주소 객체 추출
 */
export function getMemberAddressObject(member: Member): AddressInfo | CompanyAddress {
  return isIndividualMember(member)
    ? member.address
    : member.companyAddress;
}

/**
 * 회원 타입 표시명 반환
 */
export function getMemberTypeLabel(member: Member): string {
  return isIndividualMember(member) ? '개인 회원' : '기업 회원';
}