/**
 * Onboarding AML API Service
 * 온보딩 AML 관리 시스템 API 서비스
 *
 * Mock 환경: 로컬 데이터 사용
 * 실제 환경: REST API 호출로 교체 가능
 */

import {
  IndividualOnboarding,
  CorporateOnboarding,
  OnboardingStats,
  ActivityFeedItem,
  OnboardingListQuery,
  OnboardingListResponse,
  ManualRegisterIndividualRequest,
  ManualRegisterCorporateRequest,
  ApprovalRequest,
  RejectionRequest,
  OnHoldRequest,
  AddNoteRequest,
  ReviewNote,
} from '@/types/onboardingAml';

import {
  getIndividualOnboardings,
  getCorporateOnboardings,
  getIndividualOnboardingById,
  getCorporateOnboardingById,
  getOnboardingStats,
  getActivityFeed,
  mockIndividualOnboardings,
  mockCorporateOnboardings,
} from '@/data/mockData/onboardingAml';

// ===========================
// 개인회원 온보딩 API
// ===========================

/**
 * 개인회원 목록 조회
 */
export async function fetchIndividualOnboardings(
  query: OnboardingListQuery = {}
): Promise<OnboardingListResponse<IndividualOnboarding>> {
  // Mock: 로컬 데이터 필터링
  await new Promise((resolve) => setTimeout(resolve, 300)); // 네트워크 지연 시뮬레이션

  let applications = getIndividualOnboardings();

  // 필터링
  if (query.status) {
    applications = applications.filter((app) => app.adminReview.status === query.status);
  }

  if (query.riskLevel) {
    applications = applications.filter(
      (app) => app.riskAssessment?.riskLevel === query.riskLevel
    );
  }

  if (query.registrationSource) {
    applications = applications.filter((app) => app.registrationSource === query.registrationSource);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    applications = applications.filter(
      (app) =>
        app.userName.toLowerCase().includes(searchLower) ||
        app.userEmail.toLowerCase().includes(searchLower) ||
        app.id.toLowerCase().includes(searchLower)
    );
  }

  // 페이지네이션
  const page = query.page || 1;
  const limit = query.limit || 10;
  const totalPages = Math.ceil(applications.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApplications = applications.slice(startIndex, endIndex);

  return {
    applications: paginatedApplications,
    total: applications.length,
    page,
    totalPages,
  };
}

/**
 * 개인회원 상세 조회
 */
export async function fetchIndividualOnboardingById(
  id: string
): Promise<IndividualOnboarding> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const application = getIndividualOnboardingById(id);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${id}`);
  }

  return application;
}

/**
 * 개인회원 수동 등록
 */
export async function manualRegisterIndividual(
  request: ManualRegisterIndividualRequest
): Promise<{ id: string; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock: 새 신청 생성
  const newId = `ind-${Date.now()}`;
  const newApplication: IndividualOnboarding = {
    id: newId,
    userId: `user-${Date.now()}`,
    userName: request.userName,
    userEmail: request.userEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    registrationSource: request.registrationSource,
    registrationNote: request.registrationNote,
    kyc: {
      ...request.kyc,
      completedAt: new Date().toISOString(),
    },
    aml: null, // 외부 AML 스크리닝 대기 중
    riskAssessment: null,
    additionalProcedures: null,
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'PENDING',
      currentStep: 1,
      notes: [],
    },
  };

  // Mock 데이터에 추가
  mockIndividualOnboardings.push(newApplication);

  return {
    id: newId,
    message: '개인회원 온보딩이 등록되었습니다. 외부 AML 스크리닝이 진행 중입니다.',
  };
}

/**
 * 개인회원 승인
 */
export async function approveIndividualOnboarding(
  id: string,
  request: ApprovalRequest
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const application = getIndividualOnboardingById(id);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${id}`);
  }

  // Mock: 상태 업데이트
  application.adminReview.status = 'APPROVED';
  application.adminReview.decision = 'APPROVE';
  application.adminReview.decisionReason = request.decisionReason;
  application.adminReview.reviewedBy = 'current-admin'; // 실제로는 로그인 정보
  application.adminReview.reviewedAt = new Date().toISOString();
  application.updatedAt = new Date().toISOString();

  if (request.reviewNote) {
    const note: ReviewNote = {
      id: `note-${Date.now()}`,
      createdBy: 'current-admin',
      createdAt: new Date().toISOString(),
      content: request.reviewNote,
      type: 'DECISION',
    };
    application.adminReview.notes.push(note);
  }

  return {
    success: true,
    message: '개인회원 온보딩이 승인되었습니다.',
  };
}

/**
 * 개인회원 거부
 */
