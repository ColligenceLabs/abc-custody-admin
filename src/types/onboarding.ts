// 기업 고객 온보딩 관련 타입 정의

export type OnboardingStep =
  | 'welcome'      // 환영 화면
  | 'ga_setup'     // Google Authenticator 설정
  | 'pass'         // PASS 본인인증
  | 'address'      // 주소 설정
  | 'kyc'          // eKYC 인증 (신분증/계좌)
  | 'complete';    // 완료

export type OnboardingStatus =
  | 'not_started'  // 시작 안 함
  | 'in_progress'  // 진행 중
  | 'completed'    // 완료
  | 'skipped';     // 건너뜀

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  userId: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CorporateOnboardingData {
  // 기본 정보
  userId: string;
  organizationId: string;

  // GA 설정
  gaSetupCompleted: boolean;
  gaSetupAt?: string;

  // PASS 인증
  passVerified: boolean;
  passVerifiedAt?: string;
  passName?: string;
  passPhone?: string;
  passBirthDate?: string;
  passGender?: string;
  passCI?: string;
  passDI?: string;

  // 주소 설정
  addressesSetup: boolean;
  whitelistAddresses: string[];
  addressSetupAt?: string;

  // eKYC
  kycCompleted: boolean;
  kycVerifiedAt?: string;
  idCardVerified?: boolean;
  accountVerified?: boolean;

  // 진행 상태
  status: OnboardingStatus;
  progress: OnboardingProgress;
}

export interface OnboardingStepConfig {
  step: OnboardingStep;
  title: string;
  description: string;
  isRequired: boolean;
  canSkip: boolean;
  order: number;
}

// 기업 온보딩 단계 설정
export const CORPORATE_ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    step: 'welcome',
    title: '환영합니다',
    description: '기업 고객 온보딩을 시작합니다',
    isRequired: true,
    canSkip: false,
    order: 1,
  },
  {
    step: 'ga_setup',
    title: 'Google Authenticator 설정',
    description: '2단계 인증을 위한 Google Authenticator 등록',
    isRequired: true,
    canSkip: false,
    order: 2,
  },
  {
    step: 'pass',
    title: 'PASS 본인인증',
    description: '휴대폰 본인인증 및 개인정보 수집',
    isRequired: true,
    canSkip: false,
    order: 3,
  },
  {
    step: 'address',
    title: '주소 설정',
    description: '출금 주소 화이트리스트 등록',
    isRequired: true,
    canSkip: false,
    order: 4,
  },
  {
    step: 'kyc',
    title: 'eKYC 인증',
    description: '신분증 및 계좌 인증',
    isRequired: true,
    canSkip: false,
    order: 5,
  },
  {
    step: 'complete',
    title: '완료',
    description: '온보딩이 완료되었습니다',
    isRequired: true,
    canSkip: false,
    order: 6,
  },
];
