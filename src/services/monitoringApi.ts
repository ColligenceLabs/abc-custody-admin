/**
 * Monitoring API Service
 * 온보딩 모니터링 관련 API
 */

import { RenewalDueItem, ReassessmentQueueItem, RescanRequest } from '@/types/onboardingAml';

const API_BASE = '/api/admin/onboarding/monitoring';

/**
 * 갱신 예정 목록 조회
 */
export async function fetchRenewalDue(daysThreshold: number = 30): Promise<RenewalDueItem[]> {
  // Mock 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: RenewalDueItem[] = [
        {
          id: 'renewal_1',
          applicantName: '김철수',
          memberType: 'individual',
          approvedAt: '2024-06-15T09:00:00Z',
          nextRenewalDue: '2025-06-15T09:00:00Z',
          daysUntilRenewal: 45,
          currentRiskLevel: 'LOW',
          lastAssessmentDate: '2024-12-01T10:00:00Z',
        },
        {
          id: 'renewal_2',
          applicantName: '주식회사 테크노',
          memberType: 'corporate',
          approvedAt: '2024-05-20T14:30:00Z',
          nextRenewalDue: '2025-05-20T14:30:00Z',
          daysUntilRenewal: 20,
          currentRiskLevel: 'MEDIUM',
          lastAssessmentDate: '2024-11-15T11:00:00Z',
        },
        {
          id: 'renewal_3',
          applicantName: '이영희',
          memberType: 'individual',
          approvedAt: '2024-07-10T16:00:00Z',
          nextRenewalDue: '2025-07-10T16:00:00Z',
          daysUntilRenewal: 70,
          currentRiskLevel: 'LOW',
          lastAssessmentDate: '2024-12-05T09:30:00Z',
        },
      ];
      resolve(mockData.filter(item => item.daysUntilRenewal <= daysThreshold));
    }, 300);
  });
}

/**
 * 재평가 큐 조회
 */
export async function fetchReassessmentQueue(): Promise<ReassessmentQueueItem[]> {
  // Mock 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ReassessmentQueueItem[] = [
        {
          id: 'queue_1',
          applicantName: '박지성',
          memberType: 'individual',
          currentRiskLevel: 'MEDIUM',
          reassessmentReason: '고위험 국가 거래 이력 발견',
          requestedAt: '2025-04-25T10:30:00Z',
          priority: 'HIGH',
          externalSystemStatus: 'IN_PROGRESS',
        },
        {
          id: 'queue_2',
          applicantName: '주식회사 글로벌트레이드',
          memberType: 'corporate',
          currentRiskLevel: 'HIGH',
          reassessmentReason: 'UBO 변경 신고',
          requestedAt: '2025-04-26T14:00:00Z',
          priority: 'HIGH',
          externalSystemStatus: 'PENDING',
        },
        {
          id: 'queue_3',
          applicantName: '최민수',
          memberType: 'individual',
          currentRiskLevel: 'LOW',
          reassessmentReason: '정기 재평가 (1년 주기)',
          requestedAt: '2025-04-27T09:00:00Z',
          priority: 'LOW',
          externalSystemStatus: 'COMPLETED',
        },
      ];
      resolve(mockData);
    }, 300);
  });
}

/**
 * 개인회원 AML 재검증 요청
 */
export async function requestIndividualAmlRescan(applicationId: string): Promise<RescanRequest> {
  // Mock 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requestId: `rescan_${Date.now()}`,
        message: '외부 AML 시스템에 재검증 요청을 전송했습니다.',
        estimatedCompletionTime: new Date(Date.now() + 3600000).toISOString(), // 1시간 후
      });
    }, 500);
  });
}

/**
 * 법인회원 UBO 재검증 요청
 */
export async function requestCorporateUboRescan(applicationId: string): Promise<RescanRequest> {
  // Mock 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requestId: `ubo_rescan_${Date.now()}`,
        message: '외부 시스템에 UBO 재검증 요청을 전송했습니다.',
        estimatedCompletionTime: new Date(Date.now() + 7200000).toISOString(), // 2시간 후
      });
    }, 500);
  });
}
