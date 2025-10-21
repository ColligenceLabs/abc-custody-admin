/**
 * EDD Auto Assignment Helper
 * 리스크 평가 결과에 따라 자동으로 EDD 필요 여부를 결정하는 헬퍼 함수
 *
 * HIGH 리스크로 판정된 경우 자동으로 eddRequired = true 설정
 */

import { IndividualOnboarding, CorporateOnboarding } from '@/types/onboardingAml';

/**
 * 개인회원 EDD 필요 여부 자동 판정
 * HIGH 리스크인 경우 자동으로 eddRequired = true 설정
 */
export function autoAssignIndividualEDD(application: IndividualOnboarding): boolean {
  // 리스크 평가가 없으면 false 반환
  if (!application.riskAssessment) {
    return false;
  }

  // HIGH 리스크인 경우 EDD 필요
  if (application.riskAssessment.riskLevel === 'HIGH') {
    return true;
  }

  // MEDIUM, LOW 리스크는 EDD 불필요
  return false;
}

/**
 * 법인회원 EDD 필요 여부 자동 판정
 * 전체 리스크 레벨이 HIGH인 경우 자동으로 eddRequired = true 설정
 */
export function autoAssignCorporateEDD(application: CorporateOnboarding): boolean {
  // 리스크 평가가 없으면 false 반환
  if (!application.riskAssessment) {
    return false;
  }

  // 전체 리스크 레벨이 HIGH인 경우 EDD 필요
  if (application.riskAssessment.overallRiskLevel === 'HIGH') {
    return true;
  }

  // MEDIUM, LOW 리스크는 EDD 불필요
  return false;
}

/**
 * EDD 자동 할당 적용
 * 리스크 평가 후 호출하여 eddRequired 필드를 자동으로 업데이트
 */
export function applyEDDAutoAssignment(
  application: IndividualOnboarding | CorporateOnboarding
): void {
  if ('riskLevel' in (application.riskAssessment || {})) {
    // 개인회원
    application.eddRequired = autoAssignIndividualEDD(application as IndividualOnboarding);
  } else if ('overallRiskLevel' in (application.riskAssessment || {})) {
    // 법인회원
    application.eddRequired = autoAssignCorporateEDD(application as CorporateOnboarding);
  }
}
