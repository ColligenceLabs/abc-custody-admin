// 개인 회원 타입 정의

export type IndividualUserStatus = 'active' | 'inactive' | 'suspended';
export type KYCLevel = 'level1' | 'level2' | 'level3';

export interface WalletLimit {
  daily: number;
  monthly: number;
}

export interface IndividualUser {
  id: string;
  individualUserId: string;
  memberId: string;

  // 기본 정보
  name: string;
  email: string;
  phone: string;
  status: IndividualUserStatus;
  lastLogin: string;

  // 인증 정보
  hasGASetup: boolean;
  gaSetupDate?: string;
  isFirstLogin: boolean;

  // 개인 회원 전용 필드
  birthDate?: string;
  identityVerified: boolean;
  kycLevel: KYCLevel;
  kycVerifiedAt?: string;

  // AML (자금세탁방지) 고객확인 관련 필드
  fundSource?: string;
  amlVerifiedAt?: string;
  amlNextVerificationDate?: string;
  amlVerificationCycle: number; // 재이행 주기 (개월 단위, 기본값 12개월)

  // 권한 및 한도
  permissions: string[];
  walletLimit: WalletLimit;
}

// KYC 레벨별 한국어 이름
export const KYC_LEVEL_NAMES: Record<KYCLevel, string> = {
  level1: '레벨 1 (기본)',
  level2: '레벨 2 (중급)',
  level3: '레벨 3 (고급)'
};

// 개인 회원 상태별 한국어 이름
export const INDIVIDUAL_STATUS_NAMES: Record<IndividualUserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지'
};

// 개인 회원 기본 권한
export const DEFAULT_INDIVIDUAL_PERMISSIONS = [
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.assets.create_transactions'
];

// KYC 레벨별 기본 한도 (KRW)
export const DEFAULT_WALLET_LIMITS: Record<KYCLevel, WalletLimit> = {
  level1: {
    daily: 1000000,      // 100만원
    monthly: 10000000    // 1000만원
  },
  level2: {
    daily: 5000000,      // 500만원
    monthly: 50000000    // 5000만원
  },
  level3: {
    daily: 50000000,     // 5000만원
    monthly: 500000000   // 5억원
  }
};

// KYC 상태 타입
export interface KYCStatus {
  identityVerified: boolean;
  kycLevel: KYCLevel | null;
  kycVerifiedAt: string | null;
}

// AML 상태 타입
export interface AMLStatus {
  fundSource: string | null;
  amlVerifiedAt: string | null;
  amlNextVerificationDate: string | null;
  amlVerificationCycle: number;
}

// TODO: 향후 개선 필요
// - 주소 정보 추가
// - 직업 정보 추가