export async function rejectIndividualOnboarding(
  id: string,
  request: RejectionRequest
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const application = getIndividualOnboardingById(id);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${id}`);
  }

  application.adminReview.status = 'REJECTED';
  application.adminReview.decision = 'REJECT';
  application.adminReview.decisionReason = request.decisionReason;
  application.adminReview.reviewedBy = 'current-admin';
  application.adminReview.reviewedAt = new Date().toISOString();
  application.updatedAt = new Date().toISOString();

  if (request.reviewNote) {
    const note: ReviewNote = {
      id: `note-${Date.now()}`,
      createdBy: 'current-admin',
      createdAt: new Date().toISOString(),
      content: request.reviewNote,
      type: 'DECISION',
    };
    application.adminReview.notes.push(note);
  }

  return {
    success: true,
    message: '개인회원 온보딩이 거부되었습니다.',
  };
}

/**
 * 개인회원 보류
 */
export async function holdIndividualOnboarding(
  id: string,
  request: OnHoldRequest
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const application = getIndividualOnboardingById(id);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${id}`);
  }

  application.adminReview.status = 'ON_HOLD';
  application.adminReview.decision = 'HOLD';
  application.adminReview.decisionReason = request.reason;
  application.adminReview.reviewedBy = 'current-admin';
  application.adminReview.reviewedAt = new Date().toISOString();
  application.updatedAt = new Date().toISOString();

  const note: ReviewNote = {
    id: `note-${Date.now()}`,
    createdBy: 'current-admin',
    createdAt: new Date().toISOString(),
    content: `보류 처리: ${request.reason}. 추가 서류: ${request.requiredDocuments?.join(', ') || '없음'}`,
    type: 'DECISION',
  };
  application.adminReview.notes.push(note);

  return {
    success: true,
    message: '개인회원 온보딩이 보류되었습니다.',
  };
}

/**
 * 개인회원 검토 노트 추가
 */
export async function addIndividualOnboardingNote(
  id: string,
  request: AddNoteRequest
): Promise<{ success: boolean; note: ReviewNote }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const application = getIndividualOnboardingById(id);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${id}`);
  }

  const note: ReviewNote = {
    id: `note-${Date.now()}`,
    createdBy: 'current-admin',
    createdAt: new Date().toISOString(),
    content: request.content,
    type: request.type,
  };

  application.adminReview.notes.push(note);
  application.updatedAt = new Date().toISOString();

  return {
    success: true,
    note,
  };
}

/**
 * 외부 AML 재검증 요청
 */
export async function requestIndividualAmlRescan(
  id: string
): Promise<{ requestId: string; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const application = getIndividualOnboardingById(id);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${id}`);
  }

  // Mock: 재검증 요청 ID 생성
  const requestId = `rescan-${Date.now()}`;

  return {
    requestId,
    message: '외부 AML 시스템에 재검증 요청을 전송했습니다.',
  };
}

// ===========================
// 법인회원 온보딩 API
// ===========================

/**
 * 법인회원 목록 조회
 */
export async function fetchCorporateOnboardings(
  query: OnboardingListQuery = {}
): Promise<OnboardingListResponse<CorporateOnboarding>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let applications = getCorporateOnboardings();

  // 필터링
  if (query.status) {
    applications = applications.filter((app) => app.adminReview.status === query.status);
  }

  if (query.riskLevel) {
    applications = applications.filter(
      (app) => app.riskAssessment?.overallRiskLevel === query.riskLevel
    );
  }

  if (query.registrationSource) {
    applications = applications.filter((app) => app.registrationSource === query.registrationSource);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    applications = applications.filter(
      (app) =>
        app.companyName.toLowerCase().includes(searchLower) ||
        app.businessNumber.toLowerCase().includes(searchLower) ||
        app.id.toLowerCase().includes(searchLower)
    );
  }

  // 페이지네이션
  const page = query.page || 1;
  const limit = query.limit || 10;
  const totalPages = Math.ceil(applications.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApplications = applications.slice(startIndex, endIndex);

  return {
    applications: paginatedApplications,
    total: applications.length,
    page,
    totalPages,
  };
}

/**
 * 법인회원 상세 조회
 */
