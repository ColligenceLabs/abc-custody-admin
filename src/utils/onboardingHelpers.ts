import {
  OnboardingStep,
  OnboardingProgress,
  CorporateOnboardingData,
  CORPORATE_ONBOARDING_STEPS,
} from '@/types/onboarding';
import { OrganizationUser } from '@/types/organizationUser';

/**
 * 온보딩 데이터 초기화
 */
export function initializeOnboardingData(user: OrganizationUser): CorporateOnboardingData {
  const progress: OnboardingProgress = {
    currentStep: 'welcome',
    completedSteps: [],
    totalSteps: CORPORATE_ONBOARDING_STEPS.length,
    userId: user.id,
    startedAt: new Date().toISOString(),
  };

  return {
    userId: user.id,
    organizationId: user.organizationId,
    gaSetupCompleted: user.hasGASetup || false,
    gaSetupAt: user.gaSetupDate,
    passVerified: user.passVerified || false,
    passVerifiedAt: user.passVerifiedAt,
    passName: user.passName,
    passPhone: user.passPhone,
    passBirthDate: user.passBirthDate,
    passGender: user.passGender,
    passCI: user.passCI,
    passDI: user.passDI,
    addressesSetup: user.addressVerified || false,
    whitelistAddresses: user.whitelistAddresses || [],
    addressSetupAt: undefined,
    kycCompleted: false,
    kycVerifiedAt: undefined,
    idCardVerified: false,
    accountVerified: false,
    status: 'in_progress',
    progress,
  };
}

/**
 * 온보딩 필요 여부 확인
 */
export function needsOnboarding(user: any): boolean {
  // 기업 사용자이고, admin에서 초대된 사용자이며, 온보딩 미완료
  return (
    user.memberType === 'corporate' &&
    user.creationMethod === 'admin_invited' &&
    !user.onboardingCompleted
  );
}

/**
 * 다음 단계 계산
 */
export function getNextOnboardingStep(
  currentStep: OnboardingStep,
  completedSteps: OnboardingStep[]
): OnboardingStep | null {
  const currentIndex = CORPORATE_ONBOARDING_STEPS.findIndex(s => s.step === currentStep);

  if (currentIndex === -1 || currentIndex === CORPORATE_ONBOARDING_STEPS.length - 1) {
    return null;
  }

  return CORPORATE_ONBOARDING_STEPS[currentIndex + 1].step;
}

/**
 * 온보딩 진행률 계산
 */
export function calculateOnboardingProgress(completedSteps: OnboardingStep[]): number {
  const totalSteps = CORPORATE_ONBOARDING_STEPS.length;
  return Math.round((completedSteps.length / totalSteps) * 100);
}

/**
 * localStorage에서 온보딩 데이터 로드
 */
export function loadOnboardingData(): CorporateOnboardingData | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem('corporate_onboarding');
    if (!saved) return null;

    return JSON.parse(saved);
  } catch (error) {
    console.error('온보딩 데이터 로드 실패:', error);
    return null;
  }
}

/**
 * localStorage에 온보딩 데이터 저장
 */
export function saveOnboardingData(data: CorporateOnboardingData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('corporate_onboarding', JSON.stringify(data));
  } catch (error) {
    console.error('온보딩 데이터 저장 실패:', error);
  }
}

/**
 * 온보딩 데이터 초기화 (완료 시)
 */
export function clearOnboardingData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('corporate_onboarding');
}
