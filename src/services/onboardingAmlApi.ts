/**
 * Onboarding AML API Service
 * 온보딩 AML 관리 시스템 API 서비스
 *
 * Mock 환경: 로컬 데이터 사용
 * 실제 환경: REST API 호출로 교체 가능
 */

import axios from 'axios';
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
  IndividualEDDSubmission,
  CorporateEDDSubmission,
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

import { applyEDDAutoAssignment } from './helpers/eddAutoAssignment';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Mock 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// ===========================
// 백엔드 User 타입 정의
// ===========================
interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberType: 'individual' | 'corporate';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  nationality?: string;
  countryCode?: string;
  idCardImagePath?: string;
  selfieImagePath?: string;
  idCardType?: number;
  personalId?: string;
  residentNumber?: string;
  kycResultType?: number;
  kycReviewData?: any;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  financeCode?: string;
  // 주소 정보
  zipCode?: string;
  addressLine?: string;
  detailAddress?: string;
}

// ===========================
// 매핑 함수
// ===========================

/**
 * Backend User를 IndividualOnboarding으로 변환
 */
function mapUserToIndividualOnboarding(user: BackendUser): IndividualOnboarding {
  // 디버깅: 원본 user 데이터 확인
  console.log('[mapUserToIndividualOnboarding] Backend User:', {
    id: user.id,
    name: user.name,
    email: user.email,
    idCardImagePath: user.idCardImagePath,
    selfieImagePath: user.selfieImagePath,
  });

  return {
    // 실제 데이터
    id: user.id,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    userGender: user.gender,
    userNationality: user.countryCode || user.nationality,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    // Mock/기본값: 등록 경로
    registrationSource: 'ONLINE' as const,
    registrationNote: undefined,

    // Mock/기본값: KYC 정보
    kyc: {
      idType: 'RESIDENT_CARD' as const,
      idNumber: user.personalId || '******-*******',
      idImageUrl: user.idCardImagePath
        ? `${API_URL}/api/users/${user.id}/kyc-image`
        : '',
      addressProofType: 'REGISTRY' as const,
      addressProofUrl: '',
      phoneVerified: true,
      emailVerified: true,
      completedAt: user.createdAt,
      idCardType: user.idCardType,
      // 회원가입 시 등록한 주소
      zipCode: user.zipCode,
      address: user.addressLine,
      detailAddress: user.detailAddress,
    },

    // Mock/기본값: AML (외부 시스템 연동 전)
    aml: null,

    // Mock/기본값: 위험도 평가 (외부 시스템 연동 전)
    riskAssessment: null,

    // Mock/기본값: 추가 절차
    additionalProcedures: null,

    // Mock/기본값: EDD
    edd: null,
    eddRequired: false,

    // Mock/기본값: 관리자 검토
    adminReview: {
      status: user.status === 'active' ? 'APPROVED' :
              user.status === 'inactive' ? 'REJECTED' : 'PENDING',
      currentStep: user.status === 'active' ? 5 : 1,
      reviewedBy: undefined,
      reviewedAt: undefined,
      decision: undefined,
      decisionReason: undefined,
      notes: [],
    },
  };
}

// ===========================
// 개인회원 온보딩 API
// ===========================

/**
 * 개인회원 목록 조회
 * Mock 데이터 + 실제 API 데이터를 합쳐서 반환
 */
