/**
 * Mock Data: All Onboarding Applications (Individual + Corporate)
 * 통합 온보딩 신청 Mock 데이터
 */

import { OnboardingApplication } from '@/data/types/onboardingUnified';
import { individualApplications } from './individualApplications';
import { corporateApplications } from './corporateApplications';
import {
  getCreatedIndividualApplications,
  getCreatedCorporateApplications
} from './onboardingApi';

/**
 * 모든 온보딩 신청 (개인 + 기업)
 */
export const allOnboardingApplications: OnboardingApplication[] = [
  ...individualApplications,
  ...corporateApplications
];

/**
 * 개인 회원 신청만 필터링 (기존 Mock + 새로 생성된 신청 포함)
 */
export const getIndividualApplications = () => {
  const created = getCreatedIndividualApplications();
  return [...individualApplications, ...created];
};

/**
 * 기업 회원 신청만 필터링 (기존 Mock + 새로 생성된 신청 포함)
 */
export const getCorporateApplications = () => {
  const created = getCreatedCorporateApplications();
  return [...corporateApplications, ...created];
};

/**
 * 상태별 필터링
 */
export const getApplicationsByStatus = (
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected'
) => {
  return allOnboardingApplications.filter(app => app.status === status);
};

/**
 * 우선순위별 필터링
 */
export const getApplicationsByPriority = (
  priority: 'high' | 'medium' | 'low'
) => {
  return allOnboardingApplications.filter(app => app.priority === priority);
};

/**
 * 기한 초과 신청 필터링
 */
export const getOverdueApplications = () => {
  return allOnboardingApplications.filter(app => app.workflow.isOverdue);
};