export async function fetchCorporateOnboardingById(
  id: string
): Promise<CorporateOnboarding> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const application = getCorporateOnboardingById(id);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${id}`);
  }

  return application;
}

/**
 * 법인회원 수동 등록
 */
export async function manualRegisterCorporate(
  request: ManualRegisterCorporateRequest
): Promise<{ id: string; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newId = `corp-${Date.now()}`;
  const newApplication: CorporateOnboarding = {
    id: newId,
    companyId: `company-${Date.now()}`,
    companyName: request.companyName,
    businessNumber: request.businessNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    registrationSource: request.registrationSource,
    registrationNote: request.registrationNote,
    corporateInfo: {
      ...request.corporateInfo,
      completedAt: new Date().toISOString(),
    },
    ubo: null, // 외부 UBO 검증 대기 중
    riskAssessment: null,
    procedures: {
      recommendedDocuments: [],
      backgroundCheckRequired: false,
      onSiteInspectionRequired: false,
      executiveInterviewRequired: false,
      backgroundCheckCompleted: false,
      onSiteInspectionCompleted: false,
      executiveInterviewCompleted: false,
    },
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'PENDING',
      currentStep: 1,
      notes: [],
    },
  };

  mockCorporateOnboardings.push(newApplication);

  return {
    id: newId,
    message: '법인회원 온보딩이 등록되었습니다. 외부 AML 스크리닝 및 UBO 검증이 진행 중입니다.',
  };
}

/**
 * 법인회원 승인
 */
export async function approveCorporateOnboarding(
  id: string,
  request: ApprovalRequest
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const application = getCorporateOnboardingById(id);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${id}`);
  }

  application.adminReview.status = 'APPROVED';
  application.adminReview.decision = 'APPROVE';
  application.adminReview.decisionReason = request.decisionReason;
  application.adminReview.reviewedBy = 'current-admin';
  application.adminReview.reviewedAt = new Date().toISOString();
  application.updatedAt = new Date().toISOString();

  if (request.reviewNote) {
    const note: ReviewNote = {
      id: `note-${Date.now()}`,
      createdBy: 'current-admin',
      createdAt: new Date().toISOString(),
      content: request.reviewNote,
      type: 'DECISION',
    };
    application.adminReview.notes.push(note);
  }

  return {
    success: true,
    message: '법인회원 온보딩이 승인되었습니다.',
  };
}

/**
 * 법인회원 거부
 */
export async function rejectCorporateOnboarding(
  id: string,
  request: RejectionRequest
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const application = getCorporateOnboardingById(id);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${id}`);
  }

  application.adminReview.status = 'REJECTED';
  application.adminReview.decision = 'REJECT';
  application.adminReview.decisionReason = request.decisionReason;
  application.adminReview.reviewedBy = 'current-admin';
  application.adminReview.reviewedAt = new Date().toISOString();
  application.updatedAt = new Date().toISOString();

  if (request.reviewNote) {
    const note: ReviewNote = {
      id: `note-${Date.now()}`,
      createdBy: 'current-admin',
      createdAt: new Date().toISOString(),
      content: request.reviewNote,
      type: 'DECISION',
    };
    application.adminReview.notes.push(note);
  }

  return {
    success: true,
    message: '법인회원 온보딩이 거부되었습니다.',
  };
}

/**
 * 법인회원 보류
 */
export async function holdCorporateOnboarding(
  id: string,
  request: OnHoldRequest
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const application = getCorporateOnboardingById(id);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${id}`);
  }

  application.adminReview.status = 'ON_HOLD';
  application.adminReview.decision = 'HOLD';
  application.adminReview.decisionReason = request.reason;
  application.adminReview.reviewedBy = 'current-admin';
  application.adminReview.reviewedAt = new Date().toISOString();
  application.updatedAt = new Date().toISOString();

  const note: ReviewNote = {
    id: `note-${Date.now()}`,
    createdBy: 'current-admin',
    createdAt: new Date().toISOString(),
    content: `보류 처리: ${request.reason}. 추가 서류: ${request.requiredDocuments?.join(', ') || '없음'}`,
    type: 'DECISION',
  };
  application.adminReview.notes.push(note);

  return {
    success: true,
    message: '법인회원 온보딩이 보류되었습니다.',
  };
}

/**
 * 법인회원 검토 노트 추가
 */
export async function addCorporateOnboardingNote(
  id: string,
  request: AddNoteRequest
): Promise<{ success: boolean; note: ReviewNote }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const application = getCorporateOnboardingById(id);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${id}`);
  }

  const note: ReviewNote = {
    id: `note-${Date.now()}`,
    createdBy: 'current-admin',
    createdAt: new Date().toISOString(),
    content: request.content,
    type: request.type,
  };

  application.adminReview.notes.push(note);
  application.updatedAt = new Date().toISOString();

  return {
    success: true,
    note,
  };
}

/**
 * 외부 UBO 재검증 요청
 */
export async function requestCorporateUboRescan(
  id: string
): Promise<{ requestId: string; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const application = getCorporateOnboardingById(id);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${id}`);
  }

  const requestId = `ubo-rescan-${Date.now()}`;

  return {
    requestId,
    message: '외부 AML 시스템에 UBO 재검증 요청을 전송했습니다.',
  };
}

// ===========================
// 통계 및 모니터링 API
// ===========================

/**
 * 전체 통계 조회
 */
export async function fetchOnboardingStats(): Promise<OnboardingStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getOnboardingStats();
}

/**
 * 활동 피드 조회
 */
export async function fetchActivityFeed(limit: number = 10): Promise<ActivityFeedItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getActivityFeed(limit);
}