export async function fetchIndividualOnboardings(
  query: OnboardingListQuery = {}
): Promise<OnboardingListResponse<IndividualOnboarding>> {
  // 1. Mock 데이터 가져오기
  let mockApplications = getIndividualOnboardings();

  // 2. 실제 API 데이터 가져오기
  let apiApplications: IndividualOnboarding[] = [];
  try {
    const params: any = {
      memberType: 'individual',
      _page: 1,
      _limit: 1000, // 모든 데이터 가져오기
      _sort: 'createdAt',
      _order: 'desc',
    };

    const response = await axios.get<BackendUser[]>(`${API_URL}/api/users`, { params });
    const users = response.data;
    apiApplications = users.map(mapUserToIndividualOnboarding);
  } catch (error) {
    console.error('실제 API 데이터 조회 실패 (Mock 데이터만 사용):', error);
  }

  // 3. Mock 데이터 + API 데이터 합치기 (중복 제거: API 데이터 우선)
  const apiIds = new Set(apiApplications.map(app => app.id));
  const mockOnlyApplications = mockApplications.filter(app => !apiIds.has(app.id));
  let applications = [...apiApplications, ...mockOnlyApplications];

  // 4. 필터링
  if (query.status) {
    applications = applications.filter((app) => app.adminReview.status === query.status);
  }

  if (query.riskLevel) {
    applications = applications.filter(
      (app) => app.riskAssessment?.riskLevel === query.riskLevel
    );
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

  // 5. 페이지네이션
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
 * API 우선, 없으면 Mock 데이터 사용
 */
export async function fetchIndividualOnboardingById(
  id: string
): Promise<IndividualOnboarding> {
  // 1. 실제 API에서 조회 시도
  try {
    const response = await axios.get<BackendUser>(`${API_URL}/api/users/${id}`);
    const user = response.data;

    // memberType 확인
    if (user.memberType !== 'individual') {
      throw new Error(`User ${id} is not an individual member`);
    }

    // 매핑하여 반환
    const mapped = mapUserToIndividualOnboarding(user);
    console.log('[fetchIndividualOnboardingById] Mapped result:', {
      id: mapped.id,
      userId: mapped.userId,
      userName: mapped.userName,
      hasUserId: !!mapped.userId,
    });
    return mapped;
  } catch (error: any) {
    // API 실패 시 Mock 데이터에서 조회
    if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
      const application = getIndividualOnboardingById(id);
      if (application) {
        return application;
      }
    }

    console.error(`개인회원 온보딩 상세 조회 실패 (ID: ${id}):`, error);
    throw new Error(`Individual onboarding application not found: ${id}`);
  }
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
 * 재검증 후 리스크 평가 결과에 따라 EDD 필요 여부 자동 설정
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

  // 리스크 평가가 있으면 EDD 필요 여부 자동 설정
  if (application.riskAssessment) {
    applyEDDAutoAssignment(application);
  }

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
  // 실제 DB에서 법인 대표 계정만 조회
  try {
    const params = new URLSearchParams({
      memberType: 'corporate',
      isOrganizationOwner: 'true',  // 법인 대표 계정만
      _page: String(query.page || 1),
      _limit: String(query.limit || 20),
      _sort: 'createdAt',
      _order: 'desc'
    });

    if (query.status) {
      params.append('status', query.status.toLowerCase());
    }

    const response = await axios.get(`${API_URL}/api/users?${params.toString()}`);
    const users = response.data;
    const totalCount = parseInt(response.headers['x-total-count'] || users.length);

    // Backend User를 CorporateOnboarding으로 변환
    const applications = users.map((user: BackendUser) => mapUserToCorporateOnboarding(user));

    return {
      applications,
      total: totalCount,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  } catch (error) {
    console.error('Failed to fetch corporate users:', error);
    // 에러 시 빈 배열 반환
    return {
      applications: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  }
}

/**
 * Backend User를 CorporateOnboarding으로 변환
 */
function mapUserToCorporateOnboarding(user: BackendUser): CorporateOnboarding {
  return {
    id: user.id,
    userId: user.id,
    companyName: (user as any).organizationName || '법인명 미입력',
    businessNumber: (user as any).businessNumber || '',
    submittedAt: user.createdAt,
    adminReview: {
      status: user.status === 'active' ? 'APPROVED' : user.status === 'pending' ? 'PENDING' : 'REJECTED',
      reviewedBy: null,
      reviewedAt: null,
      comments: null,
    },
    riskAssessment: null,
    eddRequired: false,
    eddStatus: null,
    kycInfo: null,
    corporateInfo: null,
    uboInfo: null,
    contactPerson: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
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
 * 재검증 후 리스크 평가 결과에 따라 EDD 필요 여부 자동 설정
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

  // 리스크 평가가 있으면 EDD 필요 여부 자동 설정
  if (application.riskAssessment) {
    applyEDDAutoAssignment(application);
  }

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

// ===========================
// EDD (Enhanced Due Diligence) API
// ===========================

/**
 * 개인회원 EDD 제출
 */
export async function submitIndividualEDD(
  data: IndividualEDDSubmission
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const application = getIndividualOnboardingById(data.applicationId);
  if (!application) {
    throw new Error(`Individual onboarding application not found: ${data.applicationId}`);
  }

  // EDD 정보 업데이트 (applicationId는 제외)
  const { applicationId, ...eddData } = data;
  application.edd = {
    ...eddData,
  };

  // 상태 자동 전환: ON_HOLD 또는 PENDING → UNDER_REVIEW
  if (application.adminReview.status === 'ON_HOLD' || application.adminReview.status === 'PENDING') {
    application.adminReview.status = 'UNDER_REVIEW';
    // 진행 단계도 업데이트 (EDD 제출 = 단계 4)
    if (application.adminReview.currentStep < 4) {
      application.adminReview.currentStep = 4;
    }
  }

  application.updatedAt = new Date().toISOString();

  // 검토 노트 추가
  const note: ReviewNote = {
    id: `note-${Date.now()}`,
    createdBy: 'current-admin',
    createdAt: new Date().toISOString(),
    content: 'EDD 정보가 제출되었습니다. 검토를 시작합니다.',
    type: 'INFO',
  };
  application.adminReview.notes.push(note);

  return {
    success: true,
    message: 'EDD 정보가 성공적으로 제출되었습니다.',
  };
}

/**
 * 법인회원 EDD 제출
 */
export async function submitCorporateEDD(
  data: CorporateEDDSubmission
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const application = getCorporateOnboardingById(data.applicationId);
  if (!application) {
    throw new Error(`Corporate onboarding application not found: ${data.applicationId}`);
  }

  // EDD 정보 업데이트 (applicationId는 제외)
  const { applicationId, ...eddData } = data;
  application.edd = {
    ...eddData,
  };

  // 상태 자동 전환: ON_HOLD 또는 PENDING → UNDER_REVIEW
  if (application.adminReview.status === 'ON_HOLD' || application.adminReview.status === 'PENDING') {
    application.adminReview.status = 'UNDER_REVIEW';
    // 진행 단계도 업데이트 (EDD 제출 = 단계 4)
    if (application.adminReview.currentStep < 4) {
      application.adminReview.currentStep = 4;
    }
  }

  application.updatedAt = new Date().toISOString();

  // 검토 노트 추가
  const note: ReviewNote = {
    id: `note-${Date.now()}`,
    createdBy: 'current-admin',
    createdAt: new Date().toISOString(),
    content: 'EDD 정보가 제출되었습니다. UBO 상세 정보 및 추가 서류를 검토합니다.',
    type: 'INFO',
  };
  application.adminReview.notes.push(note);

  return {
    success: true,
    message: 'EDD 정보가 성공적으로 제출되었습니다.',
  };
}

/**
 * EDD 상태 조회
 */
export async function getEDDStatus(
  applicationId: string,
  type: 'individual' | 'corporate'
): Promise<{
  eddRequired: boolean;
  eddSubmitted: boolean;
  eddRequestedAt?: string;
  eddSubmittedAt?: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let application;
  if (type === 'individual') {
    application = getIndividualOnboardingById(applicationId);
  } else {
    application = getCorporateOnboardingById(applicationId);
  }

  if (!application) {
    throw new Error(`${type} onboarding application not found: ${applicationId}`);
  }

  return {
    eddRequired: application.eddRequired || false,
    eddSubmitted: !!application.edd?.submittedAt,
    eddRequestedAt: application.edd ? application.createdAt : undefined,
    eddSubmittedAt: application.edd?.submittedAt,
  };
}
