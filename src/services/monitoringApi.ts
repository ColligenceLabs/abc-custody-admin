/**
 * Monitoring API Service
 * 온보딩 모니터링 관련 API
 */

import { RenewalDueItem, ReassessmentQueueItem, RescanRequest } from '@/types/onboardingAml';
import { getIndividualOnboardings, getCorporateOnboardings } from '@/data/mockData/onboardingAml';

const API_BASE = '/api/admin/onboarding/monitoring';

/**
 * 고객확인 재이행 목록 조회
 * 승인된 회원 중 1년 주기 재이행이 필요한 회원 반환
 */
export async function fetchRenewalDue(daysThreshold: number = 30): Promise<RenewalDueItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date();
      const renewalItems: RenewalDueItem[] = [];

      // 개인회원 처리
      const individualApps = getIndividualOnboardings();
      individualApps
        .filter((app) => app.adminReview.status === 'APPROVED' && app.adminReview.reviewedAt)
        .forEach((app) => {
          const approvedAt = new Date(app.adminReview.reviewedAt!);
          const nextRenewalDue = new Date(approvedAt);
          nextRenewalDue.setFullYear(nextRenewalDue.getFullYear() + 1); // 1년 후

          const daysUntilRenewal = Math.ceil(
            (nextRenewalDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilRenewal <= daysThreshold && daysUntilRenewal > 0) {
            renewalItems.push({
              id: app.id,
              applicantName: app.userName,
              memberType: 'individual',
              approvedAt: app.adminReview.reviewedAt!,
              nextRenewalDue: nextRenewalDue.toISOString(),
              daysUntilRenewal,
              currentRiskLevel: app.riskAssessment?.riskLevel || 'LOW',
              lastAssessmentDate: app.riskAssessment?.assessedAt || app.createdAt,
            });
          }
        });

      // 법인회원 처리
      const corporateApps = getCorporateOnboardings();
      corporateApps
        .filter((app) => app.adminReview.status === 'APPROVED' && app.adminReview.reviewedAt)
        .forEach((app) => {
          const approvedAt = new Date(app.adminReview.reviewedAt!);
          const nextRenewalDue = new Date(approvedAt);
          nextRenewalDue.setFullYear(nextRenewalDue.getFullYear() + 1);

          const daysUntilRenewal = Math.ceil(
            (nextRenewalDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilRenewal <= daysThreshold && daysUntilRenewal > 0) {
            renewalItems.push({
              id: app.id,
              applicantName: app.companyName,
              memberType: 'corporate',
              approvedAt: app.adminReview.reviewedAt!,
              nextRenewalDue: nextRenewalDue.toISOString(),
              daysUntilRenewal,
              currentRiskLevel: app.riskAssessment?.overallRiskLevel || 'LOW',
              lastAssessmentDate: app.riskAssessment?.assessedAt || app.createdAt,
            });
          }
        });

      // 재이행 예정일 가까운 순으로 정렬
      renewalItems.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

      resolve(renewalItems);
    }, 300);
  });
}

/**
 * 위험 고객 재평가 큐 조회
 * MEDIUM/HIGH 위험도 회원 중 재평가가 필요한 회원 반환
 */
export async function fetchReassessmentQueue(): Promise<ReassessmentQueueItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const queueItems: ReassessmentQueueItem[] = [];

      // 외부 시스템 상태 시뮬레이션
      const statuses: Array<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'> = [
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED',
      ];

      // 개인회원 처리 - MEDIUM/HIGH 위험도만
      const individualApps = getIndividualOnboardings();
      individualApps
        .filter(
          (app) =>
            app.riskAssessment &&
            (app.riskAssessment.riskLevel === 'MEDIUM' || app.riskAssessment.riskLevel === 'HIGH') &&
            app.adminReview.status !== 'REJECTED'
        )
        .forEach((app) => {
          // 재평가 사유 생성
          let reason = '';
          if (app.riskAssessment!.riskLevel === 'HIGH') {
            reason = app.aml?.countryRiskLevel === 'HIGH'
              ? '고위험 국가 거래 이력'
              : 'EDD 필요 고위험 고객';
          } else {
            reason = app.aml?.pepStatus === 'POSSIBLE_MATCH'
              ? 'PEP 유사 매칭 확인 필요'
              : '중위험 고객 정기 재평가';
          }

          // 상태에 따라 외부 시스템 상태 결정
          let externalStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' = 'PENDING';
          if (app.adminReview.status === 'UNDER_REVIEW') {
            externalStatus = 'IN_PROGRESS';
          } else if (app.adminReview.status === 'APPROVED') {
            externalStatus = 'COMPLETED';
          } else if (app.adminReview.status === 'ON_HOLD') {
            externalStatus = 'FAILED';
          }

          queueItems.push({
            id: app.id,
            applicantName: app.userName,
            memberType: 'individual',
            currentRiskLevel: app.riskAssessment!.riskLevel,
            reassessmentReason: reason,
            requestedAt: app.riskAssessment!.assessedAt,
            priority: app.riskAssessment!.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
            externalSystemStatus: externalStatus,
          });
        });

      // 법인회원 처리 - MEDIUM/HIGH 위험도만
      const corporateApps = getCorporateOnboardings();
      corporateApps
        .filter(
          (app) =>
            app.riskAssessment &&
            (app.riskAssessment.overallRiskLevel === 'MEDIUM' ||
              app.riskAssessment.overallRiskLevel === 'HIGH') &&
            app.adminReview.status !== 'REJECTED'
        )
        .forEach((app) => {
          // 재평가 사유 생성
          let reason = '';
          if (app.riskAssessment!.overallRiskLevel === 'HIGH') {
            reason = app.ubo?.complexStructure || app.ubo?.trustStructure
              ? 'UBO 구조 복잡, 재검증 필요'
              : '고위험 업종 정밀 재평가';
          } else {
            reason = app.riskAssessment!.industryRiskLevel === 'MEDIUM'
              ? '중위험 업종 정기 재평가'
              : 'UBO 변경 확인 필요';
          }

          // 상태에 따라 외부 시스템 상태 결정
          let externalStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' = 'PENDING';
          if (app.adminReview.status === 'UNDER_REVIEW') {
            externalStatus = 'IN_PROGRESS';
          } else if (app.adminReview.status === 'APPROVED') {
            externalStatus = 'COMPLETED';
          } else if (app.adminReview.status === 'ON_HOLD') {
            externalStatus = 'FAILED';
          }

          queueItems.push({
            id: app.id,
            applicantName: app.companyName,
            memberType: 'corporate',
            currentRiskLevel: app.riskAssessment!.overallRiskLevel,
            reassessmentReason: reason,
            requestedAt: app.riskAssessment!.assessedAt,
            priority: app.riskAssessment!.overallRiskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
            externalSystemStatus: externalStatus,
          });
        });

      // 우선순위 높은 순, 요청일 오래된 순으로 정렬
      queueItems.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority === 'HIGH' ? -1 : 1;
        }
        return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      });

      resolve(queueItems);
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
